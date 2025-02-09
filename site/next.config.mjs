/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CLIENT_API_KEY: process.env.NEXT_PUBLIC_CLIENT_API_KEY,
  },
}

export default nextConfig
