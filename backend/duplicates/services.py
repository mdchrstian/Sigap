import logging
import math
from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from ai_services.client import AIUnavailable, embed_text
from reports import geo
from reports.models import MasterReport, Report

from .models import ReportEmbedding

log = logging.getLogger(__name__)


def _cos(a, b):
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(x * x for x in b))
    if not na or not nb:
        return 0.0
    return sum(x * y for x, y in zip(a, b)) / (na * nb)


def find_candidates(lat, lng, category_id, description):
    dist = dict(geo.nearby(lat, lng, settings.DUP_RADIUS_M))
    since = timezone.now() - timedelta(days=settings.DUP_WINDOW_DAYS)
    reports = (Report.objects.filter(id__in=dist, is_hidden=False, created_at__gte=since)
               .exclude(status=Report.Status.REJECTED)
               .select_related("category", "embedding").prefetch_related("images"))
    cands = [(r, dist[r.id]) for r in reports]
    if not cands:
        return {"decision": "low", "candidates": []}
    try:
        qvec = embed_text(description)
    except AIUnavailable:
        qvec = None
    out = []
    for r, d in cands:
        sim = None
        emb = getattr(r, "embedding", None)
        if qvec is not None and emb is not None:
            sim = _cos(qvec, list(emb.vector))
        out.append({"report": r, "distance": d, "similarity": sim})
    out.sort(key=lambda c: (-(c["similarity"] if c["similarity"] is not None else -2),
                            c["distance"]))
    out = out[:settings.DUP_MAX_CANDIDATES]
    best = out[0]
    same = best["report"].category_id == category_id
    sim, d = best["similarity"], best["distance"]
    if (sim is not None and sim >= settings.DUP_HIGH_SIM and same
            and d <= settings.DUP_HIGH_MAX_DIST_M):
        decision = "high"
    elif (sim is not None and sim >= settings.DUP_MEDIUM_SIM) or \
            (sim is None and same and d <= 50):
        decision = "medium"
    else:
        decision = "low"
    return {"decision": decision, "candidates": out}


def visible_target(lat, lng, report_id, radius_m):
    if report_id not in dict(geo.nearby(lat, lng, radius_m)):
        return None
    return (Report.objects.filter(pk=report_id, is_hidden=False)
            .exclude(status=Report.Status.REJECTED).first())


def link_report(new_report, target):
    master = target.master
    if master is None:
        master = MasterReport.objects.create()
        target.master = master
        target.save(update_fields=["master"])
    new_report.master = master
    new_report.save(update_fields=["master"])
    return master


def store_embedding(report):
    try:
        text = f"{report.category.name}. {report.description}"
        vec = embed_text(text, user=report.reporter)
        model = "fake" if settings.AI_PROVIDER == "fake" else settings.OPENAI_EMBEDDING_MODEL
        ReportEmbedding.objects.update_or_create(
            report=report, defaults={"vector": vec, "model": model})
    except Exception:  # noqa: BLE001
        log.exception("store_embedding failed for report %s", report.pk)
