# BEUFA — L'INFILTRATION, version « on comprend ce qu'on fait »

Document de game design pour refaire la base de Beufa. Le quiz final n'est pas traité ici.
Le code prêt à coller est dans `pieces.js`, à côté de ce document.

---

## 0. Le diagnostic en une phrase

La base actuelle a le problème classique des niveaux d'infiltration faits « à la main, en ajoutant » : **trop de gardes partout, tous pareils, et un repérage presque immédiat**. Le joueur ne peut pas *lire* la pièce, donc il ne peut pas *prévoir*. Il fait alors de l'essai-erreur, et chez un enfant l'essai-erreur se transforme vite en « c'est nul ».

Il y a aussi deux défauts que j'ai trouvés en regardant les captures (voir §6) :
- **Le voile de nuit ne couvre que le coin haut-gauche (960×540) des grandes pièces.** Dans la cour (960×1080), la moitié basse est éclairée comme en plein jour. On voit une ligne nette au milieu de l'écran (`actuel_jeu_p1.png`).
- **Un projecteur qui te voit envoie le garde le plus proche de toute la pièce.** Pendant mes tests, un garde situé à plus de 300 px s'est mis à courser le héros, sans aucune chance de le rattraper : on a du bruit, mais pas de danger.

---

## 1. Les principes de design pour CE jeu (famille, enfants, téléphone)

### 1.1 Une idée nouvelle par pièce, apprise sans risque, puis combinée
C'est la règle de Mark of the Ninja et de Hitman GO. Chaque pièce présente **une seule** nouveauté, dans une situation où l'on peut l'observer **sans danger** depuis l'entrée. La dernière pièce **combine** ce qu'on a appris, une fois chaque chose.

| Pièce | Nouveauté | Ce qu'on a déjà vu |
|---|---|---|
| 1. La cour | Le cône, l'ombre d'un conteneur, passer **dans le dos** | — |
| 2. Le parc | **La lumière** (le portique, puis le halo qui file sur la route) et les niches à l'ombre | cône, dos |
| 3. L'arsenal | **Le veilleur** qui tourne la tête, la **ronde en boucle** | cône, dos |
| 4. Le QG | **Tout ensemble** : portique, boucle, veilleur, planton | tout |

### 1.2 La lisibilité avant tout
- **Chaque garde a UN rôle et UN rythme** qu'on comprend en moins de 10 secondes : aller-retour, boucle autour d'un objet, ou tête qui tourne sur place. Pas de rondes qui se croisent.
- **Le départ de chaque pièce est une poche sûre** d'où l'on voit au moins le premier danger (testé : aucun cône ni halo n'atteint l'entrée).
- **Rythme observation → fenêtre → action.** On attend dans une ombre (alcôve, niche entre deux camions, abri derrière un râtelier) jusqu'à une fenêtre lisible (« il me tourne le dos », « la lumière est partie au fond », « il regarde de l'autre côté »), puis on traverse en 1 à 3 secondes jusqu'à l'abri suivant.
- **Peu d'obstacles, mais chacun sert** : chaque conteneur est soit une ombre où attendre, soit un mur qui coupe un cône. Le décor pur (tente, mirador) reste au bord.
- **Deux chemins par pièce** : une solution principale et une variante d'une autre nature (plus longue, ou dans le dos d'un autre garde).

### 1.3 Le nombre de gardes
**2, 2 (+2 lumières), 3, 3 (+1 lumière)**, contre 6 à 8 aujourd'hui. Au-delà de 3 menaces à l'écran, un enfant ne suit plus les horloges, et le joueur occasionnel non plus.

### 1.4 Durée et reprise
- **Durée visée : 30 s à 1 min 30 par pièce** pour un humain qui observe (le bot optimal met 12 à 55 s). Il faut compter **4 à 6 minutes** pour toute la base, avant le quiz.
- **Le point de reprise reste l'entrée de la pièce** (le code le fait déjà). Comme chaque pièce est courte, se faire prendre coûte moins de 30 secondes de jeu.

### 1.5 Les récompenses et les moments forts
- La **traversée réussie d'une fenêtre** est la vraie récompense : le garde se retourne juste après, et on est déjà à l'ombre. Les pièces sont réglées pour que cela arrive souvent (fenêtres de 3 à 5 s pour 1 à 2 s de trajet).
- **Un moment fort par pièce** : passer dans le dos de la sentinelle (1), sortir de la niche juste après le passage du halo (2), filer sous le nez du veilleur pendant qu'il regarde ailleurs (3), passer la cloison du bureau de Beufa (4).
- Suggestion simple (optionnelle) : afficher en fin de pièce « PASSÉ — sans alerte ! » quand `alertes` n'a pas bougé. C'est un objectif bonus pour les plus grands.

---

## 2. Les réglages que je change (dans `REGLAGES`)

À coller à la place des blocs actuels. Toutes les pièces ont été testées avec ces valeurs.

```js
  joueur: {
    vitesse: 130,      // (120) un poil plus vif : moins d'attente, les fenêtres restent larges
    sprint: 200,       // (185)
    rayon: 10,
    bruit: 130,        // (160) on entend le sprint de près seulement : le risque reste lisible
    pierres: 0,        // (5) LA PIERRE EST SUPPRIMÉE — voir §5
    porteePierre: 300,
  },
  garde: {
    portee: 180,       // (205) des cônes plus courts : la pièce n'est pas « tout en cônes »
    angle: 28,         // (26) un cône un peu plus large, mais plus court : il se lit mieux
    reperage: 0.8,     // (0.55) LE CHANGEMENT LE PLUS IMPORTANT : on a le temps de voir le « ? » et de reculer
    vitesseRonde: 50,  // (42) des rondes plus rapides = des fenêtres qui reviennent plus vite (moins d'attente)
    vitessePoursuite: 150, // (160) on peut semer un garde en sprintant (200)
    rayon: 14,
    pause: 1.5,        // (1.2) la pause au bout de la ronde se VOIT : c'est le signal « il va repartir »
  },
  projecteur: {
    rayon: 62,         // (62) inchangé : gros halo, bien visible sur téléphone
    periode: 8,        // inchangé
    reperage: 0.4,     // (0.6) la règle devient simple : « la lumière te touche = tu es vu ». Le halo se voit venir de loin.
  },
  alerte: {
    collective: 200,   // (270) une alerte ne réveille pas toute la pièce
    poursuiteMax: 3,   // (5) la poursuite dure moins longtemps : on peut s'en sortir en se cachant
    verification: 3,   // (3.5)
    rattrape: 24,
  },
  vue: {
    zoom: 1.15,        // (1.4) voir LA RONDE ENTIÈRE à l'écran — indispensable sur téléphone (voir captures tel_*)
  },
```

**Pourquoi ces deux réglages comptent le plus :**
- **`garde.reperage` 0,55 → 0,8 s.** En 0,55 s, le « ? » n'a pas le temps d'être lu. À 0,8 s, frôler le bord d'un cône donne un « ? » (un avertissement), alors que traverser un cône en plein milieu fait quand même déclencher le « ! ». Le test du bot naïf le confirme (§6.2) : foncer tout droit échoue encore la plupart du temps.
- **`vue.zoom` 1,4 → 1,15.** À 1,4, l'écran montre 686×386 px du monde. Une ronde de 300 px plus un cône de 180 px n'y tiennent pas, et sur téléphone, les boutons cachent encore les deux coins du bas. À 1,15 (835×470), on voit la sentinelle **et** son cône **et** l'abri suivant (comparer `tel_p1_alcove_zoom14.png` et `tel_p1_alcove_zoom115.png`). Le héros reste assez gros.

---

## 3. Les petits changements de mécanique indispensables (code)

Je reste court : ce sont des retouches, pas une refonte.

1. **Le projecteur n'alerte que les gardes proches** (`detection()`, la ligne `declencherAlerte(this.gardeLePlusProche(...))`) :
   ```js
   if (pr.jauge >= 1) {
     pr.jauge = 0;
     const g = this.gardeLePlusProche(pr.hx, pr.hy);
     if (g && Math.hypot(g.x - pr.hx, g.y - pr.hy) < 400) this.declencherAlerte(g);   // un garde PAS LOIN accourt
     else if (g && g.etat === 'ronde') {                                               // sinon : il vient juste VÉRIFIER
       g.etat = 'verification'; g.verif = R.alerte.verification; g.vuX = this.joueur.x; g.vuY = this.joueur.y; g.angleVerif = g.angle;
       jouerSon(this, 'beufa_soupcon');
     }
   }
   ```
2. **Corriger le voile de nuit des grandes pièces.** Le canvas `beufa_nuit` fait 960×540 et il est posé à (0,0) **dans le monde**. Il ne couvre donc que le coin haut-gauche des pièces plus grandes. La correction la plus simple : dans `majNuit()`, recaler l'image chaque frame sur la vue de la caméra (`this.nuitImg.setPosition(cam.worldView.x, cam.worldView.y).setDisplaySize(cam.worldView.width, cam.worldView.height)`) et convertir chaque trou en coordonnées écran (`(x - wv.x) * LARGEUR / wv.width`, idem pour y et pour les rayons). Autre option : créer le canvas à la taille de la pièce dans `chargerPiece`.
3. **Les diagonales sur téléphone.** La croix tactile n'a que 4 directions, alors que toutes les traversées de ce jeu sont en diagonale. Les cases vides de la croix (en haut à gauche et en haut à droite, `tactile.js`, grille 3×2) peuvent accueillir **◤ et ◥**, qui appuient sur deux touches à la fois. Pour faire mieux, il faudrait un joystick virtuel. J'ai vérifié que **les 4 pièces restent faisables en 4 directions** (bot en mode `--quatre`, §6), mais les diagonales rendent le jeu beaucoup plus agréable.
4. **Supprimer la pierre** (voir §5 pour la liste exacte).
5. *(Optionnel, mais recommandé)* **Le regard à la pause en bout de ronde** : `Math.sin(...) * 1.15` donne ±66°, et avec le cône le garde voit alors ~190°, presque derrière lui. En passant à `0.7`, il « regarde à gauche et à droite » sans voir dans son dos. Mes pièces passent avec les deux valeurs (elles ont été testées à 1.15, qui est le cas le plus dur).
6. *(Optionnel)* **Une astuce affichée à l'entrée de chaque pièce**, dans `changerDePiece` (`messageCentre`) : « Reste hors des cônes — passe dans leur DOS », « La LUMIÈRE te voit : attends-la dans une niche », « Le veilleur tourne la tête : file quand il regarde ailleurs », « Tout ce que tu as appris… une dernière fois ! ». Et dans l'intro, enlever les lignes sur la pierre.

---

## 4. Le plan de la base

### Pourquoi 4 pièces
4 nouveautés (cône/ombre, lumière, veilleur/boucle, synthèse) donnent 4 pièces. Avec 3 pièces, il faudrait soit enseigner deux choses à la fois, soit supprimer la synthèse finale, qui est justement le moment où le joueur se sent fort. Chaque pièce étant courte (30 s à 1 min 30), 4 pièces restent sous les 6 minutes. C'est aussi le nombre que le propriétaire avait demandé (V27).

### L'enchaînement
```
 PORTAIL ──▶ 1. LA COUR ──(nord)──▶ 2. LE PARC ──(est)──▶ 3. L'ARSENAL ──(nord)──▶ 4. LE QG ──(est)──▶ BUREAU DE BEUFA → QUIZ
            960×720                  1440×540              960×720                  1440×540
            2 gardes                 2 gardes + 2 lumières 3 gardes                 3 gardes + 1 lumière
```
Les sorties sont compatibles avec le code actuel : `'haut'` (porte x 445-515 en haut, pièces de 960 de large) et `'est'`/`'qg'` (x > 1396, y 330-400, pièces de 1440 de large). **Aucun changement de code n'est nécessaire pour les sorties.** La cinématique d'intro (Beufa remonte x=480 au milieu de la pièce 1) passe sur l'axe dégagé.

Légende des schémas : `★` départ, `⇧/⇨` sortie, `▓` conteneur/camion/râtelier, `G` garde (`↕ ↔` aller-retour, `⟳` boucle, `◔` veilleur sur place), `☀` projecteur, `·` chemin principal, `~` variante, `░` ombre sûre.

---

### PIÈCE 1 — LA COUR DU PORTAIL (960×720) — « le cône, l'ombre, le dos »

**Intention.** Comprendre qu'un garde voit dans un cône, qu'un conteneur coupe ce cône, et qu'on passe **dans le dos** d'un garde qui s'éloigne. Il n'y a ni lumière ni piège.

**Zones.**
- **Le portail (sud)** : deux conteneurs encadrent l'entrée. On est hors de portée de tout cône et on voit la sentinelle faire ses allers-retours sur la route.
- **L'axe (centre)** : la route du portail à la porte. **La sentinelle** monte et descend (de y=400 à y=150), s'arrête, regarde autour d'elle, repart. C'est l'horloge de la pièce.
- **Les deux alcôves** : un conteneur vertical de chaque côté de la route. Leur ombre est la **cachette idéale** : la sentinelle ne la voit ni en marchant ni en regardant autour d'elle.
- **Le chemin des réservoirs (est)** : la variante, gardée par une **ronde** qui fait des allers-retours devant les réservoirs.

**Gardes.**
- G1 *La sentinelle de l'axe* (aller-retour nord-sud) : le rythme à lire.
- G2 *La ronde des réservoirs* (aller-retour est-ouest) : elle garde la variante.

**Solution principale.** 1) Attendre que la sentinelle **remonte** (on voit son dos). 2) La suivre et se glisser dans **l'alcôve ouest**. 3) Quand elle **redescend** et vous a dépassé, filer jusqu'à la porte.

**Variante.** Passer par l'est : se cacher derrière la couverture est, attendre que la ronde des réservoirs parte vers l'ouest, longer le mur est jusqu'à l'angle nord, puis longer le mur nord jusqu'à la porte pendant que la sentinelle redescend.

```
   ┌──────────────────[ ⇧ ]──────────────────┐
   │                   · ║               ▓▓▓  │  ▓▓▓ réservoirs
   │  ▓▓▓▓            ·  ║   G1 ↕       ~~~~~ │
   │                 ·   ║   (150..400)     ~ │
   │           ░▓   ·    ║        ▓░        ~ │
   │           ░▓ ·      ║        ▓   G2 ↔ ─ ~ │  G2 : 660..900
   │           ░▓·       ║        ▓         ~ │
   │  (tente)    ·       ║          ▓▓▓▓░  ~  │
   │              · ▒▒   ║   ▒▒        ~~~    │  ▒▒ sacs de sable
   │       ▓▓▓▓     ·    ║    ▓▓▓▓  ~~   (M)  │
   │                   ★ ║ ~~                 │
   └──────────────────[portail]───────────────┘
```

---

### PIÈCE 2 — LE PARC À VÉHICULES (1440×540, de l'ouest vers l'est) — « la lumière »

**Intention.** Apprendre la **lumière** : elle balaie toujours le même trajet, on la voit venir, et **un camion entre elle et toi fait de l'ombre**. Elle apparaît d'abord seule (le portique), puis en rythme avec des cachettes (les niches). La fin rappelle la pièce 1 (un garde dans le dos).

**Zones.**
- **L'entrée (ouest)** : deux jeeps, une poche sûre.
- **Le portique** : un projecteur fixé au mur nord balaie une bande de haut en bas en travers du passage. On attend qu'il soit **en haut** pour passer.
- **La route et les niches (centre)** : le **halo de la route** file d'ouest en est sur l'asphalte et revient. Au sud, trois camions sont garés le long de la route, et **entre eux, des niches à l'ombre** : on saute de niche en niche quand le halo est parti loin.
- **La rangée nord** : quatre camions garés nez au mur. Derrière eux passe une allée où un garde fait sa ronde (la variante).
- **La porte du parc (est)** : *le gardien de la porte* monte et descend devant la sortie. On passe quand il **remonte**.

**Gardes et lumières.** Projecteur *Le portique*. Projecteur *Le halo de la route*. G1 *La ronde du nord* (variante). G2 *Le gardien de la porte*.

**Solution principale.** Portique en haut, aller à la niche A. Halo parti vers l'est, aller à la niche B. Halo encore à l'est, aller à la niche C. Halo reparti vers l'ouest **dans votre dos**, aller à la niche D. Gardien qui remonte, aller à la sortie.

**Variante (« par l'allée nord »).** Passer le portique **par le haut** pendant qu'il descend, entrer dans l'allée nord **derrière la ronde du nord** (elle marche vers l'est), puis se mettre à l'abri dans l'espace entre les deux premiers camions. Quand la ronde revient vers l'ouest et vous a dépassé, repartir **dans son dos** jusqu'à l'espace suivant. Enfin, quand le halo est parti vers l'ouest, descendre jusqu'à la niche D.

```
   ┌──☀────────────────────────☀(tour)─────────────────────────────────────┐
   │  │ ~~~~~~~~~ G1 ↔ (allée nord, 470..1180) ~~~~~~~~~~        (jeep)     │
   │ ▓│  ~    ▓▓  ░~  ▓▓      ▓▓  ░~  ▓▓                  G2 ↕            │
   │  │ ~     ▓▓  ░~  ▓▓      ▓▓  ░~  ▓▓                  │ (110..470)    │
   │  │~      ▓▓      ▓▓      ▓▓    ~ ▓▓                  │               │
 ★ ═══╪════════════[ halo de la route ◄══════════► ]═══~═══╪═══════════════ ⇨
   │  │  ·   ·  ▓▓▓▓▓ ·  ▓▓▓▓▓ ·  ▓▓▓▓▓  · ░ ⬤⬤            │       ·       │
   │ ▓│   A ░   ▓▓▓▓▓B░  ▓▓▓▓▓C░  ▓▓▓▓▓ D░ ⬤⬤ (réservoir)    ·              │
   └──┴────────────────────────────────────────────────────────────────────┘
   portique (x=300)   A/B/C/D = niches à l'ombre des camions du sud
   Les camions du nord sont garés assez bas pour qu'il n'y ait PAS de « trottoir » sûr le long de la route.
```

---

### PIÈCE 3 — L'ARSENAL (960×720) — « le veilleur et la ronde »

**Intention.** Deux nouveaux rythmes : **le veilleur** (un garde planté qui **tourne la tête** lentement à gauche et à droite) et **la ronde en boucle** (un garde qui tourne autour de l'îlot de râteliers). Le veilleur **ne bouche aucun passage** : il surveille la porte par intermittence, et on passe quand il regarde de l'autre côté.

**Zones.**
- **Le sas d'entrée (sud)** : deux râteliers, une poche sûre.
- **L'îlot des râteliers (centre)** : 4 râteliers en carré, avec une petite allée intérieure qui sert de cachette. *La ronde de l'îlot* en fait le tour en boucle, dans le sens des aiguilles d'une montre.
- **Le couloir est** : *la ronde de l'est* y fait des allers-retours devant les caisses.
- **La porte (nord)** : *le veilleur* est planté à l'ouest de la porte, au pied du poste de l'armurier, et balaie du nord-est au sud-est. **L'abri du veilleur** (un râtelier au nord-est) est hors de sa portée : on y attend.

**Gardes.** G1 *La ronde de l'îlot* (boucle). G2 *Le veilleur de la porte* (sur place, tête qui tourne). G3 *La ronde de l'est* (aller-retour).

**Solution principale.** 1) Attendre que la ronde de l'îlot soit **à l'ouest** de l'îlot. 2) Remonter par le couloir est jusqu'à **l'abri du veilleur**. 3) Quand le veilleur **regarde vers le sud-est**, filer à la porte.

**Variante (« dans son dos »).** Suivre la ronde de l'îlot quand elle **monte** le flanc ouest, la laisser repartir vers l'est, puis passer **derrière le veilleur**, contre le mur nord, et longer ce mur jusqu'à la porte pendant qu'il regarde au sud-est.

```
   ┌───────────────────[ ⇧ ]────────────────────┐
   │ ~~~~~~~~~~~~~~~~~~· ·  ░▓▓▓▓ (abri)    ▣   │
   │ ~[table]  G2◔ ··· ·       ·             │
   │ ~             ↘ (balaie NE→SE)      ·      │
   │ ~ ⬤                                ·      │
   │ ~       ┌── G1 ⟳ ──────────────┐   ·      │
   │ ~       │   ▓▓▓▓▓  ▓▓▓▓▓        │   ·  G3↕ │
   │ ~       │   (allée intérieure)  │   ·  ⬤   │
   │ ~       │   ▓▓▓▓▓  ▓▓▓▓▓        │   ·      │
   │ ~       └───────────────────────┘  ·       │
   │ ▣          ▓▓▓▓▓    ·    ▓▓▓▓▓ ·         ▣ │
   │                     ★                      │
   └────────────────────[entrée]────────────────┘
```

---

### PIÈCE 4 — LE QG DE BEUFA (1440×540, de l'ouest vers l'est) — « tout ensemble »

**Intention.** La synthèse : **chaque mécanique revient une fois**, dans l'ordre où on l'a apprise. On lit une menace, on la passe, on passe à la suivante. Rien de nouveau.

**Zones.**
1. **L'antichambre (ouest)** : *le portique* de lumière, comme dans le parc. Deux rayonnages laissent un passage à l'ombre juste après.
2. **La salle des cartes (centre)** : la grande table, et *le stratège* qui en fait **le tour en boucle** (comme la ronde de l'arsenal). On le suit **dans son dos** le long du côté nord.
3. **La cloison du bureau** : un mur percé d'une seule **ouverture** (y 210-360). *Le garde du bureau* (un veilleur) balaie l'ouverture. On passe quand il regarde vers l'est.
4. **Le bureau de Beufa (est)** : *le planton* monte et descend devant la porte du bureau (comme le gardien du parc). On passe quand il **remonte**.

**Gardes et lumière.** Projecteur *Le portique*. G1 *Le stratège* (boucle autour de la table). G2 *Le garde du bureau* (veilleur). G3 *Le planton* (aller-retour).

**Solution principale.** Portique qui remonte, rejoindre l'ombre derrière les rayonnages. Le stratège longe le nord vers l'est : le suivre dans son dos. Il tourne vers le sud : continuer jusqu'à **l'abri devant la cloison**, dans l'angle nord, où le mur cache le garde du bureau. Le garde du bureau regarde vers l'est : passer l'ouverture et descendre le long de la cloison. Le planton remonte : aller à la porte du bureau. **Victoire, puis le quiz.**

**Variante (« le passage secret »).** Entre le mur nord et la rangée de conteneurs nord, il y a un **couloir étroit** que le stratège ne voit jamais : les conteneurs coupent son regard, même à ses pauses. On s'y glisse quand il longe le nord vers l'est, on y attend tranquillement qu'il soit descendu, puis on rejoint l'abri devant la cloison. C'est le chemin « plus long mais plus sûr », pensé pour les plus jeunes.

```
   ┌─☀─────────────────────────────────────────────┬──────────────────────────┐
   │ │        ▓  ~~~~~~~~~~ passage secret ~~~~~~~~~│~ ▣            G3 ↕       │
   │ │▓▓▓▓    ▓ ~    ▓▓▓▓▓      ▓▓▓▓▓       ~░     │  G2◔          │(120..300)│
   │ │        ▓ ·  · · · · · · · · · · · ·  ░ ← abri (la cloison cache du G2)  │
   │ │       ·    ┌──── G1 ⟳ ─────────┐     ·  ouverture                     │
 ★ ═╪══ · ·  ░     │   [TABLE DES       │       ·  ·  ·  ·  ·  ·  ·  ·  ·  ·   ⇨ BUREAU
   │ │▓▓▓▓    ▓   └────────────────────┘          │                          │
   │ │        ▓       ▓▓▓▓       ▓▓▓▓              │      ▓▓▓▓ (classeur)     │
   └─┴─────────────────────────────────────────────┴──────────────────────────┘
   portique (x=300)                               cloison (x=1060)
```

---

## 5. La pierre (X / bouton « Pierre ») : je la SUPPRIME

**Verdict : on la supprime.** Pour ce public, elle coûte plus qu'elle ne rapporte, et les nouvelles pièces n'en ont pas besoin.

**Ce qu'elle apporte.** Une diversion (le « CLAC ! » est amusant) et la seule réponse à un garde planté qui bouche un passage.

**Ce qu'elle coûte, ici.**
- **Un bouton de plus sur un écran de téléphone déjà encombré.** Les boutons cachent les coins bas de l'écran, et la pierre est le 6e bouton.
- **On vise dans la direction du regard**, c'est-à-dire la dernière direction de marche, **sur une croix à 4 directions**. Sur téléphone, on ne peut donc lancer qu'en haut, en bas, à gauche ou à droite, et pour viser il faut d'abord *marcher* dans cette direction, souvent vers le danger. Le viseur existe, mais un enfant ne fait pas le lien.
- **Son effet est trop large** : elle attire tous les gardes à moins de 360 px, ce qui couvre presque toute une pièce de 960. Le résultat n'est pas une diversion précise mais une pièce entière qui se déplace, difficile à lire.
- **Elle crée des solutions « par cœur »** (« lance ici, puis cours là ») au lieu de la lecture des rythmes, qui est le vrai plaisir du jeu.
- **Les pierres ne se rechargent pas en changeant de pièce** (seulement quand on se fait prendre). C'est une ressource invisible de plus à gérer.

**Comment les pièces s'en passent.** Il ne reste que deux gardes plantés : le veilleur de l'arsenal et le garde du bureau. Tous deux **tournent la tête** et ouvrent une fenêtre régulière, comme un phare. Aucun ne bouche un passage obligatoire, et il existe toujours un abri hors de leur portée d'où attendre. Les anciens plantés de la cour (le sas, l'œil du nord-ouest) sont remplacés par une sentinelle qui fait des allers-retours. Le bot passe les 4 pièces sans lancer une seule pierre.

**Ce qu'il faut retirer du code** (`BeufaInfiltration.js` sauf mention contraire) :
- `create()` : l'étiquette tactile `x: 'Pierre'` dans `etiquettesTactiles(...)` (le bouton disparaît), la ligne « Pierre : lancer une pierre… » de l'intro, et le texte « X : pierre (diversion) » du `hintBas`.
- `create()` : `this.hudPierres` (et sa ligne dans `majHudCamera` et `majHud`), ainsi que `this.viseeG` (le viseur).
- `pasJoueur()` : la ligne `if (vientDAppuyer(t.x) && this.pierres > 0) this.lancerPierre();`.
- `afficher()` : le bloc « LE VISEUR DE LA PIERRE ».
- Facultatif : les méthodes `lancerPierre / pasPierre / pierreToucheSol`, `this.pierre` dans `chargerPiece` et `remettreAuDepart`, et dans `index.js` la ligne `reglagesDev` « Pierres par tentative ».
- Solution minimale si l'on veut juste essayer : `REGLAGES.joueur.pierres = 0`. Le viseur et le lancer disparaissent d'eux-mêmes, mais il reste le texte « Pierres : » et le bouton.

*Si un jour on la remet :* 1 seule pierre par pièce, rechargée à chaque pièce, attraction sur 200 px au lieu de 360, et un seul garde attiré (le plus proche). Elle servirait comme **raccourci** (bonus), jamais comme **clé obligatoire**.

---

## 6. Vérification

Tout se trouve dans ce dossier : `lib.js` (charge MES pièces et MES réglages en mémoire dans le vrai jeu), `bot.js` (un bot qui joue image par image dans le **vrai** moteur, en appuyant sur les touches), `solutions.js` (les solutions jouées), `vues.js` et `telephone.js` (les captures).

**Comment le bot joue.** Il ne triche pas. Il appuie sur les flèches comme un joueur, et il attend des **signaux qu'un joueur voit à l'écran** : « la sentinelle remonte », « le halo est parti vers l'est », « le veilleur regarde au sud-est ». Il est lancé 3 fois par solution, avec un départ décalé de 0, 7 et 14 s, pour que les gardes et les lumières ne soient jamais au même moment de leur cycle. Il enregistre le **moindre** « ? » (jauge > 0,3), cône ou halo compris. Tous les tests utilisent les réglages du §2.

### 6.1 Solutions principales et variantes : 24 parties sur 24, sans être vu

| Pièce | Solution | Départ +0 / +7 / +14 s | Alerte | Plus gros « ? » | Durée (bot) |
|---|---|---|---|---|---|
| 1. La cour | principale (alcôve ouest) | ✅ ✅ ✅ | 0 | aucun | 12 à 26 s |
| 1. La cour | variante (chemin des réservoirs) | ✅ ✅ ✅ | 0 | aucun | 24 à 38 s |
| 2. Le parc | principale (niches A-B-C-D) | ✅ ✅ ✅ | 0 | aucun | 27 à 58 s |
| 2. Le parc | variante (allée nord) | ✅ ✅ ✅ | 0 | aucun | 44 à 76 s |
| 3. L'arsenal | principale (couloir est, abri du veilleur) | ✅ ✅ ✅ | 0 | aucun | 17 à 35 s |
| 3. L'arsenal | variante (dans le dos du veilleur) | ✅ ✅ ✅ | 0 | aucun | 35 s |
| 4. Le QG | principale (dans le dos du stratège) | ✅ ✅ ✅ | 0 | aucun | 28 à 53 s |
| 4. Le QG | variante (passage secret) | ✅ ✅ ✅ | 0 | aucun | 29 à 53 s |

*(Deux parties de la variante 2 avaient d'abord dépassé la limite de temps du banc d'essai, 2 minutes, sans jamais avoir été vues. Relancées avec une limite de 4 minutes, elles passent. Cette variante est volontairement la plus longue : c'est « le chemin patient ».)*

**Avec seulement 4 directions (la croix actuelle du téléphone)**, le bot rejoue les solutions principales en n'appuyant jamais sur deux flèches à la fois : **les 4 solutions principales et les 4 variantes passent, sans aucune alerte** (`final_quatre*.txt` ; l'échec de p2 dans `final_quatre.txt` venait du bot, qui restait coincé contre un camion — corrigé, rejoué : `final_quatre_p2.txt`). Un seul petit « ? » a été relevé : jauge du portique à 0,38 sur la variante du QG, parce qu'en 4 directions on traverse le portique moins vite. Ce sera plus confortable avec les diagonales (§3, point 3).

*(Sur les captures, on voit encore « Pierres : ●●●●● » et le bouton « Pierre » : le code du dépôt n'a pas été modifié.)*

Les pièces sont donc franchissables : pas de mur infranchissable, et des fenêtres réelles qui reviennent à chaque cycle.

### 6.2 Contre-épreuve : le « bot naïf » qui fonce tout droit vers la sortie sans attendre
Le but est de vérifier que les gardes servent à quelque chose, autrement dit qu'on ne peut pas réussir sans lire la pièce. 6 essais par pièce, avec un départ décalé de 0 à 20 s :

| Pièce | Passé **sans être vu** | Vu, mais a quand même atteint la sortie | Rattrapé |
|---|---|---|---|
| 1. La cour | 0 / 6 | 2 / 6 | 4 / 6 |
| 2. Le parc | 2 / 6 | 3 / 6 | 1 / 6 |
| 3. L'arsenal | 1 / 6 | 0 / 6 | 5 / 6 |
| 4. Le QG | 0 / 6 | 0 / 6 | 6 / 6 |

Foncer ne marche donc presque jamais proprement. Le parc est la pièce la plus « fonçable » parce que **le projecteur envoie aujourd'hui le garde le plus proche… qui est loin**, et que la sortie est proche. C'est exactement le problème que corrige le changement de mécanique n°1 (§3). Avec cette correction, un halo qui te voit sur la route alerte un garde **qui patrouille à côté** : la ronde du nord passe à ~300 px de la route, et le gardien de la porte la traverse. Ces gardes accourent vraiment, alors qu'aujourd'hui c'est souvent un garde au bout de la pièce qui part trop tard.

### 6.3 Captures
- Vue d'ensemble de chaque pièce (dézoomée, sans le voile de nuit) : `vue_p1.png` à `vue_p4.png`.
- En jeu (zoom 1,15, nuit) : `jeu_p1_observer.png`, `jeu_p1_alcove.png`, `jeu_p2_niche.png`, `jeu_p2_gardien.png`, `jeu_p3_veilleur.png`, `jeu_p4_stratege.png`, `jeu_p4_bureau.png`.
- Téléphone (844×390, tactile, boutons visibles), zoom 1,4 contre 1,15 : `tel_*_zoom14.png` / `tel_*_zoom115.png`.
- La base actuelle, pour comparer : `actuel_*.png`. Sur `actuel_jeu_p1.png`, on voit le bug du voile de nuit (la ligne horizontale au milieu).

### 6.4 Ce que je n'ai PAS pu vérifier
- **De vrais joueurs**, surtout des enfants, sur un vrai téléphone. Le bot prouve que les pièces sont faisables et que foncer est puni. Il ne prouve pas que c'est *amusant* ni que le rythme est bon pour un enfant de 7 ans. **Faites un test : 2 ou 3 personnes, sans explication, et regardez où elles s'arrêtent.**
- **Mes changements de code** (projecteur, voile de nuit, diagonales, retrait de la pierre) **ne sont pas écrits dans le dépôt** : je n'avais le droit que de lire. Les pièces ont été testées avec le code **actuel** (projecteur qui appelle le garde le plus proche, regard ±66° à la pause) et les **réglages du §2** chargés en mémoire. Les modifications proposées rendent toutes le jeu *plus facile*, jamais plus dur, donc les solutions restent valables.
- **Les anciens réglages** (repérage 0,55 s, portée 205, zoom 1,4) : les pièces n'ont **pas** été vérifiées avec eux. Les réglages du §2 vont avec les pièces.
- **La cinématique d'intro** n'a pas été regardée image par image. J'ai seulement vérifié par le calcul que la colonne x=480 de la cour (où Beufa marche de y=480 à y=210) ne contient aucun obstacle.
- **Observation hors sujet** : sur les captures, le héros semble avoir un petit soldat vert collé sur lui (`jeu_p1_alcove.png`, `tel_*`). On dirait un découpage de planche raté (`beufa_heros`). À vérifier.

### 6.5 Les fichiers
- `pieces.js` : **le tableau `PIECES` à coller** à la place de celui de `src/bosses/beufa/reglages.js`. Le format est identique, avec les images existantes.
- `DESIGN.md` : ce document.
- `lib.js`, `bot.js`, `solutions.js`, `vues.js`, `telephone.js`, `shot_actuel.js` : le banc d'essai (Playwright, serveur sur le port 8124). Exemple : `node bot.js p3 --decalages=0,7,14`, ou `node bot.js naif`, ou `node bot.js p1_principale --quatre`.
- `final_*.txt` : les journaux bruts des parties du bot.
