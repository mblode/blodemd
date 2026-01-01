/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: process.env.PLATFORM_ASSET_PREFIX || "",
  async rewrites() {
    const assetPrefix = process.env.PLATFORM_ASSET_PREFIX || "";
    if (!assetPrefix) {
      return [];
    }
    return [
      {
        source: `${assetPrefix}/_next/:path*`,
        destination: "/_next/:path*",
      },
    ];
  },
  transpilePackages: [
    "@repo/common",
    "@repo/contracts",
    "@repo/models",
    "@repo/prebuild",
    "@repo/previewing",
    "@repo/validation",
  ],
};

export default nextConfig;
