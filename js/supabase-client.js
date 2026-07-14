/* ========================================================================
 * Portal PKSK — Klien Supabase
 * ------------------------------------------------------------------------
 * LANGKAH KONFIGURASI (sekali sahaja):
 *   1. Buat projek di https://supabase.com (percuma).
 *   2. Jalankan supabase/setup.sql dalam SQL Editor projek itu.
 *   3. Salin "Project URL" dan "anon public key" dari
 *      Settings -> API, dan isikan di bawah.
 *
 * Nota keselamatan: anon key memang direka untuk didedahkan di frontend —
 * semua data dilindungi oleh Row Level Security (lihat setup.sql).
 * Portal kekal berfungsi sepenuhnya walaupun konfigurasi ini kosong.
 * ==================================================================== */

(function () {
  "use strict";

  // >>> ISI DUA NILAI INI SELEPAS MEMBUAT PROJEK SUPABASE <<<
  const SUPABASE_URL = "";      // cth: "https://abcdefgh.supabase.co"
  const SUPABASE_ANON_KEY = ""; // cth: "eyJhbGciOiJIUzI1NiIs..."

  const CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";

  let client = null;
  let profile = null; // { full_name, role, access_level } | null
  const listeners = new Set();

  const configured = () => !!(SUPABASE_URL && SUPABASE_ANON_KEY);

  function emit() {
    listeners.forEach(fn => { try { fn(state()); } catch (e) {} });
    document.dispatchEvent(new CustomEvent("pksk-auth-changed", { detail: state() }));
  }

  function state() {
    const user = client?.auth?.currentUser ?? null;
    return {
      configured: configured(),
      user: cachedUser,
      profile,
      // 'anon' | 'free' | 'premium' | 'admin'
      access: !cachedUser ? "anon"
        : profile?.role === "admin" ? "admin"
        : (profile?.access_level || "free")
    };
  }

  let cachedUser = null;

  // Muat pustaka supabase-js dari CDN hanya bila diperlukan.
  function loadLib() {
    return new Promise((resolve, reject) => {
      if (window.supabase?.createClient) return resolve();
      const s = document.createElement("script");
      s.src = CDN;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Gagal memuat pustaka Supabase (semak sambungan internet)."));
      document.head.appendChild(s);
    });
  }

  async function init() {
    if (!configured()) return state();
    if (client) return state();
    await loadLib();
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data } = await client.auth.getSession();
    cachedUser = data?.session?.user ?? null;
    if (cachedUser) await loadProfile();
    client.auth.onAuthStateChange(async (_evt, session) => {
      cachedUser = session?.user ?? null;
      profile = null;
      if (cachedUser) await loadProfile();
      emit();
    });
    emit();
    return state();
  }

  async function loadProfile() {
    if (!client || !cachedUser) { profile = null; return; }
    const { data } = await client
      .from("profiles")
      .select("full_name, role, access_level, is_active")
      .eq("id", cachedUser.id)
      .maybeSingle();
    profile = data || null;
  }

  async function signUp(email, password, fullName) {
    await init();
    if (!client) throw new Error("Supabase belum dikonfigurasi.");
    const { data, error } = await client.auth.signUp({
      email, password,
      options: { data: { full_name: fullName || "" } }
    });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    await init();
    if (!client) throw new Error("Supabase belum dikonfigurasi.");
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    if (client) await client.auth.signOut();
  }

  window.pkskAuth = {
    init, state, signUp, signIn, signOut,
    configured,
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    // Akses terus ke klien untuk keperluan lanjutan (muat soalan dari DB dll.)
    get client() { return client; }
  };
})();
