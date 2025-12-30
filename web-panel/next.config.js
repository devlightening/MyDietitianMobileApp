/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5178'

    return [
      {
        source: '/api/:path*',
        destination: `${base}/api/:path*`,
      },
    ]
  },

  async redirects() {
    return [
      { source: '/login', destination: '/auth/login', permanent: false },
      { source: '/register', destination: '/auth/register', permanent: false },
      { source: '/access-key', destination: '/auth/client-access', permanent: false },
    ]
  },
}

export default nextConfig
