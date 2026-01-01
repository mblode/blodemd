import type { Domain } from "@repo/contracts";
import type { DomainStatus } from "@repo/models";
import Link from "next/link";
import { CustomDomain } from "@/components/domains/custom-domain";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const buildDnsStatus = (domain: Domain): DomainStatus => {
  return { status: domain.status, dnsRecords: [] };
};

export const DomainSetup = ({
  projectId,
  projectSlug,
  domains,
}: {
  projectId: string;
  projectSlug: string;
  domains: Domain[];
}) => {
  const defaultPathPrefix = "/docs";
  const primaryDomain =
    domains.find((domain) => domain.pathPrefix) ?? domains[0] ?? null;
  const customDomain =
    domains.find((domain) => domain !== primaryDomain) ?? null;

  const hostDomain = primaryDomain?.hostname ?? `${projectSlug}.neue.com`;
  const hostPath = primaryDomain?.pathPrefix ?? defaultPathPrefix;
  const pendingDomainStatus = customDomain
    ? buildDnsStatus(customDomain)
    : undefined;

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/70">
        <CardContent className="space-y-6 p-6">
          <div>
            <h2 className="font-semibold text-lg">Custom domain setup</h2>
            <p className="text-muted-foreground text-sm">
              Set up your domain for the production deployment.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-[140px_1fr]">
            <div className="font-medium text-sm">Host at</div>
            <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-sm">
              {hostPath}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[140px_1fr]">
            <div className="font-medium text-sm">Domain</div>
            <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-sm">
              {hostDomain}
            </div>
          </div>
        </CardContent>
      </Card>

      <CustomDomain
        defaultDomain={customDomain?.hostname}
        defaultDomainId={customDomain?.id}
        pathPrefix={hostPath}
        projectId={projectId}
        status={pendingDomainStatus}
      />

      <Card className="border-border/60 bg-card/70">
        <CardContent className="space-y-5 p-6">
          <div>
            <h3 className="font-semibold text-sm">Cloudflare configurations</h3>
            <p className="text-muted-foreground text-xs">
              If you are using Cloudflare, ensure that the correct
              configurations are in place.
            </p>
            <Button asChild size="sm" variant="ghost">
              <Link href="https://neue.com">Read the docs</Link>
            </Button>
          </div>
          <pre className="rounded-xl bg-muted/50 p-4 text-foreground text-xs">
            <code>{`addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    const urlObject = new URL(request.url);
    if (/^\\/docs/.test(urlObject.pathname)) {
      const DOCS_URL = "${projectSlug}.neue.com";
      const CUSTOM_URL = "${hostDomain}";

      let url = new URL(request.url);
      url.hostname = DOCS_URL;

      let proxyRequest = new Request(url, request);

      proxyRequest.headers.set("Host", DOCS_URL);
      proxyRequest.headers.set("X-Forwarded-Host", CUSTOM_URL);
      proxyRequest.headers.set("X-Forwarded-Proto", "https");

      return await fetch(proxyRequest);
    }
  } catch (error) {
    return await fetch(request);
  }

  return await fetch(request);
}`}</code>
          </pre>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/70">
        <CardContent className="space-y-5 p-6">
          <div>
            <h3 className="font-semibold text-sm">Additional settings</h3>
            <p className="text-muted-foreground text-xs">
              Learn how to configure your domain for other providers.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Route 53 and Cloudfront",
                body: "Host at a /docs subdirectory using AWS services.",
              },
              {
                title: "Vercel",
                body: "Host at a /docs subdirectory using Vercel.",
              },
            ].map((item) => (
              <div
                className="rounded-lg border border-border/60 bg-background/60 p-4"
                key={item.title}
              >
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="mt-2 text-muted-foreground text-xs">
                  {item.body}
                </p>
                <Button asChild size="sm" variant="ghost">
                  <Link href="https://neue.com">Read the docs</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
