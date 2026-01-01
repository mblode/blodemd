import { slugify } from "@repo/common";

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

export const extractToc = (source: string): TocItem[] => {
  const withoutCode = source.replace(/```[\s\S]*?```/g, "");
  const lines = withoutCode.split(/\r?\n/);
  const toc: TocItem[] = [];

  for (const line of lines) {
    const match = /^(#{2,4})\s+(.*)$/.exec(line.trim());
    if (!match) {
      continue;
    }
    const [, hashes = "", heading = ""] = match;
    if (!(hashes && heading)) {
      continue;
    }
    const level = hashes.length;
    const title = heading.trim();
    const id = slugify(title);
    toc.push({ id, title, level });
  }

  return toc;
};
