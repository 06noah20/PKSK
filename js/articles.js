/* ========================================================================
 * Portal PKSK — Bicara Ilmu: senarai artikel dan pemapar Markdown.
 * ==================================================================== */

(function () {
  "use strict";

  const ARTICLES = [
    {
      slug: "tahap-penguasaan-pbd",
      title: "Di Sebalik Angka 1 hingga 6: Menilai Semula Tafsiran Tahap Penguasaan dalam PBD",
      excerpt: "Tinjauan kritis terhadap tafsiran TP1 hingga TP6 — kekuatan, kelemahan dan cadangan untuk pentaksiran yang lebih adil.",
      category: "Pentaksiran & PBD",
      date: "18 Julai 2026",
      readTime: "8 minit bacaan",
      image: "assets/articles/tahap-penguasaan-pbd.png",
      source: "articles/artikel-tahap-penguasaan-pbd.md"
    }
  ];

  const articleCache = new Map();

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, char =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function inlineMarkdown(value) {
    return escapeHtml(value)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
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
    const response = await fetch(article.source, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Artikel tidak dapat dimuatkan (${response.status}).`);
    const markdown = await response.text();
    articleCache.set(article.slug, markdown);
    return markdown;
  }

  function articleCard(article) {
    return `<button class="bicara-card" type="button" data-article="${escapeHtml(article.slug)}"
      aria-label="Baca artikel: ${escapeHtml(article.title)}">
      <span class="bicara-card-cover">
        <img src="${escapeHtml(article.image)}" alt="" loading="lazy">
        <span class="bicara-card-category">${escapeHtml(article.category)}</span>
      </span>
      <span class="bicara-card-body">
        <span class="bicara-card-meta">${escapeHtml(article.date)} · ${escapeHtml(article.readTime)}</span>
        <strong>${escapeHtml(article.title)}</strong>
        <span class="bicara-card-excerpt">${escapeHtml(article.excerpt)}</span>
        <span class="bicara-card-link">Baca artikel <span aria-hidden="true">→</span></span>
      </span>
    </button>`;
  }

  function renderHub() {
    const app = document.getElementById("app");
    if (!app) return;

    app.innerHTML = `<section class="bicara-page">
      <header class="bicara-hero">
        <div>
          <p class="bicara-eyebrow">Wacana Pendidikan</p>
          <h1>Bicara Ilmu</h1>
          <p>Himpunan artikel, pandangan dan analisis yang membantu ibu bapa, guru dan murid memahami dunia pendidikan dengan lebih mendalam.</p>
        </div>
        <span class="bicara-hero-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64"><path d="M12 12h27a9 9 0 0 1 9 9v29H21a9 9 0 0 0-9 9z"/><path d="M52 12H39a9 9 0 0 0-9 9v29h13a9 9 0 0 1 9 9z"/><path d="M20 24h8M20 31h8M38 24h7M38 31h7"/></svg>
        </span>
      </header>

      <div class="bicara-section-head">
        <div><p>Artikel Terkini</p><h2>Teroka idea dan perspektif baharu</h2></div>
        <span>${ARTICLES.length} artikel</span>
      </div>

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
    const app = document.getElementById("app");
    const article = ARTICLES.find(item => item.slug === slug);
    if (!app || !article) return renderHub();

    app.innerHTML = `<section class="article-page">
      <button class="article-back" type="button" id="articleBack">
        <span aria-hidden="true">←</span> Kembali ke Bicara Ilmu
      </button>
      <article class="article-reader">
        <div class="article-cover">
          <img src="${escapeHtml(article.image)}" alt="Infografik ${escapeHtml(article.title)}">
        </div>
        <div class="article-reader-meta">
          <span>${escapeHtml(article.category)}</span>
          <time>${escapeHtml(article.date)}</time>
          <span>${escapeHtml(article.readTime)}</span>
        </div>
        <div class="article-prose" id="articleBody" aria-live="polite">
          <div class="article-loading"><span></span><p>Memuatkan artikel…</p></div>
        </div>
      </article>
    </section>`;

    app.querySelector("#articleBack").addEventListener("click", () => {
      renderHub();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.scrollTo({ top: 0, behavior: "smooth" });

    const body = app.querySelector("#articleBody");
    try {
      const markdown = await loadArticle(article);
      if (!body.isConnected) return;
      body.innerHTML = markdownToHtml(markdown);
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
    articles: ARTICLES.slice()
  };
})();
