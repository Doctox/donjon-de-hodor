# Cahier des charges V0.1

# Le Barbare, les Portes et la Binouse

## 1. Concept

Le joueur incarne un barbare bete, un peu grassouillet, tres confiant dans sa capacite a comprendre le monde malgre des preuves regulieres du contraire.

Au debut de chaque expedition, il arrive devant un donjon en pensant vivre une aventure glorieuse. En entrant, il se fait immediatement tabasser par les occupants du lieu, puis enfermer tout en haut du donjon.

Son objectif est simple : descendre les etages un par un, choisir les bonnes portes, survivre aux pieges absurdes, sortir vivant, retourner au village, deposer son or a la banque, boire une binouse a la taverne, puis accepter une nouvelle quete douteuse qui le renvoie au donjon.

Le vrai but du jeu est de stacker le plus d'or possible a la banque.

## 2. Intention

Le jeu doit etre :

- injuste mais drole ;
- rapide a comprendre ;
- rejouable ;
- rempli de petites phrases narratives absurdes ;
- centre sur la tentation du risque ;
- assez cruel pour faire rire, pas assez frustrant pour degouter.

Le joueur doit souvent se dire : "C'etait n'importe quoi, allez encore une."

## 3. Personnage principal

Nom provisoire : Hodor le Presque-Terrible.

Profil :

- barbare grassouillet ;
- pas tres malin ;
- courageux surtout parce qu'il ne comprend pas toujours le danger ;
- susceptible quand on critique sa hache ;
- capable de confondre une malediction ancienne avec une offre promotionnelle.

Stats de depart :

- vie : 3 coeurs ;
- or porte : 0 ;
- or en banque : conserve entre les expeditions ;
- objets : aucun au debut ;
- etage : commence en haut du donjon.

## 4. Boucle de jeu

1. Le barbare arrive devant le donjon.
2. Il se fait tabasser et enfermer au dernier etage.
3. Il descend le donjon etage par etage.
4. A chaque etage, il choisit entre 3 portes.
5. Chaque porte declenche un evenement.
6. L'evenement modifie la vie, l'or, les objets ou l'etat du personnage.
7. Si le barbare survit jusqu'en bas, il atteint le village.
8. Au village, il peut deposer son or a la banque.
9. A la taverne, il boit une binouse.
10. Un type louche lui propose une nouvelle quete.
11. Le cycle recommence.

## 5. Structure d'une expedition

Version 1 :

- le donjon contient 10 etages ;
- le joueur commence a l'etage 10 ;
- chaque porte choisie fait descendre d'un etage ;
- a l'etage 0, le joueur atteint le village ;
- si la vie tombe a 0, la run est perdue ;
- si une mort instantanee se declenche, la run est perdue ;
- l'or porte est perdu en cas de mort ;
- l'or depose a la banque reste sauvegarde.

## 6. Village

Le village est l'ecran de repos entre les expeditions.

Lieux V1 :

### Banque

Permet de deposer l'or porte.

L'or depose devient permanent et compte pour le score global du joueur.

### Taverne

Permet de boire une binouse et de lancer une nouvelle expedition.

Un personnage louche propose toujours une nouvelle quete, meme quand tout le monde sait que c'est une tres mauvaise idee.

Lieux possibles plus tard :

- forgeron ;
- guerisseur ;
- marche noir ;
- salle des trophees ;
- panneau des statistiques ridicules.

## 7. Conditions de victoire et de defaite

Defaite :

- vie a 0 ;
- mort instantanee ;
- evenement special fatal.

Victoire d'une expedition :

- atteindre le village vivant ;
- deposer l'or a la banque.

Objectif long terme :

- avoir le plus d'or possible en banque ;
- battre son record ;
- debloquer plus tard des titres absurdes selon la richesse.

Exemples de titres :

- 50 pieces : Petit Porte-Monnaie Poilu ;
- 250 pieces : Epargnant de la Douleur ;
- 1000 pieces : Baron du Coffre Qui Sent la Sueur ;
- 5000 pieces : Legende Bancaire Incomprise.

## 8. Types d'evenements derriere les portes

### Tresor

Le joueur gagne de l'or.

Exemple :

"Tu trouves un coffre. Il etait piege, mais seulement moralement. +18 pieces."

### Piege

Le joueur perd de la vie.

Exemple :

"Une dalle s'enfonce. Puis ton amour-propre. -1 coeur."

### Objet

Le joueur obtient un objet qui l'aide pendant la run.

Exemple :

"Tu trouves un casque trop petit. Il te protege surtout des idees."

### Monstre

Le joueur affronte une creature avec un resultat aleatoire.

Exemple :

"Un gobelin te defie en duel. Tu gagnes parce qu'il glisse sur son propre professionnalisme."

### Fontaine

Effet positif ou negatif.

Exemple :

"Tu bois l'eau lumineuse. Elle avait un gout de regret."

### Salle vide

Rien ne se passe, mais le narrateur se moque.

Exemple :

"La salle est vide. Comme ton plan."

### Mort instantanee

Evenement rare et injuste.

Exemple :

"Tu ouvres la porte. Derriere, il y avait une decision de game design discutable."

## 9. Objets V1

### Casque Trop Petit

Chance de bloquer 1 degat.

### Slip de Guerre

Ajoute 1 coeur maximum pendant la run.

### Hache Emoussee

Augmente certains gains d'or apres combat.

### Medaillon du Presque-Heros

Annule une mort instantanee une fois, puis se casse.

### Sandales de Panique

Chance d'eviter un piege.

## 10. Evenements V1 proposes

1. Petit coffre : +10 a +25 pieces.
2. Gros coffre douteux : +40 pieces ou -1 coeur.
3. Piege a pointes : -1 coeur.
4. Chute dans un escalier mal intentionne : -1 coeur.
5. Fontaine sale : +1 coeur ou -1 coeur.
6. Marchand perdu : acheter un objet contre de l'or.
7. Salle vide : aucun effet.
8. Monstre faible : gain d'or ou perte de vie.
9. Monstre costaud : gros gain ou gros risque.
10. Porte de la honte : perte d'or.
11. Statue insultante : aucun effet, mais texte moqueur.
12. Coffre mimique : perte de vie ou gain si chanceux.
13. Bourse abandonnee : +15 pieces.
14. Trou dans le sol : descend d'un etage mais -1 coeur.
15. Mort instantanee rare : fin de run sauf protection.

## 11. Interface V1

Ecran donjon :

- nom du jeu ;
- etage actuel ;
- vie ;
- or porte ;
- or en banque ;
- objets actifs ;
- texte narratif ;
- 3 portes cliquables.

Ecran village :

- recap de l'expedition ;
- or porte ;
- or en banque ;
- bouton Banque ;
- bouton Taverne ;
- bouton Nouvelle expedition.

Ecran mort :

- cause de la mort ;
- or perdu ;
- or en banque conserve ;
- bouton Recommencer.

## 12. Sauvegarde

Pour la V1, seule la banque doit etre sauvegardee localement dans le navigateur.

Plus tard, on pourra sauvegarder :

- objets permanents ;
- records ;
- nombre de morts ;
- statistiques absurdes ;
- titres debloques.

## 13. Regles de ton

Le jeu doit parler comme un narrateur moqueur, mais pas trop lourd.

Le texte doit etre court, punchy et utile.

L'humour vient de :

- la betise du heros ;
- l'injustice du donjon ;
- les objets ridicules ;
- les consequences disproportionnees ;
- le contraste entre l'epique attendu et la realite minable.

## 14. Prototype V1

Objectif de la premiere version jouable :

- une page web simple ;
- 3 portes ;
- une barre de vie ;
- or porte ;
- or en banque ;
- 10 etages ;
- 15 evenements ;
- 5 objets ;
- village avec banque et taverne ;
- sauvegarde locale de l'or en banque ;
- bouton rejouer.

Cette V1 doit permettre de tester le plaisir principal : choisir une porte, rire du resultat, essayer de sortir vivant avec plus d'or.
