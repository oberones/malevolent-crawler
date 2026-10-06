import { text } from "./outcome-view.mjs";
/** Build choice controls from catalog IDs, never from persisted HTML.
 * @param {Document} document Owner document.
 * @returns {object} appendChoices(target, choices) for the current event only.
 */
export function createEventView(document) {
  return {
    /** Keep existing choice IDs and ordering so the engine binds unchanged consequences. */
    appendChoices(target, choices) {
      const panel = document.createElement("div");
      panel.className = "decision-panel";
      for (const [index, id] of choices.entries()) {
        const button = document.createElement("button");
        button.id = `choice${index + 1}`;
        button.textContent = text(id);
        panel.append(button);
      }
      target.append(panel);
    },
  };
}
