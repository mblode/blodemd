import type { DomainRecord, DomainStatus, Tenant } from "@repo/models";

export type TenantOverview = Tenant & {
  status: "active" | "disabled";
  updatedAt: string;
  domains: { domain: string; status: DomainStatus }[];
  previews: { name: string; status: "Ready" | "Building"; url: string }[];
};

const baseDomain = "docsplatform.com";

export const tenantData: TenantOverview[] = [
  {
    id: "tenant_atlas",
    slug: "atlas",
    name: "Atlas",
    description: "Mintlify-style docs platform",
    primaryDomain: `atlas.${baseDomain}`,
    subdomain: "atlas",
    customDomains: ["docs.atlas.example"],
    docsPath: "/apps/docs/content/atlas",
    status: "active",
    updatedAt: "5 minutes ago",
    domains: [
      {
        domain: `atlas.${baseDomain}`,
        status: {
          status: "Valid Configuration",
          dnsRecords: [],
        },
      },
      {
        domain: "docs.atlas.example",
        status: {
          status: "Pending Verification",
          dnsRecords: [
            {
              type: "TXT",
              name: "_vercel.docs.atlas.example",
              value: "vc-domain-verify=atlas",
            },
          ],
        },
      },
    ],
    previews: [
      {
        name: "feature/tenant-routing",
        status: "Ready",
        url: "atlas---preview-atlas.vercel.dev",
      },
      {
        name: "docs/custom-domains",
        status: "Building",
        url: "atlas---preview-domains.vercel.dev",
      },
    ],
  },
  {
    id: "tenant_orbit",
    slug: "orbit",
    name: "Orbit",
    description: "Tenant using custom subpaths",
    primaryDomain: `orbit.${baseDomain}`,
    subdomain: "orbit",
    customDomains: ["docs.orbit.example"],
    pathPrefix: "/docs",
    docsPath: "/apps/docs/content/atlas",
    status: "active",
    updatedAt: "12 minutes ago",
    domains: [
      {
        domain: "docs.orbit.example",
        status: {
          status: "Invalid Configuration",
          dnsRecords: [
            {
              type: "CNAME",
              name: "docs",
              value: "cname.vercel-dns.com",
            },
          ],
        },
      },
    ],
    previews: [
      {
        name: "feature/new-theme",
        status: "Ready",
        url: "orbit---preview-theme.vercel.dev",
      },
    ],
  },
];

export const getTenant = (slug: string) =>
  tenantData.find((tenant) => tenant.slug === slug) ?? null;

export const getDnsRecords = (status: DomainStatus): DomainRecord[] =>
  status.dnsRecords ?? [];
