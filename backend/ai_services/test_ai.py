import base64
import io
import json
import math
from types import SimpleNamespace
from unittest import mock

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

from ai_services import client
from ai_services.models import AIProcessingLog
from reports.models import Category

URL = "/api/ai/analyze-photo"


def img_file(fmt="JPEG", size=(2000, 1500), name="a.jpg", exif=False):
    im = Image.new("RGB", size, (120, 80, 40))
    buf = io.BytesIO()
    kw = {}
    if exif:
        e = Image.Exif()
        e[271] = "TestMake"
        kw["exif"] = e
    im.save(buf, fmt, **kw)
    return SimpleUploadedFile(name, buf.getvalue(), content_type="image/jpeg")


@pytest.fixture
def user_client(auth_client, make_user):
    Category.objects.get_or_create(slug="road", defaults={"name": "Jalan"})
    return auth_client(make_user())


def mock_openai(content=None, exc=None):
    m = mock.MagicMock()
    if exc:
        m.chat.completions.create.side_effect = exc
    else:
        m.chat.completions.create.return_value = SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content=content))],
            usage=SimpleNamespace(prompt_tokens=5, completion_tokens=7))
    return m


def post(c, **kw):
    return c.post(URL, {"image": img_file(**kw)}, format="multipart")


def test_fake_ok(user_client):
    r = post(user_client)
    assert r.status_code == 200
    assert r.data["category_slug"] == "road"
    assert r.data["requires_review"] is True


def test_unauth(api_client):
    assert post(api_client).status_code == 401


def test_unknown_slug_null(user_client, settings):
    settings.AI_PROVIDER = "openai"
    c = json.dumps({"is_infrastructure": True, "category_slug": "bridge",
                    "description": "x", "observations": []})
    with mock.patch.object(client, "_openai", return_value=mock_openai(c)):
        r = post(user_client)
    assert r.status_code == 200 and r.data["category_slug"] is None


def test_timeout_503(user_client, settings):
    settings.AI_PROVIDER = "openai"
    with mock.patch.object(client, "_openai", return_value=mock_openai(exc=TimeoutError("t"))):
        r = post(user_client)
    assert r.status_code == 503 and r.data["fallback"] == "manual"
    assert AIProcessingLog.objects.get().status == "failed"


def test_invalid_json_503(user_client, settings):
    settings.AI_PROVIDER = "openai"
    with mock.patch.object(client, "_openai", return_value=mock_openai("not json")):
        r = post(user_client)
    assert r.status_code == 503
    assert AIProcessingLog.objects.get().status == "failed"


def test_log_success(user_client):
    post(user_client)
    log = AIProcessingLog.objects.get()
    assert log.kind == "analyze_photo" and log.status == "success"


def test_image_downscaled_no_exif(user_client, settings):
    settings.AI_PROVIDER = "openai"
    c = json.dumps({"is_infrastructure": True, "category_slug": "road",
                    "description": "x", "observations": []})
    m = mock_openai(c)
    with mock.patch.object(client, "_openai", return_value=m):
        post(user_client, exif=True)
    msgs = m.chat.completions.create.call_args.kwargs["messages"]
    url = msgs[1]["content"][1]["image_url"]["url"]
    im = Image.open(io.BytesIO(base64.b64decode(url.split(",", 1)[1])))
    assert max(im.size) <= 1024
    assert len(im.getexif()) == 0


def test_embed_norm(db):
    v = client.embed_text("lubang di jalan raya")
    assert len(v) == 1536
    assert math.isclose(math.sqrt(sum(x * x for x in v)), 1.0, rel_tol=1e-6)


def test_embed_similarity(db):
    def cos(a, b):
        return sum(x * y for x, y in zip(a, b))

    a = client.embed_text("lubang besar di jalan raya")
    b = client.embed_text("jalan raya berlubang besar")
    c = client.embed_text("lampu taman mati total")
    assert cos(a, b) > cos(a, c)


def test_throttle(user_client):
    for _ in range(10):
        assert post(user_client, size=(50, 50)).status_code == 200
    assert post(user_client, size=(50, 50)).status_code == 429


def test_gif_400(user_client):
    assert post(user_client, fmt="GIF", size=(50, 50), name="a.gif").status_code == 400


# ---- nusarouter ----
REQ = SimpleNamespace(method="POST", url="https://x")
import openai  # noqa: E402

GOOD = {"is_infrastructure": True, "category_slug": "road",
        "description": "Lubang", "observations": ["a"]}


@pytest.fixture
def nr(settings):
    settings.AI_PROVIDER = "nusarouter"
    settings.NUSAROUTER_API_KEY = "k"
    settings.NUSAROUTER_BASE_URL = "https://nr.example/v1"
    settings.NUSAROUTER_VISION_MODEL = "vis-m"
    settings.NUSAROUTER_TEXT_MODEL = "txt-m"
    settings.NUSAROUTER_TIMEOUT = 12
    return settings


def seq(*contents):
    m = mock_openai("x")
    m.chat.completions.create.side_effect = [
        SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=c))],
                        usage=None) for c in contents]
    return m


@pytest.mark.django_db
def test_nr_client_args(nr):
    with mock.patch("openai.OpenAI") as o:
        client._nusarouter()
    o.assert_called_once_with(api_key="k", base_url="https://nr.example/v1", timeout=12)


@pytest.mark.django_db
def test_nr_analyze_request_and_fences(nr):
    m = seq("```json\n" + json.dumps(GOOD) + "\n```")
    with mock.patch.object(client, "_nusarouter", return_value=m):
        out = client.analyze_photo(b"img", [{"slug": "road", "name": "Jalan"}])
    assert set(out) == set(GOOD)
    kw = m.chat.completions.create.call_args.kwargs
    assert kw["model"] == "vis-m"
    assert kw["response_format"] == {"type": "json_object"}
    parts = kw["messages"][1]["content"]
    assert any(p["type"] == "image_url" for p in parts)
    assert "JSON valid" in kw["messages"][0]["content"]


@pytest.mark.django_db
def test_nr_extra_keys_ok(nr):
    m = seq(json.dumps({**GOOD, "extra": 1}))
    with mock.patch.object(client, "_nusarouter", return_value=m):
        assert client.analyze_photo(b"i", [])["description"] == "Lubang"


@pytest.mark.django_db
def test_nr_retry_then_ok(nr):
    m = seq("not json", json.dumps(GOOD))
    with mock.patch.object(client, "_nusarouter", return_value=m):
        assert client.analyze_photo(b"i", [])["description"] == "Lubang"
    assert m.chat.completions.create.call_count == 2


@pytest.mark.django_db
def test_nr_wrong_type_retries(nr):
    bad = json.dumps({**GOOD, "observations": "x"})
    m = seq(bad, json.dumps(GOOD))
    with mock.patch.object(client, "_nusarouter", return_value=m):
        client.analyze_photo(b"i", [])
    assert m.chat.completions.create.call_count == 2


def test_nr_invalid_twice_503(user_client, nr):
    m = seq("nope", "nope")
    with mock.patch.object(client, "_nusarouter", return_value=m):
        r = post(user_client)
    assert r.status_code == 503 and r.data["fallback"] == "manual"
    assert m.chat.completions.create.call_count == 2


SCHEMA = {"type": "object", "properties": {"summary": {"type": "string"}},
          "required": ["summary"]}


@pytest.mark.django_db
def test_nr_generate_json_models(nr):
    m = seq('{"summary": "s"}')
    with mock.patch.object(client, "_nusarouter", return_value=m):
        client.generate_json("sys", {"a": 1}, SCHEMA)
    assert m.chat.completions.create.call_args.kwargs["model"] == "txt-m"
    nr.NUSAROUTER_TEXT_MODEL = ""
    m = seq('{"summary": "s"}')
    with mock.patch.object(client, "_nusarouter", return_value=m):
        client.generate_json("sys", {"a": 1}, SCHEMA)
    assert m.chat.completions.create.call_args.kwargs["model"] == "vis-m"


@pytest.mark.django_db
@pytest.mark.parametrize("attr", ["NUSAROUTER_API_KEY", "NUSAROUTER_BASE_URL",
                                  "NUSAROUTER_VISION_MODEL"])
def test_nr_missing_config(nr, attr):
    setattr(nr, attr, "")
    with mock.patch("openai.OpenAI") as o, pytest.raises(client.AIUnavailable):
        client.analyze_photo(b"i", [])
    o.assert_not_called()


@pytest.mark.django_db
@pytest.mark.parametrize("exc", [
    openai.APITimeoutError(request=REQ),
    openai.APIError("boom", request=REQ, body=None),
])
def test_nr_api_errors(nr, exc):
    m = mock_openai(exc=exc)
    with mock.patch.object(client, "_nusarouter", return_value=m), \
            pytest.raises(client.AIUnavailable):
        client.analyze_photo(b"i", [])


@pytest.mark.django_db
def test_nr_embed_no_network(nr):
    with mock.patch.object(client, "_nusarouter") as n, \
            mock.patch.object(client, "_openai") as o:
        v = client.embed_text("lubang jalan")
    assert len(v) == 1536
    n.assert_not_called()
    o.assert_not_called()
