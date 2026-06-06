/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx, Fragment, raw } from "../../../src/jsx/jsx-runtime.ts";
import { escapeHtmlAttr, getProcessedImage, renderResponsiveImage } from "../../../src/theme-api.ts";

export const renderers = {
  heading: (children: string, meta?: { level?: number; id?: string }) => {
    const level = meta?.level ?? 1;
    const id = meta?.id;
    const idAttr = id ? ` id="${escapeHtmlAttr(id)}"` : "";
    const kicker = level <= 2 ? `<span class="theme-kicker">Section ${level}</span>` : "";
    const anchor = id ? `<a class="theme-heading-anchor" href="#${escapeHtmlAttr(id)}">link</a>` : "";
    return `<h${level}${idAttr} class="theme-heading" data-level="${level}">${kicker}<span class="theme-heading-text">${children}</span>${anchor}</h${level}>`;
  },
  paragraph: (children: string) =>
    <p className="theme-paragraph">{raw(children)}</p>,
  blockquote: (children: string) =>
    <blockquote className="theme-blockquote">{raw(children)}</blockquote>,
  code: (children: string, meta?: { language?: string }) => {
    const language = meta?.language ?? "plain";
    return <pre className="theme-codeblock" data-language={language}><code className={`theme-code language-${language}`}>{raw(children)}</code></pre>;
  },
  list: (children: string, meta?: { ordered?: boolean; depth?: number }) => {
    const tag = meta?.ordered ? "ol" : "ul";
    return `<${tag} class="theme-list" data-depth="${meta?.depth ?? 0}">${children}</${tag}>`;
  },
  listItem: (children: string, meta?: { checked?: boolean }) =>
    <li className="theme-list-item" data-checked={typeof meta?.checked === "boolean" ? meta.checked : undefined}>{raw(children)}</li>,
  hr: () =>
    <hr className="theme-rule" />,
  table: (children: string) =>
    <div className="theme-table-wrap"><table className="theme-table">{raw(children)}</table></div>,
  strong: (children: string) =>
    <strong className="theme-strong">{raw(children)}</strong>,
  emphasis: (children: string) =>
    <em className="theme-emphasis">{raw(children)}</em>,
  link: (children: string, meta?: { href?: string }) =>
    <a className="theme-link" href={meta?.href ?? "#"}>{raw(children)}</a>,
  image: (children: string, meta?: { src?: string; title?: string }) => {
    const src = meta?.src ?? "";
    const alt = children ?? "";
    const processed = getProcessedImage(src);
    if (processed) {
      return <figure className="theme-figure">{raw(renderResponsiveImage(src, alt, processed))}</figure>;
    }
    return <figure className="theme-figure"><img className="theme-image" src={src} alt={alt} loading="lazy" /></figure>;
  },
  codespan: (children: string) =>
    <code className="theme-inline-code">{raw(children)}</code>,
  strikethrough: (children: string) =>
    <del className="theme-strike">{raw(children)}</del>,
};
