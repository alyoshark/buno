/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx, Fragment, raw } from "./jsx/jsx-runtime.ts";
import { defineTheme, escapeHtmlAttr, formatDate, getProcessedImage, renderResponsiveImage, type ArchiveGroup, type PaginationInfo, type Post, type TagSummary } from "./theme-api.ts";

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
.site-header { display: flex; justify-content: space-between; gap: 1rem; align-items: baseline; margin-bottom: 1rem; }
.site-home-link {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  letter-spacing: 0.04em;
  text-decoration: none;
  text-transform: uppercase;
}
.site-tagline { margin: 0 0 2rem; color: var(--muted); }
.site-nav,
.post-meta,
.page-meta,
.pagination {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  color: var(--muted);
  font-size: 0.95rem;
}
.site-nav a,
.post-preview-link,
.taxonomy-link,
.archive-post a,
.pagination-link { text-decoration: none; }
.page-card {
  background: color-mix(in srgb, var(--paper) 88%, white);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: clamp(1.25rem, 3vw, 3rem);
  backdrop-filter: blur(12px);
}
.post-list,
.taxonomy-list,
.archive-list,
.archive-posts,
.section-stack { display: grid; gap: 1.25rem; }
.post-preview,
.taxonomy-card,
.archive-group {
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
.post-summary,
.empty-state { color: var(--muted); }
.taxonomy-link {
  font-family: var(--font-display);
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.archive-post {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
}
.pagination-link,
.pagination-current {
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--border);
}
.pagination-current {
  background: var(--accent-soft);
  color: var(--accent);
}
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
    th: (children, meta) => `<th${alignAttr(meta?.align)}>${children}</th>`,
    td: (children, meta) => `<td${alignAttr(meta?.align)}>${children}</td>`,
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
    image: (children, meta) => {
      const src = meta?.src ?? "";
      const alt = children ?? "";
      const processed = getProcessedImage(src);
      if (processed) {
        return renderResponsiveImage(src, alt, processed);
      }
      return `<img class="content-image" src="${escapeHtmlAttr(src)}" alt="${escapeHtmlAttr(alt)}" loading="lazy" />`;
    },
    codespan: (children) => `<code class="content-inline-code">${children}</code>`,
    strikethrough: (children) => `<del class="content-strikethrough">${children}</del>`,
  },
  renderDocument: ({ site, pageTitle, pageId, bodyClass, stylesheets, content }) =>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{pageTitle}</title>
        {stylesheets.map((href) => <link rel="stylesheet" href={href} />)}
        {site.url ? <link rel="alternate" type="application/rss+xml" title={site.title} href={`${site.url.replace(/\/$/, "")}/feed.xml`} /> : null}
      </head>
      <body id={pageId} className={bodyClass}>
        <div className="site-shell" id="site-shell">
          <header className="site-header" id="site-header">
            <a className="site-home-link" href="/">{site.title}</a>
            <nav className="site-nav" aria-label="Primary">
              <a href="/">Home</a>
              <a href="/tags/">Tags</a>
              <a href="/archives/">Archives</a>
            </nav>
          </header>
          <p className="site-tagline">{site.description}</p>
          <main id="site-main">{raw(content)}</main>
        </div>
      </body>
    </html>,
  renderIndex: ({ site, posts, pagination }) =>
    <section className="page-card">
      <header className="page-header">
        <h1 className="post-title">{site.title}</h1>
        <p className="site-tagline">{site.description}</p>
      </header>
      <section className="post-list">
        {posts.length > 0 ? posts.map((p) => <PostPreview post={p} />) : <p className="empty-state">No posts found yet.</p>}
      </section>
      {pagination.totalPages > 1 ? <Pagination info={pagination} /> : null}
    </section>,
  renderPost: ({ post }) =>
    <article className="page-card post-page" id={post.id}>
      <header className="post-header">
        <p className="page-meta"><a href="/">Back to home</a></p>
        <h1 className="post-title">{post.title}</h1>
        <div className="post-meta">
          {post.date ? <time dateTime={post.date}>{formatDate(post.date)}</time> : null}
          <span>{post.relativeSourcePath}</span>
        </div>
        {post.tags.length > 0 ? <TagList tags={post.tags} /> : null}
      </header>
      <section className="content" id={`content-${post.slug}`}>{raw(theme.renderMarkdown(post.body))}</section>
    </article>,
  renderTagsIndex: ({ site, tags, pagination }) =>
    <section className="page-card section-stack">
      <header className="page-header">
        <p className="page-meta"><a href="/">Back to home</a></p>
        <h1 className="post-title">Tags</h1>
        <p className="site-tagline">{site.title} has {pagination.totalItems} tag{pagination.totalItems === 1 ? "" : "s"}.</p>
      </header>
      <section className="taxonomy-list">
        {tags.length > 0 ? tags.map((t) => <TagSummaryCard tag={t} />) : <p className="empty-state">No tags found yet.</p>}
      </section>
      {pagination.totalPages > 1 ? <Pagination info={pagination} /> : null}
    </section>,
  renderTag: ({ tag, pagination }) =>
    <section className="page-card section-stack" id={`tag-${tag.slug}`}>
      <header className="page-header">
        <p className="page-meta"><a href="/tags/">Back to tags</a></p>
        <h1 className="post-title">{tag.name}</h1>
        <p className="site-tagline">{tag.count} post{tag.count === 1 ? "" : "s"} in this tag.</p>
      </header>
      <section className="post-list">
        {tag.posts.map((p) => <PostPreview post={p} />)}
      </section>
      {pagination.totalPages > 1 ? <Pagination info={pagination} /> : null}
    </section>,
  renderArchives: ({ archives, pagination }) =>
    <section className="page-card section-stack">
      <header className="page-header">
        <p className="page-meta"><a href="/">Back to home</a></p>
        <h1 className="post-title">Archives</h1>
        <p className="site-tagline">Posts grouped by month.</p>
      </header>
      <section className="archive-list">
        {archives.length > 0 ? archives.map((g) => <ArchiveGroup group={g} />) : <p className="empty-state">No dated posts found yet.</p>}
      </section>
      {pagination.totalPages > 1 ? <Pagination info={pagination} /> : null}
    </section>,
});

export default theme;

function PostPreview({ post }: { post: Post }) {
  return (
    <article className="post-preview" id={post.id}>
      <header>
        <h2 className="post-preview-title"><a className="post-preview-link" href={post.url}>{post.title}</a></h2>
        <div className="post-meta">
          {post.date ? <time dateTime={post.date}>{formatDate(post.date)}</time> : null}
          <span>{post.relativeSourcePath}</span>
        </div>
      </header>
      {post.summary ? <p className="post-summary">{post.summary}</p> : null}
      {post.tags.length > 0 ? <TagList tags={post.tags} /> : null}
    </article>
  );
}

function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;

  return (
    <ul className="tag-list">
      {tags.map((tag) => <li className="tag">{tag}</li>)}
    </ul>
  );
}

function TagSummaryCard({ tag }: { tag: TagSummary }) {
  return (
    <article className="taxonomy-card" id={`tag-summary-${tag.slug}`}>
      <h2><a className="taxonomy-link" href={tag.url}>{tag.name}</a></h2>
      <p className="page-meta">{tag.count} post{tag.count === 1 ? "" : "s"}</p>
    </article>
  );
}

function ArchiveGroup({ group }: { group: ArchiveGroup }) {
  return (
    <section className="archive-group" id={group.anchor}>
      <h2 className="post-preview-title">{group.label}</h2>
      <div className="archive-posts">
        {group.posts.map((post) => <ArchivePost post={post} />)}
      </div>
    </section>
  );
}

function ArchivePost({ post }: { post: Post }) {
  return (
    <article className="archive-post" id={`archive-post-${post.slug}`}>
      <a href={post.url}>{post.title}</a>
      <span className="page-meta">{post.date ? formatDate(post.date) : ""}</span>
    </article>
  );
}

function Pagination({ info }: { info: PaginationInfo }) {
  if (info.totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      {info.prevUrl ? <a className="pagination-link" href={info.prevUrl}>Previous</a> : null}
      {info.links.map((link) =>
        link.current
          ? <span className="pagination-current" aria-current="page">{link.number}</span>
          : <a className="pagination-link" href={link.url}>{link.number}</a>,
      )}
      {info.nextUrl ? <a className="pagination-link" href={info.nextUrl}>Next</a> : null}
    </nav>
  );
}

function alignAttr(align?: string): string {
  if (!align) return "";
  return ` style="text-align:${escapeHtmlAttr(align)}"`;
}
