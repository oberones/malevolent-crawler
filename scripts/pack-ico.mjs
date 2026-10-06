import { inspectPng } from "./image-inspection.mjs";
import { requireThat, sha256 } from "./art-common.mjs";
/** Encode the exact required one-entry PNG-backed favicon directory.
 * @param {Buffer} png Transparent 127 x 128 PNG. @returns {Promise<Buffer>} ICO bytes.
 * @throws {Error} If the payload is not valid transparent art at the required dimensions.
 */
export async function packIco(png) {
  await inspectPng(png, { width: 127, height: 128 });
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header[6] = 127;
  header[7] = 128;
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  return Buffer.concat([header, png]);
}
/** Validate the whole directory and decode its payload, rejecting trailing or truncated bytes.
 * @param {Buffer} bytes ICO bytes. @returns {Promise<object>} Exact image metadata and hash.
 * @throws {Error} For any directory, size or payload mismatch.
 */
export async function inspectIco(bytes) {
  requireThat(bytes.length > 22, "Truncated ICO");
  requireThat(
    bytes.readUInt16LE(0) === 0 &&
      bytes.readUInt16LE(2) === 1 &&
      bytes.readUInt16LE(4) === 1,
    "ICO needs one icon entry",
  );
  requireThat(
    bytes[6] === 127 &&
      bytes[7] === 128 &&
      bytes[8] === 0 &&
      bytes[9] === 0 &&
      bytes.readUInt16LE(10) === 1 &&
      bytes.readUInt16LE(12) === 32,
    "Invalid ICO directory dimensions/fields",
  );
  requireThat(
    bytes.readUInt32LE(18) === 22 &&
      bytes.readUInt32LE(14) === bytes.length - 22,
    "Invalid ICO payload boundary",
  );
  const decoded = await inspectPng(bytes.subarray(22), {
    width: 127,
    height: 128,
  });
  return {
    ...decoded,
    sha256: sha256(bytes),
    icoEntries: [
      {
        width: 127,
        height: 128,
        bitsPerPixel: 32,
        offset: 22,
        bytes: bytes.length - 22,
        encoding: "PNG",
      },
    ],
  };
}
