# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# --- runtime stage ---
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Copy built assets
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Nginx config (SPA fallback + no-cache for env.js)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Entry point to generate /usr/share/nginx/html/env.js from env vars
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
