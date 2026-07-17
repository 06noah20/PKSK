const fs = require("fs");
const vm = require("vm");

const values = new Map();
global.localStorage = {
  getItem: key => values.has(key) ? values.get(key) : null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: key => values.delete(key),
  clear: () => values.clear()
};
global.window = global;
global.window.addEventListener = () => {};
global.document = { dispatchEvent: () => {}, head: { appendChild: () => {} } };
global.CustomEvent = class CustomEvent { constructor(type, options) { this.type = type; this.detail = options?.detail; } };
global.FileReader = class FileReader {
  readAsDataURL(file) {
    this.result = `data:${file.type};base64,dGVzdA==`;
    this.onload();
  }
};
global.window.PKSK_SET_QUESTIONS = {
  1: { pengetahuan: [{ q: "Soalan asal", options: ["A", "B", "C", "D"], answer: 0, explain: "" }] }
};

const authSource = fs.readFileSync("js/supabase-client.js", "utf8")
  .replace(/const SUPABASE_URL = "[^"]*";/, 'const SUPABASE_URL = "";')
  .replace(/const SUPABASE_ANON_KEY = "[^"]*";/, 'const SUPABASE_ANON_KEY = "";');
vm.runInThisContext(authSource, { filename: "js/supabase-client.js" });
vm.runInThisContext(fs.readFileSync("js/admin-questions.js", "utf8"), { filename: "js/admin-questions.js" });

(async () => {
  await window.pkskAuth.init();

  await window.pkskAuth.signUp("ujian@example.com", "rahsia123", "Pengguna Ujian");
  let state = window.pkskAuth.state();
  if (state.access !== "free" || state.approval !== "pending") {
    throw new Error("Akaun baharu bukan dalam status menunggu");
  }
  await window.pkskAuth.submitPayment({
    reference: "REF-001",
    amount: 30,
    note: "Ujian pembayaran",
    file: { type: "image/png" }
  });

  await window.pkskAuth.signOut();
  await window.pkskAuth.signIn("pkskmy", "pkskmy@2026");
  state = window.pkskAuth.state();
  if (state.access !== "admin") throw new Error("Akaun pkskmy bukan admin");

  const registrations = await window.pkskAuth.listRegistrations();
  const user = registrations.find(item => item.email === "ujian@example.com");
  if (!user || user.approval_status !== "pending") throw new Error("Pendaftaran tidak muncul pada panel admin");
  if (user.payment_reference !== "REF-001" || !user.receipt_url) throw new Error("Bukti pembayaran tidak disimpan");
  await window.pkskAuth.approveRegistration(user.id);

  await window.pkskAuth.signOut();
  await window.pkskAuth.signIn("ujian@example.com", "rahsia123");
  state = window.pkskAuth.state();
  if (state.access !== "premium" || state.approval !== "approved") {
    throw new Error("Akses pengguna tidak dibuka selepas kelulusan");
  }
  if (!state.notification?.unread) throw new Error("Notifikasi kelulusan tidak diwujudkan");

  await window.pkskAuth.markApprovalNotificationRead();
  if (window.pkskAuth.state().notification) throw new Error("Notifikasi tidak boleh ditandakan sudah dibaca");

  const uploadedImage = await window.pkskQuestionAdmin.uploadImage({
    type: "image/png", size: 100, name: "rajah.png"
  });
  await window.pkskQuestionAdmin.saveQuestion(1, "pengetahuan", null, {
    q: "Soalan baharu admin",
    options: ["A", "B", "C", "D"],
    answer: 2,
    explain: "Jawapan C",
    fig: `<img src="${uploadedImage}" alt="Rajah soalan">`
  });
  const managed = window.pkskQuestionAdmin.getQuestions(1, "pengetahuan");
  if (managed.length !== 2 || managed[1].q !== "Soalan baharu admin" || !managed[1].fig.includes("data:image/png")) {
    throw new Error("Pengurusan soalan admin gagal menyimpan soalan");
  }

  console.log(JSON.stringify({
    pendingAccount: true,
    paymentReceipt: true,
    fixedAdminAccount: true,
    adminApproval: true,
    approvalNotification: true,
    premiumAccessAfterApproval: true,
    adminQuestionManagement: true,
    questionImageUpload: true
  }));
})().catch(error => {
  console.error(error);
  process.exit(1);
});
