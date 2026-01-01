/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@repo/api-client",
    "@repo/common",
    "@repo/contracts",
    "@repo/models",
    "@repo/supabase",
  ],
};

export default nextConfig;
