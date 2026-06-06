export function generateSitemap(pages: string[], siteUrl: string): string {
  const urls = pages
    .map((path) => {
      const loc = `${siteUrl.replace(/\/$/, "")}${path}`;
      return `  <url>
    <loc>${escapeXml(loc)}</loc>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
