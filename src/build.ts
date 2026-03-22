import { dirname, join, relative, resolve } from "node:path";
import { buildSiteMetadata, loadBlogConfig, resolvePageSize } from "./config.ts";
import { loadPosts } from "./content.ts";
import { paginateItems } from "./pagination.ts";
import { buildArchives, buildTagPages, buildTagSummaries } from "./site-data.ts";
import { publishThemeAssets, resolveTheme } from "./theme-loader.ts";
import { cleanDir, ensureDir } from "./utils.ts";

const DEFAULT_BLOG_FOLDER = "example-blog";
const CONTENT_ROOT = join("content", "posts");
const OUTPUT_ROOT = "public";

async function main() {
  const blogFolderArg = process.argv[2] ?? DEFAULT_BLOG_FOLDER;
  const blogRoot = resolve(process.cwd(), blogFolderArg);
  const contentDir = join(blogRoot, CONTENT_ROOT);
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
    `Built ${posts.length} post(s), ${tags.length} tag page(s), and ${archives.length} archive group(s) into ${relative(process.cwd(), outputDir) || "."} using theme "${themeResolution.theme.name}"`,
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
