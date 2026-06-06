import { dirname, join, relative, resolve } from "node:path";
import { buildSiteMetadata, loadBlogConfig, resolveImageConfig, resolvePageSize } from "./config.ts";
import { loadPosts } from "./content.ts";
import { generateRssFeed } from "./feed.ts";
import { paginateItems } from "./pagination.ts";
import { generateSitemap } from "./sitemap.ts";
import { buildArchives, buildTagPages, buildTagSummaries } from "./site-data.ts";
import { publishThemeAssets, resolveTheme } from "./theme-loader.ts";
import { processContentImages } from "./images.ts";
import { cleanDir, ensureDir } from "./utils.ts";

const DEFAULT_BLOG_FOLDER = "examples/blog";
const CONTENT_ROOT = join("content", "posts");
const CONTENT_ASSETS_ROOT = "content";
const OUTPUT_ROOT = "public";

async function main() {
  const blogFolderArg = process.argv[2] ?? DEFAULT_BLOG_FOLDER;
  const blogRoot = resolve(process.cwd(), blogFolderArg);
  const contentDir = join(blogRoot, CONTENT_ROOT);
  const contentRoot = join(blogRoot, CONTENT_ASSETS_ROOT);
  const outputDir = join(blogRoot, OUTPUT_ROOT);

  await ensureDir(contentDir);
  await cleanDir(outputDir);

  const config = await loadBlogConfig(blogRoot);
  const posts = await loadPosts(blogRoot, contentDir);
  const tags = buildTagPages(posts);
  const tagSummaries = buildTagSummaries(tags);
  const archives = buildArchives(posts);
  const pageSize = resolvePageSize(config);
  const site = buildSiteMetadata(blogFolderArg, blogRoot, config);
  const themeResolution = await resolveTheme(blogRoot, config.theme);
  const stylesheets = await publishThemeAssets(themeResolution.themeDir, outputDir, themeResolution.theme.stylesheets ?? []);
  await processContentImages(contentRoot, outputDir, resolveImageConfig(config));

  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const totalTagPages = Math.max(1, Math.ceil(tagSummaries.length / pageSize));
  const totalArchivePages = Math.max(1, Math.ceil(archives.length / pageSize));
  const sitemapPages: string[] = ["/"];

  for (let i = 2; i <= totalPages; i++) sitemapPages.push(`/page/${i}/`);
  sitemapPages.push("/tags/");
  for (let i = 2; i <= totalTagPages; i++) sitemapPages.push(`/tags/page/${i}/`);
  sitemapPages.push("/archives/");
  for (let i = 2; i <= totalArchivePages; i++) sitemapPages.push(`/archives/page/${i}/`);

  for (const post of posts) sitemapPages.push(post.url);
  for (const tag of tags) {
    sitemapPages.push(tag.url);
    const tagPostPages = Math.max(1, Math.ceil(tag.posts.length / pageSize));
    for (let i = 2; i <= tagPostPages; i++) sitemapPages.push(`/tags/${tag.slug}/page/${i}/`);
  }

  if (site.url) {
    await writePage(join(outputDir, "feed.xml"), generateRssFeed(posts, site.title, site.description, site.url));
    await writePage(join(outputDir, "sitemap.xml"), generateSitemap(sitemapPages, site.url));
  }

  await Promise.all(
    paginateItems(posts, pageSize, "/").map((page) =>
      writePage(
        join(outputDir, filePathForPage(page.pagination.currentPage)),
        themeResolution.theme.renderDocument({
          site,
          pageTitle: page.pagination.currentPage === 1 ? site.title : `${site.title} | Page ${page.pagination.currentPage}`,
          pageId: page.pagination.currentPage === 1 ? "page-home" : `page-home-${page.pagination.currentPage}`,
          bodyClass: "page page-home",
          stylesheets,
          content: themeResolution.theme.renderIndex({ site, posts: page.items, pagination: page.pagination }),
        }),
      ),
    ),
  );

  await Promise.all(
    paginateItems(tagSummaries, pageSize, "/tags/").map((page) =>
      writePage(
        join(outputDir, "tags", filePathForPage(page.pagination.currentPage)),
        themeResolution.theme.renderDocument({
          site,
          pageTitle: page.pagination.currentPage === 1 ? `Tags | ${site.title}` : `Tags | Page ${page.pagination.currentPage} | ${site.title}`,
          pageId: page.pagination.currentPage === 1 ? "page-tags" : `page-tags-${page.pagination.currentPage}`,
          bodyClass: "page page-tags",
          stylesheets,
          content: themeResolution.theme.renderTagsIndex({ site, tags: page.items, pagination: page.pagination }),
        }),
      ),
    ),
  );

  await Promise.all(
    paginateItems(archives, pageSize, "/archives/").map((page) =>
      writePage(
        join(outputDir, "archives", filePathForPage(page.pagination.currentPage)),
        themeResolution.theme.renderDocument({
          site,
          pageTitle: page.pagination.currentPage === 1 ? `Archives | ${site.title}` : `Archives | Page ${page.pagination.currentPage} | ${site.title}`,
          pageId: page.pagination.currentPage === 1 ? "page-archives" : `page-archives-${page.pagination.currentPage}`,
          bodyClass: "page page-archives",
          stylesheets,
          content: themeResolution.theme.renderArchives({ site, archives: page.items, pagination: page.pagination }),
        }),
      ),
    ),
  );

  await Promise.all(
    posts.map((post) =>
      writePage(
        join(outputDir, "posts", post.slug, "index.html"),
        themeResolution.theme.renderDocument({
          site,
          pageTitle: `${post.title} | ${site.title}`,
          pageId: `page-${post.slug}`,
          bodyClass: "page page-post",
          stylesheets,
          content: themeResolution.theme.renderPost({ site, post }),
        }),
      ),
    ),
  );

  await Promise.all(
    tags.map((tag) =>
      Promise.all(
        paginateItems(tag.posts, pageSize, tag.url).map((page) =>
          writePage(
            join(outputDir, "tags", tag.slug, filePathForPage(page.pagination.currentPage)),
            themeResolution.theme.renderDocument({
              site,
              pageTitle:
                page.pagination.currentPage === 1
                  ? `${tag.name} | Tags | ${site.title}`
                  : `${tag.name} | Tags | Page ${page.pagination.currentPage} | ${site.title}`,
              pageId: page.pagination.currentPage === 1 ? `page-tag-${tag.slug}` : `page-tag-${tag.slug}-${page.pagination.currentPage}`,
              bodyClass: "page page-tag",
              stylesheets,
              content: themeResolution.theme.renderTag({ site, tag: { ...tag, posts: page.items }, pagination: page.pagination }),
            }),
          ),
        ),
      ),
    ),
  );

  console.log(
    `Built ${posts.length} post(s), ${tags.length} tag page(s), ${archives.length} archive group(s), sitemap, and feed into ${relative(process.cwd(), outputDir) || "."} using theme "${themeResolution.theme.name}"`,
  );
}

async function writePage(outputPath: string, html: string) {
  await ensureDir(dirname(outputPath));
  await Bun.write(outputPath, html);
}

function filePathForPage(pageNumber: number): string {
  return pageNumber <= 1 ? "index.html" : join("page", String(pageNumber), "index.html");
}

await main();
