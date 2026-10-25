#!/usr/bin/env bash
set -euo pipefail

# Run from the repository root so tests compare image bytes to the checked-out source.
cd "$(dirname "$0")/.."
image=${1:?Usage: bash scripts/smoke-container.sh IMAGE linux/amd64-or-arm64}
platform=${2:?Supply the expected linux/amd64 or linux/arm64 platform}
case "$platform" in linux/amd64|linux/arm64) ;; *) echo 'Unsupported test platform' >&2; exit 1 ;; esac
project=${CONTAINER_TEST_PROJECT:-mc-smoke-$$}
export MALEVOLENT_CRAWLER_IMAGE="$image"
export MALEVOLENT_CRAWLER_NETWORK="$project"
export MALEVOLENT_CRAWLER_PORT=0
# Only the test harness selects emulation; production Compose follows the host.
export DOCKER_DEFAULT_PLATFORM="$platform"
network_created=false

# Scope every Compose action to this disposable project and the production definition.
compose() {
  docker compose --project-name "$project" --file deploy/compose.production.yml "$@"
}

# Preserve failures, print diagnostics, and remove only resources owned by this invocation.
cleanup() {
  status=$?
  trap - EXIT
  if [[ "$status" -ne 0 ]]; then compose logs --no-color || true; fi
  compose down --timeout 5 || status=1
  if [[ "$network_created" == true ]]; then docker network rm "$project" >/dev/null || status=1; fi
  exit "$status"
}

actual=$(docker image inspect --format '{{.Os}}/{{.Architecture}}' "$image")
[[ "$actual" == "$platform" ]] || { echo "Expected $platform, found $actual" >&2; exit 1; }
compose config --quiet
# An existing network name is an error; never take ownership of somebody else's network.
docker network create "$project" >/dev/null
network_created=true
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
compose up --detach --pull never --wait --wait-timeout 90
CONTAINER_ID=$(compose ps --quiet malevolent-crawler)
export CONTAINER_ID
endpoint=$(compose port malevolent-crawler 8080)
export CONTAINER_BASE_URL="http://$endpoint"
node --test tests/container/http.test.mjs tests/container/runtime.test.mjs
node node_modules/@playwright/test/cli.js test --config playwright.container.config.mjs
