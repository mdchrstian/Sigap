import { clearTokens, getTokens, setTokens } from "./tokens";

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, data: unknown = null) {
    super(`API error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export interface ApiOptions {
  method?: string;
  body?: unknown;
  form?: FormData;
}

const BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? "").replace(/\/+$/, "");

async function parse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function send(path: string, opts: ApiOptions): Promise<Response> {
  const headers: Record<string, string> = {};
  const tokens = getTokens();
  if (tokens?.access) headers.Authorization = `Bearer ${tokens.access}`;
  let body: BodyInit | undefined;
  if (opts.form) body = opts.form;
  else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }
  return fetch(`${BASE}${path}`, { method: opts.method ?? "GET", headers, body });
}

async function refresh(): Promise<boolean> {
  const tokens = getTokens();
  if (!tokens?.refresh) return false;
  try {
    const res = await fetch(`${BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { access?: string };
    if (!data.access) return false;
    setTokens({ access: data.access, refresh: tokens.refresh });
    return true;
  } catch {
    return false;
  }
}

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  let res = await send(path, opts);
  if (res.status === 401) {
    if (await refresh()) {
      res = await send(path, opts);
    } else {
      clearTokens();
      throw new ApiError(401, await parse(res));
    }
  }
  const data = await parse(res);
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}
