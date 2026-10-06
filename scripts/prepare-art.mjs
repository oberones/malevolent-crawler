import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import sharp from "sharp";
import {
  safePath,
  readNonempty,
  requireThat,
  isMain,
  sha256,
} from "./art-common.mjs";
import { inspectPng } from "./image-inspection.mjs";
import { packIco } from "./pack-ico.mjs";
/** Prepare a generated master with proportional contain and transparent padding.
 * @param {object} options Root, master/output relative paths and integer width/height.
 * @returns {Promise<object>} Delivered metadata and deterministic transform record.
 * @throws {Error} For unsafe destinations, invalid pixels/dimensions or I/O failure. Writes only runtime outputs.
 */
export async function prepareArt({ root, master, output, width, height }) {
  requireThat(
    /^assets\/(sprites|icon|art)\/[a-zA-Z0-9_/-]+\.(png|ico)$/.test(output),
    "Unsafe output destination path",
  );
  requireThat(master !== output, "Output must not overwrite source");
  requireThat(
    Number.isInteger(width) &&
      width > 0 &&
      Number.isInteger(height) &&
      height > 0 &&
      width * height <= 64000000,
    "Invalid dimensions",
  );
  const destination = await safePath(root, output);
  const source = await readNonempty(root, master);
  const metadata = await sharp(source).metadata();
  await inspectPng(source, { width: metadata.width, height: metadata.height });
  const options = {
    compressionLevel: 9,
    adaptiveFiltering: false,
    palette: false,
  };
  const png = await sharp(source, { failOn: "warning" })
    .resize(width, height, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .png(options)
    .toBuffer();
  const inspected = await inspectPng(png, { width, height });
  const bytes = output.endsWith(".ico") ? await packIco(png) : png;
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  return {
    ...inspected,
    path: output,
    sha256: sha256(bytes),
    transform: {
      processor: "sharp",
      version: sharp.versions.sharp,
      fit: "contain",
      padding: "transparent",
      options,
    },
  };
}
if (isMain(import.meta.url)) {
  try {
    const [id, ...extra] = process.argv.slice(2);
    requireThat(
      id && !extra.length,
      "Usage: npm run art:prepare -- <manifest-asset-id>",
    );
    const root = process.cwd();
    const manifest = JSON.parse(
      await readNonempty(root, "art/cosmic-horror/manifest.json"),
    );
    // Select exactly one explicit manifest obligation for a preparation action.
    const matches = manifest.entries.filter((entry) => entry.id === id);
    requireThat(matches.length === 1, "Unknown or duplicate manifest asset ID");
    const entry = matches[0];
    requireThat(
      entry.generation?.masterPath,
      "Master is OPEN; generate and record it first",
    );
    console.log(
      JSON.stringify(
        await prepareArt({
          root,
          master: entry.generation.masterPath,
          output: entry.delivered.path,
          width: entry.delivered.width,
          height: entry.delivered.height,
        }),
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
