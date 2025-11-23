/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        // Opcional: aliases personalizados
      },
    },
  },
}

module.exports = nextConfig
