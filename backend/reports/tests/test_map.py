import pytest

from reports.models import Category, Report

pytestmark = pytest.mark.django_db
DPS = "115.1,-8.8,115.3,-8.6"


@pytest.fixture
def mk(make_user):
    u = make_user()

    def _mk(lat=-8.65, lng=115.2, **kw):
        kw.setdefault("category", Category.objects.get(slug="road"))
        return Report.objects.create(reporter=u, description="secret desc",
                                     latitude=lat, longitude=lng, **kw)
    return _mk


def get(c, **q):
    return c.get("/api/reports/map", q)


def test_bbox_and_shape(api_client, mk):
    inside = mk()
    mk(lat=-8.2, lng=115.5)
    r = get(api_client, bbox=DPS)
    assert r.status_code == 200
    d = r.json()
    assert d["type"] == "FeatureCollection" and d["truncated"] is False
    assert [f["properties"]["id"] for f in d["features"]] == [inside.id]
    f = d["features"][0]
    assert f["geometry"] == {"type": "Point", "coordinates": [115.2, -8.65]}
    assert f["properties"]["master_count"] == 1


def test_hidden_excluded(api_client, mk):
    mk(is_hidden=True)
    assert get(api_client, bbox=DPS).json()["features"] == []


def test_status_filter(api_client, mk):
    mk()
    c = mk(status="completed")
    fs = get(api_client, bbox=DPS, status="completed").json()["features"]
    assert [f["properties"]["id"] for f in fs] == [c.id]


def test_bad_bbox(api_client):
    assert get(api_client).status_code == 400
    assert get(api_client, bbox="112,-9,117,-7").status_code == 400


def test_no_private_data(api_client, mk):
    mk()
    res = get(api_client, bbox=DPS)
    assert "secret desc" not in res.content.decode()
    keys = set(res.json()["features"][0]["properties"])
    assert keys == {"id", "code", "category_slug", "category_name", "status", "status_label",
                    "created_at", "master_count"}
