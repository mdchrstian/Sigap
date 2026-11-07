from unittest.mock import MagicMock, patch

import pytest
import requests
from django.core.cache import cache

from locations import services

NOM = {"display_name": "Jl X, Gianyar", "address": {"county": "Kabupaten Gianyar"}}


@pytest.fixture(autouse=True)
def _clean():
    cache.clear()
    with patch("locations.services.time.sleep"):
        yield
    cache.clear()


def resp(data):
    m = MagicMock()
    m.json.return_value = data
    return m


def test_bbox():
    assert services.is_in_bali(-8.65, 115.22)
    assert not services.is_in_bali(-6.2, 106.8)


@patch("locations.services.requests.get")
def test_regency_county(g):
    g.return_value = resp(NOM)
    assert services.reverse_geocode(-8.5, 115.2)["regency"] == "Gianyar"


@patch("locations.services.requests.get")
def test_regency_city(g):
    g.return_value = resp({"display_name": "a", "address": {"city": "Kota Denpasar"}})
    assert services.reverse_geocode(-8.65, 115.2)["regency"] == "Denpasar"


@patch("locations.services.requests.get")
def test_cache_and_ua(g):
    from django.conf import settings

    g.return_value = resp(NOM)
    services.reverse_geocode(-8.5, 115.2)
    services.reverse_geocode(-8.5, 115.2)
    assert g.call_count == 1
    assert g.call_args.kwargs["headers"]["User-Agent"] == settings.NOMINATIM_USER_AGENT
    assert g.call_args.kwargs["timeout"] == 5


@patch("locations.services.requests.get")
def test_empty(g):
    g.return_value = resp([])
    assert services.search("kuta beach") == []
    g.return_value = resp({})
    assert services.reverse_geocode(-8.5, 115.2) == {"address": "", "regency": ""}


@patch("locations.services.requests.get")
def test_search_endpoint(g, client):
    assert client.get("/api/locations/search?q=ab").status_code == 400
    g.return_value = resp([{"display_name": "Kuta", "lat": "-8.7", "lon": "115.1"}])
    r = client.get("/api/locations/search?q=kuta")
    assert r.status_code == 200 and r.json()[0]["latitude"] == -8.7


@patch("locations.services.requests.get", side_effect=requests.Timeout)
def test_search_timeout(g, client):
    assert client.get("/api/locations/search?q=kuta").status_code == 503


@patch("locations.services.requests.get")
def test_reverse_outside(g, client):
    r = client.get("/api/locations/reverse?lat=-6.2&lng=106.8")
    assert r.status_code == 200 and r.json()["in_bali"] is False
    g.assert_not_called()


@patch("locations.services.requests.get")
def test_reverse_inside(g, client):
    g.return_value = resp(NOM)
    r = client.get("/api/locations/reverse?lat=-8.5&lng=115.2")
    assert r.json() == {"address": "Jl X, Gianyar", "regency": "Gianyar", "in_bali": True}
