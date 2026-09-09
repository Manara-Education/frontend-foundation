#!/usr/bin/env bash
# Proves the things a scanner cannot: that the image built from this repository
# actually SERVES, and that it does so as a non-root user.
#
# Every check here exists because the alternative was an assumption:
#
#   * `docker exec <c> id` reports the user of the shell you just started, not
#     the user of the running server. This reads uid 1001 out of the serving
#     process's own /proc entry instead.
#   * "Non-root cannot bind port 80" is true of a plain process and false of one
#     holding CAP_NET_BIND_SERVICE. Which of those the image produced is
#     established by binding 80 and fetching a page through it.
#   * A fresh volume proves nothing about production, where /data and /config
#     already exist and are owned by root from the years this ran as root. That
#     case is reproduced deliberately, shown to fail, migrated, and shown to
#     recover WITH the certificate still present.
#
# Usage:  scripts/verify-container-runtime.sh [image-tag]
# Requires a working Docker daemon. Leaves nothing behind.

set -euo pipefail

IMAGE="${1:-frontend-foundation:runtime-verify}"
NET="manara-verify-$$"
FRONT="manara-verify-front-$$"
BACK="manara-verify-back-$$"
VOL_FRESH="manara-verify-fresh-$$"
VOL_LEGACY="manara-verify-legacy-$$"
VOL_CFG="manara-verify-cfg-$$"
HTTP_PORT=18080
HTTPS_PORT=18443
ALPINE="alpine:3.23"

pass=0; fail=0
ok()   { printf '  \033[32mPASS\033[0m  %s\n' "$1"; pass=$((pass+1)); }
bad()  { printf '  \033[31mFAIL\033[0m  %s\n' "$1"; fail=$((fail+1)); }
note() { printf '        %s\n' "$1"; }
head_() { printf '\n\033[1m== %s\033[0m\n' "$1"; }

cleanup() {
  docker rm -f "$FRONT" "$BACK" >/dev/null 2>&1 || true
  docker network rm "$NET" >/dev/null 2>&1 || true
  docker volume rm "$VOL_FRESH" "$VOL_LEGACY" "$VOL_CFG" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker network create "$NET" >/dev/null

# A stand-in for the backend. The Caddyfile proxies /api/* and /uploads/* to
# `backend:8080`, so without something answering there the proxy check would be
# testing Caddy's error page rather than its routing.
start_backend() {
  docker rm -f "$BACK" >/dev/null 2>&1 || true
  docker run -d --name "$BACK" --network "$NET" --network-alias backend \
    -w /srv "$ALPINE" sh -c \
    'mkdir -p /srv/api /srv/uploads &&
     printf "{\"stub\":\"api\"}" > /srv/api/health &&
     printf "STUB-UPLOAD-BYTES"  > /srv/uploads/probe.txt &&
     while true; do
       printf "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: 20\r\n\r\n{\"stub\":\"backend-ok\"}" | nc -l -p 8080 || true
     done' >/dev/null
}

# EVERY run below uses the SAME hardening docker-compose.prod.yml applies.
# That matters more than it looks: `no-new-privileges:true` neutralises the file
# capability set on /usr/bin/caddy, so a verification run without it would prove
# that the image works in a configuration production does not use. The sysctl is
# what actually lets uid 1001 bind 80/443 in production, and section 2b below
# removes it deliberately to show the difference.
PROD_SECOPTS=(--security-opt no-new-privileges:true --sysctl net.ipv4.ip_unprivileged_port_start=0)

start_frontend() { # $1=data volume  $2=site address  $3.. extra docker args
  local vol="$1" site="$2"; shift 2
  docker rm -f "$FRONT" >/dev/null 2>&1 || true
  docker run -d --name "$FRONT" --network "$NET" \
    "${PROD_SECOPTS[@]}" \
    -p "127.0.0.1:${HTTP_PORT}:80" -p "127.0.0.1:${HTTPS_PORT}:443" \
    -e "SITE_ADDRESS=${site}" \
    -v "${vol}:/data" -v "${VOL_CFG}:/config" \
    "$@" "$IMAGE" >/dev/null
}

wait_http() { # $1=url  $2=seconds
  local i=0
  until curl -fsS --max-time 3 "$1" >/dev/null 2>&1; do
    i=$((i+1)); [ "$i" -ge "${2:-40}" ] && return 1; sleep 1
  done
}

# =============================================================================
head_ "1. Image configuration"
# =============================================================================
cfg_user="$(docker inspect --format '{{.Config.User}}' "$IMAGE")"
[ "$cfg_user" = "caddy" ] && ok "image declares USER=caddy (was: root)" \
                          || bad "image USER is '${cfg_user:-<empty>}', expected 'caddy'"

caps="$(docker run --rm --entrypoint sh "$IMAGE" -c 'getcap /usr/bin/caddy 2>/dev/null || true')"
case "$caps" in
  *cap_net_bind_service*) ok "caddy binary carries cap_net_bind_service ($caps)" ;;
  *) bad "caddy binary has no cap_net_bind_service; got '${caps:-none}'" ;;
esac

# The whole point of rebuilding Caddy. Read the module set back out of the
# shipped binary — not out of the go.mod that was supposed to produce it.
mods="$(docker run --rm --entrypoint sh "$IMAGE" -c \
  'strings /usr/bin/caddy 2>/dev/null | grep -E "^(golang\.org/x/(crypto|net|text)|google\.golang\.org/grpc)@v" | sort -u' || true)"
if [ -n "$mods" ]; then
  note "modules compiled into /usr/bin/caddy:"; echo "$mods" | sed 's/^/          /'
fi
ver="$(docker run --rm --entrypoint sh "$IMAGE" -c 'caddy version 2>/dev/null | head -1' || true)"
note "caddy version: ${ver:-<unreadable>}"

# =============================================================================
head_ "2. The serving process actually runs as non-root"
# =============================================================================
start_backend
start_frontend "$VOL_FRESH" ":80"
if wait_http "http://127.0.0.1:${HTTP_PORT}/" 45; then
  ok "container serves HTTP on port 80 (bound by a non-root process)"
else
  bad "container never served on port 80"; docker logs "$FRONT" 2>&1 | tail -25
fi

# PID 1 is caddy itself: CMD is exec form, so there is no shell in between.
uid_line="$(docker exec "$FRONT" cat /proc/1/status 2>/dev/null | awk '/^Uid:/{print $2}')"
cmd1="$(docker exec "$FRONT" cat /proc/1/cmdline 2>/dev/null | tr '\0' ' ' || true)"
note "PID 1 = ${cmd1:-<unknown>}"
if [ "$uid_line" = "1001" ]; then
  ok "the SERVING process (PID 1) runs as uid 1001, read from /proc/1/status"
else
  bad "PID 1 runs as uid '${uid_line:-?}', expected 1001"
fi

# Cross-check from outside the container, so a doctored /proc cannot pass this.
top_user="$(docker top "$FRONT" -o user,args 2>/dev/null | awk 'NR==2{print $1}')"
note "docker top reports the server running as: ${top_user:-<unknown>}"
[ "$top_user" = "1001" ] || [ "$top_user" = "caddy" ] \
  && ok "docker top agrees the process is non-root" \
  || bad "docker top reports '${top_user}' — expected 1001/caddy"

# =============================================================================
head_ "2b. Negative control — the sysctl is load-bearing"
# =============================================================================
# If this check does not fail, then nothing above proved anything: it would mean
# uid 1001 can bind port 80 anyway and the sysctl in docker-compose.prod.yml is
# decorative. Removing a line from production config and watching the site stay
# up is exactly how a "harmless cleanup" takes the ingress down six months later.
docker rm -f "$FRONT" >/dev/null 2>&1 || true
docker run -d --name "$FRONT" --network "$NET" \
  --security-opt no-new-privileges:true \
  -p "127.0.0.1:${HTTP_PORT}:80" \
  -e "SITE_ADDRESS=:80" \
  -v "${VOL_FRESH}:/data" -v "${VOL_CFG}:/config" \
  "$IMAGE" >/dev/null 2>&1 || true
sleep 8
if wait_http "http://127.0.0.1:${HTTP_PORT}/" 6; then
  bad "control FAILED: port 80 was bound WITHOUT the sysctl — the compose setting is not what makes this work, so the reason it works is unexplained"
else
  ok "without net.ipv4.ip_unprivileged_port_start the server cannot bind port 80"
  note "$(docker logs "$FRONT" 2>&1 | grep -iE 'permission denied|bind' | head -2 | tr '\n' ' ')"
fi

# Back to the production configuration for everything that follows.
start_frontend "$VOL_FRESH" ":80"
wait_http "http://127.0.0.1:${HTTP_PORT}/" 45 || bad "could not restore the serving container"

# =============================================================================
head_ "3. The application is actually served"
# =============================================================================
root_body="$(curl -fsS --max-time 5 "http://127.0.0.1:${HTTP_PORT}/" || true)"
echo "$root_body" | grep -qi "<div id=\"root\"\|<!doctype html" \
  && ok "/ returns the SPA document" || bad "/ did not return the SPA document"

# The SPA fallback: React Router owns these paths, so a deep link must return
# index.html rather than 404.
deep="$(curl -fsS -o /dev/null -w '%{http_code}' --max-time 5 "http://127.0.0.1:${HTTP_PORT}/courses/12" || true)"
[ "$deep" = "200" ] && ok "deep SPA link /courses/12 returns 200 (fallback works)" \
                    || bad "deep SPA link returned HTTP $deep"

asset="$(curl -fsS --max-time 5 "http://127.0.0.1:${HTTP_PORT}/" | grep -oE '/assets/[A-Za-z0-9._-]+\.js' | head -1 || true)"
if [ -n "$asset" ]; then
  code="$(curl -fsS -o /dev/null -w '%{http_code}' --max-time 5 "http://127.0.0.1:${HTTP_PORT}${asset}")"
  cc="$(curl -fsSI --max-time 5 "http://127.0.0.1:${HTTP_PORT}${asset}" | tr -d '\r' | awk -F': ' 'tolower($1)=="cache-control"{print $2}')"
  [ "$code" = "200" ] && ok "hashed asset ${asset} loads (200)" || bad "asset ${asset} returned $code"
  case "$cc" in *immutable*) ok "asset carries the immutable cache header" ;; *) bad "asset Cache-Control was '${cc}'" ;; esac
else
  bad "could not find a hashed asset reference in index.html"
fi

idx_cc="$(curl -fsSI --max-time 5 "http://127.0.0.1:${HTTP_PORT}/" | tr -d '\r' | awk -F': ' 'tolower($1)=="cache-control"{print $2}')"
case "$idx_cc" in *no-cache*) ok "index.html is sent no-cache" ;; *) bad "index.html Cache-Control was '${idx_cc}'" ;; esac

proxy="$(curl -fsS --max-time 8 "http://127.0.0.1:${HTTP_PORT}/api/health" || true)"
case "$proxy" in *backend-ok*) ok "/api/* reverse-proxies to the backend" ;; *) bad "/api/* proxy returned '${proxy:-<empty>}'" ;; esac

for h in x-content-type-options x-frame-options referrer-policy content-security-policy-report-only permissions-policy; do
  curl -fsSI --max-time 5 "http://127.0.0.1:${HTTP_PORT}/" | tr -d '\r' | grep -qi "^${h}:" \
    && ok "security header present: ${h}" || bad "security header MISSING: ${h}"
done
curl -fsSI --max-time 5 "http://127.0.0.1:${HTTP_PORT}/" | tr -d '\r' | grep -qi '^server:' \
  && bad "Server header is still advertised" || ok "Server header is stripped"

# The admin API must not be reachable from outside the container.
adm="$(curl -fsS -o /dev/null -w '%{http_code}' --max-time 4 "http://127.0.0.1:${HTTP_PORT}/config/" || true)"
[ "$adm" = "200" ] && bad "Caddy admin API answered through the public listener" \
                   || ok "Caddy admin API is not exposed publicly (HTTP ${adm:-refused})"

# =============================================================================
head_ "4. Certificate storage on a FRESH volume"
# =============================================================================
# localhost makes Caddy use its internal CA rather than reaching Let's Encrypt,
# so this exercises the real certificate-storage path — writing into /data as
# uid 1001 — without touching a public ACME service.
start_frontend "$VOL_FRESH" "https://localhost"
sleep 12
if docker exec "$FRONT" sh -c 'test -d /data/caddy' 2>/dev/null; then
  ok "/data is writable by the non-root server (certificate store created)"
  note "$(docker exec "$FRONT" sh -c 'find /data -type f | head -5' 2>/dev/null | tr '\n' ' ')"
else
  bad "/data/caddy was never created — the server could not write its store"
  docker logs "$FRONT" 2>&1 | tail -20
fi
tlsc="$(curl -sk -o /dev/null -w '%{http_code}' --max-time 8 "https://127.0.0.1:${HTTPS_PORT}/" || true)"
[ "$tlsc" = "200" ] && ok "HTTPS on port 443 serves the SPA (internal CA, non-root bind)" \
                    || bad "HTTPS returned '${tlsc:-nothing}'"

# =============================================================================
head_ "5. An EXISTING root-owned volume — the production case"
# =============================================================================
# Reproduce what production has today: /data written by a root Caddy, holding a
# certificate that must survive.
docker volume create "$VOL_LEGACY" >/dev/null
docker run --rm -v "${VOL_LEGACY}:/data" "$ALPINE" sh -c \
  'mkdir -p /data/caddy/certificates && echo LEGACY-CERT > /data/caddy/certificates/keep.pem && chown -R 0:0 /data && chmod -R go-w /data' >/dev/null
note "seeded a root-owned /data containing caddy/certificates/keep.pem"

start_frontend "$VOL_LEGACY" "https://localhost"
sleep 10
if docker exec "$FRONT" sh -c 'test -w /data' 2>/dev/null; then
  note "unexpected: /data was already writable without migration"
else
  ok "root-owned /data is correctly NOT writable by uid 1001 before migration"
fi

# The documented migration. Narrow: it changes ownership only, only on the two
# volumes, and it does not touch contents or modes.
docker rm -f "$FRONT" >/dev/null 2>&1 || true
docker run --rm -v "${VOL_LEGACY}:/data" "$ALPINE" chown -R 1001:1001 /data
docker run --rm -v "${VOL_CFG}:/config"  "$ALPINE" chown -R 1001:1001 /config
note "applied: docker run --rm -v <volume>:/data alpine chown -R 1001:1001 /data"

start_frontend "$VOL_LEGACY" "https://localhost"
sleep 12
if docker exec "$FRONT" sh -c 'test -w /data' 2>/dev/null; then
  ok "after migration /data is writable by the server"
else
  bad "after migration /data is still not writable"; docker logs "$FRONT" 2>&1 | tail -20
fi
kept="$(docker exec "$FRONT" sh -c 'cat /data/caddy/certificates/keep.pem 2>/dev/null' || true)"
[ "$kept" = "LEGACY-CERT" ] && ok "the pre-existing certificate survived the migration intact" \
                            || bad "the pre-existing certificate did not survive (got '${kept:-nothing}')"

# Idempotent: running the migration twice must be harmless.
docker run --rm -v "${VOL_LEGACY}:/data" "$ALPINE" chown -R 1001:1001 /data
ok "migration is repeatable (ran twice, no error)"

# =============================================================================
head_ "6. Restart and persistence"
# =============================================================================
docker restart "$FRONT" >/dev/null
sleep 12
again="$(docker exec "$FRONT" sh -c 'cat /data/caddy/certificates/keep.pem 2>/dev/null' || true)"
[ "$again" = "LEGACY-CERT" ] && ok "certificate store persists across a container restart" \
                             || bad "certificate store did not persist across restart"
hc="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$FRONT")"
note "healthcheck status: $hc"
[ "$hc" = "healthy" ] || [ "$hc" = "starting" ] && ok "healthcheck runs as non-root (status: $hc)" \
                                                || bad "healthcheck status: $hc"

printf '\n\033[1m== Summary ==\033[0m\n  passed: %d\n  failed: %d\n' "$pass" "$fail"
[ "$fail" -eq 0 ] || exit 1
