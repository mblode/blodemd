import { loadDocsConfig } from "@repo/previewing";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { buildNavigation, flattenNav } from "@/lib/navigation";
import { buildOpenApiRegistry } from "@/lib/openapi";
import { toDocHref } from "@/lib/routes";
import { getTenantBySlug } from "@/lib/tenants";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return new NextResponse("Not found", { status: 404 });
  }

  const configResult = await loadDocsConfig(tenant.docsPath);
  if (!configResult.ok) {
    return new NextResponse("Invalid config", { status: 400 });
  }

  const registry = await buildOpenApiRegistry(
    configResult.config,
    tenant.docsPath
  );
  const nav = buildNavigation(configResult.config, registry);
  const pages = flattenNav(nav);

  const headerStore = await headers();
  const host = headerStore.get("host") ?? "";
  const strategy = headerStore.get("x-tenant-strategy");
  const requestedHost = headerStore.get("x-tenant-domain");
  const protocol = headerStore.get("x-forwarded-proto") ?? "https";
  const canonicalHost =
    strategy === "custom-domain" && requestedHost
      ? requestedHost
      : tenant.primaryDomain;
  const origin = `${protocol}://${canonicalHost || host}`;
  const basePathHeader =
    headerStore.get("x-tenant-base-path") ?? tenant.pathPrefix ?? "";
  const basePath = strategy === "path" ? "" : basePathHeader;

  const urls = Array.from(
    new Set(pages.map((page) => `${origin}${toDocHref(page.path, basePath)}`))
  );
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n") +
    "\n</urlset>";

  return new NextResponse(xml, {
    headers: {
      "content-type": "application/xml",
    },
  });
}
