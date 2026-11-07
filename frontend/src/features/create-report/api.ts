import { api } from "../../lib/api";

export interface Category { id: number; slug: string; name: string }
export interface LatLng { lat: number; lng: number }
export interface AiResult {
  is_infrastructure: boolean;
  category_slug: string | null;
  description: string;
  observations: string[];
}
export interface Candidate {
  report_id: number; code: string; category_name: string; distance_m: number;
  status: string; status_label: string; thumbnail_url: string | null; description: string;
}
export interface DupResult { decision: "low" | "medium" | "high"; candidates: Candidate[] }
export interface Place { label: string; latitude: number; longitude: number }
export interface Reverse { address: string; in_bali: boolean }

export const fetchCategories = () => api<Category[]>("/api/categories");
export const reverseGeocode = (p: LatLng) =>
  api<Reverse>(`/api/locations/reverse?lat=${p.lat}&lng=${p.lng}`);
export const searchPlaces = (q: string) =>
  api<Place[]>(`/api/locations/search?q=${encodeURIComponent(q)}`);

export function analyzePhoto(file: File) {
  const form = new FormData();
  form.append("image", file);
  return api<AiResult>("/api/ai/analyze-photo", { method: "POST", form });
}

export const checkDuplicates = (b: {
  latitude: number; longitude: number; category_id: number; description: string;
}) => api<DupResult>("/api/duplicates/check", { method: "POST", body: b });

export interface Draft {
  files: File[];
  loc: LatLng | null;
  address: string;
  inBali: boolean | null;
  categoryId: number | "";
  description: string;
  ai: { status: "idle" | "loading" | "done" | "error" | "skipped"; result?: AiResult };
  linkTo: number | null;
}

export const EMPTY_DRAFT: Draft = {
  files: [], loc: null, address: "", inBali: null, categoryId: "", description: "",
  ai: { status: "idle" }, linkTo: null,
};

export function buildForm(d: Draft, cats: Category[]): FormData {
  const f = new FormData();
  d.files.forEach((x) => f.append("images", x));
  f.append("category_id", String(d.categoryId));
  f.append("description", d.description);
  f.append("latitude", String(d.loc!.lat));
  f.append("longitude", String(d.loc!.lng));
  f.append("address", d.address);
  const r = d.ai.status === "done" ? d.ai.result : undefined;
  const used = !!r && r.is_infrastructure;
  f.append("ai_used", used ? "true" : "false");
  if (used && r) {
    const sc = cats.find((c) => c.slug === r.category_slug);
    if (sc) f.append("ai_suggested_category_id", String(sc.id));
    f.append("ai_suggested_description", r.description);
    f.append("ai_observations", JSON.stringify(r.observations));
  }
  if (d.linkTo) f.append("link_to_report_id", String(d.linkTo));
  return f;
}

export const submitReport = (d: Draft, cats: Category[]) =>
  api<{ id: number; code?: string }>("/api/reports", { method: "POST", form: buildForm(d, cats) });
