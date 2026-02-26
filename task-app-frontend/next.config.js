/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output es CRÍTICO para Docker
  // Genera un servidor autónomo con solo las dependencias necesarias
  output: 'standalone',
  
  // Variables de entorno públicas
  env: {
    API_URL: process.env.API_URL || 'http://localhost:4000',
  },
}

module.exports = nextConfig
