#!/bin/bash

# ============================================
# deploy.sh — Script de deployment
# Uso: ./deploy.sh [SHA del commit]
# Ejemplo: ./deploy.sh a1b2c3d
# Sin argumento: usa latest
# ============================================

# ─── Configuración ────────────────────────
DOCKER_USERNAME="tu-usuario-docker-hub"   # ← cambia esto
TAG=${1:-latest}   # Si no se pasa argumento, usa "latest"

IMAGE_FRONTEND="$DOCKER_USERNAME/task-frontend:$TAG"
IMAGE_BACKEND="$DOCKER_USERNAME/task-backend:$TAG"

# ─── Colores para los logs ─────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'   # No Color (resetear color)

# ─── Funciones helper ──────────────────────
log_ok()   { echo -e "${GREEN}✅ $1${NC}"; }
log_fail() { echo -e "${RED}❌ $1${NC}"; exit 1; }

# ─── Inicio ────────────────────────────────
echo "🚀 Iniciando deploy con tag: $TAG"
echo "   Frontend: $IMAGE_FRONTEND"
echo "   Backend:  $IMAGE_BACKEND"
echo ""

# ─── Paso 1: Descargar imágenes nuevas ─────
echo "📦 Descargando imágenes..."

docker pull "$IMAGE_FRONTEND" || log_fail "No se pudo descargar frontend"
docker pull "$IMAGE_BACKEND"  || log_fail "No se pudo descargar backend"

log_ok "Imágenes descargadas"

# ─── Paso 2: Actualizar el compose ─────────
echo ""
echo "🔄 Actualizando contenedores..."

# Exportamos el TAG para que docker-compose pueda usarlo
export TAG

docker compose -f docker-compose.yml \
               -f docker-compose.prod.yml \
               up -d --no-build

# --no-build: usa las imágenes que ya descargamos, no las construye

if [ $? -eq 0 ]; then
    log_ok "Contenedores actualizados"
else
    log_fail "Error al actualizar contenedores"
fi

# ─── Paso 3: Verificar health ──────────────
echo ""
echo "🏥 Verificando que los servicios están sanos..."

# Esperar 10 segundos para que los contenedores arranquen
sleep 10

# Verificar backend
HEALTH=$(docker inspect --format='{{.State.Health.Status}}' task-backend 2>/dev/null)

if [ "$HEALTH" = "healthy" ]; then
    log_ok "Backend: healthy"
else
    log_fail "Backend no está healthy (estado: $HEALTH)"
fi

# ─── Paso 4: Limpiar imágenes viejas ───────
echo ""
echo "🧹 Limpiando imágenes antiguas..."

docker image prune -f

log_ok "Limpieza completada"

# ─── Resumen ───────────────────────────────
echo ""
echo "════════════════════════════════════"
log_ok "Deploy completado exitosamente"
echo "   Tag desplegado: $TAG"
echo "   Fecha: $(date)"
echo "════════════════════════════════════"