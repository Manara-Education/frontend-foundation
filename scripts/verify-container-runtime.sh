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

# EVERY run below uses the SAME hardening docker-compose.prod.yml applies, so
# what passes here is the configuration production actually runs, not a laxer
# one that happens to work.
#
# These two lines used to carry a claim that section 2b then disproved: that
# `no-new-privileges:true` neutralises the file capability on /usr/bin/caddy,
# leaving the sysctl as the thing that grants 80/443. It is the other way round
# — the capability is the mechanism and survives no_new_privs here, and Docker's
# own default floor of 0 is a second, independent path to the same result. The
# sysctl is belt and braces. Section 2b is where that is established rather than
# asserted.
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
#
# Plain `docker top` with no ps flags on purpose: `-o user,args` is passed
# through to the container's ps, and busybox rejects it — which killed this
# script outright the first time, under `set -e`, after the real check above had
# already passed. The first column of the default output is the user.
top_user="$(docker top "$FRONT" 2>/dev/null | awk 'NR==2{print $1}' || true)"
if [ -z "$top_user" ]; then
  # Not a pass and not a failure: the authoritative check is /proc/1/status
  # above, and this one is corroboration. Silence about it would be the only
  # wrong answer.
  note "docker top could not report a user; relying on /proc/1/status above"
elif [ "$top_user" = "root" ] || [ "$top_user" = "0" ]; then
  bad "docker top reports the server running as root"
else
  # The assertion is "not root", not "literally 1001". docker top resolves the
  # container's uid against the HOST's passwd, so on a GitHub runner — where
  # uid 1001 is the `runner` account — it prints "runner". That looked like a
  # failure the first time and was in fact confirmation: a name resolved from
  # the host is still uid 1001 inside the container, which /proc/1/status above
  # has already established exactly.
  ok "docker top agrees the process is not root (host name for its uid: ${top_user})"
fi

# =============================================================================
head_ "2b. Negative control — what actually grants the low port"
# =============================================================================
# This control has been wrong twice, and each wrong version taught something.
#
#   v1 removed the compose sysctl and expected the bind to fail. It did not.
#   v2 raised the privileged-port floor to 1024 and expected the bind to fail.
#      It did not either.
#
# Between them they rule out both of the explanations offered so far. The floor
# is not what grants the port, and Docker's default floor of 0 is not the only
# reason it works — because v2 removed that default and the server still bound
# 80. What is left is the FILE CAPABILITY on /usr/bin/caddy, which means
# cap_net_bind_service survives this stack's `no-new-privileges:true` rather
# than being neutralised by it, contrary to what the Dockerfile and the compose
# file originally claimed.
#
# So the control now isolates that directly: raise the floor AND drop the
# capability from the container's bounding set. If the bind still succeeds,
# nothing in the image or the compose file explains the privilege and the claim
# should be treated as unproven.
docker rm -f "$FRONT" >/dev/null 2>&1 || true
docker run -d --name "$FRONT" --network "$NET" \
  --security-opt no-new-privileges:true \
  --sysctl net.ipv4.ip_unprivileged_port_start=1024 \
  --cap-drop NET_BIND_SERVICE \
  -p "127.0.0.1:${HTTP_PORT}:80" \
  -e "SITE_ADDRESS=:80" \
  -v "${VOL_FRESH}:/data" -v "${VOL_CFG}:/config" \
  "$IMAGE" >/dev/null 2>&1 || true
sleep 8
if wait_http "http://127.0.0.1:${HTTP_PORT}/" 6; then
  bad "control FAILED: uid 1001 bound port 80 with the floor at 1024 AND cap_net_bind_service dropped — nothing in this image explains the privilege"
else
  ok "with the capability dropped and the floor at 1024, the non-root server cannot bind 80"
  note "$(docker logs "$FRONT" 2>&1 | grep -iE 'permission denied|bind|cap' | head -1 | cut -c1-140)"
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

for h in x-content-type-options x-frame-options referrer-policy content-security-policy permissions-policy; do
  curl -fsSI --max-time 5 "http://127.0.0.1:${HTTP_PORT}/" | tr -d '\r' | grep -qi "^${h}:" \
    && ok "security header present: ${h}" || bad "security header MISSING: ${h}"
done

# The CSP is present above; what makes it worth anything is that it ENFORCES and
# that script-src stays exactly 'self'. A report-only header blocks nothing, and
# 'unsafe-inline'/'unsafe-eval' or a host on script-src would let an injected
# script run.
csp="$(curl -fsSI --max-time 5 "http://127.0.0.1:${HTTP_PORT}/" | tr -d '\r' | awk -F': ' 'tolower($1)=="content-security-policy"{print $2}')"
script_src="$(printf '%s' "$csp" | tr ';' '\n' | sed 's/^ *//; s/ *$//' | awk '$1=="script-src"')"
[ "$script_src" = "script-src 'self'" ] \
  && ok "CSP is enforced and script-src is 'self' only" || bad "CSP script-src was '${script_src:-<missing>}'"
curl -fsSI --max-time 5 "http://127.0.0.1:${HTTP_PORT}/" | tr -d '\r' | grep -qi '^content-security-policy-report-only:' \
  && bad "a report-only CSP is still being sent" || ok "no report-only CSP alongside the enforced one"
curl -fsSI --max-time 5 "http://127.0.0.1:${HTTP_PORT}/" | tr -d '\r' | grep -qi '^server:' \
  && bad "Server header is still advertised" || ok "Server header is stripped"

# The admin API must not be reachable from outside the container.
#
# Asking for /config/ and treating HTTP 200 as exposure is wrong, and this test
# did exactly that at first: the Caddyfile's `try_files {path} /index.html`
# answers ANY unmatched path with the SPA document and a 200, so the check was
# reporting the single-page-app fallback as a leaked admin API.
#
# What actually distinguishes them is the body. The admin API returns JSON
# describing the running config; the fallback returns the HTML shell. And the
# admin listener is a separate port — 2019 — which must not be published at all.
adm_body="$(curl -fsS --max-time 4 "http://127.0.0.1:${HTTP_PORT}/config/" 2>/dev/null || true)"
case "$adm_body" in
  *'"apps"'*|*'"admin"'*|*'"listen"'*)
    bad "the Caddy admin API answered through the public listener" ;;
  *)
    ok "the public listener does not serve the admin API (/config/ falls through to the SPA)" ;;
esac
if docker port "$FRONT" 2>/dev/null | grep -q '^2019/'; then
  bad "the admin port 2019 is published to the host"
else
  ok "the admin port 2019 is not published"
fi

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
# Waited for rather than slept at. Provisioning the internal CA and issuing a
# certificate takes a variable amount of time, and a fixed sleep reported
# HTTP 000 — a connection that was refused because the TLS listener was not up
# yet — on a run whose certificate had in fact been issued correctly.
#
# THE HOSTNAME IS LOAD-BEARING, and getting it wrong cost a red run.
# `curl https://127.0.0.1:PORT` sends no SNI, because SNI is not sent for an IP
# literal. Caddy is serving the site `localhost` and therefore holds exactly one
# certificate, for `localhost`; asked for a certificate with no server name it
# has nothing to answer with and aborts the handshake. `-k` does not help — it
# skips verification of a certificate that was received, and none is. The probe
# then failed 30 times in a row against a server that was working perfectly and
# had already logged "certificate obtained successfully".
#
# --resolve keeps the connection on the published loopback port while making the
# request — and the SNI — say `localhost`, which is the name the certificate is
# actually for.
#
# `|| echo 000` on the same substitution as curl's own -w output appended a
# second code to the first: a failed probe reported '000000', which reads like a
# mangled status rather than a refused connection. Replacing it with `|| tlsc=""`
# then went too far the other way and DISCARDED the 000 curl had written,
# reporting "no response" for every kind of failure. Both are kept apart now:
# curl's write-out is whatever curl wrote, and its exit status is recorded
# beside it, because 35 (TLS handshake) and 7 (refused) are different faults.
tlsc=""; tlsrc=0
for _ in $(seq 1 30); do
  tlsc="$(curl -sk --resolve "localhost:${HTTPS_PORT}:127.0.0.1" \
               -o /dev/null -w '%{http_code}' --max-time 4 \
               "https://localhost:${HTTPS_PORT}/" 2>/dev/null)"; tlsrc=$?
  [ "$tlsc" = "200" ] && break
  sleep 2
done
if [ "$tlsc" = "200" ]; then
  ok "HTTPS on port 443 serves the SPA (internal CA, bound by a non-root process)"
else
  bad "HTTPS returned '${tlsc:-no output}' (curl exit $tlsrc)"
  # Enough to tell a refused mapping from a server that never bound 443. The
  # first failure of this check reported nothing but the code, and the Caddy log
  # showed both servers running and the certificate issued — so the code alone
  # could not distinguish "not published" from "not listening".
  note "container state: $(docker inspect --format '{{.State.Status}}' "$FRONT" 2>/dev/null || echo unknown)"
  note "published ports: $(docker port "$FRONT" 2>/dev/null | tr '\n' ' ' || echo none)"
  # NOT truncated. The previous version piped this through `cut -c1-200`, which
  # cut the output off after the first listening socket — the one line that
  # would have answered "did it bind 443?" was the line that got dropped.
  note "listening inside:"
  docker exec "$FRONT" sh -c 'netstat -ltn 2>/dev/null || ss -ltn 2>/dev/null' 2>/dev/null \
    | sed 's/^/          /'
  # The handshake itself, in words, for the case where the socket is up and the
  # TLS layer is what refuses.
  note "handshake:"
  curl -sv -k --resolve "localhost:${HTTPS_PORT}:127.0.0.1" --max-time 5 \
       -o /dev/null "https://localhost:${HTTPS_PORT}/" 2>&1 \
    | grep -iE 'ssl|tls|alert|handshake|connect' | head -8 | sed 's/^/          /'
  docker logs "$FRONT" 2>&1 | tail -12
fi

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
# Written as if/elif rather than `[ a ] || [ b ] && ok || bad`, which does not
# mean what it reads like: && binds to the whole || chain, so the `bad` branch
# fires on a passing case too.
if [ "$hc" = "healthy" ] || [ "$hc" = "starting" ]; then
  ok "healthcheck runs as the non-root user (status: $hc)"
else
  bad "healthcheck status is '$hc' — the check cannot run as uid 1001"
fi

printf '\n\033[1m== Summary ==\033[0m\n  passed: %d\n  failed: %d\n' "$pass" "$fail"
[ "$fail" -eq 0 ] || exit 1
