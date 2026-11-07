import pytest
from django.core.cache import cache

from ai_services.client import AIUnavailable
from reports.models import Category, Report

pytestmark = pytest.mark.django_db
URL = "/api/analytics/insights"


@pytest.fixture(autouse=True)
def _clear_cache():
    cache.clear()


@pytest.fixture
def officer(make_user, auth_client):
    return auth_client(make_user("officer"))


def _mock(mp, result=None, exc=None):
    calls = []

    def fake(system, payload, schema, user=None):
        calls.append(payload)
        if exc:
            raise exc
        return result
    mp.setattr("ai_services.client.generate_json", fake)
    return calls


def test_officer_fake_provider(officer, settings):
    settings.AI_PROVIDER = "fake"
    res = officer.post(URL, {}, format="json")
    assert res.status_code == 200
    assert {"summary", "highlights", "based_on", "generated_at"} <= set(res.data)
    assert res.data["based_on"]["total"] == 0


def test_public_forbidden(auth_client, make_user):
    assert auth_client(make_user()).post(URL, {}, format="json").status_code == 403


def test_bad_number_summary(officer, monkeypatch):
    _mock(monkeypatch, {"summary": "Ada 999 laporan.", "highlights": []})
    res = officer.post(URL, {}, format="json")
    assert res.data["verified"] is False
    assert res.data["summary"] == "Ringkasan AI tidak dapat diverifikasi terhadap data."


def test_bad_highlight_dropped(officer, monkeypatch):
    _mock(monkeypatch, {"summary": "Total 0 laporan.", "highlights": ["Ada 999 jalan", "Total 0"]})
    res = officer.post(URL, {}, format="json")
    assert res.data["highlights"] == ["Total 0"]
    assert res.data["verified"] is False


def test_payload_aggregates_only(officer, make_user, monkeypatch):
    u = make_user(email="secret@example.com")
    Report.objects.create(reporter=u, category=Category.objects.get(slug="road"),
                          description="Jalan berlubang besar di depan pasar",
                          latitude=-8.5, longitude=115.2)
    calls = _mock(monkeypatch, {"summary": "ok", "highlights": []})
    officer.post(URL, {"from": "2026-01-01", "to": "2026-12-31"}, format="json")
    dump = str(calls[0])
    assert "secret@example.com" not in dump and "berlubang" not in dump
    assert "previous_period" in calls[0]


def test_unavailable(officer, monkeypatch):
    _mock(monkeypatch, exc=AIUnavailable("x"))
    res = officer.post(URL, {}, format="json")
    assert res.status_code == 503
    assert res.data["detail"] == "Ringkasan AI tidak tersedia saat ini."


def test_cached(officer, monkeypatch):
    calls = _mock(monkeypatch, {"summary": "ok", "highlights": []})
    officer.post(URL, {}, format="json")
    officer.post(URL, {}, format="json")
    assert len(calls) == 1
