import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Disable strict mode because Socket.IO effects run twice in React strict mode,
  // causing duplicate socket connections and event handlers.
  reactStrictMode: false,
}

export default nextConfig
