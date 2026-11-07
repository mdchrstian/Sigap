import pytest
from django.core.management import call_command

from accounts.models import User
from locations.services import is_in_bali
from reports.models import MasterReport, Report

pytestmark = pytest.mark.django_db


def test_seed_basic():
    call_command("seed_demo")
    assert User.objects.filter(email__endswith="@sigap.test").count() == 4
    assert Report.objects.count() == 30
    assert all(r.description.startswith("[DATA UJI]") for r in Report.objects.all())
    assert {r.status for r in Report.objects.all()} == set(Report.Status.values)
    masters = MasterReport.objects.all()
    assert masters.count() == 1 and masters[0].report_count == 3
    assert len({r.regency for r in Report.objects.all()}) == 9
    for r in Report.objects.all():
        assert is_in_bali(r.latitude, r.longitude)
        assert r.images.count() >= 1


def test_idempotent_and_reset():
    other = User.objects.create_user(email="real@example.com", password="x")
    call_command("seed_demo")
    call_command("seed_demo")
    assert Report.objects.count() == 30
    call_command("seed_demo", "--reset")
    assert Report.objects.count() == 30
    assert User.objects.filter(pk=other.pk).exists()


def test_openai_without_key(settings):
    settings.AI_PROVIDER = "openai"
    settings.OPENAI_API_KEY = ""
    call_command("seed_demo")
    assert Report.objects.count() == 30
