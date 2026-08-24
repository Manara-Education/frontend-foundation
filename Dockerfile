# syntax=docker/dockerfile:1

# =============================================================================
# Stage 1 — build
# =============================================================================
# Node version comes from .nvmrc via the build argument below, so CI, a
# developer's laptop and this image cannot drift apart. Bumping .nvmrc and the
# default here is the whole change.
ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /build

# --- Dependency layer ------------------------------------------------------
# Manifests alone first, so Docker reuses the installed dependency layer for
# every build where they have not changed. Copying the whole tree first would
# make every source edit reinstall from scratch.
#
# `npm ci` (not `npm install`) installs strictly from package-lock.json and
# fails outright if the two disagree — the build must not silently resolve a
# different dependency tree than the one CI proved.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# --- Source layer ----------------------------------------------------------
COPY . .

# Vite inlines VITE_* variables at BUILD time, so this has to be present now —
# there is no runtime configuration to change it afterwards. It defaults to the
# relative path /api because the frontend and backend are same-origin behind
# Caddy, which is what keeps the session cookie working with `withCredentials`
# and leaves CSRF intact. Nothing secret may ever be passed here: whatever this
# is, it ships to the browser in plain text.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Type checking is a separate step from the build on purpose: Vite strips types
# without checking them, so `vite build` alone would happily emit a bundle from
# code that does not type check.
RUN npm run typecheck
RUN npm run build

# =============================================================================
# Stage 2 — runtime
# =============================================================================
# Caddy, holding nothing but the built assets. No Node, no npm, no node_modules,
# no source — none of it is needed to serve static files, and every one of them
# would be attack surface in production.
FROM caddy:2-alpine AS runtime

# Caddy's own image already runs its server as a non-root user for the runtime
# work; the config and the assets are root-owned and read-only to it.
COPY --chown=root:root --chmod=444 Caddyfile /etc/caddy/Caddyfile
COPY --from=build --chown=root:root /build/dist /srv

# Local default. Production overrides this with the real hostname, which is what
# makes Caddy request and renew a Let's Encrypt certificate automatically.
ENV SITE_ADDRESS=:80

# 80 and 443 are the only ports this stack exposes publicly.
EXPOSE 80 443

# Caddy's own config check, so a container whose configuration failed to load is
# reported unhealthy rather than sitting there serving nothing.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile || exit 1

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
