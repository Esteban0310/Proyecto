# Etapa 1: Build Angular
FROM node:20-alpine AS build
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar todo el frontend
COPY . .

# Compilar Angular para producción
RUN npm run build -- --configuration production

# Renombrar index.csr.html a index.html si existe
RUN if [ -f /app/dist/panel-doctor/browser/index.csr.html ]; then mv /app/dist/panel-doctor/browser/index.csr.html /app/dist/panel-doctor/browser/index.html; fi

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar los archivos compilados al Nginx
COPY --from=build /app/dist/panel-doctor/browser /usr/share/nginx/html

# Configuración SPA + proxy al backend
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri /index.html; \
    } \
    location /api/ { \
        proxy_pass http://backend:8000/; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
