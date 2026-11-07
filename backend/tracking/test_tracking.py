import pytest

from reports.models import Category, MasterReport, Report
from tracking.models import ReportStatusHistory

pytestmark = pytest.mark.django_db
LONG = "Bukti penanganan sudah diverifikasi di lapangan"


@pytest.fixture
def mk(make_user):
    reporter = make_user()

    def _mk(**kw):
        return Report.objects.create(
            reporter=reporter, category=Category.objects.first(),
            description="Jalan berlubang besar di depan pasar", latitude=-8.5,
            longitude=115.2, **kw)
    return _mk


def post(c, r, status, note=""):
    return c.post(f"/api/officer/reports/{r.id}/status", {"status": status, "note": note},
                  format="json")


def test_create_history(mk):
    r = mk()
    h = list(r.history.all())
    assert len(h) == 1 and h[0].to_status == "submitted" and h[0].from_status is None


def test_officer_review(mk, make_user, auth_client):
    r = mk()
    o = make_user("officer")
    res = post(auth_client(o), r, "under_review")
    assert res.status_code == 200 and res.data["updated"] == [r.id]
    assert r.history.last().changed_by == o


def test_invalid_transition(mk, make_user, auth_client):
    res = post(auth_client(make_user("officer")), mk(), "completed", LONG)
    assert res.status_code == 400
    assert res.data["detail"] == "Perubahan status tidak diizinkan."


def test_completed_needs_note(mk, make_user, auth_client):
    r = mk(status="in_progress")
    c = auth_client(make_user("officer"))
    assert post(c, r, "completed", "ok").status_code == 400
    assert post(c, r, "completed", LONG).status_code == 200


def test_public_forbidden(mk, make_user, auth_client):
    r = mk()
    assert post(auth_client(make_user()), r, "under_review").status_code == 403


def test_master_propagation(mk, make_user, auth_client):
    m = MasterReport.objects.create()
    a, b, c3 = mk(master=m), mk(master=m), mk(master=m, status="rejected")
    res = post(auth_client(make_user("officer")), a, "under_review")
    assert sorted(res.data["updated"]) == sorted([a.id, b.id])
    c3.refresh_from_db()
    assert c3.status == "rejected"
    assert c3.history.count() == 1


def test_officer_list(mk, make_user, auth_client):
    mk()
    mk(status="verified", is_hidden=True)
    c = auth_client(make_user("officer"))
    res = c.get("/api/officer/reports?status=submitted")
    assert res.status_code == 200 and res.data["count"] == 1
    assert res.data["results"][0]["reporter_name"] is not None
    res = c.get("/api/officer/reports?status=verified")
    assert res.data["results"][0]["is_hidden"] is True


def test_officer_list_public_forbidden(make_user, auth_client):
    assert auth_client(make_user()).get("/api/officer/reports").status_code == 403


def test_history_visibility(mk, make_user, api_client, auth_client):
    r = mk()
    post(auth_client(make_user("officer")), r, "under_review")
    api_client.credentials()
    h = api_client.get(f"/api/reports/{r.id}").data["history"]
    assert len(h) == 2 and "actor_name" not in h[1]
    assert h[1]["actor_role_label"] == "Petugas" and h[0]["actor_role_label"] == "Pelapor"
    h = auth_client(make_user("officer")).get(f"/api/reports/{r.id}").data["history"]
    assert "actor_name" in h[1]


def test_final_status(mk, make_user, auth_client):
    r = mk(status="completed")
    assert post(auth_client(make_user("officer")), r, "in_progress").status_code == 400
    assert ReportStatusHistory.objects.filter(report=r).count() == 1
