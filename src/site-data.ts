import type { ArchiveGroup, Post, TagPage, TagSummary } from "./theme-api.ts";
import { slugify } from "./utils.ts";

export function buildTagPages(posts: Post[]): TagPage[] {
  const buckets = new Map<string, { name: string; posts: Post[] }>();

  for (const post of posts) {
    for (const tagName of post.tags) {
      const slug = slugify(tagName);
      const existing = buckets.get(slug);
      if (existing) {
        existing.posts.push(post);
      } else {
        buckets.set(slug, { name: tagName, posts: [post] });
      }
    }
  }

  return Array.from(buckets.entries())
    .map(([slug, bucket]) => ({
      name: bucket.name,
      slug,
      url: `/tags/${slug}/`,
      count: bucket.posts.length,
      posts: bucket.posts,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function buildTagSummaries(tags: TagPage[]): TagSummary[] {
  return tags.map(({ name, slug, url, count }) => ({ name, slug, url, count }));
}

export function buildArchives(posts: Post[]): ArchiveGroup[] {
  const buckets = new Map<string, Post[]>();

  for (const post of posts) {
    if (!post.date) continue;
    const date = new Date(post.date);
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.push(post);
    } else {
      buckets.set(key, [post]);
    }
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, groupedPosts]) => {
      const first = groupedPosts[0];
      if (!first?.date) {
        throw new Error(`Archive group ${key} is missing a dated post.`);
      }

      const date = new Date(first.date);
      return {
        key,
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        label: new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date),
        anchor: `archive-${key}`,
        posts: groupedPosts,
      } satisfies ArchiveGroup;
    });
}
