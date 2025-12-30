import type { DocsConfig } from "@repo/models";
import type { CSSProperties } from "react";

export const themeStylesFromConfig = (config: DocsConfig): CSSProperties => {
  const colors = config.colors;
  return {
    "--color-bg": colors?.background ?? "var(--color-bg)",
    "--color-primary": colors?.primary ?? "#0FB59F",
    "--color-primary-soft": colors?.light ?? "#CFF6EE",
    "--color-primary-dark": colors?.dark ?? "#0C3A33",
    "--color-surface": colors?.surface ?? "#F5FBF9",
    "--color-border": colors?.border ?? "#D4E6E1",
    "--color-muted": colors?.muted ?? "#6A7D78",
    "--font-body": config.fonts?.body ?? "var(--font-body-default)",
    "--font-heading": config.fonts?.heading ?? "var(--font-heading-default)",
    "--font-mono": config.fonts?.mono ?? "var(--font-mono-default)",
  } as CSSProperties;
};
