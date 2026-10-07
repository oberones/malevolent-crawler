// Reassigned by the validated bridge in main.js; lexical ownership stays here.
// eslint-disable-next-line prefer-const
let player = null;
let inventoryOpen = false;
let leveled = false;
const lvlupSelect = document.querySelector("#lvlupSelect");
const lvlupPanel = document.querySelector("#lvlupPanel");

const playerExpGain =
  /* Apply the earned experience and all resulting level thresholds. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        player.exp.expCurr += enemy.rewards.exp;
        player.exp.expCurrLvl += enemy.rewards.exp;

        while (player.exp.expCurr >= player.exp.expMax) {
          playerLvlUp();
        }
        if (leveled) {
          lvlupPopup();
        }

        playerLoadStats();
      },
    );
  };

// Levels up the player
const playerLvlUp =
  /* Advance one level using the preserved experience curve. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        leveled = true;

        // Calculates the excess exp and the new exp required to level up
        let expMaxIncrease = Math.floor(
          player.exp.expMax * 1.1 + 100 - player.exp.expMax,
        );
        if (player.lvl > 100) {
          expMaxIncrease = 1000000;
        }
        const excessExp = player.exp.expCurr - player.exp.expMax;
        player.exp.expCurrLvl = excessExp;
        player.exp.expMaxLvl = expMaxIncrease;

        // Increase player level and maximum exp
        player.lvl++;
        player.exp.lvlGained++;
        player.exp.expMax += expMaxIncrease;

        // Increase player bonus stats per level
        player.bonusStats.hp += 4;
        player.bonusStats.atk += 2;
        player.bonusStats.def += 2;
        player.bonusStats.atkSpd += 0.15;
        player.bonusStats.critRate += 0.1;
        player.bonusStats.critDmg += 0.25;
      },
    );
  };

// Refresh the player stats
const playerLoadStats =
  /* Refresh equipment/player panels; keep readable HP text independent of the shrinking fill. */ () => {
    gameServices.items.render();
    applyEquipmentStats();

    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    if (player.stats.hp > player.stats.hpMax) {
      player.stats.hp = player.stats.hpMax;
    }
    player.stats.hpPercent = Number(
      (player.stats.hp / player.stats.hpMax) * 100,
    )
      .toFixed(2)
      .replace(rx, "$1");
    player.exp.expPercent = Number(
      (player.exp.expCurrLvl / player.exp.expMaxLvl) * 100,
    )
      .toFixed(2)
      .replace(rx, "$1");

    // Generate battle info for player if in combat
    if (player.inCombat || playerDead) {
      const playerCombatHpElement = document.querySelector("#player-hp-battle");
      const playerHpDamageElement = document.querySelector("#player-hp-dmg");
      const playerExpElement = document.querySelector("#player-exp-bar");
      const playerInfoElement = document.querySelector("#player-combat-info");
      playerCombatHpElement.innerHTML = `<span class="battle-hp-label">&nbsp${nFormatter(player.stats.hp)}/${nFormatter(player.stats.hpMax)}(${player.stats.hpPercent}%)</span>`;
      playerCombatHpElement.style.width = `${player.stats.hpPercent}%`;
      playerHpDamageElement.style.width = `${player.stats.hpPercent}%`;
      playerExpElement.style.width = `${player.exp.expPercent}%`;
      playerInfoElement.textContent = `${player.name} Lv.${player.lvl} (${player.exp.expPercent}%)`;
    }

    // Header
    document.querySelector("#player-name").innerHTML =
      '<i class="fas fa-user"></i>';
    document
      .querySelector("#player-name")
      .append(document.createTextNode(`${player.name} Lv.${player.lvl}`));
    document.querySelector("#player-exp").innerHTML =
      `<p>Exp</p> ${nFormatter(player.exp.expCurr)}/${nFormatter(player.exp.expMax)} (${player.exp.expPercent}%)`;
    document.querySelector("#player-gold").innerHTML =
      `<i class="fas fa-coins" style="color: #FFD700;"></i>${nFormatter(player.gold)}`;

    // Player Stats
    playerHpElement.innerHTML = `${nFormatter(player.stats.hp)}/${nFormatter(player.stats.hpMax)} (${player.stats.hpPercent}%)`;
    playerAtkElement.innerHTML = nFormatter(player.stats.atk);
    playerDefElement.innerHTML = nFormatter(player.stats.def);
    playerAtkSpdElement.innerHTML = player.stats.atkSpd
      .toFixed(2)
      .replace(rx, "$1");
    playerVampElement.innerHTML =
      player.stats.vamp.toFixed(2).replace(rx, "$1") + "%";
    playerCrateElement.innerHTML =
      player.stats.critRate.toFixed(2).replace(rx, "$1") + "%";
    playerCdmgElement.innerHTML =
      player.stats.critDmg.toFixed(2).replace(rx, "$1") + "%";

    // Player Bonus Stats
    document.querySelector("#bonus-stats").innerHTML = `
    <h4>Bonus Stats</h4>
    <p><i class="fas fa-heart"></i>HP+${player.bonusStats.hp.toFixed(2).replace(rx, "$1")}%</p>
    <p><i class="ra ra-sword"></i>ATK+${player.bonusStats.atk.toFixed(2).replace(rx, "$1")}%</p>
    <p><i class="ra ra-round-shield"></i>DEF+${player.bonusStats.def.toFixed(2).replace(rx, "$1")}%</p>
    <p><i class="ra ra-plain-dagger"></i>ATK.SPD+${player.bonusStats.atkSpd.toFixed(2).replace(rx, "$1")}%</p>
    <p><i class="ra ra-dripping-blade"></i>VAMP+${player.bonusStats.vamp.toFixed(2).replace(rx, "$1")}%</p>
    <p><i class="ra ra-lightning-bolt"></i>C.RATE+${player.bonusStats.critRate.toFixed(2).replace(rx, "$1")}%</p>
    <p><i class="ra ra-focused-lightning"></i>C.DMG+${player.bonusStats.critDmg.toFixed(2).replace(rx, "$1")}%</p>`;
  };

// Opens inventory
const openInventory =
  /* Pause exploration while presenting holdings and sale controls. */ () => {
    sfxOpen.play();

    dungeon.status.exploring = false;
    inventoryOpen = true;
    const openInv = document.querySelector("#inventory");
    const dimDungeon = document.querySelector("#dungeon-main");
    openInv.style.display = "flex";
    dimDungeon.style.filter = "brightness(50%)";

    gameServices.items.render();
    sellAllElement.onclick =
      /* Bind the selected filter when the confirmation opens. */ () =>
        gameServices.items.confirmBulk("sell-all", sellRarityElement.value);
    sellRarityElement.onclick =
      /* Handle this control using the current view state and transition owner. */ function () {
        // Commit only after this complete engine action and its nested work succeed.
        return runGameplay(
          /* Keep this action and all nested mutations inside one save boundary. */ () => {
            sfxOpen.play();
          },
        );
      };
    sellRarityElement.onchange =
      /* Handle this control using the current view state and transition owner. */ function () {
        // Commit only after this complete engine action and its nested work succeed.
        return runGameplay(
          /* Keep this action and all nested mutations inside one save boundary. */ () => {
            const rarity = sellRarityElement.value;
            sellRarityElement.className = rarity;
            gameServices.items.render();
          },
        );
      };
  };

// Closes inventory
const closeInventory =
  /* Dismiss the inventory and restore the prior exploration state. */ () => {
    sfxDecline.play();

    const openInv = document.querySelector("#inventory");
    const dimDungeon = document.querySelector("#dungeon-main");
    openInv.style.display = "none";
    dimDungeon.style.filter = "brightness(100%)";
    inventoryOpen = false;
    if (!dungeon.status.paused) {
      dungeon.status.exploring = true;
    }
  };

// Continue exploring if inventory is not open and the game is not paused
const continueExploring =
  /* Resume exploration only when no encounter decision is active. */ () => {
    if (!inventoryOpen && !dungeon.status.paused) {
      dungeon.status.exploring = true;
    }
  };

// Shows the level up popup
const lvlupPopup =
  /* Present earned upgrades without generating another reward. */ () => {
    sfxLvlUp.play();
    addCombatLog(
      gameServices.narrative.record("upgrade.gained", {
        before: player.lvl - player.exp.lvlGained,
        after: player.lvl,
      }),
    );

    // Recover 20% extra hp on level up
    player.stats.hp += Math.round((player.stats.hpMax * 20) / 100);
    playerLoadStats();

    // Show popup choices
    lvlupPanel.style.display = "flex";
    combatPanel.style.filter = "brightness(50%)";
    const percentages = {
      hp: 10,
      atk: 8,
      def: 8,
      atkSpd: 3,
      vamp: 0.5,
      critRate: 1,
      critDmg: 6,
    };
    generateLvlStats(2, percentages);
  };

// Generates random stats for level up popup
const generateLvlStats =
  /* Choose and render three upgrades with the original reroll budget. */ (
    rerolls,
    percentages,
  ) => {
    const selectedStats = [];
    const stats = ["hp", "atk", "def", "atkSpd", "vamp", "critRate", "critDmg"];
    while (selectedStats.length < 3) {
      const randomIndex = Math.floor(Math.random() * stats.length);
      if (!selectedStats.includes(stats[randomIndex])) {
        selectedStats.push(stats[randomIndex]);
      }
    }

    const loadLvlHeader =
      /* Refresh the remaining reroll count without rerolling the choices. */ () => {
        lvlupSelect.innerHTML = `
            <h1>Level Up!</h1>
            <div class="content-head">
                <h4>Remaining: ${player.exp.lvlGained}</h4>
                <button id="lvlReroll">Reroll ${rerolls}/2</button>
            </div>
        `;
        gameServices.narrative.upgrade(player.exp.lvlGained, rerolls);
      };
    loadLvlHeader();

    const lvlReroll = document.querySelector("#lvlReroll");
    lvlReroll.addEventListener(
      "click",
      /* Handle this control using the current view state and transition owner. */ function () {
        // Commit only after this complete engine action and its nested work succeed.
        return runGameplay(
          /* Keep this action and all nested mutations inside one save boundary. */ () => {
            if (rerolls > 0) {
              sfxSell.play();
              rerolls--;
              loadLvlHeader();
              generateLvlStats(rerolls, percentages);
            } else {
              sfxDeny.play();
            }
          },
        );
      },
    );

    // There are exactly three selected upgrades; rendering errors must reach the caller.
    for (let i = 0; i < selectedStats.length; i++) {
      const button = document.createElement("button");
      button.id = "lvlSlot" + i;

      const h3 = document.createElement("h3");
      h3.innerHTML =
        selectedStats[i]
          .replace(/([A-Z])/g, ".$1")
          .replace(/crit/g, "c")
          .toUpperCase() + " UP";
      button.appendChild(h3);

      const p = document.createElement("p");
      p.textContent = gameServices.narrative.text(
        `upgrade.${selectedStats[i]}`,
      );
      button.appendChild(p);

      // Increase the selected stat for player
      button.addEventListener(
        "click",
        /* Handle this control using the current view state and transition owner. */ function () {
          // Commit only after this complete engine action and its nested work succeed.
          return runGameplay(
            /* Keep this action and all nested mutations inside one save boundary. */ () => {
              sfxItem.play();
              player.bonusStats[selectedStats[i]] +=
                percentages[selectedStats[i]];

              if (player.exp.lvlGained > 1) {
                player.exp.lvlGained--;
                generateLvlStats(2, percentages);
              } else {
                player.exp.lvlGained = 0;
                lvlupPanel.style.display = "none";
                combatPanel.style.filter = "brightness(100%)";
                leveled = false;
              }

              playerLoadStats();
              saveData();
            },
          );
        },
      );

      lvlupSelect.appendChild(button);
    }
  };
