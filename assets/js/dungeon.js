let dungeonTimer;
let playTimer;
const dungeonActivity = document.querySelector("#dungeonActivity");
const dungeonAction = document.querySelector("#dungeonAction");
const dungeonTime = document.querySelector("#dungeonTime");
const floorCount = document.querySelector("#floorCount");
const roomCount = document.querySelector("#roomCount");

// Reassigned by the validated bridge in main.js; lexical ownership stays here.
// eslint-disable-next-line prefer-const
let dungeon = {
  rating: 500,
  grade: "E",
  progress: {
    floor: 1,
    room: 1,
    floorLimit: 100,
    roomLimit: 5,
  },
  settings: {
    enemyBaseLvl: 1,
    enemyLvlGap: 5,
    enemyBaseStats: 1,
    enemyScaling: 1.1,
  },
  status: {
    exploring: false,
    paused: true,
    event: false,
  },
  statistics: {
    kills: 0,
    runtime: 0,
  },
  backlog: [],
  action: 0,
};

// ===== Dungeon Setup =====
// Enables start and pause on button click
// Sets up the initial dungeon
const initialDungeonLoad =
  /* Prepare exploration timers and resting controls from validated runtime state. */ () => {
    dungeon.status = { exploring: false, paused: true, event: player.inCombat };
    updateDungeonLog();
    loadDungeonProgress();
    dungeonTime.innerHTML = new Date(dungeon.statistics.runtime * 1000)
      .toISOString()
      .slice(11, 19);
    dungeonAction.innerHTML = "Resting...";
    dungeonActivity.innerHTML = "Explore";
    dungeonTime.innerHTML = "00:00:00";
    dungeonTimer = setInterval(dungeonEvent, 1000);
    playTimer = setInterval(dungeonCounter, 1000);
  };

// Start and Pause Functionality
const dungeonStartPause =
  /* Toggle exploration while retaining the current room and event. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        if (!dungeon.status.paused) {
          sfxPause.play();

          dungeonAction.innerHTML = "Resting...";
          dungeonActivity.innerHTML = "Explore";
          dungeon.status.exploring = false;
          dungeon.status.paused = true;
        } else {
          sfxUnpause.play();

          dungeonAction.innerHTML = "Exploring...";
          dungeonActivity.innerHTML = "Pause";
          dungeon.status.exploring = true;
          dungeon.status.paused = false;
        }
      },
    );
  };

// Counts the total time for the current run and total playtime
const dungeonCounter =
  /* Advance lifetime and run time together before saving. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        player.playtime++;
        dungeon.statistics.runtime++;
        dungeonTime.innerHTML = new Date(dungeon.statistics.runtime * 1000)
          .toISOString()
          .slice(11, 19);
        saveData();
      },
    );
  };

// Loads the floor and room count
const loadDungeonProgress =
  /* Apply the original room rollover and refresh progress labels. */ () => {
    if (dungeon.progress.room > dungeon.progress.roomLimit) {
      dungeon.progress.room = 1;
      dungeon.progress.floor++;
    }
    floorCount.innerHTML = `Floor ${dungeon.progress.floor}`;
    roomCount.innerHTML = `Room ${dungeon.progress.room}`;
  };

// ========== Events in the Dungeon ==========
const dungeonEvent =
  /* Resolve one exploration tick using the preserved event draw order. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        if (dungeon.status.exploring && !dungeon.status.event) {
          dungeon.action++;
          let choices;
          let eventRoll;
          let eventTypes = [
            "blessing",
            "curse",
            "treasure",
            "enemy",
            "enemy",
            "nothing",
            "nothing",
            "nothing",
            "nothing",
            "monarch",
          ];
          if (dungeon.action > 2 && dungeon.action < 6) {
            eventTypes.push("nextroom");
          } else if (dungeon.action > 5) {
            eventTypes = ["nextroom"];
          }
          const event =
            eventTypes[Math.floor(Math.random() * eventTypes.length)];

          switch (event) {
            case "nextroom":
              dungeon.status.event = true;
              choices = `
                    <div class="decision-panel">
                        <button id="choice1">Enter</button>
                        <button id="choice2">Ignore</button>
                    </div>`;
              if (dungeon.progress.room === dungeon.progress.roomLimit) {
                addDungeonLog(
                  `<span class="Heirloom">You found the door to the boss room.</span>`,
                  choices,
                );
              } else {
                addDungeonLog("You found a door.", choices);
              }
              document.querySelector("#choice1").onclick =
                /* Handle this control using the current view state and transition owner. */ function () {
                  // Commit only after this complete engine action and its nested work succeed.
                  return runGameplay(
                    /* Keep this action and all nested mutations inside one save boundary. */ () => {
                      sfxConfirm.play();
                      if (
                        dungeon.progress.room === dungeon.progress.roomLimit
                      ) {
                        guardianBattle();
                      } else {
                        eventRoll = randomizeNum(1, 3);
                        if (eventRoll === 1) {
                          incrementRoom();
                          mimicBattle("door");
                          addDungeonLog("You moved to the next floor.");
                        } else if (eventRoll === 2) {
                          incrementRoom();
                          choices = `
                                <div class="decision-panel">
                                    <button id="choice1">Open the chest</button>
                                    <button id="choice2">Ignore</button>
                                </div>`;
                          addDungeonLog(
                            `You moved to the next room and found a treasure chamber. There is a <i class="fa fa-toolbox"></i>Chest inside.`,
                            choices,
                          );
                          document.querySelector("#choice1").onclick =
                            /* Handle this control using the current view state and transition owner. */ function () {
                              // Commit only after this complete engine action and its nested work succeed.
                              return runGameplay(
                                /* Keep this action and all nested mutations inside one save boundary. */ () => {
                                  chestEvent();
                                },
                              );
                            };
                          document.querySelector("#choice2").onclick =
                            /* Handle this control using the current view state and transition owner. */ function () {
                              // Commit only after this complete engine action and its nested work succeed.
                              return runGameplay(
                                /* Keep this action and all nested mutations inside one save boundary. */ () => {
                                  dungeon.action = 0;
                                  ignoreEvent();
                                },
                              );
                            };
                        } else {
                          dungeon.status.event = false;
                          incrementRoom();
                          addDungeonLog("You moved to the next room.");
                        }
                      }
                    },
                  );
                };
              document.querySelector("#choice2").onclick =
                /* Handle this control using the current view state and transition owner. */ function () {
                  // Commit only after this complete engine action and its nested work succeed.
                  return runGameplay(
                    /* Keep this action and all nested mutations inside one save boundary. */ () => {
                      dungeon.action = 0;
                      ignoreEvent();
                    },
                  );
                };
              break;
            case "treasure":
              dungeon.status.event = true;
              choices = `
                    <div class="decision-panel">
                        <button id="choice1">Open the chest</button>
                        <button id="choice2">Ignore</button>
                    </div>`;
              addDungeonLog(
                `You found a treasure chamber. There is a <i class="fa fa-toolbox"></i>Chest inside.`,
                choices,
              );
              document.querySelector("#choice1").onclick =
                /* Handle this control using the current view state and transition owner. */ function () {
                  // Commit only after this complete engine action and its nested work succeed.
                  return runGameplay(
                    /* Keep this action and all nested mutations inside one save boundary. */ () => {
                      chestEvent();
                    },
                  );
                };
              document.querySelector("#choice2").onclick =
                /* Handle this control using the current view state and transition owner. */ function () {
                  // Commit only after this complete engine action and its nested work succeed.
                  return runGameplay(
                    /* Keep this action and all nested mutations inside one save boundary. */ () => {
                      ignoreEvent();
                    },
                  );
                };
              break;
            case "nothing":
              nothingEvent();
              break;
            case "enemy":
              dungeon.status.event = true;
              choices = `
                    <div class="decision-panel">
                        <button id="choice1">Engage</button>
                        <button id="choice2">Flee</button>
                    </div>`;
              generateRandomEnemy();
              addDungeonLog(`You encountered ${enemy.name}.`, choices);
              player.inCombat = true;
              document.querySelector("#choice1").onclick =
                /* Handle this control using the current view state and transition owner. */ function () {
                  // Commit only after this complete engine action and its nested work succeed.
                  return runGameplay(
                    /* Keep this action and all nested mutations inside one save boundary. */ () => {
                      engageBattle();
                    },
                  );
                };
              document.querySelector("#choice2").onclick =
                /* Handle this control using the current view state and transition owner. */ function () {
                  // Commit only after this complete engine action and its nested work succeed.
                  return runGameplay(
                    /* Keep this action and all nested mutations inside one save boundary. */ () => {
                      fleeBattle();
                    },
                  );
                };
              break;
            case "blessing":
              eventRoll = randomizeNum(1, 2);
              if (eventRoll === 1) {
                dungeon.status.event = true;
                blessingValidation();
                const cost =
                  player.blessing * (500 * (player.blessing * 0.5)) + 750;
                choices = `
                        <div class="decision-panel">
                            <button id="choice1">Offer</button>
                            <button id="choice2">Ignore</button>
                        </div>`;
                addDungeonLog(
                  `<span class="Legendary">You found a Statue of Blessing. Do you want to offer <i class="fas fa-coins" style="color: #FFD700;"></i><span class="Common">${nFormatter(cost)}</span> to gain blessings? (Blessing Lv.${player.blessing})</span>`,
                  choices,
                );
                document.querySelector("#choice1").onclick =
                  /* Handle this control using the current view state and transition owner. */ function () {
                    // Commit only after this complete engine action and its nested work succeed.
                    return runGameplay(
                      /* Keep this action and all nested mutations inside one save boundary. */ () => {
                        if (player.gold < cost) {
                          sfxDeny.play();
                          addDungeonLog("You don't have enough gold.");
                        } else {
                          player.gold -= cost;
                          sfxConfirm.play();
                          statBlessing();
                        }
                        dungeon.status.event = false;
                      },
                    );
                  };
                document.querySelector("#choice2").onclick =
                  /* Handle this control using the current view state and transition owner. */ function () {
                    // Commit only after this complete engine action and its nested work succeed.
                    return runGameplay(
                      /* Keep this action and all nested mutations inside one save boundary. */ () => {
                        ignoreEvent();
                      },
                    );
                  };
              } else {
                nothingEvent();
              }
              break;
            case "curse":
              eventRoll = randomizeNum(1, 3);
              if (eventRoll === 1) {
                dungeon.status.event = true;
                const curseLvl = Math.round(
                  (dungeon.settings.enemyScaling - 1) * 10,
                );
                const cost = curseLvl * (10000 * (curseLvl * 0.5)) + 5000;
                choices = `
                            <div class="decision-panel">
                                <button id="choice1">Offer</button>
                                <button id="choice2">Ignore</button>
                            </div>`;
                addDungeonLog(
                  `<span class="Heirloom">You found a Cursed Totem. Do you want to offer <i class="fas fa-coins" style="color: #FFD700;"></i><span class="Common">${nFormatter(cost)}</span>? This will strengthen the monsters but will also improve the loot quality. (Curse Lv.${curseLvl})</span>`,
                  choices,
                );
                document.querySelector("#choice1").onclick =
                  /* Handle this control using the current view state and transition owner. */ function () {
                    // Commit only after this complete engine action and its nested work succeed.
                    return runGameplay(
                      /* Keep this action and all nested mutations inside one save boundary. */ () => {
                        if (player.gold < cost) {
                          sfxDeny.play();
                          addDungeonLog("You don't have enough gold.");
                        } else {
                          player.gold -= cost;
                          sfxConfirm.play();
                          cursedTotem(curseLvl);
                        }
                        dungeon.status.event = false;
                      },
                    );
                  };
                document.querySelector("#choice2").onclick =
                  /* Handle this control using the current view state and transition owner. */ function () {
                    // Commit only after this complete engine action and its nested work succeed.
                    return runGameplay(
                      /* Keep this action and all nested mutations inside one save boundary. */ () => {
                        ignoreEvent();
                      },
                    );
                  };
              } else {
                nothingEvent();
              }
              break;
            case "monarch":
              eventRoll = randomizeNum(1, 7);
              if (eventRoll === 1) {
                dungeon.status.event = true;
                choices = `
                            <div class="decision-panel">
                                <button id="choice1">Enter</button>
                                <button id="choice2">Ignore</button>
                            </div>`;
                addDungeonLog(
                  `<span class="Heirloom">You found a mysterious chamber. It seems like there is something sleeping inside.</span>`,
                  choices,
                );
                document.querySelector("#choice1").onclick =
                  /* Handle this control using the current view state and transition owner. */ function () {
                    // Commit only after this complete engine action and its nested work succeed.
                    return runGameplay(
                      /* Keep this action and all nested mutations inside one save boundary. */ () => {
                        specialBossBattle();
                      },
                    );
                  };
                document.querySelector("#choice2").onclick =
                  /* Handle this control using the current view state and transition owner. */ function () {
                    // Commit only after this complete engine action and its nested work succeed.
                    return runGameplay(
                      /* Keep this action and all nested mutations inside one save boundary. */ () => {
                        ignoreEvent();
                      },
                    );
                  };
              } else {
                nothingEvent();
              }
          }
        }
      },
    );
  };

// ========= Dungeon Choice Events ==========
// Starts the battle
const engageBattle =
  /* Enter the selected ordinary encounter without advancing the room. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        showCombatInfo();
        startCombat(bgmBattleMain);
        addCombatLog(`You encountered ${enemy.name}.`);
        updateDungeonLog();
      },
    );
  };

// Mimic encounter
const mimicBattle =
  /* Generate the selected mimic using its original encounter rule. */ (
    type,
  ) => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        generateRandomEnemy(type);
        showCombatInfo();
        startCombat(bgmBattleMain);
        addCombatLog(`You encountered ${enemy.name}.`);
        addDungeonLog(`You encountered ${enemy.name}.`);
      },
    );
  };

// Guardian boss fight
const guardianBattle =
  /* Advance guardian progression once before entering its encounter. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        incrementRoom();
        generateRandomEnemy("guardian");
        showCombatInfo();
        startCombat(bgmBattleGuardian);
        addCombatLog(`Floor Guardian ${enemy.name} is blocking your way.`);
        addDungeonLog("You moved to the next floor.");
      },
    );
  };

// Guardian boss fight
const specialBossBattle =
  /* Enter a special encounter with its original generation rules. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        generateRandomEnemy("sboss");
        showCombatInfo();
        startCombat(bgmBattleBoss);
        addCombatLog(`Dungeon Monarch ${enemy.name} has awoken.`);
        addDungeonLog(`Dungeon Monarch ${enemy.name} has awoken.`);
      },
    );
  };

// Flee from the monster
const fleeBattle =
  /* Resolve the original escape chance and event consequences. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        const eventRoll = randomizeNum(1, 2);
        if (eventRoll === 1) {
          sfxConfirm.play();
          addDungeonLog(`You managed to flee.`);
          player.inCombat = false;
          dungeon.status.event = false;
        } else {
          addDungeonLog(`You failed to escape!`);
          showCombatInfo();
          startCombat(bgmBattleMain);
          addCombatLog(`You encountered ${enemy.name}.`);
          addCombatLog(`You failed to escape!`);
        }
      },
    );
  };

// Chest event randomizer
const chestEvent =
  /* Resolve one treasure choice using the original reward probabilities. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        sfxConfirm.play();
        const eventRoll = randomizeNum(1, 4);
        if (eventRoll === 1) {
          mimicBattle("chest");
        } else if (eventRoll === 2) {
          if (dungeon.progress.floor === 1) {
            goldDrop();
          } else {
            createEquipmentPrint("dungeon");
          }
          dungeon.status.event = false;
        } else if (eventRoll === 3) {
          goldDrop();
          dungeon.status.event = false;
        } else {
          addDungeonLog("The chest is empty.");
          dungeon.status.event = false;
        }
      },
    );
  };

// Calculates Gold Drop
const goldDrop = /* Grant the original randomized currency reward. */ () => {
  // Commit only after this complete engine action and its nested work succeed.
  return runGameplay(
    /* Keep this action and all nested mutations inside one save boundary. */ () => {
      sfxSell.play();
      const goldValue = randomizeNum(50, 500) * dungeon.progress.floor;
      addDungeonLog(
        `You found <i class="fas fa-coins" style="color: #FFD700;"></i>${nFormatter(goldValue)}.`,
      );
      player.gold += goldValue;
      playerLoadStats();
    },
  );
};

// Non choices dungeon event messages
const nothingEvent =
  /* Resolve an uneventful room outcome without changing its probabilities. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        const eventRoll = randomizeNum(1, 5);
        if (eventRoll === 1) {
          addDungeonLog("You explored and found nothing.");
        } else if (eventRoll === 2) {
          addDungeonLog("You found an empty chest.");
        } else if (eventRoll === 3) {
          addDungeonLog("You found a monster corpse.");
        } else if (eventRoll === 4) {
          addDungeonLog("You found a corpse.");
        } else if (eventRoll === 5) {
          addDungeonLog("There is nothing in this area.");
        }
      },
    );
  };

// Random stat buff
const statBlessing =
  /* Apply one randomly selected blessing and its original magnitude. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        sfxBuff.play();
        const stats = [
          "hp",
          "atk",
          "def",
          "atkSpd",
          "vamp",
          "critRate",
          "critDmg",
        ];
        const buff = stats[Math.floor(Math.random() * stats.length)];
        let value;
        switch (buff) {
          case "hp":
            value = 10;
            player.bonusStats.hp += value;
            break;
          case "atk":
            value = 8;
            player.bonusStats.atk += value;
            break;
          case "def":
            value = 8;
            player.bonusStats.def += value;
            break;
          case "atkSpd":
            value = 3;
            player.bonusStats.atkSpd += value;
            break;
          case "vamp":
            value = 0.5;
            player.bonusStats.vamp += value;
            break;
          case "critRate":
            value = 1;
            player.bonusStats.critRate += value;
            break;
          case "critDmg":
            value = 6;
            player.bonusStats.critDmg += value;
            break;
        }
        addDungeonLog(
          `You gained ${value}% bonus ${buff
            .replace(/([A-Z])/g, ".$1")
            .replace(/crit/g, "c")
            .toUpperCase()} from the blessing. (Blessing Lv.${player.blessing} > Blessing Lv.${player.blessing + 1})`,
        );
        blessingUp();
        playerLoadStats();
        saveData();
      },
    );
  };

// Cursed totem offering
const cursedTotem = /* Apply the chosen curse scaling and close the event. */ (
  curseLvl,
) => {
  // Commit only after this complete engine action and its nested work succeed.
  return runGameplay(
    /* Keep this action and all nested mutations inside one save boundary. */ () => {
      sfxBuff.play();
      dungeon.settings.enemyScaling += 0.1;
      addDungeonLog(
        `The monsters in the dungeon became stronger and the loot quality improved. (Curse Lv.${curseLvl} > Curse Lv.${curseLvl + 1})`,
      );
      saveData();
    },
  );
};

// Ignore event and proceed exploring
const ignoreEvent =
  /* Dismiss the current choice without granting its reward. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        sfxConfirm.play();
        dungeon.status.event = false;
        addDungeonLog("You ignored it and decided to move on.");
      },
    );
  };

// Increase room or floor accordingly
const incrementRoom =
  /* Advance room progression and clear the exploration action count. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        dungeon.progress.room++;
        dungeon.action = 0;
        loadDungeonProgress();
      },
    );
  };

// Increases player total blessing
const blessingUp =
  /* Increase the run blessing after supplying its historical default. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        blessingValidation();
        player.blessing++;
      },
    );
  };

// Validates whether blessing exists or not
const blessingValidation =
  /* Supply the legacy blessing default for an early character. */ () => {
    if (player.blessing === undefined || player.blessing === null) {
      player.blessing = 1;
    }
  };

// ========= Dungeon Backlog ==========
// Displays every dungeon activity
const updateDungeonLog =
  /* Refresh the last fifty exploration messages and active choices. */ (
    choices,
  ) => {
    const dungeonLog = document.querySelector("#dungeonLog");
    dungeonLog.innerHTML = "";

    // Display the recent 50 dungeon logs
    for (const message of dungeon.backlog.slice(-50)) {
      const logElement = document.createElement("p");
      logElement.innerHTML = message;
      dungeonLog.appendChild(logElement);
    }

    // If the event has choices, display it
    if (typeof choices !== "undefined") {
      const eventChoices = document.createElement("div");
      eventChoices.innerHTML = choices;
      dungeonLog.appendChild(eventChoices);
    }

    dungeonLog.scrollTop = dungeonLog.scrollHeight;
  };

// Add a log to the dungeon backlog
const addDungeonLog =
  /* Append an exploration message before rebuilding the current log. */ (
    message,
    choices,
  ) => {
    dungeon.backlog.push(message);
    updateDungeonLog(choices);
  };

// Evaluate a dungeon difficulty
const evaluateDungeon =
  /* Reserve the existing difficulty-evaluation hook without changing gameplay. */ () => {
    // Work in Progress
  };
