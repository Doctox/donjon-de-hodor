const eventPool = [
  {
    weight: 12,
    run() {
      const gold = randomInt(1, 3);
      return addGold(gold, `Tu trouves un coffre derriere un panneau marque "Pas un coffre". Subtil. +${gold} PO.`);
    },
  },
  {
    weight: 9,
    run() {
      return addGold(2, "Une bourse traine par terre. Tu inventes le concept de propriete flexible. +2 PO.");
    },
  },
  {
    weight: 7,
    run() {
      if (Math.random() < 0.45) {
        return addGold(5, "Le coffre etait plein de pieces et d'echardes. Tu prends les deux. +5 PO.");
      }
      return takeDamage(1, "Le coffre te mord. Tu notes mentalement de ne plus faire confiance aux meubles. -1 coeur.");
    },
  },
  {
    weight: 7,
    run() {
      if (Math.random() < 0.18) {
        return "Tu marches sur une dalle. Elle claque, tousse, puis abandonne. Le piege aussi fatigue.";
      }
      return takeDamage(1, "Tu marches sur une dalle. Elle le prend personnellement. -1 coeur.");
    },
  },
  {
    weight: 7,
    run() {
      return takeDamage(1, "Tu descends trois marches avec panache, puis les sept suivantes avec ton visage. -1 coeur.");
    },
  },
  {
    weight: 5,
    run() {
      return addItem("Casque Trop Petit", "Tu enfiles un casque trop petit. Ton cerveau proteste, mais il n'avait pas grand-chose au programme.");
    },
  },
  {
    weight: 4,
    run() {
      if (!hasItem("Slip de Guerre")) {
        state.maxLife += 1;
        state.life += 1;
      }
      return addItem("Slip de Guerre", "Tu trouves un slip de guerre. Personne ne sait pourquoi il brille. +1 coeur maximum.");
    },
  },
  {
    weight: 4,
    run() {
      return addItem("Medaillon du Presque-Heros", "Un medaillon vibre dans ta main. Il a l'air presque competent.");
    },
  },
  {
    weight: 4,
    run() {
      return addItem("Sandales de Panique", "Ces sandales sentent la fuite strategique. Tu appelles ca de la tactique.");
    },
  },
  {
    weight: 4,
    run() {
      return addItem("Hache Emoussee", "Tu recuperes une hache emoussee. Elle coupe surtout les conversations.");
    },
  },
  {
    weight: 5,
    run() {
      return randomDungeonItemText();
    },
  },
  {
    weight: 8,
    run() {
      return startCombat(monsters.rat);
    },
  },
  {
    weight: 7,
    run() {
      return startCombat(monsters.skeleton);
    },
  },
  {
    weight: 5,
    run() {
      return startCombat(monsters.guard);
    },
  },
  {
    weight: 7,
    run() {
      if (Math.random() < 0.45) {
        state.life = Math.min(state.maxLife, state.life + 1);
        return "Tu bois l'eau louche. Miracle : c'etait seulement presque toxique. +1 coeur.";
      }
      return takeDamage(1, "Tu bois l'eau louche. Le mot important etait 'louche'. -1 coeur.");
    },
  },
  {
    weight: 5,
    run() {
      const gold = randomInt(1, 4);
      return addGold(gold, `Tu trouves une tirelire en forme de demon triste. Tu la casses pour son bien. +${gold} PO.`);
    },
  },
  {
    weight: 5,
    run() {
      const gold = randomInt(2, 6);
      if (Math.random() < 0.35) {
        return takeDamage(1, "Tu fouilles un tonneau. Il contenait un ressort, une brique et une lecon de vie. -1 coeur.");
      }
      return addGold(gold, `Tu fouilles un tonneau et trouves ${gold} PO collees dans une substance non identifiee.`);
    },
  },
  {
    weight: 5,
    run() {
      const loss = Math.min(state.carriedGold, randomInt(1, 3));
      state.carriedGold -= loss;
      return loss > 0
        ? `Un peage fantome te reclame ${loss} PO. Tu paies, surtout parce que le panneau te regarde.`
        : "Un peage fantome te reclame de l'argent. Tu n'as rien. Il te juge gratuitement.";
    },
  },
  {
    weight: 4,
    run() {
      if (state.life < state.maxLife) {
        state.life += 1;
        return "Tu trouves une soupe tiede dans un casque. C'est honteux, mais nourrissant. +1 coeur.";
      }
      return "Tu trouves une soupe tiede dans un casque. Tu es deja en forme, donc tu la respectes de loin.";
    },
  },
  {
    weight: 4,
    run() {
      if (Math.random() < 0.5) {
        return addGold(3, "Un vieux coffre s'ouvre tout seul. Meme lui en avait marre d'attendre. +3 PO.");
      }
      return "Un vieux coffre s'ouvre tout seul. Il etait vide, mais tres dramatique.";
    },
  },
  {
    weight: 4,
    run() {
      const loss = Math.min(state.carriedGold, 2);
      state.carriedGold -= loss;
      return loss
        ? `Tu glisses sur une flaque de mystere. ${loss} PO roulent sous une grille. La grille gagne.`
        : "Tu glisses sur une flaque de mystere. Tu ne perds pas d'argent, seulement du prestige.";
    },
  },
  {
    weight: 4,
    run() {
      return takeDamage(1, "Une arbalete automatique tire sur tout ce qui respire fort. Hodor respire tres fort. -1 coeur.");
    },
  },
  {
    weight: 4,
    run() {
      if (Math.random() < 0.55) {
        return "Tu entres dans une salle remplie de leviers. Tu n'en touches aucun. Rare moment de sagesse.";
      }
      return takeDamage(1, "Tu entres dans une salle remplie de leviers. Tu les touches tous. Le donjon applaudit, puis te punit pour l'exemple. -1 coeur.");
    },
  },
  {
    weight: 4,
    run() {
      const gold = randomInt(1, 5);
      return addGold(gold, `Un marchand invisible te vend de l'air premium. Tu refuses, puis trouves ${gold} PO dans sa caisse invisible.`);
    },
  },
  {
    weight: 4,
    run() {
      if (!state.inventory.length) {
        return "Une malediction essaie de casser un de tes objets. Tu n'en as pas. Elle repart vexee.";
      }
      const lost = removeRandomItem();
      return `Une malediction administrative confisque ton objet : ${lost}. Motif : formulaire pas rempli.`;
    },
  },
  {
    weight: 3,
    run() {
      if (Math.random() < 0.4) {
        return instantDeath("Tu entres dans une salle marquee 'Test de confiance'. Le sol n'avait pas confiance.");
      }
      return addGold(4, "Tu entres dans une salle marquee 'Test de confiance'. Cette fois, le sol tient. +4 PO.");
    },
  },
  {
    weight: 4,
    run() {
      return "Tu decouvres une fresque racontant la chute d'un grand heros. Il te ressemble un peu trop.";
    },
  },
  {
    weight: 4,
    run() {
      const gold = randomInt(1, 4);
      return addGold(gold, `Un coffre minuscule contient ${gold} PO et un mot : "ne depense pas tout en fromage".`);
    },
  },
  {
    weight: 4,
    run() {
      shiftFloors(-2);
      return "Tu trouves un escalier qui descend franchement trop vite. Hodor perd un peu confiance en l'architecture. -2 etages.";
    },
  },
  {
    weight: 6,
    run() {
      shiftFloors(2);
      return "Un monte-charge grincheux remonte de 2 etages. Le donjon appelle ca du service client.";
    },
  },
  {
    weight: 3,
    run() {
      if (Math.random() < 0.42) {
        shiftFloors(-2);
        return "Une trappe s'ouvre sous tes pieds. Mauvaise nouvelle pour tes genoux, bonne nouvelle pour la descente : -2 etages.";
      }
      shiftFloors(2);
      return "Une trappe s'ouvre sous tes pieds, mais un ressort idiot te renvoie plus haut. Tu remontes de 2 etages.";
    },
  },
  {
    weight: 3,
    run() {
      if (Math.random() < 0.5) {
        state.life = Math.min(state.maxLife, state.life + 1);
        return "Un petit autel soigne tes bosses. Il refuse toutefois de reparer ton honneur. +1 coeur.";
      }
      return takeDamage(1, "Un petit autel promet de te benir. Il eternue a la place. -1 coeur.");
    },
  },
  {
    weight: 3,
    run() {
      const gold = randomInt(4, 8);
      if (Math.random() < 0.3) {
        return addGold(gold, `Tu trouves une caisse marquee "salaires des gardes". Redistribution sauvage. +${gold} PO.`);
      }
      return takeDamage(1, "Tu trouves une caisse marquee 'salaires des gardes'. Elle etait surveillee par les gardes eux-memes. Detail important. -1 coeur.");
    },
  },
  {
    weight: 3,
    run() {
      return "Un miroir magique te montre ton avenir. Il est court, flou et probablement douloureux.";
    },
  },
  {
    weight: 3,
    run() {
      const loss = Math.min(state.carriedGold, randomInt(2, 5));
      state.carriedGold -= loss;
      return loss
        ? `Une bourse vivante mord ta bourse normale et avale ${loss} PO. Le cycle de la nature est cruel.`
        : "Une bourse vivante essaie de voler ton argent. Elle repart affamee.";
    },
  },
  {
    weight: 3,
    run() {
      if (Math.random() < 0.6) {
        return addGold(1, "Tu bats un vieux tapis. Il tousse, insulte ta famille, puis lache 1 PO.");
      }
      return takeDamage(1, "Tu bats un vieux tapis. Il gagne le duel. -1 coeur.");
    },
  },
  {
    weight: 3,
    run() {
      return "Tu passes devant une porte qui dit 'Boss final'. Elle donne sur un placard. Le placard est intimidant.";
    },
  },
  {
    weight: 3,
    run() {
      if (state.carriedGold >= 10) {
        return "Tu sens ta bourse peser lourd. Le donjon aussi l'a remarquee. Ambiance.";
      }
      return "Tu sens ta bourse. Elle est legere. Meme le donjon a un petit rire de pitie.";
    },
  },
  {
    weight: 7,
    run() {
      return "Une statue te regarde. Meme en pierre, elle a l'air decue.";
    },
  },
  {
    weight: 7,
    run() {
      return "La salle est vide. Tu remportes un duel intellectuel contre le silence, de justesse.";
    },
  },
  {
    weight: 6,
    run() {
      const loss = Math.min(state.carriedGold, randomInt(1, 4));
      state.carriedGold -= loss;
      return loss
        ? `Une main sort du mur, te vole et applaudit mollement ta vigilance. -${loss} PO.`
        : "Une main sort du mur, fouille ta bourse vide, puis applaudit mollement ta pauvrete.";
    },
  },
  {
    weight: 1,
    run() {
      return instantDeath("Tu ouvres la porte. Derriere, il y avait une decision de game design discutable.");
    },
  },
  {
    weight: 1,
    run() {
      return instantDeath('Une pancarte indique "Ne pas entrer". Tu entres. Les historiens appelleront ca une coherence de personnage.');
    },
  },
];
