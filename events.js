const eventPool = [
  {
    weight: 12,
    run() {
      const gold = randomInt(1, 3);
      return addGold(gold, `Tu trouves un coffre derriere un panneau "Pas un coffre". Le camouflage avait un budget. +${gold} PO.`);
    },
  },
  {
    weight: 9,
    run() {
      return addGold(2, "Une bourse traine sous une dalle. Elle appartenait surement a quelqu'un de plus prudent. +2 PO.");
    },
  },
  {
    weight: 7,
    run() {
      if (Math.random() < 0.45) {
        return addGold(5, "Le coffre contient des pieces et une notice de securite ignoree. Hodor prend le tout. +5 PO.");
      }
      return takeDamage(1, "Le coffre te mord. Les meubles du donjon ont un syndicat tres agressif. -1 coeur.");
    },
  },
  {
    weight: 7,
    run() {
      if (Math.random() < 0.18) {
        return "Tu marches sur une dalle. Elle claque, tousse, puis abandonne. Meme le piege a mal dormi.";
      }
      return takeDamage(1, "Tu marches sur une dalle. Elle le prend comme une critique architecturale. -1 coeur.");
    },
  },
  {
    weight: 7,
    run() {
      return takeDamage(1, "Tu descends trois marches avec panache. Les sept suivantes choisissent ton visage. -1 coeur.");
    },
  },
  {
    weight: 5,
    run() {
      return addItem("Casque Trop Petit", "Tu enfiles un casque trop petit. Tes pensees se tassent pour payer moins cher.");
    },
  },
  {
    weight: 4,
    run() {
      if (!hasItem("Slip de Guerre")) {
        state.maxLife += 1;
        state.life += 1;
      }
      return addItem("Slip de Guerre", "Tu trouves un slip de guerre sur un petit presentoir solennel. Le tissu exige le respect. +1 coeur maximum.");
    },
  },
  {
    weight: 4,
    run() {
      return addItem("Medaillon du Presque-Heros", "Un medaillon vibre dans ta main. Il fait le bruit d'un plan B pas rassurant.");
    },
  },
  {
    weight: 4,
    run() {
      return addItem("Sandales de Panique", "Ces sandales regardent deja la sortie. Hodor appelle ca du leadership.");
    },
  },
  {
    weight: 4,
    run() {
      return addItem("Hache Emoussee", "Tu recuperes une hache emoussee. Elle a l'air dangereuse pour le mobilier mou.");
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
        return "Tu bois l'eau louche. Elle avait le gout d'une erreur, mais une erreur nourrissante. +1 coeur.";
      }
      return takeDamage(1, "Tu bois l'eau louche. Le donjon respecte ton engagement dans la mauvaise idee. -1 coeur.");
    },
  },
  {
    weight: 5,
    run() {
      const gold = randomInt(1, 4);
      return addGold(gold, `Tu trouves une tirelire en forme de demon triste. Tu l'acheves avec une compassion rentable. +${gold} PO.`);
    },
  },
  {
    weight: 5,
    run() {
      const gold = randomInt(2, 6);
      if (Math.random() < 0.35) {
        return takeDamage(1, "Tu fouilles un tonneau. Il contenait un ressort, une brique et beaucoup d'opinions. -1 coeur.");
      }
      return addGold(gold, `Tu fouilles un tonneau et trouves ${gold} PO dans une substance qui refuse de se presenter.`);
    },
  },
  {
    weight: 5,
    run() {
      const loss = Math.min(state.carriedGold, randomInt(1, 3));
      state.carriedGold -= loss;
      return loss > 0
        ? `Un peage fantome te reclame ${loss} PO. Tu paies une route qui n'existe pas.`
        : "Un peage fantome te reclame de l'argent. Ta pauvrete passe sans ticket.";
    },
  },
  {
    weight: 4,
    run() {
      if (state.life < state.maxLife) {
        state.life += 1;
        return "Tu trouves une soupe tiede dans un casque. C'est honteux, donc parfaitement local. +1 coeur.";
      }
      return "Tu trouves une soupe tiede dans un casque. Tu es deja en forme, luxe insolent.";
    },
  },
  {
    weight: 4,
    run() {
      if (Math.random() < 0.5) {
        return addGold(3, "Un vieux coffre s'ouvre tout seul. Il voulait finir sa journee avant toi. +3 PO.");
      }
      return "Un vieux coffre s'ouvre tout seul. Vide, evidemment. Le theatre coute moins cher que l'or.";
    },
  },
  {
    weight: 4,
    run() {
      const loss = Math.min(state.carriedGold, 2);
      state.carriedGold -= loss;
      return loss
        ? `Tu glisses sur une flaque de mystere. ${loss} PO roulent sous une grille qui avait l'air d'attendre ca.`
        : "Tu glisses sur une flaque de mystere. Aucun argent perdu, juste une posture sociale.";
    },
  },
  {
    weight: 4,
    run() {
      return takeDamage(1, "Une arbalete automatique tire sur tout ce qui respire fort. Hodor est une preuve sonore. -1 coeur.");
    },
  },
  {
    weight: 4,
    run() {
      if (Math.random() < 0.55) {
        return "Tu entres dans une salle remplie de leviers. Tu n'en touches aucun. Le donjon note l'anomalie.";
      }
      return takeDamage(1, "Tu entres dans une salle remplie de leviers. Tu les touches tous, comme un audit idiot. -1 coeur.");
    },
  },
  {
    weight: 4,
    run() {
      const gold = randomInt(1, 5);
      return addGold(gold, `Un marchand invisible te vend de l'air premium. Tu refuses et fouilles sa caisse theorique. +${gold} PO.`);
    },
  },
  {
    weight: 2,
    run() {
      if (state.carriedGold <= 0) {
        return takeDamage(1, "Tu trouves une table de quitte ou double. Sans argent, tu mises ta dignite. Le croupier accepte trop vite. -1 coeur.");
      }

      const stake = state.carriedGold;
      const roll = Math.random();
      if (roll < 0.03) {
        return addGold(stake * 2, `Une table de quitte ou double avale ta bourse. Contre toute logique, elle rend davantage. +${stake * 2} PO.`);
      }
      if (roll < 0.14) {
        return addGold(stake, `Une table de quitte ou double avale ta bourse. Le donjon verifie ses papiers: tu doubles. +${stake} PO.`);
      }

      state.carriedGold = 0;
      return `Une table de quitte ou double avale ta bourse. Le croupier sourit comme une porte piegee. -${stake} PO.`;
    },
  },
  {
    weight: 1,
    run() {
      const roll = Math.random();
      if (roll < 0.04) {
        return addGold(50, "Tu tires le levier d'une machine a sous maudite. Trois tetes de Hodor s'alignent. La machine demande un avocat. +50 PO.");
      }
      if (roll < 0.16) {
        return addGold(15, "Tu tires le levier d'une machine a sous maudite. Elle tousse, panique, puis recrache un compromis. +15 PO.");
      }
      if (roll < 0.78) {
        const loss = Math.min(state.carriedGold, randomInt(3, 9));
        state.carriedGold -= loss;
        return loss
          ? `Tu tires le levier d'une machine a sous maudite. Elle affiche trois pancartes 'presque'. Les presque coutent cher. -${loss} PO.`
          : "Tu tires le levier d'une machine a sous maudite. Elle fouille ta bourse vide et decouvre la tristesse.";
      }
      return takeDamage(1, "Tu tires le levier d'une machine a sous maudite. Elle paie en formation professionnelle douloureuse. -1 coeur.");
    },
  },
  {
    weight: 4,
    run() {
      if (!state.inventory.length) {
        return "Une malediction cherche un objet a casser. Tes poches vides la mettent mal a l'aise.";
      }
      const lost = removeRandomItem();
      return `Une malediction administrative confisque ton objet : ${lost}. Motif : existence mal declaree.`;
    },
  },
  {
    weight: 3,
    run() {
      if (Math.random() < 0.4) {
        return instantDeath("Tu entres dans une salle marquee 'Test de confiance'. Le sol n'avait pas signe.");
      }
      return addGold(4, "Tu entres dans une salle marquee 'Test de confiance'. Le sol tient, probablement par erreur. +4 PO.");
    },
  },
  {
    weight: 4,
    run() {
      return "Tu decouvres une fresque racontant la chute d'un grand heros. La ressemblance est juridiquement troublante.";
    },
  },
  {
    weight: 4,
    run() {
      const gold = randomInt(1, 4);
      return addGold(gold, `Un coffre minuscule contient ${gold} PO et un mot: "ne depense pas tout en fromage".`);
    },
  },
  {
    weight: 4,
    run() {
      shiftFloors(-2);
      return "Tu trouves un escalier presse d'en finir. Hodor negocie avec ses genoux. -2 etages.";
    },
  },
  {
    weight: 6,
    run() {
      shiftFloors(2);
      return "Un monte-charge grincheux remonte de 2 etages. Le service client refuse tout sourire.";
    },
  },
  {
    weight: 3,
    run() {
      if (Math.random() < 0.42) {
        shiftFloors(-2);
        return "Une trappe s'ouvre sous tes pieds. Tes genoux signent une plainte. -2 etages.";
      }
      shiftFloors(2);
      return "Une trappe s'ouvre sous tes pieds, puis un ressort idiot corrige l'erreur. Tu remontes de 2 etages.";
    },
  },
  {
    weight: 3,
    run() {
      if (Math.random() < 0.5) {
        state.life = Math.min(state.maxLife, state.life + 1);
        return "Un petit autel soigne tes bosses. Ton honneur reste hors garantie. +1 coeur.";
      }
      return takeDamage(1, "Un petit autel promet de te benir. Il eternue en vieux latin. -1 coeur.");
    },
  },
  {
    weight: 3,
    run() {
      const gold = randomInt(4, 8);
      if (Math.random() < 0.3) {
        return addGold(gold, `Tu trouves une caisse marquee "salaires des gardes". Hodor invente l'impot inverse. +${gold} PO.`);
      }
      return takeDamage(1, "Tu trouves une caisse marquee 'salaires des gardes'. Les gardes connaissent la comptabilite defensive. -1 coeur.");
    },
  },
  {
    weight: 3,
    run() {
      return "Un miroir magique te montre ton avenir. Il est court, flou et mal cadre.";
    },
  },
  {
    weight: 3,
    run() {
      const loss = Math.min(state.carriedGold, randomInt(2, 5));
      state.carriedGold -= loss;
      return loss
        ? `Une bourse vivante mord ta bourse normale et avale ${loss} PO. L'economie locale applaudit.`
        : "Une bourse vivante essaie de voler ton argent. Elle repart avec une crise existentielle.";
    },
  },
  {
    weight: 3,
    run() {
      if (Math.random() < 0.6) {
        return addGold(1, "Tu bats un vieux tapis. Il tousse, insulte ton lignage, puis lache 1 PO.");
      }
      return takeDamage(1, "Tu bats un vieux tapis. Il a plus d'experience que toi. -1 coeur.");
    },
  },
  {
    weight: 3,
    run() {
      return "Tu passes devant une porte 'Boss final'. Derriere, un placard. Il a une aura de meuble important.";
    },
  },
  {
    weight: 3,
    run() {
      if (state.carriedGold >= 10) {
        return "Ta bourse pese lourd. Le donjon fait semblant de regarder ailleurs.";
      }
      return "Tu secoues ta bourse. Elle repond par un silence socialement violent.";
    },
  },
  {
    weight: 7,
    run() {
      return "Une statue te regarde. Meme en pierre, elle attendait mieux.";
    },
  },
  {
    weight: 7,
    run() {
      return "La salle est vide. Tu remportes un duel intellectuel contre rien, de peu.";
    },
  },
  {
    weight: 6,
    run() {
      const loss = Math.min(state.carriedGold, randomInt(1, 4));
      state.carriedGold -= loss;
      return loss
        ? `Une main sort du mur, te vole et applaudit ta vigilance avec mepris. -${loss} PO.`
        : "Une main sort du mur, fouille ta bourse vide, puis te rend ta pauvrete.";
    },
  },
  {
    weight: 1,
    run() {
      return instantDeath("Tu ouvres la porte. Derriere, une decision de game design te regarde sans remords.");
    },
  },
  {
    weight: 1,
    run() {
      return instantDeath('Une pancarte indique "Ne pas entrer". Hodor lit, reflechit, puis trahit la lecture.');
    },
  },
];
