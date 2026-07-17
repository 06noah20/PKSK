/* ========================================================================
 * Portal PKSK — akaun, kelulusan admin dan akses latihan.
 *
 * Dua mod:
 *   - Demo (tetapan Supabase kosong): data disimpan dalam localStorage.
 *   - Supabase: data sebenar menggunakan jadual profiles dan RPC setup.sql.
 * ==================================================================== */

(function () {
  "use strict";

  // Isi kedua-dua nilai ini apabila portal disambungkan kepada Supabase.
  const SUPABASE_URL = "https://erwmjhohjadwcrrvqack.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_4oPLpY3kC4yv1OqR-RyfrQ_akaY0Uqy";
  const CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
  // index.html yang dibuka terus sebagai fail kekal dalam mod demo lokal,
  // manakala versi domain (https/http) menggunakan Supabase sebenar.
  const FILE_PREVIEW = window.location?.protocol === "file:";
  const REAL = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY) && !FILE_PREVIEW;

  const ADMIN_ID = "pkskmy";
  const ADMIN_PASSWORD = "pkskmy@2026";
  const ADMIN_LOGIN_EMAIL = "admin@pkskmy.com";

  let client = null;
  let cachedUser = null;
  let profile = null;
  const listeners = new Set();

  function approvalStatus(p = profile) {
    if (!p) return null;
    if (p.role === "admin") return "approved";
    return p.approval_status || (p.access_level === "premium" ? "approved" : "pending");
  }

  function state() {
    const approval = approvalStatus();
    return {
      configured: true,
      isDemo: !REAL,
      user: cachedUser,
      profile,
      approval,
      notification: cachedUser && profile?.role !== "admin" &&
        (approval === "approved" || approval === "rejected") && !profile?.approval_notified
          ? { type: approval, unread: true }
          : null,
      access: !cachedUser
        ? "anon"
        : profile?.role === "admin"
          ? "admin"
          : approval === "approved" && profile?.access_level === "premium"
            ? "premium"
            : "free"
    };
  }

  function emit() {
    const current = state();
    listeners.forEach(fn => { try { fn(current); } catch (_) {} });
    document.dispatchEvent(new CustomEvent("pksk-auth-changed", { detail: current }));
  }

  /* =========================================================
     MOD DEMO (localStorage)
     ========================================================= */
  const Demo = (() => {
    const K = {
      users: "pksk_demo_users",
      sess: "pksk_demo_session",
      legacyRequests: "pksk_demo_payreq"
    };
    const read = (key, fallback) => {
      try {
        const value = JSON.parse(localStorage.getItem(key));
        return value == null ? fallback : value;
      } catch (_) { return fallback; }
    };
    const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
    const uid = () => "u_" + Math.random().toString(36).slice(2, 10);

    function getUsers() { return read(K.users, {}); }
    function setUsers(value) { write(K.users, value); }

    function seedAndMigrate() {
      const all = getUsers();
      const now = new Date().toISOString();

      // Akaun admin sentiasa tersedia; pengguna pertama tidak lagi menjadi admin.
      all[ADMIN_ID] = {
        ...(all[ADMIN_ID] || {}),
        id: "admin_pkskmy",
        username: ADMIN_ID,
        email: "",
        password: ADMIN_PASSWORD,
        full_name: "Pentadbir PKSK",
        role: "admin",
        access_level: "premium",
        approval_status: "approved",
        approval_notified: true,
        created_at: all[ADMIN_ID]?.created_at || now
      };

      Object.keys(all).forEach(key => {
        if (key === ADMIN_ID) return;
        const user = all[key];
        user.role = "user";
        user.created_at = user.created_at || now;
        user.approval_status = user.approval_status ||
          (user.access_level === "premium" ? "approved" : "pending");
        user.approval_notified = user.approval_notified ??
          (user.approval_status !== "approved" && user.approval_status !== "rejected");
      });

      // Ambil semula bukti bayaran daripada struktur demo versi terdahulu.
      const legacyRequests = read(K.legacyRequests, []);
      legacyRequests.slice().reverse().forEach(request => {
        const key = Object.keys(all).find(item => all[item].id === request.user_id);
        if (!key || all[key].payment_submitted_at) return;
        Object.assign(all[key], {
          payment_reference: request.reference || "",
          payment_amount: request.amount || 30,
          payment_note: request.note || "",
          receipt_url: request.receipt_url || null,
          payment_submitted_at: request.created_at || now
        });
      });
      setUsers(all);
    }

    function findUser(identifier) {
      const term = String(identifier || "").trim().toLowerCase();
      const all = getUsers();
      const key = Object.keys(all).find(k =>
        k.toLowerCase() === term ||
        String(all[k].email || "").toLowerCase() === term ||
        String(all[k].username || "").toLowerCase() === term);
      return key ? { key, value: all[key] } : null;
    }

    function apply(identifier) {
      const found = findUser(identifier);
      if (!found) {
        cachedUser = null;
        profile = null;
      } else {
        const user = found.value;
        cachedUser = {
          id: user.id,
          email: user.email || null,
          username: user.username || null
        };
        profile = {
          full_name: user.full_name,
          role: user.role,
          access_level: user.access_level,
          approval_status: user.approval_status,
          approval_notified: Boolean(user.approval_notified),
          created_at: user.created_at,
          reviewed_at: user.reviewed_at || null
        };
      }
      emit();
    }

    async function signUp(email, password, fullName) {
      const normalized = String(email || "").trim().toLowerCase();
      if (!normalized) throw new Error("Sila masukkan e-mel.");
      seedAndMigrate();
      if (findUser(normalized)) throw new Error("E-mel ini sudah didaftarkan — sila log masuk.");

      const all = getUsers();
      all[normalized] = {
        id: uid(),
        email: normalized,
        username: "",
        password,
        full_name: fullName || normalized.split("@")[0],
        role: "user",
        access_level: "free",
        approval_status: "pending",
        approval_notified: true,
        created_at: new Date().toISOString()
      };
      setUsers(all);
      write(K.sess, normalized);
      apply(normalized);
      return { user: cachedUser, session: { user: cachedUser } };
    }

    async function signIn(identifier, password) {
      seedAndMigrate();
      const found = findUser(identifier);
      if (!found || found.value.password !== password) {
        throw new Error("ID pengguna/e-mel atau kata laluan salah.");
      }
      write(K.sess, found.key);
      apply(found.key);
    }

    function signOut() {
      localStorage.removeItem(K.sess);
      cachedUser = null;
      profile = null;
      emit();
    }

    function restore() {
      seedAndMigrate();
      const key = read(K.sess, null);
      if (key && findUser(key)) apply(key);
    }

    async function submitPayment(data) {
      if (!cachedUser) throw new Error("Sila daftar atau log masuk terlebih dahulu.");
      const all = getUsers();
      const key = Object.keys(all).find(item => all[item].id === cachedUser.id);
      if (!key) throw new Error("Akaun pengguna tidak ditemui.");

      let receiptUrl = all[key].receipt_url || null;
      if (data.file) receiptUrl = await fileToDataUrl(data.file);
      Object.assign(all[key], {
        payment_reference: data.reference || "",
        payment_amount: data.amount || 30,
        payment_note: data.note || "",
        receipt_url: receiptUrl,
        payment_submitted_at: new Date().toISOString(),
        approval_status: "pending",
        access_level: "free",
        approval_notified: true
      });
      setUsers(all);
      apply(key);
    }

    async function listRegistrations() {
      seedAndMigrate();
      return Object.values(getUsers())
        .filter(user => user.role !== "admin")
        .map(({ password, ...safe }) => safe)
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    }

    async function reviewRegistration(id, nextStatus) {
      const all = getUsers();
      const key = Object.keys(all).find(k => all[k].id === id && all[k].role !== "admin");
      if (!key) throw new Error("Akaun pengguna tidak ditemui.");
      const user = all[key];
      user.approval_status = nextStatus;
      user.access_level = nextStatus === "approved" ? "premium" : "free";
      user.approval_notified = false;
      user.reviewed_at = new Date().toISOString();
      setUsers(all);
      if (cachedUser?.id === user.id) apply(key);
    }

    async function markNotificationRead() {
      if (!cachedUser) return;
      const all = getUsers();
      const key = Object.keys(all).find(k => all[k].id === cachedUser.id);
      if (!key) return;
      all[key].approval_notified = true;
      setUsers(all);
      apply(key);
    }

    window.addEventListener("storage", event => {
      if (!REAL && (event.key === K.users || event.key === K.sess)) {
        const key = read(K.sess, null);
        if (key) apply(key); else { cachedUser = null; profile = null; emit(); }
      }
    });

    return {
      signUp,
      signIn,
      signOut,
      restore,
      submitPayment,
      listRegistrations,
      approve: id => reviewRegistration(id, "approved"),
      reject: id => reviewRegistration(id, "rejected"),
      markNotificationRead
    };
  })();

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Gagal membaca fail resit."));
      reader.readAsDataURL(file);
    });
  }

  /* =========================================================
     MOD SUPABASE
     ========================================================= */
  function loadLib() {
    return new Promise((resolve, reject) => {
      if (window.supabase?.createClient) return resolve();
      const script = document.createElement("script");
      script.src = CDN;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Gagal memuat pustaka Supabase."));
      document.head.appendChild(script);
    });
  }

  async function loadProfile() {
    if (!client || !cachedUser) { profile = null; return; }
    const { data, error } = await client.from("profiles")
      .select("full_name, role, access_level, approval_status, approval_notified, created_at, reviewed_at")
      .eq("id", cachedUser.id).maybeSingle();
    if (error) throw error;
    profile = data || null;
  }

  const Real = {
    async signUp(email, password, fullName) {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName || "" } }
      });
      if (error) throw error;
      return data;
    },
    async signIn(identifier, password) {
      const login = String(identifier).trim().toLowerCase() === ADMIN_ID
        ? ADMIN_LOGIN_EMAIL
        : String(identifier).trim();
      if (!login.includes("@")) throw new Error("Sila log masuk menggunakan e-mel.");
      const { error } = await client.auth.signInWithPassword({ email: login, password });
      if (error) throw error;
    },
    async signOut() { await client.auth.signOut(); },
    async submitPayment(data) {
      if (!cachedUser) throw new Error("Sila daftar atau log masuk terlebih dahulu.");
      let receiptUrl = null;
      if (data.file) {
        const safeName = data.file.name.replace(/[^\w.\-]/g, "_");
        const path = `${cachedUser.id}/${Date.now()}-${safeName}`;
        const upload = await client.storage.from("receipts").upload(path, data.file, { upsert: true });
        if (upload.error) throw upload.error;
        receiptUrl = client.storage.from("receipts").getPublicUrl(path).data.publicUrl;
      }
      const { error } = await client.from("payment_requests").insert({
        user_id: cachedUser.id,
        full_name: profile?.full_name || null,
        email: cachedUser.email || null,
        amount: data.amount || 30,
        reference: data.reference || null,
        note: data.note || null,
        receipt_url: receiptUrl,
        status: "pending"
      });
      if (error) throw error;
    },
    async listRegistrations() {
      const { data, error } = await client.from("profiles")
        .select("id, full_name, email, approval_status, access_level, created_at, reviewed_at")
        .neq("role", "admin").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      const { data: payments, error: paymentError } = await client.from("payment_requests")
        .select("user_id, amount, reference, note, receipt_url, created_at, status")
        .order("created_at", { ascending: false }).limit(500);
      if (paymentError) throw paymentError;
      const latest = new Map();
      (payments || []).forEach(payment => {
        if (!latest.has(payment.user_id)) latest.set(payment.user_id, payment);
      });
      return (data || []).map(user => {
        const payment = latest.get(user.id);
        return payment ? {
          ...user,
          payment_reference: payment.reference,
          payment_amount: payment.amount,
          payment_note: payment.note,
          receipt_url: payment.receipt_url,
          payment_submitted_at: payment.created_at
        } : user;
      });
    },
    async approve(id) {
      const { error } = await client.rpc("approve_registration", { p_user: id });
      if (error) throw error;
    },
    async reject(id) {
      const { error } = await client.rpc("reject_registration", { p_user: id });
      if (error) throw error;
    },
    async markNotificationRead() {
      const { error } = await client.rpc("mark_approval_notification_read");
      if (error) throw error;
      await loadProfile();
      emit();
    }
  };

  async function init() {
    if (REAL) {
      if (client) return;
      await loadLib();
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data } = await client.auth.getSession();
      cachedUser = data?.session?.user || null;
      if (cachedUser) await loadProfile();
      client.auth.onAuthStateChange(async (_event, session) => {
        cachedUser = session?.user || null;
        profile = null;
        if (cachedUser) await loadProfile();
        emit();
      });
      emit();
    } else {
      Demo.restore();
      emit();
    }
  }

  const backend = () => REAL ? Real : Demo;

  window.pkskAuth = {
    init,
    state,
    configured: () => true,
    isDemo: () => !REAL,
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    async signUp(email, password, fullName) { await init(); return backend().signUp(email, password, fullName); },
    async signIn(identifier, password) { await init(); return backend().signIn(identifier, password); },
    async signOut() { await init(); return backend().signOut(); },
    async submitPayment(data) { await init(); return backend().submitPayment(data); },
    async listRegistrations() { await init(); return backend().listRegistrations(); },
    async approveRegistration(id) { await init(); return backend().approve(id); },
    async rejectRegistration(id) { await init(); return backend().reject(id); },
    async markApprovalNotificationRead() { await init(); return backend().markNotificationRead(); },
    // Alias lama dikekalkan supaya tiada kod terdahulu rosak secara tiba-tiba.
    async listPaymentRequests() { return this.listRegistrations(); },
    async approvePayment(id) { return this.approveRegistration(id); },
    async rejectPayment(id) { return this.rejectRegistration(id); },
    get client() { return client; }
  };

  init().catch(error => console.error("PKSK auth init:", error));
})();
