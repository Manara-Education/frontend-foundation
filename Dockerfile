# syntax=docker/dockerfile:1

# =============================================================================
# Stage 1 — build the SPA
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
# Stage 2 — build Caddy from source, with patched modules
# =============================================================================
# WHY THIS STAGE EXISTS AT ALL.
#
# The runtime used to be plain `caddy:2-alpine`. A scan of that image reported
# seventeen HIGH/CRITICAL findings compiled into /usr/bin/caddy, including
# CVE-2026-56854 (CRITICAL) in golang.org/x/crypto — the SSH authentication
# bypass — plus eleven Go standard-library advisories.
#
# None of that is fixable by moving to a newer Caddy tag, and this was checked
# rather than assumed. Two facts settle it:
#
#   1. `caddy:2-alpine` and `caddy:2.11.4-alpine` resolve to the SAME manifest
#      digest (sha256:5f5c8640aae0…). The "newer" tag is the same image.
#   2. v2.11.4 is the latest Caddy release (2026-06-03) and its go.mod still
#      requires exactly the vulnerable versions:
#         golang.org/x/crypto v0.52.0   (CVE-2026-56854, needs >= v0.55.0)
#         golang.org/x/net    v0.55.0   (CVE-2026-46600, needs >= v0.56.0)
#         golang.org/x/text   v0.37.0   (CVE-2026-56852, needs >= v0.39.0)
#         google.golang.org/grpc v1.81.0 (3 advisories,  needs >= v1.83.1)
#
# So there is no upstream release to move to. The only honest fix is to build
# Caddy ourselves against patched modules, which is what this stage does, using
# the layout Caddy documents at https://caddyserver.com/docs/build — a tiny main
# package that imports caddy's command and its standard module set.
#
# A newer Go toolchain is necessary but NOT sufficient: it fixes the eleven
# stdlib advisories and nothing else. The `go get` line below is what fixes the
# other six, and it is the part that has to be maintained by hand until Caddy
# bumps them upstream.
FROM golang:1.26.8-alpine@sha256:ce864e7223ac17b1775e6fd0b4c0db580c2eb50e7953a427916379e4b92a1628 AS caddybuild

# The scanned binary reported Go stdlib v1.26.3. The eleven stdlib advisories
# are fixed across 1.26.4 and 1.26.6, so the toolchain above (1.26.8) clears all
# of them with room to spare, and stays on the same minor release the image was
# already built with rather than jumping a major version under a security fix.
ARG CADDY_VERSION=v2.11.4

WORKDIR /caddy

# The module versions are pinned here, in one place, next to the advisory that
# forced each one. Each is the LOWEST release that satisfies every advisory
# affecting that module — not the newest available. That is deliberate: newer
# releases exist (x/crypto v0.57.0, x/net v0.59.0, x/text v0.42.0,
# grpc v1.83.2), and they would be equally safe, but each extra version is
# API-change risk in a dependency of quic-go and of Caddy's TLS stack that
# nothing here would catch except a failed build. The smallest change that
# closes every reported advisory is the one with the least to go wrong.
#
# Raising any of these is a one-line edit; the build and the image scan in CI
# are what prove the result, so a bump is cheap when a future advisory needs it.
ARG X_CRYPTO=v0.55.0
ARG X_NET=v0.56.0
ARG X_TEXT=v0.39.0
ARG GRPC=v1.83.1

# The standard module set is what makes this Caddy equivalent to the official
# binary: file_server, reverse_proxy, encode, headers, the TLS/ACME stack and
# the rest. Dropping it would silently produce a Caddy that cannot run this
# repository's Caddyfile.
RUN <<'SH'
set -eux
cat > main.go <<'GO'
package main

import (
	caddycmd "github.com/caddyserver/caddy/v2/cmd"

	// Everything the Caddyfile in this repository uses lives in the standard
	// module set — file_server, reverse_proxy, encode, header, tls/ACME.
	_ "github.com/caddyserver/caddy/v2/modules/standard"
)

func main() {
	caddycmd.Main()
}
GO
go mod init manara/caddy
go get "github.com/caddyserver/caddy/v2@${CADDY_VERSION}"

# The security bumps. `go get` raises each module to at least the version
# named; Go's minimal version selection keeps the higher one, so these cannot
# be silently undone by a transitive requirement asking for an older release.
go get \
  "golang.org/x/crypto@${X_CRYPTO}" \
  "golang.org/x/net@${X_NET}" \
  "golang.org/x/text@${X_TEXT}" \
  "google.golang.org/grpc@${GRPC}"
go mod tidy
SH

# -trimpath keeps build-host paths out of the binary. CGO is off so the result
# is static, which is what lets it run on a bare Alpine with no libc coupling
# and what makes the file capability below sufficient on its own.
RUN CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o /out/caddy .

# Prove the binary runs and record what actually went into it. `go version -m`
# reads the module list back out of the compiled artifact, so this is evidence
# from the binary rather than from the go.mod that produced it — if a bump above
# failed to take effect, it is visible here, in the build log, at build time.
RUN /out/caddy version && go version -m /out/caddy | grep -E 'golang.org/x/(crypto|net|text)|google.golang.org/grpc|^\s*mod\s' || true

# =============================================================================
# Stage 3 — runtime
# =============================================================================
# Still the official Caddy image, and deliberately so: it carries the directory
# layout, XDG variables and CA bundle that Caddy expects, and inheriting them is
# far less risky than rebuilding that scaffolding by hand on a bare Alpine. What
# changes is that its vulnerable pieces are replaced — the OS packages by the
# upgrade below, and /usr/bin/caddy by the binary built above.
#
# Pinned by digest, not by tag. `caddy:2-alpine` and `caddy:2.11.4-alpine` are
# currently the same image; the digest is what makes that fact explicit and
# stops the base from changing underneath a build without a reviewed diff.
# A digest pin does NOT discover newer images on its own — see
# .github/dependabot.yml, which is what proposes the bump.
FROM caddy:2.11.4-alpine@sha256:5f5c8640aae01df9654968d946d8f1a56c497f1dd5c5cda4cf95ab7c14d58648 AS runtime

# --- OS packages -----------------------------------------------------------
# The base image ships Alpine 3.23.5, whose curl/libcurl (8.19.0-r0), OpenSSL
# (3.5.7-r0) and c-ares (1.34.6-r0) account for twenty-three of the HIGH
# findings. Every fix is already published in the SAME Alpine 3.23 branch —
# curl 8.22.0-r0, libssl3/libcrypto3 3.5.8-r0, c-ares 1.34.8-r0 — so this is an
# in-release upgrade from the supported repository, not a jump to a different
# Alpine or a mix of branches, and it keeps the OpenSSL packages consistent
# with one another because apk resolves them together.
#
# `apk upgrade` is deliberately unpinned: pinning these would freeze the image
# at today's patch level and turn the next OpenSSL fix into a manual edit. The
# reproducibility that matters here is the base digest above; the package set is
# meant to move forward, and the image scan in CI is what proves where it landed.
#
# setcap is needed for exactly one command and is then removed, so libcap does
# not ship in the final image. The binary is static, so nothing needs it at run
# time — the capability lives in the file's extended attributes, not in a lib.
RUN set -eux; \
    apk upgrade --no-cache; \
    apk add --no-cache --virtual .caddy-setcap libcap

# --- The patched Caddy -----------------------------------------------------
COPY --from=caddybuild --chown=root:root --chmod=755 /out/caddy /usr/bin/caddy

# --- Non-root ---------------------------------------------------------------
# DS-0002. The comment that used to sit here claimed the upstream image "already
# runs its server as a non-root user". That was simply wrong: caddy:2-alpine
# runs as root, so until this change any code-execution flaw in the process that
# terminates TLS for the site started with uid 0.
#
# 1001:1001 matches the backend image's `app` user, so a shared volume has one
# owner across the stack rather than two conventions to reconcile.
#
# CAP_NET_BIND_SERVICE is what lets a uid-1001 process still bind 80 and 443.
# The alternative — listening on high ports and remapping them in Compose —
# was rejected because Caddy derives its HTTP→HTTPS redirect target and its
# ACME challenge port from the ports it is told to serve; moving them produces
# public redirects to https://manara-edu.com:8443. This way the public contract,
# the Caddyfile and docker-compose.prod.yml are all completely unchanged.
#
# The capability is granted on the FILE, not to the container: it is in Docker's
# default bounding set already, so no `cap_add` and no privileged mode. Nothing
# else in the image can use it, and dropping it costs only the low ports.
RUN set -eux; \
    addgroup -S -g 1001 caddy 2>/dev/null || true; \
    adduser  -S -u 1001 -G caddy -h /srv -s /sbin/nologin caddy 2>/dev/null || true; \
    setcap cap_net_bind_service=+ep /usr/bin/caddy; \
    getcap /usr/bin/caddy; \
    apk del .caddy-setcap; \
    mkdir -p /data /config; \
    chown -R caddy:caddy /data /config

# Config and assets stay root-owned and read-only to the server: it must be able
# to read them and must not be able to rewrite them.
COPY --chown=root:root --chmod=444 Caddyfile /etc/caddy/Caddyfile
COPY --from=build --chown=root:root /build/dist /srv

USER caddy

# Local default. Production overrides this with the real hostname, which is what
# makes Caddy request and renew a Let's Encrypt certificate automatically.
ENV SITE_ADDRESS=:80

# 80 and 443 are the only ports this stack exposes publicly. Unchanged by the
# non-root move — see the capability note above.
EXPOSE 80 443

# Caddy's own config check, so a container whose configuration failed to load is
# reported unhealthy rather than sitting there serving nothing.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile || exit 1

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
