# Buno

A very small static blog engine built on Bun's markdown API.

## What it does

- Scans `/<blogfolder>/content/posts/**/*.md`
- Parses YAML front matter wrapped in triple dashes (`---`)
- Renders posts with `Bun.markdown.render()`
- Loads a theme module that controls stylesheets, layouts, and markdown element rendering
- Preserves heading IDs for anchorable sections and CSS targeting
- Builds home, post, tags, tag-detail, and archives pages into `/<blogfolder>/public`
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

The build pipeline is intentionally split across small modules now:

- [src/build.ts](/Users/chenhong.xie/work/buno/src/build.ts) orchestrates page generation
- [src/content.ts](/Users/chenhong.xie/work/buno/src/content.ts) loads posts and front matter
- [src/site-data.ts](/Users/chenhong.xie/work/buno/src/site-data.ts) builds tags and archives
- [src/pagination.ts](/Users/chenhong.xie/work/buno/src/pagination.ts) slices list pages and generates pager metadata
- [src/theme-loader.ts](/Users/chenhong.xie/work/buno/src/theme-loader.ts) resolves themes and publishes assets

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

Pagination is configured in the same file:

```yaml
pagination:
  page_size: 10
```
