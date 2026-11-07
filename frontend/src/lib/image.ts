export const MAX_FILES = 3;
export const MAX_BYTES = 8 * 1024 * 1024;
export const MAX_SIDE = 1600;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateImage(file: File): string | null {
  if (!TYPES.includes(file.type)) return "Format harus JPG, PNG, atau WebP.";
  if (file.size > MAX_BYTES) return "Ukuran foto maksimal 8 MB.";
  return null;
}

export function fitSize(w: number, h: number, max = MAX_SIDE): { w: number; h: number } {
  const s = Math.min(1, max / Math.max(w, h));
  return { w: Math.round(w * s), h: Math.round(h * s) };
}

/** Downscale to <=1600 px JPEG via canvas. */
export async function downscale(file: File): Promise<File> {
  const bmp = await createImageBitmap(file);
  const { w, h } = fitSize(bmp.width, bmp.height);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  bmp.close?.();
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.85));
  if (!blob) throw new Error("canvas");
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}
