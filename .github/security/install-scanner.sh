#!/usr/bin/env bash
# Installs one pinned scanner binary onto a GitHub-hosted Linux runner.
#
# Why this is a script and not a marketplace action:
#
#   * A third-party action is a moving target that runs with the job's token.
#     Downloading a release asset and checking its digest is a smaller, more
#     auditable surface, and it is the same thing the action would do.
#   * `gitleaks-action` specifically requires an organisation licence key for
#     use outside a personal account. Installing the upstream binary sidesteps
#     that entirely and costs nothing in coverage.
#   * Every version and every digest is pinned in ONE place — here — rather than
#     repeated across five jobs where they would drift apart.
#
# WHAT THE VERIFICATION DOES AND DOES NOT PROVE.
# Two checks run on every download:
#
#   1. The asset's SHA-256 must match the entry for that exact filename in the
#      release's own published checksums file.
#   2. That entry must in turn equal the digest pinned in this file.
#
# Check 1 alone would be near-worthless: a release that could be replaced could
# have its checksums file replaced with it. Check 2 is the one with teeth — the
# digest below was recorded out of band and committed here, so a re-uploaded or
# substituted asset fails even if its checksums file agrees with it.
#
# What neither check proves is that the pinned build was itself honest at the
# time it was recorded. That is trust-on-first-use, it is stated here rather
# than glossed over, and it is bounded by the fact that bumping any of these
# digests is a reviewed change to a CODEOWNERS-owned file.
#
# Usage:  install-scanner.sh <trivy|osv-scanner|gitleaks>
# Installs into /usr/local/bin and verifies the binary answers afterwards.

set -euo pipefail

# --- Pins --------------------------------------------------------------------
# Versions match .github/security/sources.yml and the recorded discovery.
# Digests are for the linux/amd64 asset, which is what ubuntu-latest runs.
TRIVY_VERSION='0.74.0'
TRIVY_ASSET="trivy_${TRIVY_VERSION}_Linux-64bit.tar.gz"
TRIVY_SHA256='2ae6fe3ee734b7fdf11335663e18c75ea12dccc76062f09f164a3b0f8be4371a'
TRIVY_SUMS="trivy_${TRIVY_VERSION}_checksums.txt"

OSV_SCANNER_VERSION='2.5.1'
OSV_SCANNER_ASSET='osv-scanner_linux_amd64'
OSV_SCANNER_SHA256='f9f25499a2c8cc367b3af45df2ea7eeca7fbccceab9c35079968f4b3652194be'
OSV_SCANNER_SUMS='osv-scanner_SHA256SUMS'

GITLEAKS_VERSION='8.30.1'
GITLEAKS_ASSET="gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz"
GITLEAKS_SHA256='551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb'
GITLEAKS_SUMS="gitleaks_${GITLEAKS_VERSION}_checksums.txt"

tool="${1:?usage: install-scanner.sh <trivy|osv-scanner|gitleaks>}"
workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

case "$tool" in
  trivy)
    base="https://github.com/aquasecurity/trivy/releases/download/v${TRIVY_VERSION}"
    asset="$TRIVY_ASSET"; sums="$TRIVY_SUMS"; want="$TRIVY_SHA256"; archive=tar
    ;;
  osv-scanner)
    base="https://github.com/google/osv-scanner/releases/download/v${OSV_SCANNER_VERSION}"
    asset="$OSV_SCANNER_ASSET"; sums="$OSV_SCANNER_SUMS"; want="$OSV_SCANNER_SHA256"; archive=raw
    ;;
  gitleaks)
    base="https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}"
    asset="$GITLEAKS_ASSET"; sums="$GITLEAKS_SUMS"; want="$GITLEAKS_SHA256"; archive=tar
    ;;
  *)
    echo "::error::Unknown scanner '$tool'." >&2
    exit 2
    ;;
esac

echo "Installing $tool from $base/$asset"

# --retry covers a flaky runner network. It does NOT cover a wrong file: that is
# what the digest below is for, and a retry never turns a bad digest into a good
# one.
#
# --retry-all-errors is load-bearing, not decoration. On its own, --retry only
# covers timeouts and a specific set of 5xx responses; a connection reset
# mid-transfer exits 35 immediately and is NOT retried. That is exactly how this
# step failed on its first real run — `curl: (35) Recv failure: Connection reset
# by peer` — turning one dropped TCP connection into a failed security
# assessment for the whole pull request.
curl --fail --silent --show-error --location \
     --retry 3 --retry-delay 5 --retry-all-errors \
     --max-time 300 -o "$workdir/$asset" "$base/$asset"
curl --fail --silent --show-error --location \
     --retry 3 --retry-delay 5 --retry-all-errors \
     --max-time 60  -o "$workdir/$sums"  "$base/$sums"

# Check 1 — the release's own checksums file must vouch for this exact filename.
# `sha256sum --check --ignore-missing` verifies only the lines whose filename we
# actually downloaded, and `--strict` makes a malformed checksums file an error
# rather than something quietly skipped.
( cd "$workdir" && sha256sum --check --ignore-missing --strict "$sums" ) \
  || { echo "::error::$asset does not match the digest published in $sums."; exit 1; }

# Check 2 — and that digest must equal the one pinned in this file. This is the
# check that survives an upstream asset being replaced.
got="$(sha256sum "$workdir/$asset" | cut -d' ' -f1)"
if [ "$got" != "$want" ]; then
  echo "::error::$asset SHA-256 is $got but this repository pins $want."
  echo "::error::Refusing to install. If the upstream release legitimately changed,"
  echo "::error::update the pin in .github/security/install-scanner.sh in a reviewed PR."
  exit 1
fi
echo "  digest verified: $got"

if [ "$archive" = tar ]; then
  tar -xzf "$workdir/$asset" -C "$workdir" "$tool"
  sudo install -m 0755 "$workdir/$tool" "/usr/local/bin/$tool"
else
  sudo install -m 0755 "$workdir/$asset" "/usr/local/bin/$tool"
fi

# A binary that installed but cannot run is a scanner that would silently do
# nothing, so prove it answers before any job depends on it.
case "$tool" in
  gitleaks) "$tool" version ;;
  *)        "$tool" --version ;;
esac
