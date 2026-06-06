/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx, Fragment } from "../../src/jsx/jsx-runtime.ts";
import { defineTheme } from "../../src/theme-api.ts";
import { renderers } from "./components/renderers.tsx";
import { RenderDocument } from "./components/RenderDocument.tsx";
import { RenderIndex } from "./components/RenderIndex.tsx";
import { RenderPost } from "./components/RenderPost.tsx";
import { RenderTagsIndex } from "./components/RenderTagsIndex.tsx";
import { RenderTag } from "./components/RenderTag.tsx";
import { RenderArchives } from "./components/RenderArchives.tsx";

const theme = defineTheme({
  name: "jsx-theme",
  stylesheets: [{ source: "style.css", output: "theme.css" }],
  markdownOptions: {
    headings: { ids: true },
    autolinks: true,
    tables: true,
    strikethrough: true,
    tasklists: true,
  },
  renderers,
  renderDocument: RenderDocument,
  renderIndex: RenderIndex,
  renderPost: (args) => RenderPost({ ...args, renderMarkdown: (md: string) => theme.renderMarkdown(md) }),
  renderTagsIndex: RenderTagsIndex,
  renderTag: RenderTag,
  renderArchives: RenderArchives,
});

export default theme;
