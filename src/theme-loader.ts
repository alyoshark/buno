import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import defaultTheme from "./default-theme.ts";
import type { Theme, ThemeAsset } from "./theme-api.ts";
import { ensureDir } from "./utils.ts";

export async function resolveTheme(blogRoot: string, configuredThemePath?: string): Promise<{ theme: Theme; themeDir?: string }> {
  const candidateDir = configuredThemePath ? resolve(blogRoot, configuredThemePath) : join(blogRoot, "theme");
  const tsxFilePath = join(candidateDir, "theme.tsx");
  const tsFilePath = join(candidateDir, "theme.ts");
  const tsxFile = Bun.file(tsxFilePath);
  const themeFilePath = (await tsxFile.exists()) ? tsxFilePath : tsFilePath;
  const themeFile = Bun.file(themeFilePath);

  if (!(await themeFile.exists())) {
    return { theme: defaultTheme };
  }

  const module = await import(pathToFileURL(themeFilePath).href);
  const importedTheme = (module.default ?? module.theme) as Theme | undefined;
  if (!importedTheme) {
    throw new Error(`Theme module ${themeFilePath} must export a default theme.`);
  }

  return { theme: importedTheme, themeDir: candidateDir };
}

export async function publishThemeAssets(themeDir: string | undefined, outputDir: string, assets: ThemeAsset[]): Promise<string[]> {
  if (assets.length === 0) {
    return [];
  }

  const assetDir = join(outputDir, "assets");
  await ensureDir(assetDir);

  const hrefs: string[] = [];
  for (const asset of assets) {
    const outputPath = join(assetDir, asset.output);

    if (typeof asset.content === "string") {
      await Bun.write(outputPath, asset.content);
    } else if (asset.source && themeDir) {
      await Bun.write(outputPath, Bun.file(join(themeDir, asset.source)));
    } else {
      throw new Error(`Theme asset "${asset.output}" must provide either inline content or a source file.`);
    }

    hrefs.push(`/assets/${asset.output}`);
  }

  return hrefs;
}
