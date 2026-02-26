# 🐳 Task App Frontend - Docker Professional

Aplicación Next.js 14 dockerizada con optimización profesional para el curso de Docker DevOps.

## 📊 Características

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Optimización:** Multi-stage builds (imagen final ~221MB vs 1GB+ sin optimizar)
- **Seguridad:** Usuario no-root, health checks
- **Producción:** Standalone output optimizado

## 🚀 Quick Start

### Opción 1: Con Docker (Recomendado)

```bash
# 1. Clonar el repositorio
git clone <tu-repo-url>
cd task-app-frontend

# 2. Construir imagen
docker build -t task-frontend:v1 .

# 3. Ejecutar contenedor
docker run -d --name task-app -p 3000:3000 task-frontend:v1

# 4. Abrir en navegador
open http://localhost:3000
```

### Opción 2: Desarrollo Local (Sin Docker)

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar en modo desarrollo
npm run dev

# 3. Abrir en navegador
open http://localhost:3000
```

## 📦 Scripts Disponibles

```bash
npm run dev      # Desarrollo con hot reload
npm run build    # Build de producción
npm run start    # Ejecutar build de producción
npm run lint     # Linter
```

## 🏗️ Arquitectura Docker

### Multi-Stage Build (3 Stages)

```
Stage 1: deps     → Instalar dependencias
Stage 2: builder  → Construir aplicación
Stage 3: runner   → Runtime mínimo (solo 221MB)
```

### Optimizaciones Aplicadas

✅ **Standalone Output** - Solo ~30MB de dependencias runtime (vs ~500MB completo)
✅ **Alpine Linux** - Imagen base ultra-ligera (~5MB vs ~100MB Ubuntu)
✅ **Multi-stage builds** - Separar build-time de run-time
✅ **Usuario no-root** - Seguridad (usuario `nextjs`)
✅ **Health checks** - Monitoreo automático (`/api/health`)
✅ **.dockerignore** - Optimización del build context

### Métricas de Optimización

| Métrica       | Sin Optimizar | Optimizado | Mejora |
| ------------- | ------------- | ---------- | ------ |
| Tamaño imagen | ~1.2GB        | ~221MB     | 82% ↓  |
| Build time    | ~5 min        | ~2 min     | 60% ↓  |
| Startup time  | ~10s          | ~3s        | 70% ↓  |

## 🔍 Comandos Docker Útiles

### Inspeccionar la imagen

```bash
# Ver tamaño y capas
docker images task-frontend:v1
docker history task-frontend:v1

# Ver configuración completa
docker inspect task-frontend:v1
```

### Debugging

```bash
# Ver logs
docker logs task-app

# Seguir logs en tiempo real
docker logs -f task-app

# Entrar al contenedor
docker exec -it task-app sh

# Health check manual
curl http://localhost:3000/api/health
```

### Limpieza

```bash
# Detener y eliminar contenedor
docker stop task-app && docker rm task-app

# Eliminar imagen
docker rmi task-frontend:v1
```

## 📁 Estructura del Proyecto

```
task-app-frontend/
├── app/
│   ├── api/health/route.ts    # Health check endpoint
│   ├── layout.tsx              # Layout principal
│   └── page.tsx                # UI de lista de tareas
├── public/                     # Assets estáticos
├── Dockerfile                  # Multi-stage optimizado
├── .dockerignore               # Optimización del build context
├── next.config.js              # Config (standalone output)
├── package.json                # Dependencias
├── package-lock.json           # Lockfile para builds reproducibles
├── tsconfig.json               # TypeScript config
└── README.md                   # Este archivo
```

## 🔧 Configuración Importante

### next.config.js

```javascript
module.exports = {
  output: "standalone", // ← Crítico para optimización
};
```

Esta configuración genera un servidor autónomo con solo las dependencias runtime necesarias, reduciendo de ~500MB a ~30MB.

## 🏥 Health Check

La aplicación incluye un endpoint de health check:

```bash
curl http://localhost:3000/api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "timestamp": "2024-02-15T...",
  "service": "task-app-frontend"
}
```

## 🔒 Seguridad

- ✅ Ejecuta como usuario no-root (`nextjs`)
- ✅ No incluye código fuente en imagen final
- ✅ No incluye build tools en runtime
- ✅ Imagen base oficial y verificada
- ✅ Variables de entorno en runtime (no hardcoded)

## 📚 Recursos

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

## 🎓 Parte del Curso

Este proyecto es parte del **Plan Profesional Docker Full-Stack** que incluye:

- ✅ **Fase 1:** Frontend Next.js (Este proyecto)
- 🔜 **Fase 2:** Backend API + PostgreSQL
- 🔜 **Fase 3:** Networking profesional
- 🔜 **Fase 4:** Docker Compose avanzado
- 🔜 **Fase 5:** Persistencia y caché
- 🔜 **Fase 6:** CI/CD y deployment

## 📝 Notas

- Imagen optimizada para **producción**
- Compatible con **ARM64** (Mac M1/M2/M3) y **AMD64**
- Listo para **Kubernetes** y orquestadores
- Health checks configurados para **rolling updates**

---

**Desarrollado como parte del curso de Docker DevOps** 🐳
