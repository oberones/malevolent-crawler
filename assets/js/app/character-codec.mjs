import {
  readBoundedData,
  validateCandidate,
  SAVE_LIMITS,
} from "./save-validation.mjs";
// Keep transport failures compact and free of character contents.
function rejected(code, path = "character") {
  return { ok: false, issues: [{ code, path }] };
}
/**
 * Encode a detached validated character as an MC1 UTF-8 envelope.
 * @param {unknown} player Character-only data; run/preferences are rejected.
 * @returns {{ok:boolean,text?:string,issues?:object[]}} Bounded export or diagnostics.
 */
export function encodeCharacter(player) {
  const checked = validateCandidate(player, "character");
  if (!checked.ok) return checked;
  const bytes = new TextEncoder().encode(
    JSON.stringify({
      format: "malevolent-crawler-character",
      version: 1,
      player: checked.candidate,
    }),
  );
  if (4 + 4 * Math.ceil(bytes.length / 3) > SAVE_LIMITS.bytes)
    return rejected("size-limit");
  const chunks = [];
  for (let offset = 0; offset < bytes.length; offset += 8192)
    chunks.push(String.fromCharCode(...bytes.subarray(offset, offset + 8192)));
  return { ok: true, text: "MC1:" + btoa(chunks.join("")) };
}
/**
 * Decode strict padded Base64: historical Latin-1 JSON or MC1 UTF-8 JSON.
 * Preview is detached and accepts old combat flags without a companion enemy.
 * @param {unknown} text Encoded character, limited to 16 MiB before decoding.
 * @returns {{ok:boolean,player?:object,issues?:object[]}} Validated character or diagnostics.
 */
export function decodeCharacter(text) {
  if (typeof text !== "string") return rejected("invalid-input");
  if (text.length > SAVE_LIMITS.bytes) return rejected("size-limit");
  const modern = text.startsWith("MC1:");
  if (!modern && /^MC[^:]*:/.test(text)) return rejected("unsupported-version");
  const encoded = modern ? text.slice(4) : text;
  if (!encoded.length || encoded.length % 4 || /[^A-Za-z0-9+/=]/.test(encoded))
    return rejected("invalid-base64");
  try {
    const binary = atob(encoded);
    // Re-encoding rejects whitespace, misplaced padding and nonzero unused bits.
    if (btoa(binary) !== encoded) return rejected("invalid-base64");
    let json = binary;
    if (modern) {
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      try {
        json = new TextDecoder("utf-8", {
          fatal: true,
          ignoreBOM: true,
        }).decode(bytes);
      } catch {
        return rejected("invalid-utf8");
      }
    }
    let value = readBoundedData(json);
    if (modern) {
      if (
        !value ||
        Array.isArray(value) ||
        typeof value !== "object" ||
        value.format !== "malevolent-crawler-character"
      )
        return rejected("invalid-envelope");
      if (value.version !== 1) return rejected("unsupported-version");
      if (Object.keys(value).length !== 3 || !Object.hasOwn(value, "player"))
        return rejected("invalid-envelope");
      value = value.player;
    }
    const checked = validateCandidate(value, "character");
    return checked.ok ? { ok: true, player: checked.candidate } : checked;
  } catch (error) {
    return rejected(error.code ?? "invalid-base64", error.path ?? "character");
  }
}
