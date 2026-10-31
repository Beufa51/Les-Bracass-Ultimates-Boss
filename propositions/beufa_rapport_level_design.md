# Beufa — rapport de level design d'infiltration (V66)

Analyse des 4 pièces comparée aux références du genre. Contrainte : le gameplay qui plaît à Fabien ne bouge pas.

## Les références utilisées
- **Metal Gear Solid (1998), Shadow Moses** : chaque lieu a une fonction réelle (héliport, hangar à chars,
  armurerie, entrepôt d'ogives) ; les mêmes mécaniques reviennent de pièce en pièce, avec une couche de plus à chaque
  fois ; on attend dans une alcôve que le garde passe. Atmosphère de « réalisme narratif ».
- **MGS V Ground Zeroes, Camp Omega** : la base est calquée sur une vraie base (Guantanamo). Elle est découpée en
  secteurs, et le joueur s'y repère grâce à sa logique réelle.
- **Mark of the Ninja (Nels Anderson, GDC 2013)** : le joueur doit pouvoir LIRE les règles (lumière = vu, ombre = caché,
  sans entre-deux) ; pas d'essai-erreur ; plusieurs chemins par défi ; points de reprise rapprochés.
- **Thief (Randy Smith, GDC 2006, « Level Building for Stealth Gameplay »)** : la boucle observer → s'engager →
  réagir est inscrite dans la forme du niveau ; il faut un point sûr d'où observer avant chaque défi.
- **Game Maker's Toolkit / narration environnementale** : un lieu crédible se lit avec ce qu'on sait du monde réel
  (« comment tout ça fonctionne-t-il ? ») ; la cohérence interne compte plus que le réalisme ; de petites scènes
  sans paroles (une « vignette » : un camion capot ouvert, des outils posés) font vivre le lieu.

## Ce qui est déjà au niveau des références
- **La boucle de Thief** : chaque pièce démarre dans une poche sûre (conteneurs du portail, jeeps, sas de l'arsenal,
  antichambre) d'où l'on observe avant de bouger.
- **L'empilement de Metal Gear** : une nouveauté par pièce (cône, lumière, veilleur, tout ensemble).
- **Mark of the Ninja** : sortie qui pulse, jauge « ? » puis « ! », retour au début de la pièce (reprise courte).
- **La logique de Camp Omega** : portail → garage des véhicules → dépôt d'armes → QG, l'ordre d'une vraie base.
  Barbelés seulement sur l'enceinte, missiles en batterie, porte du chef au bout.

## Les incohérences relevées (et ce qui est fait)
| # | Problème | Pourquoi ça casse la crédibilité | Correction |
|---|---|---|---|
| 1 | **Un projecteur dans le QG** (le portique de l'antichambre) | Un projecteur sur tour, c'est dehors. Dedans, Metal Gear met des **caméras de surveillance** | Même mécanique (balayage), autre objet : prompt n°14 « caméra » → à livrer |
| 2 | **Lampadaires allumés qui n'éclairent rien** | Mark of the Ninja : ce qui brille doit se lire | Fait : la lampe brille dans la nuit (petite lueur sur la tête). PAS de flaque de lumière au sol : elle ferait croire qu'on y est vu |
| 3 | **Salle des opérations remplie d'étagères** | Une salle de commandement a des postes d'opérateurs autour de la table des cartes | Fait : la rangée nord devient des **consoles** (même emprise, le passage secret derrière reste : couloir de câbles) |
| 4 | **Missiles posés sur le sol nu** | Une zone d'explosifs est balisée | Fait : **marquage jaune** au sol autour de la batterie de missiles (dessiné par le code) |
| 5 | Pas de petite scène de vie (vignette) | Les bases de Metal Gear montrent la vie des soldats | À faire avec les prompts en attente : station-service (pompe + jerricans), panneau danger, casiers |
| 6 | Camions, étagères, réservoir, jeep plus bas ou vus d'en haut | Échelle et style incohérents | Prompts prêts (`beufa_prompts_hauteur.md`, n°12-13) |
| 7 | Le mirador est vide et sans lumière | Un mirador sert à surveiller | À décider (gameplay) : y mettre un projecteur |

## À décider par Fabien (ça touche au gameplay)
- **Le mirador avec un projecteur** (cour) : très Metal Gear, mais ajoute une lumière dans la 1re pièce, qui
  doit rester celle du cône seul.
- **Lampadaires = vraie lumière** (comme Mark of the Ninja) : Snake serait repéré dans leur flaque. Plus riche,
  mais change la difficulté du parc.

Sources : PC Gamer / Game Developer sur les règles de Nels Anderson ; GDC Vault (Anderson 2013, Smith 2006) ;
Slant / Digital Trends sur Camp Omega ; The Level Design Book (couverture) ; Game Maker's Toolkit « How Level Design
Can Tell a Story ».
