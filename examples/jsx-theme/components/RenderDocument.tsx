/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx, Fragment, raw } from "../../../src/jsx/jsx-runtime.ts";
import type { ThemeRenderDocumentArgs } from "../../../src/theme-api.ts";

export function RenderDocument({ site, pageTitle, pageId, bodyClass, stylesheets, content }: ThemeRenderDocumentArgs) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{pageTitle}</title>
        {stylesheets.map((href) => <link rel="stylesheet" href={href} />)}
        {site.url ? <link rel="alternate" type="application/rss+xml" title={site.title} href={`${site.url.replace(/\/$/, "")}/feed.xml`} /> : null}
      </head>
      <body id={pageId} className={bodyClass}>
        <div className="theme-frame">
          <header className="theme-site-header">
            <a className="theme-home-link" href="/">{site.title}</a>
            <nav className="theme-nav" aria-label="Primary">
              <a href="/">Home</a>
              <a href="/tags/">Tags</a>
              <a href="/archives/">Archives</a>
            </nav>
          </header>
          <p className="theme-site-description">{site.description}</p>
          <main className="theme-main">{raw(content)}</main>
        </div>
      </body>
    </html>
  );
}
