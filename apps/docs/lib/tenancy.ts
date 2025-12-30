import { normalizePath, withoutLeadingSlash } from "@repo/common";
import type { Tenant } from "@repo/models";
import { getTenantSlugForDomain } from "./edge-config";
import {
  getTenantByCustomDomain,
  getTenantBySlug,
  getTenantBySubdomain,
  platformConfig,
  tenants,
} from "./tenants";

const DEFAULT_RESERVED_PATHS = [
  "/api",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
];
const RESERVED_SUBDOMAINS = ["www", "app", "admin", "dashboard"];

export interface TenantResolution {
  tenant: Tenant;
  strategy: "preview" | "custom-domain" | "subdomain" | "path";
  host: string;
  pathname: string;
  rewrittenPath: string;
  previewPrefix?: string;
}

const normalizeHost = (host: string) => host.replace(/:\d+$/, "").toLowerCase();

const stripPrefix = (pathname: string, prefix: string) => {
  const normalized = normalizePath(pathname);
  const normalizedPrefix = normalizePath(prefix);
  if (!normalizedPrefix) {
    return normalized;
  }
  if (normalized === normalizedPrefix) {
    return "";
  }
  if (normalized.startsWith(`${normalizedPrefix}/`)) {
    return normalized.slice(normalizedPrefix.length + 1);
  }
  return normalized;
};

const extractPreviewPrefix = (hostname: string) => {
  if (!hostname.includes("---")) {
    return null;
  }
  const [prefix] = hostname.split("---");
  return prefix || null;
};

const extractSubdomain = (hostname: string) => {
  const rootDomain = platformConfig.rootDomain;
  if (!hostname.endsWith(`.${rootDomain}`)) {
    return null;
  }
  const subdomain = hostname.slice(0, -1 * (rootDomain.length + 1));
  if (!subdomain || RESERVED_SUBDOMAINS.includes(subdomain)) {
    return null;
  }
  return subdomain;
};

const extractPathTenant = (pathname: string) => {
  const parts = normalizePath(pathname).split("/").filter(Boolean);
  const [tenantSlug] = parts;
  if (!tenantSlug) {
    return null;
  }
  return getTenantBySlug(tenantSlug) ? tenantSlug : null;
};

const resolveCustomDomainTenant = async (hostname: string) => {
  const edgeSlug = await getTenantSlugForDomain(hostname);
  if (edgeSlug) {
    return getTenantBySlug(edgeSlug);
  }
  return getTenantByCustomDomain(hostname);
};

export const isReservedPath = (pathname: string) => {
  const assetPrefix = platformConfig.assetPrefix;
  if (assetPrefix && pathname.startsWith(assetPrefix)) {
    return true;
  }
  return DEFAULT_RESERVED_PATHS.some((prefix) => pathname.startsWith(prefix));
};

export const resolveTenant = async (
  host: string,
  pathname: string
): Promise<TenantResolution | null> => {
  const hostname = normalizeHost(host);
  const previewPrefix = extractPreviewPrefix(hostname);

  if (previewPrefix) {
    const tenant = getTenantBySlug(previewPrefix) ?? tenants[0];
    if (tenant) {
      return {
        tenant,
        strategy: "preview",
        host: hostname,
        pathname,
        rewrittenPath: `/sites/${tenant.slug}/${withoutLeadingSlash(pathname)}`,
        previewPrefix,
      };
    }
  }

  const customTenant = await resolveCustomDomainTenant(hostname);
  if (customTenant) {
    const trimmed = customTenant.pathPrefix
      ? stripPrefix(pathname, customTenant.pathPrefix)
      : normalizePath(pathname);
    return {
      tenant: customTenant,
      strategy: "custom-domain",
      host: hostname,
      pathname,
      rewrittenPath: `/sites/${customTenant.slug}/${trimmed}`,
    };
  }

  const subdomain = extractSubdomain(hostname);
  if (subdomain) {
    const tenant = getTenantBySubdomain(subdomain);
    if (tenant) {
      const trimmed = tenant.pathPrefix
        ? stripPrefix(pathname, tenant.pathPrefix)
        : normalizePath(pathname);
      return {
        tenant,
        strategy: "subdomain",
        host: hostname,
        pathname,
        rewrittenPath: `/sites/${tenant.slug}/${trimmed}`,
      };
    }
  }

  const pathTenant = extractPathTenant(pathname);
  if (pathTenant) {
    const tenant = getTenantBySlug(pathTenant);
    if (tenant) {
      const normalized = normalizePath(pathname);
      const remainder = normalized.split("/").slice(1).join("/");
      return {
        tenant,
        strategy: "path",
        host: hostname,
        pathname,
        rewrittenPath: `/sites/${tenant.slug}/${remainder}`,
      };
    }
  }

  return null;
};
