# Contract: Persistence, Character Exchange, and Recovery

Applies to FR-006/012/013, QR-003, and SC-005. [Data model](../data-model.md) defines field shapes. All entry points accept explicit storage/clock dependencies, return typed results, and document errors in JSDoc. These are planned interfaces, not existing exports.

## Local read and migration

| Source                                  | Recognition                                                                                        | Required outcome                                                                                |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `malevolentCrawler.save.v1`             | Supported envelope and all four validated state sections                                           | Load that complete revision; never combine sections from another revision                       |
| `malevolentCrawler.save.previous.v1`    | Prior validated snapshot                                                                           | Offer explicit recovery after canonical failure; never silently replace current data            |
| Four legacy keys                        | Canonical key absent; player/dungeon/enemy/volume parse and satisfy stage-specific schemas         | Construct v1 candidate without gameplay RNG, reset, stat reroll, or reward application          |
| All player save sources absent          | Fresh user; preferences may exist independently                                                    | Show character creation; use valid preferences or documented defaults                           |
| Canonical malformed/unsupported         | Invalid envelope or unsupported version                                                            | Stop autosave, retain raw bytes, show recovery; do not silently fall back to stale legacy state |
| Partial/unsafe/interrupted legacy tuple | Required run/active-enemy record absent, malformed nested item, or incompatible cross-record state | Preserve each raw record and current memory; explain error and offer recovery                   |

A legitimate early/unallocated player may use the known initial dungeon/idle-enemy defaults where no run existed; missing active-run data cannot be invented. Defaults are fixture-backed. Recognized old creature/image/category/skill values map through allowlisted catalogs. Both alternate illustrations remain distinguishable without drawing randomness.

Proposed services:

- `readLocalState()` returns `{status: 'empty'|'ready'|'recovery', candidate?, source?, issues[], recoveryData?}`.
- `validateCandidate(input, sourceKind)` returns a complete accepted candidate or structured issues; it does not write or mutate live objects.
- `commitSnapshot(candidate)` returns `{status: 'saved'|'unsaved'|'conflict', revision?, issue?}`; callers must not report success for unsaved data.
- `decodeCharacter(text)` / `encodeCharacter(player)` implement character exchange below.
- `migrateLegacyMessages(backlog, catalogs)` maps recognized templates safely without modifying player-authored strings.

## Commit protocol

1. Commit only completed gameplay transitions. Default validation is pure; defer/coalesce nested save requests until the complete attack, reward, death, import, or reset transition finishes. Then validate and serialize the complete candidate before any write. A validation failure changes neither storage nor runtime state.
2. Read the canonical record defensively. If valid, write its exact bytes to the previous-good key. If this backup write fails, abort the new durable commit; the canonical record is unchanged.
3. Write the complete new envelope to the canonical key in one `setItem`. A thrown write leaves the old canonical record available. Do not delete or rewrite legacy source keys.
4. Only report persistence after the write succeeds. Normal gameplay may continue in memory after failure with a persistent visible unsaved indicator and recovery export. Migration/import never presents a partial candidate as saved.
5. On quota/denied access, expose Retry and recovery download/copy. Do not wipe previous saves to make room. If clipboard is unavailable, keep selectable recovery text or a local download. Errors identify source/field/reason without logging full player data.

Failure assertions distinguish each write stage. For an isolated commit starting with valid canonical bytes `C`, previous-good bytes `P`, and candidate bytes `N`, require:

| Commit outcome                                                                                   | Canonical bytes afterward | Previous-good bytes afterward |
| ------------------------------------------------------------------------------------------------ | ------------------------- | ----------------------------- |
| Validation/serialization fails, canonical read throws, or revision conflict aborts before backup | `C`                       | `P`                           |
| Backup write throws; canonical write is not attempted                                            | `C`                       | `P`                           |
| Backup succeeds, then canonical write throws                                                     | `C`                       | `C`                           |
| Both writes succeed                                                                              | `N`                       | `C`                           |

In every row, legacy source bytes remain unchanged. A successful backup is allowed to advance even when the subsequent canonical write fails; return `unsaved`, retain the canonical save and in-memory progress, and do not attempt rollback writes. With no canonical record, skip backup; a failed first canonical write leaves it absent and any existing previous-good bytes unchanged. Commit failure does not replace live state with an import/migration candidate; the explicit session-only choice remains separate. These assertions assume no concurrent external writer; revision conflicts follow the single-tab policy below.

This is single-key atomic replacement, not a transactional database or cross-tab lock. Listen for foreign canonical storage changes; suspend this tab's autosave and offer reload of the newer save or export of this tab's in-memory state. Recheck the last observed revision before a write. Do not claim race-free concurrent editing; the supported gameplay owner is one active tab. Tests exercise conflicts and ensure the UI never silently merges different encounters.

## Character export/import

Legacy import: strict Base64 decoding followed by the historical Latin-1 `atob` JSON interpretation, then full player validation. New export: `MC1:` followed by Base64 of UTF-8 JSON for `{format:'malevolent-crawler-character',version:1,player}`. Prefixes for unsupported versions fail explicitly. New exports preserve Unicode names; character text is not executable markup. Reject malformed Base64, bad UTF-8, unsupported shapes, prototype-pollution keys, non-finite values, oversized/deep input, and unsafe domain references. No fetch or URL import exists.

Character validation does not require a companion enemy even when the exported player carries an old combat flag; confirmation applies the character-import reset before committing. Preview/validation changes nothing. Confirmation states that the current character will be replaced and dungeon progress reset. Build the reset candidate off to the side, persist it, and then replace live state/cleanup existing timers. If persistence fails, retain the current live session and offer retry, cancel, or explicit use of the candidate for this session only with an unsaved indicator. Cancellation is read-only. Copy success appears only after the clipboard promise resolves.

| Value                                                     | Local continuation                                             | Confirmed character import / established run reset                                                           |
| --------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Player name, equipment/inventory, gold, lifetime counters | Preserve                                                       | Preserve imported character values; death/abandonment preserve existing values                               |
| Audio preferences                                         | Preserve                                                       | Retain current local preferences                                                                             |
| Level, blessing, EXP, bonus stats, skills, allocation     | Preserve                                                       | Existing reset: level/blessing 1, initial EXP, zero bonus stats, no skills, remove allocation                |
| Base stats and temporary stat fields                      | Preserve                                                       | Match existing reset exactly; next allocation handles established initialization                             |
| Dungeon floor/room/action/backlog/run counters/settings   | Preserve values; enter resting                                 | Existing reset to floor/room 1, zero action/history/run counters, initial settings, remove enemy multipliers |
| Active enemy/HP/variant/rewards                           | Preserve without regeneration                                  | Character export does not restore an encounter                                                               |
| Combat timer phase / elapsed / backlog                    | Not persisted by legacy format; start fresh full attack delays | No restoration                                                                                               |

Do not invoke guardian entry when resuming; its room/floor change already occurred. Terminal HP combined with active combat or another inconsistent historical tuple must enter recovery rather than guessing whether to award loot. An inactive defeated enemy with zero HP is a normal settled victory; an inactive player with zero HP follows the established death/reset path without reward replay. Claim is a presentation transition after reward application.

## Recovery and acceptance

Recognized logs become safe themed records; unknown history remains in raw recovery data with a neutral visible notice. The optional v1 envelope `historyRecovery` map carries original changed entries across subsequent commits and backup rotation. It is bounded by the same JSON budgets, kept outside engine state, and exposed only as selectable inert text through the history notice. Historical abbreviated amounts retain their displayed precision; a reward panel does not invent missing sale values or regenerate an inventory item. Import/storage failure feedback is text plus actionable controls, usable without sound. Never force a destructive reset as the only unannounced outcome.

Required fixtures include early/resting/active normal/guardian/special boss/mimic saves; both image variants; six equipped objects plus encoded inventory strings; optional stats and fractional enemy EXP; full import reset/retention; each read/write exception; malformed nested JSON; unsupported versions/identities; hostile names/logs/paths; stale-tab writes; oversized input; normal inactive victory/death saves; interruptions at former mid-attack and mid-reward save sites; and repeated migration/entry/teardown. Assertions include unchanged raw sources, no duplicate rewards, zero migration RNG calls, safe DOM output, and recoverable progress.
