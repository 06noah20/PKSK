/* ========================================================================
 * Portal PKSK — lapisan pengurusan soalan oleh admin.
 * Demo: localStorage. Supabase: jadual question_overrides (JSON per subjek).
 * ==================================================================== */

(function () {
  "use strict";

  const STORE_KEY = "pksk_admin_question_overrides_v1";
  const SUBJECTS = {
    pengetahuan: "Pengetahuan Am",
    matematik: "Matematik",
    sains: "Sains",
    english: "English"
  };
  const BASE = JSON.parse(JSON.stringify(window.PKSK_SET_QUESTIONS || {}));
  let overrides = readLocal();

  function readLocal() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (_) { return {}; }
  }

  function writeLocal() {
    localStorage.setItem(STORE_KEY, JSON.stringify(overrides));
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeQuestion(raw) {
    const question = String(raw?.q || raw?.question || "").trim();
    const options = Array.isArray(raw?.options)
      ? raw.options.map(option => String(option).trim()).filter(Boolean)
      : [];
    const answer = Number(raw?.answer);
    if (!question) throw new Error("Teks soalan diperlukan.");
    if (options.length < 2) throw new Error("Sekurang-kurangnya dua pilihan jawapan diperlukan.");
    if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) {
      throw new Error("Indeks jawapan betul tidak sah.");
    }
    const result = {
      q: question,
      options,
      answer,
      explain: String(raw?.explain || raw?.explanation || "").trim()
    };
    if (raw?.fig) result.fig = String(raw.fig);
    return result;
  }

  function validateLocation(setNo, subject) {
    const number = Number(setNo);
    if (!Number.isInteger(number) || number < 1 || number > 10) throw new Error("Set latihan tidak sah.");
    if (!SUBJECTS[subject]) throw new Error("Subjek tidak sah.");
    return number;
  }

  function applyOverrides() {
    window.PKSK_SET_QUESTIONS = window.PKSK_SET_QUESTIONS || {};
    Object.entries(overrides).forEach(([setNo, subjects]) => {
      window.PKSK_SET_QUESTIONS[setNo] = window.PKSK_SET_QUESTIONS[setNo] || {};
      Object.entries(subjects || {}).forEach(([subject, questions]) => {
        if (SUBJECTS[subject] && Array.isArray(questions)) {
          window.PKSK_SET_QUESTIONS[setNo][subject] = clone(questions);
        }
      });
    });
    window.PKSK_APPLY_LOCAL_SCIENCE_SET4_IMAGES?.();
    window.PKSK_APPLY_LOCAL_SCIENCE_SET5_IMAGES?.();
    window.PKSK_APPLY_LOCAL_SCIENCE_SET6_IMAGES?.();
    window.PKSK_APPLY_LOCAL_SCIENCE_SET7_IMAGES?.();
    window.PKSK_APPLY_LOCAL_SCIENCE_SET8_IMAGES?.();
    window.PKSK_APPLY_LOCAL_SCIENCE_SET9_IMAGES?.();
    window.PKSK_APPLY_LOCAL_SCIENCE_SET10_IMAGES?.();
  }

  function notify() {
    document.dispatchEvent(new CustomEvent("pksk-questions-changed"));
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Gagal membaca gambar rajah."));
      reader.readAsDataURL(file);
    });
  }

  async function uploadImage(file) {
    if (!file) return null;
    if (!/^image\/(png|jpeg|webp|gif)$/i.test(file.type || "")) {
      throw new Error("Gambar mesti berformat PNG, JPG, WebP atau GIF.");
    }
    if (file.size > 3 * 1024 * 1024) throw new Error("Saiz gambar melebihi 3 MB.");

    await window.pkskAuth?.init?.();
    const client = window.pkskAuth?.client;
    if (!client || window.pkskAuth.isDemo()) return fileToDataUrl(file);

    const userId = window.pkskAuth.state().user?.id;
    if (!userId) throw new Error("Sila log masuk sebagai admin.");
    const safeName = String(file.name || "rajah.png").replace(/[^\w.\-]/g, "_");
    const path = `${userId}/${Date.now()}-${safeName}`;
    const upload = await client.storage.from("question-images").upload(path, file, { upsert: false });
    if (upload.error) throw upload.error;
    return client.storage.from("question-images").getPublicUrl(path).data.publicUrl;
  }

  async function persistSubject(setNo, subject, questions) {
    const number = validateLocation(setNo, subject);
    const normalized = questions.map(normalizeQuestion);
    overrides[number] = overrides[number] || {};
    overrides[number][subject] = normalized;
    writeLocal();
    applyOverrides();
    notify();

    await window.pkskAuth?.init?.();
    const client = window.pkskAuth?.client;
    if (client && !window.pkskAuth.isDemo()) {
      const { error } = await client.from("question_overrides").upsert({
        set_number: number,
        subject,
        questions: normalized,
        updated_by: window.pkskAuth.state().user?.id || null,
        updated_at: new Date().toISOString()
      }, { onConflict: "set_number,subject" });
      if (error) throw error;
    }
    return clone(normalized);
  }

  function getQuestions(setNo, subject) {
    const number = validateLocation(setNo, subject);
    return clone(window.PKSK_SET_QUESTIONS?.[number]?.[subject] || []);
  }

  async function saveQuestion(setNo, subject, index, raw) {
    const questions = getQuestions(setNo, subject);
    const normalized = normalizeQuestion(raw);
    if (index == null || index === "" || Number(index) < 0) questions.push(normalized);
    else {
      const position = Number(index);
      if (!questions[position]) throw new Error("Soalan untuk dikemas kini tidak ditemui.");
      questions[position] = normalized;
    }
    return persistSubject(setNo, subject, questions);
  }

  async function deleteQuestion(setNo, subject, index) {
    const questions = getQuestions(setNo, subject);
    const position = Number(index);
    if (!questions[position]) throw new Error("Soalan untuk dipadam tidak ditemui.");
    questions.splice(position, 1);
    return persistSubject(setNo, subject, questions);
  }

  async function importQuestions(setNo, subject, text) {
    let parsed;
    try { parsed = JSON.parse(text); }
    catch (_) { throw new Error("Fail JSON tidak sah."); }
    const list = Array.isArray(parsed) ? parsed : parsed?.questions;
    if (!Array.isArray(list) || !list.length) throw new Error("Fail mesti mengandungi senarai soalan yang tidak kosong.");
    return persistSubject(setNo, subject, list);
  }

  function exportQuestions(setNo, subject) {
    return JSON.stringify({
      set: Number(setNo),
      subject,
      questions: getQuestions(setNo, subject)
    }, null, 2);
  }

  async function resetSubject(setNo, subject) {
    const number = validateLocation(setNo, subject);
    if (overrides[number]) {
      delete overrides[number][subject];
      if (!Object.keys(overrides[number]).length) delete overrides[number];
    }
    const original = clone(BASE?.[number]?.[subject] || []);
    window.PKSK_SET_QUESTIONS[number] = window.PKSK_SET_QUESTIONS[number] || {};
    window.PKSK_SET_QUESTIONS[number][subject] = original;
    writeLocal();
    notify();

    await window.pkskAuth?.init?.();
    const client = window.pkskAuth?.client;
    if (client && !window.pkskAuth.isDemo()) {
      const { error } = await client.from("question_overrides")
        .delete().eq("set_number", number).eq("subject", subject);
      if (error) throw error;
    }
    return original;
  }

  async function loadRemote() {
    await window.pkskAuth?.init?.();
    const client = window.pkskAuth?.client;
    if (!client || window.pkskAuth.isDemo()) return;
    const { data, error } = await client.from("question_overrides")
      .select("set_number, subject, questions");
    if (error) throw error;
    (data || []).forEach(row => {
      if (!SUBJECTS[row.subject] || !Array.isArray(row.questions)) return;
      overrides[row.set_number] = overrides[row.set_number] || {};
      overrides[row.set_number][row.subject] = row.questions.map(normalizeQuestion);
    });
    writeLocal();
    applyOverrides();
    notify();
  }

  applyOverrides();
  const ready = loadRemote().catch(error => console.error("PKSK question overrides:", error));

  /* =========================================================
     RUANG "MINDA SANTAI" (poster laman utama)
     Disimpan sebagai satu baris notes (subject = 'minda-santai'),
     imej dalam bentuk data URL WebP — sama seperti poster artikel.
     ========================================================= */
  const POSTER_LOCAL_KEY = "pksk_minda_santai_poster_v1";

  function optimizePoster(file) {
    if (!file) return Promise.resolve("");
    if (!/^image\/(?:png|jpeg|webp)$/i.test(file.type || "")) {
      throw new Error("Poster mesti dalam format PNG, JPG atau WebP.");
    }
    if (file.size > 8 * 1024 * 1024) throw new Error("Saiz poster melebihi 8 MB.");
    return new Promise((resolve, reject) => {
      const image = new Image();
      const url = URL.createObjectURL(file);
      image.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/webp", .85));
      };
      image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Poster tidak dapat dibaca.")); };
      image.src = url;
    });
  }

  function posterChanged() {
    document.dispatchEvent(new CustomEvent("pksk-poster-changed"));
  }

  async function getPoster() {
    await window.pkskAuth?.init?.();
    const client = window.pkskAuth?.client;
    if (!client || window.pkskAuth.isDemo()) {
      try { return localStorage.getItem(POSTER_LOCAL_KEY) || null; } catch (_) { return null; }
    }
    const { data, error } = await client.from("notes")
      .select("id, image_url, created_at")
      .eq("subject", "minda-santai")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw error;
    return data?.[0]?.image_url || null;
  }

  async function savePoster(file) {
    const dataUrl = await optimizePoster(file);
    await window.pkskAuth?.init?.();
    const client = window.pkskAuth?.client;
    if (!client || window.pkskAuth.isDemo()) {
      try { localStorage.setItem(POSTER_LOCAL_KEY, dataUrl); } catch (_) {}
      posterChanged();
      return dataUrl;
    }
    const existing = await client.from("notes").select("id").eq("subject", "minda-santai").limit(1);
    const payload = {
      subject: "minda-santai",
      title: "Minda Santai",
      content: JSON.stringify({ type: "minda-santai", updatedAt: new Date().toISOString() }),
      image_url: dataUrl,
      access_level: "free",
      is_published: true
    };
    const query = existing.data?.[0]?.id
      ? client.from("notes").update(payload).eq("id", existing.data[0].id)
      : client.from("notes").insert(payload);
    const { error } = await query;
    if (error) throw error;
    posterChanged();
    return dataUrl;
  }

  async function removePoster() {
    await window.pkskAuth?.init?.();
    const client = window.pkskAuth?.client;
    if (!client || window.pkskAuth.isDemo()) {
      try { localStorage.removeItem(POSTER_LOCAL_KEY); } catch (_) {}
      posterChanged();
      return;
    }
    const { error } = await client.from("notes").delete().eq("subject", "minda-santai");
    if (error) throw error;
    posterChanged();
  }

  window.pkskPoster = { get: getPoster, save: savePoster, remove: removePoster };

  window.pkskQuestionAdmin = {
    subjects: SUBJECTS,
    ready,
    getQuestions,
    uploadImage,
    saveQuestion,
    deleteQuestion,
    importQuestions,
    exportQuestions,
    resetSubject
  };
})();
