# Étape 1 : Construction
FROM node:20-alpine AS build

WORKDIR /app

# Copie des fichiers de configuration des dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie de l'intégralité des sources
COPY . .

# Construction de l'application
RUN npm run build

# Étape 2 : Service avec Nginx
FROM nginx:stable-alpine

# Copie des fichiers construits vers le dossier de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuration personnalisée Nginx pour supporter React Router
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
