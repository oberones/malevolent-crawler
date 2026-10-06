import sharp from "sharp";
import { requireThat, sha256 } from "./art-common.mjs";
/** Fully decode a PNG and require both visible and transparent pixels.
 * @param {Buffer} bytes Encoded PNG. @param {{width:number,height:number}} expected Exact canvas.
 * @returns {Promise<object>} Dimensions, alpha and hash. @throws {Error} On decode/contract failure.
 */
export async function inspectPng(bytes, expected) {
  const decoder = sharp(bytes, {
    failOn: "warning",
    limitInputPixels: 64000000,
  });
  const metadata = await decoder.metadata();
  requireThat(metadata.format === "png", "Expected PNG format");
  requireThat(
    metadata.width === expected.width && metadata.height === expected.height,
    "Wrong image dimensions",
  );
  requireThat(
    metadata.hasAlpha && (metadata.pages ?? 1) === 1,
    "PNG needs single-frame alpha",
  );
  const { data, info } = await decoder
    .toColourspace("srgb")
    .raw()
    .toBuffer({ resolveWithObject: true });
  let visible = false,
    transparent = false;
  for (let i = info.channels - 1; i < data.length; i += info.channels) {
    visible ||= data[i] > 0;
    transparent ||= data[i] === 0;
  }
  requireThat(visible && transparent, "Blank or opaque image");
  return {
    width: metadata.width,
    height: metadata.height,
    alpha: true,
    sha256: sha256(bytes),
  };
}
