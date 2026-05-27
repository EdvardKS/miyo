# Production image for the fiestas backend. Slim, no dev deps, runs as
# non-root, exposes :5000 inside the container. The deploy pipeline relies
# on `wget` (busybox in alpine) for the healthcheck declared in
# docker-compose.yml.

FROM node:18-alpine

# wget is present in alpine; install curl as a healthcheck fallback for
# environments where IPv6 trips up wget.
RUN apk add --no-cache curl tini

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# Make /app/uploads exist at build time so the bind-mount sees the right
# owner even when the volume is fresh.
RUN mkdir -p /app/uploads && chown -R node:node /app

USER node

EXPOSE 5000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
