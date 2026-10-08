# Phase 1 dependency review

> Historical qualification record. The [2026-10-08 cleanup](review-cleanup.md)
> supersedes art-retention and art-CI requirements below. Earlier results remain
> historical; retired artifact paths are not current checkout requirements.

Reviewed 2026-10-06T04:39:40.780594+00:00; owner T003; source revision `a377a9f9fd17abcf9ffdedaa760b5b4a77ba600d`.

Exact pins and lockfile were resolved before the clean install. All dependency install hooks are disabled by `.npmrc` (`ignore-scripts=true`); npm package commands still run explicitly. No lifecycle-script exception is needed. The newly installed nvm runtime leaves the default alias unchanged.

| Package              | Pin     | License    | Published                | Review                                                                                                         |
| -------------------- | ------- | ---------- | ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| @playwright/test     | 1.63.0  | Apache-2.0 | 2026-09-04T22:44:00.304Z | Current published release at review.                                                                           |
| @axe-core/playwright | 4.13.0  | MPL-2.0    | 2026-08-11T17:07:40.763Z | Current published release at review.                                                                           |
| eslint               | 10.12.0 | MIT        | 2026-10-02T20:08:19.213Z | Current published release at review.                                                                           |
| @eslint/js           | 10.0.1  | MIT        | 2026-02-06T22:34:56.290Z | Current published release at review.                                                                           |
| globals              | 17.13.0 | MIT        | 2026-10-01T03:57:11.938Z | Current published release at review.                                                                           |
| prettier             | 3.9.9   | MIT        | 2026-09-23T06:31:34.693Z | Current published release at review.                                                                           |
| http-server          | 14.1.1  | MIT        | 2022-05-31T21:34:27.707Z | 2022 release; maintenance risk retained for plan compatibility. Bind only to loopback; not production hosting. |
| sharp                | 0.35.5  | Apache-2.0 | 2026-09-27T13:46:24.509Z | Current published release at review.                                                                           |
| howler               | 2.2.3   | MIT        | 2021-06-30T18:46:19.145Z | Retained 2.2.3 intentionally; 2.2.4 exists. Runtime audio unchanged.                                           |

All 164 resolved package records, including platform-optional packages, have a license recorded in [dependency-inventory.json](reports/dependency-inventory.json). Howler is MIT (installed metadata); union 0.5.0 omits metadata licensing but its shipped LICENSE is MIT. This inventory is a development dependency review, not a claim of product-wide legal clearance.

Sharp loads without executing install scripts. Its native versions are recorded in [sharp-versions.json](reports/sharp-versions.json), including libvips 8.18.7. The preserved [native license table](reports/native-licenses.md) covers LGPLv3 libraries (libvips, glib, fribidi, libexif, libheif, librsvg, pango, proxy-libintl), cairo MPL-1.1, AOM BSD/patent terms, and the MIT/BSD/font/png/jpeg/zlib licenses of the remaining libraries. Platform-specific optional package licenses are included in the lock inventory. Native binary redistribution is not part of the static website.

No locked dependency has `hasInstallScript`; installed tarballs contain prepare/prepublish maintenance commands (including build tools and axe’s browser installer), catalogued individually in the inventory. They were not executed. Playwright browser installation was an explicit, version-matched command, not an arbitrary dependency hook. Keep install scripts disabled for subsequent `npm ci`.

`whatwg-encoding@2.0.0` is deprecated in http-server’s transitive dependency tree; retain and track it rather than applying an unreviewed override. The npm audit completed with zero known vulnerabilities of every severity; this is a dated registry result, not a guarantee of security or native-library advisory coverage. Re-run before merge.

| Verification              | Result                                                                                               | Evidence                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `npm ci --ignore-scripts` | PASS; 138 installed packages, lock retained                                                          | [clean install](reports/npm-ci.txt)       |
| `npm audit --json`        | PASS; 0 known vulnerabilities                                                                        | [audit](reports/npm-audit.json)           |
| Load Sharp native module  | PASS; no rebuild required                                                                            | [versions](reports/sharp-versions.json)   |
| Production payload        | PASS for this change; all eight additions dev-only, no HTML/runtime imports or build outputs changed | `git diff -- index.html assets/` is empty |

npm 12.2.0 is the separately pinned nvm tool, Artistic-2.0, Node engine range `^22.22.2 || ^24.15.0 || >=26.0.0`; selected Node 24.21.0 is compatible. Node’s downloaded archive checksum was verified by nvm. [Official npm metadata](https://registry.npmjs.org/npm/12.2.0).
