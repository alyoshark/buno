type AriaAttrs = {
  [K in `aria-${string}`]?: string;
};

type DataAttrs = {
  [K in `data-${string}`]?: string | number | boolean;
};

type Attrs = {
  key?: string;
  ref?: unknown;
  children?: unknown;
  className?: string;
  htmlFor?: string;
  id?: string;
  title?: string;
  tabIndex?: number;
  style?: string;
  hidden?: boolean;
  accessKey?: string;
  contentEditable?: boolean;
  dir?: string;
  draggable?: boolean;
  enterKeyHint?: string;
  inputMode?: string;
  is?: string;
  lang?: string;
  itemID?: string;
  itemRef?: string;
  itemScope?: boolean;
  itemType?: string;
  nonce?: string;
  role?: string;
  slot?: string;
  spellCheck?: boolean;
  translate?: string;
  about?: string;
  datatype?: string;
  inlist?: unknown;
  prefix?: string;
  property?: string;
  rel?: string;
  resource?: string;
  rev?: string;
  typeof?: string;
  vocab?: string;
  autoCapitalize?: string;
  autoCorrect?: string;
  autoSave?: string;
  color?: string;
  results?: number;
  security?: string;
  unselectable?: string;
} & AriaAttrs & DataAttrs;

type AnchorAttrs = Attrs & {
  href?: string;
  target?: string;
  download?: string;
  ping?: string;
  hreflang?: string;
  media?: string;
  referrerPolicy?: string;
  type?: string;
};

type ImgAttrs = Attrs & {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  srcSet?: string;
  sizes?: string;
  crossOrigin?: string;
  decoding?: "async" | "sync" | "auto";
  loading?: "lazy" | "eager";
  referrerPolicy?: string;
  fetchPriority?: "high" | "low" | "auto";
};

type InputAttrs = Attrs & {
  type?: string;
  name?: string;
  value?: string | number;
  defaultValue?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  pattern?: string;
  accept?: string;
  multiple?: boolean;
  form?: string;
  formAction?: string;
  formEncType?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formTarget?: string;
  list?: string;
  maxLength?: number;
  minLength?: number;
  size?: number;
  src?: string;
  alt?: string;
};

type MetaAttrs = Attrs & {
  name?: string;
  content?: string;
  charset?: string;
  httpEquiv?: string;
  property?: string;
};

type LinkAttrs = Attrs & {
  href?: string;
  rel?: string;
  type?: string;
  title?: string;
  media?: string;
  sizes?: string;
  crossOrigin?: string;
  as?: string;
  fetchPriority?: "high" | "low" | "auto";
  hreflang?: string;
  imageSrcSet?: string;
  imageSizes?: string;
  integrity?: string;
  referrerPolicy?: string;
};

type ScriptAttrs = Attrs & {
  src?: string;
  type?: string;
  async?: boolean;
  defer?: boolean;
  crossOrigin?: string;
  integrity?: string;
  noModule?: boolean;
  referrerPolicy?: string;
};

type StyleAttrs = Attrs & {
  media?: string;
  nonce?: string;
  scoped?: boolean;
  type?: string;
};

type SourceAttrs = Attrs & {
  srcSet?: string;
  sizes?: string;
  media?: string;
  type?: string;
  src?: string;
  width?: number;
  height?: number;
};

type ButtonAttrs = Attrs & {
  type?: "submit" | "reset" | "button";
  disabled?: boolean;
  autoFocus?: boolean;
  form?: string;
  formAction?: string;
  formEncType?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formTarget?: string;
  name?: string;
  value?: string;
};

type FormAttrs = Attrs & {
  action?: string;
  method?: string;
  encType?: string;
  name?: string;
  noValidate?: boolean;
  target?: string;
  autoComplete?: string;
  rel?: string;
};

type TableCellAttrs = Attrs & {
  colSpan?: number;
  rowSpan?: number;
  headers?: string;
  scope?: string;
  abbr?: string;
  width?: number | string;
  height?: number | string;
};

type TableSectionAttrs = Attrs & {};

type OlAttrs = Attrs & {
  reversed?: boolean;
  start?: number;
  type?: "1" | "A" | "a" | "I" | "i";
};

type LiAttrs = Attrs & {
  value?: number;
};

type IframeAttrs = Attrs & {
  src?: string;
  srcdoc?: string;
  name?: string;
  width?: number | string;
  height?: number | string;
  allow?: string;
  allowFullScreen?: boolean;
  loading?: "lazy" | "eager";
  referrerPolicy?: string;
  sandbox?: string;
};

type VideoAttrs = Attrs & {
  src?: string;
  poster?: string;
  width?: number | string;
  height?: number | string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  crossOrigin?: string;
  preload?: string;
};

type AudioAttrs = Attrs & {
  src?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  crossOrigin?: string;
  preload?: string;
};

declare namespace JSX {
  type Element = string;

  interface IntrinsicElements {
    a: AnchorAttrs;
    abbr: Attrs;
    address: Attrs;
    area: Attrs & { href?: string; alt?: string; coords?: string; shape?: string; target?: string };
    article: Attrs;
    aside: Attrs;
    audio: AudioAttrs;
    b: Attrs;
    base: Attrs & { href: string; target?: string };
    bdi: Attrs;
    bdo: Attrs;
    blockquote: Attrs & { cite?: string };
    body: Attrs;
    br: Attrs;
    button: ButtonAttrs;
    canvas: Attrs & { width?: number; height?: number };
    caption: Attrs;
    cite: Attrs;
    code: Attrs;
    col: Attrs & { span?: number };
    colgroup: Attrs & { span?: number };
    data: Attrs & { value?: string | number };
    datalist: Attrs;
    dd: Attrs;
    del: Attrs & { cite?: string; dateTime?: string };
    details: Attrs & { open?: boolean };
    dfn: Attrs;
    dialog: Attrs & { open?: boolean };
    div: Attrs;
    dl: Attrs;
    dt: Attrs;
    em: Attrs;
    embed: Attrs & { src?: string; type?: string; width?: number | string; height?: number | string };
    fieldset: Attrs & { disabled?: boolean; form?: string; name?: string };
    figcaption: Attrs;
    figure: Attrs;
    footer: Attrs;
    form: FormAttrs;
    h1: Attrs;
    h2: Attrs;
    h3: Attrs;
    h4: Attrs;
    h5: Attrs;
    h6: Attrs;
    head: Attrs;
    header: Attrs;
    hgroup: Attrs;
    hr: Attrs;
    html: Attrs & { manifest?: string };
    i: Attrs;
    iframe: IframeAttrs;
    img: ImgAttrs;
    input: InputAttrs;
    ins: Attrs & { cite?: string; dateTime?: string };
    kbd: Attrs;
    label: Attrs & { for?: string; form?: string };
    legend: Attrs;
    li: LiAttrs;
    link: LinkAttrs;
    main: Attrs;
    map: Attrs & { name: string };
    mark: Attrs;
    menu: Attrs;
    meta: MetaAttrs;
    meter: Attrs & { value?: number; min?: number; max?: number; low?: number; high?: number; optimum?: number };
    nav: Attrs;
    noscript: Attrs;
    object: Attrs & { data?: string; type?: string; width?: number | string; height?: number | string; name?: string };
    ol: OlAttrs;
    optgroup: Attrs & { disabled?: boolean; label?: string };
    option: Attrs & { disabled?: boolean; label?: string; selected?: boolean; value?: string };
    output: Attrs & { for?: string; form?: string; name?: string };
    p: Attrs;
    picture: Attrs;
    pre: Attrs;
    progress: Attrs & { value?: number; max?: number };
    q: Attrs & { cite?: string };
    rp: Attrs;
    rt: Attrs;
    ruby: Attrs;
    s: Attrs;
    samp: Attrs;
    script: ScriptAttrs;
    search: Attrs;
    section: Attrs;
    select: Attrs & { name?: string; disabled?: boolean; form?: string; multiple?: boolean; required?: boolean; size?: number; autoFocus?: boolean };
    slot: Attrs & { name?: string };
    small: Attrs;
    source: SourceAttrs;
    span: Attrs;
    strong: Attrs;
    style: StyleAttrs;
    sub: Attrs;
    summary: Attrs;
    sup: Attrs;
    table: Attrs;
    tbody: TableSectionAttrs;
    td: TableCellAttrs;
    template: Attrs;
    textarea: Attrs & { name?: string; disabled?: boolean; form?: string; required?: boolean; readOnly?: boolean; autoFocus?: boolean; autoComplete?: string; cols?: number; rows?: number; placeholder?: string; maxLength?: number; minLength?: number; wrap?: string };
    tfoot: TableSectionAttrs;
    th: TableCellAttrs & { scope?: "col" | "row" | "colgroup" | "rowgroup" };
    thead: TableSectionAttrs;
    time: Attrs & { dateTime?: string };
    title: Attrs;
    tr: Attrs;
    track: Attrs & { src?: string; kind?: string; srclang?: string; label?: string; default?: boolean };
    u: Attrs;
    ul: Attrs;
    var: Attrs;
    video: VideoAttrs;
    wbr: Attrs;
  }
}
