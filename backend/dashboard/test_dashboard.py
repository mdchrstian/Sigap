import datetime as dt

import pytest
from django.core.cache import cache
from django.utils import timezone

from dashboard.services import compute_summary
from reports.models import Category, Report

pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def _clear_cache():
    cache.clear()


@pytest.fixture
def mk(make_user):
    reporter = make_user()

    def _mk(cat="road", age_days=None, **kw):
        r = Report.objects.create(
            reporter=reporter, category=Category.objects.get(slug=cat),
            description="Jalan berlubang besar di depan pasar", latitude=-8.5,
            longitude=115.2, **kw)
        if age_days is not None:
            Report.objects.filter(pk=r.pk).update(
                updated_at=timezone.now() - dt.timedelta(days=age_days))
        return r
    return _mk


def test_hidden_excluded(mk):
    mk(); mk(is_hidden=True); mk(cat="drainage")
    s = compute_summary()
    cats = {c["slug"]: c["count"] for c in s["by_category"]}
    assert s["total"] == 2 and cats["road"] == 1 and cats["drainage"] == 1
    assert len(s["by_category"]) == 6


def test_by_status_zero_filled(mk):
    mk()
    s = compute_summary()
    assert len(s["by_status"]) == 6
    assert sum(x["count"] for x in s["by_status"]) == 1


def test_regency_filter(mk):
    mk(regency="Gianyar"); mk(regency="Badung"); mk()
    s = compute_summary(regency="Gianyar")
    assert s["total"] == 1
    assert {x["regency"] for x in compute_summary()["by_regency"]} >= {"Tidak diketahui"}


def test_from_after_to(api_client):
    res = api_client.get("/api/analytics/summary?from=2026-02-01&to=2026-01-01")
    assert res.status_code == 400
    assert api_client.get("/api/analytics/summary?from=bad").status_code == 400


def test_stale(mk):
    mk(status="in_progress", age_days=20)
    mk(status="completed", age_days=20)
    mk(status="submitted", age_days=2)
    assert compute_summary()["stale_count"] == 1


def test_stale_public_forbidden(api_client):
    assert api_client.get("/api/analytics/stale").status_code in (401, 403)


def test_stale_officer(mk, make_user, auth_client):
    r = mk(status="verified", age_days=30)
    res = auth_client(make_user("officer")).get("/api/analytics/stale")
    assert res.status_code == 200
    row = res.data["results"][0]
    assert row["id"] == r.id and row["days_since_update"] >= 30


def test_limited_data_and_empty(api_client):
    res = api_client.get("/api/analytics/summary")
    assert res.status_code == 200
    d = res.data
    assert d["total"] == 0 and d["limited_data"] is True
    assert len(d["by_status"]) == 6 and d["by_week"] == [] and d["stale_count"] == 0
