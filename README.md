# Buno

A very small static blog engine built on Bun's markdown API.

## What it does

- Scans `/<blogfolder>/content/posts/**/*.md`
- Parses YAML front matter wrapped in triple dashes (`---`)
- Renders posts with `Bun.markdown.render()`
- Loads a theme module that controls stylesheets, layouts, and markdown element rendering
- Preserves heading IDs for anchorable sections and CSS targeting
- Builds a home page plus one page per post into `/<blogfolder>/public`
- Supports a separate reusable theme folder, demonstrated by `example-theme/`

## Usage

```bash
bun run build -- my-blog
```

If you omit the folder, the builder uses `example-blog`.

## Tooling

```bash
bun run lint
bun run lint:fix
bun run typecheck
```

## Theme API

Themes are plain TypeScript modules that export a theme object from `theme.ts`.

- `stylesheets`: declares which CSS assets to publish to `/public/assets`
- `renderers`: Bun markdown callbacks for headings, code blocks, links, tables, and other tags
- `renderDocument`: wraps the full HTML document
- `renderIndex`: renders the home page body
- `renderPost`: renders each post body

See [example-theme/theme.ts](/Users/chenhong.xie/work/buno/example-theme/theme.ts) and [src/theme-api.ts](/Users/chenhong.xie/work/buno/src/theme-api.ts) for the contract.

## Front matter

```md
---
title: Hello Bun
date: 2026-03-22
summary: A short summary for the index page.
tags:
  - bun
  - markdown
draft: false
slug: hello-bun
---
```

## Content layout

```text
my-blog/
  blog.config.yaml
  content/
    posts/
      first-post.md
  public/
```

Point `blog.config.yaml` at a reusable theme directory:

```yaml
theme: ../example-theme
```
