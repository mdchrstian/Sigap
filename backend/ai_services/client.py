import base64
import hashlib
import json
import math
import re
import time

from django.conf import settings

from .models import AIProcessingLog

DIMS = 1536
TIMEOUT = 30

SYSTEM_PROMPT = (
    "Kamu adalah asisten yang membantu warga menyusun draf laporan masalah infrastruktur "
    "publik. Jawab dalam Bahasa Indonesia. Aturan: deskripsikan hanya apa yang terlihat "
    "pada foto; jangan menilai tingkat keparahan teknis atau urgensi; jangan mengidentifikasi "
    "orang maupun nomor plat kendaraan; pilih kategori hanya dari daftar yang diberikan, "
    "atau null jika tidak ada yang cocok; set is_infrastructure=false jika tidak ada "
    "masalah infrastruktur publik pada foto."
)

ANALYZE_SCHEMA = {
    "type": "object",
    "properties": {
        "is_infrastructure": {"type": "boolean"},
        "category_slug": {"type": ["string", "null"]},
        "description": {"type": "string"},
        "observations": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["is_infrastructure", "category_slug", "description", "observations"],
    "additionalProperties": False,
}


class AIUnavailable(Exception):
    pass


def _log(kind, model, status, started, user=None, error="", usage=None):
    AIProcessingLog.objects.create(
        user=user, kind=kind, model=model, status=status,
        latency_ms=int((time.monotonic() - started) * 1000), error=str(error)[:2000],
        prompt_tokens=getattr(usage, "prompt_tokens", None),
        completion_tokens=getattr(usage, "completion_tokens", None),
    )


def _openai():
    from openai import OpenAI
    return OpenAI(api_key=settings.OPENAI_API_KEY, timeout=TIMEOUT)


def _run(kind, model, fn, user=None):
    """Run fn() -> (result, usage); log; wrap errors as AIUnavailable."""
    started = time.monotonic()
    try:
        result, usage = fn()
    except Exception as e:  # noqa: BLE001
        _log(kind, model, "failed", started, user, error=f"{type(e).__name__}: {e}")
        raise AIUnavailable(str(e)) from e
    _log(kind, model, "success", started, user, usage=usage)
    return result


def _json_chat(model, messages, schema, name):
    resp = _openai().chat.completions.create(
        model=model, messages=messages,
        response_format={"type": "json_schema",
                         "json_schema": {"name": name, "strict": True, "schema": schema}},
    )
    return json.loads(resp.choices[0].message.content), getattr(resp, "usage", None)


def analyze_photo(image_bytes, categories, user=None):
    fake = settings.AI_PROVIDER == "fake"
    model = "fake" if fake else settings.OPENAI_VISION_MODEL

    def call():
        if fake:
            return {
                "is_infrastructure": True, "category_slug": "road",
                "description": "[Uji AI] Terlihat lubang pada permukaan jalan.",
                "observations": ["Lubang pada aspal"],
            }, None
        b64 = base64.b64encode(image_bytes).decode()
        cats = "\n".join(f"- {c['slug']}: {c['name']}" for c in categories)
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": [
                {"type": "text", "text": f"Daftar kategori:\n{cats}"},
                {"type": "image_url",
                 "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
            ]},
        ]
        data, usage = _json_chat(model, messages, ANALYZE_SCHEMA, "photo_analysis")
        if not isinstance(data, dict) or "description" not in data:
            raise ValueError("invalid AI response")
        return data, usage

    return _run("analyze_photo", model, call, user)


def _hash_embed(text):
    vec = [0.0] * DIMS
    for w in re.findall(r"\w+", text.lower()):
        h = int(hashlib.md5(w.encode()).hexdigest(), 16)
        vec[h % DIMS] += 1.0 if (h >> 64) & 1 else -1.0
    norm = math.sqrt(sum(v * v for v in vec))
    if norm == 0:
        vec[0], norm = 1.0, 1.0
    return [v / norm for v in vec]


def embed_text(text, user=None):
    fake = settings.AI_PROVIDER == "fake"
    model = "fake" if fake else settings.OPENAI_EMBEDDING_MODEL

    def call():
        if fake:
            return _hash_embed(text), None
        resp = _openai().embeddings.create(model=model, input=text)
        return list(resp.data[0].embedding), getattr(resp, "usage", None)

    return _run("embedding", model, call, user)


def generate_json(system, payload, schema, user=None):
    fake = settings.AI_PROVIDER == "fake"
    model = "fake" if fake else settings.OPENAI_TEXT_MODEL

    def call():
        if fake:
            return {"summary": "[Uji AI] Ringkasan tidak tersedia.", "highlights": []}, None
        messages = [{"role": "system", "content": system},
                    {"role": "user", "content": json.dumps(payload, ensure_ascii=False)}]
        return _json_chat(model, messages, schema, "result")

    return _run("insights", model, call, user)
