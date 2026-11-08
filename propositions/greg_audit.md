# Greg — audit « comme Lionel » (novembre 2026) : développeur / game designer + joueur bot

Méthode : relecture du code (`src/bosses/greg/`, `BossScene.js`, images sur le disque) par un agent développeur /
game designer, et un bot joueur (`outils/greg_bot.mjs`, nouveau) qui a joué **100 combats complets** (4 difficultés ×
5 profils × 5) dans un vrai navigateur, en accéléré, en réagissant aux signaux comme un humain. 0 erreur JavaScript.

> **FAIT (nov. 2026)** : Fabien a accepté les choix 1 à 17 ; tout est corrigé (détail dans `NOTES.md`, section
> « GREG — CORRECTIONS DE L'AUDIT »). Choix 3 = « dégâts » ; choix 9 = SMASH au round 2 + Greg plus solide en NORMAL /
> CHAMPION. Bot après corrections (100 combats, 0 erreur) : spam et tortue perdent partout, l'enfant et le joueur moyen
> voient le round 3 en NORMAL / CHAMPION, Greg est étourdi plusieurs fois par combat. Reste : les images (choix 18).

## Résumé en 6 lignes
- Greg est battu **au round 2** par tous les joueurs corrects, à **toutes** les difficultés : le round 3 et le SMASH ne sont presque jamais vus (3 combats sur 60).
- La difficulté ne change presque rien pour un bon joueur (rang S partout) ; l'étourdissement de Greg ne s'est **jamais** déclenché.
- Les abus perdent (TORTUE 0/20, SPAM perd en NORMAL / CHAMPION), sauf SPAM qui gagne en ENTRAÎNEMENT (4/5).
- Gros bugs : ton boxeur reste couché au combat suivant après une défaite au compte ; l'aide du Dempsey disparaît dès le 2e combat ; esquive des modes faciles bridée à 0,5 s ; cadre de garde de Greg plus jamais dessiné.
- Les écrans autour du combat (présentation, bandeau, SMASH, case K.O., victoire) montrent encore l'**ancien Greg** (afro, short bleu) ; l'écran de victoire déborde.
- 8 nouveaux prompts d'images (rangés aussi dans `greg_prompts_images.md`) + rappel de ceux déjà prêts.

---

## 1. Ce que dit le bot joueur

Outil : `outils/greg_bot.mjs`.
« !! » SMASH, garde haute / basse de Greg, « hé... » du moment secret, fenêtre de CONTRE, boule du Dempsey Roll,
compte au tapis) et réagit avec un temps de réaction et des erreurs.

- Lancer : `node outils/greg_bot.mjs` (3 combats × 4 difficultés × 5 profils = 60 combats, **≈ 1 min**).
  `node outils/greg_bot.mjs 5` = 100 combats (≈ 2 min) ; `node outils/greg_bot.mjs 1 normal expert` = 1 combat.
- Essayer des réglages SANS toucher aux fichiers : `VARIANTE='{"etourdi":{"baisse":11}}' node outils/greg_bot.mjs`.
- Profils : **EXPERT** (réagit en 0,25 s, 3 % d'erreurs, contre toujours, vise la zone ouverte, voit le moment secret
  9 fois sur 10, Dempsey Roll précis), **MOYEN** (0,35 s, 8 % d'erreurs, contre 7 fois sur 10, voit le secret 1 fois
  sur 2), **ENFANT** (0,5 s, 15 % d'erreurs dont 2 sur 3 = mauvais côté, tape un peu n'importe où et pendant que Greg
  arme), et 2 abus : **SPAM** (tape sans arrêt, ne se défend jamais) et **TORTUE** (garde tout le temps).
- Le combat suivant d'une même case passe par le **vrai bouton REJOUER** de l'écran PERDU (on vérifie que tout repart à zéro).


### Chiffres du bot (100 combats, 5 par case)

Chaque case : victoires / combats — comment — rang — temps de combat moyen — tapis reçus — PV perdus (moyenne).

| Difficulté | Expert | Moyen | Enfant | Spam | Tortue |
|---|---|---|---|---|---|
| ENTRAÎNEMENT | 5/5, K.O. round 2, **SSSSS**, 73 s, 0 tapis, 3 PV | 5/5, K.O. R2, **SSSSS**, 87 s, 0, 7 PV | 5/5, K.O. R2 (1 fois R3), BAAAA, 109 s, 0, 32 PV | **4/5 GAGNÉ** (K.O. R2-R3), CBCC, 156 s, 1 tapis, 171 PV | 0/5 (K.O. R3) |
| FACILE | 5/5, K.O. R2, SSSSS, 75 s, 0, 6 PV | 5/5, K.O. R2, AAAAS, 93 s, 0, 27 PV | 5/5, K.O. R2, AAABA, 105 s, 0, 52 PV | **1/5 gagné** | 0/5 (K.O. R3) |
| NORMAL | 5/5, K.O. R2 (1 fois R1 !), ASSSS, 70 s, 0, 6 PV | 5/5, K.O. R2, AAAAA, 83 s, 0, 27 PV | 5/5, K.O. R2-R3, BCBBC, 109 s, 0,4 tapis, 130 PV | 0/5 (K.O. R2) | 0/5 (K.O. R3) |
| CHAMPION | 5/5, K.O. R2, SSSSS, 71 s, 0, 8 PV | 5/5, K.O. R2, AASAB, 89 s, 0, 41 PV | 4/5, K.O. R2, CCCC, 112 s, 2 tapis, 197 PV | 0/5 (K.O. **R1**, 47 s) | 0/5 (K.O. R2) |

Défense, par type de signal (tous les combats expert + moyen + enfant d'une difficulté) :

| Difficulté | Visage « ! » jaune (esquivés / encaissés) | Coup au foie « ! ▼ » (gardés / **garde brisée** / encaissés) | SMASH « !! » (esquivés / encaissés) |
|---|---|---|---|
| ENTRAÎNEMENT | 192 / 16 (92 %) | 24 / **16** / 2 | 2 / 0 |
| FACILE | 204 / 27 (88 %) | 17 / **26** / 5 | 4 / 0 |
| NORMAL | 189 / 53 (78 %) | 16 / **28** / 5 | 2 / 1 |
| CHAMPION | 199 / 71 (74 %) | 19 / **28** / 10 | 1 / 1 |

Par profil : l'expert esquive 96-100 % des coups au visage, le moyen 86-96 %, l'enfant 85 % (ENTRAÎNEMENT) → 53 % (CHAMPION).

Autres mesures (moyennes par combat, expert / moyen / enfant) :
- **Contres** : 9-10 / 13-15 / 11-14. **Coups « libres » qui touchent** (quand Greg récupère après son coup) : 45-50 / 36-49 / 39-62.
- **Dempsey Roll** : 1 à 2 par combat pour tout le monde ; 85 % vont au bout (10 coups ou Greg au tapis pendant le roll),
  ≈ 30 dégâts en moyenne. L'enfant casse le rythme 1 fois sur 6 environ. Le contre de Greg pendant le roll (round 3)
  n'a été vu qu'**une seule fois** en 100 combats (on n'arrive presque jamais au round 3).
- **Moment secret** : l'expert le trouve 15 fois sur 18, le moyen 6 sur 22, l'enfant 1 sur 29.
- **Étourdissement de Greg** (étoiles, tous les coups passent) : **0 fois en 100 combats.**
- **Greg essoufflé** : ≈ 2 fois par combat.
- **Temps morts** (Greg sans attaquer) : au plus 6,5 s ; plus de 3 s : 0 à 4 fois par combat (surtout quand il est
  essoufflé 2 s puis reprend son souffle). Pas de vrai trou d'ennui.
- **Temps de préparation vu par le joueur** (entre le « ! » et l'impact, le plus court / la moyenne) :

| | Visage | Riposte (« Il se couvre » puis jab) | Rafale | Coup au foie | SMASH | Feinte |
|---|---|---|---|---|---|---|
| ENTRAÎNEMENT | 0,83 / 1,12 s | 0,75 s | 0,87 s | 1,03 / 1,19 s | 1,26 s | 0,63 s |
| FACILE | 0,76 / 0,93 | 0,63 | 0,72 | 0,86 / 0,99 | 1,05 | 0,57 |
| NORMAL | 0,56 / 0,74 | **0,50** | 0,58 | 0,63 / 0,79 | 0,84 | 0,42 |
| CHAMPION | **0,47** / 0,64 | **0,42** | **0,49** | 0,53 / 0,69 | 0,71 | 0,35 |

- **Coups « injustes »** (le bot n'avait pas décidé de se tromper et il est touché quand même) :
  expert **0** partout. Moyen : 1 à 14 par difficulté, presque tous des **coups au foie avec garde brisée** (souffle vide).
  Enfant : 17 (ENTRAÎNEMENT) → 69 (CHAMPION) ; en CHAMPION, 24 sont des **signaux trop courts** pour ses 0,5 s de réaction
  (riposte 0,42 s, rafale 0,49 s, jab du round 3 0,47 s) ; en NORMAL, 6 ripostes (0,50 s pile).
- **Écart entre rounds** : PV perdus par round à peu près égaux (NORMAL : 30 / 24 / 31 PV) ; le round 2 n'est pas plus dur
  que le round 1 en pratique. Mais seuls **3 combats sur 60 (joueurs normaux) atteignent le round 3**.
- **REJOUER** : 29 combats relancés par le vrai bouton : vie, tapis, round, chrono, jauge, secret, Greg énervé,
  difficulté... tout repart bien à zéro, SAUF une chose (bug B1 ci-dessous).
- **Erreurs JavaScript** : aucune en 100 combats (+ 60 combats de variantes).

### Ce qui va bien

- Les abus perdent dans les vrais niveaux : **la TORTUE perd 20 fois sur 20** (sa garde casse : 41-46 gardes brisées par
  combat), le **SPAM perd en NORMAL et CHAMPION** (K.O. dès le round 1 en CHAMPION).
- Signaux lisibles et justes pour un bon joueur : l'expert ne prend AUCUN coup « injuste », esquive 96-100 %.
- Le Dempsey Roll est réussi souvent mais pas toujours (bon plaisir) ; le moment secret récompense l'œil attentif.
- Pas de temps mort, pas de blocage, pas d'erreur JavaScript.


---

## 2. Bugs (relecture du code + bot)

### Gros (le joueur le voit)
1. **Ton boxeur reste AU TAPIS pendant tout le combat suivant** (`GregCombat.js:1266` + `create()` l.50-135).
   Si tu perds parce que tu ne t'es pas relevé avant 10, `this.compte` reste rempli ; `create()` ne le remet pas à zéro.
   Au REJOUER (ou à la visite suivante), `afficher()` voit `compte.qui === 'joueur'` et montre ton boxeur couché
   (`heros_sol`) jusqu'au prochain passage au tapis. → Ajouter `this.compte = null; this.caseKO = null;` dans `create()`.
2. **L'aide du Dempsey Roll disparaît (ou plante) dès la 2e visite** (`GregCombat.js:666-669`). `this.texteAideDempsey`
   est créé une seule fois et gardé d'une partie à l'autre ; après REJOUER / retour au hub, il pointe vers un texte
   détruit : « Appuie sur ▶ pour lancer le roll ! » ne s'affiche plus (au pire erreur JavaScript au `setText`).
   → `this.texteAideDempsey = null;` dans `create()`.
3. **La durée d'esquive des modes ENTRAÎNEMENT (0,65 s) et FACILE (0,55 s) ne sert à rien** (`GregCombat.js:238` et `559`).
   L'esquive s'arrête toujours à `esquiveDuree` = 0,5 s ; la protection « jusqu'à `diff.esquive` » est donc coupée à 0,5 s.
   Les deux modes faciles ne sont pas plus indulgents qu'annoncé, et le réglage développeur « Durée de ton esquive » ne
   change rien au-dessus de 0,5. (`esquiveProtege` 0,45 n'est plus lu nulle part.)
   → Durée de l'esquive = `Math.max(R.esquiveDuree, this.diff.esquive + 0.05)`.
4. **Le cadre blanc + bouclier (zone protégée) ne s'affiche PLUS** (`GregCombat.js:1344` et `1460`). La condition
   « une seule image de garde » est fausse depuis Greg v2 (`gardeBasse` existe) et l'ancienne `greg_garde_haute` existe
   aussi → le cadre n'est jamais dessiné. Or le coach dit au round 1 : « Regarde le cadre blanc : c'est ce qu'il protège ».
   Il ne reste qu'un petit texte gris en 14 px en haut à droite (« Garde HAUTE : vise le corps »), illisible sur téléphone.
   → Dessiner le cadre dès que `g.etat === 'garde'`, quelle que soit l'image.
5. **Garde basse = image du « moment secret »** (`reglages.js` : `gardeBasse` et `nargue` = `greg2_nargue`). La moitié du
   temps Greg a exactement la pose du moment secret : le seul signe du secret devient « hé... » en 18 px. Et l'image
   `greg2_nargue` ressemble beaucoup à `greg2_entier` (debout, gants bas, sourire). → Image v2 de garde basse
   (prompt n°1 plus bas) + vraie pose de provocation (prompt n°2) ; en attendant, garde basse = `greg2_entier`.
6. **Écran de victoire qui déborde** (`GregCombat.js:1170`). 7 à 9 lignes en 18 px, à partir de x = 380, centrées à
   y = 440 : la ligne « Conseil du coach : esquive du côté OPPOSÉ… » (≈ 85 caractères ≈ 900 px) sort de l'écran à droite ;
   les lignes de défis passent sur Greg et sous la bulle ; le bas du bloc touche « ESPACE : retour au hub » ; le haut
   chevauche le trophée (x 175-425). Même défaut que Kédric et Lionel avant leur audit. → Mise en colonne comme Lionel
   (texte à droite du trophée, `wordWrap`, taille qui baisse tant que ça ne tient pas, Greg plus petit).
7. **Greg v1 (afro, short bleu, gants blancs) sur les écrans autour du combat** alors que le combat montre Greg v2
   (cheveux courts, short rouge, gants rouges) : présentation (`greg_portrait`), portrait du bandeau et annonce du SMASH
   (`greg_visage`), case manga du K.O. (`greg_ko`), et **l'écran de victoire** (`greg_touche_pied`, l.1145). Le texte de
   présentation dit aussi « Signe distinctif : afro légendaire ». → Images v2 (prompts n°3 à 5) et texte à revoir.

### Moyens
8. **ENTRAÎNEMENT donne badge, record ET défis** (`classement`, l.1101). Chez Lionel et Kédric, l'entraînement ne donne
   ni record ni défis. Ici « Moins de 30 coups reçus » est presque gratuit en ENTRAÎNEMENT (dégâts x0,4).
   Les défis sont aussi donnés en partant du round 3 par le menu F1. → Pas de record ni de défis en ENTRAÎNEMENT / F1.
9. **« Coups reçus » compte des points de vie, pas des coups** (l.1121 et défi `cuirasse`). Un jab = 8 « coups ».
   Le bilan affiche par exemple « Coups donnés : 300 ». → Écrire « Dégâts donnés / reçus », ou compter les coups.
10. **Dempsey lancé juste avant la cloche = jauge perdue** (`finDuRound`, l.1231). La jauge est vidée au lancement et le
    chrono continue pendant le roll (≈ 6 s). Lancé à 4 s de la fin, il est coupé net. → Figer le chrono pendant le roll
    (le plus simple), ou rendre la jauge si la cloche le coupe.
11. **Pause pendant le clip du Dempsey** (`clips.js`, vidéo HTML par-dessus le jeu, fond noir à 85 %). La vidéo n'est
    retirée qu'après la reprise : le menu de pause est caché derrière la vidéo. → Masquer le clip à la pause.

### Petits
12. Chrono du bandeau d'une partie précédente affiché pendant l'intro / le coin après REJOUER (`this.tempsRound` pas remis
    à zéro dans `create()`).
13. Écouteurs `pause` / `resume` ajoutés à chaque visite (`create()` l.115-121) sans être retirés : ils s'accumulent
    (sans effet visible aujourd'hui). → `this.events.off(...)` au `shutdown`.
14. Après ta relève, Greg peut reprendre son enchaînement 0,35 s après « BOX ! » (`releveJoueur` → `retourGardeGreg()`
    sans pause minimale). → `retourGardeGreg(1.0)`.
15. Valeurs mortes : `appuisPourSeRelever[2]` (20) et `vieApresRelevee[2]` (30) ne servent jamais (3e tapis = K.O. direct),
    `choixCoup()` n'est jamais appelé, toutes les poses dessinées au code de Greg (`greg_garde` … `greg_victoire`) sont
    fabriquées au chargement pour rien.
16. `NOTES.md` pas à jour : l.574 et l.668 parlent encore de l'annonceur vocal de Greg, alors que `annonceur: false` et
    `compteVocal: false` (voix retirées).

### Images : chargées mais jamais montrées (≈ 3,8 Mo téléchargés pour rien sur téléphone)
Vérifié avec `ls` : **aucune image du manifeste ne manque sur le disque**. Mais ces images sont chargées à chaque
première visite et jamais affichées (Greg v2 les remplace) :
`greg_garde_basse_pied`, `greg_pied_jab`, `greg_pied_crochet`, `greg_corps_pied`, `greg_smash`, `greg_etourdi`,
`greg_pied_victoire`, `greg_ko_debout`, `greg_garde_pied`, `greg_entier`, `greg2_entier` (seulement en secours),
`greg2_crochet` (la version ratée), `greg_jambes` (toujours cachée), et en secours seulement `greg_combat`,
`greg_garde_haute`, `greg_coup_corps`, `greg_coup_visage`. Sur le disque mais pas chargée : `dempsey.gif` (1 Mo, le MP4
le remplace).
⚠ ATTENTION avant de faire le ménage : le code teste encore les anciennes images (`this.illustre` = « `greg_combat`
existe ? », l.95 ; écran de victoire = `greg_touche_pied`). Il faut d'abord changer ces deux tests, sinon Greg
redevient un dessin au code.

### Vérifiés, sans problème
- La cloche arrête bien un Dempsey en cours et cache son aide ; au changement de round, Greg repart en garde.
- Pause : le jeu, les minuteries et les tweens s'arrêtent avec la scène ; l'appui qui sert à reprendre est oublié.
- Pas d'appui perdu pendant le hit-stop (les touches sont lues à l'image suivante) ; mémoire d'appui 0,15 s pendant un coup.
- Tactile : boutons ◀ ▶, ▼ Garde, Visage, Corps, Dempsey (seulement jauge pleine) ; ▼ sert aussi au FREIN du Dempsey.
- Sons : les 11 fichiers existent ; voix coupées volontairement.


### Trouvés par le bot (en plus)
17. **Garde brisée : dégâts sans la difficulté** (`impactGreg` : `at.degats * 0.5`). En ENTRAÎNEMENT, un coup au foie
    gardé souffle vide fait 6,5 PV alors que pris sans garder il fait 5,2 PV (garder fait plus mal que rien).
    → `at.degats * this.diff.degatsGreg * 0.5`.
18. **Contre de Greg pendant le Dempsey Roll** : toujours 30 PV (`dempsey.degatsContre`), même en ENTRAÎNEMENT. → × `this.diff.degatsGreg`.

Note : le bot a vérifié 29 REJOUER : vie, tapis, round, chrono, jauge, secret, Greg énervé, difficulté repartent bien
à zéro. Il confirme le bug 2 (aide du Dempsey). Le bug 1 (boxeur couché) a été confirmé à la relecture
(`GregCombat.js:941-943` : défaite sans `this.compte = null`) ; le bot ne regardait pas la pose du héros.

---

## 3. Équilibrage et plaisir

### Constats du bot

1. **Greg est battu au round 2 par tous les joueurs corrects, dans TOUTES les difficultés** (70-110 s de combat). Le
   round 3 (le SMASH, son contre pendant le Dempsey Roll) n'est presque jamais vu : 3 combats sur 60. L'arme secrète
   annoncée sur sa fiche (« le SMASH, round 3 ») passe à la trappe.
2. **La difficulté ne change presque rien pour un bon joueur** : l'expert perd 3 à 8 PV et fait rang S partout ; le combat
   dure pareil (Greg a les mêmes 300 PV à tous les niveaux). Seuls l'enfant (32 → 197 PV perdus) et le spam sentent la différence.
3. **Les coups « libres » font plus de dégâts que les contres** : ≈ 45 coups libres touchent par combat (≈ 140 PV) contre
   ≈ 10 contres (≈ 90 PV). Raison : pendant qu'il récupère après son coup (`recup`) ou juste après avoir été touché
   (`touche`), Greg ne pare JAMAIS (`blocageLibre` ne joue que quand il est en garde). C'est l'esprit Punch-Out (punir
   après son coup), mais la notice dit « les contres restent la vraie source de dégâts » : ce n'est pas le cas.
4. **L'étourdissement ne se déclenche jamais** (0 sur 100) : la jauge cachée se vide trop vite (`baisse` 18 par seconde
   alors qu'un contre n'en donne que 35 et un coup 15, et Greg se couvre après 3 coups).
5. **Garde brisée sur le coup au foie** : pour le moyen et l'enfant, plus de gardes brisées que de gardes réussies
   (NORMAL : 28 brisées pour 16 réussies). Le coup au foie ne se pare QU'en garde : si on a peu de souffle (on a tapé,
   on a esquivé), on n'a **aucune défense possible**. C'est la 1re cause de coups « injustes » du joueur moyen.
6. **SPAM gagne en ENTRAÎNEMENT (4 fois sur 5)** et parfois en FACILE (1 sur 5) : marteler les boutons suffit à battre Greg
   en entraînement. Acceptable pour un mode « découverte » ? (question).
7. **CHAMPION trop rapide pour un enfant** : riposte 0,42 s, rafale 0,49 s, jab du round 3 0,47 s. En NORMAL, la riposte
   (0,50 s) est déjà à la limite. Pour l'expert, aucun signal n'est trop court.
8. **Rangs trop généreux** : rang S à tous les niveaux pour l'expert, S même pour le moyen en ENTRAÎNEMENT, A pour un
   enfant en FACILE. Le rang ne tient pas compte de la difficulté.

### Propositions de réglages (dans `src/bosses/greg/reglages.js`, testées avec le bot sauf mention)

| # | Réglage | Actuel | Proposé | Effet mesuré par le bot |
|---|---|---|---|---|
| 1 | `etourdi.baisse` | 18 | **11** | Greg étourdi ≈ 3 fois par combat (au lieu de 0) ; avec 6 c'est trop (8 fois). |
| 2 | `gardeSouffle` | 22 | **14** | Gardes brisées du moyen sur le coup au foie : 8 → 0 ; la TORTUE perd toujours (0/9). |
| 3 | `riposte.prepa` | 0,5 | **0,6** | Riposte vue 0,60 s en NORMAL, 0,51 s en CHAMPION (au lieu de 0,50 / 0,42). |
| 4 | `vieGregApresRelevee` | [100, 100] | [130, 150] | Combats plus longs (+15 à +25 s) mais **toujours K.O. au round 2** pour l'expert : ne suffit pas à montrer le round 3. |
| 5 | `blocageLibre` | [0,4 / 0,5 / 0,6] | même valeurs, mais appliqué aussi pendant `touche` (petit changement de code) | Non testé : rendrait les contres vraiment indispensables. |
| 6 | SMASH plus tôt : ajouter `['smash']` à la fin des `ENCHAINEMENTS` du round 2 | absent | présent | Non testé (choix de jeu) : le SMASH serait vu par tout le monde. |
| 7 | Rang selon la difficulté (petit code dans `classement`) | identique | ENTRAÎNEMENT : B au mieux ; FACILE : A au mieux | Non testé. |

Essai combiné 1 + 2 + 3 + 4 (60 combats) : expert / moyen gagnent toujours (rangs S-A), l'enfant gagne en ENTRAÎNEMENT /
FACILE / NORMAL et perd 2 fois sur 3 en CHAMPION, le spam gagne encore 2 fois sur 3 en ENTRAÎNEMENT, la tortue perd tout,
combats de 75 à 145 s ; coups « injustes » : 0 pour l'expert, 3 en tout pour le moyen (au lieu de 33).

Corrections de code conseillées en premier : B1 (aide du Dempsey), B2 et B3 (dégâts selon la difficulté).


### Avis de game designer (relecture)

### Ce qui marche (à garder)
Boucle esquive → CONTRE x3 → jauge → Dempsey Roll ; trois couleurs d'alerte ; enchaînements apprenables ; Greg ÉNERVÉ
avec feintes ; coup secret ; coach qui commente tes erreurs ; hit-stop, ralenti et zoom sur les contres.

### Chiffres tirés du code (NORMAL)
| | Round 1 | Round 2 | Round 3 | Round 3 après 2 tapis, CHAMPION |
|---|---|---|---|---|
| Préparation d'un jab | 0,80 s | 0,72 s | 0,66 s | 0,47 s (esquive qui protège : 0,38 s) |
| Pause entre enchaînements | 1,6-2,4 s | 1,1-1,8 s | 0,8-1,4 s | idem |
- Greg : 3 × 100 PV (+15 entre les rounds). Toi : coup 3, contre 9, Dempsey parfait ≈ 50 (la moitié d'une vie de Greg),
  coup secret = 100 (un tapis entier). Jauge d'esprit : 8 esquives.
- D'après les bots de `NOTES.md`, tous les profils mettent Greg K.O. **au round 2**.

### Problèmes de design
1. **L'arme signature n'est presque jamais vue.** Le SMASH (« Arme secrète » de la présentation) et le contre de Greg
   pendant le Dempsey sont réservés au round 3, que la plupart des joueurs n'atteignent pas. Seul Greg ÉNERVÉ (après
   2 tapis) peut sortir un SMASH (4e enchaînement de la liste énervé), donc souvent trop tard.
2. **« Toujours contrer au CORPS » est la meilleure stratégie.** Un contre passe toujours, peu importe la garde de Greg.
   Le coup au corps fait les mêmes dégâts que le visage ET vide le souffle de Greg (x2 en contre) : le coup au visage
   n'a plus de raison d'être, sauf sur les coups « libres » (déjà parés 40-60 % du temps).
3. **La garde haute / basse ne se voit plus** (bugs 4 et 5) : la décision « visage ou corps ? » est devenue invisible.
4. **Le moment secret est introuvable** : 0,6-0,7 s, une fois par round, signalé par « hé... » en 18 px, avec la même
   image que la garde basse. Le joueur qui le trouve par hasard gagne un tapis entier (le tiers du combat).
5. **Rythme trop régulier** : enchaînements dans l'ordre, Greg se relève toujours à 6 puis à 8. Au bout de 2 parties on
   récite (point A1/A2 de l'audit précédent, toujours d'actualité).
6. **« ! » violet placé à gauche ou à droite** alors que le côté ne compte pas pour un coup au corps (garde seulement) :
   un débutant croit qu'il faut esquiver.
7. **Puissance du joueur en dehors du Dempsey** : 3 dégâts par coup, barre de Greg qui bouge à peine ; aucun compteur
   de série ; Greg ne porte aucune marque des coups reçus.

### Propositions (gros gain / petit effort d'abord)
**Gros gain, petit effort**
1. Corriger les bugs 1 à 6 (surtout le cadre de garde : quelques lignes).
2. **Visage et corps vraiment différents** : visage = 4 dégâts + étourdit 2x plus vite ; corps = 2 dégâts + souffle.
   Le contre au VISAGE quand il est en garde basse fait x4 (au lieu de x3) → on regarde de nouveau sa garde.
3. **SMASH dès le round 2** (1 fois, dans le 4e enchaînement) et toujours dans les enchaînements « énervé » en 2e
   position : l'arme signature est vue par tout le monde.
4. **Moment secret lisible** : vraie image de provocation + petit son (« tsss » / sifflement) + éclat sur son ventre ;
   le coach le dit en clair au round 1 (« Quand il te nargue, frappe au CORPS ! »).
5. **« ! » violet toujours au centre**, sous son menton.
6. **Ordre fixe au round 1, au hasard aux rounds 2-3** (sans répéter deux fois le même) + pause variable 0-0,4 s
   avant certains coups (déjà proposé, toujours pas fait).

**Gain moyen, effort moyen**
7. **Compteur « 3 HITS ! » pendant la fenêtre de contre** (+10 % par coup) et **esquive PARFAITE** (≤ 0,12 s avant
   l'impact : flash bleu, +5 d'esprit). Déjà proposés.
8. **Relève de Greg moins prévisible** : relève à 5-8 au hasard ; s'il est tombé sur un FINISH du Dempsey ou un coup
   secret, il se relève plus tard (8-9) et le public hurle.
9. **Chrono figé pendant le Dempsey** (corrige aussi le bug 10) et Dempsey « FINISH » qui met Greg au tapis s'il lui
   reste moins de 20 PV (moment de gloire garanti).
10. **Marques sur Greg** : teinte rouge sur la joue après chaque tapis + gouttes de sueur à chaque contre.

**Bonus**
11. Défi « Coup secret trouvé » et « Dempsey FINISH » (ajoutés aux 3 défis), revanche en CHAMPION après une victoire.
12. Sons « réels » : souffle du coup de Greg qui part (whoosh), « ooooh » du public sur un contre, cloche plus grave.


---

## 4. Animations et images

### Ce qui existe
| Qui | Images | Animé comment |
|---|---|---|
| Greg v2 (combat) | garde haute, nargue, entier, jab, corps, smash, touché, étourdi, tape-gants (`greg2_*.png`) | images fixes déplacées / grossies / penchées / teintées au code (élan, recul, tremblement, chute) |
| Greg (autour) | présentation, visage du bandeau et du SMASH, case K.O., écran de victoire | **ancien Greg v1** (bug 7) |
| Ton boxeur (de dos) | garde, coup, uppercut, touché, au sol (`heros_*.png`) | coup = même image retournée pour jab / crochet ; corps = coup baissé ; esquive = garde descendue de 40 px ; garde = garde réduite à 96 % ; Dempsey = coup retourné ; victoire = uppercut |
| Coach | 4 portraits (regard, malin, sévère, kbg) | fixes, glissent à l'écran |
| Dessiné au code | ring et public (pixel art), trophée, portrait de ton boxeur dans le bandeau, gant volant (plus utilisé), arbitre absent (compte = texte) | |
| Clip | `dempsey.mp4` (lancement du Dempsey) | vidéo |

### Poses provisoires branchées
- **Crochet de Greg = image du jab** (`reglages.js`, `crochet: greg2_jab`). Prompt « greg_crochet.png — À REFAIRE » déjà
  dans `greg_prompts_images.md` : à générer.
- **Garde basse = nargue** (bug 5), **chute K.O. = étourdi**, **victoire de Greg = nargue**, **pas de pose « il arme »**
  (garde décalée), **pas de relève** (il réapparaît d'un coup).
- Ton boxeur : pas d'esquive, pas de garde, pas de coup au corps, pas de victoire, pas de Dempsey (voir tableau).

### Images à générer — prompts DÉJÀ PRÊTS dans `propositions/greg_prompts_images.md` (ne pas les recopier)
| Fichier attendu (dans `assets_inbox/greg_v2/`) | Section du fichier de prompts | Remarque |
|---|---|---|
| `greg_crochet.jpg` | « greg_crochet.png — À REFAIRE » | priorité 1 |
| `greg_arme.jpg` | Étape 2, ligne `greg_arme` | il arme son coup |
| `greg_ko_debout.jpg` | Étape 2, ligne `greg_ko_debout` | chute K.O. |
| `greg_releve.jpg` | Étape 2, ligne `greg_releve` | relève |
| `greg_victoire.jpg` | Étape 2, ligne `greg_pied_victoire` | Greg gagne |
| `heros_esquive.png`, `heros_bloque.png` | début du fichier | priorité 1 côté héros |
| `heros_corps.png`, `heros_victoire.png`, `heros_coin.png` | début du fichier | |
| `greg_arbitre.png` | début du fichier | **correction** : joindre `assets/sprites/greg/coach_severe.jpg` (le prompt dit « same style as the attached image » sans dire laquelle) |

Pour les poses Greg : joindre `assets_inbox/greg_reference_face.jpg`, coller le « Prompt commun » de l'Étape 2, puis la
ligne POSE. Ajouter ensuite les nouveaux noms à la liste `POSES` de `outils/greg/preparer_v2.py`.

### NOUVEAUX prompts (aussi rangés dans `propositions/greg_prompts_images.md`)

**1. `assets_inbox/greg_v2/greg_garde_basse.jpg`** — garde basse v2 (CORRIGE la ligne `greg_garde_basse_pied` de
l'Étape 2 : il faut qu'elle soit très différente de la provocation). Joindre `assets_inbox/greg_reference_face.jpg`,
coller le Prompt commun de l'Étape 2, puis :
```
POSE: low boxing guard protecting the BODY: both gloves held tight in front of his stomach and ribs, elbows glued to
his sides, slightly crouched, knees bent, weight forward, face fully open and unprotected, chin up, serious focused
eyes (NOT smiling). The gloves must clearly cover the abs. The belt has a plain gold buckle with NO text.
```

**2. `assets_inbox/greg_v2/greg_nargue.jpg`** — provocation (REMPLACE l'actuelle, trop proche de `greg_entier`).
Joindre `assets_inbox/greg_reference_face.jpg`, Prompt commun de l'Étape 2, puis :
```
POSE: arrogant taunt: both arms dropped completely, gloves hanging at his thighs, torso leaning back, chin pushed
forward, tongue slightly out and a mocking wide grin, one eyebrow raised, head tilted, his stomach fully exposed.
Clearly different from a neutral standing pose. The belt has a plain gold buckle with NO text.
```

**3. `assets_inbox/greg_v2/greg_portrait.jpg`** — présentation (remplace `greg_portrait.jpg`, format vertical 9:16).
Joindre `assets_inbox/greg_reference_face.jpg` (le personnage) ET `assets/sprites/greg/greg_portrait.jpg` (la mise en page).
```
Use the first attached image as the exact character reference (same face, short curly hair, beard, skin tone, body,
same arm tattoos on the same arms, red satin trunks with gold belt, red gloves with white wraps). Use the second
attached image ONLY for the composition and mood: dramatic 1990s boxing manga splash page, vertical 9:16, the boxer
standing in the ring facing the viewer, from the knees up, fists lowered and clenched, intense stare, sweat drops,
steam from his shoulders, stadium lights behind him, blurred crowd, strong speed lines. No readable text, no logo,
no letters on the belt.
```

**4. `assets_inbox/greg_v2/greg_visage.jpg`** — gros plan du bandeau et de l'annonce du SMASH (remplace `greg_visage.jpg`,
format paysage environ 300×260). Joindre `assets_inbox/greg_reference_face.jpg`.
```
Same character as the attached image (same face, short curly hair, beard, skin tone), close-up of the head and
shoulders, facing the viewer, furious shouting face, veins on the forehead, sweat, one red glove raised next to his
cheek, 1990s boxing manga style, dark dramatic background with red speed lines. Head centered and fully visible,
nothing cropped above the hair. No text.
```

**5. `assets_inbox/greg_v2/greg_ko.jpg`** — case manga du K.O. (remplace `greg_ko.png`, format portrait 4:5).
Joindre `assets_inbox/greg_reference_face.jpg`.
```
Same character as the attached image (same face, short curly hair, beard, tattoos on the same arms, red trunks with
gold belt, red gloves, red boots), knocked out lying flat on his back on a blue boxing ring canvas, seen from above,
arms spread, eyes rolled back, mouth open, mouthguard flying out, sweat splashes around him, 1990s boxing manga
style with heavy ink. Whole body visible, plain pure white background around the canvas area, no text.
```

**6. `assets/sprites/greg/greg_trophee.png`** — trophée de l'écran de victoire (aujourd'hui dessiné au code).
Joindre `assets/sprites/greg/heros_garde.png` (pour le style de dessin).
```
A shiny golden boxing championship trophy in 1990s manga style (same drawing style as the attached image): a golden
cup on a black marble base, a small pair of golden boxing gloves on top, a red ribbon around the handles, sparkles,
front view, centered. Plain pure white background, nothing touching the edges, no text, no engraving.
```

**7. `assets/sprites/greg/heros_portrait.png`** — ton boxeur dans le bandeau (aujourd'hui petit dessin pixel).
Joindre `assets/sprites/greg/heros_garde.png`.
```
Same young boxer as the attached image (same spiky brown hair, same green boxing gloves, same manga style), but seen
from the FRONT this time: head and shoulders portrait, determined smile, a small bandage on the cheek, one green
glove raised next to his face. Square image, head centered, plain pure white background, no text.
```

**8. `assets/sprites/greg/heros_dempsey.png`** — Dempsey Roll (aujourd'hui = image du coup penchée). Une seule image,
retournée par le jeu pour l'autre côté. Joindre `assets/sprites/greg/heros_garde.png`.
```
Same boxer as the attached image, same manga style, colors and outfit, seen FROM BEHIND (back to the viewer).
Performing the Dempsey Roll: body crouched very low and swinging to the RIGHT in a figure-eight weave, torso bent
sideways, right glove launching a hook upward, left glove tucked at the chin, speed lines and motion blur following
the weave, explosive power. Plain pure white background, full figure, nothing touching the edges, no text.
```

### Sans image (code seul, rappel de l'audit précédent, toujours pas fait)
Squash & stretch quand Greg encaisse ; inclinaison ±12° + traînée pendant ton esquive ; tremblement + étincelle sur tes
gants en garde ; balancement en « ∞ » de ton boxeur pendant le Dempsey ; éclat blanc sur le gant de Greg qui arme ;
sueur / rougeur progressive de Greg après chaque tapis.

---

## 5. LISTE DE CHOIX pour Fabien

**Bugs**
1. Je corrige les **bugs 1 à 6 + 17-18** (boxeur couché après REJOUER, aide du Dempsey, esquive des modes faciles,
   cadre de garde, garde basse ≠ provocation (en attendant l'image : garde basse = `greg2_entier`), écran de victoire
   en colonne, dégâts selon la difficulté) ? (oui / non)
2. **ENTRAÎNEMENT** comme Lionel et Kédric : badge oui, ni record ni défis ? (oui / non)
3. « Coups reçus » → afficher les **dégâts** ou compter les **coups** ?
4. **Chrono figé pendant le Dempsey Roll** (corrige le bug 10) ? (oui / non)
5. **Ménage des anciennes images** (≈ 3,8 Mo en moins sur téléphone) ? (oui / non)

**Équilibrage (réglages testés avec le bot)**
6. `etourdi.baisse` 18 → 11 (Greg étourdi ≈ 3 fois par combat au lieu de 0) ? (oui / non)
7. `gardeSouffle` 22 → 14 (fin des gardes brisées « injustes » sur le coup au foie ; la tortue perd toujours) ? (oui / non)
8. `riposte.prepa` 0,5 → 0,6 (riposte jouable par un enfant en NORMAL) ? (oui / non)
9. Faut-il qu'un bon joueur voie le **round 3** ? → **SMASH dès le round 2** (une fois), et/ou Greg plus solide
   (`vieGregApresRelevee`) seulement en NORMAL / CHAMPION ?
10. En ENTRAÎNEMENT, est-ce grave que marteler les boutons fasse gagner ? (laisser / corriger)
11. **Rang selon la difficulté** (ENTRAÎNEMENT : B au mieux, FACILE : A au mieux) ? (oui / non)

**Game design**
12. **Visage et corps différents** (visage = dégâts + étourdissement, corps = souffle ; contre au visage x4 sur garde
    basse) ? (oui / non)
13. **Contres indispensables** : Greg pare aussi les coups « libres » juste après avoir été touché ? (oui / non)
14. **Moment secret plus lisible** (image + son + phrase du coach au round 1) ? (oui / non / garder secret)
15. « ! » violet (coup au corps) toujours **au centre** ? (oui / non)
16. **Ordre au hasard aux rounds 2-3** + pause variable avant certains coups ? (oui / non)
17. Compteur « X HITS » + esquive PARFAITE ? (oui / non)

**Images**
18. Lesquelles tu génères en premier ? Ordre conseillé : `greg_garde_basse` (n°1) → `greg_nargue` (n°2) →
    `greg_crochet` → `heros_esquive` + `heros_bloque` → `greg_portrait` / `greg_visage` / `greg_ko` (n°3-5) → le reste.

Après tout changement : `node outils/greg_bot.mjs` (≈ 1 min, 60 combats) ; on peut essayer des réglages sans toucher
aux fichiers : `VARIANTE='{"etourdi":{"baisse":11}}' node outils/greg_bot.mjs`.
