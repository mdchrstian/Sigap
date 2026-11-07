from django.db import transaction
from django.utils import timezone

from reports.models import Report

from .models import ReportStatusHistory

S = Report.Status
ALLOWED = {
    S.SUBMITTED: {S.UNDER_REVIEW, S.REJECTED},
    S.UNDER_REVIEW: {S.VERIFIED, S.REJECTED},
    S.VERIFIED: {S.IN_PROGRESS, S.REJECTED},
    S.IN_PROGRESS: {S.COMPLETED, S.REJECTED},
}
MSG_INVALID = "Perubahan status tidak diizinkan."
MSG_NOTE = "Catatan minimal 10 karakter wajib diisi."


class StatusError(Exception):
    pass


def can_transition(frm, to):
    return to in ALLOWED.get(frm, set())


@transaction.atomic
def change_status(report, to_status, note, actor):
    note = (note or "").strip()
    if not can_transition(report.status, to_status):
        raise StatusError(MSG_INVALID)
    if to_status in (S.COMPLETED, S.REJECTED) and len(note) < 10:
        raise StatusError(MSG_NOTE)
    targets = [report]
    if report.master_id:
        others = (Report.objects.select_for_update()
                  .filter(master_id=report.master_id).exclude(pk=report.pk).order_by("id"))
        targets += [r for r in others if can_transition(r.status, to_status)]
    now = timezone.now()
    for r in targets:
        old = r.status
        r.status = to_status
        r.updated_at = now
        r.save(update_fields=["status", "updated_at"])
        ReportStatusHistory.objects.create(report=r, from_status=old, to_status=to_status,
                                           note=note, changed_by=actor)
    return targets
