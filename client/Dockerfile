# syntax=docker/dockerfile:1
ARG NODE_VERSION=22-bookworm-slim

# ---- deps ----
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build ----
# NEXT_PUBLIC_API_URL is inlined into the client bundle at build time, so it
# must be supplied as a build arg, e.g.:
#   docker build --build-arg NEXT_PUBLIC_API_URL=https://api.example.com .
FROM node:${NODE_VERSION} AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runtime: Next.js standalone output only, non-root ----
FROM node:${NODE_VERSION} AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

RUN groupadd --system nodeapp && useradd --system --gid nodeapp nodeapp

COPY --from=build --chown=nodeapp:nodeapp /app/public ./public
COPY --from=build --chown=nodeapp:nodeapp /app/.next/standalone ./
COPY --from=build --chown=nodeapp:nodeapp /app/.next/static ./.next/static

USER nodeapp
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3001)+'/login',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
