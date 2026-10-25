# Production container verification — 2026-10-24

Scope: package the unchanged static application and add release-tag GHCR
automation. No application/runtime dependency, gameplay, save format, release tag,
registry image or running production deployment was changed.

## Environment and pins

- macOS 26.6.2 ARM64; Docker Engine 29.1.3 (Linux ARM64 through Rancher Desktop),
  Buildx 0.34.1, Compose 5.1.4.
- Node 24.22.1 selected from a temporary toolchain without changing system
  defaults. Clean installation used npm 12.2.1 with lifecycle scripts disabled.
  Local `npm run` wrappers for the functional suites resolved to Node's bundled
  npm 11.19.1; their actual Node/Playwright runtimes stayed pinned. Final audit and
  formatting use explicitly selected npm 12.2.1. Hosted workflows select 12.2.1
  for every job; that hosted execution remains separate acceptance evidence.
- Playwright 1.64.1 and its installed Chromium/Firefox/WebKit engines. Container
  journeys use host Chromium against actual Linux containers, including emulated
  AMD64; this is automated browser evidence, not physical-device acceptance.
- Docker Hub's nginx 1.30.6 Alpine index was inspected live:
  `sha256:47928bf67eb62a1863cb08d9ecb52d3e704304ba614eaee17884204677702951`.
  AMD64 manifest:
  `sha256:84ed8c0dd296c188bfc24ed506f46589e9285fb0b11cf3a04d91d524d3067e11`;
  ARM64/v8 manifest:
  `sha256:4f7cab9e1cd018f80e67f31e02dc0c6d18560b19504461c4f3dd37e5c63a74c5`.
- Action commit pins were checked against GitHub tag refs for checkout/setup-node/
  upload-artifact v4, setup-qemu v4.4.0, setup-buildx v4.3.0,
  build-push v7.3.0 and login v4.6.0.

## Red–green–refactor evidence

1. Added 25 HTTP contract tests before nginx configuration. Started stock pinned
   nginx on loopback port 18089, mounting only `index.html`, `assets/` and `LICENSE`
   into its default document root. Ran:
   `CONTAINER_BASE_URL=http://127.0.0.1:18089 node --test tests/container/http.test.mjs`.
   All 25 failed on observable serving contracts: missing `no-cache`/`nosniff`,
   `.mjs` delivered as `application/octet-stream`, directory 403s instead of the
   required 404s, and absent negotiated text compression. The fixture was removed.
2. Added 14 CLI release-guard tests against a permissive script that emitted the
   package version. `node --test tests/unit/release-tag.test.mjs` passed the valid
   version case and failed 13 rejection cases. Implemented strict stable tag and
   package-version checks; all 14 passed. Missing tags, `v` prefixes, leading
   zeroes, short/extra components, prerelease/build suffixes, newline/shell-like
   input and mismatched versions are covered without a shell evaluating input.
3. Added immutable nginx configuration, the allowlisted Docker build context and
   hardened Compose definition. Refactored HTTP requests to drain response bodies
   before assertions with bounded timeouts, so failed cases release connections.
   Both architecture suites pass the unchanged serving contracts.
4. The dedicated browser smoke harness initially failed because its frozen clock
   had not advanced the existing loading delay and its proposed name exceeded
   the existing 15-character limit. Corrected the harness to wait for boot and
   explicitly advance loaders, then use a valid name; no app code changed. The
   passing journey creates a real character, allocates stats, enters gameplay,
   imports the shipped save module over HTTP, compares stored/restored state,
   and resumes after reload without a second allocation. Each failed and passing
   production smoke run removed its Compose container and isolated network.

## Executed checks

| Check                                                                                                                                                                        | Result                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `docker buildx build --platform linux/arm64 --load -t malevolent-crawler:smoke-arm64 .`                                                                                      | PASS                                                                                                |
| `bash scripts/smoke-container.sh malevolent-crawler:smoke-arm64 linux/arm64`                                                                                                 | PASS: 27 HTTP/runtime checks and 1 Chromium journey                                                 |
| `docker buildx build --platform linux/amd64 --load -t malevolent-crawler:smoke-amd64 .`                                                                                      | PASS                                                                                                |
| `bash scripts/smoke-container.sh malevolent-crawler:smoke-amd64 linux/amd64`                                                                                                 | PASS: 27 HTTP/runtime checks and 1 Chromium journey under emulation                                 |
| `docker compose --file deploy/compose.production.yml config --quiet`                                                                                                         | PASS: default config; test overrides also validated during both smoke runs                          |
| `bash -n scripts/smoke-container.sh`                                                                                                                                         | PASS                                                                                                |
| `go run github.com/rhysd/actionlint/cmd/actionlint@v1.7.12 -shellcheck= .github/workflows/validate.yml .github/workflows/publish.yml .github/workflows/release-evidence.yml` | PASS: workflow syntax/expressions; ShellCheck was not run                                           |
| `npm run test:unit`                                                                                                                                                          | PASS: 2,425 tests, including the 14 release-guard cases                                             |
| `npm run test:integration`                                                                                                                                                   | PASS on single-worker full-suite rerun: 291 tests; initial parallel run had 2 audio decode timeouts |
| `npm run test:browser -- --workers=1`                                                                                                                                        | PASS: 503 tests; 1 existing Firefox touch-emulation skip                                            |
| `npm run lint`                                                                                                                                                               | PASS                                                                                                |
| `npm run format:check`                                                                                                                                                       | PASS                                                                                                |
| `npm audit --audit-level=high`                                                                                                                                               | PASS: 0 vulnerabilities                                                                             |
| `git diff --check`                                                                                                                                                           | PASS                                                                                                |

The documented `npm run test:container -- malevolent-crawler:smoke-arm64 linux/arm64`
command was also verified with npm 12.2.1: all 27 HTTP/runtime checks and the
Chromium journey passed, and its temporary resources were removed.

The integration rerun command was
`npm run test:integration -- tests/integration/howler-playback.spec.mjs --workers=1`.
Playwright combines file filters, so this repeated the entire integration suite
(291 tests) at CI's single-worker setting. Both audio cases passed unchanged;
no production code, assertions or timeouts were adjusted. The initial failures
remain recorded in `ci-reports/container/integration.txt`; the clean rerun is in
`ci-reports/container/integration-single-worker.txt`.

The runtime checks inspect Docker's effective UID/GID, healthy state, read-only
root, all-capability drop, no-new-privileges, restart policy, tmpfs flags/size,
PID/log limits, loopback port, external network and lack of persistent/bind
mounts. `nginx -t` succeeds inside each hardened container. The complete document
root matches the source public-file allowlist. HTTP tests compare representative
HTML/JS/MJS/CSS/PNG/license bytes, exercise HEAD/304 revalidation, compression,
security headers, missing resources, directory paths, and excluded repository/
configuration URLs. Docker image inspection confirms both Linux architectures.

Raw local outputs are in ignored `ci-reports/container/`, including red/green
results, image builds, smoke logs, toolchain installation, the base index,
resolved Compose config, image inspection, six checks and actionlint. Hosted
verification retains container logs and failed-browser artifacts for 14 days.
Final Docker inspection found no remaining `mc-smoke-*` containers or networks;
the two built local images remain available for inspection.

## Review and acceptance boundaries

Self-review: the new helpers, callbacks and shell functions carry purpose comments;
all serving/tag tests preceded implementation; no dependency or save contract was
changed. The image copies no repository fixtures, package metadata or deployment
configuration into its document root. The six validation definitions are reused
from the same tagged commit. Original validation triggers and the manual-only
historical evidence workflow are preserved. Only the gated publication job gets
package-write permission and GHCR login; no PR job receives publication credentials.

Local tests and workflow syntax validation do not establish successful hosted
Actions, GHCR authentication/package permissions, actual multi-platform registry
publication, public proxy/TLS routing, native/mobile play, performance acceptance
or historical release qualification. Those remain unperformed. No tag was pushed,
image published, commit created or production service changed. The workflow's
first successful release will supply the published digest for deployment/rollback.
