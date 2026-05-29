import { DEFAULT_REVALIDATE_SECONDS } from "./site-config";

type FetchMode = "read" | "write";

type SupabaseFetchOptions = {
  mode?: FetchMode;
  query?: URLSearchParams;
  tags?: string[];
  revalidate?: number;
  body?: unknown;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  prefer?: string;
};

function readEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function getSupabaseUrl() {
  const value = readEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
  if (!value) throw new Error("Missing Supabase URL. Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL.");
  return value.replace(/\/+$/, "");
}

function getSupabaseAnonKey() {
  const value = readEnv("SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!value) throw new Error("Missing Supabase anon key. Set SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  return value;
}

function getSupabaseServiceRoleKey() {
  const value = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!value) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  return value;
}

function getSupabaseApiKey(mode: FetchMode) {
  if (mode === "write") return getSupabaseServiceRoleKey();
  return readEnv("SUPABASE_SERVICE_ROLE_KEY") || getSupabaseAnonKey();
}

export function hasSupabaseReadEnv() {
  return Boolean(readEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL")) &&
    Boolean(readEnv("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export async function supabaseRestRequest<T>(table: string, options: SupabaseFetchOptions = {}) {
  const mode = options.mode || "read";
  const query = options.query || new URLSearchParams();
  const url = `${getSupabaseUrl()}/rest/v1/${table}${query.toString() ? `?${query.toString()}` : ""}`;
  const apiKey = getSupabaseApiKey(mode);
  const useFreshRead = mode === "read" && options.revalidate === 0;
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(options.prefer ? { Prefer: options.prefer } : {})
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    next:
      mode === "read" && !useFreshRead
        ? {
            revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS,
            tags: options.tags || []
          }
        : undefined,
    cache: mode === "write" || useFreshRead ? "no-store" : undefined
  });

  const payload = await parseResponse(response);
  if (!response.ok) {
    const detail =
      typeof payload === "string"
        ? payload
        : (payload as { message?: string; error?: string; details?: string })?.message ||
          (payload as { error?: string })?.error ||
          (payload as { details?: string })?.details ||
          "Unknown Supabase request failure.";
    throw new Error(`${response.status} ${response.statusText}: ${detail}`);
  }

  return payload as T;
}

export async function selectRows<T>(table: string, query?: URLSearchParams, tags?: string[]) {
  const params = query || new URLSearchParams();
  if (!params.has("select")) params.set("select", "*");
  return supabaseRestRequest<T[]>(table, {
    mode: "read",
    query: params,
    tags
  });
}

export async function selectRowsFresh<T>(table: string, query?: URLSearchParams) {
  const params = query || new URLSearchParams();
  if (!params.has("select")) params.set("select", "*");
  return supabaseRestRequest<T[]>(table, {
    mode: "read",
    query: params,
    revalidate: 0
  });
}

export async function upsertRows<T>(table: string, rows: T[], onConflict: string) {
  if (!rows.length) return [] as T[];
  const query = new URLSearchParams({
    on_conflict: onConflict
  });
  return supabaseRestRequest<T[]>(table, {
    mode: "write",
    method: "POST",
    query,
    body: rows,
    prefer: "resolution=merge-duplicates,return=representation"
  });
}

export async function patchRows<T>(table: string, query: URLSearchParams, body: Partial<T>) {
  if (!query.has("select")) query.set("select", "*");
  return supabaseRestRequest<T[]>(table, {
    mode: "write",
    method: "PATCH",
    query,
    body,
    prefer: "return=representation"
  });
}

export async function deleteRows<T>(table: string, query: URLSearchParams) {
  if (!query.has("select")) query.set("select", "*");
  return supabaseRestRequest<T[]>(table, {
    mode: "write",
    method: "DELETE",
    query,
    prefer: "return=representation"
  });
}
