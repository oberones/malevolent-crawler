import { freezeContent } from "./immutable.mjs";

// Authored identity data; numerical rules and selection remain in the classic engine.
export const setting = freezeContent({
  id: "bell-beneath-brine",
  contentVersion: 1,
  title: "The Bell Beneath Brine",
  premise:
    "At the coastal settlement of Veyr Quay, each receding tide reveals another stair into a drowned observatory. A bell below the foundations sounds only inside the listener, and the things that answer remember streets the town has never built.",
  playerRole:
    "A sounding keeper who descends to chart the impossible depths and recover the quay's scattered seals.",
  location: "Veyr Quay and the drowned observatory beneath its breakwater.",
  terms: {
    dungeon: "Drowned Observatory",
    floor: "Descent",
    room: "Chamber",
    guardian: "Threshold Keeper",
    boss: "Deep Presence",
    blessing: "Tide Offering",
    curse: "Black Sounding",
    gold: "Quay Marks",
    level: "Attunement",
    relic: "Recovered Relic",
  },
  motifs: [
    "Unstruck bells and listening cavities",
    "Tide marks on impossible architecture",
    "Nacre, verdigris, wet slate and pitted bronze",
    "Sealed vessels, knots, sounding lines and broken tidal rings",
  ],
  palette: [
    "Deep ink #111923",
    "Wet slate #43565F",
    "Nacre #DED8C6",
    "Verdigris #60968B",
    "Old bronze #AA8251",
    "Restrained rust red #8A4548",
  ],
  namingRules: [
    "Use shore trades, instruments and physical anomalies; avoid borrowed mythos names.",
    "Give every identity a distinct silhouette and concrete noun; reserve ceremonial titles for major presences.",
    "Keep costs, effects, warnings and neutral stat/action labels explicit; never rename player-authored text.",
  ],
  horrorBoundary:
    "Grotesque mutation, exposed anatomy and restrained blood are permitted; explicit mutilation and graphic gore are excluded.",
  copySurfaces: [
    "Title and browser title",
    "Introduction and character creation",
    "Allocation and skills",
    "Exploration events and every choice/outcome",
    "Combat names, alt text and logs",
    "Rewards and item details",
    "Level-up choices and rerolls",
    "Death, abandonment and restart",
    "Inventory, equipment and sale confirmations",
    "Menus, save, import and recovery feedback",
    "Help and game description",
    "Credits",
  ],
  creditsPolicy:
    "Retain accurate existing author, audio, font and library credits. Credit generated replacement art only when actual generation provenance exists. Do not claim finished assets or use borrowed characters.",
});
