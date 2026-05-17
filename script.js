const TOTAL_FLOORS = 20;
const START_LIFE = 3;
const BANK_KEY = "barbare_portes_binouse_bank";
const UPGRADES_KEY = "barbare_portes_binouse_upgrades";
const STATS_KEY = "barbare_portes_binouse_stats";

let fallbackBankGold = 0;
let fallbackUpgrades = {};
let fallbackStats = { losses: 0, wins: 0, goldBankedTotal: 0 };

const state = {
  screen: "cell",
  floor: TOTAL_FLOORS,
  totalFloors: TOTAL_FLOORS,
  life: START_LIFE,
  maxLife: START_LIFE,
  carriedGold: 0,
  bankGold: loadBankGold(),
  inventory: [],
  runEnded: false,
  combat: null,
  godMode: false,
  upgrades: loadUpgrades(),
  doorHints: [],
  floorShift: 0,
  storyTone: "neutral",
  eventToneOverride: null,
  villageLocation: "Village",
  stats: loadStats(),
  runLosses: 0,
  showWinBanner: false,
  lossRecorded: false,
  winRecorded: false,
  inputLocked: false,
  hodorPose: "idle",
  pendingCoinGain: 0,
  pendingPurseLoss: false,
  renderedLife: null,
};

const elementCache = new Map();
const $ = (id) => {
  if (!elementCache.has(id)) {
    elementCache.set(id, document.getElementById(id));
  }
  return elementCache.get(id);
};

const inventoryIconPaths = {
  "Hache Emoussee": "assets/Hodor V0.1/Stuff/Hache/inv-hache.png",
  "Medaillon du Presque-Heros": "assets/Hodor V0.1/Stuff/Medaillon du Presque-Heros/inv-medaillon.png",
  "Sandales de Panique": "assets/Hodor V0.1/Stuff/Sandales de Panique/inv-sandale.png",
  "Slip de Guerre": "assets/Hodor V0.1/Stuff/Slip de guerre/inv-slip de guerre.png",
};

document.addEventListener("click", (event) => {
  const door = event.target.closest(".door");
  if (door) {
    chooseDoor(door);
    return;
  }

  const strike = event.target.closest("[data-strike]");
  if (strike) {
    resolveCombat(strike.dataset.strike);
    return;
  }
});

addClick("bank-building", depositGold);
addClick("tavern-building", startRun);
addClick("shop-building", openShop);
addClick("close-shop", closeShop);
addClick("restart-action", startRun);
addClick("reset-save", resetBank);
addClick("debug-toggle", toggleDebug);
addClick("god-mode", toggleGodMode);
addClick("debug-add-bank", debugAddBank);
addClick("debug-go-village", debugGoVillage);
addClick("debug-clear-stuff", debugClearStuff);
addClick("inventory-toggle", toggleInventory);
addClick("inventory-close", closeInventory);

document.querySelectorAll("[data-debug-combat]").forEach((button) => {
  button.addEventListener("click", () => debugStartCombat(button.dataset.debugCombat));
});

document.querySelectorAll("[data-debug-stuff]").forEach((button) => {
  button.addEventListener("click", () => debugAddStuff(button.dataset.debugStuff));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeInventory();
});

document.addEventListener("click", (event) => {
  const popover = $("inventory-popover");
  if (!popover || popover.hidden) return;
  if (event.target.closest("#inventory-popover .inventory-card") || event.target.closest("#inventory-toggle")) return;
  closeInventory();
});

render();

function loadBankGold() {
  try {
    return Number(localStorage.getItem(BANK_KEY) || 0);
  } catch {
    return fallbackBankGold;
  }
}

function saveBankGold(value) {
  fallbackBankGold = value;
  try {
    localStorage.setItem(BANK_KEY, String(value));
  } catch {
    // La sauvegarde locale peut etre indisponible.
  }
}

function loadUpgrades() {
  try {
    return JSON.parse(localStorage.getItem(UPGRADES_KEY) || "{}");
  } catch {
    return fallbackUpgrades;
  }
}

function saveUpgrades() {
  fallbackUpgrades = { ...state.upgrades };
  try {
    localStorage.setItem(UPGRADES_KEY, JSON.stringify(state.upgrades));
  } catch {
    // La sauvegarde locale peut etre indisponible.
  }
}

function loadStats() {
  try {
    return { ...fallbackStats, ...JSON.parse(localStorage.getItem(STATS_KEY) || "{}") };
  } catch {
    return { ...fallbackStats };
  }
}

function saveStats() {
  fallbackStats = { ...state.stats };
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(state.stats));
  } catch {
    // La sauvegarde locale peut etre indisponible.
  }
}

function setStory(text, tone = "neutral") {
  state.storyTone = tone;
  const storyText = deathStoryText(text);
  const split = splitStoryReward(storyText);
  $("story").innerHTML = formatStory(split.story || "Hodor contemple le resultat avec une comprehension limitee.");
  setReward(split.reward);
  state.hodorPose = hodorPoseFromStory(storyText, tone);
}

function deathStoryText(text) {
  if (state.screen !== "mort") return text;
  if (/Les PO en poche sont perdues/i.test(text)) return text;
  return `${text} Les PO en poche sont perdues. Les gardes te renvoient dans les geoles.`;
}

function setReward(text) {
  const panel = $("reward-panel");
  const rewardText = $("reward-text");
  if (!panel || !rewardText) return;

  panel.hidden = !text;
  rewardText.innerHTML = text ? formatStory(text) : "";
  $("scene").classList.toggle("no-reward", !text);
  const rewardRaw = String(text || "");
  const coinGain = rewardRaw.match(/\+(\d+)\s*PO/i);
  state.pendingCoinGain = coinGain && !/banque/i.test(rewardRaw) ? Number(coinGain[1]) : 0;
  state.pendingPurseLoss = /bourse perdue/i.test(rewardRaw);
}

function hodorPoseFromStory(text, tone) {
  const content = normalizeText(text);
  const effectText = normalizeText(splitStoryReward(text).reward);
  const hasEffectItem = Boolean(knownItemInText(effectText));
  const itemWasLost = hasEffectItem && /perdu|perdue|pulverise|pulverisee|confisque|confisquee|se fend|se dechire|explose|reste sur place|partent ensuite|malediction|refuse la mort|annule la catastrophe/.test(content);
  const itemWasDuplicate = hasEffectItem && /deja|dommage|ricane|refuse le cumul|personne ne devrait/.test(content);
  if (/\+\d+\s*po|banque\s*\+\d+\s*po/.test(effectText)) return "victory";
  if (/-\d+\s*po|bourse perdue/.test(effectText)) return "releve";
  if (itemWasLost) return "ko";
  if (itemWasDuplicate) return "question";
  if (/\+\d+\s*coeur|caillou affectif|hache emoussee|casque trop petit|sandales de panique|medaillon|chaussette|gants|slip|cape/.test(effectText)) return "victory";
  if (/-\d+\s*etages/.test(effectText)) return "fuite";
  if (/\+\d+\s*etages/.test(effectText)) return "walk";
  if (/doublon|objet sauve|sauve/.test(effectText)) return "question";
  if (/monte-charge|service client/.test(content)) return "walk";
  if (/malediction|formulaire|vexee/.test(content)) return "question";
  if (/fresque|ressemble|personne ne sait|pourquoi|mystere|etrange|bizarre|statue|salle est vide|coffre.*vide|dramatique/.test(content)) return "question";
  if (/tu l'as deja|deja|dommage|rien|vide|affamee|pauvret/.test(content)) return "releve";
  if (/mort|ko|retour aux geoles|tombe avec la dignite/.test(content)) return "dead";
  if (/-\d+\s*coeur|mord|tire|violence|baffe|croche-pied|degat|douloureux|coup/.test(content)) return "hurt";
  if (/trappe|descente|trouves un objet|tu trouves un objet|recuperes un objet/.test(content)) return "victory";
  if (/achete|echoppe|vendeur|village/.test(content)) return "walk";
  if (tone === "good" || /\+\d+\s*po|\+\d+\s*coeur|trouves|ramasses|recuperes|gagne/.test(content)) return "victory";
  return "idle";
}

function splitStoryReward(text) {
  const sentences = String(text)
    .split(/(?<=\.)\s+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const story = [];
  const reward = [];

  sentences.forEach((sentence) => {
    const split = splitSentenceEffect(sentence);
    if (split.story) story.push(split.story);
    if (split.reward) reward.push(split.reward);
  });

  return {
    story: story.join(" "),
    reward: reward.join("\n"),
  };
}

function splitSentenceEffect(sentence) {
  const duplicate = duplicateItemEffect(sentence);
  if (duplicate) {
    return {
      story: "Tu trouves un objet. Le donjon ricane doucement.",
      reward: duplicate,
    };
  }

  const itemLoss = itemLossEffect(sentence);
  if (itemLoss) {
    return {
      story: cleanupStorySentence(stripKnownItem(sentence).replace(/Utilise puis perdu\s*:\s*[^.]+/i, "")),
      reward: itemLoss,
    };
  }

  const goldSaved = sentence.match(/Total sauvegarde\s*:\s*(\d+)\s*PO/i);
  if (goldSaved) {
    return {
      story: cleanupStorySentence(sentence.replace(/Total sauvegarde\s*:\s*\d+\s*PO/i, "")),
      reward: `Banque +${goldSaved[1]} PO`,
    };
  }

  if (/Les PO en poche sont perdues/i.test(sentence)) {
    return {
      story: cleanupStorySentence(sentence.replace(/Les PO en poche sont perdues/i, "")),
      reward: "Bourse perdue",
    };
  }

  const numericEffect = sentence.match(/([+-]\d+\s*(?:PO|coeur|etages))/i);
  if (numericEffect) {
    return {
      story: cleanupStorySentence(sentence.replace(numericEffect[0], "").replace(/\bmaximum\b/i, "")),
      reward: numericEffect[1],
    };
  }

  const goldEffect = goldEffectFromSentence(sentence);
  if (goldEffect) {
    const replacement = goldEffect.startsWith("-") ? "des pieces" : "quelques pieces";
    return {
      story: cleanupStorySentence(sentence.replace(/\d+\s*PO/i, replacement)),
      reward: goldEffect,
    };
  }

  const moveEffect = sentence.match(/(?:remontes?|descends?|gagne|perd)\s+(?:de\s+)?(\d+\s*etages)/i);
  if (moveEffect) {
    const sign = /remont|perd/i.test(sentence) ? "+" : "-";
    return {
      story: cleanupStorySentence(sentence
        .replace(/(?:remontes?|descends?|gagne|perd)\s+(?:de\s+)?\d+\s*etages/i, "")
        .replace(/\s*:\s*$/g, "")),
      reward: `${sign}${moveEffect[1]}`,
    };
  }

  const itemGain = itemGainEffect(sentence);
  if (itemGain) {
    return {
      story: cleanupStorySentence(stripKnownItem(sentence)),
      reward: itemGain,
    };
  }

  if (/ne casse pas/i.test(sentence)) {
    return { story: cleanupStorySentence(sentence), reward: "Objet sauve" };
  }

  if (/annule la catastrophe|evitent le pire|esquive/i.test(sentence)) {
    return { story: cleanupStorySentence(sentence), reward: "Sauve" };
  }

  return { story: sentence, reward: "" };
}

function goldEffectFromSentence(sentence) {
  const match = sentence.match(/(\d+)\s*PO/i);
  if (!match) return "";
  const amount = match[1];
  return /reclame|avale|roulent|vole|perd|paies/i.test(sentence)
    ? `-${amount} PO`
    : `+${amount} PO`;
}

function duplicateItemEffect(sentence) {
  if (!/deja|doublon|cumul/i.test(sentence)) return "";
  return knownItemInText(sentence);
}

function itemGainEffect(sentence) {
  if (/deja|perdu|pulverise|confisque|se fend|se dechire|explose/i.test(sentence)) return "";
  const item = knownItemInText(sentence);
  if (!item) return "";
  return item;
}

function itemLossEffect(sentence) {
  const item = knownItemInText(sentence);
  if (!item) return "";
  if (/perdu|pulverise|confisque|se fend|se dechire|explose|reste sur place|partent ensuite/i.test(sentence)) {
    return item;
  }
  return "";
}

function stripKnownItem(sentence) {
  const item = knownItemInText(sentence);
  if (!item) return sentence;
  const patterns = [
    new RegExp(`\\b${escapeRegExp(item)}\\b`, "gi"),
    ...itemAliasesFor(item).map((alias) => new RegExp(`\\b${escapeRegExp(alias)}\\b`, "gi")),
  ];
  return patterns
    .reduce((result, pattern) => result.replace(pattern, "un objet"), sentence)
    .replace(/\b(?:un|une|des|le|la|les)\s+un objet\b/gi, "un objet");
}

function itemAliasesFor(item) {
  const aliases = {
    "Casque Trop Petit": ["casque trop petit", "le casque trop petit"],
    "Slip de Guerre": ["slip de guerre", "le slip de guerre"],
    "Medaillon du Presque-Heros": ["medaillon", "medaillon du presque-heros", "un medaillon du presque-heros"],
    "Sandales de Panique": ["sandales de panique", "des sandales de panique"],
    "Hache Emoussee": ["hache emoussee", "une hache emoussee"],
    "Boulet au Pied": ["boulet au pied", "un boulet au pied"],
    "Chaussette Porte-Bonheur": ["chaussette porte-bonheur", "une chaussette porte-bonheur"],
    "Caillou Affectif": ["caillou affectif", "un caillou affectif"],
    "Cape Trop Longue": ["cape trop longue", "une cape trop longue"],
    "Gants Collants": ["gants collants", "des gants collants"],
  };
  return aliases[item] || [];
}

function knownItemInText(text) {
  if (typeof itemDescriptions === "undefined") return "";
  const normalized = normalizeText(text);
  return Object.keys(itemDescriptions)
    .sort((a, b) => b.length - a.length)
    .find((item) => {
      if (normalized.includes(normalizeText(item))) return true;
      return itemAliasesFor(item).some((alias) => normalized.includes(normalizeText(alias)));
    }) || "";
}

function cleanupStorySentence(sentence) {
  return sentence
    .replace(/contient\s+et\s+un mot/i, "contient un mot")
    .replace(/lache\s*\./i, "lache quelque chose.")
    .replace(/confisque ton objet\s*:\s*un objet/i, "confisque ton objet")
    .replace(/pulverise ton objet\s*:\s*un objet/i, "pulverise ton objet")
    .replace(/\s+([.,])/g, "$1")
    .replace(/\s*:\s*\./g, ".")
    .replace(/\.\.+/g, ".")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*[:.]\s*$/g, (match) => match.includes(".") ? "." : "")
    .replace(/^\.$/, "")
    .trim();
}

function normalizeText(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatStory(text) {
  return String(text)
    .split(/\n+|(?<=\.)\s+/)
    .map((line) => highlightGold(escapeHtml(line)))
    .join("<br>");
}

function highlightGold(text) {
  return highlightItems(text)
    .replace(/(annonce\s+)(\d+\s*etages)/g, '$1<span class="floor-total">$2</span>')
    .replace(/(-\d+\s*etages)/g, '<span class="floor-down">$1</span>')
    .replace(/(\+\d+\s*etages)/g, '<span class="floor-up">$1</span>')
    .replace(/(remonte(?:s)? de\s+)(\d+\s*etages)/g, '$1<span class="floor-up">$2</span>')
    .replace(/(descend(?:s)? de\s+)(\d+\s*etages)/g, '$1<span class="floor-down">$2</span>')
    .replace(/(\+?\d+\s*PO|PO)/g, '<span class="po-text">$1</span>')
    .replace(/(\+\d+\s*coeur)/g, '<span class="heart-good">$1</span>')
    .replace(/(-\d+\s*coeur(?:\s+bonus)?)/g, '<span class="heart-bad">$1</span>');
}

function highlightItems(text) {
  if (typeof itemDescriptions === "undefined") return text;

  const badLine = /perdu|pulverise|confisque|deja|se casse|se fend|explose|sacrifiant/i.test(text);
  const itemClass = badLine ? "item-bad" : "item-loot";
  const aliases = [
    "casque trop petit",
    "slip de guerre",
    "medaillon",
    "sandales de panique",
    "hache emoussee",
    "boulet au pied",
    "chaussette porte-bonheur",
    "caillou affectif",
    "cape trop longue",
    "gants collants",
  ];

  const withExactNames = Object.keys(itemDescriptions)
    .sort((a, b) => b.length - a.length)
    .reduce((result, item) => {
      const pattern = new RegExp(`\\b${escapeRegExp(item)}\\b`, "g");
      return result.replace(pattern, `<span class="${itemClass}">${item}</span>`);
    }, text);

  return aliases.reduce((result, alias) => {
    const pattern = new RegExp(`\\b${escapeRegExp(alias)}\\b`, "g");
    return result.replace(pattern, (match) => `<span class="${itemClass}">${match}</span>`);
  }, withExactNames);
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function snapshotRun() {
  return {
    life: state.life,
    maxLife: state.maxLife,
    carriedGold: state.carriedGold,
    inventoryCount: state.inventory.length,
    screen: state.screen,
  };
}

function toneFromSnapshot(before) {
  if (state.eventToneOverride) {
    const tone = state.eventToneOverride;
    state.eventToneOverride = null;
    return tone;
  }
  if (state.screen === "mort") return "bad";
  if (state.screen === "village" && before.screen !== "village") return "good";
  if (state.life < before.life || state.maxLife < before.maxLife || state.carriedGold < before.carriedGold || state.inventory.length < before.inventoryCount) return "bad";
  if (state.life > before.life || state.maxLife > before.maxLife || state.carriedGold > before.carriedGold || state.inventory.length > before.inventoryCount) return "good";
  return "neutral";
}

function addClick(id, handler) {
  const element = $(id);
  if (element) {
    element.addEventListener("click", handler);
  }
}

function upgradeLevel(id) {
  return state.upgrades[id] || 0;
}

function upgradeChance(id, values) {
  const level = upgradeLevel(id);
  if (level <= 0) return 0;
  return values[level - 1] || 0;
}

function openShop() {
  if (state.screen !== "village") return;
  state.showWinBanner = false;
  state.villageLocation = "Echoppe";
  state.screen = "shop";
  state.hodorPose = "walk";
  setStory("Le vendeur sourit avec toutes ses dents, y compris certaines qui ne sont probablement pas a lui.");
  render();
}

function closeShop() {
  if (state.screen !== "shop") return;
  state.showWinBanner = false;
  state.villageLocation = "Village";
  state.screen = "village";
  setStory("Hodor ressort de l'echoppe avec l'impression d'avoir investi dans son avenir. Mauvais signe.");
  render();
}

function buyUpgrade(id) {
  const upgrade = upgradeDefinitions[id];
  const current = upgradeLevel(id);
  const cost = upgrade.costs[current];

  if (cost === undefined) {
    setStory(`${upgrade.name} est deja au maximum. Meme l'arnaque a ses limites.`);
    return;
  }

  if (state.bankGold < cost) {
    setStory(`Il te manque ${cost - state.bankGold} PO pour acheter ${upgrade.name}. Le vendeur fait semblant d'etre triste.`, "bad");
    return;
  }

  state.bankGold -= cost;
  state.upgrades[id] = current + 1;
  saveBankGold(state.bankGold);
  saveUpgrades();
  setStory(`${upgrade.name} niveau ${current + 1} achete. Hodor se sent progresser, ou peut-etre c'est une allergie.`, "good");
  render();
}

function chooseDoor(door) {
  if (state.runEnded || state.screen !== "dungeon" || state.inputLocked) return;

  flashDoor(door);
  state.inputLocked = true;
  setStory("Hodor pose la main sur la poignee. Le donjon retient son souffle, probablement pour economiser l'air.");
  render();

  window.setTimeout(() => resolveDoorChoice(), 2000);
}

function resolveDoorChoice() {
  if (state.floor === 1) {
    const before = snapshotRun();
    setStory(finalDoorOutcome(), toneFromSnapshot(before));
    state.inputLocked = false;
    resetDoorEffects();
    render();
    return;
  }

  const before = snapshotRun();
  const text = weightedEvent().run();
  let suffix = "";

  if (!state.runEnded && state.screen === "dungeon") {
    suffix = descendFloor();
  }

  setStory(text + suffix, toneFromSnapshot(before));
  prepareDoorHints();
  state.inputLocked = false;
  resetDoorEffects();
  render();
}

function finalDoorOutcome() {
  const roll = Math.random();

  if (roll < 0.68) {
    state.screen = "village";
    state.runEnded = true;
    state.life = state.maxLife;
    recordWin();
    return "La derniere porte s'ouvre enfin. Dehors, le village fait semblant d'avoir cru en Hodor depuis le debut.";
  }

  if (roll < 0.92) {
    return takeDamage(1, "La derniere porte s'ouvre sur deux gardes qui attendaient la pause cafe. Ils improvisent avec ton visage. -1 coeur.");
  }

  return takeDamage(2, "La derniere porte avait une pancarte 'Sortie'. C'etait juridiquement discutable. Le mur derriere la porte te l'explique. -2 coeur.");
}

function prepareDoorHints() {
  state.doorHints = ["", "", ""];
  if (state.screen !== "dungeon" || state.floor === 1) return;
  const level = upgradeLevel("lecture");
  if (Math.random() >= upgradeChance("lecture", [0.58, 0.78, 1])) return;

  const hints = doorHintPool(level);
  const index = randomInt(0, 2);
  const falseHint = Math.random() < (0.45 - level * 0.08);
  state.doorHints[index] = falseHint
    ? `Indice foireux : ${randomFrom(hints.false)}`
    : `Indice : ${randomFrom(hints.true)}`;
}

function doorHintPool(level) {
  const base = {
    true: [
      "ca sent l'or",
      "ca grogne",
      "ca pique",
      "silence suspect",
      "courant d'air",
      "ca sent la cave humide",
      "bruit de pieces",
      "ronflement pas rassurant",
    ],
    false: [
      "panneau menteur",
      "promis juré, aucun piege",
      "odeur de victoire douteuse",
      "ca a l'air presque legal",
      "le donjon insiste beaucoup",
    ],
  };

  if (level >= 2) {
    base.true.push(
      "probable coffre ou arnaque brillante",
      "bruit de ferraille en colere",
      "escalier quelque part, peut-etre meme utile",
      "air frais, ou cadavre tres poli",
      "quelque chose gratte la porte"
    );
    base.false.push(
      "un bruit louche, ou juste un mensonge administratif",
      "la porte fait semblant d'etre gentille",
      "ca clignote comme une mauvaise idee",
      "l'inscription a ete ecrite par un mur"
    );
  }

  if (level >= 3) {
    base.true.push(
      "forte chance de combat",
      "ca ressemble a du butin",
      "risque de baffe, pas forcement de mort",
      "possible raccourci vertical",
      "odeur de boutique sans vendeur"
    );
    base.false.push(
      "indice premium, donc probablement nul",
      "la porte essaye trop fort",
      "statistiquement ridicule, donc tentant",
      "Hodor comprend l'indice, mauvais signe"
    );
  }

  return base;
}

function startCombat(monster) {
  state.screen = "combat";
  state.combat = monster;
  state.hodorPose = "combat";
  return `${monster.intro} Hodor doit choisir une strategie, ce qui est deja un piege.`;
}

function resolveCombat(strike) {
  if (state.screen !== "combat" || !state.combat || state.inputLocked) return;

  const monster = state.combat;
  const before = snapshotRun();
  const attackPose = Math.random() < 0.5 ? "combat-2" : "combat-3";
  state.inputLocked = true;
  state.hodorPose = attackPose;
  render();

  window.setTimeout(() => {
    const outcome = combatOutcome(monster, strike);
    state.combat = null;
    state.inputLocked = false;

    if (!state.runEnded) {
      state.screen = "dungeon";
      setStory(outcome + descendFloor(), toneFromSnapshot(before));
      prepareDoorHints();
    } else {
      setStory(outcome, toneFromSnapshot(before));
    }
    render();
  }, 2000);
}

function combatOutcome(monster, strike) {
  const profile = {
    head: { win: 0.42, hurt: 0.28, loseItem: 0.16, death: monster.danger + 0.08 },
    legs: { win: 0.55, hurt: 0.25, loseItem: 0.14, death: monster.danger - 0.04 },
    torso: { win: 0.5, hurt: 0.3, loseItem: 0.12, death: monster.danger },
  }[strike];

  let winChance = profile.win;
  let deathChance = Math.max(0.03, profile.death);
  const usedItems = [];

  if (hasItem("Hache Emoussee") && strike !== "legs") {
    winChance += 0.12;
    usedItems.push("Hache Emoussee");
  }
  if (hasItem("Casque Trop Petit") && strike === "head") {
    deathChance -= 0.06;
    usedItems.push("Casque Trop Petit");
  }
  if (hasItem("Sandales de Panique") && strike === "legs") {
    winChance += 0.1;
    usedItems.push("Sandales de Panique");
  }
  if (hasItem("Slip de Guerre")) {
    deathChance -= 0.03;
    usedItems.push("Slip de Guerre");
  }

  const roll = Math.random();
  const strikeText = strikeLabel(strike);

  if (roll < deathChance) {
    return useCombatItems(instantDeath(`Tu tentes de ${strikeText}. ${monster.name} repond avec une violence pedagogique.`), usedItems);
  }

  if (roll < deathChance + profile.loseItem && state.inventory.length) {
    const lost = removeRandomItem();
    return useCombatItems(`Tu tentes de ${strikeText}. Tu survis, mais ${monster.name} pulverise ton objet : ${lost}.`, usedItems);
  }

  if (roll < deathChance + profile.loseItem + profile.hurt) {
    return useCombatItems(takeDamage(1, `Tu tentes de ${strikeText}. ${monster.name} trouve ton plan nul et te le prouve. -1 coeur.`), usedItems);
  }

  if (roll < deathChance + profile.loseItem + profile.hurt + winChance) {
    const gold = randomInt(monster.reward[0], monster.reward[1]);
    return useCombatItems(addGold(gold, `Tu tentes de ${strikeText}. Contre toute logique, ca marche. +${gold} PO.`), usedItems);
  }

  return useCombatItems(`Tu tentes de ${strikeText}. Vous vous ratez tous les deux. C'est presque choregraphie.`, usedItems);
}

function useCombatItems(text, items) {
  const consumed = [];
  const item = items.find((candidate) => hasItem(candidate));
  if (item) {
    if (Math.random() < itemBreakChance(item)) {
      removeItem(item);
      consumed.push(item);
      if (item === "Slip de Guerre") {
        state.maxLife = Math.max(START_LIFE, state.maxLife - 1);
        state.life = Math.min(state.life, state.maxLife);
      }
    } else {
      return `${text} ${item} a servi, mais ne casse pas cette fois. Miracle comptable.`;
    }
  }

  if (!consumed.length) return text;
  return `${text} Utilise puis perdu : ${consumed.join(", ")}.`;
}

function itemBreakChance(item) {
  if (item === "Medaillon du Presque-Heros") return 1;
  if (item === "Slip de Guerre") return 0.45;
  return 0.35;
}

function strikeLabel(strike) {
  if (strike === "head") return "taper dans la tete";
  if (strike === "legs") return "taper dans les jambes";
  return "taper dans le torse";
}

function descendFloor() {
  if (state.floorShift) {
    state.floor += state.floorShift;
    state.floor = Math.min(state.totalFloors, state.floor);
    state.floorShift = 0;
  } else {
    state.floor -= 1;
  }
  if (state.floor <= 0) {
    state.screen = "village";
    state.runEnded = true;
    state.life = state.maxLife;
    recordWin();
    return " Hodor voit enfin la sortie. Il a survecu, ce qui surprend tout le monde, surtout lui.";
  }
  return "";
}

function shiftFloors(amount) {
  state.floorShift = amount;
}

function recordWin() {
  if (state.winRecorded) return;
  state.winRecorded = true;
  state.showWinBanner = true;
  state.villageLocation = "Enfin dehors";
  state.stats.wins += 1;
  saveStats();
}

function koTaunt() {
  const losses = Math.max(1, state.runLosses);
  const taunts = [
    "T'as perdu, gros nul.",
    `Ca fait ${losses} fois que tu perds. Le donjon garde les tickets.`,
    `${losses} defaite${losses > 1 ? "s" : ""}. A ce stade, c'est presque une competence.`,
    "Retour aux geoles. Meme la porte a soupire.",
    `Encore perdu. Hodor invente le speedrun de l'echec numero ${losses}.`,
  ];
  return taunts[(losses - 1) % taunts.length];
}

function winTaunt() {
  const wins = Math.max(1, state.stats.wins);
  const taunts = [
    "T'as gagne, t'es trop notre heros. Personne n'avait prevu ce scenario.",
    "Hodor est vivant. Le village applaudit par prudence.",
    `Sortie numero ${wins}. La competence commence a ressembler a un accident repetable.`,
  ];
  return taunts[(wins - 1) % taunts.length];
}

function villageShameText() {
  const wins = state.stats.wins || 0;
  const losses = state.stats.losses || 0;
  const balance = wins - losses;

  if (wins === 0 && losses === 0) return "Dignite : pas encore mesuree";
  if (balance >= 8) return "Dignite : legendaire";
  if (balance >= 5) return "Dignite : formidable";
  if (balance >= 2) return "Dignite : presque propre";
  if (balance >= 0) return "Dignite : fragile mais presente";
  if (balance >= -2) return "Dignite : cabossee";
  if (balance >= -5) return "Dignite : merdique";
  return "Dignite : portee disparue au combat";
}

function flashDoor(door) {
  $("doors").classList.add("resolving");
  door.classList.remove("chosen");
  requestAnimationFrame(() => {
    door.classList.add("chosen");
  });
}

function resetDoorEffects() {
  $("doors").classList.remove("resolving");
  document.querySelectorAll(".door").forEach((door) => {
    door.classList.remove("chosen");
  });
}

function addGold(amount, text) {
  let gained = amount;
  let suffix = "";

  if (hasItem("Gants Collants") && Math.random() < 0.35) {
    gained += 1;
    suffix = " Les gants collants ramassent 1 PO de plus, et probablement autre chose.";
  }

  state.carriedGold += gained;
  return text.replace(`+${amount} PO`, `+${gained} PO`) + suffix;
}

function takeDamage(amount, text) {
  if (state.godMode) {
    return `${text} God mode absorbe le degat. Hodor ne comprend pas, mais il approuve.`;
  }

  if (hasItem("Boulet au Pied") && Math.random() < 0.18) {
    text = `${text} Le boulet au pied rend l'esquive impossible. Il fait un bruit humiliant.`;
  }

  if (Math.random() < upgradeChance("reflexes", [0.16, 0.26, 0.38])) {
    if (state.inventory.length && Math.random() < 0.25) {
      const lost = removeRandomItem();
      return `${text} Reflexes de Lache declenche une esquive, mais ${lost} reste sur place pour couvrir la retraite.`;
    }
    return `${text} Reflexes de Lache declenche une esquive moche mais efficace.`;
  }

  if (hasItem("Cape Trop Longue") && Math.random() < 0.12) {
    removeItem("Cape Trop Longue");
    state.life -= 1;
    if (state.life <= 0) {
      state.life = 0;
      endRun("mort");
    }
    return `${text} La cape trop longue s'enroule autour de tes jambes. -1 coeur bonus, puis elle se dechire.`;
  }

  if (hasItem("Sandales de Panique") && Math.random() < 0.16) {
    removeItem("Sandales de Panique");
    return `${text} Mais tes sandales paniquent avant toi et t'evitent le pire. Elles partent ensuite vivre leur propre vie.`;
  }

  if (hasItem("Casque Trop Petit") && Math.random() < 0.22) {
    removeItem("Casque Trop Petit");
    return `${text} Le casque trop petit bloque le coup, comprime une pensee inutile, puis se fend en deux.`;
  }

  state.life -= amount;
  if (state.life <= 0) {
    if (hasItem("Medaillon du Presque-Heros")) {
      removeItem("Medaillon du Presque-Heros");
      state.life = 1;
      return `${text} Medaillon du Presque-Heros explose et refuse la mort. Hodor ne comprend pas la procedure, mais il vit.`;
    }
    state.life = 0;
    endRun("mort");
  }
  return text;
}

function instantDeath(text) {
  if (state.godMode) {
    return `${text} God mode refuse la mort avec une mauvaise foi admirable.`;
  }

  if (hasItem("Medaillon du Presque-Heros")) {
    removeItem("Medaillon du Presque-Heros");
    return `${text} Medaillon du Presque-Heros explose et annule la catastrophe. Hodor hoche la tete comme s'il avait prevu le coup.`;
  }

  const pityChance = Math.min(0.45, state.runLosses * 0.08);
  if (pityChance && Math.random() < pityChance) {
    return takeDamage(1, `${text} Le donjon hesite devant tant d'echec et transforme ca en grosse baffe. -1 coeur.`);
  }

  if (Math.random() < upgradeChance("instinct", [0.18, 0.3, 0.44])) {
    return takeDamage(1, `${text} Instinct Presque Fiable transforme la mort en catastrophe moins definitive. -1 coeur.`);
  }

  endRun("mort");
  return text;
}

function endRun(screen) {
  state.screen = screen;
  state.runEnded = true;
  state.combat = null;
  if (screen === "mort") {
    state.life = 0;
    state.carriedGold = 0;
    recordLoss();
  }
}

function recordLoss() {
  if (state.lossRecorded || state.winRecorded) return;
  state.lossRecorded = true;
  state.stats.losses += 1;
  state.runLosses += 1;
  saveStats();
}

function depositGold() {
  if (state.screen !== "village") return;
  state.showWinBanner = false;
  state.villageLocation = "Banque";
  const deposited = state.carriedGold;
  const soldItems = sellInventory();
  const totalDeposited = deposited + soldItems.total;
  state.bankGold += totalDeposited;
  state.stats.goldBankedTotal = (state.stats.goldBankedTotal || 0) + totalDeposited;
  state.carriedGold = 0;
  saveBankGold(state.bankGold);
  saveStats();
  setStory(bankDepositText(deposited, soldItems), deposited || soldItems.total ? "good" : "neutral");
  render();
}

function sellInventory() {
  if (!state.inventory.length) {
    return { total: 0, details: [] };
  }

  const details = state.inventory.map((item) => ({
    item,
    value: itemSaleValues[item] ?? 1,
  }));
  const total = details.reduce((sum, entry) => sum + entry.value, 0);
  state.inventory = [];
  return { total, details };
}

function bankDepositText(deposited, soldItems) {
  if (!deposited && !soldItems.total && !soldItems.details.length) {
    return "Le banquier regarde ta bourse vide, soupire, puis referme son registre avec beaucoup de professionnalisme.";
  }

  const lines = [];
  if (deposited) {
    lines.push("Le banquier depose ta bourse dans le coffre.");
  }
  if (soldItems.details.length) {
    lines.push("Il revend aussi tes objets avec une joie trop visible.");
  }
  lines.push(`Total sauvegarde : ${deposited + soldItems.total} PO.`);
  return lines.join(" ");
}

function startRun() {
  const resetLossStreak = state.screen === "village" || state.screen === "shop" || state.screen === "cell";
  const floorRange = runFloorRange();
  state.showWinBanner = false;
  state.villageLocation = "Village";
  state.screen = "dungeon";
  state.totalFloors = randomInt(floorRange.min, floorRange.max);
  state.floor = state.totalFloors;
  state.life = START_LIFE;
  state.maxLife = START_LIFE;
  state.carriedGold = 0;
  state.inventory = [];
  state.runEnded = false;
  state.combat = null;
  state.doorHints = [];
  state.inputLocked = false;
  state.floorShift = 0;
  if (resetLossStreak) {
    state.runLosses = 0;
  }
  state.lossRecorded = false;
  state.winRecorded = false;
  applyRunUpgrades();
  prepareDoorHints();
  setStory("Hodor force la porte des geoles avec beaucoup d'optimisme et tres peu de technique. Trois portes l'attendent. Bonne chance.");
  state.hodorPose = "fuite";
  render();
}

function runFloorRange() {
  const wins = state.stats.wins;
  if (wins < 10) return { min: 5, max: 10 };
  if (wins < 20) return { min: 10, max: 15 };
  if (wins < 30) return { min: 15, max: 20 };
  if (wins < 40) return { min: 20, max: 25 };
  return { min: 25, max: 30 };
}

function applyRunUpgrades() {
  if (Math.random() < upgradeChance("cardio", [0.35, 0.5, 0.68])) {
    if (Math.random() < 0.82) {
      state.maxLife += 1;
      state.life += 1;
    } else {
      state.maxLife = Math.max(1, state.maxLife - 1);
      state.life = Math.min(state.life, state.maxLife);
    }
  }

  if (Math.random() < upgradeChance("colis", [0.36, 0.52, 0.7])) {
    const item = randomStartingItem();
    state.inventory.push(item);
  }
}

function randomStartingItem() {
  const items = [
    "Casque Trop Petit",
    "Medaillon du Presque-Heros",
    "Sandales de Panique",
    "Hache Emoussee",
    "Boulet au Pied",
    "Chaussette Porte-Bonheur",
    "Caillou Affectif",
    "Cape Trop Longue",
    "Gants Collants",
  ];
  return items[randomInt(0, items.length - 1)];
}

function randomDungeonItemText() {
  const item = randomStartingItem();
  const texts = {
    "Casque Trop Petit": "Tu trouves un casque trop petit sous une pancarte 'taille universelle'. Mensonge artisanal.",
    "Medaillon du Presque-Heros": "Tu ramasses un medaillon du presque-heros. Il brille comme une promesse pas tenue.",
    "Sandales de Panique": "Tu trouves des sandales de panique. Elles tremblent deja sans toi.",
    "Hache Emoussee": "Tu recuperes une hache emoussee. Elle menace surtout la patience des ennemis.",
    "Boulet au Pied": "Tu trouves un boulet au pied. Hodor appelle ca un accessoire de caractere.",
    "Chaussette Porte-Bonheur": "Tu trouves une chaussette porte-bonheur. Elle sent la chance humide.",
    "Caillou Affectif": "Tu adoptes un caillou affectif. Il ne sert a rien, mais il ecoute.",
    "Cape Trop Longue": "Tu trouves une cape trop longue. Elle a deja fait tomber son ancien proprietaire.",
    "Gants Collants": "Tu enfiles des gants collants. Ils ont l'air de connaitre trop de poches.",
  };
  return addItem(item, texts[item] || `Tu trouves ${item}. Le donjon refuse d'expliquer pourquoi.`);
}

function resetBank() {
  state.bankGold = 0;
  saveBankGold(0);
  setStory("La banque est videe. Le banquier sourit, ce qui n'est jamais bon signe.", "bad");
  $("debug-panel").hidden = true;
  $("debug-toggle").setAttribute("aria-expanded", "false");
  render();
}

function toggleDebug() {
  const panel = $("debug-panel");
  panel.hidden = !panel.hidden;
  $("debug-toggle").setAttribute("aria-expanded", String(!panel.hidden));
}

function toggleGodMode() {
  state.godMode = !state.godMode;
  render();
}

function debugBankAmount() {
  const value = Number($("debug-bank-amount").value || 0);
  return Math.max(0, Math.floor(value));
}

function debugAddBank() {
  const amount = debugBankAmount();
  state.bankGold += amount;
  saveBankGold(state.bankGold);
  setStory(`Debug : ${amount} PO ajoutes a la banque. Le banquier n'a rien vu, officiellement.`, "good");
  render();
}

function debugGoVillage() {
  state.screen = "village";
  state.showWinBanner = false;
  state.villageLocation = "Village";
  state.floor = 0;
  state.runEnded = true;
  state.combat = null;
  state.doorHints = [];
  setStory("Debug : Hodor apparait au village sans explication credible.", "good");
  render();
}

function debugStartCombat(monsterId) {
  const monster = monsters[monsterId] || monsters.rat;
  state.runEnded = false;
  state.showWinBanner = false;
  state.inputLocked = false;
  state.lossRecorded = false;
  state.winRecorded = false;
  state.floor = state.floor > 0 ? state.floor : randomInt(5, 10);
  state.maxLife = Math.max(state.maxLife || START_LIFE, START_LIFE);
  state.life = Math.max(1, state.life || state.maxLife);
  state.doorHints = [];
  $("debug-panel").hidden = true;
  $("debug-toggle").setAttribute("aria-expanded", "false");
  setStory(startCombat(monster), "neutral");
  render();
}

function debugAddStuff(item) {
  if (!itemDescriptions[item]) {
    setStory("Debug : objet introuvable. Meme le menu triche vient de rater son jet.", "bad");
    render();
    return;
  }

  const alreadyEquipped = hasItem(item);
  if (!alreadyEquipped) {
    state.inventory.push(item);
  }

  state.hodorPose = "victory";
  setStory(
    alreadyEquipped
      ? `Debug : ${item} est deja dans les poches. Hodor insiste quand meme pour avoir l'air equipe.`
      : `Debug : ${item} ajoute. Hodor parade avec un serieux inquietant.`,
    alreadyEquipped ? "neutral" : "good"
  );
  render();
}

function debugClearStuff() {
  state.inventory = [];
  state.hodorPose = "question";
  setStory("Debug : stuff vide. Hodor regarde ses mains comme si c'etait un plan.", "neutral");
  render();
}

function renderShop() {
  const grid = $("upgrade-grid");
  grid.textContent = "";

  Object.entries(upgradeDefinitions).forEach(([id, upgrade]) => {
    const level = upgradeLevel(id);
    const cost = upgrade.costs[level];
    const card = document.createElement("article");
    card.className = "upgrade-card";

    const title = document.createElement("strong");
    title.textContent = upgrade.name;

    const meta = document.createElement("span");
    meta.textContent = `Niveau ${level} / ${upgrade.costs.length}`;

    const desc = document.createElement("p");
    desc.textContent = upgrade.description;

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = cost === undefined ? "Maximum" : `Acheter - ${cost} PO`;
    button.disabled = cost === undefined || state.bankGold < cost;
    button.addEventListener("click", () => buyUpgrade(id));

    card.append(title, meta, desc, button);
    grid.appendChild(card);
  });
}

function addItem(item, text) {
  if (!hasItem(item)) {
    state.inventory.push(item);
    state.eventToneOverride = "good";
    return text;
  }
  state.eventToneOverride = "bad";
  return itemDuplicateTexts[item] || `Tu trouves ${item}, mais tu l'as deja. Dommage. Le donjon ricane doucement.`;
}

function removeItem(item) {
  state.inventory = state.inventory.filter((owned) => owned !== item);
}

function removeRandomItem() {
  const index = randomInt(0, state.inventory.length - 1);
  const item = state.inventory[index];
  state.inventory.splice(index, 1);
  return item;
}

function hasItem(item) {
  return state.inventory.includes(item);
}

function toggleInventory() {
  const popover = $("inventory-popover");
  const toggle = $("inventory-toggle");
  const shouldOpen = popover.hidden;
  popover.hidden = !shouldOpen;
  toggle.setAttribute("aria-expanded", String(shouldOpen));
}

function closeInventory() {
  const popover = $("inventory-popover");
  const toggle = $("inventory-toggle");
  if (!popover || popover.hidden) return;
  popover.hidden = true;
  if (toggle) toggle.setAttribute("aria-expanded", "false");
}

function renderInventory() {
  const inventory = $("inventory");
  const toggle = $("inventory-toggle");
  inventory.textContent = "";
  const total = state.inventory.length + Object.values(state.upgrades).filter((level) => level > 0).length;
  if (toggle) {
    toggle.classList.toggle("has-items", total > 0);
  }

  if (!state.inventory.length) {
    const empty = document.createElement("p");
    empty.className = "inventory-empty";
    empty.textContent = "Aucun objet dans le sac. Beaucoup d'assurance, par contre.";
    inventory.appendChild(empty);
    return;
  }

  state.inventory.forEach((item) => {
    const icon = inventoryIconPaths[item];
    if (icon) {
      const button = document.createElement("button");
      button.className = "inventory-item";
      button.type = "button";
      button.dataset.tooltip = itemDescriptions[item] || "Objet mystere. Meme le donjon a perdu la notice.";

      const image = document.createElement("img");
      image.src = icon;
      image.alt = item;

      const label = document.createElement("span");
      label.textContent = item;

      button.append(image, label);
      inventory.appendChild(button);
      return;
    }

    const chip = document.createElement("span");
    chip.className = "item-chip inventory-fallback";
    chip.tabIndex = 0;
    chip.textContent = item;
    chip.dataset.tooltip = itemDescriptions[item] || "Objet mystere. Meme le donjon a perdu la notice.";
    inventory.appendChild(chip);
  });
}

function renderUpgradeSummary() {
  const summary = $("upgrade-summary");
  summary.textContent = "";

  Object.entries(upgradeDefinitions).forEach(([id, upgrade]) => {
    const level = upgradeLevel(id);
    if (!level) return;

    const chip = document.createElement("span");
    chip.className = "upgrade-chip";
    chip.tabIndex = 0;
    chip.textContent = `${upgrade.name} ${level}/${upgrade.costs.length}`;
    chip.dataset.tooltip = upgrade.description;
    summary.appendChild(chip);
  });
}

function weightedEvent() {
  const total = eventPool.reduce((sum, event) => sum + event.weight, 0);
  let roll = Math.random() * total;
  for (const event of eventPool) {
    roll -= event.weight;
    if (roll <= 0) return event;
  }
  return eventPool[0];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom(list) {
  return list[randomInt(0, list.length - 1)];
}

function render() {
  if (state.screen === "village" || state.screen === "shop") {
    state.life = state.maxLife;
  }

  const showsFloor = state.screen === "dungeon" || state.screen === "combat";
  $("place-label").textContent = showsFloor ? "Etage" : "Lieu";
  $("floor").textContent = state.screen === "village" || state.screen === "shop"
    ? "Village"
    : state.screen === "cell"
      ? "Cellule"
      : state.screen === "mort"
        ? "Geoles"
        : state.floor;
  $("carried-gold").textContent = state.carriedGold;
  $("bank-gold").textContent = state.bankGold;
  $("bank-building-gold").textContent = state.bankGold;
  $("loss-count").textContent = state.runLosses;
  $("village-loss-count").textContent = state.stats.losses || 0;
  $("village-win-count").textContent = state.stats.wins;
  $("village-bank-count").textContent = state.stats.goldBankedTotal || 0;
  $("village-shame").textContent = villageShameText();
  renderHearts();
  renderPurse();
  renderInventory();
  renderUpgradeSummary();

  const isDungeon = state.screen === "dungeon";
  const isCombat = state.screen === "combat";
  const isVillage = state.screen === "village";
  const isDead = state.screen === "mort";
  const isCell = state.screen === "cell";
  const isShop = state.screen === "shop";

  $("scene").classList.toggle("is-dead", isDead);
  $("scene").classList.toggle("is-combat", isCombat);
  $("scene").classList.toggle("is-village", isVillage || isShop);
  $("scene").classList.toggle("is-dungeon", isDungeon || isCombat);
  $("scene").classList.toggle("is-cell", isCell);
  $("scene").classList.toggle("is-locked", state.inputLocked);
  $("scene").classList.toggle("has-win-banner", isVillage && state.showWinBanner);
  $("scene").classList.toggle("story-good", state.storyTone === "good" && !isDead);
  $("scene").classList.toggle("story-bad", state.storyTone === "bad" && !isDead);
  $("scene").classList.toggle("story-neutral", state.storyTone === "neutral" && !isDead);
  $("bank-score").hidden = !isShop;
  $("loss-score").hidden = isVillage || isShop;
  renderHodor();

  $("location").textContent = isVillage
    ? state.villageLocation
    : isDead
      ? "Retour aux geoles"
      : isCell
        ? "Dans ta cellule"
        : isShop
          ? "Echoppe douteuse"
          : isCombat
            ? "Ca va taper"
            : "Couloirs du donjon";

  $("doors").hidden = !isDungeon;
  $("combat-choices").hidden = !isCombat;
  const monsterAsset = state.combat?.asset;
  const usesMonsterTarget = isCombat && Boolean(monsterAsset);
  $("combat-choices").classList.toggle("has-monster-target", usesMonsterTarget);
  $("monster-target").hidden = !usesMonsterTarget;
  $("monster-target").className = `monster-target ${monsterAsset ? `${monsterAsset}-target` : ""}`.trim();
  $("village-choices").hidden = !isVillage;
  $("shop-panel").hidden = !isShop;
  $("death-choices").hidden = !(isDead || isCell);
  $("ko-banner").hidden = !isDead;
  $("win-banner").hidden = !(isVillage && state.showWinBanner);
  $("ko-taunt").textContent = koTaunt();
  $("win-taunt").textContent = winTaunt();

  document.querySelectorAll(".door").forEach((door) => {
    door.disabled = !isDungeon || state.inputLocked;
  });

  document.querySelectorAll("[data-strike]").forEach((button) => {
    button.disabled = !isCombat || state.inputLocked;
  });

  document.querySelectorAll(".door-hint").forEach((hint, index) => {
    hint.textContent = state.doorHints[index] || "";
    hint.hidden = !state.doorHints[index];
  });

  if (isShop) renderShop();

  $("god-mode").textContent = `God mode : ${state.godMode ? "ON" : "OFF"}`;
  $("god-mode").setAttribute("aria-pressed", String(state.godMode));
  $("restart-label").textContent = isCell ? "Sortir de sa cellule" : "S'echapper des geoles";
  $("restart-help").textContent = isCell
    ? "La porte grince. Hodor appelle ca de la discretion."
    : "Les gardes t'ont ramene en haut. Ils auraient du mieux fermer.";

  playPendingCoinAnimation();
  playPendingPurseLossAnimation();
}

function playPendingCoinAnimation() {
  if (!state.pendingCoinGain || state.pendingCoinGain <= 0) return;
  const rewardPanel = $("reward-panel");
  const purse = document.querySelector(".stat-purse .purse-visual") || document.querySelector(".stat-purse");
  if (!rewardPanel || rewardPanel.hidden || !purse) return;

  const from = rewardPanel.getBoundingClientRect();
  const to = purse.getBoundingClientRect();
  if (!from.width || !to.width) return;

  const coinX = to.left + to.width / 2 - (from.left + from.width / 2);
  const coinY = to.top + to.height / 2 - (from.top + from.height / 2);
  const coinCount = Math.min(5, Math.max(1, state.pendingCoinGain));
  for (let index = 0; index < coinCount; index += 1) {
    const coin = document.createElement("span");
    const offset = (index - (coinCount - 1) / 2) * 18;
    coin.className = "flying-coin";
    coin.style.setProperty("--coin-x", `${coinX}px`);
    coin.style.setProperty("--coin-y", `${coinY}px`);
    coin.style.setProperty("--coin-mid-x", `${coinX * (0.48 + index * 0.035)}px`);
    coin.style.setProperty("--coin-mid-y", `${coinY * (0.52 + index * 0.025)}px`);
    coin.style.setProperty("--coin-drift", `${offset}px`);
    coin.style.setProperty("--coin-delay", `${index * 95}ms`);
    coin.style.left = `${from.left + from.width / 2}px`;
    coin.style.top = `${from.top + from.height / 2}px`;
    document.body.appendChild(coin);
    coin.addEventListener("animationend", () => coin.remove(), { once: true });
  }
  state.pendingCoinGain = 0;
}

function playPendingPurseLossAnimation() {
  if (!state.pendingPurseLoss) return;
  const rewardPanel = $("reward-panel");
  const purse = document.querySelector(".stat-purse .purse-visual") || document.querySelector(".stat-purse");
  if (!rewardPanel || rewardPanel.hidden || !purse) return;

  const from = purse.getBoundingClientRect();
  const to = rewardPanel.getBoundingClientRect();
  if (!from.width || !to.width) return;

  const lostPurse = document.createElement("span");
  lostPurse.className = "flying-purse";
  const purseX = to.left + to.width / 2 - (from.left + from.width / 2);
  const purseY = to.top + to.height / 2 - (from.top + from.height / 2);
  lostPurse.style.setProperty("--purse-x", `${purseX}px`);
  lostPurse.style.setProperty("--purse-y", `${purseY}px`);
  lostPurse.style.setProperty("--purse-mid-x", `${purseX * 0.76}px`);
  lostPurse.style.setProperty("--purse-mid-y", `${purseY * 0.76}px`);
  lostPurse.style.left = `${from.left + from.width / 2}px`;
  lostPurse.style.top = `${from.top + from.height / 2}px`;
  document.body.appendChild(lostPurse);
  lostPurse.addEventListener("animationend", () => lostPurse.remove(), { once: true });
  state.pendingPurseLoss = false;
}

function renderHearts() {
  const heartRow = $("heart-row");
  const previousLife = state.renderedLife;
  heartRow.textContent = "";
  for (let index = 0; index < state.maxLife; index += 1) {
    const heart = document.createElement("span");
    heart.className = `heart-icon${index < state.life ? " is-full" : ""}`;
    if (previousLife !== null) {
      if (index >= state.life && index < previousLife) heart.classList.add("is-lost");
      if (index < state.life && index >= previousLife) heart.classList.add("is-gained");
    }
    heartRow.appendChild(heart);
  }
  state.renderedLife = state.life;
}

function renderPurse() {
  const purse = document.querySelector(".stat-purse");
  if (purse) {
    purse.classList.toggle("has-gold", state.carriedGold > 0);
  }
}

function renderHodor() {
  const hodor = document.querySelector(".hodor-sprite");
  if (!hodor) return;

  const pose = hodorPoseForScreen();
  const assets = hodorLayerUrlsForInventory(pose);
  hodor.classList.remove("pose-idle", "pose-walk", "pose-fuite", "pose-question", "pose-releve", "pose-victory", "pose-hurt", "pose-ko", "pose-combat", "pose-combat-2", "pose-combat-3", "pose-dead");
  hodor.classList.add(`pose-${pose}`);
  hodor.style.backgroundImage = assets.map(cssAssetUrl).join(", ");
}

function hodorPoseForScreen() {
  if (state.screen === "mort") return "dead";
  if (state.screen === "combat") return state.hodorPose === "combat-2" || state.hodorPose === "combat-3" ? state.hodorPose : "combat";
  if (state.screen === "shop") return "walk";
  if (state.screen === "village") return state.showWinBanner ? "victory" : "walk";
  if (state.screen === "cell") return "idle";
  return state.hodorPose || "idle";
}

function cssAssetUrl(asset) {
  return `url("${asset}")`;
}

function hodorLayerUrlsForInventory(pose) {
  const owned = new Set(state.inventory);
  const hasCasque = owned.has("Casque Trop Petit");
  const hasHache = owned.has("Hache Emoussee");
  const hasSlip = owned.has("Slip de Guerre");
  const hasMedaillon = owned.has("Medaillon du Presque-Heros");
  const hasSandales = owned.has("Sandales de Panique");
  const cleanPose = hodorV01PoseName(pose);
  const basePath = "assets/Hodor V0.1";
  const layers = [];
  const headPoses = new Set(["idle", "marche", "fuite", "question", "degats", "attaque-1", "attaque-2", "attaque-3", "victoire"]);
  const handPoses = new Set(["idle", "marche", "fuite", "question", "degats", "attaque-1", "attaque-3", "mort"]);
  const supportsGearLayers = cleanPose !== "ko";

  if (headPoses.has(cleanPose)) {
    layers.push(`${basePath}/Morceau/${cleanPose}-tete.png`);
  }

  if (supportsGearLayers && hasCasque) {
    layers.push(`${basePath}/Stuff/Casque/${cleanPose}-casque.png`);
  }

  if (supportsGearLayers && hasHache) {
    if (handPoses.has(cleanPose)) layers.push(`${basePath}/Morceau/${cleanPose}-main.png`);
    layers.push(`${basePath}/Stuff/Hache/${cleanPose}-hache.png`);
  }

  if (supportsGearLayers && hasMedaillon) {
    layers.push(`${basePath}/Stuff/Medaillon du Presque-Heros/${cleanPose}-medaillon.png`);
  }

  if (supportsGearLayers && hasSlip) {
    layers.push(`${basePath}/Stuff/Slip de guerre/${cleanPose}-slip-de-guerre.png`);
  }

  if (supportsGearLayers && hasSandales) {
    layers.push(`${basePath}/Stuff/Sandales de Panique/${cleanPose}-sandale.png`);
  }

  layers.push(`${basePath}/Corps/${cleanPose === "idle" ? "Idle" : cleanPose}.png`);
  return layers;
}

function hodorV01PoseName(pose) {
  return {
    idle: "idle",
    walk: "marche",
    fuite: "fuite",
    question: "question",
    releve: "question",
    victory: "victoire",
    hurt: "degats",
    ko: "ko",
    combat: "attaque-1",
    "combat-2": "attaque-2",
    "combat-3": "attaque-3",
    dead: "mort"
  }[pose] || "idle";
}
