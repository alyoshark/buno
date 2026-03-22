import { basename, extname } from "node:path";
import type { FrontMatter, Post } from "./theme-api.ts";
import { asBoolean, asString, extractSummary, normalizeDate, normalizeTags, humanizeSlug, slugify } from "./utils.ts";

export async function loadPosts(blogRoot: string, contentDir: string): Promise<Post[]> {
  const files = await collectMarkdownFiles(contentDir);
  const posts = await Promise.all(
    files.map(async (sourcePath) => {
      const source = await Bun.file(sourcePath).text();
      const { frontMatter, body } = parseFrontMatter(source);
      const relativeSourcePath = sourcePath.slice(blogRoot.length + 1);
      const fileSlug = basename(sourcePath, extname(sourcePath));
      const slug = slugify(asString(frontMatter.slug) ?? asString(frontMatter.title) ?? fileSlug);
      const title = asString(frontMatter.title) ?? humanizeSlug(fileSlug);
      const date = normalizeDate(asString(frontMatter.date));
      const tags = normalizeTags(frontMatter.tags);
      const summary = asString(frontMatter.summary) ?? asString(frontMatter.description);

      return {
        title,
        slug,
        url: `/posts/${slug}/`,
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

function comparePosts(a: Post, b: Post) {
  if (a.date && b.date) {
    return b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug);
  }

  if (a.date) return -1;
  if (b.date) return 1;
  return a.slug.localeCompare(b.slug);
}
