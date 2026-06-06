/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx, Fragment, raw } from "../../../src/jsx/jsx-runtime.ts";
import { escapeHtml, formatDate, type ThemeRenderPostArgs } from "../../../src/theme-api.ts";

export function RenderPost({ post, site, renderMarkdown }: ThemeRenderPostArgs & { renderMarkdown: (md: string) => string }) {
  return (
    <article className="theme-post" id={post.id}>
      <p className="theme-back"><a href="/">Return to {escapeHtml(site.title)}</a></p>
      <header className="theme-post-header">
        <h1 className="theme-title">{post.title}</h1>
        <div className="theme-meta">
          {post.date ? <time dateTime={post.date}>{formatDate(post.date)}</time> : null}
          <span>{post.relativeSourcePath}</span>
        </div>
        {post.tags.length > 0 ? (
          <ul className="theme-tags">
            {post.tags.map((tag) => <li className="theme-tag">{tag}</li>)}
          </ul>
        ) : null}
      </header>
      <section className="theme-content" id={`content-${post.slug}`}>{raw(renderMarkdown(post.body))}</section>
    </article>
  );
}
