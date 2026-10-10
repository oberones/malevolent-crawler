const createEquipment =
  /* Roll one item using the original category, rarity and stat draw order. */ () => {
    // Commit only after this complete engine action and its nested work succeed.
    return runGameplay(
      /* Keep this action and all nested mutations inside one save boundary. */ () => {
        const equipment = {
          category: null,
          attribute: null,
          type: null,
          rarity: null,
          lvl: null,
          tier: null,
          value: null,
          stats: [],
        };

        // Generate random equipment attribute
        const equipmentAttributes = ["Damage", "Defense"];
        equipment.attribute =
          equipmentAttributes[
            Math.floor(Math.random() * equipmentAttributes.length)
          ];

        // Generate random equipment name and type based on attribute
        if (equipment.attribute === "Damage") {
          const equipmentCategories = [
            "Sword",
            "Axe",
            "Hammer",
            "Dagger",
            "Flail",
            "Scythe",
          ];
          equipment.category =
            equipmentCategories[
              Math.floor(Math.random() * equipmentCategories.length)
            ];
          equipment.type = "Weapon";
        } else if (equipment.attribute === "Defense") {
          const equipmentTypes = ["Armor", "Shield", "Helmet"];
          equipment.type =
            equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
          if (equipment.type === "Armor") {
            const equipmentCategories = ["Plate", "Chain", "Leather"];
            equipment.category =
              equipmentCategories[
                Math.floor(Math.random() * equipmentCategories.length)
              ];
          } else if (equipment.type === "Shield") {
            const equipmentCategories = ["Tower", "Kite", "Buckler"];
            equipment.category =
              equipmentCategories[
                Math.floor(Math.random() * equipmentCategories.length)
              ];
          } else if (equipment.type === "Helmet") {
            const equipmentCategories = ["Great Helm", "Horned Helm"];
            equipment.category =
              equipmentCategories[
                Math.floor(Math.random() * equipmentCategories.length)
              ];
          }
        }

        // Generate random equipment rarity
        const rarityChances = {
          Common: 0.7,
          Uncommon: 0.2,
          Rare: 0.04,
          Epic: 0.03,
          Legendary: 0.02,
          Heirloom: 0.01,
        };

        const randomNumber = Math.random();
        let cumulativeChance = 0;

        for (const rarity in rarityChances) {
          cumulativeChance += rarityChances[rarity];
          if (randomNumber <= cumulativeChance) {
            equipment.rarity = rarity;
            break;
          }
        }

        // Determine number of times to loop based on equipment rarity
        let loopCount;
        switch (equipment.rarity) {
          case "Common":
            loopCount = 2;
            break;
          case "Uncommon":
            loopCount = 3;
            break;
          case "Rare":
            loopCount = 4;
            break;
          case "Epic":
            loopCount = 5;
            break;
          case "Legendary":
            loopCount = 6;
            break;
          case "Heirloom":
            loopCount = 8;
            break;
        }

        // Generate and append random stats to the stats array
        const physicalStats = ["atk", "atkSpd", "vamp", "critRate", "critDmg"];
        const damageyStats = [
          "atk",
          "atk",
          "vamp",
          "critRate",
          "critDmg",
          "critDmg",
        ];
        const speedyStats = [
          "atkSpd",
          "atkSpd",
          "atk",
          "vamp",
          "critRate",
          "critRate",
          "critDmg",
        ];
        const defenseStats = ["hp", "hp", "def", "def", "atk"];
        const dmgDefStats = ["hp", "def", "atk", "atk", "critRate", "critDmg"];
        let statTypes;
        if (equipment.attribute === "Damage") {
          if (equipment.category === "Axe" || equipment.category === "Scythe") {
            statTypes = damageyStats;
          } else if (
            equipment.category === "Dagger" ||
            equipment.category === "Flail"
          ) {
            statTypes = speedyStats;
          } else if (equipment.category === "Hammer") {
            statTypes = dmgDefStats;
          } else {
            statTypes = physicalStats;
          }
        } else if (equipment.attribute === "Defense") {
          statTypes = defenseStats;
        }
        let equipmentValue = 0;
        for (let i = 0; i < loopCount; i++) {
          const statType =
            statTypes[Math.floor(Math.random() * statTypes.length)];

          // Stat scaling for equipment
          const maxLvl =
            dungeon.progress.floor * dungeon.settings.enemyLvlGap +
            (dungeon.settings.enemyBaseLvl - 1);
          const minLvl = maxLvl - (dungeon.settings.enemyLvlGap - 1);
          // Set equipment level with Lv.100 cap
          equipment.lvl = randomizeNum(minLvl, maxLvl);
          if (equipment.lvl > 100) {
            equipment.lvl = 100;
          }
          // Set stat scaling and equipment tier Tier 10 cap
          let enemyScaling = dungeon.settings.enemyScaling;
          if (enemyScaling > 2) {
            enemyScaling = 2;
          }
          const statMultiplier = (enemyScaling - 1) * equipment.lvl;
          equipment.tier = Math.round((enemyScaling - 1) * 10);
          const hpScaling =
            40 * randomizeDecimal(0.5, 1.5) +
            40 * randomizeDecimal(0.5, 1.5) * statMultiplier;
          const atkDefScaling =
            16 * randomizeDecimal(0.5, 1.5) +
            16 * randomizeDecimal(0.5, 1.5) * statMultiplier;
          const cdAtkSpdScaling =
            3 * randomizeDecimal(0.5, 1.5) +
            3 * randomizeDecimal(0.5, 1.5) * statMultiplier;
          const crVampScaling =
            2 * randomizeDecimal(0.5, 1.5) +
            2 * randomizeDecimal(0.5, 1.5) * statMultiplier;

          let statValue;
          // Set randomized numbers to respective stats and increment sell value
          if (statType === "hp") {
            statValue = randomizeNum(hpScaling * 0.5, hpScaling);
            equipmentValue += statValue;
          } else if (statType === "atk") {
            statValue = randomizeNum(atkDefScaling * 0.5, atkDefScaling);
            equipmentValue += statValue * 2.5;
          } else if (statType === "def") {
            statValue = randomizeNum(atkDefScaling * 0.5, atkDefScaling);
            equipmentValue += statValue * 2.5;
          } else if (statType === "atkSpd") {
            statValue = randomizeDecimal(
              cdAtkSpdScaling * 0.5,
              cdAtkSpdScaling,
            );
            if (statValue > 15) {
              statValue = 15 * randomizeDecimal(0.5, 1);
              loopCount++;
            }
            equipmentValue += statValue * 8.33;
          } else if (statType === "vamp") {
            statValue = randomizeDecimal(crVampScaling * 0.5, crVampScaling);
            if (statValue > 8) {
              statValue = 8 * randomizeDecimal(0.5, 1);
              loopCount++;
            }
            equipmentValue += statValue * 20.83;
          } else if (statType === "critRate") {
            statValue = randomizeDecimal(crVampScaling * 0.5, crVampScaling);
            if (statValue > 10) {
              statValue = 10 * randomizeDecimal(0.5, 1);
              loopCount++;
            }
            equipmentValue += statValue * 20.83;
          } else if (statType === "critDmg") {
            statValue = randomizeDecimal(
              cdAtkSpdScaling * 0.5,
              cdAtkSpdScaling,
            );
            equipmentValue += statValue * 8.33;
          }

          // Cap maximum stat rolls for equipment rarities
          if (equipment.rarity === "Common" && loopCount > 3) {
            loopCount--;
          } else if (equipment.rarity === "Uncommon" && loopCount > 4) {
            loopCount--;
          } else if (equipment.rarity === "Rare" && loopCount > 5) {
            loopCount--;
          } else if (equipment.rarity === "Epic" && loopCount > 6) {
            loopCount--;
          } else if (equipment.rarity === "Legendary" && loopCount > 7) {
            loopCount--;
          } else if (equipment.rarity === "Heirloom" && loopCount > 9) {
            loopCount--;
          }

          // Check if stat type already exists in stats array
          let statExists = false;
          for (let j = 0; j < equipment.stats.length; j++) {
            if (Object.keys(equipment.stats[j])[0] === statType) {
              statExists = true;
              break;
            }
          }

          // If stat type already exists, add values together
          if (statExists) {
            for (let j = 0; j < equipment.stats.length; j++) {
              if (Object.keys(equipment.stats[j])[0] === statType) {
                equipment.stats[j][statType] += statValue;
                break;
              }
            }
          }

          // If stat type does not exist, add new stat to stats array
          else {
            equipment.stats.push({ [statType]: statValue });
          }
        }
        equipment.value = Math.round(equipmentValue * 3);
        player.inventory.equipment.push(JSON.stringify(equipment));

        saveData();
        gameServices.items.render();

        const itemShow = {
          category: equipment.category,
          rarity: equipment.rarity,
          lvl: equipment.lvl,
          tier: equipment.tier,
          icon: equipmentIcon(equipment.category),
          stats: equipment.stats,
        };
        return itemShow;
      },
    );
  };

const equipmentIcon =
  /* Resolve the existing category glyph without consuming randomness. */ (
    equipment,
  ) => {
    if (equipment === "Sword") {
      return '<i class="ra ra-relic-blade"></i>';
    } else if (equipment === "Axe") {
      return '<i class="ra ra-axe"></i>';
    } else if (equipment === "Hammer") {
      return '<i class="ra ra-flat-hammer"></i>';
    } else if (equipment === "Dagger") {
      return '<i class="ra ra-bowie-knife"></i>';
    } else if (equipment === "Flail") {
      return '<i class="ra ra-chain"></i>';
    } else if (equipment === "Scythe") {
      return '<i class="ra ra-scythe"></i>';
    } else if (equipment === "Plate") {
      return '<i class="ra ra-vest"></i>';
    } else if (equipment === "Chain") {
      return '<i class="ra ra-vest"></i>';
    } else if (equipment === "Leather") {
      return '<i class="ra ra-vest"></i>';
    } else if (equipment === "Tower") {
      return '<i class="ra ra-shield"></i>';
    } else if (equipment === "Kite") {
      return '<i class="ra ra-heavy-shield"></i>';
    } else if (equipment === "Buckler") {
      return '<i class="ra ra-round-shield"></i>';
    } else if (equipment === "Great Helm") {
      return '<i class="ra ra-knight-helmet"></i>';
    } else if (equipment === "Horned Helm") {
      return '<i class="ra ra-helmet"></i>';
    }
  };

// Resolve legacy entry points through the safe, revision-bound presentation owner.
const showItemInfo =
  /* Open the requested current holding without trusting caller markup. */ (
    item,
    icon,
    type,
    i,
  ) => gameServices.items.show(type === "Equip" ? "inventory" : "equipped", i);
const showInventory =
  /* Refresh both holding lists under one shared render revision. */ () =>
    gameServices.items.render();
const showEquipment =
  /* Refresh occupied slots together with inventory bindings. */ () =>
    gameServices.items.render();

// Apply the equipment stats to the player
const applyEquipmentStats =
  /* Recompute derived equipment totals before recalculating player stats. */ () => {
    // Reset the equipment stats
    player.equippedStats = {
      hp: 0,
      atk: 0,
      def: 0,
      atkSpd: 0,
      vamp: 0,
      critRate: 0,
      critDmg: 0,
    };

    for (let i = 0; i < player.equipped.length; i++) {
      const item = player.equipped[i];

      // Iterate through the stats array and update the player stats
      item.stats.forEach(
        /* Accumulate each equipped item contribution into its derived stat total. */ (
          stat,
        ) => {
          for (const key in stat) {
            player.equippedStats[key] += stat[key];
          }
        },
      );
    }
    calculateStats();
  };

const unequipAll =
  /* Return every equipped instance through the checked item boundary. */ () =>
    gameServices.items.bulk("unequip-all");
const sellAll =
  /* Preserve legacy sale order and rarity filters through the item boundary. */ (
    rarity,
  ) => gameServices.items.bulk("sell-all", rarity);

const createEquipmentPrint =
  /* Add a rolled item to the appropriate reward presentation. */ (
    condition,
  ) => {
    createEquipment();
    // The generator has already granted this exact holding, including its value and stats.
    const item = JSON.parse(
      player.inventory.equipment[player.inventory.equipment.length - 1],
    );
    const message = gameServices.narrative.record("inventory.reward", { item });
    if (condition === "combat") addCombatLog(message);
    else if (condition === "dungeon") addDungeonLog(message);
  };
