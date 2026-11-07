from datetime import timedelta
from unittest.mock import patch

import pytest
from django.utils import timezone

from ai_services.client import AIUnavailable
from duplicates import services
from duplicates.models import ReportEmbedding
from reports.models import Category, Report

pytestmark = pytest.mark.django_db
LAT, LNG = -8.5, 115.2
DEG = 1 / 111320  # ~1 m of latitude
DESC = "Jalan berlubang besar di depan pasar membahayakan pengendara motor"


@pytest.fixture
def road():
    return Category.objects.get(slug="road")


@pytest.fixture
def other():
    return Category.objects.exclude(slug="road").first()


@pytest.fixture
def user(make_user):
    return make_user()


def mk(user, cat, meters=0, desc=DESC, embed=True, **kw):
    r = Report.objects.create(reporter=user, category=cat, description=desc,
                              latitude=LAT + meters * DEG, longitude=LNG, **kw)
    if embed:
        services.store_embedding(r)
    return r


def find(cat, desc=DESC):
    return services.find_candidates(LAT, LNG, cat.id, desc)


def test_high(user, road):
    mk(user, road, 20)
    res = find(road)
    assert res["decision"] == "high"
    assert len(res["candidates"]) == 1


def test_far_low(user, road):
    mk(user, road, 300)
    res = find(road)
    assert res == {"decision": "low", "candidates": []}


def test_medium_other_category(user, road, other):
    mk(user, other, 40)
    assert find(road)["decision"] == "medium"


def test_excluded(user, road):
    old = mk(user, road, 10)
    Report.objects.filter(pk=old.pk).update(created_at=timezone.now() - timedelta(days=91))
    mk(user, road, 10, status="rejected")
    mk(user, road, 10, is_hidden=True)
    assert find(road) == {"decision": "low", "candidates": []}


def test_ai_unavailable(user, road):
    mk(user, road, 30)
    with patch("duplicates.services.embed_text", side_effect=AIUnavailable("x")):
        res = find(road)
    assert res["decision"] == "medium"
    assert res["candidates"][0]["similarity"] is None


def test_check_requires_auth(api_client):
    r = api_client.post("/api/duplicates/check", {}, format="json")
    assert r.status_code == 401


def test_check_endpoint(auth_client, user, road):
    mk(user, road, 20)
    r = auth_client(user).post("/api/duplicates/check", {
        "latitude": LAT, "longitude": LNG, "category_id": road.id, "description": DESC},
        format="json")
    assert r.status_code == 200
    j = r.json()
    assert j["decision"] == "high"
    c = j["candidates"][0]
    assert c["distance_m"] == 20 and c["code"].startswith("SGP-")


def test_embedding_row(user, road):
    r = mk(user, road)
    assert len(ReportEmbedding.objects.get(report=r).vector) == 1536
