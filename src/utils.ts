import { mkdir, readdir, rm } from "node:fs/promises";
import { join } from "node:path";

export async function cleanDir(path: string) {
  await ensureDir(path);
  const entries = await readdir(path);
  await Promise.all(entries.map((entry) => rm(join(path, entry), { recursive: true, force: true })));
}

export async function ensureDir(path: string) {
  await mkdir(path, { recursive: true });
}

export function normalizeDate(input?: string): string | undefined {
  if (!input) return undefined;
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return input;
  }
  return parsed.toISOString();
}

export function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

export function extractSummary(markdown: string): string | undefined {
  const plain = markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_>~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) {
    return undefined;
  }

  return plain.slice(0, 180).trim() + (plain.length > 180 ? "..." : "");
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "post";
}

export function humanizeSlug(value: string): string {
  return value
    .split(/[/_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function asBoolean(value: unknown): boolean {
  return value === true;
}
