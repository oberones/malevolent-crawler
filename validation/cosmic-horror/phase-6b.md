# Phase 6B — Image failure boundary and acceptance tests

Date: 2026-10-07. Owner/reviewer: implementation agent. Scope: T099–T101.
Environment: Node 24.21.0/npm 12.2.0; pinned Playwright Chromium, Firefox and
WebKit on the local macOS host. These are automated engine results, not native
browser or physical-device acceptance.

## Delivery and integration boundary

`assets/js/app/image-loader.mjs` owns a single consumer-supplied image and terminal
symbol span. It resolves only encounter identity/variant pairs or symbol
role/context pairs through the existing immutable catalogs. Relics use their
catalog symbol role. Invalid input throws before changing the current view or
starting a request. No caller URL, saved markup, random selection, gameplay state,
timer, persistence or controls enter this boundary.

Primary art must load and decode before becoming visible. Failure makes one
attempt at the task's authored `assets/art/fallback.png`. If that also fails, a
safe local `◇` appears with the catalog alternative, or is decorative when
adjacent text supplies identity. The loader handles all decode rejections. Each
attempt has a generation token; late success/rejection from an old primary or
fallback cannot change a newer identity. Disposal invalidates promises, removes
exact owned listeners and releases the image source. Repeated disposal is safe;
a disposed owner rejects further loads.

The renderer still owns width, height/aspect ratio, containment, alignment and
adjacent identity text. Provide a separate positioned terminal span over the
reserved box, with appropriate `object-fit: contain` on the image. The loader
normalizes an inline image to inline-block, preserving its box when a browser
would otherwise lay out broken-image alternative text. While loading or failed,
decorative images keep a nonempty catalog alternative to prevent WebKit collapse,
with `aria-hidden=true` and visibility hidden. A decoded decorative image receives
empty alt text. Informative images and terminal symbols retain catalog labels.
The failed fallback URL remains attached without handlers or retries, avoiding
another native broken-image geometry change when src is removed.

**T104 owns consumer integration.** Create one loader per live encounter/symbol
slot, call `load(reference, { decorative })` on identity changes, and dispose it
before replacing/removing that slot. Do not retain detached item-list loaders;
coordinate cleanup through the symbol/item/encounter owners. Keep all identity
labels and controls usable during loading. Reference shapes are:

```js
{ kind: "encounter", identity: enemy.name, variant: enemy.image }
{ kind: "symbol", role: "Sword", contextId: "sword/detail" }
```

The loader is deliberately not wired into any live renderer in this package.
The T100 journey tests remain ordinary failures until T104 integrates it; there
are no skipped or expected-failure markers. This package does not complete US4.
The earlier common-manifest `missing-art.png` discrepancy remains assigned to
T105; this module uses T098/T101's delivered fallback path.

## Red–green evidence

T099 first ran nine isolated Chromium tests against a documented no-op interface.
All nine reached intended assertions: missing loading/fallback/decode behavior,
missing stale/disposal protection and missing input rejection. Missing imports
and syntax errors were not counted as red. The tests use real browser image
requests, independently valid/corrupt bytes, and explicitly controlled decode
promises; no arbitrary sleeps or generated production art are needed.

The first implementation exposed real geometry failures in the three engines.
Removing src after terminal failure could turn the image into text-sized content;
a broken decorative image could collapse in WebKit. The final implementation
preserves exact before/after boxes for these cases and usable controls during a
held response. Expanded tests cover both old primary and fallback completion,
success and rejection, repeated setup/teardown, cached reload and accessibility
restoration after terminal failure.

T100 exercises four network modes for creatures and relics: delayed response,
HTTP 404, corrupt bytes and unavailable fallback. It asserts current identity,
real player attack/victory/Claim, keyboard inventory opening, equip/unequip and
sale with exact rewards/holdings and random tapes. Recovery-state assertions are
soft so each case also executes the real controls. The initial diagnostics compared
transformed portrait rectangles during the intentional shake/rotation animation;
that test assumption was corrected to compare untransformed computed CSS
width/height, avoiding animation and protocol rounding differences. It is not counted as application
red. Failure interception is limited to functional fixtures; performance timing
is neither run nor claimed.

| Command                                                                                                             | Actual result                                                                                                                                                             | Evidence                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `npx playwright test tests/integration/image-loader.spec.mjs --project=chromium --workers=2` against the no-op seam | 9 intended failures                                                                                                                                                       | [Red](reports/phase-6b/loader-red.txt)                                                                           |
| `npx playwright test tests/integration --workers=3`                                                                 | 222 PASS, including 36 image-loader checks; no failures/skips                                                                                                             | [Integration](reports/phase-6b/integration.txt)                                                                  |
| `npm run test:unit`                                                                                                 | 2,457 PASS; no failures/skips                                                                                                                                             | [Unit](reports/phase-6b/unit.txt)                                                                                |
| `npx playwright test tests/browser --workers=3`                                                                     | 306 existing checks PASS; 24 new T100 cases failed. Some T100 diagnostics also contained the transformed-rectangle fixture issue described above.                         | [Full browser run](reports/phase-6b/browser.txt)                                                                 |
| `npx playwright test tests/browser/art-failure.spec.mjs --workers=3` after fixing the geometry assertion            | 24 intended recovery failures, zero skipped. Every combat/inventory action, identity, random-tape and untransformed geometry assertion PASS. No remaining fixture errors. | [Final T100 run](reports/phase-6b/journey-final.txt), [assertion summary](reports/phase-6b/journey-summary.json) |
| `npm run lint`                                                                                                      | PASS                                                                                                                                                                      | [Lint](reports/phase-6b/lint-review.txt)                                                                         |
| `npm run format:check`                                                                                              | PASS                                                                                                                                                                      | [Formatting](reports/phase-6b/format-final.txt)                                                                  |
| `git diff --check`                                                                                                  | PASS                                                                                                                                                                      | [Whitespace](reports/phase-6b/whitespace.txt)                                                                    |
| Production build                                                                                                    | N/A: static application                                                                                                                                                   | No build pipeline introduced                                                                                     |

The final T100 result was checked against the structured Playwright report:
all 24 failures are missing recovery states or missing fallback requests. The
browser gate remains red until T104; the 306 existing browser passes do not turn
that into a full-suite pass. Raw command outputs, including unsuccessful loader
iterations and the first journey diagnostic, remain in
`validation/cosmic-horror/reports/phase-6b/`.

## Review and handoff

Purpose comments and public interface contracts were reviewed. The existing
ignore rules cover this private static Node project; Docker/Terraform/Helm and
npm publishing ignores are not applicable. No dependency or baseline changed.
No production build exists. Native/manual, collection-wide artwork acceptance,
matched performance, remote CI and release enforcement remain OPEN/BLOCKED.
Optional pre/post `/speckit.git.commit` hooks were not executed; no commit was made.

The next independent package is Phase 6C (T102–T103). T104 later joins this loader
to encounter/item/symbol consumers and must turn all T100 cases green while
preserving live geometry. Stop at this package's handoff.
