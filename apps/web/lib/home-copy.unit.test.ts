import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { HOME_FAQS } from "./home-faqs";
import { HOME_HEADLINE, HOME_SUBHEAD } from "./marketing-site";
import { DEMO_MARKDOWN, DEMO_SOURCE } from "./mdx-demo";

const here = dirname(fileURLToPath(import.meta.url));
const mirror = readFileSync(
  join(here, "../app/markdown/content/home.md"),
  "utf8"
);

describe("home Markdown mirror", () => {
  it("leads with the visible H1 and subhead", () => {
    expect(mirror.startsWith(`# ${HOME_HEADLINE}\n`)).toBe(true);
    expect(mirror).toContain(HOME_SUBHEAD);
  });

  it("carries the demo example and its Markdown output", () => {
    expect(mirror).toContain(DEMO_SOURCE.trim());
    expect(mirror).toContain(DEMO_MARKDOWN);
  });

  it("carries every FAQ question and answer verbatim", () => {
    for (const faq of HOME_FAQS) {
      expect(mirror).toContain(`**${faq.question}**\n${faq.answer}`);
    }
  });
});

describe("home FAQ", () => {
  it("has 5 to 8 questions with direct answers of 60 words or fewer", () => {
    expect(HOME_FAQS.length).toBeGreaterThanOrEqual(5);
    expect(HOME_FAQS.length).toBeLessThanOrEqual(8);
    for (const faq of HOME_FAQS) {
      expect(faq.answer.split(/\s+/).length).toBeLessThanOrEqual(60);
      expect(faq.answer).not.toMatch(/—/);
    }
  });
});
