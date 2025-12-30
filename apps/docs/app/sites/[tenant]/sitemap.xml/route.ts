import { loadDocsConfig } from "@repo/previewing";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { buildNavigation, flattenNav } from "@/lib/navigation";
import { buildOpenApiRegistry } from "@/lib/openapi";
import { toDocHref } from "@/lib/routes";
import { getTenantBySlug } from "@/lib/tenants";

export async function GET(
  _request: Request,
  { params }: { params: { tenant: string } }
) {
  const tenant = getTenantBySlug(params.tenant);
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

  const headerStore = headers();
  const host = headerStore.get("host") ?? "";
  const protocol = headerStore.get("x-forwarded-proto") ?? "https";
  const origin = `${protocol}://${host}`;

  const urls = Array.from(
    new Set(
      pages.map(
        (page) => `${origin}${toDocHref(page.path, tenant.pathPrefix ?? "")}`
      )
    )
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
