# Research: Cosmic Horror Refactor

**Date**: 2026-10-05
**Branch**: `001-cosmic-horror-refactor`
**Baseline application revision**: `3cfaf54babae978c7388c023f5df5ebe6282259b`
**Inputs**: [Specification](spec.md), [art inventory](art-inventory.md), constitution v1.0.0, and direct source inspection. Research resolves design choices; it does not establish runtime or visual acceptance.

## 1. Retain the static application and isolate new responsibilities

**Decision**: Keep `index.html`, CSS, Howler, and the existing classic game scripts in their current order. Put new catalog, presentation, persistence, and lifecycle services in native `.mjs` modules. A named, once-only initializer in `main.js` dynamically imports `assets/js/app/services.mjs`, installs one explicitly declared lexical `gameServices` bridge, validates initial state, then enables interaction. New modules receive state accessors, storage, clock, audio, and DOM dependencies explicitly; they never inspect legacy globals.

**Rationale**: Approximately 3,200 lines of interdependent game scripts contain both numerical rules and DOM code. A framework or complete module conversion would enlarge a content refactor and increase regression risk. Move direct storage reads out of script evaluation in `player.js:1` and `music.js:3–10`; remove repeated raw reads on title click and dungeon entry. Keep the existing `player`, `dungeon`, `enemy`, and `volume` bindings as runtime owners. Disable controls until initialization succeeds or presents recovery. Move or gate the eager title-audio listener (`music.js:140`) and dungeon control listener (`dungeon.js:37`) so neither runs before state/services are ready; keep audio activation inside the player gesture.

**Alternatives considered**: A full ES-module rewrite, a bundler/framework, and asynchronously injecting all legacy scripts. None is needed. The explicit bridge is a bounded legacy integration permitted by constitution II, with boot-order, duplicate-init, and failure tests. Event binding must work whether the document load event has already fired. [Dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) supports loading ES services from classic code with explicit promise failure handling.

## 2. Preserve internal rule tokens and random-number consumption

**Decision**: Keep legacy encounter names, categories, rarities, skills, event tokens, formulas, and ordered selection pools as internal rule keys. Resolve all player-visible text and art through a single catalog with stable IDs and aliases. Keep the six rarity labels Common through Heirloom unchanged for comprehension. Do not re-theme saved raw strings by global search-and-replace.

**Rationale**: `enemy.js:28–183` filters an ordered master list. Reordering equivalent members changes outcomes. Chest/door mimics consume archetype, candidate, and stat draws before overriding identity. `setEnemyImg()` at `enemy.js:438–444` consumes an additional draw only for the two Skeleton Mage illustrations. Rendering and save migration must consume no gameplay randomness. The equipment category also selects stat-roll pools (`equipment.js:86–104`), so renaming internal values is unnecessary risk.

**Alternatives considered**: Replacing every internal name with a new display name; a second RNG for all gameplay; collapsing related creatures. Reject all three. Characterization tests compare ordered pools, the complete random tape consumed, and numerical results.

## 3. Versioned local snapshots with lossless legacy ingestion

**Decision**: Write a single `malevolentCrawler.save.v1` envelope and retain `malevolentCrawler.save.previous.v1` as the prior validated snapshot. Read the legacy `playerData`, `dungeonData`, `enemyData`, and `volumeData` keys only when no canonical record exists. Leave those original strings intact during migration. Decode into a candidate, validate, translate presentation references, and commit as a whole before replacing runtime state. The [persistence contract](contracts/persistence.md) defines all failure paths.

**Rationale**: `saveData()` (`main.js:419–428`) writes four keys sequentially without handling partial failure. Inventory equipment contains JSON strings; equipped items are objects (`equipment.js:201,295–309,385–415`). Keep this representation at the legacy-engine adapter to avoid changing item operations. Accept legitimate historical nulls, optional fields, and number/string derived percentages. The idle enemy is a nullable placeholder; active combat requires a valid mapped enemy. Do not add a gameplay inventory cap.

**Alternatives considered**: Four-key writes with rollback (rollback can also fail), overwriting original saves immediately, or IndexedDB. One atomic localStorage value is sufficient for this game's state, provided writes happen at completed gameplay transitions. Make default validation pure and defer/coalesce nested save requests until attack, reward, death, or reset processing has finished; otherwise even a single-key snapshot can preserve an inconsistent intermediate state. A previous snapshot gives recoverability without a database migration. Storage failures leave memory and original strings available; a failure never becomes a silent new game. The [Storage setItem contract](https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem) documents string values and quota failures.

## 4. Distinguish character import from local combat continuation

**Decision**: Support the current Latin-1 Base64 JSON player export and introduce a UTF-8 Base64, versioned character-only envelope for future exports. New envelopes never include dungeon, enemy, or volume state. Confirmed import preserves the current reset/retention matrix and local audio preferences; cancellation changes nothing.

**Rationale**: `exportData()` exports only `player` (`main.js:502–505`). Import calls `progressReset()` (`main.js:507–554`). Local continuation instead retains saved HP, enemy identity/variant, stats, and rewards; it starts fresh full attack delays because legacy saves contain no timer phase, RNG state, or combat elapsed/log state. Guardian advancement occurs before combat, and rewards are applied before Claim: rebuilding presentation must replay neither.

**Alternatives considered**: Full-session exports or persisting a new combat simulator. Both exceed scope. Repair the observed load-order defect where `initialDungeonLoad()` resets the combat event flag after `startCombat()`, and cancel stale timers with a lifecycle owner. These are scoped compatibility corrections, not balance changes.

## 5. Safe presentation and historical logs

**Decision**: Render names, numbers, errors, and user text with DOM text APIs; select images and CSS classes from allowlisted catalogs. Generate new logs as typed message IDs plus parameters. Translate recognized complete legacy log templates to these records. Preserve unrecognized raw entries in recovery data and show a neutral history-recovery notice instead of interpreting them as HTML.

**Rationale**: Current names, logs, item attributes, and image paths flow into `innerHTML` (`player.js:71–75`, `combat.js:317–329`, `dungeon.js:465–468`). Input name validation does not make imported or stored content trusted. Parsing a log must never change a player-authored name that happens to contain an old creature term.

**Alternatives considered**: Blind token replacement, trusting stored HTML, or adding a general HTML sanitizer. A finite game-message vocabulary and safe node construction avoid the sanitizer dependency. Trusted static modal skeletons can remain, but untrusted interpolation into them cannot.

## 6. Generate masters, then package exact-size assets

**Decision**: During implementation use the installed imagegen skill and built-in image generation, with one request per distinct illustration/variant, original concepts, transparent backgrounds, and the agreed grotesque-horror boundary. Preserve masters and generation records. Use pinned, dev-only Sharp for proportional contain/padding to the baseline canvas. Use a small tested ICO packer for the one 127 × 128 entry; derive it and the 199 × 200 PNG from one new favicon master.

**Rationale**: The generator does not guarantee the 53 irregular sprite dimensions. Deterministic preparation of generated masters is needed; stretching and cropping defining anatomy are forbidden. PNG alpha must survive processing. The original ICO has one 32-bit DIB entry; a PNG-backed ICO can preserve its exact directory and decoded dimensions. File hashes establish traceability, not originality.

**Alternatives considered**: Procedural stand-ins, tracing old artwork, accepting approximate dimensions, square replacement favicons, or choosing an API/CLI fallback without authorization. These do not meet the request or installed workflow. Every delivered file gets its own manifest row even when two favicon outputs share a master. See [Sharp resizing](https://sharp.pixelplumbing.com/api-resize/), [Microsoft ICO PNG support](https://devblogs.microsoft.com/oldnewthing/20101022-00/?p=12473), and [ICO directory dimensions](https://learn.microsoft.com/en-us/windows/win32/menurc/iconresdir).

## 7. Measure font pictograms as rendered UI

**Decision**: Define 24 distinct symbol roles: 14 equipment categories and 10 title/stat/treasure/currency roles. Before replacement, measure every distinct context after fonts load at each required viewport and 100%/200% text. Compare new artwork to the same browser's baseline with at most 0.5 CSS-pixel rounding tolerance per edge/baseline, while retaining containers.

**Rationale**: Plate/Chain/Leather share a legacy glyph; Defense and Buckler share another. Role identity is not font-class identity. Equipment appears in reward `h4`, inventory `p`, detail `h3`, and equipped buttons. CSS adds different glyph margins and a global image top margin (`style.css:53–55,94–97,209–211,510–512`). Explicit symbol styles must reproduce each context and reset inappropriate image margins.

**Alternatives considered**: Treating every glyph as a 16 × 16 source image or checking only intrinsic dimensions. Neither measures the actual footprint. Browser measurements and visual review remain OPEN until implementation.

## 8. Minimal development tooling, no production build

**Decision**: Use Node.js 24.21.0 LTS and npm 12.2.0 as the planned reproducible toolchain. Unit tests use built-in `node:test` with controlled dependencies and `.mjs` fixtures. Playwright covers real-DOM integration and browser journeys; axe adds automated accessibility checks. ESLint/Prettier provide repeatable lint/format gates. Sharp handles development-only asset preparation; http-server serves the static app. Exact pins and commands are in [quickstart](quickstart.md).

**Rationale**: Local observation found Node 20.20.2/npm 10.8.2, no `node_modules`, no scripts, and only Howler 2.2.3 in lockfile v2. This local runtime is not the selected implementation toolchain. No transpilation or production bundle is required. New packages are dev dependencies and add zero runtime payload; retain the existing vendored Howler/audio behavior. Review the lockfile, licenses, advisories, and transitive/native packages during tooling setup before adoption; version availability alone is not a security pass.

**Alternatives considered**: Jest/jsdom, a UI framework, a production bundler, and using only screenshot tests. Built-in unit testing plus Playwright avoids an extra emulated DOM and still covers real boundaries. Use [Node test runner](https://nodejs.org/api/test.html), [Node releases](https://nodejs.org/en/about/previous-releases), [Playwright browsers](https://playwright.dev/docs/browsers), [ESLint configuration](https://eslint.org/docs/latest/use/configure/configuration-files), and [Prettier CLI](https://prettier.io/docs/cli).

## 9. Browser targets and reproducible acceptance

**Decision**: Pin automated browser revisions to Playwright 1.63.0. Test Chromium, Firefox, and WebKit at 360 × 800, 768 × 1024, and 1440 × 900 with keyboard/pointer and touch configurations. Separately require real desktop Chrome/Firefox/Safari and physical Android Chrome/iOS Safari acceptance. The exact planned matrix and evidence rules are in [validation plan](validation-plan.md).

**Rationale**: Playwright's WebKit is not the Safari product, and device emulation does not certify physical touch. macOS 26.6.2, Firefox 157.0, and Safari 26.6.2 were observed locally; Google Chrome and physical mobile devices were not established. Existing cached Playwright revisions do not match the selected pin. Missing required execution targets stay BLOCKED until supplied; this is an execution availability issue, not an unanswered design choice.

**Alternatives considered**: Calling WebKit coverage Safari acceptance, testing only the development browser, or claiming screenshots prove keyboard usability. All conflict with the spec. Sources: [pinned Playwright browser manifest](https://raw.githubusercontent.com/microsoft/playwright/v1.63.0/packages/playwright-core/browsers.json), [Chrome stable releases](https://chromereleases.googleblog.com/2026/10/?amp=1), [Apple Safari releases](https://developer.apple.com/documentation/safari-release-notes), and [Android 17 release](https://developer.android.com/blog/posts/android-17-is-here).

## 10. Performance and external resources

**Decision**: Capture baseline and candidate on the same pinned browser/device with the same deterministic save, random tape, server/network conditions, and font policy. Measure at least five cold-start samples and five repeat-encounter samples per workload; apply `candidate median <= baseline median + max(0.10 * baseline median, 100 ms)` separately. Exercise the largest sprite, both variant branches, a mimic, and a full equipment view. Record raw samples and asset bytes.

**Rationale**: Current title startup waits for window load and includes a one-second loader. Do not accidentally remove that behavior merely to improve a score. Existing Google Analytics and Google Fonts are independent external resources in `index.html:6–18`; block/mock them in functional tests and verify graceful failure separately. Normal performance runs must avoid Playwright request/HAR routing, which disables HTTP cache; use the identical documented served-fixture transform described in the validation plan and verify warm-cache hits. See the [Playwright routing caveat](https://playwright.dev/docs/api/class-browsercontext#browser-context-route). Do not add art-service calls, save uploads, or secrets to the shipped app. Keep local font fallbacks and retained audio controls.

**Alternatives considered**: Measuring only total asset bytes, using different cached browsers for before/after, or reporting a single fast sample. Those do not establish QR-004. Normal art-readiness timing requires successful decode/render of the correct artwork. Fallback responsiveness is a separate failure test and cannot pass the normal art timing metric.

## Resolution and limits

All architectural, format, tooling, and workflow questions above are resolved for planning. Runtime baselines, glyph geometry, original art, dependency audit results, native browser/device runs, and manual visual/accessibility acceptance are implementation evidence to collect, not claims made by this document. No constitution exception is requested.
