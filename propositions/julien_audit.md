# Julien — audit « comme Lionel » (novembre 2026) : la manif, le lycée, la classe

Méthode : relecture du code (bugs) + un BOT qui joue des parties complètes (`node outils/julien_bot.mjs`, ≈ 1 min)
+ avis de joueur + images. **Rien n'a été modifié dans le jeu** : on attend tes choix (liste à la fin).

## Résumé en 5 lignes
1. Aucun plantage : **216 parties** jouées par le bot (3 niveaux × 4 difficultés × 3 profils × PC / téléphone × 3), 0 erreur JavaScript, `julien_verif` à 0 erreur.
2. **La manif est bien réglée** : la difficulté monte proprement de LYCÉEN SAGE à ANARCHISTE, la lacrymo fait la moitié des dégâts (c'est elle qui tue les débutants).
3. **Le lycée** est un bon petit niveau, court (≈ 30 à 60 s pour le bot qui connaît le plan, sans doute 2-3 min pour un vrai joueur) ; la purée est le danger n° 1.
4. **Le combat contre Julien est TROP FACILE et TROP COURT** : 72 combats sur 72 gagnés, même par le débutant, en **25 à 55 s** ; seulement **5 attaques par combat** ; la vue du dessus (la meilleure trouvaille) n'apparaît pas du tout dans 1 combat sur 4.
5. Un vrai bug d'équilibrage l'explique en partie : **chaque boulette met en pause le compte à rebours des attaques de Julien** ; plus 8 petits bugs, et des images qui rendraient les attaques et les fins plus parlantes (8 nouveaux prompts, section 21).

## 1. Bugs trouvés

| # | Gravité | Où | Ce qui se passe | Correction proposée |
|---|---|---|---|---|
| 1 | **MOYEN** (équilibrage) | `JulienClasse.js:556` et `:267` | Chaque boulette fait passer Julien en « touché » 0,18 s, puis remet son minuteur d'attaque **à la valeur d'avant** : pendant qu'on lui tire dessus (1 boulette / 0,3 s), il s'arrête de marcher et son attaque suivante recule. Mesuré : 3 à 6 s « figé » par combat. | Laisser le minuteur continuer (`e.tApres = e.t - 0.18`) ou ne plus le figer du tout (juste le flash blanc). Même mécanique, moins gênante, pour les policiers (`JulienManif.js:789`). |
| 2 | **MOYEN** | `armes.js:62` | Arme vide **avec le bouton maintenu** : rien ne se passe (ni son, ni message, ni changement d'arme) tant qu'on ne relâche pas. Très fréquent avec le PISTOLET À EAU (jet continu = on garde le doigt dessus) et avec LANCER sur téléphone. Le bot restait bloqué comme ça. | Passer à l'arme suivante dès que c'est vide, même si le bouton reste appuyé (comme Doom), avec le message « À court ! ». |
| 3 | **MOYEN** (téléphone) | `JulienManif.js:166-178` | Écran PERDU : le bouton LANCER devient « HUB ». Un joueur qui tape LANCER en rafale au moment de mourir (on tire tout le temps !) repart au hub et **perd le lycée / la classe**. Sur PC, X est aussi une touche de jeu (« inverser », préréglage MODERNE). Testé : la répétition automatique du clavier ne le déclenche pas, seul un nouvel appui. | HUB sur un autre bouton (ex. le bouton du haut / touche H ou Échap), ou n'accepter HUB qu'après 1,5 s. |
| 4 | PETIT | `JulienManif.js:768` | Un œuf qui s'écrase sur un bouclier (« plonk ») **n'alerte pas** le CRS : un CRS loin (8 à 11 cases) qu'on bombarde reste planté sans réagir. | Mettre `e.alerte = true` (et `vuX`, `vuY`) avant le `return`. |
| 5 | PETIT | `JulienClasse.js:389` | L'aide à la visée qui « anticipe » la marche de Julien calcule avec la vitesse des **œufs** (9) au lieu de la **sarbacane** (12) : elle vise un tiers trop loin devant lui (surtout en phase 3, il marche plus vite). | `RG.sarbacane.vitesse` au lieu de `RG.oeufs.vitesse`. |
| 6 | PETIT (rare) | `JulienClasse.js:219`, `dessus.js:147` | Une boulette 3D encore en vol au moment où la vue du dessus commence peut toucher Julien et **changer la phase** pendant la rafale : il reste alors en « pause » jusqu'à la fin, et la fenêtre « de dos » d'après est sautée. | Vider `this.tirs` dans `entrerDessus`. |
| 7 | PETIT (textes) | `JulienManif.js:782`, `niveau_lycee.js:63` | Au lycée, un surveillant mis en fuite affiche « Omelette ! », « Retour au commissariat ! », « Il s'enfuit tout dégoulinant ! » ; un fayot crie « Il a des ŒUFS, m'sieur ! » alors que les œufs sont interdits. | Messages de fuite propres à chaque niveau (« Au bureau du CPE ! », « Il file se changer ! »…) ; fayot : « Il a une SARBACANE, m'sieur ! ». |
| 8 | PETIT | `JulienManif.js:112` | Lancés depuis le menu de test, le lycée et la classe montrent la présentation de Julien avec « ESPACE : à la manif ! ». | Invite selon la scène (« au lycée ! », « en classe ! »). |
| 9 | TRÈS PETIT | `JulienManif.js:982-983` | Les flashs blanc (farine) et doré (ramassage) s'effacent à chaque image, pas avec le temps : 2 fois plus courts sur un téléphone à 120 Hz. | Les faire baisser avec `dt`. |
| 10 | Ménage | plusieurs | Code mort : les FUMIGÈNES (retirés du plan : la touche 5 et `RG.fumigenes` ne servent plus, l'intro dit « 1-5 ») ; le motif « copies » jamais choisi (`JulienClasse.js:403`, `RG.julien.copies`) ; les sols sombres de l'ancienne phase 2 « dans le noir » (`decor_classe.js:87-98`) ; les lettres `o`, `t`, `b` de `OBJETS_CLASSE` ; 3 images du héros vu du dessus non chargées (`dessus_heros_cote`, `_marche0/1`). | Retirer (ou remettre 1 fumigène dans le niveau, voir choix I). |

**Vérifié OK** : les 216 parties ont été jouées en **réutilisant les mêmes scènes Phaser** (comme « REJOUER ») : rien de
la partie d'avant ne casse la suivante ; plans atteignables (`julien_verif`) ; le bot sait finir les 3 niveaux sur PC et
téléphone simulé (écran tactile, joystick + ↺ ↻ + LANCER) ; la répétition des touches ne fait pas de faux « HUB ».

**Ce qui reste des audits précédents** : audit final → tout fait (dessus.js, boucle commune, textes allégés, Anarchiste,
vérif), sauf le **point de reprise** par phase (moins urgent tant que le combat dure 30 s). Audit Doom → restent le
point 3 (BAC en civil, tireur de LBD, policiers en hauteur, sono = BFG) et le point 4 (clé + porte + boucle). Audit fun →
restent BAC + canon à eau et la sono.

## 2. Résultats du bot

Le bot connaît le plan (chemin le plus court), ramasse ce qui est près de son chemin, va se soigner, vise et esquive.
3 profils : **EXPERT** (réagit en 0,15 s, esquive tout, change d'arme au bon moment, pancarte contre le bouclier),
**MOYEN** (0,35 s, esquive 3 fois sur 4, garde l'arme qu'il a en main), **DÉBUTANT** (0,6 s, esquive 4 fois sur 10,
tire même sur le bouclier levé, ne se cache pas). Une partie = une vie. Un vrai joueur qui découvre le plan mettra
2 à 3 fois plus de temps.

Chaque case : **victoires / parties — temps moyen des victoires — vie perdue en moyenne** (3 parties par case).

### La manif
| | EXPERT | MOYEN | DÉBUTANT |
|---|---|---|---|
| PC sage | 3/3 — 37 s — 5 | 3/3 — 42 s — 12 | 3/3 — 38 s — 5 |
| PC délégué | 3/3 — 47 s — 21 | 3/3 — 57 s — 31 | 3/3 — 62 s — 22 |
| PC bloqueur | 3/3 — 41 s — 25 | 3/3 — 65 s — 46 | 2/3 — 46 s — 47 |
| PC anarchiste | 3/3 — 61 s — 40 | 3/3 — 70 s — 67 | 1/3 — 82 s — 134 |
| Tél. sage | 3/3 — 63 s — 23 | 3/3 — 55 s — 16 | 2/3 — 55 s — 53 |
| Tél. délégué | 3/3 — 64 s — 14 | 3/3 — 66 s — 41 | 3/3 — 52 s — 41 |
| Tél. bloqueur | 3/3 — 68 s — 32 | 3/3 — 84 s — 46 | 2/3 — 66 s — 65 |
| Tél. anarchiste | 3/3 — 87 s — 58 | 3/3 — 77 s — 105 | 1/3 — 71 s — 135 |

- Dégâts reçus : **lacrymo 50 %**, charge du CRS 50 %. Morts : surtout sur **la place** (4 sur 7), puis rue du lycée, parvis, ruelle.
- Téléphone : ≈ 1,5 fois plus long (pas de course), un peu plus dur. Victoire en ayant fait fuir 84 % des policiers en moyenne.
- Rythme : jamais plus de **17 s** sans policier alerté autour (pas de temps mort). Le PAR (3:30) est large pour qui connaît le chemin.
- Ramassé (72 parties) : œufs 195, pistolet à eau 155, tomates 153, casse-croûte 111, écharpe 87, K-Way 58, café 33, sandwich 20, soin d'un manifestant 8. **Fumigènes : 0** (retirés du plan). Secrets : le bot ne les cherche pas.
- Tirs : **eau 7 838**, œufs 1 450, tomates 440, pancarte 144 (seulement l'expert). Le pistolet à eau, équipé d'office quand on le ramasse, devient l'arme principale de ceux qui ne changent pas d'arme : ses coups sont silencieux et ne font pas sursauter (pas de retour), il éteint bien les lacrymos.

### Le lycée
| | EXPERT | MOYEN | DÉBUTANT |
|---|---|---|---|
| PC sage | 3/3 — 29 s — 11 | 3/3 — 25 s — 12 | 2/3 — 23 s — 43 |
| PC délégué | 3/3 — 32 s — 6 | 3/3 — 29 s — 16 | 3/3 — 28 s — 29 |
| PC bloqueur | 3/3 — 33 s — 10 | 3/3 — 29 s — 34 | 3/3 — 26 s — 29 |
| PC anarchiste | 3/3 — 40 s — 51 | 3/3 — 47 s — 90 | 3/3 — 24 s — 99 |
| Tél. sage | 3/3 — 51 s — 1 | 3/3 — 53 s — 8 | 1/3 — 31 s — 71 |
| Tél. délégué | 3/3 — 45 s — 8 | 3/3 — 46 s — 19 | 2/3 — 34 s — 59 |
| Tél. bloqueur | 3/3 — 59 s — 8 | 3/3 — 46 s — 26 | 2/3 — 32 s — 51 |
| Tél. anarchiste | 3/3 — 68 s — 62 | 2/3 — 42 s — 64 | 2/3 — 33 s — 84 |

- Dégâts : **purée 38 %**, charge du surveillant 33 %, « il t'attrape » 29 %. Morts : 6 sur 7 **avant le carnet**.
- Victoires : expert 24/24, moyen 23/24, débutant 18/24. Ramassé : casse-croûte 54, canette 33, sandwich 23 ; placard secret et K-Way jamais trouvés.

### La classe (Julien)
| | EXPERT | MOYEN | DÉBUTANT |
|---|---|---|---|
| PC sage | 3/3 — 33 s — 3 | 3/3 — 35 s — 6 | 3/3 — 35 s — 19 |
| PC délégué | 3/3 — 37 s — 4 | 3/3 — 29 s — 3 | 3/3 — 24 s — 33 |
| PC bloqueur | 3/3 — 40 s — 12 | 3/3 — 33 s — 30 | 3/3 — 28 s — 44 |
| PC anarchiste | 3/3 — 56 s — 29 | 3/3 — 52 s — 23 | 3/3 — 46 s — 40 |
| Tél. sage | 3/3 — 37 s — 3 | 3/3 — 39 s — 12 | 3/3 — 36 s — 22 |
| Tél. délégué | 3/3 — 28 s — 1 | 3/3 — 26 s — 11 | 3/3 — 28 s — 29 |
| Tél. bloqueur | 3/3 — 32 s — 28 | 3/3 — 23 s — 25 | 3/3 — 28 s — 45 |
| Tél. anarchiste | 3/3 — 48 s — 11 | 3/3 — 47 s — 29 | 3/3 — 44 s — 61 |

- **72 victoires sur 72**, aucune mort. Le débutant finit avec ≈ 55 % de vie en BLOQUEUR.
- Durée des phases : **16 s / 11 s / 9 s**. **5 attaques par combat** en moyenne (sur 72 combats : livre 76, rafale de murs 68, contrôle surprise 57, éventail 50, craies 48, mur 32, « au tableau » 18, **dico 9**, rafale 5, **« confisqué » 0, règle 0**).
- Dégâts reçus : livre 48 %, copies 26 %, craies 21 %, murs de la vue du dessus 4 %, dico 1 %.
- Fenêtre « DE DOS » : 2,7 fois par combat, mais seulement **29 % des dégâts** faits à Julien le sont de dos : on peut gagner sans s'en servir.
- Vue du dessus : **absente dans 17 combats sur 72** ; quand elle a lieu, l'expert esquive 540 murs sur 545 (elle est juste) ; 20/20 obtenu 77 fois sur 97 rafales.
- « CONFISQUÉ ! » et la RÈGLE ne se déclenchent que si on s'approche à moins de 3 cases : un joueur prudent ne les voit jamais.

## 3. Plaisir et équilibrage (avis de joueur)

**Ce qui est fun**
- La manif : le chaos (foule, gyrophares, lacrymos), le CRS qui crie puis charge (on apprend vite le pas de côté), les combos « OMELETTE ×3 », le fourgon de la fin. Le rythme ne retombe jamais.
- Le changement d'ambiance au lycée (Duke Nukem, la sarbacane, les fayots qui balancent) : on rit.
- La vue du dessus et sa note 20/20 / 0/20 : lisible, nerveuse, juste.
- Julien qui annonce ses attaques en grand, les élèves qui réagissent, le bureau renversé.

**Ce qui l'est moins**
- **Le boss tombe trop vite** : 30 s pour le « boss de fin » du personnage, c'est moins long que la manif ; on n'a pas le temps de voir ses attaques (dico, confisqué, règle presque jamais). Avec la sarbacane à 1 dégât toutes les 0,3 s et l'aide à la visée qui anticipe, il suffit de garder le doigt sur LANCER.
- La fenêtre « de dos » (l'idée centrale du combat refait) est facultative : de face, on fait déjà 70 % des dégâts.
- Le pistolet à eau « ne fait rien » à l'oreille : pas de bruit d'impact, pas de sursaut ; et comme il est équipé d'office, beaucoup de joueurs se battront avec sans le savoir.
- Fumigènes : l'arme 5 n'existe plus dans le niveau, mais reste dans les touches et le code.

**Idées concrètes, classées par intérêt / effort**
1. ★★★ / petit — Rééquilibrer Julien : corriger le bug n° 1, vie 55 → ≈ 100, boulettes **×0,5 de face** (il se protège avec son livre ouvert, petit « plonk ») et ×2 de dos → la fenêtre de punition devient le cœur du combat ; aide à la visée plus faible en classe. Objectif : 1 min 30 à 2 min 30, débutant 1 fois sur 2 en BLOQUEUR (je vérifie avec le bot).
2. ★★★ / petit — Une rafale de murs (vue du dessus) **imposée au début de chaque phase**, comme en Anarchiste : tout le monde voit la meilleure partie.
3. ★★ / petit — Julien **descend de l'estrade** vers toi de temps en temps (phase 2-3) : « confisqué » et la règle deviennent de vraies menaces.
4. ★★ / moyen — **Rang de fin de la classe** (temps, vie, 20/20, coups de dos) et record au hub, comme la manif.
5. ★★ / moyen — **Points de reprise** par phase (si le combat devient plus long).
6. ★★ / petit — Pistolet à eau : petit bruit d'éclaboussure + sursaut tous les 5 coups, ou ne plus l'équiper d'office.
7. ★ / gros — Restes de l'audit Doom : BAC en civil, LBD, policiers en hauteur, sono (BFG), clé + porte.

## 4. Animations et images

**Dessiné par le code** (pas d'image) : le sol (chaussée, pavés, dalles, lino, parquet), le ciel panoramique et le
plafond à néons, la barre du bas façon Doom, le viseur, tous les voiles (gaz vert, rouge du coup, rose, blanc farine,
doré), les gyrophares, l'alarme incendie (flash rouge) et les gouttes des sprinklers, les lignes de « AU TABLEAU ! »,
le « ×2 », les annonces, le **bureau renversé** (image du bureau retournée tête en bas et étirée ×1,6), la vignette et
les particules de la vue du dessus, la goutte d'eau en vol, la carte.

**Une seule image figée** (elle bouge seulement de haut en bas, ou pas du tout) :
- Julien **de dos** au tableau (figé 2 s), Julien qui prépare « AU TABLEAU ! », « CONFISQUÉ ! », la RÈGLE et le DICO : **même pose « livre levé »** pour tout.
- Livre, dico, copies, craies en vol ; nuage de lacrymo ; purée ; fourgon (il apparaît d'un coup) ; rideaux de fer (ouverts d'un coup).
- Surveillant **essoufflé** = sa pose de marche ; quand il t'attrape, rien ne change.
- Policiers qui toussent dans leur lacrymo ou aveuglés par la farine : pose normale.
- Élèves en phase 3 (sprinklers) : simplement « cachés ».
- Sarbacane confisquée : la main disparaît.
- Écrans GAZÉ ! / ATTRAPÉ ! / COLLÉ ! / victoire : **texte seul** sur un voile noir.

**Poses qui manquent, par ordre d'intérêt** — prompts prêts dans `julien_prompts_images.md`, **section 21** :

| Prompt | Fichier à déposer | À joindre | Pour quoi |
|---|---|---|---|
| 21a | `julien_prof_3.jpg` | `julien_reference.jpg` + `julien_prof_1.jpg` | 2e image de dos (il écrit), « au tableau » (il pointe), « confisqué » (il attrape), la règle levée |
| 21b | `julien_fin_gaze.jpg`, `julien_fin_attrape.jpg`, `julien_fin_colle.jpg`, `julien_fin_victoire.jpg` | `julien_reference.jpg` (3e et 4e) | écrans de fin illustrés |
| 21c | `julien_bureau_renverse.jpg` | `julien_objets_classe.jpg` | le vrai bureau renversé (phase 3) |
| 21d | `julien_police_effets.jpg` | `julien_policier.jpg` + `julien_crs.jpg` | policiers qui toussent / enfarinés |
| 21e | `julien_surveillant_2.jpg` | `julien_surveillant.jpg` | surveillant essoufflé, qui t'attrape |
| 21f | `julien_eleves_2.jpg` | `julien_eleves.jpg` | élèves trempés, cahier sur la tête (phase 3) |
| 21g | `julien_main_vide.jpg` | `julien_main_sarbacane.jpg` | la main vide pendant « confisqué » |
| 21h | `julien_livres_vol.jpg` | — | livre et dico qui volent en 3 images |

Le prompt le plus utile, à copier tel quel dans Gemini (joindre `julien_reference.jpg` et `julien_prof_1.jpg`) :
```
Use the attached images as the exact character: same face, hair, beard, clothes, colors, scale and pixel art style. Do not redesign him.
Pixel art sprite sheet in the style of DOOM (1993) and Wolfenstein 3D. Humorous, cartoonish, no blood, no gore. Full body, seen strictly from the FRONT unless stated, no perspective tilt.
4 poses in one row, each in its own equal-size cell, same scale as the attached images, feet aligned on the same bottom line:
1) seen from the BACK, writing on an invisible blackboard with a piece of chalk, arm lower than in the attached back pose, head slightly turned to the side (second frame of the writing animation);
2) pointing his index finger straight at the viewer with an outstretched arm, shouting "to the board!", very stern face;
3) leaning forward, one open hand reaching toward the viewer to snatch something, the other hand on his hip, smug confiscating face;
4) holding a huge wooden ruler (as long as his arm) raised high above his head with both hands, about to strike, angry eyebrows.
Plain solid pure white background (#FFFFFF), no ground shadow, no text, no frame, no grid lines.
IMPORTANT: every pose is clearly SEPARATED from the others by a wide empty white gap (at least a quarter of a cell wide) on all sides; no arm, ruler or chalk may touch another pose or the cell border.
```

## 5. LISTE DE CHOIX pour Fabien

| Choix | Quoi | Effort |
|---|---|---|
| **A** | Corriger les bugs 1 à 9 (Julien figé, arme vide, bouton HUB, plonk qui alerte, visée, textes du lycée…) | petit (≈ 1 h) |
| **B** | Rééquilibrer Julien (vie ≈ 100, ×0,5 de face / ×2 de dos, aide à la visée réduite), vérifié au bot | petit (≈ 1 h) |
| **C** | Rafale de murs (vue du dessus) imposée au début de chaque phase | très petit |
| **D** | Julien descend de l'estrade de temps en temps (confisqué / règle deviennent de vraies menaces) | petit |
| **E** | Rang de fin + record pour la classe (comme la manif) | moyen (≈ 1 h 30) |
| **F** | Point de reprise au début de chaque phase de Julien | moyen |
| **G** | Pistolet à eau : bruit d'impact + sursaut, ou ne plus l'équiper d'office | très petit |
| **H** | Brancher les nouvelles images de la section 21 quand tu les livres (21a d'abord) | petit par image |
| **I** | Fumigènes : en remettre 1 dans la manif, OU retirer l'arme 5 du code (ménage, point 10) | très petit |
| **J** | Restes de l'audit Doom : BAC en civil, LBD, policiers en hauteur, sono, clé + porte | gros |

Conseil : **A + B + C** ensemble (le boss devient un vrai boss), puis H au fil des images.

Relancer le bot : `node outils/julien_bot.mjs` (tout, ≈ 1 min) ou par exemple
`node outils/julien_bot.mjs classe bloqueur expert,moyen,debutant pc 5`.
