import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Erlaubt mehrere Bild-Uploads pro Inserat (Default-Limit ist 1 MB)
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
