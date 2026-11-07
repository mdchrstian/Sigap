import pytest

from notifications.models import Notification
from reports.models import Category, MasterReport, Report
from tracking.services import change_status

pytestmark = pytest.mark.django_db


def mk(user, **kw):
    return Report.objects.create(
        reporter=user, category=Category.objects.first(),
        description="Jalan berlubang besar di depan pasar", latitude=-8.5,
        longitude=115.2, **kw)


def test_create_no_notification(make_user):
    mk(make_user())
    assert Notification.objects.count() == 0


def test_status_change_notifies(make_user):
    u, o = make_user(), make_user("officer")
    r = mk(u)
    change_status(r, "under_review", "Sedang dicek tim", o)
    n = Notification.objects.get()
    assert n.user == u and n.report == r
    assert n.title == f"Status laporan {r.code} diperbarui"
    assert n.body == "Status kini: Ditinjau. Catatan: Sedang dicek tim"


def test_master_propagation(make_user):
    u1, u2, o = make_user(), make_user(), make_user("officer")
    m = MasterReport.objects.create()
    r1, r2 = mk(u1, master=m), mk(u2, master=m)
    change_status(r1, "under_review", "", o)
    assert Notification.objects.filter(user=u1).count() == 1
    assert Notification.objects.filter(user=u2).count() == 1
    assert r2.id  # propagated


def test_self_change_no_notification(make_user):
    u = make_user("officer")
    change_status(mk(u), "under_review", "", u)
    assert Notification.objects.count() == 0


def test_list_read_and_auth(make_user, auth_client, api_client):
    u, o, other = make_user(), make_user("officer"), make_user()
    r = mk(u)
    change_status(r, "under_review", "", o)
    change_status(mk(other), "under_review", "", o)
    assert api_client.get("/api/notifications").status_code == 401
    c = auth_client(u)
    res = c.get("/api/notifications")
    assert len(res.data["results"]) == 1 and res.data["unread_count"] == 1
    assert res.data["results"][0]["report_id"] == r.id
    assert c.get("/api/notifications/unread-count").data == {"unread_count": 1}
    foreign = Notification.objects.get(user=other)
    assert c.post(f"/api/notifications/{foreign.id}/read").status_code == 404
    assert c.post("/api/notifications/read-all").status_code == 204
    assert c.get("/api/notifications/unread-count").data["unread_count"] == 0
