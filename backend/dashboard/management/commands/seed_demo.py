import io
import os
from unittest import mock

from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management.base import BaseCommand
from django.db import transaction
from PIL import Image, ImageDraw

from accounts.models import User
from community.models import ReportComment
from duplicates.services import link_report, store_embedding
from reports.models import Category, MasterReport, Report
from reports.services import create_report
from tracking.services import change_status

DOMAIN = "@sigap.test"
PREFIX = "[DATA UJI]"
S = Report.Status

# (regency, lat, lng, address)
PLACES = [
    ("Denpasar", -8.6705, 115.2126, "Jl. Sudirman, Denpasar"),
    ("Badung", -8.6478, 115.1385, "Jl. Raya Kuta, Badung"),
    ("Gianyar", -8.5069, 115.2625, "Jl. Raya Ubud, Gianyar"),
    ("Tabanan", -8.5372, 115.1250, "Jl. Gajah Mada, Tabanan"),
    ("Buleleng", -8.1120, 115.0880, "Jl. Ahmad Yani, Singaraja"),
    ("Klungkung", -8.5270, 115.4040, "Jl. Untung Surapati, Semarapura"),
    ("Karangasem", -8.4540, 115.6130, "Jl. Ngurah Rai, Amlapura"),
    ("Bangli", -8.4540, 115.3550, "Jl. Merdeka, Bangli"),
    ("Jembrana", -8.3600, 114.6370, "Jl. Ngurah Rai, Negara"),
]
COLORS = [(200, 80, 60), (60, 140, 200), (80, 170, 100), (220, 170, 50), (140, 90, 180)]

# status plan for non-master reports (index -> transitions)
PLAN = {
    3: [S.UNDER_REVIEW],
    4: [S.UNDER_REVIEW],
    5: [S.UNDER_REVIEW, S.VERIFIED],
    6: [S.UNDER_REVIEW, S.VERIFIED],
    7: [S.UNDER_REVIEW, S.VERIFIED, S.IN_PROGRESS],
    8: [S.UNDER_REVIEW, S.VERIFIED, S.IN_PROGRESS],
    9: [S.UNDER_REVIEW, S.VERIFIED, S.IN_PROGRESS, S.COMPLETED],
    10: [S.UNDER_REVIEW, S.VERIFIED, S.IN_PROGRESS, S.COMPLETED],
    11: [S.REJECTED],
    12: [S.UNDER_REVIEW, S.REJECTED],
}


def make_image(i):
    img = Image.new("RGB", (800, 600), COLORS[i % len(COLORS)])
    ImageDraw.Draw(img).text((360, 290), "DATA UJI", fill=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=85)
    return SimpleUploadedFile(f"demo{i}.jpg", buf.getvalue(), content_type="image/jpeg")


class Command(BaseCommand):
    help = "Isi database dengan data uji untuk demo (semua berlabel [DATA UJI])."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true",
                            help="Hapus pengguna @sigap.test beserta datanya, lalu isi ulang.")

    def handle(self, *args, **opts):
        if opts["reset"]:
            User.objects.filter(email__endswith=DOMAIN).delete()
            MasterReport.objects.filter(reports__isnull=True).delete()
            self.stdout.write("Data demo lama dihapus.")
        if User.objects.filter(email__endswith=DOMAIN).exists():
            self.stdout.write("Data demo sudah ada; dilewati. Gunakan --reset untuk mengisi ulang.")
            return
        pw = os.environ.get("DEMO_PASSWORD", "SigapDemo2026!")
        with transaction.atomic():
            users = self._users(pw)
            self._reports(users)
        self.stdout.write(self.style.SUCCESS("Seed demo selesai: 30 laporan."))
        for name, role in [("warga1", "public"), ("warga2", "public"),
                           ("petugas", "officer"), ("admin", "admin")]:
            self.stdout.write(f"  {name}{DOMAIN}  ({role})  password: {pw}")

    def _users(self, pw):
        spec = [("warga1", "public", "Warga Satu"), ("warga2", "public", "Warga Dua"),
                ("petugas", "officer", "Petugas Demo"), ("admin", "admin", "Admin Demo")]
        return {
            name: User.objects.create_user(
                email=f"{name}{DOMAIN}", password=pw, role=role, full_name=full,
                is_staff=(role == "admin"))
            for name, role, full in spec
        }

    def _reports(self, users):
        cats = list(Category.objects.filter(is_active=True).order_by("id"))
        reports = []
        with mock.patch("reports.services.reverse_geocode", return_value=None):
            for i in range(30):
                regency, lat, lng, addr = PLACES[i % 9]
                cat = cats[i % len(cats)]
                if i < 3:  # duplicate group: same spot, same category
                    regency, lat, lng, addr = PLACES[0]
                    cat = cats[0]
                    lat += 0.00005 * i
                r = create_report(
                    users["warga1" if i % 2 == 0 else "warga2"],
                    {"category": cat, "latitude": lat, "longitude": lng, "address": addr,
                     "description": f"{PREFIX} {cat.name} di {addr} (laporan {i + 1})."},
                    [make_image(i)])
                Report.objects.filter(pk=r.pk).update(regency=regency)
                r.regency = regency
                reports.append(r)
        for r in reports:
            store_embedding(r)  # gagal tanpa error bila provider tidak tersedia
        link_report(reports[1], reports[0])
        link_report(reports[2], reports[0])
        officer = users["petugas"]
        for idx, path in PLAN.items():
            for to in path:
                note = "Catatan petugas untuk data uji." if to in (S.COMPLETED, S.REJECTED) else ""
                change_status(reports[idx], to, note, officer)
        for n, idx in enumerate([0, 3, 5, 7, 9]):
            ReportComment.objects.create(
                report=reports[idx], author=users["warga2" if n % 2 == 0 else "petugas"],
                body=f"{PREFIX} Komentar uji nomor {n + 1}.")
