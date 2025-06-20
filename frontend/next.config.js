/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable static exports as we're using Create React App
  output: 'export',
  // Configure images to work with static export
  images: {
    unoptimized: true,
  },
  // Add webpack config to handle Create React App
  webpack: (config, { isServer }) => {
    // Add any necessary webpack configurations here
    return config;
  },
  // Handle static file serving
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/',
      },
    ];
  },
};

module.exports = nextConfig;
