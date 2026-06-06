import { join, relative } from "node:path";
import type { BlogConfig, ImageConfig, SiteMetadata } from "./theme-api.ts";
import { humanizeSlug } from "./utils.ts";

const DEFAULT_CONFIG_FILE = "blog.config.yaml";
const CONTENT_ROOT = join("content", "posts");

export async function loadBlogConfig(blogRoot: string): Promise<BlogConfig> {
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

export function buildSiteMetadata(blogFolderArg: string, blogRoot: string, config: BlogConfig): SiteMetadata {
  return {
    title: config.title ?? humanizeSlug(blogFolderArg),
    description: config.description ?? `Posts loaded from ${relative(process.cwd(), join(blogRoot, CONTENT_ROOT)) || CONTENT_ROOT}`,
    url: config.url,
  };
}

export function resolvePageSize(config: BlogConfig): number {
  const candidate = config.pagination?.page_size ?? config.pagination?.pageSize ?? config.page_size ?? config.pageSize;
  if (typeof candidate !== "number" || !Number.isFinite(candidate) || candidate < 1) {
    return 10;
  }

  return Math.floor(candidate);
}

export function resolveImageConfig(config: BlogConfig): ImageConfig {
  return {
    enabled: config.images?.enabled ?? false,
    max_width: config.images?.max_width ?? 1200,
    quality: config.images?.quality ?? 82,
    placeholder: config.images?.placeholder ?? true,
  };
}
