import { normalizePath } from "@repo/common";
import {
  loadDocSource,
  loadDocsConfig,
  resolveDocPath,
} from "@repo/previewing";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ApiReference } from "@/components/api/api-reference";
import { DocShell } from "@/components/docs/doc-shell";
import { renderMdx } from "@/lib/mdx";
import { buildNavigation, findBreadcrumbs, flattenNav } from "@/lib/navigation";
import { buildOpenApiRegistry } from "@/lib/openapi";
import { getTenantBySlug } from "@/lib/tenants";
import { extractToc } from "@/lib/toc";

const getDocData = cache(async (tenantSlug: string, slugKey: string) => {
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) {
    return null;
  }

  const configResult = await loadDocsConfig(tenant.docsPath);
  if (!configResult.ok) {
    return {
      tenant,
      configErrors: configResult.errors,
    };
  }

  const config = configResult.config;
  let registry: Awaited<ReturnType<typeof buildOpenApiRegistry>>;
  try {
    registry = await buildOpenApiRegistry(config, tenant.docsPath);
  } catch (error) {
    return {
      tenant,
      configErrors: [
        error instanceof Error ? error.message : "OpenAPI parsing failed",
      ],
    };
  }
  const nav = buildNavigation(config, registry);
  const flatNav = flattenNav(nav);

  const currentPath = normalizePath(slugKey) || "index";
  const openApiEntry = registry.bySlug.get(currentPath);

  if (openApiEntry) {
    return {
      tenant,
      config,
      nav,
      flatNav,
      currentPath,
      breadcrumbs: findBreadcrumbs(nav, currentPath),
      pageTitle: openApiEntry.operation.summary ?? openApiEntry.identifier,
      pageDescription: openApiEntry.operation.description,
      toc: [],
      content: (
        <ApiReference
          entry={openApiEntry}
          proxyEnabled={config.openapiProxy?.enabled ?? false}
          tenantSlug={tenant.slug}
        />
      ),
    };
  }

  const resolved = await resolveDocPath(tenant.docsPath, currentPath);
  if (!resolved.exists) {
    return null;
  }

  const source = await loadDocSource(resolved.absolutePath);
  const { content, frontmatter } = await renderMdx(source);
  const toc = config.features?.toc === false ? [] : extractToc(source);
  const pageTitle =
    (frontmatter?.title as string | undefined) ??
    (currentPath === "index"
      ? config.name
      : (currentPath.split("/").pop() ?? config.name));
  const pageDescription =
    (frontmatter?.description as string | undefined) ??
    (currentPath === "index" ? config.description : undefined);

  return {
    tenant,
    config,
    nav,
    flatNav,
    currentPath,
    breadcrumbs: findBreadcrumbs(nav, currentPath),
    pageTitle,
    pageDescription,
    toc,
    content,
  };
});

export async function generateMetadata({
  params,
}: {
  params: { tenant: string; slug?: string[] };
}): Promise<Metadata> {
  const slugKey = (params.slug ?? []).join("/");
  const data = await getDocData(params.tenant, slugKey);
  if (!data || "configErrors" in data) {
    return {
      title: "Docs",
      description: "Documentation",
    };
  }

  const { config, pageTitle, pageDescription, tenant } = data;

  const baseTitle = config?.metadata?.defaultTitle ?? config?.name ?? "Docs";
  const titleTemplate = config?.metadata?.titleTemplate ?? "%s · Docs";
  const title = pageTitle ? titleTemplate.replace("%s", pageTitle) : baseTitle;

  const headerStore = await headers();
  const basePathHeader = headerStore.get("x-tenant-base-path") ?? "";
  const strategy = headerStore.get("x-tenant-strategy");
  const requestedHost = headerStore.get("x-tenant-domain");
  const basePath = basePathHeader || tenant.pathPrefix || "";
  const canonicalBasePath = strategy === "path" ? "" : basePath;
  const canonicalPath = slugKey ? `/${slugKey}` : "/";
  const fullCanonical = `${canonicalBasePath}${canonicalPath}`.replace(
    /\/+/g,
    "/"
  );
  const canonicalHost =
    strategy === "custom-domain" && requestedHost
      ? requestedHost
      : tenant.primaryDomain;

  return {
    title,
    description: pageDescription ?? config?.description,
    alternates: {
      canonical: `https://${canonicalHost}${fullCanonical}`,
    },
  };
}

export default async function DocPage({
  params,
}: {
  params: { tenant: string; slug?: string[] };
}) {
  const slugKey = (params.slug ?? []).join("/");
  const headerStore = await headers();
  const headerTenant = headerStore.get("x-tenant-slug");
  const basePathHeader = headerStore.get("x-tenant-base-path") ?? "";
  if (headerTenant && headerTenant !== params.tenant) {
    return notFound();
  }
  const data = await getDocData(params.tenant, slugKey);
  if (!data) {
    return notFound();
  }

  if ("configErrors" in data) {
    const errors = data.configErrors ?? [];
    return (
      <div className="doc-error">
        <h1>Invalid docs.json</h1>
        <ul>
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <DocShell
      anchors={data.config.navigation.global?.anchors}
      basePath={basePathHeader || data.tenant.pathPrefix || ""}
      breadcrumbs={data.breadcrumbs}
      config={data.config}
      content={data.content}
      currentPath={data.currentPath}
      nav={data.nav}
      pageDescription={data.pageDescription}
      pageTitle={data.pageTitle}
      searchItems={data.flatNav.map((item) => ({
        title: item.title,
        path: item.path,
      }))}
      toc={data.toc}
    />
  );
}
