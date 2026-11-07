import io
import json
from unittest.mock import patch

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

from reports import geo
from reports.models import Report, ReportImage

pytestmark = pytest.mark.django_db
GEO = {"address": "Jl X", "regency": "Gianyar"}


def jpeg(size=(2400, 1200), exif=True, fmt="JPEG", name="a.jpg"):
    img = Image.new("RGB", size, "red")
    buf = io.BytesIO()
    kw = {}
    if exif and fmt == "JPEG":
        ex = Image.Exif()
        ex[0x010F] = "TestCam"
        kw["exif"] = ex
    img.save(buf, fmt, **kw)
    return SimpleUploadedFile(name, buf.getvalue(), content_type="image/jpeg")


def payload(n=1, **kw):
    d = {"category_id": 1, "description": "Jalan berlubang besar", "latitude": -8.5,
         "longitude": 115.2, "images": [jpeg() for _ in range(n)]}
    d.update(kw)
    return d


@pytest.fixture
def cat(db):
    from reports.models import Category
    return Category.objects.get(slug="road")


@pytest.fixture(autouse=True)
def _geo():
    with patch("reports.services.reverse_geocode", return_value=GEO) as m:
        yield m


def post(client, data):
    return client.post("/api/reports", data, format="multipart")


def test_categories(api_client):
    r = api_client.get("/api/categories")
    assert len(r.json()) == 6


def test_create_valid(auth_client, make_user, cat):
    c = auth_client(make_user())
    r = post(c, payload(category_id=cat.id))
    assert r.status_code == 201, r.content
    j = r.json()
    assert j["status"] == "submitted" and j["code"] == f"SGP-{j['id']:06d}"
    assert j["regency"] == "Gianyar" and j["is_mine"] is True


def test_exif_stripped(auth_client, make_user, cat):
    c = auth_client(make_user())
    assert post(c, payload(category_id=cat.id)).status_code == 201
    img = Image.open(ReportImage.objects.get().image)
    assert len(img.getexif()) == 0
    assert max(img.size) <= 1600


def test_unauth(api_client, cat):
    assert post(api_client, payload(category_id=cat.id)).status_code == 401


def test_jakarta(auth_client, make_user, cat):
    r = post(auth_client(make_user()), payload(category_id=cat.id, latitude=-6.2, longitude=106.8))
    assert r.status_code == 400
    assert "Lokasi harus berada di Provinsi Bali." in json.dumps(r.json())


@pytest.mark.parametrize("n", [0, 4])
def test_bad_image_count(auth_client, make_user, cat, n):
    r = post(auth_client(make_user()), payload(n, category_id=cat.id))
    assert r.status_code == 400


def test_gif(auth_client, make_user, cat):
    gif = jpeg(fmt="GIF", name="a.gif", exif=False)
    r = post(auth_client(make_user()), payload(category_id=cat.id, images=[gif]))
    assert r.status_code == 400


def test_short_desc_and_bad_json(auth_client, make_user, cat):
    c = auth_client(make_user())
    assert post(c, payload(category_id=cat.id, description="123456789")).status_code == 400
    assert post(c, payload(category_id=cat.id, ai_observations="{nope")).status_code == 400


def make_report(user, cat, lat=-8.5, lng=115.2, **kw):
    return Report.objects.create(reporter=user, category=cat, description="x" * 12,
                                 latitude=lat, longitude=lng, **kw)


def test_detail_anon_and_officer(api_client, auth_client, make_user, cat):
    owner = make_user()
    r = make_report(owner, cat)
    j = api_client.get(f"/api/reports/{r.id}").json()
    assert "reporter" not in j and j["is_mine"] is False
    api_client.credentials()
    j = auth_client(make_user("officer")).get(f"/api/reports/{r.id}").json()
    assert j["reporter"]["email"] == owner.email


def test_hidden(api_client, auth_client, make_user, cat):
    owner = make_user()
    r = make_report(owner, cat, is_hidden=True)
    assert api_client.get(f"/api/reports/{r.id}").status_code == 404
    assert auth_client(owner).get(f"/api/reports/{r.id}").status_code == 200


def test_mine(auth_client, make_user, cat):
    me, other = make_user(), make_user()
    make_report(me, cat)
    make_report(me, cat)
    make_report(other, cat)
    j = auth_client(me).get("/api/reports/mine").json()
    assert j["count"] == 2 and len(j["results"]) == 2


def test_nearby(make_user, cat):
    u = make_user()
    a = make_report(u, cat, -8.5, 115.2)
    make_report(u, cat, -8.5 + 0.0045, 115.2)  # ~500 m
    b = make_report(u, cat, -8.5 + 0.00027, 115.2)  # ~30 m
    res = geo.nearby(-8.5, 115.2, 100)
    ids = [i for i, _ in res]
    assert ids == [a.id, b.id]
    assert res[1][1] == pytest.approx(30, abs=3)


def test_geocode_failure(_geo, auth_client, make_user, cat):
    _geo.side_effect = RuntimeError("down")
    r = post(auth_client(make_user()), payload(category_id=cat.id))
    assert r.status_code == 201 and r.json()["regency"] == ""
