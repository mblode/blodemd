import type { FaqItem } from "@/lib/structured-data";

/**
 * Home FAQ. Each answer opens with the direct answer in 60 words or fewer.
 * The visible FAQ, the FAQPage JSON-LD and the Markdown mirror
 * (`app/markdown/content/home.md`) all come from or are checked against this
 * array.
 */
export const HOME_FAQS: readonly FaqItem[] = [
  {
    answer:
      "Edda is a docs platform for MDX kept in git. You write pages in your repo, review them in a pull request, and the merge publishes an HTML site plus llms.txt, llms-full.txt and a Markdown copy of every page. Hosted is $0 and the source is MIT.",
    question: "What is Edda?",
  },
  {
    answer:
      "Mintlify Starter is also $0, and it adds a web editor that commits back to your repo, plus a marketplace. Edda has neither, so writing and review stay in git. Edda does not claim drop-in compatibility with every Mintlify config key, so a Mintlify docs.json may need changes.",
    question: "How is this different from Mintlify?",
  },
  {
    answer:
      "Every deploy writes llms.txt, llms-full.txt and a .md copy of each page from the same MDX as the HTML, and each .md page links back to llms.txt. In Mintlify's 2026 benchmark, Markdown with that link averaged 0.11 failed requests per task, against 2.23 for HTML.",
    question: "What do agents get?",
  },
  {
    answer:
      "Hosted Edda is $0 with unlimited projects, pages and seats, including custom domains, search, MDX and API references. You do not get a visual editor, a plugin marketplace, SOC 2, SSO or an SLA, and support is the founder. The CLI and renderer are MIT if you self-host.",
    question: "How much does Edda cost?",
  },
  {
    answer:
      "Yes. Point a custom domain at your Edda site, or proxy /docs through the site you already run. The proxy guides have configs for Vercel, Cloudflare, Nginx and Caddy.",
    question: "Can I use my own domain?",
  },
  {
    answer:
      "Matthew Blode builds Edda. For support, email m@blode.co or open an issue at github.com/mblode/edda.",
    question: "Who builds Edda and how do I get support?",
  },
];
