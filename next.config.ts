import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  async redirects() {
    return [
      // The React app owns the root; old bookmarks to the static landing follow.
      { source: "/index.html", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
