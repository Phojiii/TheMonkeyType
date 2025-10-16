/** @type {import('next').NextConfig} */
const nextConfig = { 
    reactStrictMode: true,
  images: {
    domains: ["img.clerk.com", "images.clerk.dev"],
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
    ],
  },
};
export default nextConfig;
