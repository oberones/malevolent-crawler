let combatTimer;
const combatPanel = document.querySelector("#combatPanel");
let enemyDead = false;
let playerDead = false;

// ========== Validation ==========
const hpValidation =
  /* Resolve death or victory once the current attack has applied its damage. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        // Prioritizes player death before the enemy
        if (player.stats.hp < 1) {
          player.stats.hp = 0;
          playerDead = true;
          player.deaths++;
          addCombatLog(`You died!`);
          document.querySelector("#battleButton").addEventListener(
            "click",
            /* Handle this control using the current view state and transition owner. */ function () {
              // Commit only after this complete engine action and its nested work succeed.
              return runGameplay(
                /* Keep this action and all nested mutations inside one save boundary. */ () => {
                  sfxConfirm.play();
                  playerDead = false;

                  // Reset all the necessary stats and return to menu
                  const dimDungeon = document.querySelector("#dungeon-main");
                  dimDungeon.style.filter = "brightness(100%)";
                  dimDungeon.style.display = "none";
                  combatPanel.style.display = "none";
                  runLoad("title-screen", "flex");

                  clearInterval(dungeonTimer);
                  clearInterval(playTimer);
                  progressReset();
                },
              );
            },
          );
          endCombat();
        } else if (enemy.stats.hp < 1) {
          // Gives out all the reward and show the claim button
          enemy.stats.hp = 0;
          enemyDead = true;
          player.kills++;
          dungeon.statistics.kills++;
          addCombatLog(
            `${enemy.name} died! (${new Date(combatSeconds * 1000).toISOString().substring(14, 19)})`,
          );
          addCombatLog(`You earned ${nFormatter(enemy.rewards.exp)} exp.`);
          playerExpGain();
          addCombatLog(
            `${enemy.name} dropped <i class="fas fa-coins" style="color: #FFD700;"></i>${nFormatter(enemy.rewards.gold)} gold.`,
          );
          player.gold += enemy.rewards.gold;
          playerLoadStats();
          if (enemy.rewards.drop) {
            createEquipmentPrint("combat");
          }

          // Recover 20% of players health
          player.stats.hp += Math.round((player.stats.hpMax * 20) / 100);
          playerLoadStats();

          // Close the battle panel
          document.querySelector("#battleButton").addEventListener(
            "click",
            /* Handle this control using the current view state and transition owner. */ function () {
              // Commit only after this complete engine action and its nested work succeed.
              return runGameplay(
                /* Keep this action and all nested mutations inside one save boundary. */ () => {
                  sfxConfirm.play();

                  // Clear combat backlog and transition to dungeon exploration
                  const dimDungeon = document.querySelector("#dungeon-main");
                  dimDungeon.style.filter = "brightness(100%)";
                  bgmDungeon.play();

                  dungeon.status.event = false;
                  combatPanel.style.display = "none";
                  enemyDead = false;
                  combatBacklog.length = 0;
                },
              );
            },
          );
          endCombat();
        }
      },
    );
  };

// ========== Attack Functions ==========
const playerAttack =
  /* Apply the player attack, skill effects and rewards as one transition. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        if (!player.inCombat) {
          return;
        }
        if (player.inCombat) {
          sfxAttack.play();
        }

        // Calculates the damage and attacks the enemy
        let crit;
        let dmgtype;
        let damage =
          player.stats.atk *
          (player.stats.atk / (player.stats.atk + enemy.stats.def));
        // Randomizes the damage by 90% - 110%
        const dmgRange = 0.9 + Math.random() * 0.2;
        damage = damage * dmgRange;
        // Check if the attack is a critical hit
        if (Math.floor(Math.random() * 100) < player.stats.critRate) {
          crit = true;
          dmgtype = "crit damage";
          damage = Math.round(damage * (1 + player.stats.critDmg / 100));
        } else {
          crit = false;
          dmgtype = "damage";
          damage = Math.round(damage);
        }

        // Skill effects
        player = objectValidation(player);
        if (player.skills.includes("Remnant Razor")) {
          // Attacks deal extra 8% of enemies' current health on hit
          damage += Math.round((8 * enemy.stats.hp) / 100);
        }
        if (player.skills.includes("Titan's Will")) {
          // Attacks deal extra 5% of your maximum health on hit
          damage += Math.round((5 * player.stats.hpMax) / 100);
        }
        if (player.skills.includes("Devastator")) {
          // Deal 30% more damage but you lose 30% base attack speed
          damage = Math.round(damage + (30 * damage) / 100);
        }
        if (player.skills.includes("Rampager")) {
          // Increase base attack by 5 after each hit. Stack resets after battle.
          player.baseStats.atk += 5;
          player = objectValidation(player);
          player.tempStats.atk += 5;
          saveData();
        }
        if (player.skills.includes("Blade Dance")) {
          // Gain increased attack speed after each hit. Stack resets after battle
          player.baseStats.atkSpd += 0.01;
          player = objectValidation(player);
          player.tempStats.atkSpd += 0.01;
          saveData();
        }

        // Lifesteal formula
        const lifesteal = Math.round(damage * (player.stats.vamp / 100));

        // Apply the calculations to combat
        enemy.stats.hp -= damage;
        player.stats.hp += lifesteal;
        addCombatLog(
          `${player.name} dealt ` +
            nFormatter(damage) +
            ` ${dmgtype} to ${enemy.name}.`,
        );
        hpValidation();
        playerLoadStats();
        enemyLoadStats();

        // Damage effect
        const enemySprite = document.querySelector("#enemy-sprite");
        enemySprite.classList.add("animation-shake");
        setTimeout(
          /* Complete the scheduled visual update or next attack in its existing order. */ () => {
            enemySprite.classList.remove("animation-shake");
          },
          200,
        );

        // Damage numbers
        const dmgContainer = document.querySelector("#dmg-container");
        const dmgNumber = document.createElement("p");
        dmgNumber.classList.add("dmg-numbers");
        if (crit) {
          dmgNumber.style.color = "gold";
          dmgNumber.innerHTML = nFormatter(damage) + "!";
        } else {
          dmgNumber.innerHTML = nFormatter(damage);
        }
        dmgContainer.appendChild(dmgNumber);
        setTimeout(
          /* Complete the scheduled visual update or next attack in its existing order. */ () => {
            dmgContainer.removeChild(dmgContainer.lastElementChild);
          },
          370,
        );

        // Attack Timer
        if (player.inCombat) {
          setTimeout(
            /* Complete the scheduled visual update or next attack in its existing order. */ () => {
              if (player.inCombat) {
                playerAttack();
              }
            },
            1000 / player.stats.atkSpd,
          );
        }
      },
    );
  };

const enemyAttack =
  /* Apply enemy damage, lifesteal and retaliation as one transition. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        let dmgtype;
        if (!player.inCombat) {
          return;
        }
        if (player.inCombat) {
          sfxAttack.play();
        }

        // Calculates the damage and attacks the player
        let damage =
          enemy.stats.atk *
          (enemy.stats.atk / (enemy.stats.atk + player.stats.def));
        const lifesteal = Math.round(
          enemy.stats.atk * (enemy.stats.vamp / 100),
        );
        // Randomizes the damage by 90% - 110%
        const dmgRange = 0.9 + Math.random() * 0.2;
        damage = damage * dmgRange;
        // Check if the attack is a critical hit
        if (Math.floor(Math.random() * 100) < enemy.stats.critRate) {
          dmgtype = "crit damage";
          damage = Math.round(damage * (1 + enemy.stats.critDmg / 100));
        } else {
          dmgtype = "damage";
          damage = Math.round(damage);
        }

        // Skill effects
        if (player.skills.includes("Paladin's Heart")) {
          // You receive 25% less damage
          damage = Math.round(damage - (25 * damage) / 100);
        }

        // Apply the calculations
        player.stats.hp -= damage;
        // Aegis Thorns skill
        player = objectValidation(player);
        if (player.skills.includes("Aegis Thorns")) {
          // Enemies receive 15% of the damage they dealt
          enemy.stats.hp -= Math.round((15 * damage) / 100);
        }
        enemy.stats.hp += lifesteal;
        addCombatLog(
          `${enemy.name} dealt ` +
            nFormatter(damage) +
            ` ${dmgtype} to ${player.name}.`,
        );
        hpValidation();
        playerLoadStats();
        enemyLoadStats();

        // Damage effect
        const playerPanel = document.querySelector("#playerPanel");
        playerPanel.classList.add("animation-shake");
        setTimeout(
          /* Complete the scheduled visual update or next attack in its existing order. */ () => {
            playerPanel.classList.remove("animation-shake");
          },
          200,
        );

        // Attack Timer
        if (player.inCombat) {
          setTimeout(
            /* Complete the scheduled visual update or next attack in its existing order. */ () => {
              if (player.inCombat) {
                enemyAttack();
              }
            },
            1000 / enemy.stats.atkSpd,
          );
        }
      },
    );
  };

// ========== Combat Backlog ==========
const combatBacklog = [];

// Add a log to the combat backlog
const addCombatLog =
  /* Append a battle message in its original display order. */ (message) => {
    combatBacklog.push(message);
    updateCombatLog();
  };

// Displays every combat activity
const updateCombatLog =
  /* Refresh the battle history and terminal encounter controls. */ () => {
    const combatLogBox = document.getElementById("combatLogBox");
    combatLogBox.innerHTML = "";

    for (const message of combatBacklog) {
      const logElement = document.createElement("p");
      logElement.innerHTML = message;
      combatLogBox.appendChild(logElement);
    }

    if (enemyDead) {
      const button = document.createElement("div");
      button.className = "decision-panel";
      button.innerHTML = `<button id="battleButton">Claim</button>`;
      combatLogBox.appendChild(button);
    }

    if (playerDead) {
      const button = document.createElement("div");
      button.className = "decision-panel";
      button.innerHTML = `<button id="battleButton">Back to Menu</button>`;
      combatLogBox.appendChild(button);
    }

    combatLogBox.scrollTop = combatLogBox.scrollHeight;
  };

// Combat Timer
let combatSeconds = 0;

const startCombat =
  /* Start fresh attack delays for the current enemy without rerolling it. */ (
    battleMusic,
  ) => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        bgmDungeon.pause();
        sfxEncounter.play();
        battleMusic.play();
        player.inCombat = true;

        // Starts the timer for player and enemy attacks along with combat timer
        setTimeout(playerAttack, 1000 / player.stats.atkSpd);
        setTimeout(enemyAttack, 1000 / enemy.stats.atkSpd);
        const dimDungeon = document.querySelector("#dungeon-main");
        dimDungeon.style.filter = "brightness(50%)";

        playerLoadStats();
        enemyLoadStats();

        dungeon.status.event = true;
        combatPanel.style.display = "flex";

        combatTimer = setInterval(combatCounter, 1000);
      },
    );
  };

const endCombat =
  /* Stop combat and remove temporary skill bonuses before persistence. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        bgmBattleMain.stop();
        bgmBattleGuardian.stop();
        bgmBattleBoss.stop();
        sfxCombatEnd.play();
        player.inCombat = false;
        // Skill validation
        if (player.skills.includes("Rampager")) {
          // Remove Rampager attack buff
          player = objectValidation(player);
          player.baseStats.atk -= player.tempStats.atk;
          player.tempStats.atk = 0;
          saveData();
        }
        if (player.skills.includes("Blade Dance")) {
          // Remove Blade Dance attack speed buff
          player = objectValidation(player);
          player.baseStats.atkSpd -= player.tempStats.atkSpd;
          player.tempStats.atkSpd = 0;
          saveData();
        }

        // Stops every timer in combat
        clearInterval(combatTimer);
        combatSeconds = 0;
      },
    );
  };

const combatCounter =
  /* Track elapsed display time for the current encounter. */ () => {
    combatSeconds++;
  };

const showCombatInfo =
  /* Construct the existing battle view for the selected enemy. */ () => {
    document.querySelector("#combatPanel").innerHTML = `
    <div class="content">
        <div class="battle-info-panel center" id="enemyPanel">
            <p>${enemy.name} Lv.${enemy.lvl}</p>
            <div class="battle-bar empty-bar hp bb-hp">
                <div class="battle-bar dmg bb-hp" id="enemy-hp-dmg"></div>
                <div class="battle-bar current bb-hp" id="enemy-hp-battle">
                    &nbsp${nFormatter(enemy.stats.hp)}/${nFormatter(enemy.stats.hpMax)}<br>(${enemy.stats.hpPercent}%)
                </div>
            </div>
            <div id="dmg-container"></div>
            <img src="./assets/sprites/${enemy.image.name}${enemy.image.type}" alt="${enemy.name}" width="${enemy.image.size}" id="enemy-sprite">
        </div>
        <div class="battle-info-panel primary-panel" id="playerPanel">
            <p id="player-combat-info"></p>
            <div class="battle-bar empty-bar bb-hp">
                <div class="battle-bar dmg bb-hp" id="player-hp-dmg"></div>
                <div class="battle-bar current bb-hp" id="player-hp-battle">
                    &nbsp${nFormatter(player.stats.hp)}/${nFormatter(player.stats.hpMax)}(${player.stats.hpPercent}%)
                </div>
            </div>
            <div class="battle-bar empty-bar bb-xb">
                <div class="battle-bar current bb-xb" id="player-exp-bar">exp</div>
            </div>
        </div>
        <div class="logBox primary-panel">
            <div id="combatLogBox"></div>
        </div>
    </div>
    `;
  };
