import { defineTheme, escapeHtml, escapeHtmlAttr, formatDate, type Post } from "./theme-api.ts";

const DEFAULT_THEME_CSS = `
:root {
  --page-bg: #f4efe7;
  --paper: #fffaf4;
  --ink: #1d1a17;
  --muted: #72685c;
  --accent: #b14d34;
  --accent-soft: rgba(177, 77, 52, 0.14);
  --border: rgba(29, 26, 23, 0.12);
  --code-bg: #221f1a;
  --code-ink: #f8efe2;
  --shadow: 0 20px 50px rgba(29, 26, 23, 0.08);
  --content-width: min(760px, calc(100vw - 2rem));
  --radius: 24px;
  --font-body: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif;
  --font-display: "Avenir Next Condensed", "Arial Narrow", sans-serif;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(177, 77, 52, 0.12), transparent 28rem),
    linear-gradient(180deg, #f8f2e8 0%, var(--page-bg) 52%, #efe7dc 100%);
  color: var(--ink);
  font-family: var(--font-body);
  line-height: 1.7;
}
a { color: inherit; }
.site-shell { width: var(--content-width); margin: 0 auto; padding: 2rem 0 4rem; }
.site-header { display: flex; justify-content: space-between; gap: 1rem; align-items: baseline; margin-bottom: 2rem; }
.site-home-link {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  letter-spacing: 0.04em;
  text-decoration: none;
  text-transform: uppercase;
}
.site-tagline { margin: 0; color: var(--muted); }
.page-card {
  background: color-mix(in srgb, var(--paper) 88%, white);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: clamp(1.25rem, 3vw, 3rem);
  backdrop-filter: blur(12px);
}
.post-list { display: grid; gap: 1.25rem; }
.post-preview {
  padding: 1.25rem;
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) * 0.7);
  background: linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.55));
}
.post-preview-title,
.post-title {
  margin: 0;
  font-family: var(--font-display);
  line-height: 1;
  text-transform: uppercase;
}
.post-preview-title { font-size: clamp(1.4rem, 2vw, 1.9rem); }
.post-title { font-size: clamp(2.4rem, 6vw, 4.8rem); margin-bottom: 1rem; }
.post-preview-link { text-decoration: none; }
.post-meta,
.page-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  color: var(--muted);
  font-size: 0.95rem;
}
.post-summary,
.empty-state { color: var(--muted); }
.content { font-size: 1.05rem; }
.content > :first-child { margin-top: 0; }
.content-heading {
  margin: 2.25rem 0 1rem;
  font-family: var(--font-display);
  letter-spacing: 0.02em;
  line-height: 1.05;
}
.content-heading[data-level="1"] { font-size: 2.4rem; }
.content-heading[data-level="2"] { font-size: 2rem; }
.content-heading[data-level="3"] { font-size: 1.5rem; }
.content-heading[data-level="4"] { font-size: 1.2rem; }
.heading-link-anchor {
  color: var(--accent);
  opacity: 0;
  margin-left: 0.5rem;
  transition: opacity 160ms ease;
  text-decoration: none;
}
.content-heading:hover .heading-link-anchor { opacity: 1; }
.content-paragraph,
.content-blockquote,
.content-list,
.content-table-wrap,
.content-codeblock { margin: 1rem 0 1.25rem; }
.content-blockquote {
  margin-left: 0;
  padding-left: 1rem;
  border-left: 4px solid var(--accent);
  color: var(--muted);
}
.content-list { padding-left: 1.25rem; }
.content-list-item + .content-list-item { margin-top: 0.35rem; }
.content-inline-code,
.content-code { font-family: "SFMono-Regular", "Menlo", monospace; }
.content-inline-code {
  background: var(--accent-soft);
  padding: 0.15rem 0.35rem;
  border-radius: 0.35rem;
}
.content-codeblock {
  padding: 1rem;
  border-radius: 1rem;
  background: var(--code-bg);
  color: var(--code-ink);
  overflow-x: auto;
}
.content-hr {
  border: 0;
  height: 1px;
  background: var(--border);
  margin: 2rem 0;
}
.content-table-wrap { overflow-x: auto; }
.content-table { width: 100%; border-collapse: collapse; }
.content-table th,
.content-table td {
  padding: 0.75rem;
  border: 1px solid var(--border);
  text-align: left;
}
.content-image { max-width: 100%; border-radius: 1rem; display: block; }
.tag-list { display: flex; flex-wrap: wrap; gap: 0.5rem; padding: 0; list-style: none; }
.tag {
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.85rem;
}
@media (max-width: 720px) {
  .site-header { flex-direction: column; align-items: flex-start; }
}
`.trimStart();

const theme = defineTheme({
  name: "default",
  stylesheets: [{ output: "theme.css", content: DEFAULT_THEME_CSS }],
  markdownOptions: {
    headings: { ids: true },
    autolinks: true,
    tables: true,
    strikethrough: true,
    tasklists: true,
  },
  renderers: {
    heading: (children, meta) => {
      const level = meta?.level ?? 1;
      const id = meta?.id;
      const idAttr = id ? ` id="${escapeHtmlAttr(id)}"` : "";
      const content = id
        ? `<span class="heading-text">${children}</span><a class="heading-link-anchor" href="#${escapeHtmlAttr(id)}" aria-label="Link to this section">#</a>`
        : children;
      return `<h${level}${idAttr} class="content-heading" data-level="${level}">${content}</h${level}>`;
    },
    paragraph: (children) => `<p class="content-paragraph">${children}</p>`,
    blockquote: (children) => `<blockquote class="content-blockquote">${children}</blockquote>`,
    code: (children, meta) => {
      const language = meta?.language ? escapeHtmlAttr(meta.language) : "plain";
      return `<pre class="content-codeblock" data-language="${language}"><code class="content-code language-${language}">${children}</code></pre>`;
    },
    list: (children, meta) => {
      const tag = meta?.ordered ? "ol" : "ul";
      const startAttr = meta?.ordered && typeof meta.start === "number" && meta.start !== 1 ? ` start="${meta.start}"` : "";
      return `<${tag} class="content-list" data-depth="${meta?.depth ?? 0}"${startAttr}>${children}</${tag}>`;
    },
    listItem: (children, meta) => {
      const checked = typeof meta?.checked === "boolean" ? ` data-checked="${meta.checked}"` : "";
      return `<li class="content-list-item"${checked}>${children}</li>`;
    },
    hr: () => `<hr class="content-hr" />`,
    table: (children) => `<div class="content-table-wrap"><table class="content-table">${children}</table></div>`,
    // thead: (children) => `<thead>${children}</thead>`,
    // tbody: (children) => `<tbody>${children}</tbody>`,
    // tr: (children) => `<tr>${children}</tr>`,
    th: (children, meta) => `<th${alignAttr(meta?.align)}>${children}</th>`,
    td: (children, meta) => `<td${alignAttr(meta?.align)}>${children}</td>`,
    // html: (children) => children,
    strong: (children) => `<strong class="content-strong">${children}</strong>`,
    emphasis: (children) => `<em class="content-emphasis">${children}</em>`,
    link: (children, meta) => {
      const href = escapeHtmlAttr(meta?.href ?? "#");
      const title = meta?.title ? ` title="${escapeHtmlAttr(meta.title)}"` : "";
      const external = /^https?:\/\//.test(meta?.href ?? "");
      const rel = external ? ` rel="noreferrer noopener"` : "";
      const target = external ? ` target="_blank"` : "";
      return `<a class="content-link" href="${href}"${title}${rel}${target}>${children}</a>`;
    },
    image: (_children, meta) => {
      const src = escapeHtmlAttr(meta?.src ?? "");
      const title = meta?.title ? ` title="${escapeHtmlAttr(meta.title)}"` : "";
      return `<img class="content-image" src="${src}" alt=""${title} />`;
    },
    codespan: (children) => `<code class="content-inline-code">${children}</code>`,
    strikethrough: (children) => `<del class="content-strikethrough">${children}</del>`,
    // text: (children) => children,
  },
  renderDocument: ({ site, pageTitle, pageId, bodyClass, stylesheets, content }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(pageTitle)}</title>
    ${stylesheets.map((href) => `<link rel="stylesheet" href="${escapeHtmlAttr(href)}" />`).join("\n    ")}
  </head>
  <body id="${escapeHtmlAttr(pageId)}" class="${escapeHtmlAttr(bodyClass)}">
    <div class="site-shell" id="site-shell">
      <header class="site-header" id="site-header">
        <a class="site-home-link" href="/">${escapeHtml(site.title)}</a>
        <p class="site-tagline">${escapeHtml(site.description)}</p>
      </header>
      <main id="site-main">
        ${content}
      </main>
    </div>
  </body>
</html>`,
  renderIndex: ({ site, posts }) => `
<section class="page-card">
  <header class="page-header">
    <h1 class="post-title">${escapeHtml(site.title)}</h1>
    <p class="site-tagline">${escapeHtml(site.description)}</p>
  </header>
  <section class="post-list">${posts.length > 0 ? posts.map(renderPostPreview).join("\n") : `<p class="empty-state">No posts found yet.</p>`}</section>
</section>`,
  renderPost: ({ post }) => `
<article class="page-card post-page" id="${post.id}">
  <header class="post-header">
    <p class="page-meta"><a href="/">Back to home</a></p>
    <h1 class="post-title">${escapeHtml(post.title)}</h1>
    <div class="post-meta">
      ${post.date ? `<time datetime="${escapeHtmlAttr(post.date)}">${escapeHtml(formatDate(post.date))}</time>` : ""}
      <span>${escapeHtml(post.relativeSourcePath)}</span>
    </div>
    ${renderTagList(post.tags)}
  </header>
  <section class="content" id="content-${escapeHtmlAttr(post.slug)}">
    ${theme.renderMarkdown(post.body)}
  </section>
</article>`,
});

export default theme;

function renderPostPreview(post: Post): string {
  return `<article class="post-preview" id="${escapeHtmlAttr(post.id)}">
  <header>
    <h2 class="post-preview-title"><a class="post-preview-link" href="${escapeHtmlAttr(post.url)}">${escapeHtml(post.title)}</a></h2>
    <div class="post-meta">
      ${post.date ? `<time datetime="${escapeHtmlAttr(post.date)}">${escapeHtml(formatDate(post.date))}</time>` : ""}
      <span>${escapeHtml(post.relativeSourcePath)}</span>
    </div>
  </header>
  ${post.summary ? `<p class="post-summary">${escapeHtml(post.summary)}</p>` : ""}
  ${renderTagList(post.tags)}
</article>`;
}

function renderTagList(tags: string[]): string {
  if (tags.length === 0) {
    return "";
  }

  return `<ul class="tag-list">${tags.map((tag) => `<li class="tag">${escapeHtml(tag)}</li>`).join("")}</ul>`;
}

function alignAttr(align?: string): string {
  if (!align) return "";
  return ` style="text-align:${escapeHtmlAttr(align)}"`;
}
