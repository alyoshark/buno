/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx, Fragment } from "../../../src/jsx/jsx-runtime.ts";
import { formatDate, type ThemeRenderArchivesArgs } from "../../../src/theme-api.ts";

function renderPagination(pagination: ThemeRenderArchivesArgs["pagination"]) {
  if (pagination.totalPages <= 1) return null;
  return (
    <nav className="theme-pagination" aria-label="Pagination">
      {pagination.prevUrl ? <a className="theme-page-link" href={pagination.prevUrl}>Previous</a> : null}
      {pagination.links.map((link) =>
        link.current
          ? <span className="theme-page-current" aria-current="page">{link.number}</span>
          : <a className="theme-page-link" href={link.url}>{link.number}</a>
      )}
      {pagination.nextUrl ? <a className="theme-page-link" href={pagination.nextUrl}>Next</a> : null}
    </nav>
  );
}

export function RenderArchives({ archives, pagination }: ThemeRenderArchivesArgs) {
  return (
    <section className="theme-hero">
      <p className="theme-eyebrow">Browse</p>
      <h1 className="theme-title">Archives</h1>
      <p className="theme-intro">A month-by-month view of dated posts.</p>
      <section className="theme-archive-list">
        {archives.length > 0 ? archives.map((g) => (
          <section className="theme-post" id={g.anchor}>
            <p className="theme-card-label">Archive</p>
            <h2 className="theme-card-title">{g.label}</h2>
            <div className="theme-archive-posts">
              {g.posts.map((post) => (
                <article className="theme-archive-post" id={`theme-archive-${post.slug}`}>
                  <a href={post.url}>{post.title}</a>
                  <span className="theme-meta">{post.date ? formatDate(post.date) : ""}</span>
                </article>
              ))}
            </div>
          </section>
        )) : <p className="theme-empty">No dated posts found yet.</p>}
      </section>
      {renderPagination(pagination)}
    </section>
  );
}
