import { watch, statSync } from "node:fs";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { loadBlogConfig } from "./config.ts";
import { main as build } from "./build.ts";
import type { BlogConfig } from "./theme-api.ts";

const DEFAULT_PORT = 3000;
const DEFAULT_BLOG_FOLDER = "examples/blog";
const LIVE_RELOAD_PATH = "/__buno_livereload";

let rebuildTimer: Timer | null = null;
const wsClients = new Set<any>();

function scheduleRebuild(blogFolder: string) {
  if (rebuildTimer) clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(async () => {
    rebuildTimer = null;
    console.log("\n  Change detected, rebuilding...");
    try {
      await build(blogFolder);
      const msg = JSON.stringify({ type: "reload" });
      for (const ws of wsClients) {
        try { ws.send(msg); } catch { wsClients.delete(ws); }
      }
      console.log("  Reload signal sent to browsers.\n");
    } catch (err) {
      console.error("  Rebuild failed:", err);
      for (const ws of wsClients) {
        try { ws.send(JSON.stringify({ type: "error", message: String(err) })); } catch { wsClients.delete(ws); }
      }
    }
  }, 200);
}

function watchDirectory(dir: string, label: string, blogFolder: string) {
  if (!existsSync(dir)) {
    console.log(`  (${label} directory not found, skipping watch)`);
    return;
  }
  watch(dir, { recursive: true }, (event, filename) => {
    if (filename && !filename.startsWith(".") && !filename.endsWith("~")) {
      scheduleRebuild(blogFolder);
    }
  });
  console.log(`  Watching ${label}: ${dir}`);
}

async function startDevServer(blogFolderArg: string) {
  const blogFolder = blogFolderArg ?? DEFAULT_BLOG_FOLDER;
  const blogRoot = resolve(process.cwd(), blogFolder);
  const outputDir = join(blogRoot, "public");
  const contentRoot = join(blogRoot, "content");

  console.log(`\n  Initial build for "${blogFolder}"...`);
  await build(blogFolder);

  let config: BlogConfig = {};
  try { config = await loadBlogConfig(blogRoot); } catch {}

  const port = config.serve?.port ?? DEFAULT_PORT;
  const themeDirs: string[] = [];
  if (config.theme) {
    themeDirs.push(resolve(blogRoot, config.theme));
  }
  const localThemeDir = join(blogRoot, "theme");
  if (existsSync(localThemeDir)) {
    themeDirs.push(localThemeDir);
  }

  watchDirectory(contentRoot, "content", blogFolder);
  for (const td of themeDirs) {
    watchDirectory(td, "theme", blogFolder);
  }

  const livereloadScript = `<script>(function(){var ws=new WebSocket("ws://localhost:${port}${LIVE_RELOAD_PATH}");ws.onmessage=function(e){var msg=JSON.parse(e.data);if(msg.type==="reload")location.reload();if(msg.type==="error")console.error("[buno]",msg.message);};})();</script>`;

  const server = Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);

      if (url.pathname === LIVE_RELOAD_PATH) {
        const upgraded = server.upgrade(req);
        if (upgraded) return;
        return new Response("WebSocket upgrade failed", { status: 400 });
      }

      const cleanPath = url.pathname === "/" ? "/index.html" : url.pathname;
      let filePath = join(outputDir, cleanPath);

      if (existsSync(filePath) && statSync(filePath).isDirectory()) {
        filePath = join(filePath, "index.html");
      }

      if (!existsSync(filePath)) {
        return new Response("Not found", { status: 404 });
      }

      const file = Bun.file(filePath);
      if (filePath.endsWith(".html")) {
        const content = await file.text();
        const injected = content.replace("</body>", `${livereloadScript}\n</body>`);
        return new Response(injected, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }

      return new Response(file);
    },
    websocket: {
      open(ws) {
        wsClients.add(ws);
        ws.send(JSON.stringify({ type: "connected" }));
      },
      close(ws) {
        wsClients.delete(ws);
      },
      message() {},
    },
  });

  console.log(`\n  Dev server started at http://localhost:${port}/\n`);
}

const folder = process.argv[2] ?? DEFAULT_BLOG_FOLDER;
await startDevServer(folder);
