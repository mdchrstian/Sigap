import datetime as dt

from django.db.models import Count
from django.db.models.functions import TruncWeek
from django.utils import timezone

from reports.models import Category, Report

STALE_STATUSES = ["submitted", "under_review", "verified", "in_progress"]
STALE_DAYS = 14


def _day_start(d):
    return timezone.make_aware(dt.datetime.combine(d, dt.time.min))


def base_qs(date_from=None, date_to=None, regency=None):
    qs = Report.objects.filter(is_hidden=False)
    if date_from:
        qs = qs.filter(created_at__gte=_day_start(date_from))
    if date_to:
        qs = qs.filter(created_at__lt=_day_start(date_to + dt.timedelta(days=1)))
    if regency:
        qs = qs.filter(regency__iexact=regency)
    return qs


def stale_qs(qs=None):
    qs = Report.objects.filter(is_hidden=False) if qs is None else qs
    cutoff = timezone.now() - dt.timedelta(days=STALE_DAYS)
    return qs.filter(status__in=STALE_STATUSES, updated_at__lt=cutoff)


def compute_summary(date_from=None, date_to=None, regency=None) -> dict:
    qs = base_qs(date_from, date_to, regency)
    total = qs.count()

    sc = dict(qs.order_by().values_list("status").annotate(n=Count("id")))
    by_status = [{"status": v, "label": l, "count": sc.get(v, 0)}
                 for v, l in Report.Status.choices]

    cc = dict(qs.order_by().values_list("category_id").annotate(n=Count("id")))
    by_category = [{"slug": c.slug, "name": c.name, "count": cc.get(c.id, 0)}
                   for c in Category.objects.filter(is_active=True).order_by("id")]

    by_regency = [{"regency": r or "Tidak diketahui", "count": n}
                  for r, n in qs.order_by().values_list("regency")
                  .annotate(n=Count("id")).order_by("-n", "regency")]

    by_week = [{"week_start": w.date().isoformat() if hasattr(w, "date") else w.isoformat(),
                "count": n}
               for w, n in qs.order_by().annotate(w=TruncWeek("created_at"))
               .values_list("w").annotate(n=Count("id")).order_by("w")]

    return {
        "total": total,
        "by_status": by_status,
        "by_category": by_category,
        "by_regency": by_regency,
        "by_week": by_week,
        "stale_count": stale_qs(qs).count(),
        "period": {"from": date_from.isoformat() if date_from else None,
                   "to": date_to.isoformat() if date_to else None},
        "limited_data": total < 20,
    }
