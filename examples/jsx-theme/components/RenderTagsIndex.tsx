/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx, Fragment } from "../../../src/jsx/jsx-runtime.ts";
import type { ThemeRenderTagsIndexArgs } from "../../../src/theme-api.ts";

export function RenderTagsIndex({ site, tags, pagination }: ThemeRenderTagsIndexArgs) {
  return (
    <section className="theme-hero">
      <p className="theme-eyebrow">Browse</p>
      <h1 className="theme-title">Tags</h1>
      <p className="theme-intro">Every tag in the site with a direct count.</p>
      <section className="theme-feed">
        {tags.length > 0 ? tags.map((t) => (
          <article className="theme-card" id={`theme-tag-${t.slug}`}>
            <p className="theme-card-label">Tag</p>
            <h2 className="theme-card-title"><a href={t.url}>{t.name}</a></h2>
            <p className="theme-card-summary">{t.count} post{t.count === 1 ? "" : "s"}</p>
          </article>
        )) : <p className="theme-empty">No tags found yet.</p>}
      </section>
      {pagination.totalPages > 1 ? (
        <nav className="theme-pagination" aria-label="Pagination">
          {pagination.prevUrl ? <a className="theme-page-link" href={pagination.prevUrl}>Previous</a> : null}
          {pagination.links.map((link) =>
            link.current
              ? <span className="theme-page-current" aria-current="page">{link.number}</span>
              : <a className="theme-page-link" href={link.url}>{link.number}</a>,
          )}
          {pagination.nextUrl ? <a className="theme-page-link" href={pagination.nextUrl}>Next</a> : null}
        </nav>
      ) : null}
    </section>
  );
}
