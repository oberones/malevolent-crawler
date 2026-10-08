// One lexical bridge owns the asynchronous module handoff; classic bindings stay authoritative.
let gameServices = null;
let initialization = null;
let controlsBound = false;
let gameReady = false;

/** Run a complete synchronous rule callback only after the validated bridge is ready. */
const runGameplay = (callback) => {
  if (!gameReady) return undefined;
  return gameServices.run(callback);
};

// Block even programmatically dispatched input before any legacy listeners execute.
const guardGameInput = (event) => {
  if (
    !gameReady &&
    event.target.id !== "boot-retry" &&
    !event.target.closest(".recovery-content")
  ) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
};
document.addEventListener("click", guardGameInput, true);
document.addEventListener("submit", guardGameInput, true);

// Keep status in existing loading/menu regions using text-only DOM construction.
const reportPersistence = (result) => {
  if (gameServices?.recovery) {
    gameServices.recovery.report(result);
    return;
  }
  let status = document.querySelector("#save-status");
  if (!status) {
    status = document.createElement("p");
    status.id = "save-status";
    status.setAttribute("role", "status");
    document.body.appendChild(status);
  }
  status.textContent =
    result.status === "saved"
      ? ""
      : "Progress is not saved. Keep this tab open to preserve your current session.";
};

// Failed loading preserves source bytes and offers a reload instead of resetting progress.
const showBootError = () => {
  if (gameServices?.recovery) {
    gameServices.recovery.showBoot();
    return;
  }
  const loader = document.querySelector("#loading");
  loader.replaceChildren();
  const status = document.createElement("p");
  status.id = "boot-status";
  status.setAttribute("role", "alert");
  status.textContent =
    "Unable to load your saved progress safely. Your existing data has not been replaced. Retry loading to continue.";
  const retry = document.createElement("button");
  retry.id = "boot-retry";
  retry.textContent = "Retry loading";
  // A fresh page also retries failed module-map entries without duplicate owners or listeners.
  retry.addEventListener("click", () => location.reload());
  loader.append(status, retry);
  loader.style.display = "flex";
};

/** Initialize services and authored symbols once; render boot failures before enabling controls. */
const initializeGame = () => {
  if (initialization) return initialization;
  document.querySelector("#name-input").disabled = true;
  // Deferral lets all classic declarations finish before injected accessors are used.
  initialization = Promise.resolve()
    .then(
      // Load services before exposing controls or touching browser storage.
      async () => {
        const { createGameServices } = await import("./app/services.mjs");
        gameServices = createGameServices({
          storage: window.localStorage,
          // Persistence timestamps never consume gameplay randomness.
          now: () => new Date(),
          eventTarget: window,
          // The engine retains sole ownership of all four runtime sections.
          capture: () => ({
            player,
            dungeon,
            enemy,
            volume,
          }),
          // Only a fully validated candidate can replace the live tuple.
          replace: (state) => {
            ({ player, dungeon, enemy, volume } = state);
          },
          // Import is a replacement boundary, not a gameplay transition or stat reset.
          cleanupImport: () => {
            bgmDungeon?.stop();
            bgmBattleMain?.stop();
            bgmBattleGuardian?.stop();
            bgmBattleBoss?.stop();
            bgmDungeon = null;
            combatBacklog.length = 0;
            combatSeconds = 0;
            enemyDead = false;
            playerDead = false;
          },
          report: reportPersistence,
          activateRecovery: activateGame,
          document,
          itemEffects: {
            run: runGameplay,
            refresh: playerLoadStats,
            // Inspection pauses exploration without mutating item data.
            pause: () => {
              dungeon.status.exploring = false;
            },
            resume: continueExploring,
            // Retain existing audio cues after successful transactions.
            sound: (action) => {
              const sounds = {
                open: sfxOpen,
                equip: sfxEquip,
                unequip: sfxUnequip,
                "unequip-all": sfxUnequip,
                sell: sfxSell,
                "sell-all": sfxSell,
              };
              sounds[action]?.play();
            },
          },
        });
        if (gameServices.status !== "ready") {
          showBootError();
          return;
        }
        if (document.readyState !== "complete") {
          // Preserve the original load boundary while also supporting late initialization.
          await new Promise(
            // Continue only after the document and local assets finish loading.
            (resolve) =>
              window.addEventListener("load", resolve, { once: true }),
          );
        }
        activateGame();
      },
    )
    .catch(
      // Storage getters and module failures share the non-destructive loading error path.
      () => {
        gameReady = false;
        showBootError();
      },
    );
  return initialization;
};
// Enable the existing entry controls after validated boot or explicit session recovery.
const activateGame = () => {
  gameServices.narrative.entry.initialize();
  gameServices.mountSymbols(document);
  gameReady = true;
  document.querySelector("#name-input").disabled = false;
  document.querySelector("#loading").style.display = "none";
  if (!controlsBound) {
    controlsBound = true;
    bindGameControls();
    dungeonActivity.addEventListener("click", dungeonStartPause);
  }
};
// Bind controls once after validated state is available.
const bindGameControls =
  /* Bind visible entry and game controls once after validated startup. */ () => {
    if (player === null) {
      runLoad("character-creation", "flex");
    } else {
      const target = document.querySelector("#title-screen");
      target.style.display = "flex";
    }

    // Activate entry only from the visible native button, including keyboard input.
    document.querySelector("#title-action").addEventListener(
      "click",
      /* Handle this control using the current view state and transition owner. */ function () {
        // Commit only after this complete engine action and its nested work succeed.
        return runGameplay(
          /* Keep this action and all nested mutations inside one save boundary. */ () => {
            if (!bgmDungeon) setVolume();
            sfxOpen.play();
            if (player.allocated) {
              enterDungeon();
            } else {
              allocationPopup();
            }
          },
        );
      },
    );

    // Prevent double-click zooming on mobile devices
    document.ondblclick =
      /* Handle this control using the current view state and transition owner. */ function (
        e,
      ) {
        // Commit only after this complete engine action and its nested work succeed.
        return runGameplay(
          /* Keep this action and all nested mutations inside one save boundary. */ () => {
            e.preventDefault();
          },
        );
      };

    // Submit Name
    document.querySelector("#name-submit").addEventListener(
      "submit",
      /* Handle this control using the current view state and transition owner. */ function (
        e,
      ) {
        // Commit only after this complete engine action and its nested work succeed.
        return runGameplay(
          /* Keep this action and all nested mutations inside one save boundary. */ () => {
            e.preventDefault();
            const playerName = document.querySelector("#name-input").value;

            var format = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/;
            if (format.test(playerName)) {
              gameServices.narrative.put("#alert", "entry.nameInvalid");
            } else {
              if (playerName.length < 3 || playerName.length > 15) {
                gameServices.narrative.put("#alert", "entry.nameInvalid");
              } else {
                player = {
                  name: playerName,
                  lvl: 1,
                  stats: {
                    hp: null,
                    hpMax: null,
                    atk: null,
                    def: null,
                    pen: null,
                    atkSpd: null,
                    vamp: null,
                    critRate: null,
                    critDmg: null,
                  },
                  baseStats: {
                    hp: 500,
                    atk: 100,
                    def: 50,
                    pen: 0,
                    atkSpd: 0.6,
                    vamp: 0,
                    critRate: 0,
                    critDmg: 50,
                  },
                  equippedStats: {
                    hp: 0,
                    atk: 0,
                    def: 0,
                    pen: 0,
                    atkSpd: 0,
                    vamp: 0,
                    critRate: 0,
                    critDmg: 0,
                    hpPct: 0,
                    atkPct: 0,
                    defPct: 0,
                    penPct: 0,
                  },
                  bonusStats: {
                    hp: 0,
                    atk: 0,
                    def: 0,
                    atkSpd: 0,
                    vamp: 0,
                    critRate: 0,
                    critDmg: 0,
                  },
                  exp: {
                    expCurr: 0,
                    expMax: 100,
                    expCurrLvl: 0,
                    expMaxLvl: 100,
                    lvlGained: 0,
                  },
                  inventory: {
                    consumables: [],
                    equipment: [],
                  },
                  equipped: [],
                  gold: 0,
                  playtime: 0,
                  kills: 0,
                  deaths: 0,
                  inCombat: false,
                };
                calculateStats();
                player.stats.hp = player.stats.hpMax;
                saveData();
                document.querySelector("#character-creation").style.display =
                  "none";
                runLoad("title-screen", "flex");
              }
            }
          },
        );
      },
    );

    // Capture the current collection when opening the bulk decision.
    document
      .querySelector("#unequip-all")
      .addEventListener(
        "click",
        /* Keep delayed confirmation bound to the shown holdings. */ () =>
          gameServices.items.confirmBulk("unequip-all"),
      );

    document.querySelector("#menu-btn").addEventListener(
      "click",
      /* Handle this control using the current view state and transition owner. */ function () {
        // Commit only after this complete engine action and its nested work succeed.
        return runGameplay(
          /* Keep this action and all nested mutations inside one save boundary. */ () => {
            closeInventory();

            dungeon.status.exploring = false;
            const dimDungeon = document.querySelector("#dungeon-main");
            dimDungeon.style.filter = "brightness(50%)";
            menuModalElement.style.display = "flex";

            // Menu tab
            menuModalElement.innerHTML = `
        <div class="content">
            <div class="content-head">
                <h3>Menu</h3>
                <button type="button" id="close-menu" aria-label="Close"><i class="fa fa-xmark" aria-hidden="true"></i></button>
            </div>
            <button id="player-menu"></button>
            <button id="stats">Current Run</button>
            <button id="volume-btn">Volume Settings</button>
            <button id="export-import">Export/Import Data</button>
            <button id="quit-run">Abandon</button>
        </div>`;

            document.querySelector("#player-menu").textContent = player.name;
            gameServices.narrative.entry.menu(
              menuModalElement,
              defaultModalElement,
            );
            const close = document.querySelector("#close-menu");
            const playerMenu = document.querySelector("#player-menu");
            const runMenu = document.querySelector("#stats");
            const quitRun = document.querySelector("#quit-run");
            const exportImport = document.querySelector("#export-import");
            const volumeSettings = document.querySelector("#volume-btn");

            // Player profile click function
            playerMenu.onclick =
              /* Handle this control using the current view state and transition owner. */ function () {
                // Commit only after this complete engine action and its nested work succeed.
                return runGameplay(
                  /* Keep this action and all nested mutations inside one save boundary. */ () => {
                    sfxOpen.play();
                    const playTime = new Date(player.playtime * 1000)
                      .toISOString()
                      .slice(11, 19);
                    menuModalElement.style.display = "none";
                    defaultModalElement.style.display = "flex";
                    defaultModalElement.innerHTML = `
            <div class="content" id="profile-tab">
                <div class="content-head">
                    <h3>Statistics</h3>
                    <button type="button" id="profile-close" aria-label="Close"><i class="fa fa-xmark" aria-hidden="true"></i></button>
                </div>
                <p id="profile-name"></p>
                <p>Kills: ${nFormatter(player.kills)}</p>
                <p>Deaths: ${nFormatter(player.deaths)}</p>
                <p>Playtime: ${playTime}</p>
            </div>`;
                    document.querySelector("#profile-name").textContent =
                      `${player.name} Lv.${player.lvl}`;
                    const profileTab = document.querySelector("#profile-tab");
                    profileTab.style.width = "15rem";
                    const profileClose =
                      document.querySelector("#profile-close");
                    profileClose.onclick =
                      /* Handle this control using the current view state and transition owner. */ function () {
                        // Commit only after this complete engine action and its nested work succeed.
                        return runGameplay(
                          /* Keep this action and all nested mutations inside one save boundary. */ () => {
                            sfxDecline.play();
                            defaultModalElement.style.display = "none";
                            defaultModalElement.innerHTML = "";
                            menuModalElement.style.display = "flex";
                          },
                        );
                      };
                  },
                );
              };

            // Dungeon run click function
            runMenu.onclick =
              /* Handle this control using the current view state and transition owner. */ function () {
                // Commit only after this complete engine action and its nested work succeed.
                return runGameplay(
                  /* Keep this action and all nested mutations inside one save boundary. */ () => {
                    sfxOpen.play();
                    const runTime = new Date(dungeon.statistics.runtime * 1000)
                      .toISOString()
                      .slice(11, 19);
                    menuModalElement.style.display = "none";
                    defaultModalElement.style.display = "flex";
                    defaultModalElement.innerHTML = `
            <div class="content" id="run-tab">
                <div class="content-head">
                    <h3>Current Run</h3>
                    <button type="button" id="run-close" aria-label="Close"><i class="fa fa-xmark" aria-hidden="true"></i></button>
                </div>
                <p id="run-name"></p>
                <p>Tide Offering ${player.blessing}</p>
                <p>Black Sounding ${Math.round((dungeon.settings.enemyScaling - 1) * 10)}</p>
                <p>Kills: ${nFormatter(dungeon.statistics.kills)}</p>
                <p>Runtime: ${runTime}</p>
            </div>`;
                    gameServices.narrative.put("#run-tab h3", "menu.run");
                    document.querySelector("#run-name").textContent =
                      `${player.name} Lv.${player.lvl} (${gameServices.narrative.entry.skillNames(player.skills)})`;
                    const runTab = document.querySelector("#run-tab");
                    runTab.style.width = "15rem";
                    const runClose = document.querySelector("#run-close");
                    runClose.onclick =
                      /* Handle this control using the current view state and transition owner. */ function () {
                        // Commit only after this complete engine action and its nested work succeed.
                        return runGameplay(
                          /* Keep this action and all nested mutations inside one save boundary. */ () => {
                            sfxDecline.play();
                            defaultModalElement.style.display = "none";
                            defaultModalElement.innerHTML = "";
                            menuModalElement.style.display = "flex";
                          },
                        );
                      };
                  },
                );
              };

            // Quit the current run
            quitRun.onclick =
              /* Handle this control using the current view state and transition owner. */ function () {
                // Commit only after this complete engine action and its nested work succeed.
                return runGameplay(
                  /* Keep this action and all nested mutations inside one save boundary. */ () => {
                    sfxOpen.play();
                    menuModalElement.style.display = "none";
                    defaultModalElement.style.display = "flex";
                    defaultModalElement.innerHTML = `
            <div class="content">
                <p>Do you want to abandon this run?</p>
                <div class="button-container">
                    <button id="quit-run">Abandon</button>
                    <button id="cancel-quit">Cancel</button>
                </div>
            </div>`;
                    gameServices.narrative.put(
                      "#defaultModal p",
                      "run.abandonConfirm",
                    );
                    const consequences = document.createElement("p");
                    consequences.textContent = gameServices.narrative.text(
                      "run.resetConsequences",
                    );
                    defaultModalElement
                      .querySelector(".content")
                      .append(consequences);
                    const quit = defaultModalElement.querySelector("#quit-run");
                    const cancel = document.querySelector("#cancel-quit");
                    quit.onclick =
                      /* Handle this control using the current view state and transition owner. */ function () {
                        // Commit only after this complete engine action and its nested work succeed.
                        return runGameplay(
                          /* Keep this action and all nested mutations inside one save boundary. */ () => {
                            sfxConfirm.play();
                            // Clear out everything, send the player back to meny and clear progress.
                            bgmDungeon.stop();
                            const dimDungeon =
                              document.querySelector("#dungeon-main");
                            dimDungeon.style.filter = "brightness(100%)";
                            dimDungeon.style.display = "none";
                            menuModalElement.style.display = "none";
                            menuModalElement.innerHTML = "";
                            defaultModalElement.style.display = "none";
                            defaultModalElement.innerHTML = "";

                            progressReset();
                            runLoad("title-screen", "flex");
                          },
                        );
                      };
                    cancel.onclick =
                      /* Handle this control using the current view state and transition owner. */ function () {
                        // Commit only after this complete engine action and its nested work succeed.
                        return runGameplay(
                          /* Keep this action and all nested mutations inside one save boundary. */ () => {
                            sfxDecline.play();
                            defaultModalElement.style.display = "none";
                            defaultModalElement.innerHTML = "";
                            menuModalElement.style.display = "flex";
                          },
                        );
                      };
                  },
                );
              };

            // Opens the volume settings
            volumeSettings.onclick =
              /* Handle this control using the current view state and transition owner. */ function () {
                // Commit only after this complete engine action and its nested work succeed.
                return runGameplay(
                  /* Keep this action and all nested mutations inside one save boundary. */ () => {
                    sfxOpen.play();

                    let master = volume.master * 100;
                    let bgm = volume.bgm * 100 * 2;
                    let sfx = volume.sfx * 100;
                    menuModalElement.style.display = "none";
                    defaultModalElement.style.display = "flex";
                    defaultModalElement.innerHTML = `
            <div class="content" id="volume-tab">
                <div class="content-head">
                    <h3>Volume</h3>
                    <button type="button" id="volume-close" aria-label="Close"><i class="fa fa-xmark" aria-hidden="true"></i></button>
                </div>
                <label id="master-label" for="master-volume">Master (${master}%)</label>
                <input type="range" id="master-volume" min="0" max="100" value="${master}">
                <label id="bgm-label" for="bgm-volume">BGM (${bgm}%)</label>
                <input type="range" id="bgm-volume" min="0" max="100" value="${bgm}">
                <label id="sfx-label" for="sfx-volume">SFX (${sfx}%)</label>
                <input type="range" id="sfx-volume" min="0" max="100" value="${sfx}">
                <button id="apply-volume">Apply</button>
            </div>`;
                    const masterVol = document.querySelector("#master-volume");
                    const bgmVol = document.querySelector("#bgm-volume");
                    const sfxVol = document.querySelector("#sfx-volume");
                    const applyVol = document.querySelector("#apply-volume");
                    const volumeTab = document.querySelector("#volume-tab");
                    volumeTab.style.width = "15rem";
                    const volumeClose = document.querySelector("#volume-close");
                    volumeClose.onclick =
                      /* Handle this control using the current view state and transition owner. */ function () {
                        // Commit only after this complete engine action and its nested work succeed.
                        return runGameplay(
                          /* Keep this action and all nested mutations inside one save boundary. */ () => {
                            sfxDecline.play();
                            defaultModalElement.style.display = "none";
                            defaultModalElement.innerHTML = "";
                            menuModalElement.style.display = "flex";
                          },
                        );
                      };

                    // Volume Control
                    masterVol.oninput =
                      /* Handle this control using the current view state and transition owner. */ function () {
                        // Commit only after this complete engine action and its nested work succeed.
                        return runGameplay(
                          /* Keep this action and all nested mutations inside one save boundary. */ () => {
                            master = this.value;
                            document.querySelector("#master-label").innerHTML =
                              `Master (${master}%)`;
                          },
                        );
                      };

                    bgmVol.oninput =
                      /* Handle this control using the current view state and transition owner. */ function () {
                        // Commit only after this complete engine action and its nested work succeed.
                        return runGameplay(
                          /* Keep this action and all nested mutations inside one save boundary. */ () => {
                            bgm = this.value;
                            document.querySelector("#bgm-label").innerHTML =
                              `BGM (${bgm}%)`;
                          },
                        );
                      };

                    sfxVol.oninput =
                      /* Handle this control using the current view state and transition owner. */ function () {
                        // Commit only after this complete engine action and its nested work succeed.
                        return runGameplay(
                          /* Keep this action and all nested mutations inside one save boundary. */ () => {
                            sfx = this.value;
                            document.querySelector("#sfx-label").innerHTML =
                              `SFX (${sfx}%)`;
                          },
                        );
                      };

                    applyVol.onclick =
                      /* Handle this control using the current view state and transition owner. */ function () {
                        // Commit only after this complete engine action and its nested work succeed.
                        return runGameplay(
                          /* Keep this action and all nested mutations inside one save boundary. */ () => {
                            volume.master = master / 100;
                            volume.bgm = bgm / 100 / 2;
                            volume.sfx = sfx / 100;
                            bgmDungeon.stop();
                            setVolume();
                            bgmDungeon.play();
                            saveData();
                          },
                        );
                      };
                  },
                );
              };

            // Export/Import Save Data
            exportImport.onclick =
              /* Handle this control using the current view state and transition owner. */ function () {
                // Commit only after this complete engine action and its nested work succeed.
                return runGameplay(
                  /* Keep this action and all nested mutations inside one save boundary. */ () => {
                    sfxOpen.play();
                    const exportedData = exportData();
                    menuModalElement.style.display = "none";
                    defaultModalElement.style.display = "flex";
                    defaultModalElement.innerHTML = `
            <div class="content" id="ei-tab">
                <div class="content-head">
                    <h3>Export/Import Data</h3>
                    <button type="button" id="ei-close" aria-label="Close"><i class="fa fa-xmark" aria-hidden="true"></i></button>
                </div>
                <h4>Export Data</h4>
                <input type="text" id="export-input" aria-label="Export data" autocomplete="off" value="${exportedData}" readonly>
                <button id="copy-export">Copy</button>
                <h4>Import Data</h4>
                <input type="text" id="import-input" aria-label="Import data" autocomplete="off">
                <button id="data-import">Import</button>
            </div>`;
                    const eiTab = document.querySelector("#ei-tab");
                    eiTab.style.width = "15rem";
                    const eiClose = document.querySelector("#ei-close");
                    const dataImport = document.querySelector("#data-import");
                    const importInput = document.querySelector("#import-input");
                    gameServices.exchange.bind(eiTab);
                    // Preview does not request a gameplay save or mutate the active character.
                    dataImport.onclick = () => importData(importInput.value);
                    eiClose.onclick =
                      /* Handle this control using the current view state and transition owner. */ function () {
                        // Commit only after this complete engine action and its nested work succeed.
                        return runGameplay(
                          /* Keep this action and all nested mutations inside one save boundary. */ () => {
                            sfxDecline.play();
                            defaultModalElement.style.display = "none";
                            defaultModalElement.innerHTML = "";
                            menuModalElement.style.display = "flex";
                          },
                        );
                      };
                  },
                );
              };

            // Close menu
            close.onclick =
              /* Handle this control using the current view state and transition owner. */ function () {
                // Commit only after this complete engine action and its nested work succeed.
                return runGameplay(
                  /* Keep this action and all nested mutations inside one save boundary. */ () => {
                    sfxDecline.play();
                    continueExploring();
                    menuModalElement.style.display = "none";
                    menuModalElement.innerHTML = "";
                    dimDungeon.style.filter = "brightness(100%)";
                  },
                );
              };
          },
        );
      },
    );
  };

// Loading Screen
const runLoad =
  /* Own the loader delay so character replacement cancels stale screen changes. */ (
    id,
    display,
  ) => {
    const loader = document.querySelector("#loading");
    loader.style.display = "flex";
    gameServices.lifecycle.timeout(
      /* Complete the scheduled visual update or next attack in its existing order. */ async () => {
        loader.style.display = "none";
        document.querySelector(`#${id}`).style.display = `${display}`;
      },
      1000,
    );
  };

// Start the game
const enterDungeon =
  /* Enter the run from validated memory without rereading raw storage. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        gameServices.lifecycle.invalidate();
        gameServices.combatLifecycle.invalidate();
        sfxConfirm.play();
        document.querySelector("#title-screen").style.display = "none";
        gameServices.continueEncounter({
          player,
          dungeon,
          rest: initialDungeonLoad,
          reset: progressReset,
          // Resume the saved identity directly without encounter generation or reward replay.
          resume() {
            showCombatInfo();
            startCombat(bgmBattleMain);
          },
        });
        runLoad("dungeon-main", "flex");
        if (!player.inCombat) {
          bgmDungeon.stop();
          bgmDungeon.play();
        }
        playerLoadStats();
      },
    );
  };

// Save all the data into local storage
const saveData =
  /* Request persistence inside the active completed-transition boundary. */ () => {
    return gameServices?.requestSave();
  };

// Calculate every player stat
const calculateStats =
  /* Recompute derived player stats with the preserved formulas and attack-speed cap. */ () => {
    const equipmentAtkSpd =
      player.baseStats.atkSpd * (player.equippedStats.atkSpd / 100);
    const playerHpBase = player.baseStats.hp;
    const playerAtkBase = player.baseStats.atk;
    const playerDefBase = player.baseStats.def;
    const playerAtkSpdBase = player.baseStats.atkSpd;
    const playerVampBase = player.baseStats.vamp;
    const playerCRateBase = player.baseStats.critRate;
    const playerCDmgBase = player.baseStats.critDmg;

    player.stats.hpMax = Math.round(
      playerHpBase +
        playerHpBase * (player.bonusStats.hp / 100) +
        player.equippedStats.hp,
    );
    player.stats.atk = Math.round(
      playerAtkBase +
        playerAtkBase * (player.bonusStats.atk / 100) +
        player.equippedStats.atk,
    );
    player.stats.def = Math.round(
      playerDefBase +
        playerDefBase * (player.bonusStats.def / 100) +
        player.equippedStats.def,
    );
    player.stats.atkSpd =
      playerAtkSpdBase +
      playerAtkSpdBase * (player.bonusStats.atkSpd / 100) +
      equipmentAtkSpd +
      equipmentAtkSpd * (player.equippedStats.atkSpd / 100);
    player.stats.vamp =
      playerVampBase + player.bonusStats.vamp + player.equippedStats.vamp;
    player.stats.critRate =
      playerCRateBase +
      player.bonusStats.critRate +
      player.equippedStats.critRate;
    player.stats.critDmg =
      playerCDmgBase + player.bonusStats.critDmg + player.equippedStats.critDmg;

    // Caps attack speed to 2.5
    if (player.stats.atkSpd > 2.5) {
      player.stats.atkSpd = 2.5;
    }
  };

// Resets the progress back to start
const progressReset =
  /* Reset run-specific values while retaining holdings and lifetime progress. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        gameServices.lifecycle.invalidate();
        gameServices.runLifecycle.invalidate();
        gameServices.combatLifecycle.invalidate();
        bgmDungeon?.stop();
        bgmBattleMain?.stop();
        bgmBattleGuardian?.stop();
        bgmBattleBoss?.stop();
        player.stats.hp = player.stats.hpMax;
        player.lvl = 1;
        player.blessing = 1;
        player.exp = {
          expCurr: 0,
          expMax: 100,
          expCurrLvl: 0,
          expMaxLvl: 100,
          lvlGained: 0,
        };
        player.bonusStats = {
          hp: 0,
          atk: 0,
          def: 0,
          atkSpd: 0,
          vamp: 0,
          critRate: 0,
          critDmg: 0,
        };
        player.skills = [];
        player.inCombat = false;
        dungeon.progress.floor = 1;
        dungeon.progress.room = 1;
        dungeon.statistics.kills = 0;
        dungeon.status = {
          exploring: false,
          paused: true,
          event: false,
        };
        dungeon.settings = {
          enemyBaseLvl: 1,
          enemyLvlGap: 5,
          enemyBaseStats: 1,
          enemyScaling: 1.1,
        };
        delete dungeon.enemyMultipliers;
        delete player.allocated;
        dungeon.backlog.length = 0;
        dungeon.action = 0;
        dungeon.statistics.runtime = 0;
        combatBacklog.length = 0;
        gameServices.narrative.put("#title-prompt", "run.restart");
        saveData();
      },
    );
  };

// Encode only validated character data; no dungeon/enemy/preferences enter the transport.
const exportData = () => {
  const result = gameServices.exportCharacter();
  if (!result.ok) throw new Error("Unable to export invalid character data.");
  return result.text;
};

// Preview safely without entering the gameplay wrapper or writing any save revision.
const importData = (text) => {
  const preview = gameServices.characterImport.preview(text);
  defaultModalElement.style.display = "none";
  confirmationModalElement.style.display = "flex";
  confirmationModalElement.innerHTML = `
    <div class="content">
      <p id="import-description"></p>
      <p id="import-status" role="alert"></p>
      <div class="button-container">
        <button id="import-btn">Replace character</button>
        <button id="import-session-only" hidden>Use for this session only</button>
        <button id="cancel-btn">Cancel</button>
      </div>
    </div>`;
  const description = document.querySelector("#import-description");
  const feedback = document.querySelector("#import-status");
  const confirm = document.querySelector("#import-btn");
  const session = document.querySelector("#import-session-only");
  description.textContent = preview.ok
    ? `Replace the current character with ${preview.player.name} and reset dungeon progress? Equipment, gold and lifetime progress are retained; level, experience, skills and allocation reset.`
    : "Unable to import this character. Cancel and check your export text.";
  if (!preview.ok) {
    confirm.hidden = true;
    feedback.textContent = `Invalid character data (${preview.issues[0].code}). Your current character is unchanged.`;
  }
  // Finish presentation only after the transaction has accepted the complete candidate.
  const finish = (sessionOnly) => {
    const result = gameServices.characterImport.confirm({ sessionOnly });
    if (!["saved", "session-only"].includes(result.status)) {
      feedback.textContent =
        "Import was not saved. Your current character is unchanged. Retry, cancel, or explicitly use the imported character for this session only.";
      confirm.textContent = "Retry import";
      session.hidden = false;
      return;
    }
    const region = document.querySelector("#dungeon-main");
    region.style.filter = "brightness(100%)";
    region.style.display = "none";
    combatPanel.style.display = "none";
    document.querySelector("#loading").style.display = "none";
    for (const panel of [
      menuModalElement,
      confirmationModalElement,
      defaultModalElement,
    ]) {
      panel.style.display = "none";
      panel.replaceChildren();
    }
    gameServices.narrative.put("#title-prompt", "run.restart");
    document.querySelector("#title-screen").style.display = "flex";
  };
  // A durable import is always attempted before exposing the unsaved-session option.
  confirm.onclick = () => finish(false);
  // This explicit choice preserves the durable save and marks subsequent play as unsaved.
  session.onclick = () => finish(true);
  // Cancelling touches only preview/presentation state and restores the exchange panel.
  document.querySelector("#cancel-btn").onclick = () => {
    gameServices.characterImport.cancel();
    confirmationModalElement.style.display = "none";
    confirmationModalElement.replaceChildren();
    defaultModalElement.style.display = "flex";
  };
};

// Player Stat Allocation
const allocationPopup =
  /* Present the original stat budget and passive skill choices. */ () => {
    let stats;
    let allocation = {
      hp: 5,
      atk: 5,
      def: 5,
      atkSpd: 5,
    };
    const updateStats =
      /* Derive preview values from the current allocation budget. */ () => {
        stats = {
          hp: 50 * allocation.hp,
          atk: 10 * allocation.atk,
          def: 10 * allocation.def,
          atkSpd: 0.4 + 0.02 * allocation.atkSpd,
        };
      };
    updateStats();
    let points = 20;
    const loadContent =
      /* Build allocation controls and catalog symbols without changing the preview state. */ function () {
        defaultModalElement.innerHTML = `
        <div class="content" id="allocate-stats">
            <div class="content-head">
                <h3></h3>
                <button type="button" id="allocate-close" aria-label="Close"><i class="fa fa-xmark" aria-hidden="true"></i></button>
            </div>
            <p id="allocation-help"></p>
            <div class="row">
                <p><span data-symbol-role="health" data-symbol-context="health/allocation"></span><span id="hpDisplay">HP: ${stats.hp}</span></p>
                <div class="row">
                    <button id="hpMin" aria-label="Decrease HP">-</button>
                    <span id="hpAllo">${allocation.hp}</span>
                    <button id="hpAdd" aria-label="Increase HP">+</button>
                </div>
            </div>
            <div class="row">
                <p><span data-symbol-role="attack" data-symbol-context="attack/allocation"></span><span id="atkDisplay">ATK: ${stats.atk}</span></p>
                <div class="row">
                    <button id="atkMin" aria-label="Decrease ATK">-</button>
                    <span id="atkAllo">${allocation.atk}</span>
                    <button id="atkAdd" aria-label="Increase ATK">+</button>
                </div>
            </div>
            <div class="row">
                <p><span data-symbol-role="defense" data-symbol-context="defense/allocation"></span><span id="defDisplay">DEF: ${stats.def}</span></p>
                <div class="row">
                    <button id="defMin" aria-label="Decrease DEF">-</button>
                    <span id="defAllo">${allocation.def}</span>
                    <button id="defAdd" aria-label="Increase DEF">+</button>
                </div>
            </div>
            <div class="row">
                <p><span data-symbol-role="attack-speed" data-symbol-context="attack-speed/allocation"></span><span id="atkSpdDisplay">ATK.SPD: ${stats.atkSpd}</span></p>
                <div class="row">
                    <button id="atkSpdMin" aria-label="Decrease ATK.SPD">-</button>
                    <span id="atkSpdAllo">${allocation.atkSpd}</span>
                    <button id="atkSpdAdd" aria-label="Increase ATK.SPD">+</button>
                </div>
            </div>
            <div class="row">
                <p id="alloPts">Stat Points: ${points}</p>
                <button id="allocate-reset">Reset</button>
            </div>
            <div class="row">
                <p>Passive</p>
                <select id="select-skill" aria-label="Passive skill">
                    <option value="Remnant Razor">Remnant Razor</option>
                    <option value="Titan's Will">Titan's Will</option>
                    <option value="Devastator">Devastator</option>
                    <option value="Blade Dance">Blade Dance</option>
                    <option value="Paladin's Heart">Paladin's Heart</option>
                    <option value="Aegis Thorns">Aegis Thorns</option>
                </select>
            </div>
            <div class="row primary-panel pad">
                <p id="skill-desc">Attacks deal extra 8% of enemies' current health on hit.</p>
            </div>
            <button id="allocate-confirm">Confirm</button>
        </div>`;
        gameServices.narrative.entry.allocation();
        gameServices.mountSymbols(defaultModalElement);
      };
    defaultModalElement.style.display = "flex";
    document.querySelector("#title-screen").style.filter = "brightness(50%)";
    loadContent();

    // Stat Allocation
    const handleStatButtons =
      /* Adjust one allocation within its minimum and remaining-point limits. */ (
        e,
      ) => {
        const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        if (e.includes("Add")) {
          const stat = e.split("Add")[0];
          if (points > 0) {
            sfxConfirm.play();
            allocation[stat]++;
            points--;
            updateStats();
            document.querySelector(`#${stat}Display`).innerHTML = `${stat
              .replace(/([A-Z])/g, " $1")
              .trim()
              .replace(/ /g, ".")
              .toUpperCase()}: ${stats[stat].toFixed(2).replace(rx, "$1")}`;
            document.querySelector(`#${stat}Allo`).innerHTML = allocation[stat];
            document.querySelector(`#alloPts`).innerHTML =
              `Stat Points: ${points}`;
          } else {
            sfxDeny.play();
          }
        } else if (e.includes("Min")) {
          const stat = e.split("Min")[0];
          if (allocation[stat] > 5) {
            sfxConfirm.play();
            allocation[stat]--;
            points++;
            updateStats();
            document.querySelector(`#${stat}Display`).innerHTML = `${stat
              .replace(/([A-Z])/g, " $1")
              .trim()
              .replace(/ /g, ".")
              .toUpperCase()}: ${stats[stat].toFixed(2).replace(rx, "$1")}`;
            document.querySelector(`#${stat}Allo`).innerHTML = allocation[stat];
            document.querySelector(`#alloPts`).innerHTML =
              `Stat Points: ${points}`;
          } else {
            sfxDeny.play();
          }
        }
      };
    document.querySelector("#hpAdd").onclick =
      /* Handle this control using the current view state and transition owner. */ function () {
        // Commit only after this complete engine action and its nested work succeed.
        return runGameplay(
          /* Keep this action and all nested mutations inside one save boundary. */ () => {
            handleStatButtons("hpAdd");
          },
        );
      };
    document.querySelector("#hpMin").onclick =
      /* Handle this control using the current view state and transition owner. */ function () {
        // Commit only after this complete engine action and its nested work succeed.
        return runGameplay(
          /* Keep this action and all nested mutations inside one save boundary. */ () => {
            handleStatButtons("hpMin");
          },
        );
      };
    document.querySelector("#atkAdd").onclick =
      /* Handle this control using the current view state and transition owner. */ function () {
        // Commit only after this complete engine action and its nested work succeed.
        return runGameplay(
          /* Keep this action and all nested mutations inside one save boundary. */ () => {
            handleStatButtons("atkAdd");
          },
        );
      };
    document.querySelector("#atkMin").onclick =
      /* Handle this control using the current view state and transition owner. */ function () {
        // Commit only after this complete engine action and its nested work succeed.
        return runGameplay(
          /* Keep this action and all nested mutations inside one save boundary. */ () => {
            handleStatButtons("atkMin");
          },
        );
      };
    document.querySelector("#defAdd").onclick =
      /* Handle this control using the current view state and transition owner. */ function () {
        // Commit only after this complete engine action and its nested work succeed.
        return runGameplay(
          /* Keep this action and all nested mutations inside one save boundary. */ () => {
            handleStatButtons("defAdd");
          },
        );
      };
    document.querySelector("#defMin").onclick =
      /* Handle this control using the current view state and transition owner. */ function () {
        // Commit only after this complete engine action and its nested work succeed.
        return runGameplay(
          /* Keep this action and all nested mutations inside one save boundary. */ () => {
            handleStatButtons("defMin");
          },
        );
      };
    document.querySelector("#atkSpdAdd").onclick =
      /* Handle this control using the current view state and transition owner. */ function () {
        // Commit only after this complete engine action and its nested work succeed.
        return runGameplay(
          /* Keep this action and all nested mutations inside one save boundary. */ () => {
            handleStatButtons("atkSpdAdd");
          },
        );
      };
    document.querySelector("#atkSpdMin").onclick =
      /* Handle this control using the current view state and transition owner. */ function () {
        // Commit only after this complete engine action and its nested work succeed.
        return runGameplay(
          /* Keep this action and all nested mutations inside one save boundary. */ () => {
            handleStatButtons("atkSpdMin");
          },
        );
      };

    // Passive skills
    const selectSkill = document.querySelector("#select-skill");
    selectSkill.onclick =
      /* Handle this control using the current view state and transition owner. */ function () {
        // Commit only after this complete engine action and its nested work succeed.
        return runGameplay(
          /* Keep this action and all nested mutations inside one save boundary. */ () => {
            sfxConfirm.play();
          },
        );
      };
    selectSkill.onchange =
      /* Handle this control using the current view state and transition owner. */ function () {
        // Commit only after this complete engine action and its nested work succeed.
        return runGameplay(
          /* Keep this action and all nested mutations inside one save boundary. */ () => {
            gameServices.narrative.entry.skill(selectSkill.value);
          },
        );
      };

    // Operation Buttons
    const confirm = document.querySelector("#allocate-confirm");
    const reset = document.querySelector("#allocate-reset");
    const close = document.querySelector("#allocate-close");
    let accepted = false;
    confirm.onclick =
      /* Accept this visible allocation once; discarded dialogs cannot mutate a later run. */ function () {
        if (accepted || confirm !== document.querySelector("#allocate-confirm"))
          return;
        accepted = true;
        // Commit only after this complete engine action and its nested work succeed.
        return runGameplay(
          /* Keep this action and all nested mutations inside one save boundary. */ () => {
            // Set allocated stats to player base stats
            player.baseStats = {
              hp: stats.hp,
              atk: stats.atk,
              def: stats.def,
              pen: 0,
              atkSpd: stats.atkSpd,
              vamp: 0,
              critRate: 0,
              critDmg: 50,
            };

            // Set player skill
            player = objectValidation(player);
            if (selectSkill.value === "Remnant Razor") {
              player.skills.push("Remnant Razor");
            }
            if (selectSkill.value === "Titan's Will") {
              player.skills.push("Titan's Will");
            }
            if (selectSkill.value === "Devastator") {
              player.skills.push("Devastator");
              player.baseStats.atkSpd =
                player.baseStats.atkSpd - (30 * player.baseStats.atkSpd) / 100;
            }
            if (selectSkill.value === "Rampager") {
              player.skills.push("Rampager");
            }
            if (selectSkill.value === "Blade Dance") {
              player.skills.push("Blade Dance");
            }
            if (selectSkill.value === "Paladin's Heart") {
              player.skills.push("Paladin's Heart");
            }
            if (selectSkill.value === "Aegis Thorns") {
              player.skills.push("Aegis Thorns");
            }

            // Proceed to dungeon
            player.allocated = true;
            enterDungeon();
            player.stats.hp = player.stats.hpMax;
            playerLoadStats();
            defaultModalElement.style.display = "none";
            defaultModalElement.innerHTML = "";
            document.querySelector("#title-screen").style.filter =
              "brightness(100%)";
          },
        );
      };
    reset.onclick =
      /* Handle this control using the current view state and transition owner. */ function () {
        // Commit only after this complete engine action and its nested work succeed.
        return runGameplay(
          /* Keep this action and all nested mutations inside one save boundary. */ () => {
            sfxDecline.play();
            allocation = {
              hp: 5,
              atk: 5,
              def: 5,
              atkSpd: 5,
            };
            points = 20;
            updateStats();

            // Display Reset
            document.querySelector(`#hpDisplay`).innerHTML = `HP: ${stats.hp}`;
            document.querySelector(`#atkDisplay`).innerHTML =
              `ATK: ${stats.atk}`;
            document.querySelector(`#defDisplay`).innerHTML =
              `DEF: ${stats.def}`;
            document.querySelector(`#atkSpdDisplay`).innerHTML =
              `ATK.SPD: ${stats.atkSpd}`;
            document.querySelector(`#hpAllo`).innerHTML = allocation.hp;
            document.querySelector(`#atkAllo`).innerHTML = allocation.atk;
            document.querySelector(`#defAllo`).innerHTML = allocation.def;
            document.querySelector(`#atkSpdAllo`).innerHTML = allocation.atkSpd;
            document.querySelector(`#alloPts`).innerHTML =
              `Stat Points: ${points}`;
          },
        );
      };
    close.onclick =
      /* Handle this control using the current view state and transition owner. */ function () {
        // Commit only after this complete engine action and its nested work succeed.
        return runGameplay(
          /* Keep this action and all nested mutations inside one save boundary. */ () => {
            sfxDecline.play();
            defaultModalElement.style.display = "none";
            defaultModalElement.innerHTML = "";
            document.querySelector("#title-screen").style.filter =
              "brightness(100%)";
          },
        );
      };
  };

/** Return defaulted player fields without mutation, storage or gameplay randomness. */
const objectValidation = (candidate) => ({
  ...candidate,
  skills: candidate.skills ?? [],
  tempStats: candidate.tempStats ?? { atk: 0, atkSpd: 0 },
});

initializeGame();
