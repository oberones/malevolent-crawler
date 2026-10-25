# Malevolent Gods: The Drowned Labyrinth

Descend beneath Veyr Quay into the Drowned Observatory. As a relic seeker, chart impossible chambers, face listening presences, and recover relics that outlast each descent. This original coastal cosmic-horror setting preserves the crawler’s existing combat, loot, and progression rules.
<br><br><a href='https://ko-fi.com/W7W4I2XU6' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi3.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/donate/?hosted_button_id=8F4LBS6QB4PVC)

## Gameplay Mechanics

- Roguelite gameplay where the progress is reset when the player dies, but equipment is carried over.
- Explore randomized chambers and pass Threshold Keepers to reach deeper descents.
- Each Attunement increase offers three stat choices and two rerolls.
- Equip up to six recovered relics.
- There are 6 equipment rarities which are Common, Uncommon, Rare, Epic, Legendary, and Heirloom.

## In-game Stats

- HP (Hit Points) - The amount of damage a unit can take before dying.
- ATK (Attack) - The amount of damage dealt when a unit attacks.
- DEF (Defense) - The amount of damage reduction against attacks.
- ATK.SPD (Attack Speed) - How quickly a unit can perform attacks per second.
- VAMP (Vampirism) - Heals for a percentage of the damage dealt.
- C.RATE (Crit Rate) - Chance to land a critical hit.
- C.DMG (Crit Damage) - Amount of bonus damage dealt upon landing a critical hit.

## Development

The [project constitution](.specify/memory/constitution.md) defines the development
rules: test-driven development, modular JavaScript, clear function comments, safe
data handling, accessible browser behavior, and reproducible validation.

For every new or changed behavior, write and run a failing test, implement the
smallest passing change, then refactor with tests green. Document each new or
modified function with a concise purpose comment, using JSDoc for public interfaces
and non-obvious contracts. Update comments whenever the corresponding code changes.

The app remains static HTML/CSS/JavaScript, with native ES modules for new code.
Use the active [implementation plan](specs/001-cosmic-horror-refactor/plan.md) and
[quickstart](specs/001-cosmic-horror-refactor/quickstart.md).

### Setup

Use Node **24.22.1** and npm **12.2.1**. With nvm:

```sh
nvm install
nvm use
# Only if this selected nvm version has a different npm:
npm install --global npm@12.2.1 --ignore-scripts
node --version
npm --version
npm ci
npx playwright install chromium firefox webkit
npm run dev
```

Open `http://127.0.0.1:4173`. Serve `.mjs` as JavaScript over HTTP(S); opening
`index.html` through `file://` is unsupported for module loading. The dev server
binds only to loopback. There is no production build: **build N/A**.
The project disables dependency lifecycle scripts. Install the matching Playwright
engines explicitly as shown above. Sharp was retired with the one-time art tooling
and is no longer an installed dependency. Do not change the default nvm alias or
system Node to select this project runtime.

### Makefile shortcuts

GNU Make 3.81 or newer (including macOS's bundled `make`) provides shortcuts for
the same npm workflows. Select the pinned Node/npm runtime above first, then run
these commands from the repository root:

```sh
make                      # Show every target and option
make setup                # npm ci, then install all three Playwright engines
make dev                  # Serve the game on port 4173
make check                # Lint, format check, unit, integration, browser, audit
make test                 # All functional test suites
make test-browser ARGS='--project=chromium --grep "saved encounter"'
make browsers BROWSERS=chromium
make report               # Open the latest Playwright report
```

`make ci` aliases `make check`; dependency/browser installation is separate.
Checks stop on the first failure and run sequentially even with `make -j`, because
the browser suites share a server port and report paths. Stop `make dev` before
running functional browser checks. `ARGS` forwards shell arguments to individual
integration, browser, performance, lint and formatting targets; leave it unset for
a complete `make check`. `NPM` and `NPX` can select alternate executable paths.

Use `make lint-fix` or `make format` to apply automatic edits. `make clean` removes
only transient `test-results/`, `playwright-report/` and `coverage/`; it preserves
dependencies, `.cache/`, `ci-reports/`, assets and recorded validation evidence.
`make browsers-with-deps` also installs OS dependencies and may request elevated
privileges on Linux. `make build` reports why this static app needs no build step.

Optional `make validate-evidence` and `make test-performance` remain outside
`make check`. Performance measurements require the prepared-root procedure in the
[quickstart](specs/001-cosmic-horror-refactor/quickstart.md), including `PERF_STAGE`,
`BASE_URL` and, for a candidate, `PERF_REVISION`. `make serve-performance` serves
the current checkout with caching; it does not prepare the immutable fixture
required by the measurement harness. Use the quickstart's explicit prepared-root
server command for measurements. Existing performance reports remain immutable.

### Checks and current limits

```sh
npm run test:unit
npm run test:integration
npm run test:browser
npm run lint
npm run format:check
npm audit --audit-level=high
```

PR CI runs these six checks to detect code regressions and dependency issues.
The [dependency refresh record](validation/dependency-update-2026-10-24.md)
documents the current pins, package review and local verification results.
Accepted artwork and refactor qualification are not repeatedly approved by CI.
The optional **Release evidence (manual)** workflow, or `npm run validate:evidence`
locally, checks historical qualification records on demand and is not a PR gate.

All five story implementations are integrated: narrative, encounters, relics,
art recovery and saved-player continuation/exchange. All 80 generated art
outputs are delivered and [maintainer-approved](validation/cosmic-horror/art-approval-2026-10-07-complete.md).
[Phase 8 qualification](validation/cosmic-horror/release.md) records the current
candidate checks and outstanding release gates. Automated success does not
certify native browsers, physical devices, manual accessibility or release acceptance.

Local continuation restores a validated saved encounter without rerolling rewards.
Character export uses Unicode-capable `MC1:` text; importing an old or new character
requires confirmation and resets its run while retaining character holdings.
Recovery preserves original source bytes and supports explicitly unsaved sessions.
Keep one active gameplay tab; a conflicting save suspends writes and offers reload
or export. A recovery JSON download is an archive, not a character import format.

The one-time legacy art comparison and generation tooling has been retired.
Current assets remain covered by browser loading, layout and missing-image recovery
checks. See the [review cleanup record](validation/cosmic-horror/review-cleanup.md)
for retained provenance and the non-art qualification scope.

For performance, follow the prepared-root procedure in the
[quickstart](specs/001-cosmic-horror-refactor/quickstart.md). The comparison uses
five or more samples per matched workload and verifies warm caching. The
[manual workbook](validation/cosmic-horror/manual.md),
[environment](validation/cosmic-horror/environment.json) and
[CI record](validation/cosmic-horror/ci.md) retain separate qualification status.

## Production container and GHCR

The image serves the existing static app at `/` using nginx 1.30.6 Alpine, pinned
to a verified multi-platform digest. It contains `index.html`, `assets/` (including
distributed notices), `LICENSE`, and nginx configuration. There is no Node runtime
or application build step. nginx runs as `101:101` on port `8080`, logs to
stdout/stderr, and checks `/index.html` for health. HTML and unhashed assets use
`Cache-Control: no-cache`; `.mjs` has an explicit JavaScript MIME type. Unknown
paths and missing assets return 404; directory listing is disabled.

### Build and verify locally

Use the pinned Node/npm versions above, Docker with Compose v2 or newer, Buildx,
and Chromium installed by `npx playwright install chromium`. Docker must support
running both target architectures (Docker Desktop/Rancher Desktop emulation, or
QEMU/binfmt configured on a Linux host).

```sh
docker buildx build --platform linux/arm64 --load -t malevolent-crawler:smoke-arm64 .
npm run test:container -- malevolent-crawler:smoke-arm64 linux/arm64
docker buildx build --platform linux/amd64 --load -t malevolent-crawler:smoke-amd64 .
npm run test:container -- malevolent-crawler:smoke-amd64 linux/amd64
docker compose --file deploy/compose.production.yml config --quiet
```

Each smoke run creates an isolated external test network and starts the actual
production Compose file with a local image override and an ephemeral loopback
port. It checks architecture, health, effective hardening, nginx configuration,
public file inventory, HTTP responses, compression, and a Chromium character
creation/gameplay/save/reload journey. Only shipped modules are used; repository
fixtures are excluded. The script removes its containers and network even on
failure. Built images remain available for inspection. Browser traces on failure
are under `test-results/container/`. The regular browser suites remain separate.

### Start behind the existing reverse proxy

The default image is `ghcr.io/oberones/malevolent-crawler:latest`. After the first
successful release publication, on the deployment host:

```sh
# The existing proxy and app must share this external network.
docker network inspect web-backend
# Only if provisioning a new host: docker network create web-backend

# For private packages, authenticate with a token allowed to read this package
# (read:packages for a classic PAT); enter it at the password prompt.
docker login ghcr.io --username YOUR_GITHUB_USERNAME

docker compose --file deploy/compose.production.yml pull
docker compose --file deploy/compose.production.yml up -d --wait
```

Public images do not require registry login. See GitHub's
[GHCR authentication guide](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#authenticating-to-the-container-registry)
for private-package token scopes and repository access. Ensure the repository's Actions token
has permission to publish this GHCR package; an existing package may need its
repository access configured. Publication does not change package visibility.

| Variable                     | Default                                      | Purpose                                         |
| ---------------------------- | -------------------------------------------- | ----------------------------------------------- |
| `MALEVOLENT_CRAWLER_IMAGE`   | `ghcr.io/oberones/malevolent-crawler:latest` | Version tag, full SHA tag, or immutable digest  |
| `MALEVOLENT_CRAWLER_PORT`    | `8089`                                       | Host loopback port mapped to container `8080`   |
| `MALEVOLENT_CRAWLER_NETWORK` | `web-backend`                                | Existing external network shared with the proxy |

Set overrides in the shell environment or pass an explicit `--env-file` to every
Compose command. Docker selects the host architecture; production Compose does
not force a platform. It applies a read-only root filesystem, dropped capabilities,
no-new-privileges, a bounded 16 MiB `/tmp` tmpfs, a 64-PID limit, restart unless
stopped, and rotated logs (three files of up to 10 MiB).

A proxy on `web-backend` routes to `http://malevolent-crawler:8080`. A proxy on
the host can instead use `http://127.0.0.1:8089`. TLS stays with that proxy. For
example, in its existing nginx TLS server, root hosting uses:

```nginx
location / {
    proxy_pass http://malevolent-crawler:8080;
}
```

For a URL prefix such as `/games/crawler/`, redirect the bare prefix to its
trailing-slash form and strip the prefix before forwarding. The trailing slash
on `proxy_pass` below performs that replacement; relative app assets then resolve
under the public prefix:

```nginx
location = /games/crawler {
    return 308 /games/crawler/;
}
location /games/crawler/ {
    proxy_pass http://malevolent-crawler:8080/;
}
```

Do not configure a proxy HTML fallback for missing assets. After changing the
proxy, validate its configuration, reload it, and check `/index.html` and
`/assets/js/app/services.mjs` at the actual public URL (including any prefix).
The module must return a JavaScript MIME type, and a nonexistent module must
return 404. Container health alone does not verify proxy routing or TLS.

Saves stay in browser localStorage. No server persistence volume is needed.
Preserve the public scheme, hostname and port when possible: changing origin
makes existing browser saves inaccessible from the new origin. A path-only move
on the same origin shares storage. Export characters before an origin migration;
character export does not preserve the active dungeon run. Keep one gameplay tab
active when the same origin hosts multiple paths.

### Upgrade, inspect, and roll back

```sh
docker compose --file deploy/compose.production.yml ps
docker compose --file deploy/compose.production.yml logs --tail=100
docker compose --file deploy/compose.production.yml exec malevolent-crawler nginx -t
curl -I http://127.0.0.1:8089/assets/js/app/services.mjs

# Pin a release before pulling; retain the prior digest for rollback.
export MALEVOLENT_CRAWLER_IMAGE=ghcr.io/oberones/malevolent-crawler:X.Y.Z
docker compose --file deploy/compose.production.yml pull
docker compose --file deploy/compose.production.yml up -d --wait

# Roll back using the actual immutable reference from a prior publication summary.
export MALEVOLENT_CRAWLER_IMAGE=ghcr.io/oberones/malevolent-crawler@sha256:REPLACE_WITH_PREVIOUS_DIGEST
docker compose --file deploy/compose.production.yml pull
docker compose --file deploy/compose.production.yml up -d --wait
```

The version and digest above are placeholders. Rolling back an image does not
restore browser saves; assess save compatibility before rolling back future
application changes.

### Release automation

[`publish.yml`](.github/workflows/publish.yml) verifies containers for every PR,
main push, and tag push. Only a stable `X.Y.Z` tag exactly matching `package.json`
may publish; prefixes, prereleases, build metadata, leading zeroes, and mismatches
fail. This matches Commitizen's `$version` tag format. Tags run the same six
required checks through [`validate.yml`](.github/workflows/validate.yml), using
GitHub's [reusable workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows).
Existing validation triggers and manual historical release evidence are preserved.

Independent AMD64/ARM64 Buildx/QEMU jobs build and smoke-test the image before a
publication job builds the same tagged source and pinned base for both platforms,
following Docker's [multi-platform Actions guidance](https://docs.docker.com/build/ci/github-actions/multi-platform/).
Container and reusable validation actions are SHA-pinned. Only that release publication job gets `packages: write`
and authenticates with `GITHUB_TOKEN`; PR checks never log in to GHCR. It publishes
`X.Y.Z`, `sha-<full-commit-SHA>`, and `latest`, with OCI source/revision/version
labels, build caching, and an immutable digest in the Actions summary.

Publication is serialized. `latest` follows successful publication order, not
semantic-version order; publishing an older version later can move it backwards.
GitHub's [default concurrency queue](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency) may replace a pending publication when another
arrives; rerun a canceled release if it is still wanted. Prefer digest pins for
controlled deployments. Local verification is recorded in the
[container validation record](validation/container-2026-10-24.md). Hosted Actions
and actual GHCR publication remain unverified until a release runs. This change
does not create a release tag or change a running deployment.

## Credits

The coastal setting and narrative are original to this refactor. All 53 creature
sprites, 24 symbol roles, two favicons and the shared fallback were generated with
built-in ImageGen and prepared deterministically at their recorded dimensions.
The [delivery manifest](art/cosmic-horror/manifest.json) and
[prompts](art/cosmic-horror/prompts/) retain generation provenance, delivered
hashes, preparation settings and recorded maintainer approval. Masters, legacy
raster artwork and screenshot collections are no longer required or tracked.
Future artwork is reviewed against the current game, without legacy comparisons.

The original game's monster sprites by [Aekashics](https://aekashics.itch.io/)
remain credited as historical baseline assets; shipped creature sprites have
been replaced. Retained audio credits:

- [Leohpaz](https://leohpaz.itch.io/) — RPG sound effects
- [phoenix1291](https://phoenix1291.itch.io/sound-effects-pack-2) — Level-up sound effect
- [Leviathan_Music](https://soundcloud.com/leviathan254) — Battle music
- [Sara Garrard](https://sonatina.itch.io/letsadventure) — Dungeon music

Howler 2.2.4 remains the audio library. Retained text fonts, generic Font Awesome
controls, library assets and their license notices remain in their distributed files.
