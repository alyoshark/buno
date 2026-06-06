import { escapeHtml } from "./theme-api.ts";
import type { Post } from "./theme-api.ts";

export function generateRssFeed(posts: Post[], siteTitle: string, siteDescription: string, siteUrl: string): string {
  const escapedTitle = escapeHtml(siteTitle);
  const escapedDesc = escapeHtml(siteDescription);

  const items = posts
    .filter((p) => p.date)
    .map((post) => {
      const postUrl = `${siteUrl.replace(/\/$/, "")}${post.url}`;
      const pubDate = new Date(post.date!).toUTCString();
      const guid = postUrl;
      const description = post.summary ? escapeHtml(post.summary) : "";

      return `  <item>
    <title>${escapeHtml(post.title)}</title>
    <link>${escapeXml(guid)}</link>
    <guid isPermaLink="true">${escapeXml(guid)}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${escapeXml(description)}</description>
  </item>`;
    })
    .join("\n");

  const lastBuild = posts.length > 0 && posts[0]?.date ? new Date(posts[0].date).toUTCString() : new Date().toUTCString();

  return `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapedTitle}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapedDesc}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${escapeXml(siteUrl.replace(/\/$/, "") + "/feed.xml")}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
