# Run from the repository root with the Node/npm versions in package.json selected.
# Compatible with GNU Make 3.81 (macOS) and newer. npm scripts remain authoritative.
SHELL := /bin/sh
.DEFAULT_GOAL := help

# Functional suites share a server port and output directories. Serialize all goals,
# including explicit multi-goal invocations, even when make is called with -j.
.NOTPARALLEL:

NPM ?= npm
NPX ?= npx
BROWSERS ?= chromium firefox webkit
ARGS ?=

.PHONY: help setup install browsers browsers-with-deps dev serve \
        test test-unit test-integration test-browser test-performance \
        check ci lint lint-fix format-check format audit validate-evidence \
        serve-performance report clean build

help: ## Show targets and configurable options (default)
	@printf '%s\n' 'Usage: make <target> [VARIABLE=value]' ''
	@awk 'BEGIN { FS = ":.*## " } /^[a-zA-Z0-9_-]+:.*## / { printf "  %-22s %s\n", $$1, $$2 }' Makefile
	@printf '\n%s\n' \
	  'Options: NPM=npm NPX=npx BROWSERS="chromium firefox webkit" ARGS="..."' \
	  'ARGS applies to individual browser/performance, lint and formatting targets.' \
	  'Example: make test-browser ARGS="--project=chromium --workers=1"' \
	  'Performance requires the prepared server and environment in the quickstart.' \
	  'Select Node 24.21.0 / npm 12.2.0 first; setup does not change your runtime.'

setup: install browsers ## Install locked dependencies, then Playwright browsers

install: ## Install dependencies reproducibly using package-lock.json
	$(NPM) ci

browsers: ## Download the selected Playwright browsers
	$(NPX) --no-install playwright install $(BROWSERS)

browsers-with-deps: ## Install browsers plus OS dependencies (may request sudo on Linux)
	$(NPX) --no-install playwright install --with-deps $(BROWSERS)

dev: ## Serve the game at http://127.0.0.1:4173 (Ctrl-C to stop)
	$(NPM) run dev

serve: dev ## Alias for dev

test: test-unit test-integration test-browser ## Run all functional suites sequentially

test-unit: ## Run the complete Node unit suite
	$(NPM) run test:unit

test-integration: ## Run Playwright integration tests (optional ARGS)
	$(NPM) run test:integration $(if $(strip $(ARGS)),-- $(ARGS))

test-browser: ## Run Playwright player-journey tests (optional ARGS)
	$(NPM) run test:browser $(if $(strip $(ARGS)),-- $(ARGS))

# Keep optional historical evidence and performance checks outside routine CI.
check: lint format-check test audit ## Run the six required CI checks; stop on failure

ci: check ## Alias for check; install dependencies/browsers separately

lint: ## Check owned JavaScript with ESLint (optional ARGS)
	$(NPM) run lint $(if $(strip $(ARGS)),-- $(ARGS))

lint-fix: ## Apply ESLint automatic fixes (modifies files)
	$(NPM) run lint -- --fix $(ARGS)

format-check: ## Check repository formatting (optional ARGS)
	$(NPM) run format:check $(if $(strip $(ARGS)),-- $(ARGS))

format: ## Apply Prettier formatting to owned files (modifies files)
	$(NPX) --no-install prettier --write . $(ARGS)

audit: ## Check dependencies for high/critical advisories (requires network)
	$(NPM) audit --audit-level=high

validate-evidence: ## Validate historical release records; unresolved gates fail
	$(NPM) run validate:evidence

# The harness validates stage, revision, source hashes and exclusive output paths.
# PERF_STAGE, PERF_REVISION and BASE_URL are inherited from the caller environment.
test-performance: ## Run optional measurements against a separately prepared server
	$(NPM) run test:performance $(if $(strip $(ARGS)),-- $(ARGS))

serve-performance: ## Serve this checkout with performance caching on port 4174
	$(NPM) run serve:performance

report: ## Open the latest Playwright HTML report
	$(NPX) --no-install playwright show-report playwright-report

# Preserve .cache (immutable prepared roots), ci-reports, validation and all assets.
clean: ## Remove transient test-results, playwright-report and coverage only
	rm -rf -- test-results playwright-report coverage

build: ## Explain why no production build is needed
	@printf '%s\n' 'Build N/A: static HTML/CSS/JavaScript; deploy index.html and assets/ with .mjs JavaScript MIME support.'
