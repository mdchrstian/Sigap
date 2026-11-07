import os
import shutil
import subprocess
from pathlib import Path

import pytest

BACKEND = Path(__file__).resolve().parent.parent
SCRIPT = BACKEND / "scripts" / "setup_env.sh"
EXAMPLE = BACKEND / ".env.example"


@pytest.fixture
def box(tmp_path):
    (tmp_path / "scripts").mkdir()
    shutil.copy(SCRIPT, tmp_path / "scripts" / "setup_env.sh")
    shutil.copy(EXAMPLE, tmp_path / ".env.example")
    return tmp_path


def run(box, *args):
    return subprocess.run(
        ["bash", str(box / "scripts" / "setup_env.sh"), "--skip-migrate", *args],
        capture_output=True, text=True, cwd=box, env=os.environ.copy(),
    )


def lines(p):
    return (p / ".env").read_text().splitlines()


def secret(p):
    return [x for x in lines(p) if x.startswith("SECRET_KEY=")][0].split("=", 1)[1]


def test_creates_env(box):
    r = run(box)
    assert r.returncode == 0, r.stderr
    ex = EXAMPLE.read_text().splitlines()
    got = lines(box)
    assert [x for x in got if not x.startswith("SECRET_KEY=")] == [
        x for x in ex if not x.startswith("SECRET_KEY=")
    ]
    assert secret(box) and secret(box) != "change-me"
    assert secret(box) not in r.stdout + r.stderr


def test_existing_kept(box):
    run(box)
    before = (box / ".env").read_bytes()
    r = run(box)
    assert (box / ".env").read_bytes() == before
    assert "kept" in r.stdout


def test_force_regenerates(box):
    run(box)
    old = secret(box)
    run(box, "--force")
    assert secret(box) != old


def test_database_url_and_masking(box):
    run(box)
    before = lines(box)
    url = "postgres://u:pw@h:5432/db?sslmode=require&a=b/c"
    r = run(box, "--database-url", url)
    assert r.returncode == 0, r.stderr
    after = lines(box)
    assert [x for x in after if x.startswith("DATABASE_URL=")] == ["DATABASE_URL=" + url]
    assert [x for x in after if not x.startswith("DATABASE_URL=")] == [
        x for x in before if not x.startswith("DATABASE_URL=")
    ]
    out = r.stdout + r.stderr
    assert "pw" not in out and "***" in out
    assert secret(box) not in out


def test_unknown_flag(box):
    r = subprocess.run(["bash", str(box / "scripts" / "setup_env.sh"), "--nope"],
                       capture_output=True, text=True, cwd=box)
    assert r.returncode == 2
    assert "Usage" in r.stderr


def test_missing_example(box):
    (box / ".env.example").unlink()
    r = run(box)
    assert r.returncode != 0


def test_script_valid_and_executable():
    assert subprocess.run(["bash", "-n", str(SCRIPT)]).returncode == 0
    assert os.access(SCRIPT, os.X_OK)
