from django.db import connection


def nearby(lat, lng, radius_m):
    sql = """
        SELECT r.id, ST_Distance(r.geog, p.pt) AS d
        FROM reports_report r,
             (SELECT ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography AS pt) p
        WHERE ST_DWithin(r.geog, p.pt, %s)
        ORDER BY d
    """
    with connection.cursor() as cur:
        cur.execute(sql, [lng, lat, radius_m])
        return [(r[0], float(r[1])) for r in cur.fetchall()]
