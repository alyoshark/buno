export type FrontMatter = Record<string, unknown>;

export type Post = {
  title: string;
  slug: string;
  url: string;
  date?: string;
  summary?: string;
  draft: boolean;
  tags: string[];
  id: string;
  sourcePath: string;
  relativeSourcePath: string;
  body: string;
};

export type SiteMetadata = {
  title: string;
  description: string;
  url?: string;
};

export type ServeConfig = {
  port?: number;
};

export type ImageConfig = {
  enabled?: boolean;
  max_width?: number;
  quality?: number;
  placeholder?: boolean;
};

export type BlogConfig = {
  title?: string;
  description?: string;
  url?: string;
  theme?: string;
  pageSize?: number;
  page_size?: number;
  pagination?: {
    pageSize?: number;
    page_size?: number;
  };
  images?: ImageConfig;
  serve?: ServeConfig;
};

export type TagSummary = {
  name: string;
  slug: string;
  url: string;
  count: number;
};

export type TagPage = TagSummary & {
  posts: Post[];
};

export type ArchiveGroup = {
  key: string;
  year: number;
  month: number;
  label: string;
  anchor: string;
  posts: Post[];
};

export type ThemeAsset = {
  output: string;
  source?: string;
  content?: string;
};

export type MarkdownRenderers = NonNullable<Parameters<typeof Bun.markdown.render>[1]>;
export type MarkdownOptions = NonNullable<Parameters<typeof Bun.markdown.render>[2]>;

export type ThemeRenderDocumentArgs = {
  site: SiteMetadata;
  pageTitle: string;
  pageId: string;
  bodyClass: string;
  stylesheets: string[];
  content: string;
};

export type ThemeRenderIndexArgs = {
  site: SiteMetadata;
  posts: Post[];
  pagination: PaginationInfo;
};

export type ThemeRenderPostArgs = {
  site: SiteMetadata;
  post: Post;
};

export type ThemeRenderTagsIndexArgs = {
  site: SiteMetadata;
  tags: TagSummary[];
  pagination: PaginationInfo;
};

export type ThemeRenderTagArgs = {
  site: SiteMetadata;
  tag: TagPage;
  pagination: PaginationInfo;
};

export type ThemeRenderArchivesArgs = {
  site: SiteMetadata;
  archives: ArchiveGroup[];
  pagination: PaginationInfo;
};

export type PaginationLink = {
  number: number;
  url: string;
  current: boolean;
};

export type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  prevUrl?: string;
  nextUrl?: string;
  links: PaginationLink[];
};

export type Theme = {
  name: string;
  stylesheets?: ThemeAsset[];
  markdownOptions?: MarkdownOptions;
  renderers: MarkdownRenderers;
  renderMarkdown: (markdown: string) => string;
  renderDocument: (args: ThemeRenderDocumentArgs) => string;
  renderIndex: (args: ThemeRenderIndexArgs) => string;
  renderPost: (args: ThemeRenderPostArgs) => string;
  renderTagsIndex: (args: ThemeRenderTagsIndexArgs) => string;
  renderTag: (args: ThemeRenderTagArgs) => string;
  renderArchives: (args: ThemeRenderArchivesArgs) => string;
};

function toString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "html" in value) {
    return (value as { html: string }).html;
  }
  return String(value);
}

function wrapFn<T extends (...args: any[]) => unknown>(fn: T): T {
  return ((...args: any[]) => toString(fn(...args))) as T;
}

function wrapRenderers(renderers: MarkdownRenderers): MarkdownRenderers {
  const wrapped: Record<string, unknown> = {};
  for (const [key, fn] of Object.entries(renderers)) {
    wrapped[key] = typeof fn === "function" ? wrapFn(fn) : fn;
  }
  return wrapped as MarkdownRenderers;
}

export function defineTheme(theme: Omit<Theme, "renderMarkdown"> & { renderMarkdown?: Theme["renderMarkdown"] }): Theme {
  const markdownOptions = theme.markdownOptions;
  const renderers = wrapRenderers(theme.renderers);
  const renderMarkdown = theme.renderMarkdown ?? ((markdown: string) => Bun.markdown.render(markdown, renderers, markdownOptions));
  return {
    ...theme,
    renderers,
    renderMarkdown,
  };
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function escapeHtmlAttr(value: string): string {
  return escapeHtml(value);
}

export type { ProcessedImage } from "./images.ts";
export { getProcessedImage, renderResponsiveImage } from "./images.ts";

export function formatDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed);
}
