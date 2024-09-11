/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
      EXA_API_KEY: process.env.EXA_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    },
  };
  
  export default nextConfig;