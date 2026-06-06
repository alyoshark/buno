/// <reference path="./types.d.ts" />

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

const JSX_ELEMENT = Symbol("jsx-element");

export type JSXNode = {
  $$jsx: typeof JSX_ELEMENT;
  html: string;
};

function esc(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function raw(html: string): JSXNode & { __html: string } {
  return { $$jsx: JSX_ELEMENT, html, __html: html };
}

function isJsxNode(value: unknown): value is JSXNode {
  return typeof value === "object" && value !== null && (value as any).$$jsx === JSX_ELEMENT;
}

function renderChildren(children: unknown): string {
  if (children == null || typeof children === "boolean") return "";
  if (typeof children === "string") return esc(children);
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(renderChildren).join("");
  if (isJsxNode(children)) return children.html;
  return String(children);
}

function attrName(key: string): string {
  if (key === "className") return "class";
  if (key === "htmlFor") return "for";
  if (key === "crossOrigin") return "crossorigin";
  if (key === "httpEquiv") return "http-equiv";
  if (key === "acceptCharset") return "accept-charset";
  if (key.startsWith("aria")) return key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  if (key.startsWith("data")) return key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  if (key === "autoPlay") return "autoplay";
  if (key === "autoFocus") return "autofocus";
  if (key === "charSet") return "charset";
  if (key === "controlsList") return "controlslist";
  if (key === "formAction") return "formaction";
  if (key === "formEncType") return "formenctype";
  if (key === "formMethod") return "formmethod";
  if (key === "formNoValidate") return "formnovalidate";
  if (key === "formTarget") return "formtarget";
  if (key === "inputMode") return "inputmode";
  if (key === "noModule") return "nomodule";
  if (key === "playsInline") return "playsinline";
  if (key === "readOnly") return "readonly";
  return key;
}

function renderAttrs(props: Record<string, unknown>): string {
  let out = "";
  for (const [key, value] of Object.entries(props)) {
    if (key === "children" || key === "dangerouslySetInnerHTML" || key === "key" || key === "ref") continue;
    if (value == null || value === false) continue;
    const name = attrName(key);
    if (value === true) {
      out += ` ${name}`;
    } else if (typeof value === "number") {
      out += ` ${name}="${value}"`;
    } else {
      out += ` ${name}="${esc(String(value))}"`;
    }
  }
  return out;
}

export function jsx(type: any, props: Record<string, unknown> | null, ...children: unknown[]): JSXNode {
  const child = children.length <= 1 ? (children[0] ?? null) : children;
  const { dangerouslySetInnerHTML, ...attrs } = props ?? {};
  const mergedChildren = child != null
    ? { children: child, ...(dangerouslySetInnerHTML ? { dangerouslySetInnerHTML } : {}) }
    : (dangerouslySetInnerHTML ? { dangerouslySetInnerHTML } : {});

  if (typeof type === "function") {
    return type({ ...attrs, ...mergedChildren });
  }

  if (type === Fragment) {
    return raw(renderChildren(child));
  }

  const tag = type as string;
  const attrsHtml = renderAttrs(attrs);
  const childrenHtml = dangerouslySetInnerHTML != null
    ? String(dangerouslySetInnerHTML)
    : renderChildren(child);

  const html = VOID_ELEMENTS.has(tag)
    ? `<${tag}${attrsHtml}>`
    : `<${tag}${attrsHtml}>${childrenHtml}</${tag}>`;

  return { $$jsx: JSX_ELEMENT, html };
}

export function jsxs(type: any, props: Record<string, unknown> | null, childrenList: unknown): JSXNode {
  return jsx(type, { ...props, children: childrenList } as Record<string, unknown>);
}

export function jsxDEV(type: any, props: Record<string, unknown> | null, _key?: string): JSXNode {
  return jsx(type, props, _key);
}

export function Fragment({ children }: { children?: unknown }): JSXNode {
  return raw(renderChildren(children));
}
