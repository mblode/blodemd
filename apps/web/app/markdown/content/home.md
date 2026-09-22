# MDX docs, published on merge

> For teams that keep docs in git, every merge publishes the HTML site and agent-readable Markdown from the same commit.

Edda. Hosted is $0. The CLI and renderer are MIT.

Last updated: 22 September 2026

- [Connect GitHub to publish](https://blode.md/oauth/consent)
- [Read the docs](https://blode.co/edda/docs)

## MDX in, HTML and Markdown out

This MDX:

<!-- prettier-ignore -->
```mdx
# Quickstart

Install the CLI, then publish your first page.

<Note>
Run `edda login` once per machine.
</Note>

## Publish

1. Run `edda new docs`
2. Run `edda push docs`

Read the [CLI guide](/docs/cli/overview).
```

publishes an HTML page at `acme.blode.md/quickstart` and this Markdown at `acme.blode.md/quickstart.md`:

```md
# Quickstart

Install the CLI, then publish your first page.

> [!NOTE]
> Run `edda login` once per machine.

## Publish

1. Run `edda new docs`
2. Run `edda push docs`

Read the [CLI guide](/docs/cli/overview).
```

## No second editor. On purpose.

Edda has no web editor and no plugin marketplace. Your editor, your repo, your pull request. If you want a CMS, this is the wrong tool.

## The merge is the deploy

### Docs live in your repo

Pages are MDX files in your repo, next to the code they describe, with `docs.json` for navigation. Write them in the editor you already use.

### Review in the pull request

A docs change is a diff. Your team reviews it in the same pull request as the code, with the same comments and approvals.

### Publish on merge

Install the GitHub App and a push to `main` deploys the site. From a terminal, `edda push docs` does the same.

### Markdown for agents

Each deploy writes `llms.txt`, `llms-full.txt` and a `.md` copy of every page from the MDX you merged, so agents read the same version people do.

### Hosted or self-hosted

Use hosted Edda on a `blode.md` subdomain or your own domain, or run the same MIT CLI and renderer on your Postgres. If hosted goes away, you keep the source.

## Hosted or self-hosted

No visual editor, plugin marketplace, SOC 2, SSO or SLA. Support is the founder.

- **No second editor:** $0 hosted. Unlimited projects, pages and seats. Custom domains, search, MDX and API references included. [Connect GitHub to publish](https://blode.md/oauth/consent)
- **Your Postgres:** MIT. Self-host the same CLI and renderer on your Postgres. No licence keys or telemetry. [View the source on GitHub](https://github.com/mblode/edda)

## FAQ

**What is Edda?**
Edda is a docs platform for MDX kept in git. You write pages in your repo, review them in a pull request, and the merge publishes an HTML site plus llms.txt, llms-full.txt and a Markdown copy of every page. Hosted is $0 and the source is MIT.

**How is this different from Mintlify?**
Mintlify Starter is also $0, and it adds a web editor that commits back to your repo, plus a marketplace. Edda has neither, so writing and review stay in git. Edda does not claim drop-in compatibility with every Mintlify config key, so a Mintlify docs.json may need changes.

**What do agents get?**
Every deploy writes llms.txt, llms-full.txt and a .md copy of each page from the same MDX as the HTML, and each .md page links back to llms.txt. In Mintlify's 2026 benchmark, Markdown with that link averaged 0.11 failed requests per task, against 2.23 for HTML.

**How much does Edda cost?**
Hosted Edda is $0 with unlimited projects, pages and seats, including custom domains, search, MDX and API references. You do not get a visual editor, a plugin marketplace, SOC 2, SSO or an SLA, and support is the founder. The CLI and renderer are MIT if you self-host.

**Can I use my own domain?**
Yes. Point a custom domain at your Edda site, or proxy /docs through the site you already run. The proxy guides have configs for Vercel, Cloudflare, Nginx and Caddy.

**Who builds Edda and how do I get support?**
Matthew Blode builds Edda. For support, email m@blode.co or open an issue at github.com/mblode/edda.

## The answer they read matches the commit you merged.

[Connect GitHub to publish](https://blode.md/oauth/consent), or install the CLI and publish from your terminal:

```bash
npm i -g edda-docs
edda login
edda new docs
edda push docs
```
