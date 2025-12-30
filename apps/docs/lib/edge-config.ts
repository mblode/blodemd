import { get } from "@vercel/edge-config";

export const getTenantSlugForDomain = async (domain: string) => {
  if (!process.env.EDGE_CONFIG) {
    return null;
  }
  try {
    const value = (await get(`tenant_domain_${domain}`)) as
      | string
      | null
      | undefined;
    return value ?? null;
  } catch {
    return null;
  }
};
