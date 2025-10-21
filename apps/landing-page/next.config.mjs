/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configuración para resolver el problema de pthread_create y EAGAIN
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  // Deshabilitar completamente el uso de workers
  webpack: (config, { isServer, dev }) => {
    // Limitar paralelismo a 1 en todos los casos
    config.parallelism = 1

    // Deshabilitar workers de webpack
    config.optimization = {
      ...config.optimization,
      splitChunks: false,
    }

    // Configuración específica para evitar spawn de procesos
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    return config
  },
  // Configuración para reducir el uso de workers
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 1,
  },
  // Deshabilitar optimizaciones que requieren workers
  swcMinify: false,
  // Configuración de build
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

export default nextConfig
