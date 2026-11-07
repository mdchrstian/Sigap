import { ApiError } from "../../lib/api";

export interface FormErrors {
  fields: Record<string, string>;
  general: string;
}

export function parseError(e: unknown): FormErrors {
  const out: FormErrors = { fields: {}, general: "" };
  if (e instanceof ApiError) {
    const d = e.data as Record<string, unknown> | null;
    if (d && typeof d === "object") {
      if (typeof d.detail === "string") out.general = d.detail;
      for (const [k, v] of Object.entries(d)) {
        if (k === "detail") continue;
        out.fields[k] = Array.isArray(v) ? v.join(" ") : String(v);
      }
    }
    if (!out.general && !Object.keys(out.fields).length) out.general = "Terjadi kesalahan. Coba lagi.";
  } else {
    out.general = "Tidak dapat terhubung ke server.";
  }
  return out;
}
