# Greg : avis « fun » de game designer (nov. 2026)

Seul sujet ici : le plaisir de jeu. Pas de chasse aux bugs, et rien de ce qui est déjà fait (voir `greg_audit.md`,
`greg_audit_fun_animation.md`). Chiffres mesurés avec le bot sur les réglages actuels (NORMAL, 9 combats :
`node outils/greg_bot.mjs 3 normal expert,moyen,enfant`).

## 1. Verdict honnête

**La base est bonne.** La boucle « il prévient → j'esquive du bon côté → CONTRE !! » marche. Elle est lisible et elle fait
du bien (ralenti, flash, secousse, « CONTRE !! »). Le rush (« TAPE ! TAPE ! TAPE ! »), le coup secret, le « X HITS » et
l'esquive PARFAITE sont de bonnes idées. Les nouvelles images rendent Greg vivant.

**Le vrai problème, c'est le RYTHME du combat. Il s'écroule.** Un joueur correct met Greg K.O. **dès le round 1** :

| Profil (NORMAL) | Durée du combat | Round du K.O. | PV perdus par le joueur |
|---|---|---|---|
| bon joueur | **47 s** (une fois **29 s**) | 1, 1, 1 | 12 sur 100 |
| joueur moyen | 65 s | 2, 1, 1 | 23 |
| enfant | 2 min | 2, 3, 2 | 109 |

Voici ce que vit un joueur moyen, minute par minute :
- **0-20 s** : Greg tape dans l'ordre (jab, jab, foie…). J'apprends. C'est bien.
- **20-35 s** : « hé hé… » → coup au corps → **COUP SECRET, Greg au tapis**. Le premier tiers du combat tient en un
  seul coup, et c'est un coup que je n'ai pas vraiment « mérité ».
- **35-50 s** : 8 esquives, la jauge est pleine → **Dempsey Roll** → je regarde une boule sur un « ∞ » en bas de
  l'écran, pas Greg → **tapis n°2**. Chaque Dempsey réussi = un tapis (Greg se relève avec 100 PV, le roll fait 45 à
  95 dégâts et le FINISH le met au sol sous 50 PV).
- **50-65 s** : Greg « s'énerve »… 15 secondes plus tard, Dempsey n°2 → **K.O.** Fin.
- **Ce que je n'ai jamais vu** : le round 2, le round 3, le **SMASH** (1 seul SMASH sur 9 combats !), Greg qui
  accélère, le contre de Greg pendant le Dempsey. L'histoire en 3 actes passe à la trappe.

Pourquoi ça gâche le plaisir :
1. **Pas de montée en tension.** Le combat finit avant d'avoir commencé. Un bon joueur perd 12 PV : Greg ne fait jamais peur.
2. **Le Dempsey Roll n'est plus « le moment ultime ».** Il revient 2 fois par minute et il gagne à lui seul. En plus,
   on joue à un petit jeu de rythme à part au lieu de regarder le combat. Fabien le trouve « pas assez fun » : c'est
   normal, il est trop fréquent, trop sûr, et il ne raconte rien.
3. **Mes coups normaux ne « pèsent » pas.** Un coup libre fait 2,4 % de la barre et, chez l'enfant, il est **paré plus
   souvent qu'il ne touche** (« TAK » : 64 parés pour 37 touchés). D'où le ressenti « ses coups font bien plus mal que
   les miens ». Un jab de Greg fait 4,8 et un crochet 9,6, soit 2 à 4 fois mes coups.
4. **Quand le Dempsey casse, ça punit fort.** L'enfant casse 7 rolls sur 10 (« Trop tard ! ») et perd 8 esquives
   d'efforts d'un coup. L'attaque ultime finit en échec : c'est le pire moment pour être frustré.
5. **Le rush est trop court pour en profiter** (1,3 s). On lit « TAPE ! TAPE ! », on tape 5 ou 6 fois, et c'est déjà fini.

## 2. Les améliorations, gros gain / petit effort d'abord

### A. Greg monte d'un cran À CHAQUE TAPIS (et plus seulement à chaque round) · effort PETIT · gain ÉNORME
- **Problème** : on bat Greg avant de voir ses rounds 2 et 3, et donc son SMASH, ses feintes et sa vitesse.
- **Solution** : Greg joue au niveau `max(round, tapis + 1)`. Après le 1er tapis, il passe aux enchaînements du
  round 2, sort **son SMASH** et va plus vite. Après le 2e, il joue ceux du round 3, s'énerve (c'est déjà le cas) et
  peut contrer pendant le Dempsey. Le combat garde ses 3 actes, quelle que soit la vitesse du joueur. Petit changement
  dans `choisirAttaque` / `vitesseRound` / `contreA`.

### B. Le Dempsey Roll redevient RARE et toujours GLORIEUX · effort PETIT (réglages) + MOYEN (« ne casse plus ») · gain TRÈS GROS
- **Problème** : trop fréquent, il gagne tout seul. Et quand il casse, on se sent nul.
- **Solution** :
  - Jauge plus longue à remplir, mais qui récompense aussi l'attaque : `esprit.esquive` 13 → **8**,
    `esprit.contre` 0 → **4** (environ 12 actions au lieu de 8).
  - `dempsey.finishTapis` 50 → **30** : le FINISH met au tapis seulement un Greg déjà bien entamé. On prépare le
    Dempsey au lieu de le lancer dès qu'il est prêt.
  - **Il ne casse plus** : un raté = un coup plus faible et un « BIEN » perdu, mais le roll va toujours jusqu'au
    FINISH. Seul le contre de Greg (boule rouge) peut l'arrêter. Un enfant vit lui aussi le moment ultime.
  - **Regarder Greg, pas une boule** : le « ∞ » passe en petit, et le vrai repère devient le buste de ton boxeur qui
    se balance et la tête de Greg qui part d'un côté à l'autre. On garde le bip, plus un battement de musique qui
    accélère.
- **Mesuré** (avec les réglages de C) : un bon joueur ou un joueur moyen va au round 2, un enfant au round 3.

### C. Mes coups font MAL (à voir et à sentir) · effort PETIT · gain GROS
- **Problème** : « mes coups ne font rien » : trop de « TAK », barre de Greg qui bouge à peine.
- **Solution** :
  - `blocageLibre` [0,6 ; 0,7 ; 0,8] → **[0,35 ; 0,5 ; 0,6]** : moins de « TAK ». Pour compenser,
    `vieGregApresRelevee` [100, 100] → **[130, 150]** : Greg revient plus solide de chaque tapis, ce qui rend aussi
    le combat plus long.
  - **Chiffre de dégâts sur CHAQUE coup** (déjà fait pour le Dempsey, à copier) : « -2 », « -7 » orange sur les
    contres, « -10 » énorme dans le rush.
  - **Barre de vie « qui saigne »** : la partie perdue reste blanche 0,4 s puis fond. La barre tremble sur un contre.
    C'est l'effet de tous les jeux de combat : chaque coup se voit.
  - Quand Greg pare, dire POURQUOI une seconde : « Il protège le VISAGE → CORPS ! » (en NORMAL et plus facile).
- **Mesuré** (essai A-B-C en réglages seulement) : bon joueur 82 s (round 2), moyen 93 s (round 2), enfant 2 min 36
  (round 3, gagne 3 fois sur 3). Les coups libres de l'enfant touchent plus qu'ils ne sont parés (56 pour 44).

### D. Le RUSH : un vrai moment de gloire · effort PETIT · gain GROS
- **Problème** : 1,3 s, c'est trop court pour le savourer, et on ne sait pas quand ça s'arrête.
- **Solution** : `etourdi.duree` 1,3 → **1,8**, avec une **barre qui se vide** au-dessus de Greg (on voit le temps
  restant) et le public qui monte. Le coup qui finit le rush est automatiquement un **gros crochet** (x2, ralenti,
  « BAM !! »). Avant, Fabien trouvait l'étourdi « trop long » : c'était le blocage de 15 s, réglé depuis. Là on parle de
  0,5 s de plus, avec un compteur visible.

### E. Le COUP SECRET donne un RUSH au lieu d'un tapis tout fait · effort PETIT · gain MOYEN
- **Problème** : un seul coup = un tapis entier, à 30 s du début. C'est puissant, mais passif, et ça tue le rythme.
- **Solution** : le coup secret **étourdit Greg à coup sûr avec un rush long (2,5 s, tes coups x4)**. C'est le joueur
  qui met Greg au tapis en tapant comme un fou : c'est lui le héros, pas un message à l'écran. On garde le flash doré
  et « COUP SECRET !! ».

### F. Greg plus menaçant pour un bon joueur · effort PETIT · gain MOYEN
- **Problème** : 12 PV perdus sur tout le combat, aucune peur.
- **Solution** :
  - En NORMAL, la flèche « ▶▶ ESQUIVE » seulement au round 1 (`aideFleche` [true, false, false] ; le « ! » reste). On lit
    alors Greg, son épaule et son côté, au lieu de lire l'écran : c'est ÇA, le plaisir Punch-Out. Les flèches restent
    en ENTRAÎNEMENT et en FACILE.
  - Avec A, le SMASH et les feintes arrivent pour tout le monde.
  - Greg a 2 ou 3 phrases quand il te touche (« Trop lent ! ») : il devient un personnage qui nargue.

### G. Le K.O. final : un vrai final de film · effort MOYEN · gain MOYEN
- **Problème** : le 3e tapis ressemble aux deux premiers.
- **Solution** : au coup du K.O. : arrêt sur image 0,4 s, puis **ralenti du dernier coup rejoué une fois** (zoom sur
  le visage de Greg, avec l'image `greg2_ko_debout`), cloche qui sonne trois fois et public debout. C'est ce moment-là
  qu'on a envie de revivre, donc de rejouer.

### H. Téléphone : gestes, deux petits réglages · effort PETIT · gain MOYEN (sur mobile)
- La garde attend 0,12 s de doigt immobile (`GESTES.garde`) : c'est bien. Mais pour le **coup au foie**, il faut que
  la garde parte tout de suite → **0,08**.
- **Contre plus facile au pouce** : pendant la fenêtre de contre, toute la moitié droite de l'écran brille (halo orange
  0,8 s). On sait que c'est LE moment de toucher.

## 3. À NE SURTOUT PAS toucher
- La boucle esquive → contre x3, les 3 couleurs d'alerte, le « ! » du côté du coup.
- Le round 1 joué dans l'ordre (tutoriel) et le hasard des rounds 2-3.
- Les finitions d'impact : hit-stop, ralenti sur contre, flash, secousse, onomatopées manga.
- Le « TAP ! TAP ! » avant le SMASH, la phrase du coach, Greg qui s'énerve avec des feintes.
- Les gestes sur téléphone (le principe est bon), l'esquive tolérante (0,5 s), la mémoire d'appui.
- Les dégâts de Greg en NORMAL (0,6) : on ne retouche pas, on rend juste le joueur plus visible et plus puissant.

## 4. Images
Rien d'obligatoire : les poses actuelles suffisent pour A à H. En option, pour la phase 3 (Greg énervé), une pose
« furieux » rendrait la montée en tension visible :

```
Fichier attendu : assets_inbox/greg_v2/greg2_enerve.jpg
Joindre : greg2_garde_haute.png (pour garder le même Greg, mêmes tatouages, même taille)
Prompt : Same boxer character as the attached image, full body, standing on his feet, facing the viewer, in a high
guard, but FURIOUS: veins on the forehead, red angry eyes, steam coming from his head, teeth clenched, sweat, a bruise
on the cheek. Same art style, same clothes and tattoos, same proportions and framing, plain flat light-grey background,
no text.
```
(À ranger dans `propositions/greg_prompts_images.md` si Fabien le valide.)

## 5. Choix pour Fabien (réponds avec les numéros)
1. **Greg monte d'un cran à chaque tapis** (on voit toujours SMASH, feintes et round 3) ? (oui / non)
2. **Dempsey plus rare** (environ 12 actions pour le remplir, contres compris) et **FINISH au tapis seulement sous 30 PV** ? (oui / non)
3. **Le Dempsey ne casse plus** (un raté = un coup plus faible ; seul le contre de Greg l'arrête) ? (oui / non)
4. Dempsey : **regarder Greg et ton boxeur** plutôt que la boule « ∞ » (la boule devient petite) ? (oui / non)
5. **Moins de « TAK »** (`blocageLibre` 0,35 / 0,5 / 0,6) + Greg plus solide après chaque tapis (130 / 150) ? (oui / non)
6. **Chiffres de dégâts sur tous tes coups + barre de vie qui saigne** ? (oui / non)
7. **Rush 1,8 s avec barre visible + gros crochet final** ? (oui / non / garder 1,3 s)
8. **Coup secret = rush long** au lieu d'un tapis direct ? (oui / non, garder le tapis)
9. NORMAL : **flèche d'esquive seulement au round 1** ? (oui / non)
10. **K.O. final au ralenti** (le dernier coup rejoué) ? (oui / non)
11. Téléphone : **garde plus rapide (0,08 s) + halo « CONTRE » à droite** ? (oui / non)
12. Image optionnelle **Greg énervé** : tu la génères ? (oui / plus tard)

Conseil : 1 + 2 + 5 ensemble (réglages + un petit bout de code), puis on relance le bot. C'est ce qui change le plus le
ressenti, pour le moins d'effort.
