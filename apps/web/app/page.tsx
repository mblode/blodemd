import { ArrowRightIcon } from "blode-icons-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { JsonLd } from "@/components/json-ld";
import { CtaClose } from "@/components/marketing/cta-close";
import { Faq, faqJsonLd } from "@/components/marketing/faq";
import { FeatureRows } from "@/components/marketing/feature-rows";
import { InstallCommand } from "@/components/marketing/install-command";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MdxDemo } from "@/components/marketing/mdx-demo";
import { ProofStats } from "@/components/marketing/proof-stats";
import { Button } from "@/components/ui/button";
import { MarketingShell } from "@/components/ui/marketing-shell";
import { siteConfig } from "@/lib/config";
import { HOME_FAQS } from "@/lib/home-faqs";
import {
  GITHUB_REPO,
  getGithubStars,
  getNpmWeeklyDownloads,
  NPM_PACKAGE,
} from "@/lib/live-stats";
import {
  HOME_DESCRIPTION,
  HOME_HEADLINE,
  HOME_SUBHEAD,
  HOME_TITLE,
  MARKETING_HOME,
  marketingUrl,
  pageMetadata,
} from "@/lib/marketing-site";
import {
  pageJsonLd,
  SOFTWARE_ID,
  softwareApplicationNode,
  webPageNode,
} from "@/lib/structured-data";

export const metadata = pageMetadata({
  description: HOME_DESCRIPTION,
  path: "/",
  title: HOME_TITLE,
});

/** Date of the latest substantive homepage edit. */
const HOME_UPDATED_AT = "2026-09-22";
const HOME_UPDATED_LABEL = "22 September 2026";

/** The one primary action. Same label everywhere it repeats. */
const CTA_LABEL = "Connect GitHub to publish";
const SIGNUP_HREF = "/oauth/consent";

const INSTALL_COMMANDS = [
  {
    command: "npm i -g edda-docs\nedda login\nedda new docs\nedda push docs",
    label: "CLI",
  },
];

const homeJsonLd = pageJsonLd(
  webPageNode({
    description: HOME_DESCRIPTION,
    extra: {
      about: { "@id": SOFTWARE_ID },
      breadcrumb: { "@id": `${marketingUrl("/")}#breadcrumb` },
      dateModified: HOME_UPDATED_AT,
      mainEntity: { "@id": `${marketingUrl("/")}#faq` },
    },
    name: HOME_TITLE,
    path: "/",
  }),
  softwareApplicationNode({
    description: HOME_SUBHEAD,
    offerUrl: `${MARKETING_HOME}#pricing`,
  }),
  faqJsonLd(HOME_FAQS),
  {
    "@id": `${marketingUrl("/")}#breadcrumb`,
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        item: "https://blode.co",
        name: "Matthew Blode",
        position: 1,
      },
      {
        "@type": "ListItem",
        item: "https://blode.co/projects",
        name: "Projects",
        position: 2,
      },
      {
        "@type": "ListItem",
        item: marketingUrl("/"),
        name: "Edda",
        position: 3,
      },
    ],
  }
);

/**
 * blode.co/edda serves this page as HTML without React, so the CTA is a plain
 * link. `public/landing.js` reports `cta_clicked` from the data attributes.
 */
const PrimaryCta = ({
  location,
  size = "lg",
}: {
  location: string;
  size?: "default" | "lg";
}) => (
  <Button asChild className="rounded-full" size={size}>
    <a
      data-cta-label={CTA_LABEL}
      data-cta-location={location}
      href={SIGNUP_HREF}
    >
      {CTA_LABEL}
    </a>
  </Button>
);

const Breadcrumb = () => (
  <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
    <ol className="flex flex-wrap justify-center gap-2">
      <li>
        <a
          className="underline-offset-4 hover:underline"
          href="https://blode.co"
          rel="author"
        >
          Matthew Blode
        </a>
      </li>
      <li aria-hidden="true">/</li>
      <li>
        <a
          className="underline-offset-4 hover:underline"
          href="https://blode.co/projects"
        >
          Projects
        </a>
      </li>
      <li aria-hidden="true">/</li>
      <li aria-current="page">Edda</li>
    </ol>
  </nav>
);

const CodeMedia = ({ caption, code }: { caption: string; code: string }) => (
  <figure className="overflow-hidden rounded-xl bg-surface">
    <figcaption className="border-border border-b px-4 py-3 font-mono text-muted-foreground text-xs">
      {caption}
    </figcaption>
    <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6 md:text-sm">
      <code>{code}</code>
    </pre>
  </figure>
);

const DiffMedia = () => (
  <figure className="overflow-hidden rounded-xl bg-surface">
    <figcaption className="border-border border-b px-4 py-3 font-mono text-muted-foreground text-xs">
      docs/quickstart.mdx
    </figcaption>
    <pre className="overflow-x-auto py-4 font-mono text-[13px] leading-6 md:text-sm">
      <code className="block px-4">## Publish</code>
      <code className="block bg-red-500/10 px-4">
        <span aria-hidden="true">- </span>
        <span className="sr-only">Removed: </span>
        Run `edda push`.
      </code>
      <code className="block bg-emerald-500/10 px-4">
        <span aria-hidden="true">+ </span>
        <span className="sr-only">Added: </span>
        Run `edda push docs`.
      </code>
    </pre>
  </figure>
);

const features: { description: string; media: ReactNode; title: string }[] = [
  {
    description:
      "Pages are MDX files in your repo, next to the code they describe, with docs.json for navigation. Write them in the editor you already use.",
    media: (
      <CodeMedia
        caption="your-repo/"
        code={
          "docs/\n  docs.json\n  index.mdx\n  quickstart.mdx\nsrc/\npackage.json"
        }
      />
    ),
    title: "Docs live in your repo",
  },
  {
    description:
      "A docs change is a diff. Your team reviews it in the same pull request as the code, with the same comments and approvals.",
    media: <DiffMedia />,
    title: "Review in the pull request",
  },
  {
    description:
      "Install the GitHub App and a push to main deploys the site. From a terminal, edda push docs does the same.",
    media: (
      <CodeMedia
        caption="With the GitHub App"
        code={
          "git switch main\ngit merge update-quickstart\ngit push\n# deployed to acme.blode.md"
        }
      />
    ),
    title: "Publish on merge",
  },
  {
    description:
      "Each deploy writes llms.txt, llms-full.txt and a .md copy of every page from the MDX you merged, so agents read the same version people do.",
    media: (
      <CodeMedia
        caption="Written on every deploy"
        code={
          "acme.blode.md/llms.txt\nacme.blode.md/llms-full.txt\nacme.blode.md/quickstart.md"
        }
      />
    ),
    title: "Markdown for agents",
  },
  {
    description:
      "Use hosted Edda on a blode.md subdomain or your own domain, or run the same MIT CLI and renderer on your Postgres. If hosted goes away, you keep the source.",
    media: (
      <CodeMedia
        caption="Same CLI either way"
        code={
          "# hosted, $0\nedda push docs\n\n# self-hosted, MIT\ngit clone https://github.com/mblode/edda"
        }
      />
    ),
    title: "Hosted or self-hosted",
  },
];

export default async function HomePage() {
  const [stars, downloads] = await Promise.all([
    getGithubStars(),
    getNpmWeeklyDownloads(),
  ]);

  return (
    <MarketingShell staticLanding>
      <JsonLd data={homeJsonLd} />
      <script defer src="/landing.js" />

      <MarketingHero
        action={<PrimaryCta location="home_hero" />}
        description={HOME_SUBHEAD}
        eyebrow={<Breadcrumb />}
        secondary={
          <Link
            className="rounded-sm text-sm underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-cta-location="home_hero_secondary"
            href="/docs"
          >
            Read the docs
          </Link>
        }
        title={HOME_HEADLINE}
      >
        <MdxDemo />
      </MarketingHero>

      <section className="container pb-24 text-center md:pb-32">
        <div data-reveal>
          <h2 className="h-display text-balance font-semibold text-3xl md:text-5xl">
            No second editor. On purpose.
          </h2>
          <p className="measure mx-auto mt-6 text-balance text-muted-foreground md:text-lg">
            Edda has no web editor and no plugin marketplace. Your editor, your
            repo, your pull request. If you want a CMS, this is the wrong tool.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="how-it-works-title"
        className="scroll-mt-24 border-border border-t py-24 md:py-32"
        id="how-it-works"
      >
        <div className="container">
          <h2
            className="h-title mb-16 max-w-2xl text-balance font-semibold text-3xl md:mb-24 md:text-5xl"
            id="how-it-works-title"
          >
            The merge is the deploy
          </h2>
          <FeatureRows items={features} />
        </div>
      </section>

      {stars === null && downloads === null ? null : (
        <section
          aria-label="Live numbers"
          className="border-border border-t py-16 md:py-20"
        >
          <div className="container" data-reveal>
            <ProofStats
              stats={[
                {
                  href: `https://github.com/${GITHUB_REPO}`,
                  label: "GitHub stars",
                  value: stars,
                },
                {
                  href: `https://www.npmjs.com/package/${NPM_PACKAGE}`,
                  label: `${NPM_PACKAGE} downloads, last 7 days`,
                  value: downloads,
                },
              ]}
            />
          </div>
        </section>
      )}

      <section
        aria-labelledby="pricing"
        className="border-border border-t py-24 md:py-32"
      >
        <div className="container">
          <h2
            className="h-title max-w-2xl scroll-mt-24 text-balance font-semibold text-3xl md:text-5xl"
            id="pricing"
          >
            Hosted or self-hosted
          </h2>
          <p className="measure mt-4 text-muted-foreground md:text-lg">
            No visual editor, plugin marketplace, SOC 2, SSO or SLA. Support is
            the founder.
          </p>
          <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-16">
            <div className="flex flex-col items-start border-border border-t pt-8">
              <p className="text-muted-foreground text-sm">$0 hosted</p>
              <h3 className="mt-2 font-semibold text-2xl">No second editor</h3>
              <p className="measure mt-3 text-muted-foreground">
                Unlimited projects, pages and seats. Custom domains, search, MDX
                and API references included.
              </p>
              <div className="mt-6">
                <PrimaryCta location="home_pricing_hosted" size="default" />
              </div>
            </div>
            <div className="flex flex-col items-start border-border border-t pt-8">
              <p className="text-muted-foreground text-sm">MIT</p>
              <h3 className="mt-2 font-semibold text-2xl">Your Postgres</h3>
              <p className="measure mt-3 text-muted-foreground">
                Self-host the same CLI and renderer on your Postgres. No licence
                keys or telemetry.
              </p>
              <div className="mt-6">
                <Button asChild className="rounded-full" variant="outline">
                  <a
                    data-cta-location="home_pricing_self_hosted"
                    href={siteConfig.links.github}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    View the source on GitHub
                    <ArrowRightIcon data-icon="inline-end" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="faq-title"
        className="scroll-mt-24 border-border border-t py-24 md:py-32"
        id="faq"
      >
        <div className="container grid gap-12 md:grid-cols-[1fr_1.6fr] md:items-start">
          <div className="min-w-0">
            <h2
              className="h-title text-balance font-semibold text-3xl md:text-5xl"
              id="faq-title"
            >
              FAQ
            </h2>
            <p className="mt-4 text-muted-foreground text-sm">
              Last updated{" "}
              <time dateTime={HOME_UPDATED_AT}>{HOME_UPDATED_LABEL}</time>
            </p>
          </div>
          <Faq items={HOME_FAQS} />
        </div>
      </section>

      <CtaClose
        action={<PrimaryCta location="home_close" />}
        command={<InstallCommand commands={INSTALL_COMMANDS} />}
        description="Or install the CLI and publish from your terminal."
        title="The answer they read matches the commit you merged."
      />
    </MarketingShell>
  );
}
