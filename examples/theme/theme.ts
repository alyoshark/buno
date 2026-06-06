import { defineTheme, escapeHtml, escapeHtmlAttr, formatDate, getProcessedImage, renderResponsiveImage, type ArchiveGroup, type PaginationInfo, type Post, type TagSummary } from "../../src/theme-api.ts";

const theme = defineTheme({
  name: "example-theme",
  stylesheets: [{ source: "style.css", output: "theme.css" }],
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
      const kicker = level <= 2 ? `<span class="theme-kicker">Section ${level}</span>` : "";
      const anchor = id ? `<a class="theme-heading-anchor" href="#${escapeHtmlAttr(id)}">link</a>` : "";
      return `<h${level}${idAttr} class="theme-heading" data-level="${level}">${kicker}<span class="theme-heading-text">${children}</span>${anchor}</h${level}>`;
    },
    paragraph: (children) => `<p class="theme-paragraph">${children}</p>`,
    blockquote: (children) => `<blockquote class="theme-blockquote">${children}</blockquote>`,
    code: (children, meta) => {
      const language = meta?.language ? escapeHtmlAttr(meta.language) : "plain";
      return `<pre class="theme-codeblock" data-language="${language}"><code class="theme-code">${children}</code></pre>`;
    },
    list: (children, meta) => {
      const tag = meta?.ordered ? "ol" : "ul";
      return `<${tag} class="theme-list" data-depth="${meta?.depth ?? 0}">${children}</${tag}>`;
    },
    listItem: (children, meta) => `<li class="theme-list-item"${typeof meta?.checked === "boolean" ? ` data-checked="${meta.checked}"` : ""}>${children}</li>`,
    hr: () => `<hr class="theme-rule" />`,
    table: (children) => `<div class="theme-table-wrap"><table class="theme-table">${children}</table></div>`,
    // thead: (children) => `<thead>${children}</thead>`,
    // tbody: (children) => `<tbody>${children}</tbody>`,
    // tr: (children) => `<tr>${children}</tr>`,
    // th: (children) => `<th>${children}</th>`,
    // td: (children) => `<td>${children}</td>`,
    // html: (children) => children,
    strong: (children) => `<strong class="theme-strong">${children}</strong>`,
    emphasis: (children) => `<em class="theme-emphasis">${children}</em>`,
    link: (children, meta) => `<a class="theme-link" href="${escapeHtmlAttr(meta?.href ?? "#")}">${children}</a>`,
    image: (children, meta) => {
      const src = meta?.src ?? "";
      const alt = children ?? "";
      const processed = getProcessedImage(src);
      if (processed) {
        return `<figure class="theme-figure">${renderResponsiveImage(src, alt, processed)}</figure>`;
      }
      return `<figure class="theme-figure"><img class="theme-image" src="${escapeHtmlAttr(src)}" alt="${escapeHtmlAttr(alt)}" loading="lazy" /></figure>`;
    },
    codespan: (children) => `<code class="theme-inline-code">${children}</code>`,
    strikethrough: (children) => `<del class="theme-strike">${children}</del>`,
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
    <div class="theme-frame">
      <header class="theme-site-header">
        <a class="theme-home-link" href="/">${escapeHtml(site.title)}</a>
        <nav class="theme-nav" aria-label="Primary">
          <a href="/">Home</a>
          <a href="/tags/">Tags</a>
          <a href="/archives/">Archives</a>
        </nav>
      </header>
      <p class="theme-site-description">${escapeHtml(site.description)}</p>
      <main class="theme-main">
        ${content}
      </main>
    </div>
  </body>
</html>`,
  renderIndex: ({ site, posts, pagination }) => `
<section class="theme-hero">
  <p class="theme-eyebrow">Example Theme</p>
  <h1 class="theme-title">${escapeHtml(site.title)}</h1>
  <p class="theme-intro">${escapeHtml(site.description)}</p>
</section>
<section class="theme-feed">
  ${posts.length > 0 ? posts.map(renderPostPreview).join("\n") : `<p class="theme-empty">No posts found yet.</p>`}
</section>
${renderPagination(pagination)}`,
  renderPost: ({ post, site }) => `
<article class="theme-post" id="${escapeHtmlAttr(post.id)}">
  <p class="theme-back"><a href="/">Return to ${escapeHtml(site.title)}</a></p>
  <header class="theme-post-header">
    <h1 class="theme-title">${escapeHtml(post.title)}</h1>
    <div class="theme-meta">
      ${post.date ? `<time datetime="${escapeHtmlAttr(post.date)}">${escapeHtml(formatDate(post.date))}</time>` : ""}
      <span>${escapeHtml(post.relativeSourcePath)}</span>
    </div>
    ${renderTagList(post.tags)}
  </header>
  <section class="theme-content" id="content-${escapeHtmlAttr(post.slug)}">
    ${theme.renderMarkdown(post.body)}
  </section>
</article>`,
  renderTagsIndex: ({ tags, pagination }) => `
<section class="theme-hero">
  <p class="theme-eyebrow">Browse</p>
  <h1 class="theme-title">Tags</h1>
  <p class="theme-intro">Every tag in the site with a direct count.</p>
</section>
<section class="theme-feed">
  ${tags.length > 0 ? tags.map(renderTagSummary).join("\n") : `<p class="theme-empty">No tags found yet.</p>`}
</section>
${renderPagination(pagination)}`,
  renderTag: ({ tag, pagination }) => `
<section class="theme-hero">
  <p class="theme-eyebrow">Tag</p>
  <h1 class="theme-title">${escapeHtml(tag.name)}</h1>
  <p class="theme-intro">${tag.count} post${tag.count === 1 ? "" : "s"} filed under this tag.</p>
</section>
<section class="theme-feed">
  ${tag.posts.map(renderPostPreview).join("\n")}
</section>
${renderPagination(pagination)}`,
  renderArchives: ({ archives, pagination }) => `
<section class="theme-hero">
  <p class="theme-eyebrow">Browse</p>
  <h1 class="theme-title">Archives</h1>
  <p class="theme-intro">A month-by-month view of dated posts.</p>
</section>
<section class="theme-archive-list">
  ${archives.length > 0 ? archives.map(renderArchiveGroup).join("\n") : `<p class="theme-empty">No dated posts found yet.</p>`}
</section>
${renderPagination(pagination)}`,
});

function renderPostPreview(post: Post): string {
  return `<article class="theme-card" id="${escapeHtmlAttr(post.id)}">
  <p class="theme-card-label">Post</p>
  <h2 class="theme-card-title"><a href="${escapeHtmlAttr(post.url)}">${escapeHtml(post.title)}</a></h2>
  <div class="theme-meta">
    ${post.date ? `<time datetime="${escapeHtmlAttr(post.date)}">${escapeHtml(formatDate(post.date))}</time>` : ""}
    <span>${escapeHtml(post.relativeSourcePath)}</span>
  </div>
  ${post.summary ? `<p class="theme-card-summary">${escapeHtml(post.summary)}</p>` : ""}
  ${renderTagList(post.tags)}
</article>`;
}

function renderTagList(tags: string[]): string {
  if (tags.length === 0) {
    return "";
  }

  return `<ul class="theme-tags">${tags.map((tag) => `<li class="theme-tag">${escapeHtml(tag)}</li>`).join("")}</ul>`;
}

function renderTagSummary(tag: TagSummary): string {
  return `<article class="theme-card" id="theme-tag-${escapeHtmlAttr(tag.slug)}">
  <p class="theme-card-label">Tag</p>
  <h2 class="theme-card-title"><a href="${escapeHtmlAttr(tag.url)}">${escapeHtml(tag.name)}</a></h2>
  <p class="theme-card-summary">${tag.count} post${tag.count === 1 ? "" : "s"}</p>
</article>`;
}

function renderArchiveGroup(group: ArchiveGroup): string {
  return `<section class="theme-post" id="${escapeHtmlAttr(group.anchor)}">
  <p class="theme-card-label">Archive</p>
  <h2 class="theme-card-title">${escapeHtml(group.label)}</h2>
  <div class="theme-archive-posts">${group.posts.map(renderArchivePost).join("")}</div>
</section>`;
}

function renderArchivePost(post: Post): string {
  return `<article class="theme-archive-post" id="theme-archive-${escapeHtmlAttr(post.slug)}">
  <a href="${escapeHtmlAttr(post.url)}">${escapeHtml(post.title)}</a>
  <span class="theme-meta">${post.date ? escapeHtml(formatDate(post.date)) : ""}</span>
</article>`;
}

function renderPagination(pagination: PaginationInfo): string {
  if (pagination.totalPages <= 1) {
    return "";
  }

  return `<nav class="theme-pagination" aria-label="Pagination">
  ${pagination.prevUrl ? `<a class="theme-page-link" href="${escapeHtmlAttr(pagination.prevUrl)}">Previous</a>` : ""}
  ${pagination.links
    .map((link) =>
      link.current
        ? `<span class="theme-page-current" aria-current="page">${link.number}</span>`
        : `<a class="theme-page-link" href="${escapeHtmlAttr(link.url)}">${link.number}</a>`,
    )
    .join("")}
  ${pagination.nextUrl ? `<a class="theme-page-link" href="${escapeHtmlAttr(pagination.nextUrl)}">Next</a>` : ""}
</nav>`;
}

export default theme;
