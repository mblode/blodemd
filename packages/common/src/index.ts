export const normalizePath = (value: string) => {
  const trimmed = value.replace(/\\/g, "/").replace(/\/+$/g, "");
  return trimmed.replace(/^\/+/, "");
};

export const withLeadingSlash = (value: string) => {
  if (!value) {
    return "/";
  }
  return value.startsWith("/") ? value : `/${value}`;
};

export const withoutLeadingSlash = (value: string) => {
  if (!value) {
    return "";
  }
  return value.startsWith("/") ? value.slice(1) : value;
};

export const slugify = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export const ensureArray = <T>(value?: T | T[]) => {
  if (value === undefined) {
    return [] as T[];
  }
  return Array.isArray(value) ? value : [value];
};

export const uniq = <T>(values: T[]) => Array.from(new Set(values));

export const safeJsonParse = <T>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
