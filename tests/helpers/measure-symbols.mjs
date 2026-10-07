/* global document, getComputedStyle, devicePixelRatio, innerWidth, innerHeight */
import { writeFile } from "node:fs/promises";
/**
 * Measure visible symbol contexts after required fonts settle, without retaining probes.
 * @param {import('@playwright/test').Page} page Isolated browser page.
 * @param {Array<object>} contexts Unique IDs, selectors and optional required font descriptors.
 * @returns {Promise<Array<object>>} Geometry and typography observations.
 * @throws {Error} For missing, ambiguous, hidden or unready symbol contexts.
 */
export async function measureSymbols(page, contexts) {
  return page.evaluate(
    // Run geometry reads in the page after font loading; probes are always removed.
    async (contexts) => {
      await document.fonts.ready;
      const rows = [];
      const ids = new Set();
      for (const context of contexts) {
        if (ids.has(context.id))
          throw new Error(`Duplicate context ${context.id}`);
        ids.add(context.id);
        if (context.requiredFont) {
          try {
            const faces = await document.fonts.load(context.requiredFont);
            if (!faces.length || !document.fonts.check(context.requiredFont))
              throw new Error("unavailable");
          } catch {
            throw new Error(
              `Required font unavailable: ${context.requiredFont}`,
            );
          }
        }
        const nodes = document.querySelectorAll(context.selector);
        if (nodes.length !== 1)
          throw new Error(`Expected exactly one symbol: ${context.id}`);
        const node = nodes[0];
        let box = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        if (!box.width || !box.height || style.visibility !== "visible")
          throw new Error(`Symbol must be visible: ${context.id}`);
        for (let ancestor = node; ancestor; ancestor = ancestor.parentElement) {
          if (Number(getComputedStyle(ancestor).opacity) === 0)
            throw new Error(`Symbol must be visible: ${context.id}`);
        }
        const probe = document.createElement("span");
        probe.style.cssText =
          "display:inline-block;width:0;height:0;padding:0;margin:0;border:0;vertical-align:baseline";
        try {
          const parentDisplay = getComputedStyle(node.parentElement).display;
          // Flex/grid siblings do not share an inline formatting context with the glyph.
          if (/flex|grid/.test(parentDisplay)) node.append(probe);
          else node.after(probe);
          // Probe insertion can reflow a centered panel; both edges must use the same layout.
          box = node.getBoundingClientRect();
          const baseline = probe.getBoundingClientRect().top;
          rows.push({
            id: context.id,
            selector: context.selector,
            box: { x: box.x, y: box.y, width: box.width, height: box.height },
            baselineOffset: baseline - box.y,
            marginLeft: style.marginLeft,
            marginRight: style.marginRight,
            paddingLeft: style.paddingLeft,
            paddingRight: style.paddingRight,
            verticalAlign: style.verticalAlign,
            lineHeight: style.lineHeight,
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            pseudoFontFamily: getComputedStyle(node, "::before").fontFamily,
            fontStatus: document.fonts.status,
            dpr: devicePixelRatio,
            viewport: { width: innerWidth, height: innerHeight },
          });
        } finally {
          probe.remove();
        }
      }
      return rows;
    },
    contexts,
  );
}
/**
 * Save a new evidence document without replacing existing baseline bytes.
 * @param {string} path Destination in a caller-owned evidence directory.
 * @param {object} data Serializable measurement data.
 * @returns {Promise<void>} Completes once the exclusive write succeeds.
 * @throws {Error} If the file exists or cannot be written.
 */
export async function writeBaseline(path, data) {
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, { flag: "wx" });
}
