/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source:
          "/blog/best-typing-exercises-and-drills-to-improve-speed-and-accuracy",
        destination:
          "/blog/best-typing-exercise-to-improve-speed-and-accuracy",
        permanent: true,
      },
      {
        source:
          "/blog/typing-test-challenge-how-your-wpm-compares-to-the-average-in-2025",
        destination:
          "/blog/online-typing-tool-for-free-the-monkey-type",
        permanent: true,
      },
      {
        source:
          "/blog/how-to-improve-typing-speed-10-expert-tips-that-actually-work",
        destination:
          "/blog/how-to-increase-typing-speed-from-30-wpm-to-60-wpm-complete-beginner-s-guide",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
    ],
  },
};

export default nextConfig;
