# Julien — niveau 1 « la manif » : audit « DOOM »
Deux regards : un **développeur d'id Software** (comment Doom est construit) et un **joueur habitué aux doom-like**
(Doom, Duke 3D, Dusk, Ultrakill…). État audité : 5 zones, 5 armes, 11 policiers (6 lanceurs, 5 CRS), bonus,
carte, secrets, difficultés, rang.

## Verdict commun
Le jeu ressemble aujourd'hui à **Wolfenstein 3D bien habillé** : tout est plat, à angle droit, éclairé pareil, et le
combat se résume à « viser, attendre la recharge ». Ce qui fait **Doom**, ce sont 4 choses qui manquent encore :
le **rythme** (on court vite, on enchaîne), les **pièges** (embuscades, placards à monstres, barils), la **lecture de
l'espace** (lumière, hauteurs, clés et portes) et la **punition douce** (mourir → recommencer tout de suite).

---------------------------------------------------------------------------------------------------------------------
## A. Le DÉVELOPPEUR id Software

1. **Mourir renvoie au hub** : c'est l'erreur n°1. Dans Doom, on meurt, on appuie sur une touche, on recommence le
   niveau dans la seconde. Ici on reperd le menu, l'intro, la musique… → **« Recommencer » immédiat après une défaite**.
2. **Pas de « barils »** : le baril qui explose est l'objet le plus malin de Doom (le joueur crée ses propres
   combos). Équivalent manif : **sac de farine** (ou **bombe de peinture**) : un œuf dessus → nuage blanc qui fait
   fuir/aveugle tous les policiers autour ; en chaîne si plusieurs sacs. Placés là où les policiers se regroupent.
3. **Pas d'« infighting »** (les monstres qui se tapent dessus) : une lacrymo qui tombe sur des policiers devrait
   les faire tousser aussi (ils ont des masques… pas tous !). Le joueur apprend à se placer derrière eux.
4. **Pas d'embuscade ni de « placard à monstres »** : dans Doom, ramasser la clé ouvre des murs pleins de démons.
   Ici, rien ne surprend. → **déclencheurs** : ramasser le pistolet à eau ouvre un rideau de fer de la boutique
   d'où sortent 2 policiers ; entrer sur le parvis fait arriver un fourgon qui dépose 2 CRS derrière toi.
5. **Pas de clé ni de porte** : le parcours est un couloir. Doom = « trouve la clé bleue, reviens à la porte
   bleue », avec des boucles. → **la carte de cantine** (clé) cachée sur la place ouvre la **porte de service** du
   lycée (raccourci) ; ou **le badge du CPE** pour le portail, gardé par le commissaire.
6. **Lumière uniforme** : Doom joue énormément avec la lumière (secteurs sombres, néons qui clignotent). → ruelle
   **sombre**, tabac avec **néon qui clignote**, flash bleu des gyrophares près des camions, place en plein jour.
7. **Ennemis sans « réaction »** : pas de douleur aléatoire (pain chance), pas de cri à la vue du joueur
   (« Halte ! »), pas de bruit qui alerte (un tir de Doom réveille toute la zone). → chaque lancer d'œuf alerte les
   policiers à 8 cases ; un cri distinct par type quand ils te repèrent.
8. **La difficulté ne change que des chiffres** : dans Doom, le niveau de difficulté change **le nombre et le type**
   de monstres placés. → Lycéen sage : 7 policiers, Anarchiste : 16 (+ BAC).
9. **Pas d'effet de ramassage** : Doom fait un petit **flash doré** + son à chaque objet. Ici seul un texte.
10. **Changer d'arme est instantané** : Doom baisse l'arme puis monte la nouvelle (0,3 s), ça donne du poids.
11. **La barre du bas** n'affiche qu'une munition. Doom montre le **tableau de toutes les munitions**, l'armure en %
    et les clés. On a la place.

## B. Le JOUEUR de doom-like

1. **Trop lent.** Vitesse 3,2 cases/s et rotation 140°/s : un habitué veut **courir tout le temps** (« always run »)
   et tourner plus vite. → option « Toujours courir » (activée par défaut) et rotation ×1,3.
2. **Le combat est trop facile et trop « attente »** : la lacrymo se voit venir de loin, le CRS est lent à
   revenir. Avec 40 œufs, on ne craint rien. → quelques **ennemis rapides** (BAC en civil qui fonce au corps à
   corps, comme le Démon) et des **tirs plus directs** (balles de défense / LBD : projectile rapide en ligne droite,
   à esquiver au pas de côté), pour forcer le **mouvement permanent** (le cœur du genre : le « circle strafe »).
3. **Pas de hauteur** : tout est au niveau du sol. On peut **tricher** comme Wolfenstein ne savait pas le faire :
   des policiers **sur les balcons** et **sur le toit d'un camion** qui tirent d'en haut (juste dessinés plus haut,
   inatteignables à la pancarte). Ça change tout dans la lecture de l'espace.
4. **Les secrets sont introuvables** : rien ne les signale. Les joueurs de Doom cherchent les **indices** : un tag
   différent, une affiche décollée, un mur un peu plus sombre. → un **indice visuel** sur chaque mur secret.
5. **Pas de « moment de puissance »** : il manque l'arme ultime (la **sono = BFG**) et un **boss de fin de niveau**
   (le **commissaire au mégaphone** sur le parvis, avec une barre de vie : c'est lui qui garde le portail).
6. **On ne sait pas toujours où on en est** : le message « Fais fuir le cordon » est bien, mais le niveau gagnerait
   à un **compteur « Parvis : 2 policiers restants »** quand le portail est verrouillé.
7. **Bon point** : les commandes Doom 93, la carte, les messages de zone, le tableau de fin, les traces d'œuf /
   tomate, le pancarte-bonk sur le CRS (excellent : c'est exactement l'esprit « berserk »).

---------------------------------------------------------------------------------------------------------------------
## Plan proposé (du plus rentable au plus lourd)

### 1. Rapide, gros effet (code seul)
- **Recommencer tout de suite** après une défaite (ESPACE / OK = recommencer, autre touche = hub).
- **Toujours courir** (réglable) + rotation un peu plus rapide.
- **Bruit qui alerte** (chaque tir alerte à 8 cases) + **cri** quand un policier te repère.
- **Infighting** : les lacrymos font tousser (et reculer) les policiers pris dedans.
- **Flash doré** au ramassage, **flash bleu** des gyrophares près des camions.
- **Indices de secrets** (un petit tag « ↘ » sur les murs secrets).
- **Compteur du parvis** quand le portail est fermé.
- **Difficulté = nombre de policiers** (certains n'apparaissent qu'en Bloqueur / Anarchiste).

### 2. Les « jouets » de Doom (code + petites images)
- **Sacs de farine explosifs** (barils), en chaîne.
- **Embuscades** : rideau de fer qui s'ouvre au ramassage du pistolet à eau ; fourgon qui dépose des CRS derrière
  toi sur le parvis.
- **Lumière** : ruelle sombre, néon du tabac qui clignote.
- **Changement d'arme animé** (baisser / monter).
- **Tableau des munitions** dans la barre du bas.

### 3. Nouveaux adversaires (code + images Gemini)
- **BAC en civil** (rapide, corps à corps) ; **tireur de LBD** (projectile rapide en ligne droite) ;
  **policiers en hauteur** (balcons, toit du camion) ; **commissaire au mégaphone** = boss du parvis.
- **Sono** (BFG) dans le grand secret.

### 4. Plus tard (si on veut aller loin)
- **Clé et porte** (carte de cantine → porte de service) et une **boucle** dans le niveau.
