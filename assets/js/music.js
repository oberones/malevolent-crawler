// Preferences are replaced only after guarded initialization validates storage.
// Reassigned by the validated bridge in main.js; lexical ownership stays here.
// eslint-disable-next-line prefer-const
let volume = { master: 1, bgm: 0.4, sfx: 1 };
let sfxCombatEnd;

// BGM
let bgmDungeon;
let bgmBattleMain;
let bgmBattleBoss;
let bgmBattleGuardian;

// SFX
let sfxEncounter;
let sfxEnemyDeath;
let sfxAttack;
let sfxLvlUp;
let sfxConfirm;
let sfxDecline;
let sfxDeny;
let sfxEquip;
let sfxUnequip;
let sfxOpen;
let sfxPause;
let sfxUnpause;
let sfxSell;
let sfxItem;
let sfxBuff;

const setVolume =
  /* Replace and dispose audio resources using retained local volume preferences. */ () => {
    gameServices.audioLifecycle.invalidate();
    // ===== BGM =====
    bgmDungeon = new Howl({
      src: ["./assets/bgm/dungeon.webm", "./assets/bgm/dungeon.mp3"],
      volume: volume.bgm * volume.master,
      loop: true,
    });

    bgmBattleMain = new Howl({
      src: ["./assets/bgm/battle_main.webm", "./assets/bgm/battle_main.mp3"],
      volume: volume.bgm * volume.master,
      loop: true,
    });

    bgmBattleBoss = new Howl({
      src: ["./assets/bgm/battle_boss.webm", "./assets/bgm/battle_boss.mp3"],
      volume: volume.bgm * volume.master,
      loop: true,
    });

    bgmBattleGuardian = new Howl({
      src: [
        "./assets/bgm/battle_guardian.webm",
        "./assets/bgm/battle_guardian.mp3",
      ],
      volume: volume.bgm * volume.master,
      loop: true,
    });

    // ===== SFX =====
    sfxEncounter = new Howl({
      src: ["./assets/sfx/encounter.wav"],
      volume: volume.sfx * volume.master,
    });

    sfxCombatEnd = new Howl({
      src: ["./assets/sfx/combat_end.wav"],
      volume: volume.sfx * volume.master,
    });

    sfxAttack = new Howl({
      src: ["./assets/sfx/attack.wav"],
      volume: volume.sfx * volume.master,
    });

    sfxLvlUp = new Howl({
      src: ["./assets/sfx/level_up.wav"],
      volume: volume.sfx * volume.master,
    });

    sfxConfirm = new Howl({
      src: ["./assets/sfx/confirm.wav"],
      volume: volume.sfx * volume.master,
    });

    sfxDecline = new Howl({
      src: ["./assets/sfx/decline.wav"],
      volume: volume.sfx * volume.master,
    });

    sfxDeny = new Howl({
      src: ["./assets/sfx/denied.wav"],
      volume: volume.sfx * volume.master,
    });

    sfxEquip = new Howl({
      src: ["./assets/sfx/equip.wav"],
      volume: volume.sfx * volume.master,
    });

    sfxUnequip = new Howl({
      src: ["./assets/sfx/unequip.wav"],
      volume: volume.sfx * volume.master,
    });

    sfxOpen = new Howl({
      src: ["./assets/sfx/hover.wav"],
      volume: volume.sfx * volume.master,
    });

    sfxPause = new Howl({
      src: ["./assets/sfx/pause.wav"],
      volume: volume.sfx * volume.master,
    });

    sfxUnpause = new Howl({
      src: ["./assets/sfx/unpause.wav"],
      volume: volume.sfx * volume.master,
    });

    sfxSell = new Howl({
      src: ["./assets/sfx/sell.wav"],
      volume: volume.sfx * volume.master,
    });

    sfxItem = new Howl({
      src: ["./assets/sfx/item_use.wav"],
      volume: volume.sfx * volume.master,
    });

    sfxBuff = new Howl({
      src: ["./assets/sfx/buff.wav"],
      volume: volume.sfx * volume.master,
    });
    for (const audio of [
      bgmDungeon,
      bgmBattleMain,
      bgmBattleBoss,
      bgmBattleGuardian,
      sfxEncounter,
      sfxCombatEnd,
      sfxAttack,
      sfxLvlUp,
      sfxConfirm,
      sfxDecline,
      sfxDeny,
      sfxEquip,
      sfxUnequip,
      sfxOpen,
      sfxPause,
      sfxUnpause,
      sfxSell,
      sfxItem,
      sfxBuff,
    ])
      gameServices.audioLifecycle.ownAudio(audio);
  };
