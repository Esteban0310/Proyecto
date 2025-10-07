# Etapa 1: Build con Node
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Build de Angular para producción, solo browser
RUN npm run build -- --configuration production

# Renombramos index.csr.html a index.html para Nginx
RUN mv dist/panel-doctor/browser/index.csr.html dist/panel-doctor/browser/index.html

# Etapa 2: Servir con Nginx
FROM nginx:alpine
# Copia solo los archivos estáticos del browser a Nginx
COPY --from=build /app/dist/panel-doctor/browser /usr/share/nginx/html

# Configuración opcional para rutas SPA (Angular)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
