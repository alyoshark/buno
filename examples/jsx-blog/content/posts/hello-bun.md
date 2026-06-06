---
title: Hello Bun Markdown
date: 2026-03-22
summary: A first post rendered with Bun's markdown API and custom HTML callbacks.
tags:
  - bun
  - static-site
  - markdown
---

# A tiny post

This blog engine reads files from `content/posts`, parses the triple dash meta block, and emits static HTML.

## Why the custom renderer matters

It gives each element a predictable class name and keeps heading `id` values so theme authors can style deep parts of the page with plain CSS.

### Small example

```ts
const html = Bun.markdown.render("# Hi", {
  heading: (children, { level, id }) =>
    `<h${level} id="${id}" class="content-heading">${children}</h${level}>`,
});
```

| Feature | Status |
| --- | --- |
| Triple dash front matter | Done |
| Heading ids | Done |
| Static output | Done |
