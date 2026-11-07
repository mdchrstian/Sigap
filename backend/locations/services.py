import hashlib
import time

import requests
from django.conf import settings
from django.core.cache import cache

BALI_BBOX = (-8.95, -8.04, 114.40, 115.72)  # lat_min, lat_max, lng_min, lng_max
REGENCIES = ["Badung", "Bangli", "Buleleng", "Denpasar", "Gianyar", "Jembrana",
             "Karangasem", "Klungkung", "Tabanan"]
CACHE_TTL = 24 * 3600
_LAST_KEY = "nominatim:last_request_ts"


class GeocodingError(Exception):
    pass


def is_in_bali(lat, lng) -> bool:
    return (BALI_BBOX[0] <= lat <= BALI_BBOX[1]) and (BALI_BBOX[2] <= lng <= BALI_BBOX[3])


def _get(path, params):
    last = cache.get(_LAST_KEY)
    if last is not None:
        wait = 1.0 - (time.time() - last)
        if wait > 0:
            time.sleep(wait)
    cache.set(_LAST_KEY, time.time(), 60)
    try:
        resp = requests.get(
            settings.NOMINATIM_URL.rstrip("/") + path,
            params=params,
            headers={"User-Agent": settings.NOMINATIM_USER_AGENT},
            timeout=5,
        )
        resp.raise_for_status()
        return resp.json()
    except (requests.RequestException, ValueError) as e:
        raise GeocodingError(str(e)) from e


def _regency(addr):
    for key in ("county", "city", "state_district"):
        val = (addr.get(key) or "").lower()
        for r in REGENCIES:
            if r.lower() in val:
                return r
    return ""


def reverse_geocode(lat, lng):
    key = f"geo:rev:{round(lat, 5)}:{round(lng, 5)}"
    hit = cache.get(key)
    if hit is not None:
        return hit
    data = _get("/reverse", {"format": "jsonv2", "lat": lat, "lon": lng,
                             "addressdetails": 1, "accept-language": "id"})
    if not isinstance(data, dict):
        data = {}
    result = {"address": data.get("display_name", "") or "",
              "regency": _regency(data.get("address") or {})}
    cache.set(key, result, CACHE_TTL)
    return result


def search(q):
    key = "geo:search:" + hashlib.sha1(q.strip().lower().encode()).hexdigest()
    hit = cache.get(key)
    if hit is not None:
        return hit
    data = _get("/search", {"format": "jsonv2", "q": q, "limit": 5, "countrycodes": "id",
                            "viewbox": "114.40,-8.04,115.72,-8.95", "bounded": 1,
                            "accept-language": "id"})
    result = [{"label": d.get("display_name", ""), "latitude": float(d["lat"]),
               "longitude": float(d["lon"])} for d in (data or [])[:5]]
    cache.set(key, result, CACHE_TTL)
    return result
