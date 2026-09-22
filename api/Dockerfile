# syntax=docker/dockerfile:1

# Debian slim (glibc), not Alpine: bcrypt ships prebuilt binaries for glibc
# targets, so `npm ci` installs it without needing a C++ toolchain at all.
# Alpine (musl) would force a from-source compile of bcrypt on every build.
ARG NODE_VERSION=22-bookworm-slim

# ---- deps: install once, reused by both the build and prod-deps stages ----
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build: compile TypeScript with dev dependencies available ----
FROM node:${NODE_VERSION} AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- prod-deps: a second, clean install with devDependencies omitted ----
FROM node:${NODE_VERSION} AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- runtime: only compiled output + production node_modules, non-root ----
FROM node:${NODE_VERSION} AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV UPLOADS_DIR=/app/uploads

RUN groupadd --system nodeapp && useradd --system --gid nodeapp nodeapp \
    && mkdir -p /app/uploads/attachments \
    && chown -R nodeapp:nodeapp /app

COPY --from=prod-deps --chown=nodeapp:nodeapp /app/node_modules ./node_modules
COPY --from=build     --chown=nodeapp:nodeapp /app/dist ./dist
COPY --chown=nodeapp:nodeapp package.json ./

USER nodeapp
EXPOSE 3000
VOLUME ["/app/uploads"]

# Uses the app's own GET /health route — no extra tooling needed in the image.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/main.js"]
