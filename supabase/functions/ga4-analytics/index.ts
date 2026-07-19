// =====================================================================
// Portal PKSK — Edge Function: ga4-analytics
// Data GA4 hanya dikembalikan kepada pengguna yang lulus public.is_admin().
// Credentials Google disimpan sebagai Supabase Edge Function secrets.
// =====================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

let tokenCache: { token: string; expiresAt: number } | null = null;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

function base64Url(value: string | Uint8Array): string {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function privateKeyBytes(pem: string): Uint8Array {
  const normalized = pem.replace(/\\n/g, "\n")
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
  const binary = atob(normalized);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function googleAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(JSON.stringify({
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: issuedAt,
    exp: issuedAt + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBytes(privateKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );
  const assertion = `${unsigned}.${base64Url(new Uint8Array(signature))}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!response.ok) throw new Error(`Google OAuth gagal (${response.status}).`);
  const payload = await response.json();
  if (!payload.access_token) throw new Error("Google OAuth tidak memulangkan access token.");
  tokenCache = {
    token: payload.access_token,
    expiresAt: Date.now() + Number(payload.expires_in || 3600) * 1000,
  };
  return tokenCache.token;
}

function malaysiaToday(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function addDays(dateText: string, amount: number): string {
  const date = new Date(`${dateText}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function monthStart(dateText: string): string {
  return `${dateText.slice(0, 7)}-01`;
}

function metricRequest(startDate: string, endDate: string, metrics: string[]) {
  return {
    dateRanges: [{ startDate, endDate }],
    metrics: metrics.map((name) => ({ name })),
  };
}

async function batchReports(propertyId: string, token: string, requests: unknown[]) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:batchRunReports`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requests }),
    },
  );
  if (!response.ok) throw new Error(`Google Analytics Data API gagal (${response.status}).`);
  const payload = await response.json();
  return Array.isArray(payload.reports) ? payload.reports : [];
}

function metricValue(report: any, metricIndex = 0): number {
  return Number(report?.rows?.[0]?.metricValues?.[metricIndex]?.value || 0);
}

function reportRows(report: any): any[] {
  return Array.isArray(report?.rows) ? report.rows : [];
}

function sumLabels(rows: any[], classify: (value: string) => string, metricIndex = 0) {
  const totals = new Map<string, number>();
  rows.forEach((row) => {
    const raw = String(row?.dimensionValues?.[0]?.value || "");
    const label = classify(raw);
    const value = Number(row?.metricValues?.[metricIndex]?.value || 0);
    totals.set(label, (totals.get(label) || 0) + value);
  });
  return [...totals.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value);
}

function sourceLabel(value: string): string {
  const source = value.toLowerCase();
  if (source.includes("google")) return "Google";
  if (source.includes("facebook") || source === "fb" || source.includes("m.facebook")) return "Facebook";
  if (!source || source === "(direct)" || source === "(not set)") return "Pautan terus";
  return "Lain-lain";
}

function deviceLabel(value: string): string {
  const device = value.toLowerCase();
  if (device === "mobile") return "Telefon";
  if (device === "desktop") return "Komputer";
  if (device === "tablet") return "Tablet";
  return "Lain-lain";
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ message: "Kaedah tidak dibenarkan." }, 405);

  const authorization = req.headers.get("Authorization");
  if (!authorization) return json({ message: "Sesi pentadbir diperlukan." }, 401);
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) return json({ message: "Konfigurasi Supabase tidak tersedia." }, 500);

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return json({ message: "Sesi tidak sah." }, 401);
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || isAdmin !== true) return json({ message: "Akses pentadbir diperlukan." }, 403);

  const propertyId = Deno.env.get("GA4_PROPERTY_ID")?.trim();
  const clientEmail = Deno.env.get("GA4_CLIENT_EMAIL")?.trim();
  const privateKey = Deno.env.get("GA4_PRIVATE_KEY")?.trim();
  if (!propertyId || !clientEmail || !privateKey) {
    return json({
      configured: false,
      status: "unconfigured",
      message: "Property ID atau credentials GA4 belum ditetapkan pada Supabase Edge Function.",
    });
  }
  if (!/^\d+$/.test(propertyId)) {
    return json({ configured: false, status: "unconfigured", message: "Format GA4 Property ID tidak sah." });
  }

  let body: { rangeDays?: number } = {};
  try { body = await req.json(); } catch { body = {}; }
  const rangeDays = [7, 30, 90].includes(Number(body.rangeDays)) ? Number(body.rangeDays) : 30;
  const today = malaysiaToday();
  const selectedStart = addDays(today, -(rangeDays - 1));

  try {
    const token = await googleAccessToken(clientEmail, privateKey);
    const summary = await batchReports(propertyId, token, [
      metricRequest(today, today, ["activeUsers"]),
      metricRequest(addDays(today, -6), today, ["activeUsers"]),
      metricRequest(monthStart(today), today, ["activeUsers"]),
      metricRequest("2020-01-01", today, ["totalUsers"]),
      metricRequest(selectedStart, today, ["activeUsers", "sessions", "screenPageViews"]),
    ]);
    const details = await batchReports(propertyId, token, [
      {
        ...metricRequest(selectedStart, today, ["sessions"]),
        dimensions: [{ name: "date" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      },
      {
        ...metricRequest(selectedStart, today, ["screenPageViews"]),
        dimensions: [{ name: "pageTitle" }, { name: "pagePath" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: "5",
      },
      {
        ...metricRequest(selectedStart, today, ["sessions"]),
        dimensions: [{ name: "sessionSource" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: "25",
      },
      {
        ...metricRequest(selectedStart, today, ["activeUsers"]),
        dimensions: [{ name: "deviceCategory" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      },
      {
        ...metricRequest(selectedStart, today, ["activeUsers"]),
        dimensions: [{ name: "country" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: "5",
      },
    ]);

    const sourceTotals = sumLabels(reportRows(details[2]), sourceLabel);
    const deviceTotals = sumLabels(reportRows(details[3]), deviceLabel);
    return json({
      configured: true,
      rangeDays,
      updatedAt: new Date().toISOString(),
      metrics: {
        today: metricValue(summary[0]),
        last7Days: metricValue(summary[1]),
        currentMonth: metricValue(summary[2]),
        totalVisitors: metricValue(summary[3]),
        uniqueVisitors: metricValue(summary[4], 0),
        sessions: metricValue(summary[4], 1),
        pageViews: metricValue(summary[4], 2),
      },
      trend: reportRows(details[0]).map((row) => ({
        date: row?.dimensionValues?.[0]?.value || "",
        value: Number(row?.metricValues?.[0]?.value || 0),
      })),
      topPages: reportRows(details[1]).map((row) => ({
        title: row?.dimensionValues?.[0]?.value || row?.dimensionValues?.[1]?.value || "Halaman tanpa tajuk",
        path: row?.dimensionValues?.[1]?.value || "",
        pageViews: Number(row?.metricValues?.[0]?.value || 0),
      })),
      trafficSources: sourceTotals.map((item) => ({ label: item.label, sessions: item.value })),
      devices: deviceTotals.map((item) => ({ label: item.label, visitors: item.value })),
      countries: reportRows(details[4]).map((row) => ({
        label: row?.dimensionValues?.[0]?.value || "Tidak diketahui",
        visitors: Number(row?.metricValues?.[0]?.value || 0),
      })),
    });
  } catch (error) {
    console.error("GA4 analytics error:", error instanceof Error ? error.message : "Unknown error");
    return json({
      configured: false,
      status: "error",
      message: "Google Analytics 4 tidak dapat dihubungi. Semak Property ID, akses service account dan secrets.",
    }, 502);
  }
});
