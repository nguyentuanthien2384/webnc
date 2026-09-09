import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "https", hostname: "ui-avatars.com", pathname: "/**" },
  { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
];

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (apiUrl) {
  const apiOrigin = new URL(apiUrl);
  remotePatterns.push({
    protocol: apiOrigin.protocol.replace(":", "") as "http" | "https",
    hostname: apiOrigin.hostname,
    port: apiOrigin.port,
    pathname: "/**",
  });
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: { remotePatterns },
};

export default nextConfig;
