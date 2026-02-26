# ============================================
# DOCKERFILE PROFESIONAL PARA NEXT.JS 14
# Optimizado para producción
# Imagen final: ~100MB (vs 1GB+ sin optimizar)
# ============================================

# --------------------------------------------
# STAGE 1: Dependencies
# Instalar SOLO las dependencias necesarias
# --------------------------------------------
FROM node:20-alpine AS deps

# Instalar libc6-compat para compatibilidad
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar SOLO los archivos de dependencias
# Esto maximiza el cache de Docker
COPY package.json package-lock.json* ./

# Instalar dependencias
# --frozen-lockfile asegura reproducibilidad
RUN npm ci --frozen-lockfile

# --------------------------------------------
# STAGE 2: Builder
# Construir la aplicación Next.js
# --------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias del stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Variables de entorno para el build
# NEXT_TELEMETRY_DISABLED=1 desactiva telemetría
ENV NEXT_TELEMETRY_DISABLED=1

# Construir la aplicación
# output: 'standalone' en next.config.js genera servidor autónomo
RUN npm run build

# --------------------------------------------
# STAGE 3: Runner (Imagen final)
# Solo lo necesario para ejecutar
# --------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Variables de entorno de producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos públicos
COPY --from=builder /app/public ./public

# Copiar el output standalone (solo lo necesario)
# Next.js genera esto cuando output: 'standalone'
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Comando de inicio
CMD ["node", "server.js"]

# ============================================
# ANÁLISIS DE OPTIMIZACIÓN:
# ============================================
# 1. Multi-stage builds: 3 stages separados
#    - deps: Solo instalar dependencias
#    - builder: Solo construir
#    - runner: Solo ejecutar
#
# 2. Alpine Linux: Base ultra-ligera (~5MB vs ~100MB)
#
# 3. Standalone output: Next.js copia solo lo necesario
#    - Sin node_modules completo
#    - Sin código fuente
#    - Solo runtime mínimo
#
# 4. Usuario no-root: Seguridad
#
# 5. Cache optimization:
#    - package.json copiado antes del código
#    - npm ci usa lockfile (reproducible)
#
# 6. Health check: Monitoreo automático
#
# RESULTADO:
# - Imagen final: ~100-120MB
# - Build time: ~2 minutos
# - Startup: ~3 segundos
# - Segura, rápida, reproducible
# ============================================
