import io

import pytest
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

from community.models import ReportComment
from reports.models import Category, Report

pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def _clear():
    cache.clear()


@pytest.fixture
def report(make_user):
    return Report.objects.create(reporter=make_user(), category=Category.objects.get(slug="road"),
                                 description="x" * 20, latitude=-8.5, longitude=115.2)


def url(r):
    return f"/api/reports/{r.id}/comments"


def jpg():
    img = Image.new("RGB", (100, 100), "red")
    ex = Image.Exif()
    ex[0x010F] = "Cam"
    b = io.BytesIO()
    img.save(b, "JPEG", exif=ex)
    return SimpleUploadedFile("a.jpg", b.getvalue(), content_type="image/jpeg")


def post(c, r, body="komentar bagus", **kw):
    return c.post(url(r), {"body": body, **kw}, format="multipart")


def test_user_warga(auth_client, make_user, report):
    r = post(auth_client(make_user()), report)
    assert r.status_code == 201 and r.json()["author_label"] == "Warga"


def test_reporter(auth_client, report):
    assert post(auth_client(report.reporter), report).json()["author_label"] == "Pelapor"


def test_officer(auth_client, make_user, report):
    assert post(auth_client(make_user("officer")), report).json()["author_label"] == "Petugas"


def test_anon_get_no_identity(auth_client, api_client, make_user, report):
    u = make_user(email="secret@example.com")
    post(auth_client(u), report)
    api_client.credentials()
    r = api_client.get(url(report))
    assert r.status_code == 200
    assert "secret" not in r.content.decode() and "email" not in r.content.decode()
    assert r.json()["results"][0]["is_mine"] is False


def test_unauth(api_client, report):
    assert post(api_client, report).status_code == 401


def test_short(auth_client, make_user, report):
    assert post(auth_client(make_user()), report, "ok").status_code == 400


def test_image(auth_client, make_user, report):
    r = post(auth_client(make_user()), report, image=jpg())
    assert r.status_code == 201 and r.json()["image_url"]
    c = ReportComment.objects.get()
    assert not Image.open(c.image).getexif()


def test_delete_other(auth_client, make_user, report):
    cid = post(auth_client(make_user()), report).json()["id"]
    c = auth_client(make_user())
    assert c.delete(f"/api/comments/{cid}").status_code == 403


def test_delete_author(auth_client, make_user, report):
    c = auth_client(make_user())
    cid = post(c, report).json()["id"]
    assert c.delete(f"/api/comments/{cid}").status_code == 204
    assert c.get(url(report)).json()["results"] == []


def test_throttle(auth_client, make_user, report):
    c = auth_client(make_user())
    for _ in range(20):
        assert post(c, report).status_code == 201
    assert post(c, report).status_code == 429


def test_hidden_report(auth_client, make_user, report):
    report.is_hidden = True
    report.save()
    assert post(auth_client(make_user()), report).status_code == 404
