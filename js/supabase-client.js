/* ========================================================================
 * Portal PKSK — Klien Auth & Langganan
 * ------------------------------------------------------------------------
 * DUA MOD:
 *   • MOD SEBENAR  — bila SUPABASE_URL & SUPABASE_ANON_KEY diisi di bawah.
 *   • MOD DEMO     — bila kosong: seluruh aliran (daftar, log masuk,
 *                    bayaran, kelulusan admin) berjalan setempat guna
 *                    localStorage. Sesuai untuk menguji sebelum Supabase
 *                    disambung. Data demo hanya pada pelayar ini.
 *
 * NOTA MOD DEMO: akaun PERTAMA yang didaftarkan menjadi ADMIN automatik
 * supaya anda boleh menguji Panel Admin.
 * ==================================================================== */

(function () {
  "use strict";

  // >>> ISI DUA NILAI INI UNTUK GUNA SUPABASE SEBENAR <<<
  const SUPABASE_URL = "";
  const SUPABASE_ANON_KEY = "";

  const CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
  const REAL = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

  let client = null;
  let cachedUser = null;
  let profile = null;
  const listeners = new Set();

  function emit() {
    const s = state();
    listeners.forEach(fn => { try { fn(s); } catch (e) {} });
    document.dispatchEvent(new CustomEvent("pksk-auth-changed", { detail: s }));
  }

  function state() {
    return {
      configured: true,          // sentiasa "aktif" — demo atau sebenar
      isDemo: !REAL,
      user: cachedUser,
      profile,
      access: !cachedUser ? "anon"
        : profile?.role === "admin" ? "admin"
        : (profile?.access_level || "free")
    };
  }

  /* =========================================================
     MOD DEMO (localStorage)
     ========================================================= */
  const Demo = (() => {
    const K = { users: "pksk_demo_users", sess: "pksk_demo_session", req: "pksk_demo_payreq" };
    const rd = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } };
    const wr = (k, v) => localStorage.setItem(k, JSON.stringify(v));
    const uid = () => "u_" + Math.random().toString(36).slice(2, 10);

    function users() { return rd(K.users, {}); }
    function setUsers(u) { wr(K.users, u); }

    async function signUp(email, password, fullName) {
      email = email.toLowerCase();
      const u = users();
      if (u[email]) throw new Error("E-mel ini sudah didaftarkan — sila log masuk.");
      const first = Object.keys(u).length === 0; // akaun pertama = admin
      u[email] = {
        id: uid(), email, password,
        full_name: fullName || email.split("@")[0],
        role: first ? "admin" : "user",
        access_level: "free"
      };
      setUsers(u);
      wr(K.sess, email);
      apply(email);
    }
    async function signIn(email, password) {
      email = email.toLowerCase();
      const u = users()[email];
      if (!u || u.password !== password) throw new Error("E-mel atau kata laluan salah.");
      wr(K.sess, email);
      apply(email);
    }
    function signOut() { localStorage.removeItem(K.sess); cachedUser = null; profile = null; emit(); }

    function apply(email) {
      const u = users()[email];
      if (!u) { cachedUser = null; profile = null; }
      else {
        cachedUser = { id: u.id, email: u.email };
        profile = { full_name: u.full_name, role: u.role, access_level: u.access_level };
      }
      emit();
    }
    function restore() {
      const email = rd(K.sess, null);
      if (email && users()[email]) apply(email);
    }

    async function submitPayment(d) {
      const reqs = rd(K.req, []);
      let receipt = null;
      if (d.file) receipt = await fileToDataUrl(d.file);
      reqs.unshift({
        id: "r_" + Date.now(), user_id: cachedUser?.id, email: cachedUser?.email,
        full_name: profile?.full_name, amount: d.amount || null,
        reference: d.reference || null, note: d.note || null,
        receipt_url: receipt, status: "pending", created_at: new Date().toISOString()
      });
      wr(K.req, reqs);
    }
    function listRequests() { return Promise.resolve(rd(K.req, [])); }

    function approve(id) {
      const reqs = rd(K.req, []);
      const r = reqs.find(x => x.id === id); if (!r) return;
      r.status = "approved"; r.reviewed_at = new Date().toISOString();
      wr(K.req, reqs);
      // naik taraf akaun berkenaan
      const u = users();
      const key = Object.keys(u).find(k => u[k].id === r.user_id);
      if (key) { u[key].access_level = "premium"; setUsers(u); }
      // jika pengguna itu ialah sesi semasa, kemas kini
      if (cachedUser && r.user_id === cachedUser.id) { profile.access_level = "premium"; emit(); }
      return Promise.resolve();
    }
    function reject(id) {
      const reqs = rd(K.req, []);
      const r = reqs.find(x => x.id === id); if (r) { r.status = "rejected"; r.reviewed_at = new Date().toISOString(); wr(K.req, reqs); }
      return Promise.resolve();
    }
    return { signUp, signIn, signOut, restore, submitPayment, listRequests, approve, reject };
  })();

  function fileToDataUrl(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  /* =========================================================
     MOD SEBENAR (Supabase)
     ========================================================= */
  function loadLib() {
    return new Promise((resolve, reject) => {
      if (window.supabase?.createClient) return resolve();
      const s = document.createElement("script");
      s.src = CDN; s.onload = resolve;
      s.onerror = () => reject(new Error("Gagal memuat pustaka Supabase."));
      document.head.appendChild(s);
    });
  }
  async function loadProfile() {
    if (!client || !cachedUser) { profile = null; return; }
    const { data } = await client.from("profiles")
      .select("full_name, role, access_level, is_active").eq("id", cachedUser.id).maybeSingle();
    profile = data || null;
  }

  const Real = {
    async signUp(email, password, fullName) {
      const { data, error } = await client.auth.signUp({
        email, password, options: { data: { full_name: fullName || "" } }
      });
      if (error) throw error;
      return data;
    },
    async signIn(email, password) {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    async signOut() { await client.auth.signOut(); },
    async submitPayment(d) {
      let receipt_url = null;
      if (d.file) {
        const path = `${cachedUser.id}/${Date.now()}-${d.file.name.replace(/[^\w.\-]/g, "_")}`;
        const up = await client.storage.from("receipts").upload(path, d.file, { upsert: true });
        if (!up.error) receipt_url = client.storage.from("receipts").getPublicUrl(path).data.publicUrl;
      }
      const { error } = await client.from("payment_requests").insert({
        user_id: cachedUser.id, full_name: profile?.full_name || null, email: cachedUser.email || null,
        amount: d.amount || null, reference: d.reference || null, note: d.note || null, receipt_url
      });
      if (error) throw error;
    },
    async listRequests() {
      const { data, error } = await client.from("payment_requests")
        .select("*").order("created_at", { ascending: false }).limit(60);
      if (error) throw error;
      return data;
    },
    async approve(id) { const { error } = await client.rpc("approve_premium", { p_request: id, p_months: 12 }); if (error) throw error; },
    async reject(id) { const { error } = await client.rpc("reject_payment", { p_request: id }); if (error) throw error; }
  };

  /* =========================================================
     API AWAM (sama untuk kedua-dua mod)
     ========================================================= */
  async function init() {
    if (REAL) {
      if (client) return;
      await loadLib();
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data } = await client.auth.getSession();
      cachedUser = data?.session?.user ?? null;
      if (cachedUser) await loadProfile();
      client.auth.onAuthStateChange(async (_e, session) => {
        cachedUser = session?.user ?? null; profile = null;
        if (cachedUser) await loadProfile();
        emit();
      });
      emit();
    } else {
      Demo.restore();
      emit();
    }
  }

  const back = () => (REAL ? Real : Demo);

  window.pkskAuth = {
    init, state, configured: () => true, isDemo: () => !REAL,
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    async signUp(e, p, n) { await init(); return back().signUp(e, p, n); },
    async signIn(e, p) { await init(); return back().signIn(e, p); },
    async signOut() { await init(); return back().signOut(); },
    async submitPayment(d) { await init(); return back().submitPayment(d); },
    async listPaymentRequests() { await init(); return back().listRequests(); },
    async approvePayment(id) { await init(); return back().approve(id); },
    async rejectPayment(id) { await init(); return back().reject(id); },
    get client() { return client; }
  };

  init();
})();
