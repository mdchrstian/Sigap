import io

from django.core.files.base import ContentFile
from PIL import Image, ImageOps, UnidentifiedImageError

MAX_BYTES = 8 * 1024 * 1024
MAX_SIDE = 1600
ALLOWED = {"JPEG", "PNG", "WEBP"}
MSG = "File harus berupa gambar JPG, PNG, atau WebP."


class ImageError(ValueError):
    pass


def validate_image(upload):
    if upload.size > MAX_BYTES:
        raise ImageError("Ukuran foto maksimal 8 MB.")
    try:
        upload.seek(0)
        img = Image.open(upload)
        fmt = img.format
        img.verify()
    except (UnidentifiedImageError, OSError, SyntaxError):
        raise ImageError(MSG)
    finally:
        upload.seek(0)
    if fmt not in ALLOWED:
        raise ImageError(MSG)


def process_image(upload, name="photo"):
    """Validate, resize (longest side <= 1600), re-encode JPEG q80, strip EXIF."""
    validate_image(upload)
    img = Image.open(upload)
    img.load()
    img = ImageOps.exif_transpose(img)
    if img.mode in ("RGBA", "LA", "P"):
        rgba = img.convert("RGBA")
        bg = Image.new("RGB", rgba.size, (255, 255, 255))
        bg.paste(rgba, mask=rgba.split()[-1])
        img = bg
    else:
        img = img.convert("RGB")
    img.thumbnail((MAX_SIDE, MAX_SIDE))
    out = io.BytesIO()
    img.save(out, "JPEG", quality=80)  # exif not passed -> stripped
    return ContentFile(out.getvalue(), name=f"{name}.jpg")
