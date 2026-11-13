#!/usr/bin/env python3
"""Decide whether the image about to be deployed may ship, honouring approved exceptions.

The deploy workflow's last-moment Trivy scan used `--exit-code 1`, so ANY HIGH or CRITICAL
finding refused the deployment, including one the Security Gate had already accepted through a
reviewed, unexpired entry in exceptions.yml. With a finding that has no upstream fix
(EXC-2026-001, go-jose v3 inside Caddy), that made every release undeployable, while production
kept running an older image that carried the same finding and more.

This applies the SAME exception rules as .github/security/evaluate.py, read from the RELEASED
commit's exceptions.yml and policy.yml (the files the gate assessed that commit with):

  - every required field present, `scope.finding` set;
  - `expires` parseable, not in the past, and no more than `max_duration_days` away;
  - a finding is excepted only when the advisory id, repository, component, version and path
    all match the exception's scope.

It fails closed. An exception that is invalid, expired or out of scope is not applied, so its
finding still blocks. An unreadable report blocks too. Matching is exact: component names compare
case-insensitively and nothing else is loosened.

Usage:
  deploy-scan-verdict.py --report trivy.json --exceptions exceptions.yml \
                         --policy policy.yml --repository owner/name
Exit status: 0 deploy may proceed, 1 blocking findings, 2 could not evaluate.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import sys

import yaml

BLOCKING = {"HIGH", "CRITICAL"}


def parse_date(value) -> dt.datetime | None:
    if isinstance(value, dt.datetime):
        return value if value.tzinfo else value.replace(tzinfo=dt.timezone.utc)
    if isinstance(value, dt.date):
        return dt.datetime(value.year, value.month, value.day, tzinfo=dt.timezone.utc)
    if isinstance(value, str):
        try:
            parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=dt.timezone.utc)
    return None


def valid_exceptions(exceptions: list, policy: dict, now: dt.datetime) -> list[dict]:
    cfg = policy.get("exceptions", {}) or {}
    required = set(cfg.get("require_fields", []) or [])
    max_days = int(cfg.get("max_duration_days", 90))
    valid = []
    for exc in exceptions:
        if not isinstance(exc, dict):
            print("::warning::exceptions.yml has a non-mapping entry; it is not applied.")
            continue
        name = exc.get("id", "<no id>")
        missing = required - set(exc)
        if missing:
            print(f"::warning::Exception {name} is missing {', '.join(sorted(missing))}; not applied.")
            continue
        expires = parse_date(exc.get("expires"))
        if expires is None:
            print(f"::warning::Exception {name} has an unparseable expiry; not applied.")
            continue
        if expires < now:
            print(f"::warning::Exception {name} expired on {expires.date()}; not applied.")
            continue
        if (expires - now).days > max_days:
            print(f"::warning::Exception {name} runs beyond the {max_days}-day maximum; not applied.")
            continue
        scope = exc.get("scope") or {}
        if not isinstance(scope, dict) or not scope.get("finding"):
            print(f"::warning::Exception {name} has no scope.finding; not applied.")
            continue
        valid.append(exc)
    return valid


def match(finding: dict, valid: list[dict], repository: str) -> dict | None:
    for exc in valid:
        scope = exc["scope"]
        if str(scope["finding"]) != finding["id"]:
            continue
        if scope.get("repository") and str(scope["repository"]).lower() != repository.lower():
            continue
        if scope.get("component") and str(scope["component"]).lower() != finding["component"].lower():
            continue
        if scope.get("version") and str(scope["version"]) != finding["version"]:
            continue
        if scope.get("path") and str(scope["path"]) not in finding["target"]:
            continue
        return exc
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--report", required=True)
    ap.add_argument("--exceptions", required=True)
    ap.add_argument("--policy", required=True)
    ap.add_argument("--repository", required=True)
    args = ap.parse_args()

    try:
        report = json.load(open(args.report))
        policy = yaml.safe_load(open(args.policy)) or {}
        exc_doc = yaml.safe_load(open(args.exceptions)) or {}
    except Exception as e:  # noqa: BLE001 - any unreadable input must block
        print(f"::error::Could not read the scan inputs: {e}")
        return 2
    exceptions = exc_doc.get("exceptions") or []
    if not isinstance(exceptions, list):
        print("::error::exceptions.yml `exceptions` is not a list.")
        return 2

    now = dt.datetime.now(dt.timezone.utc)
    valid = valid_exceptions(exceptions, policy, now)

    blocking, excepted = [], []
    for result in report.get("Results") or []:
        for v in result.get("Vulnerabilities") or []:
            if v.get("Severity") not in BLOCKING:
                continue
            finding = {
                "id": v.get("VulnerabilityID", ""),
                "component": v.get("PkgName", ""),
                "version": v.get("InstalledVersion", ""),
                "target": result.get("Target", ""),
                "severity": v.get("Severity"),
            }
            exc = match(finding, valid, args.repository)
            (excepted if exc else blocking).append((finding, exc))

    for f, exc in excepted:
        print(f"EXCEPTED  {f['severity']} {f['id']} in {f['component']} {f['version']} "
              f"({f['target']}) by {exc['id']}, expires {exc['expires']}")
    for f, _ in blocking:
        print(f"::error::BLOCKING {f['severity']} {f['id']} in {f['component']} {f['version']} ({f['target']})")
    print(f"Deploy scan: {len(blocking)} blocking, {len(excepted)} excepted.")
    return 1 if blocking else 0


if __name__ == "__main__":
    sys.exit(main())
