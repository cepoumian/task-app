# ============================================
# STAGE 1: Dependencies
# ============================================
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci --frozen-lockfile

# ============================================
# STAGE 2: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Compilar TypeScript → JavaScript
RUN npm run build

# ============================================
# STAGE 3: Runner
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Usuario no-root
RUN addgroup --system --gid 1001 nodejs \
  && adduser  --system --uid 1001 nodeapp

# Solo copiamos lo necesario para correr
COPY --from=deps    /app/node_modules ./node_modules
COPY --from=builder /app/dist         ./dist
COPY --from=builder /app/package.json ./package.json

USER nodeapp
EXPOSE 4000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/index.js"]


