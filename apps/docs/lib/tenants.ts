import path from "node:path";
import type { Tenant } from "@repo/models";

const rootDomain = process.env.PLATFORM_ROOT_DOMAIN ?? "docsplatform.com";

const tenantDocsPath = (slug: string) =>
  path.join(process.cwd(), "content", slug);

export const tenants: Tenant[] = [
  {
    id: "tenant_atlas",
    slug: "atlas",
    name: "Atlas",
    description: "Mintlify-style docs platform",
    primaryDomain: `atlas.${rootDomain}`,
    subdomain: "atlas",
    customDomains: ["docs.atlas.example"],
    docsPath: tenantDocsPath("atlas"),
    status: "active",
  },
  {
    id: "tenant_orbit",
    slug: "orbit",
    name: "Orbit",
    description: "Preview tenant for subpath demos",
    primaryDomain: `orbit.${rootDomain}`,
    subdomain: "orbit",
    customDomains: ["docs.orbit.example"],
    pathPrefix: "/docs",
    docsPath: tenantDocsPath("atlas"),
    status: "active",
  },
];

export const getTenantBySlug = (slug: string) =>
  tenants.find((tenant) => tenant.slug === slug) ?? null;

export const getTenantBySubdomain = (subdomain: string) =>
  tenants.find((tenant) => tenant.subdomain === subdomain) ?? null;

export const getTenantByCustomDomain = (domain: string) =>
  tenants.find((tenant) => tenant.customDomains.includes(domain)) ?? null;

export const getTenantByDomain = (domain: string) =>
  tenants.find((tenant) => tenant.primaryDomain === domain) ??
  getTenantByCustomDomain(domain);

export const getTenantByPathPrefix = (prefix: string) =>
  tenants.find((tenant) => tenant.pathPrefix === prefix) ?? null;

export const getDefaultTenant = () => tenants[0] ?? null;

export const platformConfig = {
  rootDomain,
  assetPrefix: process.env.PLATFORM_ASSET_PREFIX ?? "",
};
