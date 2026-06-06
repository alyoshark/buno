/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx, Fragment } from "../../../src/jsx/jsx-runtime.ts";
import { formatDate, type ThemeRenderTagArgs } from "../../../src/theme-api.ts";

export function RenderTag({ tag, pagination }: ThemeRenderTagArgs) {
  return (
    <section className="theme-hero">
      <p className="theme-eyebrow">Tag</p>
      <h1 className="theme-title">{tag.name}</h1>
      <p className="theme-intro">{tag.count} post{tag.count === 1 ? "" : "s"} filed under this tag.</p>
      <section className="theme-feed">
        {tag.posts.map((p) => (
          <article className="theme-card" id={p.id}>
            <p className="theme-card-label">Post</p>
            <h2 className="theme-card-title"><a href={p.url}>{p.title}</a></h2>
            <div className="theme-meta">
              {p.date ? <time dateTime={p.date}>{formatDate(p.date)}</time> : null}
              <span>{p.relativeSourcePath}</span>
            </div>
            {p.summary ? <p className="theme-card-summary">{p.summary}</p> : null}
            {p.tags.length > 0 ? (
              <ul className="theme-tags">
                {p.tags.map((tag) => <li className="theme-tag">{tag}</li>)}
              </ul>
            ) : null}
          </article>
        ))}
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
