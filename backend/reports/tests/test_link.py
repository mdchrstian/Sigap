from unittest.mock import patch

import pytest

from duplicates.models import ReportEmbedding
from reports.models import Category, Report
from reports.test_reports import jpeg, post

pytestmark = pytest.mark.django_db
GEO = {"address": "Jl X", "regency": "Gianyar"}
DEG = 1 / 111320


@pytest.fixture(autouse=True)
def _geo():
    with patch("reports.services.reverse_geocode", return_value=GEO):
        yield


def data(cat, meters=0, **kw):
    d = {"category_id": cat.id, "description": "Jalan berlubang besar",
         "latitude": -8.5 + meters * DEG, "longitude": 115.2, "images": [jpeg()]}
    d.update(kw)
    return d


@pytest.fixture
def road():
    return Category.objects.get(slug="road")


def test_link_new_master(auth_client, make_user, road):
    c = auth_client(make_user())
    a = post(c, data(road)).json()
    r = post(c, data(road, 10, link_to_report_id=a["id"]))
    assert r.status_code == 201, r.content
    j = r.json()
    assert j["master"]["report_count"] == 2
    assert Report.objects.get(pk=a["id"]).master_id == j["master"]["id"]
    assert Report.objects.get(pk=a["id"]).images.count() == 1


def test_link_existing_master(auth_client, make_user, road):
    c = auth_client(make_user())
    a = post(c, data(road)).json()
    b = post(c, data(road, 10, link_to_report_id=a["id"])).json()
    r = post(c, data(road, 20, link_to_report_id=a["id"])).json()
    assert r["master"]["id"] == b["master"]["id"]
    assert r["master"]["report_count"] == 3


def test_link_far(auth_client, make_user, road):
    c = auth_client(make_user())
    a = post(c, data(road)).json()
    r = post(c, data(road, 1000, link_to_report_id=a["id"]))
    assert r.status_code == 400
    assert "Laporan yang dipilih tidak valid untuk digabungkan." in str(r.json())
    assert Report.objects.count() == 1


def test_create_stores_embedding(auth_client, make_user, road):
    r = post(auth_client(make_user()), data(road)).json()
    assert len(ReportEmbedding.objects.get(report_id=r["id"]).vector) == 1536


def test_embedding_failure_still_201(auth_client, make_user, road):
    with patch("duplicates.services.embed_text", side_effect=RuntimeError("boom")):
        r = post(auth_client(make_user()), data(road))
    assert r.status_code == 201
    assert not ReportEmbedding.objects.exists()
