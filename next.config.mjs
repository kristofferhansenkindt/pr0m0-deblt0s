/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove variáveis de ambiente que não devem ser expostas no cliente
  env: {
    // Apenas variáveis que devem ser públicas
  },
  
  // Configurações de imagem se necessário
  images: {
    domains: ['blob.v0.dev'],
    unoptimized: true,
  },
  
  // Configurações experimentais se necessário
  experimental: {
    // Configurações experimentais aqui
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },

  // Handle missing environment variables during build
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Provide fallback for missing DATABASE_URL during build
      if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = 'postgresql://placeholder:placeholder@placeholder:5432/placeholder'
      }
    }
    return config
  },
}

export default nextConfig
