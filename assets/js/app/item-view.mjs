import { setting } from "../content/setting.mjs";
import { createItemActions } from "./item-actions.mjs";
import { createSymbolView } from "./symbol-view.mjs";
import { getRelic, getRarity } from "../content/catalog.mjs";
import { validateEquipment } from "./save-validation.mjs";

/**
 * Own safe item DOM and view-bound actions; classic callbacks retain stats, saves
 * and exploration ownership. Existing modal bridge supplies dialogs.mjs focus.
 * @param {object} options document, getPlayer, run, refresh, pause, resume, sound.
 * @returns {object} Render, detail and bulk-confirmation methods.
 */
export function createItemView({
  document,
  getPlayer,
  run,
  refresh,
  pause,
  resume,
  sound,
}) {
  const symbol = createSymbolView(document);
  const actions = createItemActions({ getPlayer, rerender: stale });
  let bind;
  // Construct inert text nodes and native controls without markup interpolation.
  function node(tag, text = "", id) {
    const n = document.createElement(tag);
    n.textContent = text;
    if (id) n.id = id;
    return n;
  }
  // Reject malformed items before reading their display or transaction fields.
  function checked(raw) {
    const result = validateEquipment(raw);
    if (!result.ok) throw new TypeError("Invalid item");
    return result.candidate;
  }
  // Display the same catalog identity and rarity in every current item surface.
  function label(item) {
    return `${item.rarity} ${getRelic(item.category).value.displayName}`;
  }
  // Resolve role-specific art while keeping text as the accessible source of identity.
  function icon(item, stage) {
    const id = getRelic(item.category).value.symbolId;
    return symbol(id, `${id.slice(6)}/${stage}`);
  }
  // Wire a native action and retain stable IDs for the existing screen organization.
  function button(id, text, handler) {
    const n = node("button", text, id);
    n.type = "button";
    n.onclick = handler;
    return n;
  }
  // Restore the inventory panel after a detail or decision is dismissed.
  function close() {
    for (const id of ["equipmentInfo", "defaultModal"])
      document.getElementById(id).style.display = "none";
    document.getElementById("inventory").style.filter = "brightness(100%)";
    resume();
  }
  // Discard obsolete decisions and visibly explain why no transaction occurred.
  function stale() {
    close();
    render();
    document.getElementById("item-status").textContent =
      "Your holdings changed. Select the relic again.";
  }
  // Apply one bound transaction inside the shared completed-transition coordinator.
  function execute(binding, action, rarity) {
    return run(
      /* Keep the mutation, derived stats and save in one engine transition. */ () => {
        const result = actions.execute(binding, action, rarity);
        if (result.ok) {
          sound(action);
          close();
          refresh();
        } else if (result.reason === "capacity")
          document.getElementById("item-feedback").textContent =
            "Your loadout is full: six relics maximum. Unequip a relic first.";
        else if (result.reason !== "stale")
          document.getElementById("item-status").textContent =
            "No matching relics to change.";
        return result;
      },
    );
  }
  // Rebuild both lists together so all rendered bindings share one revision.
  function render() {
    const player = getPlayer();
    if (!player) return;
    bind = actions.beginRender();
    for (const [collection, id] of [
      ["inventory", "playerInventory"],
      ["equipped", "playerEquipment"],
    ]) {
      const target = document.getElementById(id);
      if (!target) continue;
      target.replaceChildren();
      const items =
        collection === "inventory"
          ? player.inventory.equipment
          : player.equipped;
      if (!items.length)
        target.append(
          node(
            "p",
            collection === "inventory"
              ? "No recovered relics."
              : "Nothing equipped.",
          ),
        );
      for (const [index, raw] of items.entries()) {
        const item = checked(raw),
          binding = bind(collection, index);
        const control = button(
          undefined,
          "",
          /* Bind the rendered position, never search by duplicate content. */ () =>
            detail(item, collection, binding),
        );
        control.className = `relic-control ${getRarity(item.rarity).value.className}`;
        control.setAttribute(
          "aria-label",
          `${label(item)} Lv.${item.lvl} Tier ${item.tier}`,
        );
        control.append(
          icon(item, collection === "inventory" ? "inventory" : "equipped"),
        );
        if (collection === "inventory")
          control.append(node("span", label(item)));
        else control.title = label(item);
        const wrapper = node("div");
        wrapper.className = "items";
        wrapper.append(control);
        // Preserve legacy programmatic entry activation while keyboard uses the native button.
        wrapper.onclick =
          /* Delegate only direct wrapper clicks; bubbling must not open twice. */ (
            event,
          ) => {
            if (event.target === wrapper) control.click();
          };
        target.append(wrapper);
      }
    }
    const filter = document.getElementById("sell-rarity").value;
    document.getElementById("sell-all").disabled =
      !player.inventory.equipment.some(
        // A bulk sale is available only when its currently selected filter matches a holding.
        (raw) => filter === "All" || checked(raw).rarity === filter,
      );
    document.getElementById("unequip-all").disabled =
      player.equipped.length === 0;
    let status = document.getElementById("item-status");
    if (!status) {
      status = node("p", "", "item-status");
      status.setAttribute("role", "status");
      document.querySelector("#inventory .content").append(status);
    }
  }
  // Build a detail view without mutating the holding or resetting its binding.
  function detail(item, collection, binding) {
    pause();
    sound("open");
    const panel = document.getElementById("equipmentInfo");
    const content = node("div");
    content.className = "content relic-detail";
    const heading = node("h3");
    heading.append(icon(item, "detail"), node("span", label(item)));
    content.append(
      heading,
      node(
        "p",
        `Lv.${item.lvl} Tier ${item.tier} · ${item.category} · ${item.type}`,
      ),
    );
    const list = node("ul");
    const labels = {
      hp: "HP",
      atk: "Attack",
      def: "Defense",
      atkSpd: "Attack speed",
      vamp: "Vampirism",
      critRate: "Critical rate",
      critDmg: "Critical damage",
    };
    for (const stat of item.stats) {
      const [key, value] = Object.entries(stat)[0];
      list.append(
        node(
          "li",
          `${labels[key]} +${value}${["atkSpd", "vamp", "critRate", "critDmg"].includes(key) ? "%" : ""}`,
        ),
      );
    }
    const feedback = node("p", "", "item-feedback");
    feedback.setAttribute("role", "status");
    const controls = node("div");
    controls.className = "button-container";
    controls.append(
      button(
        "un-equip",
        collection === "inventory" ? "Equip" : "Unequip",
        /* Reuse the immutable view binding for capacity/staleness protection. */ () =>
          execute(binding, collection === "inventory" ? "equip" : "unequip"),
      ),
      button(
        "sell-equip",
        `Sell for ${item.value} ${setting.terms.gold}`,
        /* Show the exact proceeds before committing a sale. */ () =>
          confirm("sell", binding, item),
      ),
      button("close-item-info", "Close", close),
    );
    content.append(list, feedback, controls);
    panel.replaceChildren(content);
    panel.style.display = "flex";
    document.getElementById("inventory").style.filter = "brightness(50%)";
  }
  // Confirm one item or a bound collection; cancel returns to the unchanged detail.
  function confirm(action, binding, item, rarity = "All") {
    const panel = document.getElementById("defaultModal");
    const detailPanel = document.getElementById("equipmentInfo");
    detailPanel.style.display = "none";
    const content = node("div");
    content.className = "content relic-confirm";
    const p = node("p");
    if (item)
      p.append(
        icon(item, "sale"),
        document.createTextNode(
          `Sell ${label(item)} for ${item.value} ${setting.terms.gold}?`,
        ),
      );
    else if (action === "unequip-all")
      p.textContent = "Unequip all your relics?";
    else {
      let amount = 0;
      for (const raw of getPlayer().inventory.equipment) {
        const held = checked(raw);
        if (rarity === "All" || held.rarity === rarity) amount += held.value;
      }
      p.textContent = `Sell all ${rarity === "All" ? "" : rarity + " "}relics for ${amount} ${setting.terms.gold}?`;
    }
    const controls = node("div");
    controls.className = "button-container";
    const prefix = action === "unequip-all" ? "unequip" : "sell";
    controls.append(
      button(
        `${prefix}-confirm`,
        prefix === "sell" ? "Sell" : "Unequip",
        /* Commit exactly the collection shown by this decision. */ () =>
          execute(binding, action, rarity),
      ),
      button(
        `${prefix}-cancel`,
        "Cancel",
        /* Cancellation leaves holdings unchanged and restores the prior panel. */ () => {
          panel.style.display = "none";
          if (item) detailPanel.style.display = "flex";
          else close();
        },
      ),
    );
    content.append(p, controls);
    panel.replaceChildren(content);
    panel.style.display = "flex";
  }
  return {
    render,
    /** Open an explicitly requested legacy position using a fresh shared view. */
    show(collection, index) {
      render();
      const raw =
        collection === "inventory"
          ? getPlayer().inventory.equipment[index]
          : getPlayer().equipped[index];
      detail(checked(raw), collection, bind(collection, index));
    },
    /** Bind bulk confirmation at opening time; later holdings changes invalidate it. */
    confirmBulk(action, rarity = "All") {
      render();
      pause();
      confirm(
        action,
        bind(action === "unequip-all" ? "equipped" : "inventory"),
        null,
        rarity,
      );
    },
    /** Support direct engine bulk actions using the same validated transaction boundary. */
    bulk(action, rarity = "All") {
      render();
      return execute(
        bind(action === "unequip-all" ? "equipped" : "inventory"),
        action,
        rarity,
      );
    },
  };
}
