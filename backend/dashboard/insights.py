import datetime as dt
import json
import re

from .services import compute_summary

FALLBACK = "Ringkasan AI tidak dapat diverifikasi terhadap data."

SYSTEM = (
    "Kamu adalah asisten yang meringkas statistik laporan infrastruktur publik untuk petugas. "
    "Jawab dalam Bahasa Indonesia. Aturan: gunakan hanya angka yang ada di payload; jangan "
    "mengarang tren, penyebab, atau prioritas; jika limited_data bernilai true, sebutkan bahwa "
    "data masih terbatas; jangan memberi rekomendasi prioritas perbaikan. Ringkasan maksimal "
    "600 karakter dan maksimal 5 poin sorotan."
)

SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
        "highlights": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["summary", "highlights"],
    "additionalProperties": False,
}


def previous_period(date_from, date_to, regency):
    if not (date_from and date_to):
        return None
    days = (date_to - date_from).days + 1
    pt = date_from - dt.timedelta(days=1)
    pf = pt - dt.timedelta(days=days - 1)
    s = compute_summary(pf, pt, regency)
    return {"total": s["total"], "period": s["period"]}


def build_payload(date_from, date_to, regency):
    stats = compute_summary(date_from, date_to, regency)
    payload = dict(stats)
    payload["previous_period"] = previous_period(date_from, date_to, regency)
    return stats, payload


def _nums(text):
    return set(re.findall(r"\d+", text))


def verify(result, payload):
    allowed = _nums(json.dumps(payload, ensure_ascii=False))
    verified = True
    summary = str(result.get("summary", ""))[:600]
    if not _nums(summary) <= allowed:
        summary, verified = FALLBACK, False
    highlights = []
    for h in list(result.get("highlights", []))[:5]:
        h = str(h)
        if _nums(h) <= allowed:
            highlights.append(h)
        else:
            verified = False
    return summary, highlights, verified
