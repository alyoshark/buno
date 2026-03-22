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
};

export type BlogConfig = {
  title?: string;
  description?: string;
  theme?: string;
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
};

export type ThemeRenderPostArgs = {
  site: SiteMetadata;
  post: Post;
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
};

export function defineTheme(theme: Omit<Theme, "renderMarkdown"> & { renderMarkdown?: Theme["renderMarkdown"] }): Theme {
  const renderMarkdown = theme.renderMarkdown ?? ((markdown: string) => Bun.markdown.render(markdown, theme.renderers, theme.markdownOptions));
  return { ...theme, renderMarkdown };
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
