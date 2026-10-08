import test from "node:test";
import assert from "node:assert/strict";
import { messageText } from "../../assets/js/content/messages.mjs";
import {
  getEncounter,
  getVariant,
  getRelic,
  getSymbol,
} from "../../assets/js/content/catalog.mjs";

// Check the player's core navigation vocabulary through the public message renderer.
test("visible navigation addresses a relic seeker and describes descents", () => {
  const expected = {
    "entry.name": "What is your name, relic seeker?",
    "entry.begin": "Begin the descent",
    "entry.allocation": "Prepare for Descent",
    "run.restart": "Prepare another descent",
    "run.exploring": "Exploring...",
    "menu.title": "Expedition Journal",
    "help.title": "Relic Seeker’s Field Notes",
    "event.floor": "You descend deeper into the observatory.",
    "event.fled": "You follow the guide rope back and escape.",
    "event.fleeFailed": "The guide rope draws taut. You fail to escape!",
    "event.ignored": "You leave it undisturbed and continue exploring.",
    "event.nothing0": "Your search reveals nothing but wet slate.",
    "event.nothing4": "Only silence answers you in this chamber.",
  };
  for (const [id, text] of Object.entries(expected)) {
    assert.equal(messageText({ id, params: {} }), text, id);
  }
  assert.match(
    messageText({ id: "entry.introduction", params: {} }),
    /a relic seeker/,
  );
  assert.match(
    messageText({ id: "combat.defeat", params: {} }),
    /^Your descent ends here\./,
  );
  assert.match(
    messageText({ id: "about.description", params: {} }),
    /outlast each descent/,
  );
});

// Existing history keys must render the new curse label without changing interpolation.
test("stable curse message keys display Deepening Curse", () => {
  for (const [id, cost] of [
    ["event.blackSounding", 25],
    ["history.blackSounding", "25.00"],
  ]) {
    assert.equal(
      messageText({ id, params: { cost, level: 2 } }),
      `A Deepening Curse ring stirs. Offer ${cost} Quay Marks? Enemies become stronger and loot quality improves. Deepening Curse 2.`,
    );
  }
  assert.equal(
    messageText({ id: "event.curseGain", params: { before: 1, after: 2 } }),
    "The Deepening Curse strengthens enemies and improves loot quality. Deepening Curse 1 → 2.",
  );
  assert.match(
    messageText({ id: "help.progression", params: {} }),
    /Deepening Curses strengthen enemies/,
  );
});

// Renamed displays must still resolve by their original saved catalog identities.
test("catalog display renames preserve identities and selected sounding terms", () => {
  assert.equal(
    getEncounter("the-last-sounding").value.displayName,
    "The Final Descent",
  );
  assert.equal(
    getVariant("the-last-sounding-portrait").value.displayName,
    "The Final Descent",
  );
  assert.equal(getRelic("sounding-maul").value.displayName, "Tolling Maul");
  assert.match(getRelic("sounding-maul").value.description, /sounding bell/);
  assert.equal(
    getSymbol("relic-hammer").value.accessibleLabel,
    "Tolling Maul (Hammer)",
  );
  assert.equal(
    getEncounter("sounding-vessel").value.displayName,
    "Sounding Vessel",
  );
  assert.equal(
    getVariant("sounding-vessel-bowl").value.displayName,
    "Sounding Vessel — Bowl",
  );
  assert.match(getVariant("sounding-vessel-bowl").value.alt, /sounding bowl/);
  assert.equal(
    getVariant("sounding-vessel-chimes").value.displayName,
    "Sounding Vessel — Chimes",
  );
  assert.match(
    getEncounter("the-dredge-foreman").value.description,
    /dredging hook/,
  );
});
