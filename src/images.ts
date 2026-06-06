import { extname, join, relative, dirname, basename, sep } from "node:path";
import { escapeHtmlAttr, type ImageConfig } from "./theme-api.ts";
import { ensureDir } from "./utils.ts";

const IMAGE_GLOB = "**/*.{jpg,jpeg,png,gif,webp,tiff,bmp,avif,heic}";

export type ProcessedImage = {
  original: string;
  width: number;
  height: number;
  webpUrl?: string;
  placeholder: string;
};

const imageCache = new Map<string, ProcessedImage>();

export function getProcessedImage(src: string): ProcessedImage | undefined {
  let cached = imageCache.get(src);
  if (cached) return cached;
  cached = imageCache.get(`/${src.replace(/^\//, "")}`);
  if (cached) return cached;
  cached = imageCache.get(src.replace(/^\//, ""));
  return cached;
}

export async function processContentImages(contentRoot: string, outputDir: string, opts: ImageConfig = {}): Promise<void> {
  imageCache.clear();

  if (!opts.enabled || typeof Bun.Image !== "function") {
    return;
  }

  const maxWidth = opts.max_width ?? 1200;
  const quality = opts.quality ?? 82;
  const genPlaceholder = opts.placeholder !== false;

  const assetDir = join(outputDir, "assets", "images");
  await ensureDir(assetDir);

  const files: string[] = [];
  for await (const entry of new Bun.Glob(IMAGE_GLOB).scan({ cwd: contentRoot, absolute: true })) {
    files.push(entry);
  }

  await Promise.all(
    files.map(async (filePath) => {
      try {
        const relPath = relative(contentRoot, filePath);
        const key = `/${relPath.replace(sep, "/")}`;

        const meta = await new Bun.Image(filePath).metadata();
        const targetWidth = Math.min(meta.width, maxWidth);
        const targetHeight = Math.round(meta.height * (targetWidth / meta.width));

        const baseName = basename(relPath, extname(relPath));
        const webpName = `${baseName}.webp`;
        const fallbackName = `${baseName}${extname(relPath)}`;
        const subDir = dirname(relPath);
        const outDir = subDir === "." ? assetDir : join(assetDir, subDir);

        await ensureDir(outDir);

        const needsResize = targetWidth < meta.width;
        const pipeline = needsResize
          ? new Bun.Image(filePath).resize(targetWidth, 0, { fit: "inside" })
          : new Bun.Image(filePath);

        await pipeline.webp({ quality }).write(join(outDir, webpName));

        if (needsResize) {
          await pipeline.jpeg({ quality }).write(join(outDir, fallbackName));
        } else {
          await Bun.write(join(outDir, fallbackName), Bun.file(filePath));
        }

        let placeholder = "";
        if (genPlaceholder) {
          try {
            placeholder = await new Bun.Image(filePath).resize(32, 0, { fit: "inside" }).placeholder();
          } catch {}
        }

        const imageUrlBase = subDir === "." ? "" : `/${subDir.replace(sep, "/")}`;
        imageCache.set(key, {
          original: `/assets/images${imageUrlBase}/${fallbackName}`,
          width: targetWidth,
          height: targetHeight,
          webpUrl: `/assets/images${imageUrlBase}/${webpName}`,
          placeholder,
        });
      } catch (error) {
        console.error(`  [images] Failed to process ${filePath}:`, error);
      }
    }),
  );

  const count = imageCache.size;
  if (count > 0) {
    console.log(`  Processed ${count} image(s) to assets/images/`);
  }
}

export function renderResponsiveImage(
  src: string,
  alt: string,
  processed?: ProcessedImage,
): string {
  const escapedAlt = escapeHtmlAttr(alt ?? "");

  if (!processed) {
    return `<img src="${escapeHtmlAttr(src)}" alt="${escapedAlt}" loading="lazy" />`;
  }

  const sources: string[] = [];

  if (processed.webpUrl) {
    sources.push(
      `<source srcset="${escapeHtmlAttr(processed.webpUrl)}" type="image/webp" />`,
    );
  }

  const placeholderStyle = processed.placeholder
    ? ` style="background-image: url('${processed.placeholder}'); background-size: cover;"`
    : "";

  sources.push(
    `<img src="${escapeHtmlAttr(processed.original)}" alt="${escapedAlt}" width="${processed.width}" height="${processed.height}" loading="lazy" decoding="async"${placeholderStyle} />`,
  );

  return `<picture>
  ${sources.join("\n  ")}
</picture>`;
}
