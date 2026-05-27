# Multi-stage frontend image. Stage 1 compiles the React/Vite SPA. Stage 2
# serves the static bundle with nginx on :3000 (matches viewerSoftware
# autodeploy upstream port for this repo).
#
# The runtime nginx layer also proxies /api, /uploads and /socket.io to the
# backend service over the private docker network — see nginx.conf.

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache curl
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
