import { skills } from "../content/messages.mjs";
import { text } from "./outcome-view.mjs";
/** Integrate authored entry and information text without changing classic state.
 * @param {Document} document Owner document.
 * @returns {object} Entry, allocation and informational menu renderers.
 */
export function createEntryView(document) {
  // Keep selector use local and place all authored copy in inert text slots.
  function put(selector, id) {
    document.querySelector(selector).textContent = text(id);
  }
  return {
    /** Fill the title button, creation and inventory text before controls unlock. */
    initialize() {
      document.title = text("entry.title");
      put("#title-screen h1", "entry.title");
      put("#title-prompt", "entry.begin");
      put("#introduction", "entry.introduction");
      put("#name-submit h1", "entry.name");
      put("#inventory h3", "inventory.title");
      put("#inventory h4", "inventory.equipment");
    },
    /** Relabel options while retaining their exact legacy rule values. */
    allocation() {
      put("#allocate-stats h3", "entry.allocation");
      put("#allocation-help", "entry.allocationHelp");
      const select = document.querySelector("#select-skill");
      for (const option of select.options)
        option.textContent = skills[option.value].name;
      this.skill(select.value);
    },
    /** Describe the selected alias without selecting or applying a skill. */
    skill(alias) {
      if (!Object.hasOwn(skills, alias)) throw new TypeError("Unknown skill");
      document.querySelector("#skill-desc").textContent =
        skills[alias].description;
    },
    /** Return catalog-owned skill labels for a profile, preserving its authored player name elsewhere. */
    skillNames(aliases) {
      return (aliases ?? [])
        .map(
          // Reject unfamiliar aliases rather than interpreting player data as markup.
          (alias) => {
            if (!Object.hasOwn(skills, alias))
              throw new TypeError("Unknown skill");
            return skills[alias].name;
          },
        )
        .join(", ");
    },
    /** Add two informational actions; opening or closing them never writes player progress. */
    menu(menu, modal) {
      put("#menuModal h3", "menu.title");
      put("#stats", "menu.run");
      put("#menuModal #quit-run", "run.abandon");
      for (const section of ["Help", "Credits"]) {
        const button = document.createElement("button");
        button.textContent = section;
        // Render independent information inside the existing modal and restore its invoking menu.
        button.onclick = () => {
          menu.style.display = "none";
          modal.style.display = "flex";
          const content = document.createElement("div");
          content.className = "content";
          const heading = document.createElement("h3");
          heading.textContent =
            section === "Help" ? text("help.title") : "Credits";
          content.append(heading);
          const ids =
            section === "Help"
              ? [
                  "help.exploration",
                  "help.combat",
                  "help.progression",
                  "help.relics",
                  "help.saves",
                ]
              : ["about.description", "about.credits", "about.art"];
          for (const id of ids) {
            const paragraph = document.createElement("p");
            paragraph.textContent = text(id);
            content.append(paragraph);
          }
          const close = document.createElement("button");
          close.textContent = text("menu.close");
          close.setAttribute("data-dialog-cancel", "");
          // Information dismissal restores the menu without invoking gameplay callbacks.
          close.onclick = () => {
            modal.replaceChildren();
            modal.style.display = "none";
            menu.style.display = "flex";
            button.focus();
          };
          content.append(close);
          modal.replaceChildren(content);
          close.focus();
        };
        menu.querySelector(".content").append(button);
      }
    },
  };
}
