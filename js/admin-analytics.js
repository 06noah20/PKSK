/* ========================================================================
 * Portal PKSK — Analitik Pelawat untuk Panel Admin.
 * Data pelawat datang melalui Edge Function GA4; statistik akaun melalui
 * Supabase dengan RLS admin sedia ada.
 * ==================================================================== */

(function () {
  "use strict";

  const numberFormatter = new Intl.NumberFormat("ms-MY");
  const VISITOR_METRICS = [
    ["today", "Pelawat hari ini", "Hari semasa"],
    ["last7Days", "Pelawat 7 hari terakhir", "7 hari termasuk hari ini"],
    ["currentMonth", "Pelawat bulan ini", "Bulan kalendar semasa"],
    ["totalVisitors", "Jumlah keseluruhan pelawat", "Sejak data GA4 direkodkan"],
    ["uniqueVisitors", "Pelawat unik", "Dalam tempoh dipilih"],
    ["sessions", "Jumlah sesi", "Dalam tempoh dipilih"],
    ["pageViews", "Jumlah paparan halaman", "Dalam tempoh dipilih"]
  ];
  const USER_METRICS = [
    ["total", "Jumlah pengguna berdaftar"],
    ["free", "Pengguna free"],
    ["premium", "Pengguna premium"],
    ["active", "Pengguna aktif"],
    ["today", "Pendaftaran baharu hari ini"],
    ["month", "Pendaftaran baharu bulan ini"]
  ];

  const escapeHtml = value => String(value == null ? "" : value).replace(/[&<>"']/g, char =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

  function emptyGa(message, status = "unconfigured") {
    return {
      configured: false,
      status,
      message: message || "Google Analytics 4 belum dikonfigurasi.",
      updatedAt: null,
      metrics: {},
      trend: [],
      topPages: [],
      trafficSources: [],
      devices: [],
      countries: []
    };
  }

  function formatNumber(value) {
    return Number.isFinite(Number(value)) ? numberFormatter.format(Number(value)) : "—";
  }

  function startOfToday() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  async function loadSupabaseStats() {
    const auth = window.pkskAuth;
    await auth?.init?.();
    if (auth?.state?.().access !== "admin") throw new Error("Akses pentadbir diperlukan.");

    if (auth.isDemo()) {
      const records = await auth.listRegistrations();
      const today = startOfToday();
      const month = new Date(today.getFullYear(), today.getMonth(), 1);
      const created = record => new Date(record.created_at || 0);
      return {
        total: records.length,
        free: records.filter(record => record.access_level !== "premium").length,
        premium: records.filter(record => record.access_level === "premium").length,
        active: records.filter(record => record.approval_status !== "rejected").length,
        today: records.filter(record => created(record) >= today).length,
        month: records.filter(record => created(record) >= month).length
      };
    }

    const client = auth.client;
    if (!client) throw new Error("Sambungan Supabase tidak tersedia.");
    const base = () => client.from("profiles")
      .select("id", { count: "exact", head: true })
      .neq("role", "admin");
    const today = startOfToday();
    const month = new Date(today.getFullYear(), today.getMonth(), 1);
    const results = await Promise.all([
      base(),
      base().eq("access_level", "free"),
      base().eq("access_level", "premium"),
      base().eq("is_active", true),
      base().gte("created_at", today.toISOString()),
      base().gte("created_at", month.toISOString())
    ]);

    const requiredError = [results[0], results[1], results[2], results[4], results[5]]
      .find(result => result.error)?.error;
    if (requiredError) throw requiredError;

    let activeResult = results[3];
    if (activeResult.error) activeResult = await base().neq("approval_status", "rejected");
    if (activeResult.error) throw activeResult.error;
    return {
      total: results[0].count || 0,
      free: results[1].count || 0,
      premium: results[2].count || 0,
      active: activeResult.count || 0,
      today: results[4].count || 0,
      month: results[5].count || 0
    };
  }

  function normalizeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  async function loadGaAnalytics(rangeDays) {
    const auth = window.pkskAuth;
    if (auth?.state?.().access !== "admin") throw new Error("Akses pentadbir diperlukan.");
    if (auth.isDemo()) {
      return emptyGa("Mod demonstrasi tidak disambungkan kepada Google Analytics 4.");
    }
    try {
      const { data, error } = await auth.client.functions.invoke("ga4-analytics", {
        body: { rangeDays }
      });
      if (error) {
        console.warn("PKSK GA4:", error);
        return emptyGa("Google Analytics 4 belum disambungkan kepada Edge Function portal.");
      }
      if (!data?.configured) return emptyGa(data?.message, data?.status || "unconfigured");
      return {
        configured: true,
        status: "ready",
        message: "",
        updatedAt: data.updatedAt || new Date().toISOString(),
        metrics: data.metrics || {},
        trend: normalizeArray(data.trend),
        topPages: normalizeArray(data.topPages),
        trafficSources: normalizeArray(data.trafficSources),
        devices: normalizeArray(data.devices),
        countries: normalizeArray(data.countries)
      };
    } catch (error) {
      console.warn("PKSK GA4:", error);
      return emptyGa("Data Google Analytics 4 tidak dapat dimuatkan buat masa ini.", "error");
    }
  }

  function metricCards(definitions, values, loading, kind) {
    return definitions.map(([key, label, note], index) => `
      <article class="analytics-stat-card ${loading ? "is-loading" : ""}">
        <span class="analytics-stat-index" aria-hidden="true">${kind === "visitor" ? "A" : "P"}${index + 1}</span>
        <div>
          <span>${escapeHtml(label)}</span>
          <strong>${loading ? '<i class="analytics-skeleton"></i>' : formatNumber(values?.[key])}</strong>
          ${note ? `<small>${escapeHtml(note)}</small>` : ""}
        </div>
      </article>`).join("");
  }

  function parseTrendDate(value) {
    const text = String(value || "");
    const normalized = /^\d{8}$/.test(text)
      ? `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`
      : text.slice(0, 10);
    const date = new Date(`${normalized}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function localDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function aggregateTrend(rows, mode) {
    const groups = new Map();
    rows.forEach(row => {
      const date = parseTrendDate(row.date);
      if (!date) return;
      let key;
      if (mode === "weekly") {
        const monday = new Date(date);
        monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
        key = localDateKey(monday);
      } else if (mode === "monthly") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
      } else {
        key = localDateKey(date);
      }
      groups.set(key, (groups.get(key) || 0) + Number(row.value || 0));
    });
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }));
  }

  function chartLabel(value, mode) {
    const date = parseTrendDate(value);
    if (!date) return value;
    if (mode === "monthly") return date.toLocaleDateString("ms-MY", { month: "short", year: "2-digit" });
    if (mode === "weekly") return `Minggu ${date.toLocaleDateString("ms-MY", { day: "numeric", month: "short" })}`;
    return date.toLocaleDateString("ms-MY", { day: "numeric", month: "short" });
  }

  function renderChart(target, rows, mode, configured) {
    if (!configured || !rows.length) {
      target.innerHTML = `<div class="analytics-empty-state">
        <strong>Belum ada data carta</strong>
        <span>${configured ? "GA4 belum merekodkan lawatan untuk tempoh ini." : "Sambungkan GA4 untuk memaparkan trend lawatan."}</span>
      </div>`;
      return;
    }
    const data = aggregateTrend(rows, mode);
    if (!data.length || !data.some(item => item.value > 0)) {
      target.innerHTML = '<div class="analytics-empty-state"><strong>Tiada lawatan direkodkan</strong><span>Cuba pilih tempoh yang lebih panjang.</span></div>';
      return;
    }

    const width = 860;
    const height = 280;
    const pad = { left: 54, right: 20, top: 24, bottom: 48 };
    const plotWidth = width - pad.left - pad.right;
    const plotHeight = height - pad.top - pad.bottom;
    const maximum = Math.max(...data.map(item => item.value), 1);
    const x = index => data.length === 1 ? pad.left + plotWidth / 2 : pad.left + (index * plotWidth / (data.length - 1));
    const y = value => pad.top + plotHeight - (value / maximum * plotHeight);
    const points = data.map((item, index) => `${x(index).toFixed(1)},${y(item.value).toFixed(1)}`).join(" ");
    const area = `${pad.left},${pad.top + plotHeight} ${points} ${pad.left + plotWidth},${pad.top + plotHeight}`;
    const grid = [0, .25, .5, .75, 1].map(fraction => {
      const lineY = pad.top + plotHeight - (fraction * plotHeight);
      return `<line x1="${pad.left}" y1="${lineY}" x2="${pad.left + plotWidth}" y2="${lineY}"></line>
        <text x="${pad.left - 10}" y="${lineY + 4}" text-anchor="end">${formatNumber(Math.round(maximum * fraction))}</text>`;
    }).join("");
    const labelStep = Math.max(1, Math.ceil(data.length / 7));
    const labels = data.map((item, index) => index % labelStep === 0 || index === data.length - 1
      ? `<text x="${x(index)}" y="${height - 17}" text-anchor="middle">${escapeHtml(chartLabel(item.date, mode))}</text>` : "").join("");
    const dots = data.map((item, index) => `<circle cx="${x(index)}" cy="${y(item.value)}" r="4">
      <title>${escapeHtml(chartLabel(item.date, mode))}: ${formatNumber(item.value)} sesi</title></circle>`).join("");
    target.innerHTML = `<svg class="analytics-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Carta sesi lawatan ${escapeHtml(mode)}">
      <g class="analytics-chart-grid">${grid}${labels}</g>
      <polygon class="analytics-chart-area" points="${area}"></polygon>
      <polyline class="analytics-chart-line" points="${points}"></polyline>
      <g class="analytics-chart-points">${dots}</g>
    </svg>`;
  }

  function rankedList(items, labelKey, valueKey, emptyText) {
    if (!items.length) return `<div class="analytics-list-empty">${escapeHtml(emptyText)}</div>`;
    const maximum = Math.max(...items.map(item => Number(item[valueKey] || 0)), 1);
    return items.map((item, index) => {
      const value = Number(item[valueKey] || 0);
      return `<div class="analytics-rank-row">
        <span class="analytics-rank-number">${index + 1}</span>
        <div><strong>${escapeHtml(item[labelKey] || "Tidak diketahui")}</strong>
          ${item.path ? `<small>${escapeHtml(item.path)}</small>` : ""}
          <i><b style="width:${Math.max(4, value / maximum * 100).toFixed(1)}%"></b></i>
        </div>
        <span>${formatNumber(value)}</span>
      </div>`;
    }).join("");
  }

  function formatUpdatedAt(value) {
    if (!value) return "Belum dikemas kini";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Belum dikemas kini";
    return date.toLocaleString("ms-MY", { dateStyle: "medium", timeStyle: "short" });
  }

  async function render(host) {
    const auth = window.pkskAuth;
    await auth?.init?.();
    if (auth?.state?.().access !== "admin") {
      host.innerHTML = '<div class="analytics-denied"><strong>Akses ditolak</strong><span>Analitik Pelawat hanya tersedia kepada pentadbir.</span></div>';
      return;
    }

    let rangeDays = 30;
    let chartMode = "daily";
    let gaData = emptyGa();
    let gaLoading = true;
    let userLoading = true;
    let userStats = null;

    host.innerHTML = `
      <div class="analytics-toolbar">
        <div><span class="analytics-eyebrow">Pusat Data Portal</span><strong>Analitik Pelawat</strong>
          <small>Ringkasan GA4 dan statistik akaun Supabase tanpa data peribadi.</small></div>
        <div class="analytics-periods" role="group" aria-label="Pilih tempoh analitik">
          <button type="button" data-range="7">7 hari</button>
          <button type="button" class="active" data-range="30">30 hari</button>
          <button type="button" data-range="90">90 hari</button>
        </div>
      </div>
      <div class="analytics-source-notice" id="analyticsGaNotice" role="status"></div>

      <section class="analytics-section" aria-labelledby="analyticsVisitorTitle">
        <div class="analytics-section-head"><div><span>Google Analytics 4</span><h2 id="analyticsVisitorTitle">Statistik pelawat</h2></div>
          <span class="analytics-source-badge" id="analyticsGaBadge">Memuatkan…</span></div>
        <div class="analytics-stat-grid analytics-stat-grid-visitor" id="analyticsVisitorCards"></div>
      </section>

      <section class="analytics-section" aria-labelledby="analyticsUserTitle">
        <div class="analytics-section-head"><div><span>Supabase</span><h2 id="analyticsUserTitle">Statistik pengguna dalaman</h2></div>
          <span class="analytics-source-badge is-live">Data akaun</span></div>
        <div class="analytics-inline-status" id="analyticsUserStatus" hidden></div>
        <div class="analytics-stat-grid" id="analyticsUserCards"></div>
      </section>

      <section class="analytics-chart-card" aria-labelledby="analyticsChartTitle">
        <div class="analytics-chart-head"><div><span>Trend lawatan</span><h2 id="analyticsChartTitle">Carta sesi pelawat</h2></div>
          <div class="analytics-chart-modes" role="group" aria-label="Jenis carta">
            <button type="button" class="active" data-chart-mode="daily">Harian</button>
            <button type="button" data-chart-mode="weekly">Mingguan</button>
            <button type="button" data-chart-mode="monthly">Bulanan</button>
          </div></div>
        <div class="analytics-chart" id="analyticsChart"></div>
      </section>

      <div class="analytics-detail-grid">
        <section class="analytics-list-card"><div><span>Kandungan</span><h2>Lima halaman teratas</h2></div><div id="analyticsTopPages"></div></section>
        <section class="analytics-list-card"><div><span>Pemerolehan</span><h2>Sumber trafik</h2></div><div id="analyticsSources"></div></section>
        <section class="analytics-list-card"><div><span>Teknologi</span><h2>Jenis peranti</h2></div><div id="analyticsDevices"></div></section>
        <section class="analytics-list-card"><div><span>Lokasi umum</span><h2>Negara pelawat</h2></div><div id="analyticsCountries"></div></section>
      </div>
      <footer class="analytics-updated"><span class="analytics-update-dot"></span>
        Masa data terakhir dikemas kini: <strong id="analyticsUpdatedAt">Belum dikemas kini</strong></footer>`;

    const visitorCards = host.querySelector("#analyticsVisitorCards");
    const userCards = host.querySelector("#analyticsUserCards");
    const userStatus = host.querySelector("#analyticsUserStatus");
    const notice = host.querySelector("#analyticsGaNotice");
    const badge = host.querySelector("#analyticsGaBadge");
    const chart = host.querySelector("#analyticsChart");

    function drawGa() {
      visitorCards.innerHTML = metricCards(VISITOR_METRICS, gaData.metrics, gaLoading, "visitor");
      badge.textContent = gaLoading ? "Memuatkan…" : gaData.configured ? "GA4 disambungkan" : "GA4 belum disambungkan";
      badge.className = `analytics-source-badge ${gaData.configured ? "is-live" : "is-empty"}`;
      notice.hidden = gaLoading || gaData.configured;
      notice.className = `analytics-source-notice ${gaData.status === "error" ? "is-error" : "is-empty"}`;
      notice.innerHTML = gaLoading || gaData.configured ? "" : `<div><strong>Data pelawat belum tersedia</strong>
        <span>${escapeHtml(gaData.message)} Paparan ini tidak menggunakan data rekaan.</span></div>
        <button type="button" id="analyticsGaRetry">Cuba semula</button>`;
      notice.querySelector("#analyticsGaRetry")?.addEventListener("click", refreshGa);
      renderChart(chart, gaData.trend, chartMode, gaData.configured);
      host.querySelector("#analyticsTopPages").innerHTML = rankedList(gaData.topPages, "title", "pageViews", "Belum ada data halaman.");
      host.querySelector("#analyticsSources").innerHTML = rankedList(gaData.trafficSources, "label", "sessions", "Belum ada data sumber trafik.");
      host.querySelector("#analyticsDevices").innerHTML = rankedList(gaData.devices, "label", "visitors", "Belum ada data peranti.");
      host.querySelector("#analyticsCountries").innerHTML = rankedList(gaData.countries, "label", "visitors", "Belum ada data lokasi.");
      host.querySelector("#analyticsUpdatedAt").textContent = formatUpdatedAt(gaData.updatedAt);
    }

    function drawUsers() {
      userCards.innerHTML = metricCards(USER_METRICS, userStats, userLoading, "user");
    }

    async function refreshGa() {
      gaLoading = true;
      drawGa();
      gaData = await loadGaAnalytics(rangeDays);
      if (!host.isConnected || auth.state().access !== "admin") return;
      gaLoading = false;
      drawGa();
    }

    async function refreshUsers() {
      userLoading = true;
      userStatus.hidden = true;
      drawUsers();
      try {
        userStats = await loadSupabaseStats();
      } catch (error) {
        console.warn("PKSK Supabase analytics:", error);
        userStats = {};
        userStatus.hidden = false;
        userStatus.innerHTML = '<span>Statistik pengguna tidak dapat dimuatkan.</span><button type="button">Cuba semula</button>';
        userStatus.querySelector("button").addEventListener("click", refreshUsers);
      } finally {
        if (host.isConnected && auth.state().access === "admin") {
          userLoading = false;
          drawUsers();
        }
      }
    }

    host.querySelectorAll("[data-range]").forEach(button => button.addEventListener("click", () => {
      const next = Number(button.dataset.range);
      if (next === rangeDays) return;
      rangeDays = next;
      host.querySelectorAll("[data-range]").forEach(item => item.classList.toggle("active", item === button));
      refreshGa();
    }));
    host.querySelectorAll("[data-chart-mode]").forEach(button => button.addEventListener("click", () => {
      chartMode = button.dataset.chartMode;
      host.querySelectorAll("[data-chart-mode]").forEach(item => item.classList.toggle("active", item === button));
      renderChart(chart, gaData.trend, chartMode, gaData.configured);
    }));

    drawGa();
    drawUsers();
    await Promise.all([refreshGa(), refreshUsers()]);
  }

  window.pkskAdminAnalytics = { render };
})();
