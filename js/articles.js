/* ========================================================================
 * Portal PKSK — Bicara Ilmu: senarai artikel dan pemapar Markdown.
 * ==================================================================== */

(function () {
  "use strict";

  const BUILTIN_ARTICLES = [
    {
      slug: "5-sistem-pendidikan-terbaik-dunia",
      title: "Lima Gergasi Pendidikan Dunia: Sistem yang Membentuk Generasi Masa Depan",
      excerpt: "Perbandingan mendalam sistem pendidikan Finland, Singapura, Jepun, Korea Selatan dan Estonia serta pengajaran yang boleh dimanfaatkan.",
      category: "Pendidikan Dunia",
      author: "Editorial PKSKMY",
      date: "19 Julai 2026",
      readTime: "12 minit bacaan",
      image: "assets/articles/5-sistem-pendidikan-terbaik-dunia.png",
      source: "articles/artikel-5-sistem-pendidikan-terbaik-dunia.md",
      builtin: true,
      published: true
    },
    {
      slug: "tahap-penguasaan-pbd",
      title: "Di Sebalik Angka 1 hingga 6: Menilai Semula Tafsiran Tahap Penguasaan dalam PBD",
      excerpt: "Tinjauan kritis terhadap tafsiran TP1 hingga TP6 — kekuatan, kelemahan dan cadangan untuk pentaksiran yang lebih adil.",
      category: "Pentaksiran & PBD",
      author: "Editorial PKSKMY",
      date: "18 Julai 2026",
      readTime: "8 minit bacaan",
      image: "assets/articles/tahap-penguasaan-pbd.png",
      source: "articles/artikel-tahap-penguasaan-pbd.md",
      builtin: true,
      published: true
    }
  ];

  const articleCache = new Map();
  const MANAGED_KEY = "pksk_managed_articles_v1";
  let ARTICLES = BUILTIN_ARTICLES.map(article => ({ ...article }));
  let managedRows = [];
  let activeLightbox = null;

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, char =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function readDemoRows() {
    try {
      const rows = JSON.parse(localStorage.getItem(MANAGED_KEY));
      return Array.isArray(rows) ? rows : [];
    } catch (_) { return []; }
  }

  function writeDemoRows(rows) {
    localStorage.setItem(MANAGED_KEY, JSON.stringify(rows));
  }

  function parseManagedRow(row) {
    try {
      const meta = JSON.parse(row.content || "{}");
      if (!meta.slug || !meta.markdown) return null;
      return {
        id: row.id,
        slug: String(meta.slug),
        title: String(row.title || meta.title || "Artikel"),
        excerpt: String(meta.excerpt || ""),
        category: String(meta.category || "Pendidikan"),
        author: String(meta.author || "Editorial PKSKMY"),
        date: String(meta.date || ""),
        readTime: String(meta.readTime || ""),
        image: String(row.image_url || meta.image || ""),
        markdown: String(meta.markdown || ""),
        published: meta.published !== false,
        managed: true,
        createdAt: row.created_at || meta.createdAt || ""
      };
    } catch (_) { return null; }
  }

  function rebuildArticles() {
    const overrides = new Map(managedRows.map(article => [article.slug, article]));
    const managed = managedRows
      .filter(article => article.published)
      .slice()
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    const builtins = BUILTIN_ARTICLES
      .filter(article => !overrides.has(article.slug))
      .map(article => ({ ...article }));
    ARTICLES = [...managed, ...builtins];
  }

  async function refreshManagedArticles() {
    await window.pkskAuth?.init?.();
    if (window.pkskAuth?.isDemo?.()) {
      managedRows = readDemoRows().map(parseManagedRow).filter(Boolean);
    } else {
      const client = window.pkskAuth?.client;
      if (!client) throw new Error("Sambungan pangkalan data tidak tersedia.");
      const { data, error } = await client.from("notes")
        .select("id, title, content, image_url, created_at")
        .eq("subject", "bicara-ilmu")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      managedRows = (data || []).map(parseManagedRow).filter(Boolean);
    }
    articleCache.clear();
    rebuildArticles();
    return ARTICLES.slice();
  }

  const articlesReady = refreshManagedArticles().catch(error => {
    console.error("PKSK managed articles:", error);
    rebuildArticles();
    return ARTICLES.slice();
  });

  function slugify(value) {
    return String(value || "")
      .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "").slice(0, 90);
  }

  function defaultDate() {
    return new Date().toLocaleDateString("ms-MY", { day: "numeric", month: "long", year: "numeric" });
  }

  function estimateReadTime(markdown) {
    const words = String(markdown || "").trim().split(/\s+/).filter(Boolean).length;
    return `${Math.max(1, Math.ceil(words / 200))} minit bacaan`;
  }

  function deriveExcerpt(markdown) {
    return String(markdown || "")
      .replace(/^#{1,6}\s+.*$/gm, "")
      .replace(/[*_>`#\[\]()!-]/g, " ")
      .replace(/\s+/g, " ").trim().slice(0, 210);
  }

  function optimizePoster(file) {
    if (!file) return Promise.resolve("");
    if (!/^image\/(?:png|jpeg|webp)$/i.test(file.type)) throw new Error("Poster mesti dalam format PNG, JPG atau WebP.");
    if (file.size > 8 * 1024 * 1024) throw new Error("Saiz poster melebihi 8 MB.");
    return new Promise((resolve, reject) => {
      const image = new Image();
      const url = URL.createObjectURL(file);
      image.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/webp", .86));
      };
      image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Poster tidak dapat dibaca.")); };
      image.src = url;
    });
  }

  async function listAdminArticles() {
    await articlesReady;
    const overrides = new Map(managedRows.map(article => [article.slug, article]));
    const builtins = BUILTIN_ARTICLES.map(article => overrides.get(article.slug) || ({ ...article }));
    const extra = managedRows.filter(article => !BUILTIN_ARTICLES.some(item => item.slug === article.slug));
    return [...extra, ...builtins].map(article => ({ ...article }));
  }

  async function getAdminArticle(slug) {
    await articlesReady;
    const managed = managedRows.find(article => article.slug === slug);
    const article = managed || BUILTIN_ARTICLES.find(item => item.slug === slug);
    if (!article) return null;
    const markdown = article.markdown != null ? article.markdown : await loadArticle(article);
    return { ...article, markdown };
  }

  async function saveManagedArticle(input, posterFile = null) {
    await articlesReady;
    if (window.pkskAuth?.state?.().access !== "admin") throw new Error("Akses pentadbir diperlukan.");
    const title = String(input.title || "").trim();
    const markdown = String(input.markdown || "").trim();
    const slug = slugify(input.slug || title);
    if (!title || !markdown || !slug) throw new Error("Tajuk dan kandungan artikel wajib diisi.");

    const previous = input.id
      ? managedRows.find(article => article.id === input.id)
      : managedRows.find(article => article.slug === slug);
    const image = posterFile ? await optimizePoster(posterFile) : String(input.image || previous?.image || "");
    if (!image) throw new Error("Sila muat naik poster artikel.");
    const now = new Date().toISOString();
    const meta = {
      slug,
      excerpt: String(input.excerpt || "").trim() || deriveExcerpt(markdown),
      category: String(input.category || "Pendidikan").trim(),
      author: String(input.author || "Editorial PKSKMY").trim(),
      date: String(input.date || "").trim() || defaultDate(),
      readTime: String(input.readTime || "").trim() || estimateReadTime(markdown),
      markdown,
      published: input.published !== false,
      createdAt: previous?.createdAt || now
    };
    const row = {
      id: previous?.id || input.id || `article_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title,
      content: JSON.stringify(meta),
      image_url: image,
      created_at: previous?.createdAt || now
    };

    if (window.pkskAuth?.isDemo?.()) {
      const rows = readDemoRows();
      const index = rows.findIndex(item => item.id === row.id || parseManagedRow(item)?.slug === slug);
      if (index >= 0) rows[index] = row; else rows.unshift(row);
      writeDemoRows(rows);
    } else {
      const client = window.pkskAuth?.client;
      const payload = {
        subject: "bicara-ilmu",
        title,
        content: row.content,
        image_url: image,
        access_level: "free",
        is_published: true
      };
      const query = previous?.id
        ? client.from("notes").update(payload).eq("id", previous.id)
        : client.from("notes").insert(payload);
      const { error } = await query;
      if (error) throw error;
    }
    await refreshManagedArticles();
    return getAdminArticle(slug);
  }

  async function hideManagedArticle(slug) {
    const article = await getAdminArticle(slug);
    if (!article) throw new Error("Artikel tidak ditemui.");
    return saveManagedArticle({ ...article, published: false }, null);
  }

  function inlineMarkdown(value) {
    return escapeHtml(value)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }

  function safeImageSource(value) {
    const source = String(value || "").trim();
    if (!source) return "";
    try {
      const resolved = new URL(source, window.location.href);
      return ["http:", "https:", "file:"].includes(resolved.protocol) ? source : "";
    } catch (_) {
      return "";
    }
  }

  function markdownToHtml(markdown) {
    const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
    const output = [];
    const paragraph = [];
    let listType = null;
    let listItems = [];

    function flushParagraph() {
      if (!paragraph.length) return;
      output.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
      paragraph.length = 0;
    }

    function flushList() {
      if (!listType || !listItems.length) return;
      output.push(`<${listType}>${listItems.map(item => `<li>${inlineMarkdown(item)}</li>`).join("")}</${listType}>`);
      listType = null;
      listItems = [];
    }

    lines.forEach(line => {
      const trimmed = line.trim();
      const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
      const unordered = /^[-*+]\s+(.+)$/.exec(trimmed);
      const ordered = /^\d+[.)]\s+(.+)$/.exec(trimmed);
      const image = /^!\[([^\]]*)\]\((\S+?)(?:\s+["'][^"']*["'])?\)$/.exec(trimmed);

      if (!trimmed) {
        flushParagraph();
        flushList();
        return;
      }

      if (/^_{3,}$|^-{3,}$|^\*{3,}$/.test(trimmed)) {
        flushParagraph();
        flushList();
        output.push("<hr>");
        return;
      }

      if (heading) {
        flushParagraph();
        flushList();
        const level = heading[1].length;
        output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
        return;
      }

      if (image) {
        flushParagraph();
        flushList();
        const source = safeImageSource(image[2]);
        if (source) {
          output.push(`<figure class="article-inline-figure"><img src="${escapeHtml(source)}" alt="${escapeHtml(image[1])}" loading="lazy"></figure>`);
        }
        return;
      }

      if (trimmed.startsWith("> ")) {
        flushParagraph();
        flushList();
        output.push(`<blockquote>${inlineMarkdown(trimmed.slice(2))}</blockquote>`);
        return;
      }

      if (unordered || ordered) {
        flushParagraph();
        const nextType = unordered ? "ul" : "ol";
        if (listType && listType !== nextType) flushList();
        listType = nextType;
        listItems.push((unordered || ordered)[1]);
        return;
      }

      flushList();
      paragraph.push(trimmed);
    });

    flushParagraph();
    flushList();
    return output.join("\n");
  }

  async function loadArticle(article) {
    if (articleCache.has(article.slug)) return articleCache.get(article.slug);
    if (article.markdown != null) {
      articleCache.set(article.slug, article.markdown);
      return article.markdown;
    }
    const response = await fetch(article.source, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Artikel tidak dapat dimuatkan (${response.status}).`);
    const markdown = await response.text();
    articleCache.set(article.slug, markdown);
    return markdown;
  }

  function closeImageLightbox() {
    if (!activeLightbox) return;
    const { overlay, returnFocus, onKeydown } = activeLightbox;
    document.removeEventListener("keydown", onKeydown);
    document.body.classList.remove("article-lightbox-open");
    overlay.remove();
    activeLightbox = null;
    returnFocus?.focus?.({ preventScroll: true });
  }

  function openImageLightbox(image) {
    closeImageLightbox();
    const overlay = document.createElement("div");
    overlay.className = "article-image-lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Paparan besar gambar artikel");

    const enlarged = document.createElement("img");
    enlarged.src = image.currentSrc || image.src;
    enlarged.alt = image.alt || "Gambar artikel";

    const close = document.createElement("button");
    close.className = "article-lightbox-close";
    close.type = "button";
    close.setAttribute("aria-label", "Tutup paparan gambar");
    close.innerHTML = "&times;";

    const hint = document.createElement("span");
    hint.className = "article-lightbox-hint";
    hint.textContent = "Tekan Esc atau klik ruang gelap untuk tutup";

    overlay.append(enlarged, close, hint);
    document.body.append(overlay);
    document.body.classList.add("article-lightbox-open");

    const onKeydown = event => {
      if (event.key === "Escape") closeImageLightbox();
    };
    activeLightbox = { overlay, returnFocus: image, onKeydown };
    document.addEventListener("keydown", onKeydown);
    overlay.addEventListener("click", event => {
      if (event.target === overlay || event.target === close || event.target === hint) closeImageLightbox();
    });
    close.focus();
  }

  function enableImageZoom(scope) {
    scope?.querySelectorAll("img").forEach(image => {
      if (image.dataset.zoomReady) return;
      image.dataset.zoomReady = "true";
      image.classList.add("article-zoomable-image");
      image.tabIndex = 0;
      image.setAttribute("role", "button");
      image.setAttribute("aria-label", `${image.alt || "Gambar artikel"}. Klik untuk paparan besar.`);
      image.addEventListener("click", () => openImageLightbox(image));
      image.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openImageLightbox(image);
        }
      });
    });
  }

  function shareUrl(article) {
    const url = new URL(window.location.href);
    url.hash = `bicara-ilmu/${encodeURIComponent(article.slug)}`;
    return url.href;
  }

  async function copyShareUrl(value) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  }

  async function shareArticle(article, status) {
    const url = shareUrl(article);
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, text: article.excerpt, url });
        status.textContent = "Artikel berjaya dikongsi.";
      } else {
        await copyShareUrl(url);
        status.textContent = "Pautan artikel telah disalin.";
      }
    } catch (error) {
      status.textContent = error?.name === "AbortError" ? "Perkongsian dibatalkan." : "Pautan tidak dapat disalin. Sila cuba lagi.";
    }
  }

  function sharedArticleSlug() {
    const match = /^#bicara-ilmu\/(.+)$/.exec(window.location.hash);
    if (!match) return "";
    try { return decodeURIComponent(match[1]); } catch (_) { return ""; }
  }

  function clearSharedArticleHash() {
    if (!sharedArticleSlug()) return;
    const url = new URL(window.location.href);
    url.hash = "";
    window.history.replaceState(null, "", url.href);
  }

  function articleCard(article) {
    return `<button class="bicara-card" type="button" data-article="${escapeHtml(article.slug)}"
      aria-label="Baca artikel: ${escapeHtml(article.title)}">
      <span class="bicara-card-cover">
        <img src="${escapeHtml(article.image)}" alt="" loading="lazy">
      </span>
      <span class="bicara-card-body">
        <strong>${escapeHtml(article.title)}</strong>
        <span class="bicara-card-excerpt">${escapeHtml(article.excerpt)}</span>
        <span class="bicara-card-byline">
          <span>Oleh ${escapeHtml(article.author || "PKSKMY")}</span>
          <time>${escapeHtml(article.date)}</time>
        </span>
      </span>
    </button>`;
  }

  async function renderHub() {
    closeImageLightbox();
    clearSharedArticleHash();
    const app = document.getElementById("app");
    if (!app) return;
    await articlesReady;

    app.innerHTML = `<section class="bicara-page bicara-news-page">
      <header class="bicara-news-head">
        <h1>Bicara Ilmu</h1>
        <p>Artikel, pandangan dan analisis terkini berkaitan pendidikan.</p>
      </header>
      <div class="bicara-grid">
        ${ARTICLES.map(articleCard).join("")}
      </div>
    </section>`;

    app.querySelectorAll("[data-article]").forEach(card => {
      const article = ARTICLES.find(item => item.slug === card.dataset.article);
      card.addEventListener("click", () => renderArticle(article.slug));
      card.addEventListener("pointerenter", () => { loadArticle(article).catch(() => {}); }, { once: true });
    });
  }

  async function renderArticle(slug) {
    closeImageLightbox();
    const app = document.getElementById("app");
    await articlesReady;
    const article = ARTICLES.find(item => item.slug === slug);
    if (!app || !article) return renderHub();

    app.innerHTML = `<section class="article-page">
      <button class="article-back" type="button" id="articleBack">
        <span aria-hidden="true">←</span> Kembali ke Bicara Ilmu
      </button>
      <article class="article-reader">
        <div class="article-cover">
          <img src="${escapeHtml(article.image)}" alt="Infografik ${escapeHtml(article.title)}">
          <span class="article-cover-hint" aria-hidden="true">Klik gambar untuk besarkan</span>
        </div>
        <div class="article-reader-meta">
          <span>${escapeHtml(article.category)}</span>
          <time>${escapeHtml(article.date)}</time>
          <span>${escapeHtml(article.readTime)}</span>
        </div>
        <div class="article-prose" id="articleBody" aria-live="polite">
          <div class="article-loading"><span></span><p>Memuatkan artikel…</p></div>
        </div>
        <footer class="article-share">
          <div>
            <strong>Kongsi artikel ini</strong>
            <span>Kongsikan pautan artikel kepada keluarga, rakan atau warga pendidik.</span>
          </div>
          <button type="button" id="articleShare">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1"/></svg>
            Kongsi pautan
          </button>
          <span class="article-share-status" id="articleShareStatus" aria-live="polite"></span>
        </footer>
      </article>
    </section>`;

    app.querySelector("#articleBack").addEventListener("click", () => {
      renderHub();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    app.querySelector("#articleShare").addEventListener("click", () => {
      shareArticle(article, app.querySelector("#articleShareStatus"));
    });
    enableImageZoom(app.querySelector(".article-cover"));
    window.scrollTo({ top: 0, behavior: "smooth" });

    const body = app.querySelector("#articleBody");
    try {
      const markdown = await loadArticle(article);
      if (!body.isConnected) return;
      body.innerHTML = markdownToHtml(markdown);
      enableImageZoom(body);
    } catch (error) {
      if (!body.isConnected) return;
      body.innerHTML = `<div class="article-error">
        <strong>Artikel tidak dapat dimuatkan.</strong>
        <p>${escapeHtml(error?.message || error)}</p>
        <button type="button" id="articleRetry">Cuba semula</button>
      </div>`;
      body.querySelector("#articleRetry").addEventListener("click", () => renderArticle(article.slug));
    }
  }

  window.pkskArticles = {
    renderHub,
    renderArticle,
    ready: articlesReady,
    listArticles: () => ARTICLES.map(article => ({ ...article })),
    listAdminArticles,
    getAdminArticle,
    saveManagedArticle,
    hideManagedArticle,
    slugify
  };

  document.getElementById("tabbar")?.addEventListener("click", event => {
    const tab = event.target.closest(".tab");
    if (tab && tab.dataset.view !== "bicara") clearSharedArticleHash();
  });

  window.addEventListener("DOMContentLoaded", async () => {
    await articlesReady;
    const slug = sharedArticleSlug();
    if (!ARTICLES.some(article => article.slug === slug)) return;
    document.querySelectorAll("#tabbar .tab").forEach(tab =>
      tab.classList.toggle("active", tab.dataset.view === "bicara"));
    renderArticle(slug);
  }, { once: true });
})();
