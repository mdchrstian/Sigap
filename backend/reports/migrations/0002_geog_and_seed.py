from django.db import migrations

CATEGORIES = [
    ("road", "Jalan"),
    ("street_lighting", "Penerangan Jalan Umum"),
    ("pedestrian", "Trotoar & Pejalan Kaki"),
    ("drainage", "Drainase"),
    ("public_transport", "Fasilitas Transportasi Umum"),
    ("sanitation", "Toilet Umum"),
]


def seed(apps, schema_editor):
    Category = apps.get_model("reports", "Category")
    for slug, name in CATEGORIES:
        Category.objects.update_or_create(slug=slug, defaults={"name": name, "is_active": True})


class Migration(migrations.Migration):
    dependencies = [("reports", "0001_initial"), ("accounts", "0001_extensions")]

    operations = [
        migrations.RunSQL(
            sql="""
            ALTER TABLE reports_report ADD COLUMN geog geography(Point,4326)
              GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude),4326)::geography) STORED;
            CREATE INDEX reports_report_geog_gist ON reports_report USING GIST (geog);
            """,
            reverse_sql="""
            DROP INDEX IF EXISTS reports_report_geog_gist;
            ALTER TABLE reports_report DROP COLUMN geog;
            """,
        ),
        migrations.RunPython(seed, migrations.RunPython.noop),
    ]
