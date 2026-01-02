const rootDomain = process.env.PLATFORM_ROOT_DOMAIN ?? "neue.com";

export const platformConfig = {
  rootDomain,
  assetPrefix: process.env.PLATFORM_ASSET_PREFIX ?? "",
};
