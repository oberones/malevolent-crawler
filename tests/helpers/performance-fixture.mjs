import { createHash } from "node:crypto";
import {
  readFile,
  writeFile,
  mkdir,
  readdir,
  copyFile,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Hash exact bytes for the served-root and fixture identity. @param {string|Buffer} value Bytes. @returns {string} SHA-256. */
export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
/**
 * Enforce stage, loopback server and source identity before browser measurements.
 * @param {object} options Stage, baseURL, expectedRevision, transformHash and served metadata.
 * @returns {object} Validated options.
 * @throws {Error} For absent, remote, mismatched or malformed metadata.
 */
export function validateRun(options) {
  const { stage, baseURL, expectedRevision, metadata, transformHash } = options;
  if (!["baseline", "candidate"].includes(stage))
    throw new Error("PERF_STAGE must be baseline or candidate");
  const url = new URL(baseURL);
  if (
    url.protocol !== "http:" ||
    !["127.0.0.1", "localhost"].includes(url.hostname) ||
    url.username ||
    url.password
  )
    throw new Error("BASE_URL must be a loopback HTTP server");
  if (
    !/^[a-f0-9]{40}$/.test(expectedRevision ?? "") ||
    metadata?.revision !== expectedRevision ||
    metadata.stage !== stage
  )
    throw new Error("Served revision/stage mismatch");
  if (
    !/^[a-f0-9]{64}$/.test(transformHash ?? "") ||
    metadata.transformHash !== transformHash ||
    !/^[a-f0-9]{64}$/.test(metadata.sourceHash ?? "")
  )
    throw new Error("Served transform/source hash mismatch");
  return options;
}
/**
 * Apply an idempotent performance-only transform to trusted repository HTML.
 * @param {string} html Original index bytes decoded as UTF-8.
 * @returns {string} HTML without external analytics/title font and with fixed Arial title fallback.
 */
export function transformIndex(html) {
  const transformed = html
    .replace(
      /<script\b[^>]*src=["']https:\/\/www\.googletagmanager\.com\/[^"']*["'][^>]*>\s*<\/script>/gi,
      "",
    )
    .replace(/<script\b[^>]*>[^<]*\bdataLayer\b[^<]*<\/script>/gi, "")
    .replace(
      /<link\b[^>]*href=["']https:\/\/fonts\.googleapis\.com\/[^"']*["'][^>]*>/gi,
      "",
    );
  if (transformed.includes('id="performance-font-policy"')) return transformed;
  return transformed.replace(
    "</head>",
    '<style id="performance-font-policy">#title-screen h1{font-family:Arial,Helvetica,sans-serif!important}</style></head>',
  );
}
export const TRANSFORM_HASH = sha256(
  await readFile(fileURLToPath(import.meta.url)),
);
// Enumerate only the static runtime tree in stable order.
async function listAssets(root, prefix = "assets") {
  const files = [];
  for (const entry of await readdir(join(root, prefix), {
    withFileTypes: true,
  })) {
    const path = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) files.push(...(await listAssets(root, path)));
    else if (entry.isFile()) files.push(path);
    else throw new Error(`Unsupported source entry: ${path}`);
  }
  return files.sort();
}
/**
 * Create a new verified static root without changing source or existing evidence.
 * @param {object} options sourceRoot, outputRoot, stage, revision and optional frozen manifest.
 * @returns {Promise<object>} Hash/byte inventory written as performance-source.json.
 * @throws {Error} For changed baseline bytes, existing output or IO failures.
 */
export async function prepareRoot({
  sourceRoot,
  outputRoot,
  stage,
  revision,
  baseline,
}) {
  if (
    !["baseline", "candidate"].includes(stage) ||
    !/^[a-f0-9]{40}$/.test(revision)
  )
    throw new Error("Explicit valid stage/revision required");
  if (stage === "baseline" && baseline?.revision !== revision)
    throw new Error("Baseline revision mismatch");
  const paths = ["index.html", ...(await listAssets(sourceRoot))];
  const files = [];
  for (const path of paths) {
    const bytes = await readFile(join(sourceRoot, path));
    const hash = sha256(bytes);
    if (stage === "baseline") {
      const original = baseline.files.find(
        // Every runtime file must agree with the independently frozen manifest.
        (entry) => entry.path === path,
      );
      if (
        !original ||
        original.sha256 !== hash ||
        original.bytes !== bytes.length
      )
        throw new Error(`Baseline source changed: ${path}`);
    }
    files.push({ path, bytes: bytes.length, sha256: hash });
  }
  if (
    stage === "baseline" &&
    paths.length !==
      baseline.files.filter(
        // LICENSE is provenance and is not served as a runtime dependency.
        (entry) =>
          entry.path === "index.html" || entry.path.startsWith("assets/"),
      ).length
  )
    throw new Error("Missing baseline runtime files");
  await mkdir(outputRoot, { recursive: false });
  for (const { path } of files) {
    await mkdir(resolve(outputRoot, path, ".."), { recursive: true });
    await copyFile(join(sourceRoot, path), join(outputRoot, path));
  }
  const originalIndex = await readFile(join(sourceRoot, "index.html"), "utf8");
  const transformed = transformIndex(originalIndex);
  await writeFile(join(outputRoot, "index.html"), transformed);
  const metadata = {
    stage,
    revision,
    transformHash: TRANSFORM_HASH,
    sourceHash: sha256(JSON.stringify(files)),
    originalIndexHash: sha256(originalIndex),
    servedIndexHash: sha256(transformed),
    files,
  };
  await writeFile(
    join(outputRoot, "performance-source.json"),
    JSON.stringify(metadata, null, 2),
    { flag: "wx" },
  );
  return metadata;
}
// CLI inputs are explicit so a candidate can never accidentally refresh a baseline.
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const [stage, sourceRoot, outputRoot, revision] = process.argv.slice(2);
  const baseline = JSON.parse(
    await readFile(
      new URL("../fixtures/legacy/baseline.json", import.meta.url),
    ),
  );
  const metadata = await prepareRoot({
    stage,
    sourceRoot,
    outputRoot,
    revision,
    baseline,
  });
  console.log(
    JSON.stringify({ outputRoot, ...metadata, files: metadata.files.length }),
  );
}
