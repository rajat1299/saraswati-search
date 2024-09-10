/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['exa-js', 'framer-motion'],
    env: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    },
    images: {
      domains: ['nextjs.org'], // Add this line if you're using Next.js Image component with external URLs
    },
  };

  export default nextConfig;