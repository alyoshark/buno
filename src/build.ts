import { mkdir, readdir, rm } from "node:fs/promises";
import { basename, extname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import defaultTheme from "./default-theme.ts";
import type { BlogConfig, FrontMatter, Post, SiteMetadata, Theme, ThemeAsset } from "./theme-api.ts";

const DEFAULT_BLOG_FOLDER = "example-blog";
const DEFAULT_CONFIG_FILE = "blog.config.yaml";
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
  const site = buildSiteMetadata(blogFolderArg, blogRoot, config);
  const themeResolution = await resolveTheme(blogRoot, config.theme);
  const theme = themeResolution.theme;
  const stylesheets = await publishThemeAssets(themeResolution.themeDir, outputDir, theme.stylesheets ?? []);

  await Bun.write(join(outputDir, "index.html"), theme.renderDocument({
    site,
    pageTitle: site.title,
    pageId: "page-home",
    bodyClass: "page page-home",
    stylesheets,
    content: theme.renderIndex({ site, posts }),
  }));

  for (const post of posts) {
    const pageDir = join(outputDir, "posts", post.slug);
    await ensureDir(pageDir);
    await Bun.write(join(pageDir, "index.html"), theme.renderDocument({
      site,
      pageTitle: `${post.title} | ${site.title}`,
      pageId: `page-${post.slug}`,
      bodyClass: "page page-post",
      stylesheets,
      content: theme.renderPost({ site, post }),
    }));
  }

  console.log(`Built ${posts.length} post(s) into ${relative(process.cwd(), outputDir) || "."} using theme "${theme.name}"`);
}

async function loadBlogConfig(blogRoot: string): Promise<BlogConfig> {
  const configPath = join(blogRoot, DEFAULT_CONFIG_FILE);
  const configFile = Bun.file(configPath);
  if (!(await configFile.exists())) {
    return {};
  }

  const parsed = Bun.YAML.parse(await configFile.text());
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    return parsed as BlogConfig;
  }

  throw new Error(`${DEFAULT_CONFIG_FILE} must parse into an object.`);
}

async function loadPosts(blogRoot: string, contentDir: string): Promise<Post[]> {
  const files = await collectMarkdownFiles(contentDir);
  const posts = await Promise.all(
    files.map(async (sourcePath) => {
      const source = await Bun.file(sourcePath).text();
      const { frontMatter, body } = parseFrontMatter(source);
      const relativeSourcePath = relative(blogRoot, sourcePath);
      const fileSlug = basename(sourcePath, extname(sourcePath));
      const slug = slugify(asString(frontMatter.slug) ?? asString(frontMatter.title) ?? fileSlug);
      const title = asString(frontMatter.title) ?? humanizeSlug(fileSlug);
      const date = normalizeDate(asString(frontMatter.date));
      const tags = normalizeTags(frontMatter.tags);
      const summary = asString(frontMatter.summary) ?? asString(frontMatter.description);
      const url = `/posts/${slug}/`;

      return {
        title,
        slug,
        url,
        date,
        summary: summary ?? extractSummary(body),
        draft: asBoolean(frontMatter.draft),
        tags,
        id: `post-${slug}`,
        sourcePath,
        relativeSourcePath,
        body,
      } satisfies Post;
    }),
  );

  return posts.filter((post) => !post.draft).sort(comparePosts);
}

async function resolveTheme(blogRoot: string, configuredThemePath?: string): Promise<{ theme: Theme; themeDir?: string }> {
  const candidateDir = configuredThemePath
    ? resolve(blogRoot, configuredThemePath)
    : join(blogRoot, "theme");
  const themeFilePath = join(candidateDir, "theme.ts");
  const themeFile = Bun.file(themeFilePath);

  if (!(await themeFile.exists())) {
    return { theme: defaultTheme };
  }

  const module = await import(pathToFileURL(themeFilePath).href);
  const importedTheme = (module.default ?? module.theme) as Theme | undefined;
  if (!importedTheme) {
    throw new Error(`Theme module ${themeFilePath} must export a default theme.`);
  }

  return { theme: importedTheme, themeDir: candidateDir };
}

async function publishThemeAssets(themeDir: string | undefined, outputDir: string, assets: ThemeAsset[]): Promise<string[]> {
  if (assets.length === 0) {
    return [];
  }

  const assetDir = join(outputDir, "assets");
  await ensureDir(assetDir);

  const hrefs: string[] = [];
  for (const asset of assets) {
    const outputName = asset.output;
    const outputPath = join(assetDir, outputName);

    if (typeof asset.content === "string") {
      await Bun.write(outputPath, asset.content);
    } else if (asset.source && themeDir) {
      await Bun.write(outputPath, Bun.file(join(themeDir, asset.source)));
    } else {
      throw new Error(`Theme asset "${outputName}" must provide either inline content or a source file.`);
    }

    hrefs.push(`/assets/${outputName}`);
  }

  return hrefs;
}

function buildSiteMetadata(blogFolderArg: string, blogRoot: string, config: BlogConfig): SiteMetadata {
  return {
    title: config.title ?? humanizeSlug(blogFolderArg),
    description: config.description ?? `Posts loaded from ${relative(process.cwd(), join(blogRoot, CONTENT_ROOT)) || CONTENT_ROOT}`,
  };
}

function parseFrontMatter(source: string): { frontMatter: FrontMatter; body: string } {
  if (!source.startsWith("---\n") && !source.startsWith("---\r\n")) {
    return { frontMatter: {}, body: source.trim() };
  }

  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontMatter: {}, body: source.trim() };
  }

  const frontMatterText = match[1];
  const body = match[2];
  if (typeof frontMatterText !== "string" || typeof body !== "string") {
    throw new Error("Front matter parsing failed to capture the expected sections.");
  }

  const parsed = Bun.YAML.parse(frontMatterText);
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    return { frontMatter: parsed as FrontMatter, body: body.trim() };
  }

  throw new Error("Expected front matter to parse into an object.");
}

async function collectMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await Array.fromAsync(new Bun.Glob("**/*.md").scan({ cwd: dir, absolute: true }));
  return entries.sort((a, b) => a.localeCompare(b));
}

async function cleanDir(path: string) {
  await ensureDir(path);
  const entries = await readdir(path);
  await Promise.all(entries.map((entry) => rm(join(path, entry), { recursive: true, force: true })));
}

async function ensureDir(path: string) {
  await mkdir(path, { recursive: true });
}

function comparePosts(a: Post, b: Post) {
  if (a.date && b.date) {
    return b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug);
  }

  if (a.date) return -1;
  if (b.date) return 1;
  return a.slug.localeCompare(b.slug);
}

function normalizeDate(input?: string): string | undefined {
  if (!input) return undefined;
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return input;
  }
  return parsed.toISOString();
}

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function extractSummary(markdown: string): string | undefined {
  const plain = markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_>~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) {
    return undefined;
  }

  return plain.slice(0, 180).trim() + (plain.length > 180 ? "..." : "");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "post";
}

function humanizeSlug(value: string): string {
  return value
    .split(/[/_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

await main();
