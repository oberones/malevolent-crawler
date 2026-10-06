import { createHash } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
/** Compute the byte identity used by preparation and evidence records.
 * @param {Buffer|string} bytes Input bytes. @returns {string} SHA-256 hex digest.
 */
export function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
/** Require a contract invariant; never silently normalize invalid evidence.
 * @param {unknown} condition Required truthy value. @param {string} message Failure explanation.
 * @throws {Error} When the invariant is false.
 */
export function requireThat(condition, message) {
  if (!condition) throw new Error(message);
}
/** Resolve a repository-relative reference without traversal or symlink indirection.
 * @param {string} root Owned repository/fixture root. @param {string} path Relative POSIX path.
 * @returns {Promise<string>} Absolute path; final output may be absent.
 * @throws {Error} For unsafe paths or symlinks, including existing parent links.
 */
export async function safePath(root, path) {
  requireThat(
    typeof path === "string" &&
      /^[a-zA-Z0-9_./-]+$/.test(path) &&
      !path.startsWith("/") &&
      path.split("/").every(
        // Empty and dot segments permit aliases and escape attempts.
        (part) => part !== "" && part !== "." && part !== "..",
      ),
    "Unsafe relative path",
  );
  let current = await realpath(root);
  for (const part of path.split("/")) {
    current = join(current, part);
    try {
      requireThat(
        !(await lstat(current)).isSymbolicLink(),
        "Unsafe symlink path",
      );
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  return current;
}
/** Read a nonempty local evidence/input file through the same path boundary.
 * @param {string} root Repository root. @param {string} path Relative file reference.
 * @returns {Promise<Buffer>} File bytes. @throws {Error} For missing/empty/unsafe files.
 */
export async function readNonempty(root, path) {
  const bytes = await readFile(await safePath(root, path));
  requireThat(bytes.length > 0, "Empty evidence/input file");
  return bytes;
}
/** Identify direct CLI execution without side effects when imported by tests.
 * @param {string} url Module URL. @returns {boolean} Whether this module is the CLI entry.
 */
export function isMain(url) {
  return (
    Boolean(process.argv[1]) &&
    pathToFileURL(resolve(process.argv[1])).href === url
  );
}
/** Check recorded visual review completeness without claiming reviewer authenticity.
 * @param {string} root Repository root. @param {object} review Individual review record.
 * @returns {Promise<void>} Resolves for complete PASS records. @throws {Error} For gaps.
 */
export async function validateReview(root, review) {
  requireThat(review?.status === "PASS", "Visual review is not PASS");
  requireThat(
    typeof review.reviewer === "string" &&
      review.reviewer.trim().length > 2 &&
      !/^(unknown|tbd|pending|none|n\/a|automated|implementation agent)$/i.test(
        review.reviewer.trim(),
      ),
    "Missing human reviewer",
  );
  requireThat(
    typeof review.date === "string" && Number.isFinite(Date.parse(review.date)),
    "Missing review date",
  );
  requireThat(
    Array.isArray(review.findings) &&
      review.findings.every(
        // Findings require an explicit resolution and its explanation.
        (finding) =>
          finding.status === "RESOLVED" &&
          typeof finding.resolution === "string" &&
          finding.resolution.trim(),
      ),
    "Unresolved visual findings",
  );
  requireThat(
    Array.isArray(review.evidence) && review.evidence.length > 0,
    "Missing review evidence",
  );
  for (const path of review.evidence) await readNonempty(root, path);
}
