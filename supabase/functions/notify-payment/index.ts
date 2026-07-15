// =====================================================================
// Portal PKSK — Edge Function: notify-payment
// ---------------------------------------------------------------------
// Menghantar e-mel kepada admin setiap kali permintaan bayaran baharu
// dimasukkan ke jadual public.payment_requests (melalui Database Webhook).
//
// Menggunakan Resend (https://resend.com — percuma) sebagai penghantar
// e-mel kerana ia paling mudah dari Edge Function.
//
// SECRET yang perlu ditetapkan (Dashboard -> Edge Functions -> Secrets,
// atau: supabase secrets set ...):
//   RESEND_API_KEY   = re_xxx        (kunci API dari resend.com)
//   ADMIN_EMAIL      = anda@email.com (penerima notifikasi)
//   MAIL_FROM        = "PKSK <onboarding@resend.dev>"  (pengirim)
//   WEBHOOK_SECRET   = rahsia-anda   (pilihan; padan dgn header webhook)
// =====================================================================

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Pengesahan ringkas (pilihan): padankan rahsia webhook.
  const expected = Deno.env.get("WEBHOOK_SECRET");
  if (expected) {
    const got = req.headers.get("x-webhook-secret");
    if (got !== expected) return new Response("Unauthorized", { status: 401 });
  }

  let payload: any = {};
  try {
    payload = await req.json();
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const r = payload?.record ?? {};
  // Hanya proses kemasukan baharu yang berstatus pending.
  if (payload?.type && payload.type !== "INSERT") {
    return new Response("ignored", { status: 200 });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL");
  const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "PKSK <onboarding@resend.dev>";

  if (!RESEND_API_KEY || !ADMIN_EMAIL) {
    console.error("RESEND_API_KEY atau ADMIN_EMAIL belum ditetapkan.");
    return new Response("Missing secrets", { status: 500 });
  }

  const esc = (s: unknown) =>
    String(s ?? "-").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#a41f45;margin:0 0 6px">Permintaan Naik Taraf Premium</h2>
      <p style="color:#555;margin:0 0 16px">Satu bayaran baharu menunggu kelulusan anda.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px 10px;background:#fbe7ee;font-weight:700">Nama</td><td style="padding:8px 10px">${esc(r.full_name)}</td></tr>
        <tr><td style="padding:8px 10px;background:#fbe7ee;font-weight:700">E-mel</td><td style="padding:8px 10px">${esc(r.email)}</td></tr>
        <tr><td style="padding:8px 10px;background:#fbe7ee;font-weight:700">Rujukan</td><td style="padding:8px 10px">${esc(r.reference)}</td></tr>
        <tr><td style="padding:8px 10px;background:#fbe7ee;font-weight:700">Jumlah</td><td style="padding:8px 10px">RM ${esc(r.amount)}</td></tr>
        <tr><td style="padding:8px 10px;background:#fbe7ee;font-weight:700">Catatan</td><td style="padding:8px 10px">${esc(r.note)}</td></tr>
        <tr><td style="padding:8px 10px;background:#fbe7ee;font-weight:700">Masa</td><td style="padding:8px 10px">${esc(r.created_at)}</td></tr>
      </table>
      <p style="margin:18px 0 0;font-size:13px;color:#555">
        Log masuk ke <b>www.pkskmy.com</b> sebagai admin -> butang <b>🛡️ Admin</b>
        untuk meluluskan permintaan ini.</p>
    </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: [ADMIN_EMAIL],
      subject: `💰 Bayaran Premium PKSK — ${r.full_name ?? r.email ?? "Pengguna"}`,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Resend gagal:", res.status, text);
    return new Response("Email failed", { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
