import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  webpack: (config) => {
    // Allow webpack to resolve ESM-only packages (e.g. @splinetool/react-spline)
    // that export only under the "import" condition with no "require" fallback.
    config.resolve.conditionNames = ['import', 'require', 'node', 'default'];
    return config;
  },
};

export default nextConfig;
