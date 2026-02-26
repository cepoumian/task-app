FROM nginx:1.25-alpine

# Eliminar config default de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar nuestra configuración
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1