# NOTES : état du projet "Les Bracass'"

## Où on en est (mis à jour V92)
- **Greg** : TERMINÉ (branche de référence `greg-termine`). **Lionel** : VALIDÉ. **Kédric** : jouable (courses + battle
  de danse), manquent le décor illustré (stade, pelouse) et le trophée.
- **Beufa** : TERMINÉ — infiltration façon Metal Gear (4 pièces) puis QUIZ dans son bureau (codec, Psycho Mantis,
  rideau, 60 questions, GAME OVER façon MGS, classement BIG BOSS → CHICKEN, médaille = badge du hub, meilleur rang
  sauvegardé). Audit final : `propositions/beufa_audit_final.md`.
- **Julien** : EN COURS — niveau 1 « la manif » jouable ; niveau 2 « la salle de classe » : COMBAT REFAIT (audit B :
  fenêtre de punition de dos, 8 attaques, phases noir / bureau renversé + alarme, élèves, sarbacane). RESTE : le
  MINI-NIVEAU « LE LYCÉE » (audit A) FAIT. Reste : faire jouer Fabien, équilibrer. Voir « JULIEN » plus bas.
- **Rémi** : V1 JOUABLE (3 jeux à la suite) : vélo → BABYFOOT (V19, le beer pong est SUPPRIMÉ) → porte. Voir « RÉMI » plus bas.
- Le site a un service worker (`sw.js`) qui revérifie chaque fichier : les mises à jour apparaissent sans vider le cache.

## AUDIT GLOBAL V18 (6 boss, version économe) : `propositions/audit_global.md`
- 0 plantage (14 lancements + « rejouer »), 0 erreur aux outils. Petits défauts : B1 clic souris inactif sur l'écran de fin
  (BossScene.attendreRetour), B2 historique du navigateur qui s'accumule (manif de Julien), B3 trophée / stade de Kédric
  dessinés au code (prompts : `propositions/kedric_prompts_images.md`). Propositions (en attente de Fabien) : REJOUER pour
  tous les boss, passe « une seule règle » sur Kédric, difficultés harmonisées, récompense des 6 badges.

## V18 — CORRECTIONS DE L'AUDIT GLOBAL (toutes faites, demande de Fabien)
- REJOUER pour tous : `BossScene.defaite` → « ESPACE ou clic : rejouer / X : hub » ; `rejouer()` relance la scène avec
  `donnees.rejouer` (+ `nomDiff`, `diffObjet`) : `afficherIntro`, `afficherPresentation`, les `presentation()` de Greg /
  Lionel / Kédric et leurs `choisirDifficulte` sont sautés. Écran de fin : le clic souris ramène aussi au hub (B1).
- Julien manif : une seule entrée dans l'historique du navigateur (B2).
- Kédric : `kedric_stade.jpg` (bande 960 x 172 au-dessus de l'horizon) et `kedric_trophee.png` intégrés
  (`outils/kedric/preparer_decors.py`, originaux dans `assets_inbox/kedric/`) (B3).
- DIFFICULTÉS : ENTRAÎNEMENT ajouté à Greg et Lionel (Lionel : 5 cartes avec PERSO) ; BEUFA : 4 niveaux façon MGS
  (VERY EASY / EASY / NORMAL / EXTREME, `DIFFICULTES` + `appliquerDifficulte` dans beufa/reglages.js, `beufa/difficulte.js`) :
  vue / repérage / poursuite des gardes, projecteurs, erreurs et temps du quiz ; NORMAL = inchangé ; record par difficulté.
- KÉDRIC « une seule règle » : plus de bouton SPRINT (chaque esquive accélère, `sprint.parEsquive` ; poursuivi : 2 esquives
  le sèment, `poursuite.parEsquive`, il rattrape x0,6) ni de bouton GHOST (part tout seul quand la jauge est pleine et
  qu'un défenseur, pas Kédric, est à moins de `ghost.auto` 6 yards). Défi « sans Ghost » retiré. Pas de bot Kédric :
  à juger en main.
  Ghost rendu plus rare (V93, « se déclenche trop vite, trop facile ») : jauge 8 / 8 / 10 / 14 (au lieu de 5 / 5 / 6 / 9), durée 3 s (au lieu de 4).
  Battle sur TÉLÉPHONE (V93) : plus de ronds fléchés dessinés par le jeu au bas des couloirs (doublon décalé des gros boutons) ; seuls les boutons s'allument.
- LA FIN : `src/hub/FinaleScene.js` (« LES BRACASS' AU COMPLET ! », 6 portraits + badges, confettis), montrée une fois
  quand les 6 badges sont gagnés (`Sauvegarde.fait('finale_vue')`), à revoir depuis le hub (F ou « ★ LA FIN ★ »).
  BOSS RUSH : pas fait (idée facultative de l'audit).

## ⚠️ À RAPPELER À FABIEN quand les 6 boss seront finalisés (phase de FINITION)
- Repasser sur CHAQUE jeu pour PERSONNALISER LES TEXTES (répliques, intros, moqueries, victoires, questions…) avec lui.
  Pour Beufa, tout est dans `data/beufa_quiz.js` (quiz) et en tête de `BeufaInfiltration.js` (conseils, messages).

## ÉCRANS DE PRÉSENTATION BEUFA + JULIEN (V93)
- `afficherPresentation(o, ensuite)` ajouté dans `src/core/BossScene.js` (même écran que Greg/Kédric/Lionel : avatar qui glisse
  depuis la droite, nom, surnom, 4 infos). Beufa : après l'intro des commandes, avant la cinématique (`beufa_presentation` =
  `beufa_buste.jpg` en pleine taille). Julien : au tout début (avant la difficulté), sauf « recommencer » et l'arrivée depuis la manif.
- Avatar de Julien en HAUTE DÉFINITION : `assets/sprites/julien/julien_presentation.png` (détouré depuis
  `assets_inbox/julien/julien_reference.jpg`, coupé aux hanches avec un fondu) ; V93b : nouvelle image NON caricaturale, sans veste (`assets_inbox/julien/julien_presentation.jpg`). Textes provisoires (passe de FINITION).

## RÉMI — V1 (la soirée au bar)
- `src/bosses/remi/` : `RemiVelo.js`, `RemiPong.js`, `RemiPorte.js` (une scène par jeu, enchaînées avec la même difficulté
  par `commun.js` → `jeuSuivant`), `reglages.js` (TOUT l'équilibrage + répliques provisoires), `dessins.js` (dessins au code,
  Phaser Graphics), `difficulte.js` (copie de Kédric), `manifeste.js` (sons = bips provisoires). Menu F1 : soirée complète,
  beer pong direct, porte direct. PERDU = « ESPACE rejouer ce jeu / X hub » (on ne recommence pas toute la soirée).
- 1) VÉLO, vue de PROFIL (choix du propriétaire, différent de Kédric) : ▶ pédaler, ◀ freiner, ▲/ESPACE sauter, Z = sonnette
  (DRING, recharge 1,5 s). Bourré allongé / verre cassé / flaque : sauter ; bourré debout : sonner (trop haut pour sauter) ;
  bourré qui traverse (vient du fond, « ! » rouge) : freiner ou foncer. Chrono « fermeture du bar » ; textos de Rémi.
  Les 3 premiers obstacles = allongé, debout, traverse (avec aide écrite, sauf CHAMPION).
- 2) BEER PONG, vu de ton bout de table (projection 3D maison). VISÉE V2 (retour : « je n'y arrive pas » avec le glissé) :
  1) toucher / cliquer le verre visé (aimanté au verre le plus proche ; clavier ◀ ▶ ▲ ▼ + ESPACE), 2) jauge de FORCE qui va et
  vient, toucher / ESPACE dans le VERT (`zoneForce` par difficulté) ; hors du vert = trop court / trop loin. 6 verres (réglable : 10), 2 balles/tour, BALLS BACK, rebord = 1 chance
  sur 2. Chaque verre que Rémi te met = tu bois : ta visée tangue (et l'écran penche). FACILE : point d'arrivée affiché.
- 3) LA PORTE (WC du bar), façon borne « boxeur » : Rémi frappe, puis toi : ÉLAN (tapoter 2,6 s) puis VISÉE (zone verte).
  Score /999 sur un afficheur rouge, fissures, 2 manches gagnées = la porte cède = BADGE.
- Bot (test playwright, NORMAL) : bar atteint avec 26 s d'avance, 1 chute ; pong gagné 2 verres à 1 ; porte 2-0.
- IMAGES REÇUES (V2) : planche du vélo → `remi_velo.png` (6 pédalages + saut + chute) et buste de Rémi →
  `remi_presentation.png` (présentation) ; planche 2x2 du beer pong → `remi_pong.png` (attend, lance, boit quand tu le
  touches, nargue quand il te touche) ; planche de la porte → `remi_porte.png` (Rémi puis toi : garde, coup, impact ;
  cases alignées sur le pied arrière, le poing de l'impact arrive sur la porte : `POING` / `ECHELLE` en tête de RemiPorte.js) ;
  planche des bourrés → `remi_bourres.png` (debout, sursaute, allongé, traverse de face ; teinte au hasard pour varier ;
  `BOURRE` = taille en tête de RemiVelo.js ; allongé : collision 40 px de haut) ; rue de nuit → `remi_rue.jpg`
  (bande noire coupée, bords fondus sur 90 px = répétable ; défile à 0,8 x la route ; remplace ciel, immeubles et lampadaires dessinés) ; façade du bar → `remi_bar_facade.png` (arrivée ; Rémi l'attend
  devant, en garde : case 0 de `remi_porte` retournée) ; décor des WC → `remi_porte_decor.jpg` (960 x 536 ; le battant de sa
  porte est découpé du fond — `BATTANT` dans RemiPorte.js — : il tremble, se fissure et s'ouvre d'un coup à la victoire).
  TOUTES LES IMAGES DE RÉMI SONT INTÉGRÉES.
- MUSIQUE : `assets/audio/remi/remi_musique_bar.mp3` (Star Wars « Cantina Band », donnée par le propriétaire), au beer pong
  et à la porte (V19f : plus utilisée) (repart du début à chaque jeu). Vélo : `remi_musique_velo.mp3` (F-Zero « Big Blue », donnée par le propriétaire).
- AUDIT V3 (retour : pong pas fun, porte pas crédible, vélo injouable + liseré blanc) : `propositions/remi_audit.md`
  (notes joueur 4/3/4 sur 10, améliorations A1-A7 vélo, B1-B6 pong, C1-C4 porte = vue de dos, prompts des planches de dos).
  Ordre validé par Fabien. FAIT (V4) :
  - DÉTOURAGE : liseré blanc « démélangé » (couleur → transparence sur 4 px de bord) pour toutes les images ;
    intérieur des roues vidé (`grand=60`).
  - VÉLO (A1-A5, A7) : vélo FIXE à l'écran (`X_VELO`), roule tout seul (`croisiere`), ▶ = SPRINT avec jauge d'endurance
    (bleue sous la barre du trajet), saut à hauteur variable (▲ maintenu) + saut mémorisé 0,15 s, chocs recalés sur l'image
    (`DEMI_VELO` 50, allongé 40 x 45, debout / traverse 160 de haut = impossibles à sauter), portée de la sonnette dessinée
    sur la route + cloche au-dessus du bourré qui l'entendra, recharge 1 s (cercle), clignotement invincible 1,2 s après
    une chute, traits de vitesse en sprint, bourrés écartés qui restent sur le trottoir du fond.
    Bots : NORMAL sans sprint = arrivé, 0 chute, 8 s d'avance (temps alors 60, passé à 65) ; CHAMPION = de justesse (57 s).
  - BEER PONG (B1-B5) : caméra proche (table 1,8 m, `CAM_*` en tête de RemiPong.js), verres de Rémi ~2 fois plus gros ;
    tes verres = encart « TES VERRES » en bas à droite (la balle de Rémi file sous l'écran). LANCE-PIERRE : doigt posé sous
    Rémi, tirer vers le bas (longueur = force, `tirage` 180 px ; côté = direction inversée), pointillés de trajectoire
    (`apercu` : 1 / 0,5 / 0,3) ; clavier ◀ ▶ ▲ ▼ + ESPACE. Traînée, RALENTI près d'un verre, balle qui TOURNE sur le rebord,
    gerbe de bière, « TU BOIS ! » + flash ambre. EN FEU après 3 verres de suite (trajectoire entière, erreur / 2).
    Rémi agite les bras (`distrait` 0 / 0,3 / 0,5) : ta visée tremble ; le toucher (ou Z) = « Chut ! ». B6 (10 verres) non fait.
  - PORTE (C1, C2, C4) : VUE DE DOS. Décor zoomé x1,5 sur la porte (à droite), frappeur de dos au premier plan
    (`remi_dos.png` : garde, coup, impact ; `remi_toi_dos.png` : garde, élan, coup, impact ; réglages `DOS` / `IMPACT` en tête
    de RemiPorte.js), il arrive par la gauche à chaque tour. Impact selon la force : fissures en étoile autour du poing,
    éclats de bois, flash blanc à 900+. Jauge d'élan en 10 paliers colorés. C3 (pari) non fait.
  - Chaîne complète (bot NORMAL) : bar atteint (8 s d'avance), pong gagné 6-1... porte 2-0, aucune erreur.
- V5 (retour : vélo injouable / touches mal placées / « images par 4 » ; pong : on ne voit ni nos verres ni la courbe) :
  audit `propositions/remi_audit_v5.md`. VÉLO refait : BUG des bourrés debout figés corrigé ; plus de boutons, 2 moitiés
  d'écran (gauche DRING, droite SAUTE) ; roule tout seul en accélérant (`vitesseDepart` / `vitesseFin`) ; traverse = sonnette ;
  icônes ▲ / cloche au-dessus des obstacles (pas en CHAMPION) ; écarts en temps ; PINTES (+1 s) ; SÉRIE de 5 = +2 s ; score.
  PONG : caméra qui montre toute la table (tes verres en bas), courbe entière + encart « vue de côté » (`vueCote`).
  PORTE : visée = cible qui se promène sur la porte, PARI pendant l'élan de Rémi (+60), arrêt sur image + score qui jaillit.
- V5b (retour : « toute la planche de gens au lieu d'un » ; boutons trop petits) : 3 images avaient changé de 1 px au
  re-détourage (porte 344, bourrés 559 de haut, façade 762) → Phaser ne découpait plus les cases. Manifeste corrigé +
  NOUVEL OUTIL `node outils/remi_verif.mjs` (taille des fichiers = manifeste). Vélo : 2 GROS boutons dessinés en bas
  (DRING à gauche avec sa recharge en arc, SAUTE à droite), qui s'allument ; toute la moitié d'écran reste active.
- V6 (retours : pong trop facile + boire sans effet ; porte pas très fun ; vélo plus grand, routes, tremplins ; sons ;
  image du bar derrière Rémi) :
  - SONS : vrais bruitages générés par `python3 outils/remi/generer_sons.py assets/audio/remi` (sonnette, chute, plouf,
    boit, hips, foule, bois...). Manifeste : `son(nom, ...)` (bip de secours si le fichier manque).
  - PONG : imprécision plus forte (`erreur` 0,045 / 0,07 / 0,085, uniforme), `dedans` 0,7, `tirage` 150 ; courbe d'aide
    PARTIELLE (`apercu` 1 / 0,65 / 0,45). ALCOOL : chaque verre bu efface la fin de la courbe (`courbeBue`), visée qui tangue
    plus vite et plus fort, imprécision +15 %/verre, VISION DOUBLE (verres et Rémi en double), écran qui penche, HOQUETS
    dès 2 verres (`hoquet`), glouglou. Bot parfait : gagne encore souvent (la pyramide est une grosse cible) — à juger en main.
    Fond : `remi_bar_interieur` utilisé s'il est ajouté au manifeste (prompt n°10).
  - PORTE : ÉLAN en alternance GAUCHE / DROITE (2 gros boutons, celui attendu clignote ; même côté 2 fois = raté),
    `elan` 3 s, `parTape` 0,09 ; COUP DE GRÂCE (élan > 90 % + pile dessus) ; annonce MANCHE DÉCISIVE.
  - VÉLO x1,3 (sprites, chocs, sauts, vitesses, `longueur` 19500) ; vélo à x 260 (plus caché par le bouton DRING) ;
    TREMPLINS + 2 VOITURES garées tous les `voitures` obstacles (on roule sur les toits, pintes au-dessus, rentrer dans le
    côté = chute ; `solSous`, `voituresPas`) ; 3 QUARTIERS (`QUARTIERS` : rue des bars, quais, centre-ville : images
    `remi_rue2` / `remi_rue3` si ajoutées au manifeste, sinon la rue teintée) avec fondu et annonce.
    Bots NORMAL (15 % d'erreurs) / CHAMPION (10 %) : arrivés de justesse avant réglage ; temps finaux 58 / 46 / 38 s.
- V6b (retours : touches du vélo qui ne marchent qu'à côté ; pong un peu dur ; Rémi « en bagarre » et trop grand devant le bar) :
  BUG TACTILE : les blocs de boutons HTML (même vides) restaient posés sur l'écran et mangeaient les touchers →
  `laisserPasserTactile(scene)` (commun.js) dans les 3 jeux (vérifié en émulation téléphone : le toucher arrive au jeu).
  Pong : `erreur` 0,035 / 0,05 / 0,065, `apercu` 1 / 0,8 / 0,55. Rémi devant le bar : pose « attend » du pong, plus petit,
  derrière une table haute dessinée ; `remi_accueil` (en pied) utilisé s'il est ajouté au manifeste. Prompts 10 à 15 donnés.
- V7 : IMAGES REÇUES ET INTÉGRÉES (preparer_images.py : `rues_quartiers`, `petites_images`) : quais `remi_rue2.jpg`,
  centre-ville `remi_rue3.jpg` (image en perspective : on garde les 2 rangées de façades bout à bout), tremplin
  `remi_tremplin.png` (haut de planche à 81 % : `TREMPLIN_IMG`), voitures `remi_voitures.png` (3 cases, `VOIT_IMG`,
  `ECH_VOIT` 0,74 : longueur et hauteur de toit propres à chaque voiture), Rémi en pied qui t'accueille `remi_accueil.png`,
  intérieur du bar derrière Rémi au pong `remi_bar_interieur.jpg`. `node outils/remi_verif.mjs` : 0 erreur.
- V8 (retours : visée trop dure à jeun ; vélo : quand sauter / sonner ? ; changer de route) + AUDIT FUN
  `propositions/remi_audit_fun.md` (joueur 6,9/10, dev 7/10 ; prochaines étapes : porte avec barre de solidité commune,
  tir rebond + déconcentrer Rémi au pong, salto / chute cartoon / événement par route au vélo).
  PONG : `aimant` 0,6 (à jeun la balle file vers le verre visé ; -0,12 par verre bu), `erreur` 0,025 / 0,035 / 0,05.
  VÉLO : `actionDuMoment()` → gros « SAUTE ! » / « DRING ! » au-dessus de l'obstacle + le bouton à presser clignote
  (pas en CHAMPION) ; RALENTI x0,3 les 2 premières fois de chaque geste. ROUTES : 3 tronçons, 2 CARREFOURS (`CARREFOURS`,
  panneau 3 s, gauche / droite) : quais (tranquille) ou ruelle (raccourci 35 % plus court, bondé) ; centre-ville (tremplins
  x2) ou petites rues (raccourci). `this.longueur` = longueur réelle (raccourcis), `genererTroncon()` à chaque choix.
- V9 (les 3 propositions de l'audit fun, validées) :
  PORTE : barre de SOLIDITÉ commune (`PORTE.solidite` 4200) : chaque coup enlève son score ; celui qui la fait céder gagne
  tout (sinon les manches) ; alerte « ne tient plus qu'à un fil » ; chacun commence une manche sur deux (`suite()`).
  PONG : TIR REBOND (bouton orange en bas à droite / X) : la balle rebondit sur la table (`volRebond`), imprécision x1,5,
  aimant /2, mais 2 VERRES s'il rentre ; DÉCONCENTRER RÉMI (`prepRemi`) : 1 s de concentration, un cercle se resserre sur
  lui, toucher / ESPACE dans les 0,3 dernières s = « FFFFF ! » (-0,3 à sa chance).
  VÉLO : SALTO (SAUTE dans les 0,3 s après l'envol d'un tremplin ; tour de 0,42 s à finir avant d'atterrir = +3 s, sinon
  chute) ; CHUTE CARTOON (il décolle, fait la toupie, étoiles autour de la tête) ; obstacles propres aux routes (`special`) :
  PÊCHEUR sur les quais (DRING), POUBELLE dans les ruelles (grand saut), CHORALE de 3 fêtards au centre-ville (un DRING).
- V10 : vélo RALLONGÉ (`longueur` 30000, temps 88 / 70 / 58 s ; bots NORMAL 15 % d'erreurs : 15 s d'avance) ;
  CARREFOUR : 2 gros panneaux EN BAS (à la place des boutons, 3,5 s) ; raccourcis vraiment chargés (`densite` 1,9,
  obstacles de la route 50 %) ; pas de tremplin / voitures juste avant un carrefour. PONG : OMBRE des pointillés sur la table.
  AUDIT PORTE `propositions/remi_audit_porte.md` (4,3/10 joueur) : refonte proposée « LA PORTE ET LE VIDEUR »
  (maintenir pour charger, lâcher avant que le videur regarde ; une seule règle : la solidité) — EN ATTENTE de l'accord de
  Fabien ; prompts 16 (videur) et 17 (foule).
- V11 : PORTE REFAITE « LA PORTE ET LE VIDEUR » (image du videur reçue → `remi_videur.png`, 2 poses) : chacun son tour,
  MAINTENIR (doigt / ESPACE) = charge qui accélère (`charge`, `accel`), LÂCHER = coup (dégâts = puissance x précision de la
  cible sur la porte). VIDEUR : attente (`videurAttente`), annonce 1,1 s x `videur` de la difficulté (pas, ombre au sol, « ! »
  rouge), regard 1-1,5 s : qui charge (ou vient de frapper) est ATTRAPÉ = coup perdu + porte rafistolée (`scotch` +300).
  Rémi joue pareil (`remiCharge`, `remiPrudent` : il peut se faire attraper). Une seule règle : SOLIDITÉ 4500, celui qui la
  fait céder gagne. La porte se bombe à chaque coup. Plus de manches ni de pari. Bots : prudent gagne (3 coups contre 3),
  gourmand attrapé 4 fois et perd.
- MUSIQUE DE LA PORTE : `remi_musique_porte.mp3` (Street Fighter II, Ken, donnée par le propriétaire) à la place de la Cantina ;
  baissée à 35 % quand le videur approche, COUPÉE net (+ « scratch » `remi_scratch`) quand il regarde, revient ensuite.
  Ajout optionnel dans le moteur : `facteurMusique(cle, f)` (src/core/musique.js), sans effet sur les autres boss.
- V12 : le videur FEINTE (`feintes` 0,25 / 0,45 / 0,65 par difficulté) : annonce de durée et de rythme de pas variables,
  FAUSSE ALERTE (demi-tour, l'ombre recule), SURPRISE (0,3 s d'annonce), RETOUR (2e coup d'œil juste après).
- BUG CORRIGÉ « Cannot read properties of null (reading 'drawImage') » à la 2e partie : Phaser RÉUTILISE l'objet scène,
  les objets créés « à la demande » (`if (!this.motAction) ...`) gardaient un texte DÉTRUIT. Chaque `create()` des 3 jeux
  remet ces propriétés à zéro. RÈGLE pour la suite : tout objet créé à la demande doit être remis à null dans `create()`.
- V13 : PORTE : plus longue (`solidite` 7500, ~5 coups chacun) ; 3 INTRUS (`INTRUS` en tête de RemiPorte.js) : le videur,
  le GARS QUI VIENT PISSER (pas titubants irréguliers + hoquets, fait souvent demi-tour ; en attendant son image : le bourré
  du vélo) et la MAMIE (canne « toc », lente, regarde longtemps, revient TOUJOURS jeter un 2e coup d'œil ; dessinée au code
  en attendant son image). Répliques propres à chacun. Rémi réagit en 0,25-0,7 s et charge plus lentement → il se fait
  prendre de temps en temps (`remiPrudent` NORMAL 0,35). Images à venir : `remi_pisseur` / `remi_mamie` (prompts 18-19 ;
  2 poses comme le videur) → REÇUES ET INTÉGRÉES : `remi_pisseur.png`, `remi_mamie.png` (`videur()` dans preparer_images.py). VÉLO : pédalage = 3 poses de la 1re rangée en 0-1-2-1, cases calées
  à droite (plus de vélo qui saute) ; 0,85 s mini entre 2 obstacles (+0,5 s après une poubelle) ; pintes : « +1 s » qui
  file vers l'horloge (qui clignote en vert), explication à la 1re pinte, compteur 🍺 en haut à droite. : `python3 outils/remi/preparer_images.py`.
- V17 (retour de Fabien : trop d'intrus, le videur manquait ; fissures vers la serrure pas crédibles) : MAMIE RETIRÉE
  (image `remi_mamie.png` gardée dans le manifeste, plus utilisée) : il reste le VIDEUR (62 %, t'attrape) et le GARS QUI
  VIENT PISSER (38 %, ne t'attrape jamais = feinte, même annonce que le videur). PORTE : plus de fissures en étoile ni de
  creux ; un TROU déchiqueté AU MILIEU du battant (`formeTrou` / `dessinerTrou`), qui grandit avec les dégâts et rétrécit
  quand le barman rafistole ; le poing frappe désormais au centre (`IMPACT.x` = milieu de la porte).
- V17 VÉLO (demande de Fabien) : le bourré ALLONGÉ ne se saute plus, on l'ESQUIVE en descendant vers le bas de l'écran
  (le vélo passe DEVANT lui) : ▼ au clavier, bouton « EN BAS » orange au MILIEU sur téléphone (zones : gauche 34 % DRING,
  milieu ESQUIVE, droite SAUTE) ; un appui = `VELO.esquive` 0,9 s en bas (`esquiveBas` 58 px), garder appuyé = rester en
  bas ; seulement sur la route (pas en l'air, pas sur un toit), pas de saut tant qu'on est en bas. Icône ▼ orange et
  « EN BAS ! » au bon moment. Le saut reste pour pintes, tremplins, verre, flaque, poubelle. Bot : 6 allongés, 0 touché.
- V17 VÉLO, BOUTONS REVUS (retour : « extrêmement mal disposés ») : plus de bouton au milieu (hors de portée des pouces).
  Pouce GAUCHE = DRING dans le coin (ne cache plus le vélo) ; pouce DROIT = SAUTE en haut (y 318) et EN BAS juste dessous
  (y 462), empilés comme une croix. Zones : moitié gauche = DRING ; moitié droite au-dessus de `LIGNE_BAS` = SAUTE, en
  dessous = EN BAS. Boutons plus petits (r 62) et presque transparents au repos (on voit les obstacles à travers).
- V17 VÉLO, POUBELLES (retour : trop rapprochées, on ne comprend pas qu'on ne puisse pas les esquiver en bas) : la poubelle
  s'évite EN BAS (comme l'allongé) OU par un grand saut (`ESQUIVER` / `SAUTABLE`) ; jamais deux poubelles de suite ; place
  AVANT (0,6 s) et APRÈS (0,7 s) chaque poubelle. SAUTE quand on est en bas = saut immédiat ; un obstacle commencé à passer
  en bas compte comme esquivé même si on saute avant de l'avoir dépassé (`o.esquive`). Bots : ruelles 6 poubelles 0 touchée,
  route normale 0 chute.
- V17 AUDIT GLOBAL `propositions/remi_audit_v17.md` (bugs, UI, plaisir ; propositions : défis de maîtrise, pintes « en bas »,
  verre de la honte, porte plus courte en facile, écran PERDU avec conseil). Corrigés : attrapé après le coup final
  (la porte se relevait), doigt lâché hors de l'écran (porte / vélo / pong : `pointerupoutside`), mamie plus chargée.
- V17 DIFFICULTÉS façon Kédric, noms de boissons : DIABOLO (`entrainement`), PANACHÉ (`facile`), PRESSION (`normal`),
  CUL SEC (`champion`) ; record par difficulté (`cleRecord`). POINTS de chaque jeu (`POINTS` dans reglages.js) gardés
  dans le BILAN (`bilanDe` / `noterJeu` dans commun.js, passé de jeu en jeu et au « rejouer ») ; RANGS (`RANGS`) : S ROI DU
  COMPTOIR 1700, A PILIER DE BAR 1300, B HABITUÉ DU ZINC 900, C BUVEUR DE DIABOLO — seulement pour la soirée complète.
  Écran de victoire `ecranVictoire` dans RemiPorte.js. Repère bot : vélo parfait ≈ 1050 pts.
  ATTENTION : `node --check` ne voit pas toutes les erreurs (un retour à la ligne dans un texte a bloqué tout le jeu) :
  vérifier avec `node outils/verif_modules.cjs $(find src -name "*.js")` (serveur sur le port 8765), seules les erreurs
  « Phaser » sont normales.
- V17 (choix de Fabien) : PORTE : attrapé au moment du coup = coup ANNULÉ (dégâts rendus, coup parfait pas compté,
  afficheur à 000 ; `coupEnCours`) ; si on est attrapé avant que le poing touche, pas d'impact du tout (sauf le coup qui
  fait céder la porte : il reste). VÉLO : son propre pour l'esquive `remi_esquive.wav` (« fffouit », généré par
  `outils/remi/generer_sons.py`, ajouté à la fin du script).
- V17 ÉQUILIBRAGE (retour : « à la porte tu peux être nul, si tu es le dernier à taper tu gagnes » ; pong trop facile) :
  PORTE : quand la porte cède, celui qui a fait le PLUS DE DÉGÂTS gagne (`total`, affiché sous la barre : TOI x ▲▼ y RÉMI) ;
  même nombre de tours (`tours`) : si Rémi (qui commence) la casse, DERNIER COUP pour toi (`dernierTour`, puis `finir()`).
  Coup annulé = retiré du total. `solidite` 7500 → 5500, `degatsMin` 0,25 → 0,15. Points porte : `porteEcart` 0,2 par point
  d'avance. Bots NORMAL : « nul » perd 2072-4237 et 2210-4073, ~70 s par partie, 6 tours chacun.
  PONG : `dedans` 0,7 → 0,62, `aimant` 0,6 → 0,35 ; Rémi vise mieux (`remi` 0,38 / 0,5 / 0,6), toi moins précis
  (`erreur` 0,012 / 0,021 / 0,03), moins de courbe d'aide (`apercu` 0,72 en PRESSION, 0,5 en CUL SEC), plus distrait.
- V17 PONG, VISÉE IVRE REFAITE (retour : « impossible vers la fin après avoir bu », il faut une visée juste mais pas trop
  simple) : tangage RÉGULIER (rythme constant, on peut lâcher au bon moment) et PLAFONNÉ (`ivresse` 0,014/verre jusqu'à
  `tangageMax` 0,065) ; CONCENTRATION : doigt immobile `concentration` 0,8 s = tangage -42 % (`concentrationEffet`),
  jauge « ne bouge plus... / CONCENTRÉ ! » à gauche des verres ; hoquet annoncé « hic... » 0,6 s avant, moins fréquent ;
  aimant jamais sous `aimantMini` 0,15 ; courbe toujours visible à 55 % (`courbeMini`) ; imprécision +6 %/verre
  (`erreurBue`, avant 15 %). Mesure à 6 verres bus, visée parfaite au hasard du tangage : 33 % en bougeant, 69 % concentré
  (avant : quasi 0). PORTE : Rémi un peu moins fort (précision 0,5-0,95, `remiCharge` 0,45 / 0,55 / 0,68 / 0,84).
- V17 PORTE « FAIRE GENRE DE RIEN » (choix de Fabien) : lâcher pendant que quelqu'un arrive (annonce / regard) = PAS de
  coup (`faireGenre`), le tour continue, on recharge après (avant : coup mou forcé). Rémi fait pareil quand il est prudent.
  Bots PRESSION : bon joueur GAGNE 3291-2809 (46 s), joueur nul PERD 2081-3783.
- V18 (retours : « pong : concept nul pour la jouabilité » ; porte : « Rémi commence toujours », « lâcher pour faire genre
  pas clair », « feintes trop dures, pas le temps de réagir ») — passe game design :
  - PONG REFAIT EN PICHENETTE (choix de Fabien) : doigt n'importe où, GLISSER VERS LE HAUT, lâcher. Sens du geste =
    direction (même sens que le doigt), longueur = force (`geste` 200 px, `cote`, `zMin` / `zMax`). Flèche verte du geste +
    jauge de force près du doigt, la balle suit un peu le doigt, petite flèche qui monte au repos. RETIRÉS : lance-pierre
    inversé, tir rebond, tangage, concentration, hoquet, « chut » (diff `distrait` plus utilisé). Gardés : courbe d'aide
    (raccourcie par l'alcool), BALLS BACK, EN FEU, souffler sur Rémi pendant son tour, vision double. Alcool = bras qui
    tremble (`erreurBue` 0,25/verre). Aimant 0,15. Mesure PRESSION (geste humain ±20 px, 6 verres) : 70 % à jeun, 59 % à
    6 verres bus (± 30 px : 63 %).
  - PORTE : TU COMMENCES ; dernier coup symétrique (celui qui casse a un tour de plus → l'autre a un DERNIER COUP).
    « Faire genre » → POING CACHÉ : lâcher pendant une arrivée garde la charge (jauge cerclée de bleu, consigne
    « POING CACHÉ (x % gardés) » puis « VOIE LIBRE ! remaintiens : tu repars de x % ») ; bords de l'écran ROUGES dès le
    premier pas. Annonce jamais sous `annonceMini` 0,85 s (avant : surprise 0,3 s, 2e coup d'œil 0,4 s).
- V19 (retour : « je n'aime pas le beer pong, je veux un jeu qui rappelle les bars ») : BABYFOOT, PROTOTYPE dessiné au code
  (`RemiBaby.js`, réglages `BABY` + `baby*` par difficulté dans reglages.js). Vue à la 1re personne : ton gardien de dos,
  Rémi en face. Boucle LIRE → ARRÊTER → RIPOSTER : Rémi promène la balle puis tire ; il SE PENCHE du côté où la balle
  passera devant ton gardien (feinte : l'autre côté puis il change à 65 %). Arrêt = balle collée au gardien, fenêtre
  `babyFenetre` pour riposter (toucher bref = droit, glisser vers le haut = en biais) ; ses barres visent où ta balle
  ÉTAIT (`retardRemi`) puis se figent quand tu tires ; son gardien plonge après `babyReflexe`. GAMELLE (but près du
  poteau, 35 %) = but + 1 point retiré à l'autre. ROULETTE (sa barre tourbillonne) : toucher Rémi / Z dans les 1,6 s
  après son but = annulé ; faux appel = tu bois. But encaissé = tu bois (tangage, vision double, gardien qui tremble).
  Premier à 5. Bilan : `baby` (`babyEcart`, `babyArret`, `babyGamelle`). L'ancien beer pong reste au menu F1 (« Ancien beer
  pong »), hors de la soirée. Croisements calculés au point exact (sinon un tir en biais traversait le gardien).
  Bot de test (headless) : gagne en PANACHÉ, perd en PRESSION / CUL SEC. Images : prompts 24 et 25. À FAIRE : faire jouer
  Fabien, puis décider (garder / régler / supprimer RemiPong.js et ses images).
- V19b (retour : « les joueurs de Rémi sont trop près, pas le temps d'anticiper ») : son attaque recule (z 0,30 → 0,52 :
  ~0,43 s de trajet en PRESSION au lieu de 0,18). IMAGES REÇUES ET INTÉGRÉES (`planche_baby()` dans preparer_images.py) :
  `remi_baby.png` (7 cases alignées sur la casquette, bas caché par la table : attend, penché à gauche de l'écran, à
  droite, roulette, marque, boit, râle ; échelle 0,42, haut à yBord - 130) et le fond `remi_bar_babyfoot.jpg` (néon
  BABYFOOT, affiche gamelle / roulette). Rémi RÂLE quand tu arrêtes (1 fois sur 2) ou quand sa roulette est dénoncée.
- V19c : BEER PONG SUPPRIMÉ (demande de Fabien) : RemiPong.js, `remi_pong.png`, `PONG`, points / répliques / clés de
  difficulté du pong, `planche_pong()` (la planche reste dans assets_inbox). MANIABILITÉ (retour : « je n'arrive pas à bien
  diriger le gardien sur mobile ») : le doigt est un PAVÉ TACTILE (pose-le n'importe où sous Rémi, glisse : `BABY.glisse`
  m/px, plus de saut sous le doigt), gardien plus vif (`vitesseGardien` 2,2), POIGNÉE dessinée en bas de l'écran (tige +
  poignée jaune = où va le gardien, rond bleu = où il est ; flèches qui clignotent les 6 premières secondes), AIDE par
  difficulté `babyAide` (0,5 / 0,3 / 0,1 / 0 : le gardien est attiré vers l'endroit où passe la balle). Répliques en
  bas (y 488). Réglages développeur : buts, sensibilité, vitesse du gardien, vitesse des tirs, feintes, aide.
- V19d (retour : « la maniabilité n'est pas bonne comme ça » ; choix de Fabien : gros boutons) : le pavé tactile est
  RETIRÉ. DEUX GROS BOUTONS ◀ ▶ dessinés en bas à gauche / à droite (zones de toucher : tout le bas de l'écran au-delà
  de 250 px des bords, sous y 300 ; plusieurs doigts : `addPointer(2)`) : on MAINTIENT, le gardien glisse
  (`BABY.vitesseBoutons` 1,1 m/s, part à 45 % et atteint la pleine vitesse en 0,25 s : petites touches = petits pas),
  lâché = il s'arrête net. Ils clignotent les 6 premières secondes. TIR : toucher bref au milieu de l'écran (en biais si
  ◀ ou ▶ est tenu) ou glisser vers le haut ; ESPACE au clavier. La poignée du bas reste (où est le gardien).
- V19e (retour : « je n'arrive pas à marquer, trop d'obstacles ? ») : en riposte, Rémi LÈVE SA BARRE D'ATTAQUE (dessinée
  levée, ne bloque plus) : restent sa défense et son gardien. LIGNE DE VISÉE + message : ROUGE « BLOQUÉ » (un défenseur sur
  la ligne) ou « À CÔTÉ », JAUNE « SON GARDIEN EST EN FACE » (il pourra l'atteindre : prise x `priseGardienRemi` 0,75 +
  sa vitesse x (trajet + 0,08 s - réflexe)), VERTE « LIBRE : TIRE ! » = but sûr (`cheminLibre()`). Balle tenue gardée dans
  le but. Plus de temps pour riposter (`babyFenetre` 2 / 1,7 / 1,4 / 1,1), défense plus lente (`vitesseBarresRemi` 0,2),
  son gardien plus lent en PRESSION / CUL SEC (0,22 / 0,28) et réflexes +0,03 à 0,05 s. Bot « tire sur le vert » :
  PANACHÉ 5-0, PRESSION 5-0 (8 arrêts), CUL SEC 2-0 en 60 s ; tout tir vert a marqué.
- V19f : MUSIQUE du babyfoot = `remi_musique_baby.mp3` (Captain Tsubasa, thème principal en 3 versions, 1 min 50, donnée
  par le propriétaire). `remi_musique_bar` (Cantina Band) n'est plus chargée (fichier gardé).
- V19g (retours : tirs de Rémi trop rapides ; le bouton TIR du téléphone tombait sur ▶ ; viser sans limite comme au vrai
  babyfoot, avec un bonus si on tire vite) : `babyVitesse` -20 % (0,55 / 0,68 / 0,85 / 1,05). Plus AUCUN bouton HTML du
  téléphone pendant le jeu (roulette = toucher Rémi) : bouton TIR dessiné au milieu en bas (`BOUTON_TIR`), toucher bref
  hors des flèches = tir. VISER SANS LIMITE DE TEMPS (plus de « Trop lent ») ; `babyFenetre` (1,6 / 1,3 / 1,1 / 0,9 s) =
  durée du bonus TIR ÉCLAIR (anneau jaune qui se vide autour de TIR) : balle x `eclairVitesse` 1,35 et son gardien
  réagit `eclairReflexe` 0,08 s plus tard (la ligne verte en tient compte). Poignée du bas retirée ; message de visée
  en bas (y 524), répliques au milieu (y 300).
- V19h (retours : un peu dur à arrêter ; défenseurs de Rémi peu lisibles ; idée : gardien transparent comme le boxeur de
  Greg) : TON GARDIEN plus large (zone d'arrêt `priseToi` 0,06 au lieu de 0,045 ; dessiné `largeurGardien` 0,07 m) et à
  moitié TRANSPARENT (`transparenceGardien` 0,5, contour blanc) : on voit la balle et ses joueurs à travers. Joueurs de
  Rémi : rouge plus vif, contour blanc, OMBRE au sol (on voit leur place même levés). Réglage développeur : largeur d'arrêt.
- V19i : FIGURINES en images (`figurines_baby()` dans preparer_images.py, planche `remi_babyfoot_joueurs.jpg`) :
  `remi_baby_toi.png` (ton gardien de dos : immobile, frappe 0,3 s au tir) et `remi_baby_rouges.png` (Rémi : immobile,
  armé = seulement celui qui a la balle, barre levée = à plat à hauteur de tige, roulette), cases alignées sur le socle.
  Une image par joueur, rangée par distance (`profondeur(z)`) ; la balle a son calque (`gBalle`) rangé de même.
  `hauteurFigurine` 0,15 m, `tailleGardien` 1,15, `transparenceGardien` 0,62. Sans les images : dessin au code (V19h).
- V19j (retours : les joueurs levés de Rémi « pas crédibles » ; « je comprends pas comment marquer ») : barre levée =
  figurine debout ÉCRASÉE sous la tige (`leveEcrase` 0,3, transparence 0,7) au lieu d'à plat. GUIDE : `chercherVert()`
  cherche la position la plus proche où la ligne serait VERTE ; la flèche ◀ ou ▶ à presser clignote en JAUNE et le message
  dit « BLOQUÉ / À CÔTÉ / SON GARDIEN EST EN FACE : ◀ VA À GAUCHE / VA À DROITE ▶ », puis « LIBRE : TOUCHE TIR ! ».
  Pendant que tu vises, son gardien SE BALANCE (`balancier` 1,6) : des trous s'ouvrent (sinon CUL SEC n'avait jamais de
  vert, et sans limite de temps on restait bloqué). CUL SEC : son gardien 0,2 m/s, réflexe 0,2 s. Vert plus sûr : +1 cm
  autour de ses défenseurs, +0,12 s de marge sur son gardien. Bot qui suit le guide : 5-0 en ~20 s dans les 3 difficultés,
  aucun tir vert arrêté.
- V19k (demande : but de Rémi plus lisible ; visée « façon billard », la visée est le plus important pour le fun) :
  CAGE dessinée au bout de la table (fond sombre, filet, poteaux et barre blancs ; lueur verte quand ton tir est bon).
  VISÉE BILLARD : balle arrêtée = ton gardien ne bouge plus, ◀ ▶ TOURNENT la visée (`viseeMax` 0,55 rad, `vitesseVisee`
  0,45 rad/s, départ doux). La ligne suit le vrai trajet AVEC REBONDS sur les bandes (`plier` / `xSur`), points qui
  défilent, rond d'arrivée sur la ligne de but (vert = but, jaune = son gardien peut l'avoir, rouge = contré / à côté).
  Guide : « ◀ TOURNE LA VISÉE / TOURNE LA VISÉE ▶ » (flèche jaune). Toucher TIR / ESPACE = tir dans la visée ; glisser
  vers le haut = tir à l'angle du geste. Bot-guide : 5-0 en ~22 s dans les 3 difficultés (angles petits : tirer vite
  passe souvent avant que la défense se replace ; à durcir si trop facile au doigt).
- V19l (retour : « bien mieux mais trop facile ») : sa DÉFENSE LIT TA VISÉE (vise l'endroit où ton tir croisera sa ligne,
  `retardRemi` 5) à la vitesse `babyDefense` (0,15 / 0,22 / 0,3 / 0,38 m/s) : il faut la FEINTER (tourner puis repartir de
  l'autre côté) ou jouer une bande. GUIDE (flèche jaune) seulement en DIABOLO / PANACHÉ (`babyGuide`) ; en PRESSION / CUL SEC
  seule la couleur de la ligne aide. Plus dur aussi : ses tirs 0,6 / 0,75 / 0,95 / 1,15 m/s, bonus ÉCLAIR 1,2 / 1 / 0,8 /
  0,6 s, son gardien 0,2 / 0,25 / 0,3 / 0,27, `vitesseBarresRemi` 0,4. Bot-guide (parfait) : 5-0 en 23 à 30 s, jusqu'à 3 s
  de visée par but, angles jusqu'à 0,19.
- V19m (demande : « complexifier en faisant un effet bourré si on prend un but ») : chaque but encaissé = une pinte
  (compteur « PINTES BUES » à côté du score, bulle « Tu bois ta pinte... »), effets plafonnés à `ivresseMax` 5 :
  VISÉE QUI TITUBE (`viseeVraie()` : ± `titubeVisee` 0,035 rad par pinte, deux sinus ; c'est elle qui part au tir et que
  la ligne montre), VUE COURTE (ligne raccourcie de `vueBue` 11 % par pinte, mini 40 % ; plus de rond d'arrivée dès
  `ivresseRond` 3), HOQUETS dès 2 pintes (toutes les 5-9 s, plus souvent ivre : son « hips », secousse, gardien et visée qui
  sautent : `hoquetGardien`, `hoquetVisee`), bords de l'écran assombris (vignette WebGL `vignetteBue`, ignorée sans WebGL),
  écran qui penche plus. Dénoncer une roulette rend une pinte.
- V19n (retours : pas de sensation de tir ni de but ; dur de marquer au début quand Rémi n'a pas bu) : TIR = éclat au
  pied du gardien, petit coup de zoom, TRAÎNÉE derrière la balle (jaune en ÉCLAIR). BUT (`celebrer()`, état `filet`) :
  la balle file au fond du filet qui se creuse et vibre, RALENTI (`ralenti` 0,25 pendant `ralentiDuree` 0,45 s), flash,
  zoom x1,3 vers la cage puis retour, 46 confettis, foule ; but de Rémi : grosse secousse, balle au fond de ton but.
  RÉMI BOURRÉ : chaque but que tu marques ralentit sa défense (`defBue` 12 %) et son gardien (`garBue` 10 %), mini 50 %.
  Début plus doux : `babyDefense` 0,13 / 0,19 / 0,26 / 0,33. (Caméra : eases « Quad.easeOut », pas « Quad.Out ».)
- V19o (retours : tirs en bande inutiles, pas de sensation sur les tirs de Rémi, musique qui boucle vite ; demande
  d'AUDIT) : `viseeMax` 0,55 → 0,85 (un tir en bande demande 0,5 à 0,63 : il ne pouvait presque jamais entrer ; bot :
  10 tirs en bande verts sur 11 marquent). Croisements des barres calculés avec les rebonds (`xSur`, comme la ligne).
  TIR DE RÉMI : éclat rouge, coup de caméra, claquement, « PATATE ! » sur ses tirs rapides ; TON ARRÊT : secousse,
  éclat bleu, mini-ralenti `arretFige` 0,12 s. MUSIQUE : blancs coupés (109 s), et elle REPREND où elle en était
  (`jouerMusique(scene, cle, { reprendre: true })`, nouvelle option dans `core/musique.js`, défaut inchangé).
  Caméra remise à zéro et vignette non empilée à chaque partie. AUDIT joueur + développeur :
  `propositions/remi_audit_babyfoot.md` (priorités : engagement après TON but, sons de babyfoot, feinte expliquée,
  bouton ROULETTE, découper RemiBaby.js + bot de test dans le dépôt).
- V19p (« fais tout dans l'ordre » de l'audit) : 1) ENGAGEMENT après TON but (`engagementToi()`, `aToiDEngager`) : la balle
  revient à ton gardien, « À TOI D'ENGAGER », tu vises et tu tires. 2) SONS DE BABYFOOT générés (`generer_sons.py`,
  section BABYFOOT ; les anciens sons ressortent identiques) : `remi_baby_clac` (bandes, contres), `remi_baby_frappe`
  (tirs, arrêts), `remi_baby_but` (balle au fond du but), `remi_baby_roulette`, `remi_baby_engage` (balle lâchée).
  3) FEINTE LISIBLE : zones rouges au sol sous ses défenseurs pendant que tu vises + astuce aux 2 premières ripostes ;
  BOUTON « ROULETTE ! » (à droite, `BOUTON_ROULETTE`) qui clignote avec un anneau de temps après un but de Rémi en
  roulette (toucher Rémi marche toujours).
  4) CODE DÉCOUPÉ : `RemiBaby.js` (scène : création, arrêt, tirs, buts, fin ; 259 lignes) + dossier `babyfoot/` :
  `outils.js` (projection, barres, boutons, `plier`/`xSur`), `dessin.js`, `commandes.js`, `remi_ia.js`, `physique.js`,
  `effets.js` (méthodes ajoutées à la scène par `Object.assign`). Chiffres sortis du code vers `BABY` (`balleTenue`,
  `priseDefense`, `margeDefense`, `margeGardien`, `pinteReflexe`, `pinteTir`). BOT DANS LE DÉPÔT :
  `node outils/remi_baby_bot.mjs` (4 difficultés x tirs droits / en bande ; sortie 1 si un tir vert est arrêté ;
  consigne ajoutée à CLAUDE.md). Résultat V19p : 8/8, 0 tir vert arrêté ; à surveiller : une bande est verte dès l'arrêt
  (sa défense attend au centre ; le bot y met sa visée d'un coup, un joueur doit tourner ~1 s).
- V19q (« augmente un tout petit peu la difficulté ») : `babyVitesse` x1,05 (0,63 / 0,79 / 1 / 1,21), `babyDefense` x1,1
  (0,14 / 0,21 / 0,29 / 0,36), `babyGardienRemi` x1,05, bonus ÉCLAIR `babyFenetre` x0,92 (1,1 / 0,92 / 0,74 / 0,55).
  Bot : 8/8, 0 tir vert arrêté.
- V19r : nouvelle MUSIQUE du babyfoot (Captain Tsubasa OST 1983, piste 11, donnée par le propriétaire : l'ancienne
  « bouclait trop vite ») : `remi_musique_baby.mp3`, 1 min 40, silence de fin coupé ; elle reprend toujours où elle en était.
- V19s (« les buts rentrent un peu facilement ») : attaque plus dure : `babyDefense` 0,16 / 0,24 / 0,33 / 0,38,
  `babyGardienRemi` 0,231 / 0,289 / 0,347 / 0,29, `retardRemi` 5 → 6. (CUL SEC à 0,41 / 0,312 : le bot qui tourne sa
  visée ne trouvait plus JAMAIS de vert → repris plus bas.) Bot : 8/8 ; attente avant le vert ~3,5 s en PRESSION / CUL SEC.
- RESTE : faire jouer Fabien et équilibrer ; autres images (prompts prêts : `propositions/remi_prompts_images.md`) ; vrais sons ;
  musique ; textes perso (passe de FINITION).

## Décisions
- Moteur : **Phaser 3.90** (gratuit, licence MIT), copié dans `lib/`. Aucune installation pour jouer.
- Jeu en ligne : GitHub Pages (lien dans README.md).
- Greg : **vue Punch-Out** (ton boxeur de dos, Greg de face) + **règles façon Hajime no Ippo**.
  C'est le **premier boss développé**.
- **RÉGLAGES DÉVELOPPEUR** (demande du propriétaire) : écran caché pour régler les chiffres de chaque boss sans ouvrir
  les fichiers. Accès : **5 appuis rapides sur « Badges »** (en bas à gauche du hub), touche **D** dans le hub, ou le menu F1.
  Chaque boss liste ses réglages dans SON `index.js` (`reglagesDev`) ; moteur : `src/core/reglagesDev.js` +
  `src/core/ReglagesDevScene.js`. Les valeurs changées sont gardées dans le navigateur (localStorage, clé
  `bracass_reglages_dev_v1`) et appliquées au démarrage ; « par défaut » = la valeur des fichiers. Greg et Lionel : seule
  la liste `reglagesDev` a été ajoutée à leur `index.js` (aucun changement de leur jeu).

## Ce qui est fini
- Hub vue du dessus : héros mobile, 6 portes (Beufa, Kédric, Julien, Greg, Rémi, Lionel), noms, "Bientôt".
- Barre de 6 badges, sauvegarde dans le navigateur.
- Retour au hub devant la porte du boss après chaque combat.
- Démarrage rapide : au lancement, seuls le hub et les badges sont chargés ; chaque boss charge SES fichiers
  en entrant chez lui (barre « Chez Greg... »), une seule fois (`BossScene.preload`).
- Modèle de boss commun (`src/core/BossScene.js`) : écran des commandes, victoire (badge), défaite, retour hub.
- Boss "Modèle" de test (menu F1 uniquement) : Z = gagner, X = perdre.
- Menu de test caché (F1) : lancer n'importe quel boss / phase, remettre la sauvegarde à zéro.
- **Smartphone / tablette** : boutons tactiles à l'écran (`src/core/tactile.js`), qui "appuient" sur
  les touches du clavier. Chaque scène choisit le texte de ses boutons (`etiquettesTactiles`).
  Menu de test sur TÉLÉPHONE : bouton II (pause, aussi dans le hub) → « Menu de test (aller à un combat) » ; au doigt :
  toucher une ligne la choisit, la retoucher la lance (▲ ▼ OK marchent aussi). Les lignes de la pause se touchent aussi.
- PAUSE (Échap / P, bouton II sur mobile ; pendant Greg et Lionel, le bouton II est rangé en haut à droite) : reprendre, volumes musique / bruitages / voix (enregistrés),
  abandonner. `src/core/PauseScene.js`. Volumes et records dans `src/core/sauvegarde.js`.
- Le hub affiche le record (rang + temps) sous la porte de chaque boss gagné.
- Téléphone tenu en vertical : message « Tourne ton téléphone » (index.html).
- PLEIN ÉCRAN sur téléphone (`src/core/pleinEcran.js`, tout le jeu) : automatique au premier toucher (Android/tablettes,
  bloqué à l'horizontale), bouton ⛶ en haut à gauche pour y revenir ; sur iPhone (pas de plein écran dans Safari),
  astuce une fois : « Partager → Sur l'écran d'accueil » ; `manifest.webmanifest` + icônes `assets/ui/icone_*.png`
  => depuis l'écran d'accueil, le jeu s'ouvre en plein écran comme une appli.
- Allègement : musique de Greg en 64 kbit/s (2,5 Mo), clip du Dempsey en MP4 (190 Ko au lieu du GIF de 1 Mo).
- Manifeste unique des visuels/sons : `assets/manifeste.js`. Tant qu'un visuel n'a pas de fichier,
  il est dessiné par le code dans `src/core/dessins.js` (style manga : contours, ombres, reflets).
  Option `pixel: 3` possible (dessin fait en petit puis agrandi, style pixel art).
  Greg en combat = ses illustrations détourées (fond retiré avec rembg, modèle u2net / isnet-anime) :
  garde basse `greg_combat.png`, garde haute `greg_garde_haute.png`, coup au corps `greg_coup_corps.png`,
  coup au visage `greg_coup_visage.png`, K.O. `greg_ko.png` (originaux dans `assets_inbox/`).
  Chaque image est calée sur la tête (réglages `illustre` dans `src/bosses/greg/reglages.js`).
  Planche de poses EN PIED (assets_inbox/greg_planche_1.jpg et _2.jpg, détourées par remplissage du fond
  blanc) : garde basse, jab, crochet, coup au corps, SMASH, touché, étourdi (aussi essoufflé), victoire.
  Elles sont posées sur leurs pieds (`solY`), toutes à la même taille ; les images de coup sont
  retournées selon le côté du coup. Garde haute = greg_garde_pied.png.
  Greg est vu en entier : garde (haute ET basse) = `greg_garde_pied.png` (en pied, gants levés),
  un cadre blanc + bouclier montre la zone protégée (visage ou ventre) ;
  garde basse / touché / essoufflé = image complète `greg_entier.png` ;
  pour la garde haute et les coups, le haut du corps est coupé à la ceinture (gants gardés) et
  posé sur les jambes `greg_jambes.png` (réglages `ceinture` dans `src/bosses/greg/reglages.js`).
  Quand il prépare un coup, on voit l'image du coup grossir vers toi avant l'impact.
  Au tapis : Greg s'effondre sur le ring (greg_ko_debout.png, 0,9 s, poussière), puis une case de manga
  (greg_ko) s'affiche pendant le compte.
  L'illustration complète sert aussi pour la présentation (`greg_portrait`) et l'annonce du SMASH (`greg_visage`).
- Bruitages du combat : générés par `outils/greg/generer_sons.py` (Python + numpy) dans `assets/audio/greg/`.
- Rendu lissé (`pixelArt: false` dans `src/main.js`).
- GREG V2 (V93, nouvelle tête + tatouages) : poses `assets_inbox/greg_v2/*.jpg` détourées par `outils/greg/preparer_v2.py`
  -> `assets/sprites/greg/greg2_*.png` (même facteur pour toutes : même taille), branchées dans `illustre.poses`
  (reglages.js, toutes « pied », taille 0.78). Nouvelles poses utilisées : `nargue` (moment secret, garde basse) et
  `tapeGants` (préparation du SMASH). PROVISOIRE : chute K.O. = image étourdi, victoire = image nargue, présentation /
  annonce SMASH / case K.O. = anciennes images. RESTE à générer : ko_debout, victoire, arme, releve (prompts dans
  `propositions/greg_prompts_images.md`) ; `greg_corps_a_refaire.jpg` non utilisée ; CROCHET à refaire (en attendant : image du jab).
- Combat de Greg inspiré de Super Punch-Out (SNES) : bandeau avec portraits et « VS », public dense,
  tapis bleu avec logo, ton boxeur de dos = illustrations (heros_garde / heros_coup / heros_uppercut,
  réglages `herosIllustre`), sinon dessin façon Little Mac (dos large, touffe, gants verts, contour cyan,
  transparent ; réglages `tailleJoueur`, `transparenceJoueur`), public façon SNES (visages, flashs, pixel art).
- **Greg** (`src/bosses/greg/`) : combat de boxe en 3 rounds de 60 s.
  - Commandes : ◀ ▶ esquive, Espace = coup au visage, Z = coup au corps, Bas (maintenu) = garde,
    X = Dempsey Roll (quand la jauge d'esprit est pleine).
  - Les coups au visage partent de GAUCHE ou de DROITE (le « ! », Greg et l'image du coup sont de ce côté) :
    il faut esquiver du côté OPPOSÉ ; une flèche « ESQUIVE » l'indique. Le SMASH part du centre.
  - Greg prévient avant de frapper : « ! » jaune = visage (esquive ou garde),
    « ! ▼ » violet = corps (garde seulement), « !! » rouge = SMASH (esquive seulement, round 3).
  - Esquive réussie = fenêtre de CONTRE (dégâts x3). Garde de Greg haute = vise le corps, basse = le visage.
  - 3 coups encaissés d'affilée : Greg se couvre puis riposte.
  - Greg joue des ENCHAÎNEMENTS écrits par round (`ENCHAINEMENTS` dans reglages.js), dans l'ordre,
    et change de garde à la fin de chacun. Avant le SMASH, il tape ses gants (« TAP ! TAP ! »).
  - Aides : flèche ESQUIVE/GARDE et cible qui se resserre, à tous les rounds (réglables : aideFleche, aideCible).
  - Jauge d'esprit : ne se remplit QU'avec les esquives réussies.
  - Dempsey Roll : boule sur un « ∞ » (◀ à gauche, ▶ à droite, bip au bon moment) ;
    2 ratés pardonnés, timing serré, environ 50 dégâts max.
  - Moment secret : une fois par round, à un moment au hasard, Greg baisse la garde 0,6 s (discret : « hé... »).
    Il faut un COUP AU CORPS lancé après qu'il a baissé la garde (fenêtre 0,7 s) : 1re fois = COUP SECRET (tapis direct),
    ensuite dégâts x3. Coup au visage ou coup lancé trop tôt = il esquive (« Raté, hé hé ! »).
  - La cloche de fin de round arrête un Dempsey Roll en cours.
  - Équilibrage (après audit avec bots) : Greg se relève avec 100 PV à chaque fois (300 PV au total) ;
    tes coups font 3, le contre x3 ; Greg pare tes coups pendant qu'il arme, et pare 40-60 % des coups
    « libres » ; après « Il se couvre » il riposte aussitôt ; il n'est plus bloqué en boucle par tes coups.
    La garde coûte : 30 % des dégâts passent, 22 de souffle par coup bloqué, pas de récupération en garde ;
    le SMASH bloqué brise toujours la garde.
  - Inspiré de Super Punch-Out (structure du jeu original, sans rien copier) :
    ÉTOURDISSEMENT (jauge cachée remplie par les coups qui touchent ; pleine = Greg titube 1,8 s,
    étoiles, tous les coups passent), annonceur vocal (voix de synthèse du navigateur : « Box ! »,
    compte en japonais « ichi, ni, san… » (voix japonaise du navigateur si elle existe), « K.O. ! »,
    `src/core/annonceur.js`, désactivable avec `annonceur: false`),
    clameur du public, répliques de ton boxeur, chrono au centième dans le classement.
  - Greg ÉNERVÉ après son 2e tapis : nouveaux enchaînements avec des FEINTES (`ENCHAINEMENTS_ENERVE`).
  - Les appuis faits pendant ton coup ou quand tu es sonné sont gardés 0,15 s ; on peut couper la fin
    de son coup pour esquiver.
  - Record : seulement pour un combat complet (pas depuis le menu F1 au round 2 / 3).
  - Résultats des bots : parfait K.O. au round 2 (rang S), moyen K.O. au round 2 (A/B),
    débutant K.O. au round 2 (C), spam / garde seule / tortue PERDENT.
  - Au tapis : alterner ◀ ▶ pour se relever.
  - Écran de victoire : rayons, trophée, Greg amoché, badge, rang, temps, record (`ecranVictoire`,
    BossScene permet à chaque boss d'avoir le sien).
  - Fin : classement S/A/B/C (coups reçus, tapis, temps) + record gardé dans le navigateur.
  - Esquive : protège 0,45 s ; « Trop tôt ! » / « Mauvais côté ! » s'affichent ; le coach commente
    tes erreurs entre les rounds. Garde avec souffle à 0 = garde brisée.
  - Hit-stop (image figée 60-150 ms) à chaque impact, zoom sur les contres, vibration sur mobile.
  - Coups au corps = vident le souffle de Greg ; à bout de souffle, il est grand ouvert.
  - Jauge d'esprit combatif pleine : DEMPSEY ROLL = jeu de rythme. La boule attend dans le cercle de droite :
    ▶ lance le roll, puis ◀ quand elle arrive à gauche, ▶ à droite (PARFAIT / BIEN). Chaque coup accélère
    et frappe plus fort, 10 coups = FINISH. 2 ratés pardonnés, le 3e arrête le roll.
    Round 3 : Greg contre (boule rouge) → ▼ pour freiner.
  - Lancement du Dempsey Roll : joue `assets/sprites/greg/dempsey.gif` s'il existe (voir « clips »
    dans le manifeste), sinon une animation dessinée par le code.
  - Au tapis : compte de l'arbitre, alterner ◀ ▶. 3 tapis = K.O. Greg : 3 tapis = victoire.
  - Le coach (portraits de Kamogawa, expression selon tes erreurs) donne des conseils avant chaque round. Fin du round 3 sans K.O. = décision aux points.
  - Tout l'équilibrage est dans `src/bosses/greg/reglages.js`.
  - Ambiance de public en continu (greg_ambiance.wav), plus forte quand Greg est en difficulté.
  - Musique de fond : `assets/audio/greg/greg_musique.mp3` (chargée au début du combat, en boucle, volume dans le manifeste).
  - Menu de test F1 : commencer directement au round 1, 2 ou 3.
  - Choix de difficulté après la présentation : FACILE / NORMAL / CHAMPION (`DIFFICULTES` dans reglages.js), dernier choix retenu, record séparé par difficulté.
  - Héros illustré : garde, coup, uppercut (victoire), touché (tête en arrière), au sol (assis) — `herosIllustre` dans reglages.js.

- **Lionel** (`src/bosses/lionel/`) : match de frisbee en 1 contre 1, façon **Windjammers** (Neo Geo, 1994).
  Règles vérifiées sur le remake https://github.com/Historn/Project-1 (sets de 30 s, 3/5/2 points, plongeon = lancer + direction).
  - Vue de 3/4 au-dessus d'un terrain de plage : TOI à gauche (maillot bleu), Lionel à droite (maillot vert/crème n°93).
  - Commandes (simplifiées à 2 boutons après essai : « trop dur avec Z, X et Espace ») : flèches = courir
    (immobile quand on tient le frisbee) ; Espace = lancer (▲/▼ maintenu = en biais, il rebondit sur les murs ;
    déclenche le super quand il est prêt) ; Z = lob ; Espace en courant vers le frisbee qui arrive = plongeon.
    Le lancer courbe n'est plus que pour Lionel.
  - Points : frisbee derrière l'adversaire = 3 points (côtés, jaune) ou 5 points (milieu, rouge) ; lob qui touche le sable = 2 points.
  - Set : 12 points ou 30 s (égalité = POINT EN OR) ; 2 sets gagnants. Celui qui encaisse sert.
  - Relancer tout de suite après avoir attrapé = lancer PUISSANT (+22 %). Le frisbee accélère à chaque lancer de l'échange.
  - Rattraper un lob juste en dessous (cercle au sol) = SUPER LANCER (Espace) : le tien = « TORNADE DE FEU »,
    TÉLÉGUIDÉE avec ▲ ▼ pendant tout son vol (`pilotage`, `reactivite` dans reglages.js).
  - LOB VISÉ : ▲ ▼ = côté, ◀ = court (près du filet), ▶ = profond (près du mur de Lionel) = 3 points au lieu de 2.
    Viseur (cible blanche, dorée si profond) quand tu tiens le frisbee ; gerbe de sable + « BOUM ! » quand il tombe ;
    Lionel lit mal tes lobs (`lentLob` par difficulté) et râle quand il en rate un.
  - JAUGES DU PUBLIC : une pour toi (orange, à gauche) et une pour LIONEL (verte, à droite). Elles montent avec les
    beaux gestes : plongeon +2, contre parfait +3, attrape à partir du 3e lancer d'un échange +1, lancer puissant +1,
    point marqué +1 (un « +2 PUBLIC : plongeon » s'affiche au-dessus du joueur ; explication la première fois).
    Pleine = SUPER PRÊT (« LE PUBLIC EST EN FEU ! » / « LE PUBLIC ACCLAME LIONEL ! »). Encaisser ne la vide pas.
    La jauge de Lionel monte moins vite en FACILE (x0,5) et NORMAL (x0,8) : `publicLionel`.
  - CONTRE PARFAIT : Espace appuyé au plus 0,1 s avant d'attraper (pas en plongeon) = ralenti 0,45 s, « CONTRE PARFAIT ! »,
    relance x1,4 (`parfait`).
  - 3 SUPERS DE LIONEL au hasard (`supersLionel`) : LE CHAMBREUR (s'arrête au filet puis repart), LE DÉDOUBLEUR (un vrai
    frisbee + un faux sans ombre qui fait « POF ! » juste avant toi), LE BOOMERANG (part d'un côté, revient en crochet loin de toi).
  - Difficulté PERSO (4e carte) : (`src/bosses/lionel/perso.js`) : écran de curseurs (vitesse, réflexes, puissance, agressivité, ta zone d'attrape, aide, surprises),
    niveau 5 = comme en NORMAL, réglages retenus dans le navigateur (clé `bracass_lionel_perso`).
  - SURPRISES (`src/bosses/lionel/surprises.js`, une à la fois, toutes les 16-24 s en FACILE, 12-20 en NORMAL, 10-16 en CHAMPION) :
    mouette qui traverse (« COUAC ! »), château de sable (« PAF ! », il s'écroule), ballon de plage qui roule (« BOING ! »).
    Le frisbee touché est dévié mais garde son sens ; les supers passent à travers ; les lobs volent au-dessus.
  - AUDIT 2 (développeur + joueur) : super prêt gardé après un point, entraînement / ralenti / gel remis à zéro à chaque
    visite, écouteurs de pause retirés, fin de la scène du super calée sur le jeu (téléphones lents), jauge plus lente
    (15, attrape comptée à partir du 3e lancer), contre parfait plus large en FACILE (0,2 s) / NORMAL (0,15 s) et visable
    avec ▲ ▼, flèches ignorées après une attrape tant qu'on ne les a pas lâchées (plus de biais involontaires), aide sans
    points pendant les supers de Lionel, Chambreur plus rapide, textes du HUD redessinés seulement s'ils changent.
  - AUDIT 2 (joueur) : entraînement en 9 étapes (~30 s) avec CONTRE PARFAIT, PLONGEON et super à GUIDER ; le cercle vert
    devient BLEU au moment d'appuyer pour un contre parfait ; tornade en vol avec de vraies flammes + « ▲ ▼ : guide ta
    tornade ! » ; tir de Lionel jamais dévié à moins de 200 px de toi ; mouette plus grosse ; jauge PUBLIC plus grosse,
    qui clignote presque pleine, et encaisser ne la vide plus ; Dédoubleur : 2e cercle pour le faux frisbee jusqu'au
    « POF » ; joueur en haut du terrain : HUD transparent et message sous lui ; NORMAL : Lionel se trompe plus et lit
    moins bien les lobs, frisbee +4 % par lancer (les échanges finissent par passer) ; CHAMPION : aide après le filet.
  - SCÈNE DU SUPER (`cinematiqueSuper`, 1,6 s, jeu figé) : fond sombre, lignes de vitesse qui tournent, le lanceur en grand
    (pose « super » de la planche) avec images rémanentes, étincelles, gros titre, zoom, onde de choc ; puis traînée
    lumineuse et étincelles pendant le vol (orange pour toi, vert pour Lionel).
  - Ton joueur qui tient / rattrape le frisbee : pose de côté (course), frisbee dans le poing avant.
  - Musique de fond : `assets/audio/lionel/lionel_musique.mp3` (Windjammers, « Lawn Court », 64 kbit/s, 2,3 Mo, en boucle,
    volume 0,4 dans le manifeste de Lionel).
  - Pas de voix (annonceur) dans le match de Lionel, à la demande du propriétaire (Greg garde les siennes).
  - Supers de Lionel : il les obtient au hasard (`superHasard`, dès le set 1), et en CHAMPION aussi en rattrapant tes lobs.
  - Lionel chambreur : bulles de moquerie quand il marque / encaisse, il garde parfois le frisbee pour te narguer.
  - IA de Lionel : il devine où arrive le frisbee (simulation du vol) avec un temps de réaction et une erreur selon la difficulté,
    plonge s'il est trop loin, se replace en suivant ta position.
  - Aides : cercle vert au sol là où le frisbee va arriver (FACILE et NORMAL : dès le lancer ;
    CHAMPION : aucune). Le point de chute des lobs est toujours montré.
  - Difficulté FACILE / NORMAL / CHAMPION (`src/bosses/lionel/difficulte.js`, copie propre à Lionel), record par difficulté.
  - Fin : rang S/A/B/C (points encaissés, sets perdus, temps), écran de victoire (trophée, Lionel à genoux, badge violet au frisbee).
  - Menu F1 : match depuis le set 1, ou directement au set décisif (1-1).
  - Tout l'équilibrage dans `src/bosses/lionel/reglages.js` ; dessins provisoires dans `src/bosses/lionel/dessins.js` ;
    bruitages générés par `outils/lionel/generer_sons.py`. Effets manga : `src/bosses/lionel/effets.js` (copie propre à Lionel).
  - Toute la logique avance dans update() (pas de minuteries Phaser) : les bots de test peuvent jouer en accéléré.
  - Lionel en illustrations : planches `assets_inbox/lionel_planche_1.jpg` (4 poses), `_2.jpg` (5 poses), `lionel_entier.jpg`,
    découpées par `outils/lionel/decouper_planches.py` (fond blanc retiré, poses tournées vers la GAUCHE, réduites de moitié)
    dans `assets/sprites/lionel/`. Taille à l'écran : `echelleIllustre` dans reglages.js.
    Pas de pose d'attente sans frisbee : « garde » = la course (avec de petits bonds) ; « nargue » = la victoire.
    Ton joueur (blond, maillot rouge) : planche `assets_inbox/heros_frisbee_planche.jpg` (9 poses légendées en anglais),
    découpée par le même outil (`outils/lionel/decouper_planches.py`) dans `assets/sprites/lionel/heros_frisbee_*.png`, tournée vers la DROITE.
    Sa course tient un frisbee : on affiche l'attente mains vides avec de petits bonds. (Sur la planche, la pose « défaite » a les cheveux bruns.)
  - Équilibrage (bots « humains » qui voient le frisbee avec du retard, et lisent l'aide quand elle est affichée) :
    FACILE = un enfant gagne ; NORMAL = bon joueur gagne, moyen ~1 fois sur 3, enfant perd ; CHAMPION = très dur.
    Après essai du propriétaire (« trop dur en normal ») : NORMAL adouci (aide dès le lancer, Lionel plus lent, moins de courbes).
    Lionel se trompe davantage quand le frisbee va vite ; ses courbes sont son arme principale.

  - AUDIT (développeur + joueur testeur, agents) après « trop dur en NORMAL » : frisbee plus lent (+3 %/échange, max 900),
    zone d'attrape plus grande à la forme du corps, ralenti à l'approche (FACILE/NORMAL), plus de traversée (sous-pas),
    plongeon dirigé vers le frisbee, trajet en pointillés (rebonds compris) + cercle vert, premiers lancers de Lionel sans
    rebond et visant à côté de toi, chrono arrêté quand on tient le frisbee, « Prêt ? » avant chaque service,
    « ESPACE : lance ! » / SUPER PRÊT au-dessus du joueur, plus de lancer courbe en FACILE/NORMAL.
  - ENTRAÎNEMENT (src/bosses/lionel/entrainement.js) : 7 étapes (~20 s) avec Lionel qui lance lentement
    (attraper, lancer, biais, lob, super), automatique la première fois après la difficulté, F1 « Entraînement puis match »,
    X (ou « Passer » sur téléphone) pour le sauter. Pas de points ni de chrono pendant l'entraînement.
  - TÉLÉPHONE : JOYSTICK VIRTUEL qui suit le pouce (moitié gauche de l'écran), SEULEMENT pendant le match de Lionel
    (`src/bosses/lionel/joystick.js`) ; pause rangée en haut à droite pendant ce match.
    Le hub, Greg et les menus gardent la croix et la pause au milieu.
  - DÉCOR PERSO (assets_inbox/lionel_decor.jpg, recadré dans assets/sprites/lionel/lionel_terrain.jpg) : le terrain
    (TERRAIN dans reglages.js) est calé sur ses bords de sable et sa ligne jaune ; bandes 3/5/3 ajoutées sur les murs de but.
    Sans ce fichier, le terrain dessiné par le code revient tout seul.
  - Ton joueur au repos : vu de côté (pose de course) au lieu de face.
  - Déplacement de TON joueur : COURSE en 6 images (assets_inbox/heros_frisbee_course_6.jpg → heros_frisbee_course6.png)
    quand il avance ou monte/descend ; PAS CHASSÉ face à Lionel quand il RECULE (4 poses de heros_frisbee_chasse_1.jpg
    jouées 1-2-3-4-3-2 → heros_frisbee_chasse.png, clé `heros_frisbee_recul`) ; la pose 1 du pas chassé sert d'attente.
    Bandes faites par `outils/lionel/decouper_animation.py` (planche → bande d'images alignées sur les pieds).
    (heros_frisbee_chasse_2.jpg : 2e série, pas utilisée.)
  - Lionel : COURSE en 6 images (assets_inbox/lionel_course_6.jpg → lionel_course6.png, cases retournées pour regarder
    vers la gauche). Sur la planche, des poses se touchaient : `decouper_animation.py --par-ligne 3` les sépare (petits
    défauts sur 4 images : bout de pied en trop / jambe coupée) et efface la ligne de sol. Une planche aux poses bien
    espacées les supprimerait.
  - Lionel : PAS CHASSÉ face à toi quand il recule (5 poses de assets_inbox/lionel_chasse.jpg jouées 1-2-3-4-5-4-3-2,
    cases retournées → lionel_chasse.png, clé `lionel_recul`) ; sa 1re pose (bras ouverts) sert d'attente (lionel_attente.png).
  - Terrain dessiné par le code (secours) dans l'esprit de Windjammers 2 (cage grillagée, rambardes, palmiers, ombres de palmes, public,
    ligne centrale jaune, poteaux jaunes rembourrés) : dessin du code, pas d'image du vrai jeu (droits d'auteur).
  - Ton joueur : nouvelle planche mains vides (le jeu pose le frisbee dans ses mains quand il le tient).
- **Kédric** (`src/bosses/kedric/`) : MATCH de football américain façon **Eyeshield 21**, vu de DOS (perspective : 3 couloirs).
  - Historique des essais du propriétaire : v1 (course en 3 actions) « trop de défenseurs, trop court, Ghost trop facile, pas fun » ;
    v2 (vrai match à essais) « pas lisible, fouillis, pas moyen d'accélérer, trop court, ajouter une réception, Kédric trop peu présent » ;
    v3 (coup d'envoi, sprint, finale) « les arrières qui reviennent par derrière sont insupportables, le sprint ne sert à rien, terrain
    trop court, plus de défenseurs vers l'en-but, Kédric seul quand il arrive, patterns de Kédric durs à lire, réception mal exploitée ».
    → AUDIT par 2 agents (joueur testeur + développeur, ~40 matchs simulés) puis v4 (actuelle). Bug trouvé : ◀ ▶ esquivait TOUT,
    y compris les plongeons, les bras tendus et Kédric (les feintes ne servaient à rien) ; des poursuivants restaient pendant le duel.
  - v4.1, après « trop dur en NORMAL : pas le temps d'anticiper, défenseurs trop près, ils changent au dernier moment, on ne
    voit rien avec plusieurs lignes » : symbole 1,45 s avant le contact en NORMAL (1,8 FACILE, 0,95 CHAMPION), rangs espacés d'au
    moins 8 yards (6 en zone rouge), défenseurs qui foncent moins vite (`charge` 1,5), trou des murs visible dès le placement
    et ligne qui ne se décale plus (sauf CHAMPION : `murTardif`, `decalage`), pot de colle figé 0,75 s avant, rangs derrière le
    prochain défenseur ESTOMPÉS, symbole placé à la hauteur de la pose (plus bas quand il plonge). Duel : tu restes face à Kédric
    (le terrain ne défile plus pendant le duel), sa charge dure toujours ≈ 1,2 s (avant, le bout du terrain la ralentissait).
  - v7.1 (après l'audit) : TEMPO MESURÉ sur les fichiers (librosa) — Cha-La 154 BPM, 1er temps fort 8,455 s (le jeu
    attendait 8 s : flèches 60 ms en avance) ; We Gotta Power 113 BPM, 1er temps fort 1,086 s (le jeu utilisait le tempo de
    Cha-La : flèches jusqu'à 0,2 s à côté). Chaque manche a son `tempsParPas` (manche 2 : une flèche par temps, ~0,53 s).
    `showtime.latence` (réglages développeur) compense le retard du son (Bluetooth). Chute des flèches : une DURÉE
    (`piste.chute` = 1,8 s, même temps sur PC et téléphone) ; sur téléphone la cible est AU MILIEU du bouton (couloirs plus
    longs). Pièges : le GEL (ratés imposés) et la COUPURE (3 s de noir) sont RETIRÉS, remplacés par des pièges d'adresse
    (`showtime.pieges`, 2 par manche) : FUMIGÈNE (le haut des couloirs caché), FLÈCHES DORÉES (leurres à ne pas toucher :
    les toucher = « PIÈGE DORÉ », raté ; les laisser passer = rien), TURBO (chute 2 fois plus rapide, toujours en rythme).
  - v6.4 (battle, idée du propriétaire) : façon GUITAR HERO / jeu de danse : les flèches TOMBENT dans 4 COULOIRS
    (◀ ▶ à gauche, ▲ ▼ à droite, Kédric au milieu) jusqu'à la touche à presser. Sur téléphone, les 4 gros boutons sont
    en ligne (◀ ▶ | ▲ ▼) et chaque couloir est calé juste au-dessus de son bouton (`calculerCouloirs`, ajout optionnel
    `rectBouton` de `src/core/tactile.js`) ; sans écran tactile, couloirs fixes avec les touches dessinées en bas.
    Vitesse de chute : `REGLAGES.showtime.piste.vitesse` (200 px/s, aussi dans les réglages développeur).
  - v6.3 (battle) : plus aucun bip (seulement la musique et le public à l'annonce). Plus long : manches de 8, 12 et 16
    pas, en QUESTIONS / RÉPONSES (`showtime.phrase` = 4 : Kédric fait 4 pas, puis toi les mêmes 4, et ainsi de suite ;
    `slotKedric` / `slotToi`). Ergonomie : sur téléphone, le bouton à presser S'ALLUME (lueur jaune → bleue dans la
    fenêtre → blanche pile sur le temps ; ajout optionnel `allumerBouton` / `eteindreBoutons` de `src/core/tactile.js`) : on
    peut jouer en regardant ses pouces (pas d'aide sur les flèches rouges en CHAMPION).
  - v6.2 : boutons tactiles ◀ ▶ à gauche, ▲ ▼ + Ghost + Sprint à droite pendant tout le match (`disposition('separee')`,
    ajout optionnel de `src/core/tactile.js`, remis à 'normale' en quittant Kédric), comme au battle. DEVIL BAT GHOST : dure
    4 s (`REGLAGES.ghost.duree`) et passe TOUS les défenseurs pendant ce temps (sème aussi le poursuivant). Battle : plus de
    flèches rouges en FACILE et NORMAL (`flechesRouges`, seulement CHAMPION ; l'aide « flèche déjà retournée » est retirée).
    Réglages développeur de Kédric : courses, écart des rangs, vitesse, Ghost (durée, points), vitesse des flèches, et par
    difficulté : taille de la jauge Ghost, vitesse, symbole avant contact, vitesse des défenseurs, timing, flèches rouges.
  - v6.1 (retours du propriétaire : Ghost jamais utilisé, battle mal annoncé, flèches dures à lire en rythme) :
    GHOST : chaque esquive (et une bonne réception) remplit la jauge de 1, une PARFAITE de 2 (`REGLAGES.ghost.parEsquive /
    parParfait`) ; jauge de 5 / 6 / 9 (FACILE / NORMAL / CHAMPION) : 2 à 3 Ghosts par match. BATTLE : transition (fondu au
    noir + « SHOWTIME ! ») puis ÉCRAN D'ANNONCE sur scène : titre, Kédric au micro avec sa réplique dans une bulle, ton avance
    au public, les règles ; une flèche lance la 1re manche (sinon au bout de 9 s), musique sur le refrain. PISTE DE FLÈCHES
    façon jeu de rythme : les flèches glissent vers un cercle (à gauche, au-dessus des boutons tactiles) ; celles de Kédric
    (petites) d'abord, il fait le pas quand elles touchent le cercle, puis les tiennes (grandes) : appuie quand elles y
    arrivent, plus rien à mémoriser. Flèche rouge : en FACILE et NORMAL ta flèche est déjà retournée (`aideRouge`), en
    CHAMPION à toi d'inverser.
  - v6 (demande du propriétaire : « trop de phases de football, on comprend rien ») : plus d'essais, de passes, de zone
    rouge, de « HUT ! » ni de dernier rideau. 3 COURSES (`REGLAGES.courses`, liste `COURSES`) : coup d'envoi, puis tout le
    terrain (160 yards) d'une traite ; la défense enchaîne les formations de la course, un rang tous les 10 yards
    (`REGLAGES.defense`), qui entrent en jeu au fur et à mesure (`preparerFile` / `appelerRangs`). Un plaquage = la course
    s'arrête (pas de points) ; personne ne t'arrête = TOUCHDOWN. La jauge du Devil Bat Ghost se garde d'une course à l'autre.
    Ensuite, TOUJOURS le battle de danse : public de départ = (touchdowns - 1) x 15 (aucun touchdown : -15, avec la réplique
    `finaleZero`). Kédric ne marque plus jamais ; le HUD affiche les touchdowns et « COURSE n/3 ». Menu F1 : « Battle de danse
    direct (2 touchdowns) ». Le duel contre Kédric reste en option (`kedric: true` sur une course : il garde l'en-but).
  - v5.2 (demande du propriétaire : « ça doit faire affrontement de boss ») : le battle se joue SUR SCÈNE (décor
    `kedric_scene.jpg`, la scène de concert Devil Bats du propriétaire), Kédric en GRAND sur l'estrade (335 px), toi de dos au
    premier plan, plus d'interface de match (seulement la jauge du PUBLIC, en haut). Musique du battle : Naruto, opening 2
    « Haruka Kanata » (`kedric_battle.mp3`, ≈ 174 BPM) ; un pas tous les 2 temps (≈ 0,69 s), et chaque manche reprend la musique
    à un autre passage (intro, couplet, refrain : `REGLAGES.showtime.passages`, mesurés par `outils/kedric/caler_battle.py`).
    L'horloge du battle suit la musique quand elle joue (sinon le temps du jeu ; les bots mettent `scene.horlogeJeu = true`).
    Plus simple : fenêtres de timing élargies (parfait 0,12 s, bien 0,28 s en NORMAL), 1 seule flèche rouge en manches 2 et 3,
    décompte 3-2-1 avant que Kédric commence, grosses flèches. Sur écran tactile : 4 TRÈS GROS boutons (◀ ▶ sous le pouce
    gauche, ▲ ▼ sous le pouce droit), ajout optionnel `dispositionDanse()` dans `src/core/tactile.js` ; et dans
    `src/core/musique.js` : `arreterMusique`, `placerMusique`, `tempsMusique` (ajouts optionnels).
  - v5.1 (demande du propriétaire) : le SHOWTIME n'est plus qu'au BOSS DE FIN : plus de petite revanche après les touchdowns.
    Après les 3 attaques : si tu mènes au score, Kédric : « Tu m'as eu au football américain... mais tu ne m'auras pas sur la
    CLASSE ! Place au BATTLE DE DANSE ! » → le battle (3 manches) ; le gagner = victoire. Égalité ou retard au score = Kédric
    gagne au football (défaite). Bug corrigé : quand Kédric gagne le battle, il prenait la pose du perdant (à genoux) : il
    fait maintenant son clin d'œil de star. Menu F1 : « Battle de danse direct (14-7) ».
  - v5 : KÉDRIC NE PLAQUE PLUS (« une star ne se salit pas les mains ») : on l'affronte au SHOWTIME, un DUEL DE FRIME EN
    RYTHME façon PaRappa / Simon (`showtime.js`, idée du joueur testeur validée par le propriétaire). Kédric montre ses pas
    (une pose, une grosse flèche de couleur ◀ bleu ▶ orange ▲ jaune ▼ violet, une note par direction), il tend le micro
    « À TOI ! », tu refais les pas sur les mêmes temps : un cercle se resserre sur la flèche à jouer (BLEU = appuie,
    BLANC = pile). FLÈCHE ROUGE = fais l'INVERSE. Jauge PUBLIC en tir à la corde (-100 Kédric / +100 toi) : parfait +11,
    bien +7, raté -12, chaque pas qu'il montre -2. FINALE = 3 manches (4, 6, 8 pas ; 0, 1, 2 flèches rouges ; 88, 96,
    104 bpm) ; gagnée si la jauge finit au-dessus de 0 (-100 = perdu tout de suite) ; chaque touchdown d'avance = +15 au
    départ (30 au plus). Après chacun de tes touchdowns : REVANCHE de 4 pas sans risque (réussie = +1 Ghost) pour apprendre.
    Fenêtres de timing x1,35 FACILE / x0,8 CHAMPION (`fenetreShow`). Plus de duel d'esquive (le code reste, option
    `kedric: true` sur une attaque). Images provisoires : ses 2 poses de danse (retournée pour ▶, écrasée pour ▼) et ton
    saut / ta rotation / ta victoire penchée. IMAGES REÇUES ET INTÉGRÉES : planches `assets_inbox/kedric_frime_planche.jpg`
    (Kédric : pointe à gauche / à droite, doigt au ciel, grand écart, micro « à toi ! », clin d'œil = pose des flèches rouges)
    et `kedric_toi_frime_planche.jpg` (toi de dos : ballon à gauche / à droite, saut, à genoux), découpées par
    `outils/kedric/decouper_frime.py` → `kedric_frime_*.png`, `kedric_toi_frime_*.png`. Bots : finale NORMAL moyen gagne nettement, enfant 2 fois sur 3, CHAMPION enfant perd.
  - v4.2 : BUG corrigé : le trou de la ligne (et des murs) était tiré au hasard POUR CHAQUE COULOIR → parfois 3 défenseurs
    = ligne complète impassable avec le symbole ◀ ▶ (détecté par un bot qui cherche les rangs qui bouchent les 3 couloirs).
    Terrain du KÉDRIC SHOW rallongé à 140 yards (réglage `terrain`, le milieu est le 70) ; finale à 40 yards de son en-but.
    En attente de la décision du propriétaire : remplacer le duel d'esquive contre Kédric (une seule illustration penchée,
    pas lisible) par un DUEL DE FRIME EN RYTHME (proposition du joueur testeur, voir conversation).
  - v4 : 3 ATTAQUES puis la FINALE. Chaque attaque : COUP D'ENVOI (le ballon arrive du fond, le VENT peut le faire changer de couloir
    à 60 % du vol ; cercle de timing qui se resserre, BLEU = appuie, BLANC = pile ; ▲ à ±0,12 s = RÉCEPTION PARFAITE vitesse 3 + Ghost,
    ±0,3 s = BIEN vitesse 2, sinon attrapé vitesse 0 ; hors du couloir = BOING, tu ramasses) puis RETOUR, limité à 40 yards
    (« POUSSÉ EN TOUCHE »). Ensuite 4 ESSAIS pour 10 yards ; ballon perdu = Kédric marque 7.
  - PASSES : ▲ pendant le placement (avant le « HUT ! ») = jeu de passe (2 par attaque) : tu pars 8 yards plus loin, la ligne est
    derrière toi, le ballon arrive (même réception à 3 niveaux) ; ratée = PASSE INCOMPLÈTE (essai perdu, aucun gain).
  - DERNIER RIDEAU : passé le dernier défenseur d'une formation, ses arrières te POUSSENT EN TOUCHE 6 yards plus loin (pas un
    plaquage). Seul le DEVIL BAT GHOST perce le rideau (grande percée). Formations moins profondes (≤ 22 yards) : 6 à 9 actions par attaque.
  - ZONE ROUGE (en-but à 22 yards ou moins) : `ZONE_ROUGE`, rangs serrés et réguliers jusqu'à la ligne d'en-but ; en 2e et 3e
    attaques, ses gars s'arrêtent à 13 yards de l'en-but et KÉDRIC GARDE L'EN-BUT, SEUL (duel, 2 vies).
  - Plus d'arrières qui reviennent en diagonale. UN SEUL poursuivant possible (rare : NORMAL 12 %), qui part 6 yards derrière toi
    à ta vitesse + 1,2 ; toujours visible (son casque remonte du bas de l'écran) ; jauge « POURSUIVANT ▮▮▮▯ Z Z Z ! » ; SPRINT
    (Z tapé vite, jusqu'à +3,5) = SEMÉ à 11 yards. Jamais de poursuivant quand Kédric est là.
  - ▲ / ▼ OBLIGATOIRES : un plongeon ou des bras tendus seuls dans ton couloir te suivent (◀ ▶ ne suffit pas) ; idem Kédric.
  - LISIBILITÉ : seul le PROCHAIN défenseur a son symbole + anneau de couleur ; UN SEUL message au centre à la fois (`messageCentre`) ;
    Kédric danse à côté de la jauge de vitesse (plus dessus).
  - KÉDRIC télégraphié, toujours pareil : il DANSE 1 s → POSE 0,7 s immobile à 7 yards (gros symbole de couleur, anneau, son nom
    d'attaque dans sa bulle : « LE PLONGEON DORÉ ! ») → CHARGE (≈ 0,85 s). Feinte ANNONCÉE (flash rouge + « FEINTE ! ») à 0,6 s
    du contact, au plus 1 charge sur 3, seulement en acte 3 de la finale (et dans les duels en CHAMPION).
  - FINALE « SHOWTIME » (1 contre 1, depuis ses 40) en 3 ACTES : il a 6 vies (+1 par touchdown de retard) ; toi 3 en NORMAL
    (+1 par touchdown d'avance, 2 au plus). Acte 1 (6-5) attaques simples ; acte 2 (4-3) COMBOS de 2 attaques annoncés dans sa
    bulle (« ▲ puis ▼ ! ») ; acte 3 (2-1) feintes. Encart à chaque nouvel acte. Gagner la finale = badge.
  - VITESSE : 2 esquives d'affilée = +1 niveau (5) ; à chaque nouvelle action tu gardes ton élan moins 2 niveaux (`elan`).
  - DEVIL BAT GHOST : jauge = esquives / réceptions PARFAITES (FACILE 3, NORMAL 5, CHAMPION 6) ; Espace : vitesse max, le prochain
    défenseur est passé, et le rideau ne t'arrête pas ; contre Kédric = une seule esquive.
  - Durée mesurée (bots, temps réel) : NORMAL moyen ≈ 3 à 4 min (15 à 30 actions), finale seule ≈ 40 s pour un bon joueur.
  - Aides (FACILE / NORMAL) : « ▲ SAUTE ! » en bas de l'écran ; la première fois qu'un type de plaquage arrive (1re attaque), RALENTI
    + explication (une seule fois : `Sauvegarde.fait('kedric_tuto')`). CHAMPION : aucune aide.
  - HUD : score « TOI 7 - 0 KÉDRIC », essai et distance, attaque et en-but, barre avec la ligne du premier essai ; vitesse à gauche,
    jauge GHOST à droite ; Kédric au micro en haut à gauche (bulles), il surgit en dansant après certains plaquages.
  - Téléphone : croix tactile ▲ ◀ ▼ ▶ + bouton « Ghost » ; on peut aussi GLISSER le doigt sur l'écran.
  - Difficulté FACILE / NORMAL / CHAMPION (`difficulte.js`, copie propre à Kédric), record par difficulté.
  - Fin : rang S/A/B/C (écart au score, plaquages, parfaites, temps), écran de victoire (ballon en or, Kédric à genoux en larmes).
  - Menu F1 : match complet, ou directement la finale (7-7).
  - Tout l'équilibrage dans `src/bosses/kedric/reglages.js` (difficultés, match, FORMATIONS, ordre des formations par attaque, duel).
    Dessins provisoires : `dessins.js` ; bruitages : `outils/kedric/generer_sons.py` ; effets : `effets.js` (copie).
  - Le stade (tribunes, projecteurs) est dessiné une fois dans une image (des milliers de ronds redessinés à chaque image = jeu lent).
  - Toute la logique avance dans `pas(dt, touches)` (pas de minuteries Phaser) : les bots de test jouent en accéléré.
  - Musique de fond : `assets/audio/kedric/kedric_musique.mp3` (Eyeshield 21, « Code Name Eyeshield 21 », donnée par le propriétaire,
    réduite en 64 kbit/s : 1,3 Mo, en boucle, volume 0,4 dans le manifeste de Kédric) + ambiance de stade générée, plus discrète ;
    badge provisoire = médaille verte au ballon (`icone: 'football'`).
  - ILLUSTRATIONS (assets_inbox/kedric_*.jpg → `outils/kedric/preparer_images.py` : fond retiré avec rembg isnet-anime, bords
    nettoyés, recadrées, enregistrées 1,5 fois plus grandes que l'écran, le jeu les réduit avec ZOOM_ILLUSTRE) :
    toi de dos (saut, rotation, plaqué avec le plaqueur déjà dessus, victoire), défenseurs de face (course, garde, accroupi,
    plongeon, bras tendus, sonné), Kédric en joueur (une seule image `kedric_star` : le jeu la penche / la couche selon l'attaque),
    Kédric coach (portrait qui te pointe, buste bras croisés / au micro, danse 2 images, défaite à genoux en larmes).
    Le plongeon illustré est retourné s'il vient de ta gauche ; la course d'un défenseur (une image) rebondit à chaque foulée.
  - TA COURSE = 6 images (`kedric_toi_course6.png`, `outils/kedric/decouper_course.py`) tirées de la planche du propriétaire
    (`assets_inbox/kedric_toi_course_planche.jpg`, 16 cases). Historique : 16 poses à la suite = « la jambe se replie à chaque pas »
    (la planche lève presque toujours la jambe GAUCHE) ; 4 poses = « on dirait qu'il glisse » puis « trop saccadé ».
    Solution : jambe gauche (talon levé, genou qui revient, appui), puis les MÊMES poses avec seulement les JAMBES retournées
    (le haut du corps, le 21 et le ballon restent en place ; fondu à la ceinture), puis appui. Rebond du corps CONTINU calé sur
    l'animation (au plus bas à chaque appui), petite bascule, crampons (`kedric_pas`) et touffe d'herbe à chaque appui.
    Images non utilisées : course de loin (kedric_toi_course_loin / _tres_loin / _2), autres courses du défenseur (_2 à _5 ;
    _4 porte des logos « Deimon / Devil Bats » d'Eyeshield 21, à éviter). Sur la danse « main sur la hanche », il reste un petit
    trait gris du décor près des jambes.
  - RÈGLE : chaque boss est indépendant ; une modification pour un boss ne doit JAMAIS changer un autre boss (Greg !).
    Le code commun (src/core) ne reçoit que des AJOUTS optionnels, que seul le boss concerné active.

## Ordre de développement (mis à jour)
1. ~~Greg (style Hajime no Ippo)~~ fait
2. ~~Lionel (Windjammers)~~ fait et validé
3. **Kédric**  ← EN COURS : refait en vrai match après le 1er essai ; manquent le décor (stade, pelouse) et le trophée
   Ancienne fiche Lionel, pour mémoire :
   - Jeu : **exactement comme Windjammers** (Neo Geo, 1994) — lancer de frisbee en 1 contre 1, vue de 3/4 au-dessus du terrain,
     buts à 3 et 5 points, lancers courbes, lob, super lancer quand on rattrape au bon moment, sets.
   - Badge : médaille violette avec un frisbee.
   - Images : le propriétaire a un pixel art de Lionel et demande à Gemini une version manga (planches de poses, fond blanc).
   - Personnalité : **un peu chambreur** (il se moque gentiment du joueur, nargue après ses points, fait le malin).
   - Prompt Gemini (planche manga 9 poses, fond blanc, tourné vers la gauche) déjà donné au propriétaire.
3. Beufa, phase quiz (plus tard)
3. Julien
4. Kédric
5. Rémi
6. Lionel
7. Beufa, phase infiltration
8. Phase design (STYLE_GUIDE.md, ASSETS_TODO.md complet, intégration des visuels)
9. Finitions

## Plan des dossiers
**Règle : chaque boss est INDÉPENDANT.** Tout ce qui sert à un boss est dans SON dossier ; modifier un boss
ne peut pas changer un autre boss. Le seul lien entre les boss : le hub, les badges et le moteur commun
(sauvegarde, sons, clavier / boutons tactiles, pause, menu F1), qu'on ne modifie pas pour un boss.

| Dossier | Contenu |
|---|---|
| `index.html` | page du jeu |
| `lib/` | moteur Phaser (ne pas toucher) |
| `src/main.js` | démarrage du jeu (enregistre les visuels du moteur puis ceux de chaque boss) |
| `src/core/` | MOTEUR COMMUN : hub/boss de base (BossScene : intro, victoire, badge), sauvegarde, sons, musique, annonceur, clavier, boutons tactiles, pause, menu F1, chargement, dessins du hub et des badges |
| `src/hub/` | le hub (+ `reglages.js`) |
| `src/bosses/<boss>/` | TOUT le boss : `index.js` (fiche), `reglages.js` (équilibrage), scènes, `manifeste.js` (ses visuels et sons), `dessins.js` (ses dessins provisoires), `effets.js`, `difficulte.js`… |
| `src/bosses/liste.js` | ordre des portes |
| `assets/manifeste.js` | visuels et sons du MOTEUR COMMUN (hub, badges, interface) |
| `assets/sprites/<boss>/`, `assets/audio/<boss>/` | fichiers de chaque boss |
| `assets/sprites/hub/`, `assets/ui/` | fichiers du hub et de l'interface |
| `outils/<boss>/` | outils d'un boss (génération des sons, découpe des planches) |
| `data/` | données (questions du quiz, plus tard) |
| `assets_inbox/` | où tu déposes tes fichiers bruts |

Fichiers de chaque boss :
- **Greg** : `src/bosses/greg/` (GregCombat, reglages, manifeste, dessins, effets, difficulte), `assets/sprites/greg/`,
  `assets/audio/greg/`, `outils/greg/generer_sons.py`.
- **Lionel** : `src/bosses/lionel/` (LionelMatch, reglages, entrainement, manifeste, dessins, effets, difficulte, joystick),
  `assets/sprites/lionel/` (Lionel ET ton joueur au frisbee), `assets/audio/lionel/`,
  `outils/lionel/generer_sons.py`, `outils/lionel/decouper_planches.py`.
- **Kédric** : `src/bosses/kedric/` (KedricCourse, reglages, manifeste, dessins, effets, difficulte), `assets/audio/kedric/`,
  `outils/kedric/generer_sons.py` (pas encore d'images : `assets/sprites/kedric/` viendra avec les planches).

## Ajouter un boss (rappel technique)
Copier `src/bosses/modele/` (avec son `manifeste.js`), renommer, puis dans `src/bosses/<boss>/index.js` : `pret: true`, `phases`, `scenes`.
Ses visuels et sons vont dans SON `manifeste.js` (noms commençant par le nom du boss), ses fichiers dans
`assets/sprites/<boss>/` et `assets/audio/<boss>/`. Si on a besoin d'un effet ou d'un écran d'un autre boss,
on le COPIE dans le dossier du nouveau boss (pas de partage entre boss).

## BEUFA — V28 : REFONTE DE L'INFILTRATION (intégrée, accord du propriétaire)
Source : `propositions/beufa_infiltration/DESIGN.md` (plan, schémas, raisons) + banc d'essai du designer.
- 4 pièces à 2-3 gardes, une nouveauté par pièce (cour / parc + lumière / arsenal + veilleur / QG).
- Réglages : repérage 0.8, portée 180, angle 28, ronde 50, pause 1.5, projecteur 0.4, alerte 200/3, zoom 1.15.
- Pierre supprimée (pierres: 0, bouton X caché, texte retiré ; le code de lancer reste, inactif).
- Projecteur : alerte seulement un garde à < 400 px, sinon il vient vérifier.
- Voile de nuit à la taille de la plus grande pièce (corrige la ligne nette sur les pièces de 1440).
- Regard en bout de ronde ±40° (0.7 au lieu de 1.15). Astuce affichée à l'entrée de chaque pièce (ASTUCES).
- core/tactile.js : diagonales ◤ ◥ optionnelles (hg/hd, cachées par défaut), activées par Beufa.
- Reste : voir V30.

## KÉDRIC — COURSE : ANIMATION TIRÉE DE LA VIDÉO (v7.2)
`assets_inbox/kedric_toi_course_video.mp4` → `outils/kedric/course_video.py` → `kedric_toi_course6.png` (8 images, 197×326, 12 i/s).
Détourage du fond blanc, chaque image remise à la même hauteur (le coureur s'éloigne dans la vidéo), une foulée = 16 images vidéo.

## BEUFA — V29 : JOYSTICK + PLUS LUMINEUX
- Sur téléphone : joystick de Lionel (importé de `src/bosses/lionel/joystick.js`, non modifié), croix cachée.
- Nuit réglable `REGLAGES.vue.nuit` (0.3, avant 0.55) + menu dev « Obscurité de la nuit » ; vignette et teintes du sol éclaircies.

## BEUFA — V30 : ALLÉGEMENT + INTRO LISIBLE
- Sprite du héros vérifié dans le jeu : 6 cases propres, aucun soldat collé (le découpeur de planches suffit).
- Poids : 32 Mo → 12 Mo. Images ramenées à 3× leur taille en jeu (`outils/beufa_alleger.py`, 10,5 Mo → 0,75 Mo) ;
  musique réencodée en 96 kb/s, durée intacte, renommée `assets/audio/beufa/beufa_musique.mp3` (22 → 11 Mo).
  Nouvelle image livrée par Fabien : la déposer telle quelle puis relancer le script.
- Intro : lignes raccourcies (≤ 70 caractères), elles sortaient de l'écran des deux côtés.
- Test de fumée (Playwright) : 4 pièces chargées, héros qui bouge, aucune erreur ni fichier manquant.
  Le banc d'essai du bot (propositions/beufa_infiltration) n'a jamais été mis dans le dépôt.
- Reste : test par de vrais joueurs (enfants, téléphone).

## BEUFA — V31 : PLUS DIFFICILE (retour : « trop facile, on esquive trop »)
- Gardes : portée 180→210, angle 28→34°, ronde 50→65, pause 1.5→1.0, poursuite 150→165.
- +1 garde par pièce (3/3/4/4) : ronde ouest (cour), patrouille de la route (parc), ronde ouest (arsenal),
  sentinelle de l'antichambre sous le portique (QG). Tout est dans `reglages.js`, à ajuster si trop dur.

## BEUFA — V32 : ENCORE PLUS DIFFICILE (retour : « encore trop simple »)
- Gardes : portée 240, angle 40°, repérage 0.45 s, ronde 75, pause 0.7, poursuite 185.
- Projecteur repérage 0.25 ; alerte collective 320 px, poursuite 5 s, fouille 4 s.
- Joueur : marche 120 (130 avant), le sprint s'entend à 180 px (130 avant).
- Héros : Fabien veut changer son design et son animation. Planche attendue : `assets/sprites/beufa/beufa_heros.jpg`,
  6 images côte à côte sur 1 rangée, fond blanc, vue du dessus, le héros REGARDE VERS LE BAS (ORIENT_HEROS).
  Si le nombre d'images change, mettre `images:` à jour dans manifeste.js, puis `python3 outils/beufa_alleger.py`.

## BEUFA — V33 : REPÉRAGE D'AVANT + GARDES + MARCHE PLUS NATURELLE
- Repérage remis à 0.8 (garde) / 0.4 (projecteur) ; le reste de V32 est gardé.
- +1 garde par pièce (4/4/5/5) : ronde du mirador, ronde du portique, ronde de la porte (arsenal), ronde du bureau.
- Marche : plus de rebond vertical ni de dandinement du sprite (faux en vue du dessus) ; l'image de marche suit
  la DISTANCE parcourue (`cyclePas`, réglages `joueur.pas` 72 / `garde.pas` 64) → les pieds ne glissent plus.
- Prompts des nouvelles planches (8 images) : `propositions/beufa_prompts_marche.md`. À la livraison : régler
  la pose d'arrêt sur l'image 3 (index 2).

## BEUFA — V34 : DEMI-TOUR DES GARDES + PROMPT « SOLID SNAKE »
- Bout de ronde : le regard part de l'angle d'arrivée (plus de saut) ; puis demi-tour SUR PLACE en piétinant
  (`garde.vitesseDemiTour` 3.2 rad/s, ~1 s), il ne repart qu'une fois tourné (avant : il reculait en pivotant).
- Prompt du héros façon Solid Snake ajouté dans `propositions/beufa_prompts_marche.md`.

## BEUFA — V35 : HÉROS FAÇON SNAKE
- Original : `assets_inbox/beufa_heros_snake.jpg` (12 images en 2 rangées de 6, vue 3/4 face comme l'ancien).
  Assemblé en 1 rangée de 12 → `assets/sprites/beufa/beufa_heros.jpg`, allégé (1777×250).
- Manifeste : images 12, hauteur 62 (il est élancé : à 48 il paraissait plus petit que les gardes).
  Découpeur : jusqu'à 12 personnages par planche (avant 9). Pose d'arrêt = image 5 (index 4).

## BEUFA — V36 : SNAKE NI DOUBLÉ NI PETIT
- Cause : chaque image était mise à l'échelle à part (étirée si l'aspect ≈ carré, sinon rétrécie à cause du
  bandana) → il changeait de taille d'une image à l'autre. Nouvelle option manifeste `echelleCommune: true`
  (héros seulement) : même échelle pour toutes les images, pieds alignés en bas.
- Images 6 et 12 de la planche (sans bandana) retirées → 10 images. Héros 64×80 (avant 48×62).

## BEUFA — V37 : SNAKE DEBOUT (plus « allongé »)
- La planche est vue de face (3/4) : la faire tourner selon la marche le couchait. Il reste debout (rotation 0)
  et la planche change selon la direction : `beufa_heros` (face/bas), `beufa_heros_dos` (haut),
  `beufa_heros_profil` (côtés, regarde à droite, miroir à gauche). Dos/profil absents → la face sert partout.
- Prompts dos + profil : `propositions/beufa_prompts_marche.md`. À la livraison : les assembler en 1 rangée,
  les déposer dans assets/sprites/beufa/, ajouter leurs entrées au manifeste (copie de beufa_heros, echelleCommune).

## BEUFA — V38 : PROFIL DE SNAKE BRANCHÉ
- Original : `assets_inbox/beufa_heros_snake_profil.jpg` (2 rangées de 6). Rangée 1 = 3/4 profil vers la droite
  → `beufa_heros_profil.jpg` (6 images, miroir à gauche). Rangée 2 (presque de face) NON utilisée.
- Reste : planche de DOS (quand il monte, la face sert encore).

## BEUFA — V39 : SNAKE COMPLET (face / dos / profil)
- Dos : `assets_inbox/beufa_heros_snake_dos.jpg`, rangée 1 seulement (la 2e est dessinée plus grande) → 6 images.
- Profil : remplacé par `assets_inbox/beufa_heros_snake_profil2.jpg` rangée 1 (pistolet en main), 6 images.
  Sa rangée 2 (au repos + 3 poses de tir) n'est pas utilisée : à garder si on ajoute un tir ou une pose d'arrêt.

## BEUFA — V40 : PROFIL SANS « CRABE » + SNAKE PLUS PETIT
- Profil : seulement les images 1, 4, 6 de la rangée 1 de `beufa_heros_snake_profil2.jpg` (les 2, 3, 5 sont
  presque de face → il semblait danser). 3 images : une vraie planche de profil (prompt « strict side view ») serait mieux.
- Les 3 planches du héros : 56×70 (avant 64×80).

## BEUFA — V41 : VRAI PROFIL DE SNAKE (6 pas)
- `assets_inbox/beufa_heros_snake_profil3.jpg`, rangée 1 (6 vraies images de profil) → beufa_heros_profil.jpg.
  Rangée 2 (presque de face) non utilisée.
- Option manifeste `trousBlancs: N` : les zones blanches ENFERMÉES de plus de N px deviennent transparentes
  (trou entre pistolet et jambe). Mise à 25 sur les 3 planches du héros.

## BEUFA — V42 : PLUS DE BLANC AUTOUR DE SNAKE
- Options manifeste (3 planches du héros) : `seuilBlanc: 200` (fond = tout pixel ≥ 200, au lieu de 238),
  `liseré: 3` (3 passes qui rongent le gris clair/blanc collé au contour, jamais les couleurs), `trousBlancs: 8`.
- Reste : légère saccade de la marche de profil (la tête monte un peu sur les images « jambes croisées »).

## BEUFA — V43 : SACCADE DU PROFIL
- La planche profil n'avait d'image « jambes croisées » que pour un pas sur deux (5 → 6 → 1 = écarté → mi → écarté).
  Ordre refait : 1,2,3,4,5,6,3,4 (8 images) → chaque pas passe par les jambes croisées.

## BEUFA — V44 : SNAKE MÊME TAILLE DE FACE ET DE DOS
- `echelleCommune: 'hauteur'` (3 planches du héros) : chaque image ramenée à la même hauteur (la 2e rangée de la
  planche de face était dessinée plus grande que la 1re). `echelle: 0.92` sur la face (dessinée plus trapue).
- Profil : « un peu plus fluide, pas génial » → une vraie planche de 8 images de profil réglerait ça.

## BEUFA — V45 : VRAI PROFIL 8 IMAGES
- `assets_inbox/beufa_heros_snake_profil8.jpg` : 8 vraies images de profil, mais elles se CHEVAUCHENT (bandana,
  bottes). Découpe faite à la main (coupure aux colonnes les plus vides près de W/8, puis dans chaque case on
  garde le perso et on jette les morceaux du voisin collés au bord) → beufa_heros_profil.jpg (8 images).
  Les bouts de bandana qui débordaient chez le voisin sont un peu coupés.

## BEUFA — V46 : PROFIL MOINS GRAND, MOINS FIN
- Option manifeste `etirementL` (élargit sans grandir). Profil : `echelle: 0.88`, `etirementL: 1.3`.

## BEUFA — V47 : SNAKE EN UNE SEULE PLANCHE (face, dos, profil)
- `assets_inbox/beufa_heros_snake_3vues.jpg` (3 rangées × 8, mêmes proportions) découpée en 3 rangées →
  beufa_heros (face), beufa_heros_dos, beufa_heros_profil : 8 images chacune.
- Manifeste : `echelleCommune: true` partout, plus d'`echelle` / `etirementL` (les 3 vues sortent à 70 px de haut).
  Les anciennes planches restent dans assets_inbox (snake, snake_dos, snake_profil*) si besoin.

## BEUFA — V48 : PROFIL QUI NE GLISSE PLUS
- La rangée profil de la planche 3 vues n'a QUE des pas écartés (écart des pieds 27-33 px) → glissade.
  Images 3 et 7 remplacées par des « jambes croisées » FABRIQUÉES : copie des images 2 et 6, jambes resserrées
  vers le centre des hanches (de plus en plus vers les pieds). Écarts : 32,27,16,29,32,28,17,30.

## BEUFA — V49 : PAS CALÉ + REBOND
- `joueur.pas` 72 → 60 (cycle calé sur l'écart réel des pieds de Snake : les pieds glissent moins).
- `joueur.rebond` 1.5 px : il monte un peu au passage des jambes (debout, ça fait vivre le pas). 0 = aucun.
- Prompt « rangée profil seule » (passages jambes serrées imposés) dans propositions/beufa_prompts_marche.md.

## BEUFA — V50 : NOUVELLE RANGÉE PROFIL
- `assets_inbox/beufa_heros_snake_profil_v2.jpg` rangée 1 → beufa_heros_profil.jpg (8 vraies images, plus de
  jambes fabriquées). Écart des pieds (px source) : 113, 90, 45, 105, 112, 106, 45, 106 → vrais passages en 3 et 7.

## BEUFA — V51 : COURSE DE PROFIL (sprint)
- `assets_inbox/beufa_heros_snake_course.jpg` : seule la rangée 3 (course de profil, 8 images) est bonne →
  `beufa_heros_course_profil.jpg`. Rangée 1 = course de 3/4 (pas de face), rangée 2 = marche de dos : inutilisées.
- En sprint (Z) vers la gauche/droite → planche course, cycle `joueur.pasCourse` 100 px. Haut/bas : la marche.
- Reste (si voulu) : course de FACE et de DOS (redemander ces 2 rangées).

## BEUFA — V47 : CAISSE ET CONTENEURS COHÉRENTS
- Caisse : l'image contenait 2 caisses (bois « coffre de pirate » + kaki) → le jeu les réduisait côte à côte dans
  64×32 alors que l'obstacle fait 64×64. Gardée : la caisse kaki seule (militaire, comme camion/jeep/tente).
- Conteneur rouge : l'image était 2 conteneurs vus DE BOUT, étirés en 140×52. Remplacé par le long conteneur
  (`beufa_conteneur_olive.jpg`, enfin branché) recoloré en rouille. Kaki utilisé : nord-ouest de la cour, rangée nord du QG.
- Reste (il faut de nouvelles images, vue du DESSUS) : camion (de profil), tente et table (de face, pieds visibles),
  projecteur (de côté), baril (encore dessiné par le code, style différent des images).

## BEUFA — V48 : RÂTELIERS PLEINS
- Le fond blanc entre les fusils restait visible (le jeu n'efface que le blanc relié au bord) : râtelier « troué »,
  plus fin que son obstacle. Les zones blanches enfermées sont remplacées par un panneau de bois sombre à lattes
  (`beufa_ratelier.jpg`) : meuble plein, qui coupe la vue comme il bloque. Reflets des fusils gardés.

## BEUFA — PROMPTS DES DÉCORS
- `propositions/beufa_prompts_decor.md` : bloc de style commun (vue 3/4 du dessus, comme Snake) + prompts des décors à refaire
  (camion, tente, table, projecteur, baril, râtelier, caisse, conteneurs) + nouveaux éléments par pièce.
- Incohérence notée : au QG, les « rayonnages » et le « classeur » sont des conteneurs de port → étagère/bureau proposés.

## BEUFA — V49 : CAISSE EN VUE 3/4 (premier décor du nouveau prompt)
- `assets_inbox/beufa_caisse_3q.jpg` (prompt de `propositions/beufa_prompts_decor.md`) → `beufa_caisse.jpg` allégée 240×240.
  Validée : orthographique, dessus + fine face avant, cube. C'est la RÉFÉRENCE de style pour les autres décors.
- `propositions/beufa_prompts_decor_complets.md` : les 27 prompts COMPLETS (style + objet), dont les versions
  verticales `_v` (camion, conteneur, étagère) : à brancher à la livraison (aujourd'hui le jeu fait pivoter l'horizontale).

## BEUFA — V50 : CAMIONS, CONTENEUR, ÉTAGÈRES EN VUE 3/4
- Livrés (originaux `assets_inbox/*_3q.jpg`) : conteneur rouille, camion horizontal, camion VERTICAL, étagère.
- Nouveau : un obstacle posé à la verticale prend la version `<clé>_v` si elle existe (sans rotation), sinon
  l'horizontale tournée. `beufa_camion_v` branché (parc).
- QG : les 9 « conteneurs de port » deviennent des `beufa_etagere` (antichambre, rayonnages, rangées, classeur).
- Étagère verticale refusée (dessin trop fin et vide aux 2/3 → affichée 2× plus fine que son obstacle) : gardée
  dans `assets_inbox/beufa_etagere_v_3q.jpg`, prompt n°2 corrigé. Reste à livrer : `etagere_v`, `conteneur_v`
  (alcôves de la cour, encore tournées), puis les prompts 6 et 8 à 27.

## BEUFA — V51 : CONTENEURS (kaki + vertical), TABLE, RÂTELIER, TENTE EN VUE 3/4
- Livrés et branchés (originaux `assets_inbox/*_3q.jpg`). `beufa_conteneur_v` : les alcôves de la cour ne sont plus tournées.
- Le nouveau râtelier remplace celui de V48 (panneau sombre ajouté à la main).
- Ajouté : prompt n°28 mirador (encore de face). Reste : étagère verticale (n°2), baril, projecteur, nouveaux décors 13-28.

## BEUFA — V52 : BARIL, PROJECTEUR + 3 NOUVEAUX DÉCORS DE LA COUR
- Baril (enfin une image ; 34×52, obstacle 34×48), projecteur (42×30, toujours tourné vers la pièce).
- Cour : guérite (370,70, petite couverture près de la porte du QG), palettes (70,640, coin hors chemins),
  barrière du portail en DÉCOR AU SOL (nouvelle liste `decorsSol: [x, y, clé]`, profondeur 8, ne bloque rien).
- Reste : étagère verticale (n°2), mirador (n°28), décors 16-27 (flaque, parc, arsenal, QG).

## BEUFA — V53 : FLAQUES, HUILE, PNEUS
- Cour : 2 flaques (décor au sol, alpha 0.8). Parc : 3 taches d'huile (alpha 0.6 : trop noires, elles passaient
  pour des trous) + 2 piles de pneus (obstacles 48×48, coins hors chemins). `decorsSol` accepte un 4e nombre = alpha.
- Plot refusé (un disque orange, pas un cône) : `assets_inbox/beufa_plot_refuse.jpg`, prompt n°18 corrigé.
- Reste : étagère verticale (n°2), plot (n°18), mirador (n°28), décors 21-27 (arsenal, QG).

## BEUFA — V54 : ARSENAL ET QG HABILLÉS
- Arsenal : missile + établi (à la place des 2 râteliers du sud, même obstacle 140×52), munitions (870,90, à la
  place de la caisse du nord-est). QG : consoles radar (150,150, à la place de l'étagère nord de l'antichambre),
  bureau de Beufa (1200,75, à la place de la caisse), 2 plantes (coins est du bureau), tapis au sol (1250,300).
- Tailles du manifeste calées sur le format réel des images (bureau 120×94, consoles 132×40, munitions 70×38…).
- Il ne reste à livrer que : étagère verticale (n°2), plot (n°18, à placer ensuite au parc), mirador (n°28).

## BEUFA — V55 : DÉCORS TERMINÉS (tous en vue 3/4)
- Étagère verticale (QG, rayonnages : plus de rotation), mirador (68×88, obstacle 68×80), 4 plots au bord de la
  route du parc (petits obstacles 16×16, hors des chemins des gardes).
- Tous les prompts de `propositions/beufa_prompts_decor_complets.md` sont livrés. Encore d'origine (jamais
  signalés) : jeep, réservoir, hélico, sacs de sable, portes, sol, murs — à revoir seulement si le style choque.

## BEUFA — V56 : CONTENEURS À LA TAILLE DE SNAKE + TRI PAR Y + GUÉRITE
- Conteneurs trop bas (Snake « à la cuisse ») : la FACE AVANT des images est étirée en hauteur (nervures
  verticales → invisible) depuis `assets_inbox/*_3q.jpg` : 140×100 et 52×178 (avant 140×52 / 52×140).
  L'EMPRISE AU SOL ne change pas (gameplay identique) : l'image est posée sur le bas de l'emprise et MONTE.
- Tri par Y (vue 3/4) : `profondeurY(yBas) = 20 + yBas/1000` pour obstacles (bas de l'emprise), Snake
  (pieds = y+25) et gardes (y+12). Murs 19.5, poussière 19.8. Snake derrière un conteneur = caché.
- Guérite collée au mur nord (370,52) : plus de faux passage derrière.
- Passe « level design » faite : voir V57.
- V56b : conteneurs verticaux élargis 52 → 70 (image 70×214, emprise des 2 alcôves de la cour 70×140) :
  même épaisseur que la face d'un conteneur horizontal. Validé par Fabien pour les horizontaux.

## BEUFA — V57 : PASSE LEVEL DESIGN (vérification des 4 pièces)
- Bug corrigé : mirador et barils s'affichaient COUCHÉS à 90° (emprise plus haute que large → pivotés comme
  un conteneur). Désormais on ne fait pivoter que si l'IMAGE est horizontale.
- Rondes qui traversaient un décor (vérifié par calcul : plus aucune) : jeep du parc 1300→1370 (gardien de
  la porte), baril est de l'arsenal 860→912 contre le mur (ronde de l'est). Chemins des gardes inchangés.
- Échelle : guérite 64→96 (emprise 88×64), mirador 68×88→84×110 (emprise inchangée) : plus hauts que Snake.
- Tente (148×96) : bonne échelle, gardée. Râteliers : meubles bas (~hanche), gardés.
- Camions et étagères : dessinés presque vus du dessus (ancien prompt = face avant « fine ») → impossible à
  étirer proprement. NOUVEAUX PROMPTS à générer : `propositions/beufa_prompts_hauteur.md` (camion 176×110,
  camion_v 72×220, étagère 140×90, étagère_v 52×180). À la livraison : changer largeur/hauteur au manifeste,
  l'emprise reste (le jeu pose l'image sur le bas de l'emprise).
  ⚠️ Étagères nord du QG (y 84) : en plus haut elles cacheront Snake dans le passage secret derrière elles
  (comme les conteneurs de la cour) — à valider par Fabien, sinon prévoir une silhouette de Snake.
- Disposition : zones logiques cohérentes (portail/axe/quartiers, rangées de camions, îlot des râteliers,
  antichambre/table/bureau), rien à déplacer. Restent d'un autre style (jamais en 3/4) : réservoir (vu
  pile du dessus, ressemble à une plaque d'égout) et jeep — à refaire si Fabien le veut.


## BEUFA — V58 : PILIERS PORTEURS (cohérence « base militaire »)
- Arsenal (8) et QG (5) : piliers engagés dans les murs (blocs de mur 28×26, dépassent de 16 px), même texture
  que les murs. Vérifié par calcul : à ≥ 24 px de tout obstacle, hors des rondes, jamais devant le passage
  secret du nord du QG (x 560-960). Rondes et emprises inchangées.
- V63b : prompts n°12 (réservoir 3/4) et n°13 (jeep 3/4) ajoutés au même fichier.
- PROPOSÉ à Fabien — prompts écrits (V59) : `propositions/beufa_prompts_base_militaire.md` (11 prompts ; lignes de places du parc = par le code). Contenu : barbelés sur le mur d'enceinte (cour,
  parc ; posés SUR le mur, ne bloquent rien), lampadaires, mât + drapeau devant la porte du QG, panneau
  « ZONE MILITAIRE » au portail, marquages de places au sol (parc), pompe à carburant (prompt n°17 jamais
  livré), jerricans, panneau « DANGER EXPLOSIFS » (arsenal), casiers, carte murale et drapeau de Beufa (QG).

## BEUFA — V60 : BARBELÉS, DRAPEAU, LAMPADAIRES, PANNEAU (prompts V59 n°1 à 5 livrés)
- Originaux `assets_inbox/beufa_{barbeles,barbeles_v,drapeau,lampadaire,panneau}_3q.jpg` → sprites recadrés.
- Barbelés : `barbeles: true` sur une pièce (cour, parc) = pavés SUR chaque mur (profondeur 19.6), coupés au
  droit des portes. Ne bloquent rien de plus.
- Cour : drapeau (560,130, emprise = socle 20×16) en face de la guérite ; 2 lampadaires au portail (400 et
  560, y 690) ; panneau d'interdiction (215,688). Parc : 2 lampadaires au bord NORD de la route (250 et 1340).
  Vérifié : rien ne touche une ronde, l'entrée ou un passage.
- Nouveau : 6e valeur d'un conteneur = décalage x de l'image (le mât du drapeau est à gauche de son dessin ;
  le chargeur recadre les marges blanches, donc on ne peut pas centrer le mât en ajoutant du blanc).
- Le panneau livré a une ombre au sol et un côté visible (pas tout à fait le style) : à refaire si ça choque.
- Restent à livrer (V59) : n°6 à 11 (pompe, jerricans, panneau danger, casiers, tableau, bannière) + les 4
  prompts « hauteur » (camions, étagères).

## BEUFA — V61 : CRÉDIBILITÉ « VRAIE BASE » (retours de Fabien)
- BLOCAGE QG corrigé : la rangée du bas (étagères, classeur, rayonnage sud) laissait 20-24 px avant le mur
  → on croyait passer derrière, Snake (Ø 20) restait coincé. Tout est COLLÉ au mur. Même règle pour palettes,
  pneus, baril est et caisses de l'arsenal. RÈGLE : un objet est soit collé au mur, soit à ≥ 34 px (vrai passage).
  Seule exception voulue : le passage secret derrière la rangée nord du QG (38 px).
- QG : le bureau de Beufa est une vraie pièce : cloison avec une PORTE de 80 px (y 250-330) au lieu d'une
  brèche de 150 px ; cadre de porte dessiné (`portesInterieures`, sans LED verte).
- Arsenal en zones : RÉSERVE DES MISSILES au nord-ouest (2 missiles, à la place de la table à cartes, même
  emprise, gardée par le veilleur) ; ATELIER à l'entrée (2 caisses de munitions + établi, à la place du missile seul).
- Parc : jeeps à l'échelle de Snake (88×60 → 120×66), garées contre les murs.
- Cour : panneau « interdit aux soldats » RETIRÉ (absurde dans une base militaire).
- Vérifié par calcul : aucune ronde ne touche un obstacle, entrées libres. Reste : camions et étagères plus hauts
  (prompts V57), prompts V59 n°6 à 11.

## BEUFA — V62 : REVUE COHÉRENCE (voir `propositions/beufa_audit_coherence.md`)
- Le BUREAU DE BEUFA sort du QG (il ira dans la pièce du QUIZ, la phase suivante). L'est du QG devient le
  SAS DE SÉCURITÉ : poste d'écrans contre le mur nord (1200,42), archives, tapis à l'emblème devant la porte
  de sortie (1340,365). Plantes retirées. Rondes inchangées.
- Arsenal = DÉPÔT DE MISSILES : les 4 râteliers de l'îlot central deviennent 4 missiles (même emprise).
- Barbelés : `barbeles: ['s','o','e']` (cour) / `['n']` (parc) = seulement les côtés de l'ENCEINTE.

## BEUFA — V63 : COUR ALIGNÉE (validé par Fabien)
- Rangées symétriques autour de l'axe x 480 : nord y 110 (conteneur olive 150 ↔ réservoir 810), milieu y 450
  (tente 160 ↔ conteneur est 800), alcôves 360 ↔ 600, portail 330 ↔ 630. Déplacements ≤ 60 px.
- Vérifié par calcul : aucune ronde touchée, aucun faux passage.

## BEUFA — V64 : SORTIE DU QG DÉGAGÉE
- La cloison du sas (x 1060, porte de 80 px) est SUPPRIMÉE avec son cadre de porte : elle bloquait juste avant
  la sortie, et n'a plus de raison d'être sans le bureau. L'est du QG est ouvert ; gardes, écrans, archives et
  tapis restent. (`portesInterieures` reste disponible dans le code pour la pièce du quiz.)

## BEUFA — V65 : OUTIL DE VÉRIFICATION AUTOMATIQUE DES PIÈCES
- `node outils/beufa_verif.mjs` (0,3 s, lit les vraies données de `reglages.js`) : à lancer après CHAQUE
  changement de décor. Contrôle : chemin entrée → sortie avec le vrai rayon de Snake, rondes qui traversent
  un obstacle (ERREURS), faux passages 10-34 px et zones inatteignables (AVERTISSEMENTS). Testé sur la V60 :
  il signale bien le piège du QG.
- Corrigé grâce à lui : camions sud du parc y 455 → 450 (passage de 34 px), plots collés par paires, missiles
  de la réserve collés au mur, piliers nord de l'arsenal 300/660 → 320/640. Bilan : 0 erreur, 0 avertissement.

## BEUFA — V66 : RAPPORT DE LEVEL DESIGN (références du genre)
- `propositions/beufa_rapport_level_design.md` : comparaison avec MGS (Shadow Moses), MGS V (Camp Omega),
  Mark of the Ninja (règles de Nels Anderson), Thief (Randy Smith), Game Maker's Toolkit (narration environnementale).
- Appliqué : lueur sur la tête des lampadaires (pas de flaque au sol, trompeuse) ; QG rangée nord = consoles
  (postes d'opérateurs) ; `marquagesSol: [[x,y,l,h]]` = cadre jaune peint, autour des missiles de l'arsenal.
- Prompt n°14 (caméra) : à la livraison, le portique du QG devient une CAMÉRA (même balayage ; dehors = projecteurs).
- À décider par Fabien : projecteur sur le mirador ; lampadaires = vraie lumière qui repère Snake.

## BEUFA — V67 : CAMÉRA AU QG + RECHERCHE « COMMENT METAL GEAR AGENCE SES NIVEAUX »
- Le portique de l'antichambre du QG devient une CAMÉRA de surveillance (`camera: true` sur un projecteur → sprite
  `beufa_camera`, dessin provisoire `CAMERA_NES` par le code ; prompt n°14 à livrer). Même balayage, même repérage.
- `propositions/beufa_recherche_metal_gear.md` : 9 principes de Metal Gear + 5 propositions de gameplay (A flaques
  bruyantes, B conduit d'aération, C objet dans le danger, D gardes qui se couvrent dans la cour, E angle mort sous
  la caméra) → À VALIDER par Fabien.

## BEUFA — V68 : FLAQUES BRUYANTES (A) + ANGLE MORT SOUS LA CAMÉRA (E) — validés par Fabien
- A (Metal Gear 2) : marcher DANS une flaque (`beufa_flaque` des `decorsSol`, ellipse 30×17 sous les pieds) =
  « plic » (son provisoire 980 Hz) + ronds dans l'eau + `bruit(R.joueur.bruitFlaque = 150)` (les gardes en ronde
  à < 150 px se tournent vers Snake). Une fois toutes les 0,45 s. Les 2 flaques de la cour sont sur les variantes
  ouest et est. Astuce de la cour mise à jour.
- E (MGS) : le halo de la caméra du QG part de y 130 (avant 60) → collé au mur nord sous la caméra, on n'est
  jamais dans le halo. Astuce du QG mise à jour. Testé dans le jeu (Playwright) : 1 bruit en traversant une flaque.

## BEUFA — V69 : 11 IMAGES LIVRÉES (camions, étagères, jeep, caméra, pompe, panneau danger, casiers, tableau, bannière)
- Originaux `assets_inbox/*_3q.jpg` (ceux des camions/étagères REMPLACENT les anciens vus d'en haut). Camion
  vertical livré en 2 morceaux (dessus + face avant détachée) : recollé (bâche + toit 45-860, face avant 1345-fin).
- Tailles du jeu (emprises INCHANGÉES, l'image monte au-dessus) : camion 176×110, camion_v 72×178, étagère 140×98,
  étagère_v 52×212, jeep 120×81, caméra 58×22 (vraie image, plus de dessin provisoire).
- Placés : pompe (parc, 1150,506, contre le réservoir) ; panneau danger (arsenal, 326,296, coin de la zone balisée) ;
  casiers (QG, 150,494, à la place de l'étagère de l'entrée = vestiaire) ; tableau de briefing (QG, 880,84, à la
  place d'une console, face à la table). Bannière : en réserve pour la pièce du QUIZ.
- Vérif : 0 erreur, 0 avertissement. Manquent encore : réservoir 3/4 (n°12), jerricans (n°7).

## BEUFA — V70 : RÉSERVOIR 3/4 + JERRICANS (toutes les images de décor sont livrées)
- Réservoir 96×159 (cour et parc, emprise 96×96 inchangée). Jerricans 40×37 (parc, 1108,503, emprise 36×32 :
  au bout du cul-de-sac derrière le camion sud-est, à côté de la pompe — devant la pompe ils étaient cachés).
- Station-service du parc complète : camion, jerricans, pompe, réservoir. Vérif : 0 erreur, 0 avertissement.
- Reste éventuel : bannière (pièce du quiz), vrais sons (« plic » des flaques = bip provisoire).

## BEUFA — V71 : MARCHE DE FACE/DOS QUI NE VIBRE PLUS + PROMPT GARDES EN 3/4
- Diagnostic (mesures image par image) : les planches de FACE et de DOS contiennent 4 cycles (pieds alternés à
  chaque image) mais étaient jouées comme 1 cycle sur 60 px → pieds alternés tous les 7,5 px = Snake « vibrait ».
  `R.joueur.pasFace: 240` → un pas tous les 30 px (comme le profil). Vérifié dans le jeu : image changée à 230/260/290.
- Profil marche et course : ordre des images CORRECT (écart max → moyen → croisé → moyen…), cadence cohérente avec
  la foulée. Le reste du défaut vient du dessin (raideur, bandeau qui saute) → seulement en refaisant la planche.
- Gardes : vus de dessus et TOURNÉS (effet « carton qui pivote » à côté de Snake debout). Prompt 3 vues ajouté dans
  `propositions/beufa_prompts_marche.md` (« GARDE — LES 3 DIRECTIONS ») ; à la livraison : découper en 3 rangées et
  choisir la rangée selon la direction, sans rotation (comme `afficher()` pour Snake).

## BEUFA — V72 : SNAKE À L'ÉCHELLE DES DÉCORS + PROMPTS « VUS DE DOS »
- Snake 70 → 58 px de haut (planches 46×58 au lieu de 56×70) : il était presque aussi haut qu'un conteneur et
  écrasait établi/caisses. Centre du sprite à y-4 → pieds toujours à y+25 (tri par Y inchangé). Collision inchangée.
- RÈGLE vue 3/4 : on voit la face SUD de tout objet → contre le MUR DU BAS, seulement des objets vus de dos ou
  sans face avant (caisses, barils, pneus, palettes). Prompts n°15-17 (étagère, casiers, pompe vus de dos) dans
  `propositions/beufa_prompts_base_militaire.md`. À la livraison : QG rangée sud (640/880/1200,494) → étagère_dos,
  casiers (150,494) → casiers_dos, pompe (parc 1150,506) → pompe_dos.
- Gardes : 48×48 vus de dessus en attendant la planche 3 vues (viser ~58 px de haut comme Snake).

## BEUFA — V73 : MEUBLES DU MUR DU BAS VUS DE DOS
- Livrés et branchés : `beufa_etagere_dos` 140×94 (QG 640/880/1200,494), `beufa_casiers_dos` 140×97 (QG 150,494),
  `beufa_pompe_dos` 40×85 (parc 1150,506). Emprises inchangées. Vérif : 0 erreur, 0 avertissement.
- Les versions « de face » (beufa_etagere, beufa_casiers, beufa_pompe) restent au manifeste pour les murs du haut.
- Reste : planche des gardes en 3 vues.

## BEUFA — V74 : GARDES À L'ÉCHELLE + TRANSFERT DE POIDS DE FACE/DOS
- Gardes 48 → 40 px (même réduction que Snake en V72). Collision inchangée.
- Marche de face/dos : la planche bouge à peine les jambes → le corps se décale (`balancement` 1,5 px) et penche
  (`penche` 0,04 rad) vers le pied posé, alterné à chaque pas de 30 px. Vérifié dans le jeu (rotation ±0,038).
- Vraie solution : nouvelle planche face/dos en 4 poses très marquées (prompt « SNAKE — FACE ET DOS EN 4 POSES »
  dans `propositions/beufa_prompts_marche.md`). À la livraison : découper 2 rangées × 4 → beufa_heros / _dos,
  `pasFace` 240 → 60 (4 images = 2 pas), garder balancement/penche si ça aide.

## BEUFA — V75 : GARDES DEBOUT EN 3/4 (planche 3 vues livrée)
- `assets_inbox/beufa_garde_3vues.jpg` (3 rangées × 8, espacement OK : écart mini 9 px) découpée en
  `beufa_garde_face/_dos/_profil.jpg` (52×58, échelle commune, comme Snake). Images 5-8 = doublons de 1-4 :
  8 images = 4 pas → `R.garde.pasVue: 120` (un pas / 30 px).
- `afficher()` : planche choisie selon `g.angle` (profil si horizontal, miroir à gauche ; dos si vers le haut ;
  face sinon), plus de rotation ; pose d'arrêt face/dos image 2, profil image 3 ; pieds à y+25 (tri Y comme Snake).
  L'ancienne planche vue de dessus `beufa_garde` reste en secours si les 3 vues manquent.

## BEUFA — V76 : NOUVELLE PLANCHE SNAKE (face/dos) + BOTTES DES GARDES
- `assets_inbox/beufa_heros_planche_complete.jpg` (4 rangées × 10). Mesures : face et dos bougent nettement plus
  que l'ancienne → GARDÉS, montés en 4 poses [gauche levé, debout, droit levé, debout] : face = images 8,4,6,4 ;
  dos = 3,0,1,0 (`beufa_heros.jpg` / `_dos.jpg`, images: 4, `pasFace: 60`, arrêt = image 1).
  Profil marche (jamais de jambes croisées → glisserait) et course (images 5-6 collées) : REFUSÉS, on garde les anciens.
- Chargeur : les bandes de personnages s'arrêtaient au dernier trait LONG → les bottes (2 petits blocs) étaient
  coupées (gardes de face). Bandes prolongées tant qu'une ligne a ≥ 3 px d'encre d'affilée.
- Astuce outil : ne JAMAIS enchaîner `pkill -f "http.server 8765"` avec d'autres commandes (il tue son propre shell).

## BEUFA — V77 : MARCHE FACE/DOS FLUIDE (toutes les images de la nouvelle planche)
- Retour de Fabien : « il manque des images, le genou ». La V76 n'utilisait que 3 poses. On reprend TOUTES les
  images des rangées face/dos de `beufa_heros_planche_complete.jpg`, classées par hauteur des pieds pour que le
  genou monte puis redescende : face = 8,0,9,4,2,1,6,7,4,3,5 (11 images), dos = 3,2,7,4,0,5,6,1,6,0,9,8 (12).
  Un cycle = 2 pas (`pasFace: 60`) → une image tous les ~5 px. Arrêt : face image 3, dos image 4 (pieds à plat).
- Vérifié dans le jeu : 11 images chargées, image changée à chaque 6 px.

## BEUFA — V78 : SNAKE ENTIER (tête de dos, pieds de face)
- Chargeur : aux genoux (face) et au cou (dos), aucune ligne n'a de trait d'encre long → la rangée était coupée en
  2 BANDES (comme 2 rangées de persos) et on perdait la tête ou les pieds. Les bandes reliées par des lignes d'encre
  sont maintenant FUSIONNÉES. Vérifié sur les textures du jeu : face, dos et gardes entiers.

## BEUFA — V79 : PROFIL DE SNAKE EN 4 POSES (ESSAI)
- `assets_inbox/beufa_heros_profil_4poses.jpg` (contact, bas, PASSAGE genou plié, haut) : style un peu différent
  (pas de barbe, bandeau plus large) mais invisible à 58 px. Planche du jeu = les 4 poses × 2 (un pas joué 2 fois),
  `echelleCommune: 'hauteur'` (l'image 2 est dessinée plus petite). Pose 4 : genou très haut (à surveiller).
- Ancienne planche gardée : `assets_inbox/beufa_heros_profil_V48_sauvegarde.jpg` → la recopier dans
  `assets/sprites/beufa/beufa_heros_profil.jpg` (et remettre `echelleCommune: true`) pour revenir en arrière.
- La course de profil reste l'ancienne planche.
- V79b : pose 4 (genou trop haut) RETIRÉE → cycle contact, bas, passage × 2 (6 images, `pas` 60 inchangé).

## BEUFA — V80 : PROFIL DE SNAKE SANS À-COUPS
- Le buste sautait de ~1,5 px à chaque pas (le chargeur centrait la LARGEUR du dessin, que les jambes écartées
  font varier) → option de manifeste `ancre: 'buste'` : chaque image est alignée sur le centre de son buste
  (lignes 25-45 %). Mesuré : buste stable à 0,4 px près.
- `echelleCommune: 'hauteur'` (V79) grossissait de 7 % la pose genou plié → retour à l'échelle commune, pieds au
  sol : Snake s'abaisse naturellement de 4 px. Le rebond ajouté par le code est coupé de profil (il le contrariait).

## BEUFA — V81 : JAMBES DE SNAKE UN PEU PLUS LENTES
- `pas` (profil) et `pasFace` (face/dos) 60 → 70 : un pas tous les 35 px au lieu de 30 (−15 % de cadence),
  vitesse de déplacement inchangée. Balancement et rebond de face/dos calés sur `pasFace`. Réglage à affiner en jouant
  (plus grand = jambes plus lentes ; au-delà de ~80 les pieds glissent).

## BEUFA — PROCHAINE ÉTAPE : LA PHASE QUIZ (validé par Fabien : l'infiltration est terminée)
- Décor prévu : le BUREAU DE BEUFA (image `beufa_bureau`, bannière `beufa_banniere`, tapis `beufa_tapis`, plantes),
  derrière la porte est du QG. `portesInterieures` existe si besoin. Questions à mettre dans `data/`.
- À demander à Fabien avant de coder : les questions (qui les écrit, sur quoi), le format (QCM ? temps limité ?
  vies ?), ce qui se passe en cas d'erreur / de victoire, et le rôle de Beufa pendant le quiz.

## BEUFA — V82 : LA PHASE QUIZ (BeufaQuiz)
- Enchaînement : la sortie du QG (infiltration réussie) → message 2,6 s → `BeufaQuiz` (plus de badge à
  l'infiltration ; le BADGE se gagne au quiz). Phase `quiz` aussi lançable depuis le menu de test.
- TEXTES (questions, lecture des pensées, moqueries, bravos, fins) : `data/beufa_quiz.js` — modifiables sans code.
  30 questions de culture jeu vidéo, 10 tirées au hasard, 4 choix mélangés (la 1re de chaque liste = la bonne).
- Réglages `R.quiz` : 10 questions, 3 erreurs max, 60 s/question, 45 lettres/s pour le codec.
- Déroulé : écran des commandes → Beufa MASQUÉ (façon Psycho Mantis : portrait qui tremble, flash violet) lit
  dans tes pensées (4 phrases au hasard) → « il fait trop chaud dans ce masque » → flash, il l'enlève → quiz.
  Erreur = croix rouge en haut à droite + Beufa se moque (+ bonne réponse) ; 10 s restantes = chrono rouge + tic ;
  temps écoulé = erreur. 3 croix = GAME OVER (« CONTINUE ? » relance le quiz SANS l'intro masquée).
  Commandes : 1-4, ou flèches + ESPACE, ou toucher/cliquer ; ESPACE / toucher le codec = suite du dialogue.
- Images : `assets_inbox/beufa_face.jpg` (Beufa de face, livré par Fabien) → `outils/beufa_quiz_images.py`
  fabrique beufa_portrait(_masque) (tête pixélisée) et beufa_buste(_masque) (debout derrière le bureau) ; le masque
  à gaz est DESSINÉ par l'outil. Bureau dessiné par le code ; bannières et plantes = images existantes.
- `BeufaQuiz` appelle `BeufaInfiltration.prototype.preparerImages` (fond blanc retiré, taille du jeu).
- Testé (Playwright) : 10 bonnes réponses → victoire + badge ; 3 erreurs → GAME OVER. Sons = bips provisoires.

## BEUFA — V83 : RIDEAU + EXPRESSIONS DU CODEC
- Le masque ne s'enlève plus par un flash : un RIDEAU (2 panneaux noirs liserés vert) se ferme, Beufa est changé
  derrière, le rideau se rouvre sur Beufa sans masque à son bureau.
- `visage(humeur)` dans `BeufaQuiz.js` : masque / calme / machiavelique / souriant / surpris / choque, selon le moment
  (tableau dans `propositions/beufa_prompts_codec.md`). Clés attendues : `beufa_codec_<humeur>` ; tant qu'elles
  n'existent pas, le portrait actuel reste. NE PAS ajouter d'entrée `fichier: null` au manifeste (le dessin
  provisoire créerait la clé et remplacerait le vrai portrait) : ajouter les entrées seulement quand les images arrivent.
- Prompts Gemini des 5 portraits codec (style MGS PS1, vert) : `propositions/beufa_prompts_codec.md`.
- Reste : recevoir les 6 images (`assets_inbox/beufa_codec_*.jpg`), les préparer (carré, ~120 px) et les brancher.

## BEUFA — V84 : PORTRAITS CODEC BRANCHÉS
- Livrés par Fabien (style cartoon pixel art vert) : `beufa_codec_masque / souriant / surpris / choque`
  (`assets_inbox/` → réduits en 256×256 dans `assets/sprites/beufa/`, entrées ajoutées au manifeste).
- Pas d'image « calme » (choix de Fabien) : le sourire la remplace. « machiavelique » livrée ensuite (V85).
  Une humeur sans image retombe sur le sourire.

## BEUFA — V86 : SCÈNE DU BUREAU ILLUSTRÉE
- `beufa_bureau_scene(_masque).jpg` (Fabien, pixel art couleur) en fond plein écran (1000×562, un peu plus grand
  que l'écran pour que les secousses ne montrent pas de bord). Si présentes, elles remplacent bureau dessiné,
  bannières, plantes et buste (`this.scene_`) ; le rideau passe de l'une à l'autre. Ancien décor gardé en secours.

## BEUFA — V87 : NOUVELLE SCÈNE SANS MASQUE (choix de Fabien)
- `beufa_bureau_scene.jpg` remplacée ; scène remontée de 30 px (mains visibles au-dessus du codec) ;
  chrono déplacé en haut à gauche, 300 px de large (au centre il passait sur le visage).

## BEUFA — V88 : GAME OVER FAÇON MGS + GARDES DE PROFIL
- Quiz : 3 croix → écran noir, « GAME OVER » en contour cyan dévoilé de gauche à droite par un éclat bleu
  (traînées), puis CONTINUE / EXIT (◀ ▶ + ESPACE, souris, ÉCHAP = EXIT). CONTINUE = relance sans l'intro masquée.
  Référence : vidéo MGS1 de Fabien (le son de la vidéo n'est PAS repris : son « psy » provisoire).
- Gardes de profil : la planche n'a aucune pose « jambes serrées » (pieds toujours écartés de 90-118 px source)
  → glisse. Palliatif : `R.garde.pasProfil` 100 (au lieu de 120) + `R.garde.rebond` 1.5 px. Vraie solution :
  prompt « GARDE — PROFIL : UN SEUL PAS EN 4 POSES » dans `propositions/beufa_prompts_marche.md`
  (une fois livrée : 4 images, jouées 2 fois, comme Snake V79).

## BEUFA — V89 : SON DU GAME OVER + GARDES DE PROFIL SANS GLISSADE (sans nouvelle planche)
- Son : `assets/audio/beufa/beufa_gameover.mp3` (9 s, tiré de la vidéo MGS de Fabien, copie dans
  `assets_inbox/beufa_gameover_mgs.mp4`) ; le dévoilement de « GAME OVER » dure 3,2 s pour suivre le son.
- Gardes de profil : `fabriquerPasGardeProfil()` fabrique `beufa_garde_profil_pas` (8 images) à partir de l'image 1
  de la planche : sous la hanche, chaque ligne est coupée au milieu des pieds et les 2 moitiés se rapprochent →
  [écartées, mi-serrées, SERRÉES, mi-serrées] × 2 pas. Réglages : `R.garde.pasProfil` 56 (px pour 2 pas),
  `profilHanche` 0.58, `profilSerrage` 0.36, `rebond` 1.5 (il monte au passage). Arrêt = jambes serrées.
  Le prompt 4 poses (V88) reste utile si on veut mieux un jour, mais n'est plus nécessaire.

## BEUFA — V90 : MUSIQUES DU QUIZ
- `beufa_mantis.mp3` (Psycho Mantis Hymn) pendant la phase masquée ; coupée quand le rideau est fermé,
  `beufa_duel.mp3` (Duel, boss battle) démarre à la réouverture (et directement après un CONTINUE).
  Coupée avant le GAME OVER (son MGS). Fichiers de Fabien réencodés en 96 kb/s (2,1 et 1,7 Mo).

## BEUFA — V91 : CLASSEMENT FAÇON MGS + MÉDAILLE
- Victoire au quiz → `ecranVictoire()` (BeufaQuiz) : écran « RÉSULTATS DE LA MISSION » vert (temps, alertes,
  bonnes réponses, erreurs, continues, points) puis CODE NAME + phrase, et une MÉDAILLE dessinée (ruban, disque
  doré, étoile, « B » ; or plus vif pour BIG BOSS) qui tombe et se balance. Le badge est toujours donné.
- Rangs et phrases : `data/beufa_quiz.js` (`RANGS`, `RANG_PARFAIT`). Points = 10/bonne réponse + (50 − 10/alerte,
  min 0) − 15/continue. BIG BOSS = 0 alerte + 10/10 + 0 continue (infiltration jouée). Puis FOX ≥140, DOBERMAN
  ≥130, HOUND ≥120, EAGLE ≥110, PUMA ≥100, CROCODILE ≥90, sinon CHICKEN.
- CONTINUE (GAME OVER) relance le quiz en GARDANT temps/alertes de l'infiltration, et compte les continues.
- Testé : 0 alerte + 10/10 → BIG BOSS (150) ; 3 alertes, 1 continue, 8/10 → CHICKEN (85).

## BEUFA — V92 : LES 4 CONSEILS DE L'AUDIT
- Meilleur rang sauvegardé (`Sauvegarde.proposerRecord('beufa', rang, temps d'infiltration, ordre des rangs)`),
  affiché au hub sous la porte (« Record BIG BOSS 5'12 ») et sur l'écran de résultats (« ★ NOUVEAU RECORD ★ » ou
  « MEILLEUR RANG »). Pas de record si le quiz est lancé seul ; dans ce cas, 0 point d'infiltration (avant : 50 offerts).
- Badge du hub = la médaille (`assets/sprites/hub/badge_beufa.png`, 48×48, dessinée par script Python).
- Le son de réussite ne joue plus 2 fois à la victoire (« bon » au dialogue, « réussi » au rang).
- 60 questions (30 ajoutées en V92).
- `beufa_musique.mp3` : 5 premières minutes en boucle, mono 56 kb/s (11 → 2,1 Mo ; original dans l'historique git).

## JULIEN — FPS FAÇON WOLFENSTEIN (décidé avec Fabien)
Histoire : tu es un étudiant en pleine manif, tu dois rejoindre le lycée (niveau 1), puis affronter Julien, prof, qui
lance des livres à esquiver (niveau 2). Choix FPS plutôt que beat'em up : collisions en grille (simples) et peu d'images
(ennemis toujours de face). Pas de visée en hauteur, un seul niveau par phase, pas de côté pour esquiver.
- **Niveau 1 : LA MANIF** (`JulienManif.js`) — FAIT (prototype jouable). Boulevard → ruelle ou rue gardée → place →
  rue du lycée → parvis → portail (case `S`). On lance des ŒUFS (pas d'armes). Policier lanceur : lève le bras
  (préavis) puis lacrymo en cloche → nuage qui fait perdre de la vie + voile vert. CRS au bouclier : crie
  « DISPERSEZ-VOUS ! », charge en ligne droite (direction fixée à la fin du cri → un pas de côté l'esquive), puis
  ESSOUFFLÉ (bouclier baissé) : seul moment où les œufs le touchent. Policier vaincu = s'enfuit dégoulinant.
  Ramassables : boîte d'œufs, sandwich (vie). Décor : barrières, poubelles, manifestants à pancartes (bloquent).
  Barre du bas façon Doom : VIE, ŒUFS, tête du héros, policiers repoussés, boussole vers le lycée.
  Tête (`visage.js`) : regard gauche/droite au hasard, tourne vers le coup reçu, grimace, tousse dans le gaz,
  sourit en ramassant, 5 niveaux d'amochage, KO.
  Fin : écran « TU AS ATTEINT LE LYCÉE » sans badge (le badge viendra après Julien).
- Fichiers : `src/bosses/julien/` : `raycaster.js` (moteur 3D), `niveau_manif.js` (plan en texte, légende en tête),
  `textures.js` (murs/persos/objets dessinés par le code), `visage.js`, `reglages.js`, `manifeste.js` (bips provisoires).
  Rendu : toile 480×270 agrandie ×2 (vue 480×222 + barre 48).
- Commandes EXACTEMENT comme Doom 93 (demande de Fabien) : ↑↓ avancer, ←→ tourner, Alt+←→ (ou , .) pas de côté,
  Ctrl tirer, Maj courir, PAS DE SOURIS (Fabien : tout au clavier comme en 93) ; Z et Q/D en plus.
  TÉLÉPHONE (choix de Fabien, les 2 joysticks ne lui plaisaient pas → supprimés) : croix du moteur commun,
  ▲▼ avancer/reculer, ◀▶ PAS DE CÔTÉ ; boutons ↺ (touche Z) et ↻ (Espace) = tourner ; gros bouton ŒUF en haut (touche X).
- PROMPTS DES IMAGES : `propositions/julien_prompts_images.md` (style Doom 93, livraison dans `assets_inbox/julien/`).
- IMAGES LIVRÉES (V1) : policier, CRS, 8 manifestants (2 planches), objets, main, tête (2 planches), mur en briques.
  Découpe : `python3 outils/julien/decouper_planches.py` (centres des poses en tête du script ; grilles de Gemini
  effacées ; poses d'un même perso au même cadre). Branchement : `textures.js` (listes SPRITES / MURS / MAINS,
  HAUTEURS_IMAGES) ; image absente = dessin provisoire. Tête : `julien_tetes.png` = 20 cases (5 niveaux × g/face/d,
  puis aïe g, aïe d, tousse, content, KO) ; regards manquants de la planche Gemini = miroir (liste TETES du script).
  CRS : 10 poses livrées, 7 utilisées. MURS : les 7 livrés + un 2e tabac en pierre (mur n°8 du plan).
- MUSIQUE : « At Doom's Gate » (DOOM E1M1, déposée par Fabien) → `assets/audio/julien/julien_musique.mp3` (mono 64 kb/s, 1 Mo), en boucle dès l'arrivée dans le niveau ; silences du début et de la fin coupés (1,11 s → 95,57 s du fichier d'origine) pour que la boucle reparte tout de suite.
- AUDIT LEVEL DESIGN + DÉCORS (Fabien : « pas très jouable, faiblard ») : `propositions/julien_audit_manif.md`
  (nouveau parcours en 5 zones, portail verrouillé, cordon de CRS, tableau de fin façon Doom, murs hauts, sol texturé,
  ciel panoramique, variantes de murs sans panneau, gros objets).
- FAIT (étape 1 de l'audit, parcours + règles) : nouveau plan 34 × 43 en 5 zones (`outils/julien/plan_manif.py` le
  génère et vérifie le chemin) : boulevard dans la foule (avenue bloquée par 2 camions de CRS + barrières), ruelle
  taguée (1 CRS) OU passage commerçant (1 lanceur), place avec statue (abri), rue du lycée avec CORDON de 3 CRS,
  parvis : portail FERMÉ jusqu'à la fuite de tous les policiers du parvis, arrivée dans la cour. 14 policiers.
  Messages à l'entrée de chaque zone (`ZONES`), 2 murs secrets (`X`, `Z` : on pousse dedans), tableau de fin façon
  Doom (POLICIERS / OBJETS / SECRETS / TEMPS / PAR 3:30), aide à la visée (`aide`, `aideTactile`), petit viseur,
  alerte entre policiers (6 cases) et au bruit d'un œuf écrasé, œufs : 15 au départ, boîtes de 8 (7 boîtes).
  Statue, camion de CRS, colonne Morris : dessins provisoires (images à demander).
- FAIT (étape 2 de l'audit, décors, `decor.js` + `raycaster.js`) : immeubles de 3 étages (ruelle et lycée 2,
  palissade 1, portail 1,4 ; `HAUTEURS` / `ETAGES`), un mur bas laisse voir le grand mur derrière ; sol texturé par
  pixel (chaussée, trottoirs le long des murs, pavés sur la place, dalles au parvis, passages piétons, bouches
  d'égout, tracts sur le boulevard ; `ZONES_SOL`) ; ciel panoramique qui tourne (toits de Paris, tour Eiffel,
  Sacré-Cœur, fumées de lacrymo) ; murs SANS panneau (le script de découpe recouvre plaques et « Lycée Jules Ferry »,
  `SANS_PANNEAU`) + version avec panneau sur 1 case sur 6. Dessin d'une image : ~7 ms.
- Œufs : 40 au départ, maxi 99, boîtes de 15 (Fabien : les munitions ne doivent pas être un problème).
- Rondes : les policiers non alertés font des allers-retours (sauf parvis et cordon).
- Statue, camion de CRS, colonne Morris : vraies images (`SEULS` dans le script de découpe : un objet par image).
- SONS : 12 bruitages rétro fabriqués par `outils/julien/generer_sons.py` (WAV) + ambiance de manif en boucle
  `julien_foule.mp3` (foule, tambours, sifflets) jouée avec la musique ; toux dans le gaz (1 fois / 1,3 s).
  Voix à enregistrer par Fabien (facultatif) : « Dispersez-vous ! », « Aïe ! », toux, « Beurk ! ».
- Retours Fabien : sifflets agaçants → retirés (CRS = cri grave grésillant, fuite = petits pas pressés, ambiance =
  foule + tambour) ; trop d'œufs pour gagner → lanceur 2 œufs, CRS 2 œufs (pendant l'essoufflement).
- CARTE façon Doom (TAB ou M ; bouton CARTE en haut à droite sur téléphone) : filigrane, nord en haut, seulement les
  murs déjà vus (le raycaster les note dans `decor.vus`), portail en jaune, flèche blanche = toi.
- AUDIT FUN (joueur) : `propositions/julien_audit_fun.md` (armes pancarte/tomates/pistolet à eau/fumigène/sono, bonus,
  BAC / drone / canon à eau / commissaire, événements, jus, difficultés, rang de fin).
- FAIT (audit fun, étape 1) : ARMES (`armes.js`, réglages dans `reglages.js`) — touches 1 à 5, bouton ARME (téléphone,
  sous CARTE), bouton de tir renommé LANCER. 1 pancarte (corps à corps infini ; un CRS frappé baisse son bouclier
  1,4 s), 2 œufs, 3 tomates (3 en éventail, recul), 4 pistolet à eau (jet continu, petits dégâts, ÉTEINT les
  lacrymos), 5 fumigènes (nuage rose 6 s : les policiers dedans ne voient plus et s'étouffent ; caché dedans, tu es
  invisible). Ramassables `t` (ruelle, place, parvis), `w` (passage, place, rue), `f` (place ×2) : le 1er donne l'arme.
  Images livrées (4 mains × 2 poses, planche objets_armes) ; seule la goutte d'eau reste dessinée par le code.
  Pistolet à eau tenu à 2 mains : dessiné au centre. Sons pancarte / eau / fumigène.
- BUG CORRIGÉ : depuis les armes, les œufs n'enlevaient plus de vie (RG.oeufs sans `degats` / `recul`).
- FAIT (audit fun, suite) :
  JUS : traces d'œuf / de tomate qui restent sur les policiers (4 maxi), recul à chaque coup, écran qui tremble
  (charge du CRS, lacrymo tout près), combo « OMELETTE ×N ! » (fuites à moins de 3 s d'écart).
  BONUS (`RG.bonus`) : `e` écharpe mouillée (20 s sans souffrir des lacrymos), `c` café serré (15 s : vitesse ×1,4,
  tir 2× plus rapide), `K` K-Way (+50 d'armure, absorbe la moitié des dégâts ; affiché sous la VIE). Dessins
  provisoires (pas d'image : Gemini au maximum ce jour-là).
  DIFFICULTÉS (`DIFFICULTES` dans reglages.js, menu avant l'intro, retenue dans la sauvegarde) : Lycéen sage,
  Délégué de classe, Bloqueur (normal), Anarchiste.
  RANG de fin (`RANGS`) : score policiers 50 / secrets 20 / objets 10 / temps 20 → Fayot, Délégué de classe,
  Leader étudiant, Che Guevara du lycée ; record (rang court + temps) affiché au hub sous la porte.
- Retours Fabien (suite) : tomates une à la fois (2 de dégâts, gros recul) ; pistolet à eau : on garde l'image AU
  REPOS même en tirant (le jet de l'image faisait doublon avec les gouttes) → la pose 2 n'est plus utile ;
  CRS 8 → 5 (cordon = 2 CRS + barrière ; parvis 1 ; place 1) ; plus de jaune d'œuf sur les policiers touchés par
  tomate / eau / pancarte / fumée (`variantesTaches` : le jaune des images touché/fuite devient rouge ou disparaît ;
  `e.dernier`) ; téléphone : croix 96 px et symboles plus gros dans la manif.
- RESTE de l'audit fun : BAC en civil + canon à eau, sono (BFG) ; images des bonus.
- AUDIT « DOOM » (dev id Software + joueur de doom-like) : `propositions/julien_audit_doom.md` (recommencer tout de
  suite, toujours courir, bruit qui alerte, infighting, sacs de farine = barils, embuscades, lumière, ennemis
  rapides / en hauteur, boss commissaire, clé et porte). Fabien : OK pour tout SAUF le boss commissaire (Julien est
  LE boss, au niveau 2) → à la place, une dernière vague plus intense sur le parvis (fourgon qui dépose des CRS).
- FAIT (audit Doom, point 1) : PERDU → « REJOUER » (ESPACE / OK : `scene.restart({ rejouer: true })`, sans menu ni
  intro) ou HUB (X) ; toujours courir (`toujoursCourir`, Maj fait marcher), rotation 3,0 ; chaque tir alerte les
  policiers à 8 cases (`bruitTir`) ; cri « HÉ ! » quand un policier te repère (`julien_halte`) ; la lacrymo fait aussi
  tousser les policiers (`degatsPolice`) ; flash doré au ramassage ; flash bleu des gyrophares près des camions ;
  indice « ↘? » jaune sur les murs secrets (`decor.speciaux`) ; compteur « PARVIS : n policiers » ; difficulté =
  nombre de policiers (`ABSENTS_FACILE` : 8 en Sage/Délégué ; `RENFORTS_ANARCHISTE` : 15 en Anarchiste ; 11 en Bloqueur).
- FAIT (audit Doom, point 2) : SACS DE FARINE `a` (8 ; un œuf / une tomate dessus → nuage blanc, 3 de dégâts qui
  percent le bouclier, policiers aveuglés 3 s, en chaîne ; `RG.farine`, `exploserFarine`) ; EMBUSCADE : 2 rideaux de
  fer `R` (mur n°9) dans le passage, un policier caché derrière chacun, levés 1,5 s après le 1er pistolet à eau
  (`ouvrirRideaux`) ; DERNIÈRE VAGUE : 3 s après l'arrivée sur le parvis, un fourgon bloque la rue du lycée et
  dépose 2 CRS (+1 lanceur en Anarchiste) comptés dans le parvis — le portail attend qu'ils fuient (`FOURGON`,
  `majFourgon`) ; LUMIÈRE : ruelle sombre (`SOMBRE`, murs + sol assombris), néons des vitrines de la rue du lycée
  qui grésillent (`NEONS`) ; changement d'arme animé (0,3 s, pas de tir pendant) ; tableau des munitions sous
  « policiers repoussés ». Sons farine / fourgon / rideau.
- Retours Fabien : bouts blancs sur les manifestants → `detourer(nettoyer=True)` (trous blancs enfermés > 20 px
  rendus transparents + liseré clair retiré ; manifestants et policier, PAS le CRS à cause des reflets du bouclier) ;
  trop rapide sur téléphone → `RG.joueur.tactile` (pas de course, rotation 2,0).
- Retours Fabien : fourgon/camions qui bloquaient plus large que leur image → rayon 1,05 → 0,6 ; bouton ARME déplacé
  juste au-dessus de LANCER (bas droite, 200 px de large) ; TÉLÉPHONE : joystick au pouce gauche (`joystick.js`,
  analogique : avancer / reculer / pas de côté), ↺ ↻ et LANCER à droite, croix cachée en jeu ; réglage
  `RG.joueur.tactile.joystick` (false = la croix), aussi dans l'écran caché des réglages (groupe TÉLÉPHONE).
- Retours Fabien : un peu dur en Bloqueur → lacrymo 14 → 10 / s, charge du CRS 18 → 14, lacrymo toutes les 3,0 s
  (au lieu de 2,6) ; bouts blancs sous le fourgon (trait de sol de Gemini entre les roues) → retiré au découpage
  (`SEULS`) ; bouton ARME trop près de LANCER → monté à 250 px du bas, 140 px de large.
- Alt + ← faisait « page précédente » dans le navigateur (sortie du jeu) → `bloquerRaccourcisNavigateur` (preventDefault
  sur Alt + flèches et Alt seul, + garde d'historique pendant la manif).
- COMMANDES PC REFAITES (Fabien : « strafe de base comme sur mobile ») : ↑↓ avancer, ← → PAS DE CÔTÉ, Q / A / D ou
  Alt (X) + ← → = tourner, Ctrl / Z / clic = tirer, Maj = marcher, 1-5 armes, Tab / M carte. SOURIS facultative :
  un clic dans le jeu la capture (tourner la vue, clic = tirer), Échap la libère (`sourisActive`, `souris` ; réglages
  cachés, groupe PC). NB tests : lancer la scène depuis la scène active (sinon le hub reste ouvert et capte D).
- COMMANDES PC PERSONNALISABLES (`commandes.js`) : touche C dans le menu des difficultés → écran COMMANDES DU
  CLAVIER : préréglages MODERNE (défaut : ← → pas de côté, Q/D tourner, Ctrl/Z tirer, E arme), DOOM 93 (← → tournent,
  , . pas de côté), ZQSD + SOURIS (AZERTY, Espace tirer), WASD + SOURIS (QWERTY) ; options souris OUI/NON, toujours
  courir OUI/NON ; chaque action se change (ENTRÉE puis la touche) → « PERSONNALISÉ ». Touche « inverser » (Alt)
  maintenue : pas de côté ↔ tourner. Gardé dans le navigateur (localStorage `bracass_julien_commandes_v1`).
  Fixes : 1-5 armes, Tab / M carte. L'intro affiche les touches choisies.
  Aussi dans le MENU PAUSE (PC, en cours de partie) : ligne « Commandes du clavier » → même écran, jeu figé, C rouvre
  la pause (PauseScene cherche une scène en pause qui a `ouvrirCommandes(retour)` / `commandesDisponibles()`).
- À FAIRE (audit Doom) : point 3 : BAC en civil, tireur de LBD, policiers en hauteur, sono (BFG). Point 4 : clé + porte + boucle.
- AUDIT BUGS + PLAISIR (niveau 1, avant le niveau 2) : 3 bugs corrigés — après « REJOUER » la souris ne marchait plus
  (`sourisInstallee` gardé d'une partie à l'autre) ; un CRS essoufflé qui sursaute (0,22 s) redevenait blindé → le 2e œuf
  faisait « plonk » (surtout avec le café) → `bouclierBaisse(e)` ; le lanceur caché derrière un mur visait ta position
  ACTUELLE à travers les murs → il vise là où il t'a vu (`vuX`, `vuY`). Aucune erreur dans la console. Plaisir : rien de
  bloquant, le niveau 1 est jugé prêt (restent en option : BAC, LBD, policiers en hauteur, sono, clé + porte).
- DEMANDES FABIEN (après le lycée) — FAIT :
  · phase 2 de la classe : le NOIR + rétroprojecteur est SUPPRIMÉ (phase 2 = « interro surprise » : copies, dico, aimant).
  · Julien est prof de FRANÇAIS : la formule de maths du tableau est remplacée par une dictée à la craie
    (`corriger_tableau` / `TABLEAU_TEXTE` dans `decouper_planches.py`, l'image source n'est pas modifiée).
  · manif : FUMIGÈNES retirés du niveau (plan + `plan_manif.py`), 1 sandwich sur 3 retiré, casse-croûte 45 % → 25 %.
  · lycée ET classe : armes de la manif INTERDITES → seulement la SARBACANE, équipée d'office (dégâts 1, cadence 0,3,
    ×3 de dos). Plus d'œufs / tomates à ramasser (remplacés par canettes / sandwichs), plus de « camarade qui fait
    passer des œufs ». « CONFISQUÉ ! » : la sarbacane est prise 8 s (on ne peut plus tirer, la main disparaît).
  · MUSIQUES : lycée = thème de Duke Nukem 3D (`julien_lycee_musique.mp3`), boss = Streets of Rage 2, thème du niveau 1
    (`julien_boss_musique.mp3`, a remplacé Sephiroth) ; la manif garde Doom. Chargées seulement quand elles jouent.
- RETOUR FABIEN (2) — FAIT : surveillants qui « n'enlèvent pas de vie » → au contact ils t'ATTRAPENT
  (`RG.surveillant.attrape` : 8 toutes les 0,9 s + bousculade ; géré dans l'IA du CRS de JulienManif), plus rapides,
  charge 15. Julien trop simple → vie 55, cadences / préavis / fenêtre de dos plus courts, livre 14 ; nouvelles
  attaques BULLET HELL : DÉLUGE (`RG.julien.deluge` : 3 / 5 / 7 vagues selon la phase, éventail visé puis décalé,
  1 vague sur 3 en cercle qui tourne, copies au-dessus des tables) et MURS (3 murs de copies d'affilée, phases 2-3).
  RAFALE DE MURS (Fabien : « enchaîner 5 ou 6, façon shoot them up ») : chaque attaque « mur » = 5 murs (phase 3 : 6,
  « murs » : +1) espacés de 0,95 / 0,85 / 0,75 s ; le trou ZIGZAGUE (`RG.julien.murs.derive` 1,3 à 2,4 cases, rebond
  sur les bords, change parfois de sens) ; un coup par mur (`mur` = numéro du mur). Testé : immobile = presque tout
  pris ; un bot qui suit le trou : 2 touches sur 8 en phase 3.
  VUE DU DESSUS (Fabien : le couloir vert + flèche en 3D « pas lisible ni fun » → retirés) : la rafale de murs se
  joue maintenant en SHOOT THEM UP VERTICAL 2D dans la vue (`entrerDessus` / `majDessus` / `dessinerDessus`, état de
  Julien 'interro') : Julien va-et-vient en haut, les murs de copies descendent (trou qui zigzague), tu bouges en bas
  (pas de côté / tourner = gauche-droite, avancer / reculer = haut-bas) et tu tires vers le haut ; fin de la rafale →
  retour en 3D, Julien DE DOS. Sur téléphone, les trous évitent les bords cachés par les boutons. Réglages :
  `RG.julien.dessus`. Testé : bot qui suit les trous = 0 dégât ; immobile = −40.
  Fabien : « il faut des nouveaux sprites, ça fait moche » → PROMPTS section 18 de `julien_prompts_images.md`
  (`julien_dessus_persos.jpg` : Julien 4 poses + héros 3 poses ; `julien_dessus_objets.jpg` : copies, boulette ;
  `julien_dessus_salle.jpg` : la salle 21:9). Découpe et branchement faits (`DESSUS_IMAGES`). LIVRÉES et découpées (planche des persos en colonne ; le héros « de
  côté » vise à gauche → miroir quand il va à droite ; boulettes en trop et pile de copies ignorées).
  EFFETS (Fabien : « améliorer encore les graphismes ») : ombres (persos, copies), murs qui se déploient depuis les
  mains de Julien, particules (`particules` : feuilles qui volent quand tu es touché / quand il lance, bouts de papier
  quand une boulette le touche + flash blanc, poussière quand tu bouges), traînée des boulettes, petit rebond en
  marchant, vignette, voile rouge au coup reçu, fondu d'entrée (noir) et flash de sortie (blanc).
  PROMPTS pour aller plus loin (à brancher à la livraison) : 18d tables d'élèves vues du dessus, 18e plus d'animations
  (Julien de côté, en rage, qui pointe ; héros qui marche, qui souffle, victoire), 18f effets (explosion de papier, « 0/20 », « 20/20 »…).
  LIVRÉES et branchées : 18e (Julien marche ×2, RAGE après un coup et en phase 3, POINTE 1 mur sur 2 ; héros marche
  ×2, SOUFFLE quand il tire, VICTOIRE ; la 3e marche du héros est ignorée) et 18f (explosion + étoile à l'impact,
  poussière, feuilles quand tu es touché, NOTE tamponnée à la fin de la rafale : 20/20 sans être touché, sinon 0/20,
  `RG.julien.dessus.note` s). 18d LIVRÉE : 6 tables d'élèves sur les bords (`TABLES_DESSUS`), l'élève se cache quand un
  mur passe à sa hauteur, lève les bras quand Julien est touché ou au 20/20 ; zone de jeu réduite (x 56 à 424).
- RETOUR FABIEN (3) — FAIT : le DÉLUGE (contrôle surprise) s'arrête maintenant sur les tables (on peut s'abriter ;
  testé : à découvert −28, derrière une table 0) ; plus de ×3 de dos pour la sarbacane (×2 comme le reste) ; vue du
  dessus : le héros n'utilise plus les poses « marche » et « de côté » (il marchait en diagonale) → pose droite + petit
  rebond quand il bouge (souffle / touché / victoire gardés).
- BUG CORRIGÉ (phase 3, « il ne se cache pas derrière le bureau ») : Julien allait jusqu'à ±1,6 case du bureau renversé
  (qui n'en couvrait que 0,85) → il reste à ±0,2 case derrière (`BUREAU_RENVERSE.marche`), y est replacé au changement
  de phase ; bureau dessiné plus haut et étiré ×1,6 pour que ce qu'on voit = ce qui bloque (rayon 0,8). Testé : de face
  0 touche sur 25 tirs ; contourné par la gauche ou la droite : 23 à 25 sur 25.
- AUDIT FINAL (version économe, dev + joueur + QA) : `propositions/julien_audit_final.md`, NOTE 7,5 / 10.
  Corrigés pendant l'audit : PLANTAGE en rejouant la classe / le lycée (scène réutilisée : état remis à zéro dans
  create), textes qui débordaient (intros raccourcies, `txtMsg` passe à la ligne), surveillant trop près du départ du
  lycée, textes incohérents (« ta sarbacane », plus d'œufs dans les répliques de la classe, « Ma veste ! »).
  Reste conseillé : ménage du code (extraire `dessus.js`, boucle update commune, code mort des murs 3D), alléger les
  textes en combat, surprise en ANARCHISTE au lycée / en classe, vérif automatique `outils/julien_verif.mjs`.
  → FAIT (voir la fin du rapport d'audit) : `dessus.js` (vue du dessus, mixin ajouté à JulienClasse), boucle update
  commune (`majJeu` / `zonesNiveau` par niveau), code mort retiré, textes allégés, ANARCHISTE (renforts du lycée
  `RENFORTS_LYCEE`, `RG.julien.anarchiste`), VÉRIF : `node outils/julien_verif.mjs` (0 erreur ; aussi dans CLAUDE.md).
- RETOUR FABIEN (4) — FAIT : Julien touché par une boulette → pose RAGE + petite explosion de papier (l'image
  « touché » a du jaune d'œuf) ; nom du combo selon l'arme (OMELETTE œufs, SAUCE TOMATE, PAPIER MÂCHÉ boulettes,
  K.-O. pancarte, DOUCHE FROIDE eau) ; LYCÉE PLUS GRAND (32 × 22) : nouveau CDI à droite de la cantine (étagères =
  tables, 2 surveillants, 1 cantinière, 2 fayots, 2 extincteurs) où est maintenant le CARNET ; plan généré par
  `outils/julien/plan_lycee.py` (vérifie le parcours). Reste possible : vraies images (étagères du CDI ; surveillant
  et cantinière « touchés » ont aussi du jaune d'œuf alors que ce sont des boulettes).
  → PROMPTS : section 19 de `julien_prompts_images.md` (19a touchés par une boulette, 19b étagères du CDI, 19c mur du CDI).
  LIVRÉES et branchées : mur du CDI (mur n° 6), étagère haute 'E' / basse 'B', table de lecture 'L', ordinateur 'O'
  (abris du CDI, plan regénéré) ; poses « touché par une boulette » : surveillant et cantinière (servent de
  `<type>_touche_propre`, choisi quand le coup ne fait pas de tache), Julien (`julien_touche_papier` en classe).
  Poses de DOS vérifiées : propres (pas d'œuf). Julien VAINCU sans œuf (19d) LIVRÉ et branché (`julien_vaincu_papier`,
  découpé comme un objet entier : fichier `assets_inbox/julien/julien_julien_vaincu_papier.jpg`, entrée de `SEULS`).
  MAINS GAUCHES (lancer, coup de pancarte, fumigène, sarbacane) : retournées en miroir à la découpe (`MAINS_MIROIR`).
- FAIT (A, le mini-niveau « LE LYCÉE », `JulienLycee.js` hérite de JulienManif ; plan `niveau_lycee.js` 24 × 22, fait et
  vérifié atteignable par un script) : manif finie → LYCÉE → porte de la salle 12 → classe. Menu de test : « Le lycée ».
  Hall → couloir des casiers (porte de la salle 12 en haut, FERMÉE sans le carnet) → cantine (CARNET DE
  CORRESPONDANCE sur le comptoir ; 2 chemins). SURVEILLANT = IA du CRS sans bouclier (`RG.surveillant`, il siffle
  puis fonce) ; DAME DE CANTINE = IA du lanceur avec de la PURÉE (`RG.cantiniere` : flaque 6 s, on y avance ×0,45) ;
  FAYOTS invincibles (objets) : ils crient et alertent tout le monde à 10 cases, s'enfuient si on s'approche ;
  EXTINCTEUR = sac de farine (mousse) ; CANETTES +15 ; casier ouvert 'X' = placard secret (tomates, K-Way, œufs).
  Boussole : le carnet, puis la porte ; « CARNET OUI/NON » sous la boussole. Images découpées (surveillant 6 poses,
  cantinière 6, fayot 4, murs casiers / couloir / cantine). Provisoires : carnet, purée, flaque ; comptoir = image du
  bureau. Testé (navigateur) : tout le parcours jusqu'à l'entrée en classe, sans erreur.
  PROMPT des vraies images (carnet, purée, flaque, comptoir, mousse de l'extincteur) : section 17 de
  `julien_prompts_images.md` → `julien_objets_lycee.jpg` ; découpe prévue (`OBJETS_LYCEE`, centres à ajuster) et
  branchement automatique (image absente = dessin provisoire). LIVRÉES et découpées : carnet, purée, flaque, comptoir,
  mousse (la pile de plateaux et la 2e flaque de la planche sont ignorées ; traits de grille dans `TRAITS`).
- SARBACANE EN MAIN (Fabien : « moche ») : dessin provisoire refait en gros pixels (`mainSarbacane` dans
  JulienClasse.js : poing, tube de Bic transparent, manche ; pose de tir avec la boulette). Vraie image à faire :
  prompt `julien_main_sarbacane.jpg` (section 9a de `julien_prompts_images.md`), découpe déjà prévue dans
  `decouper_planches.py` → `julien_main_sarbacane(_tir).png`. LIVRÉE, découpée et branchée (le dessin reste en secours).
- BUG ANDROID (rectangle de sol gris périmé quand on s'arrête, vu sur le téléphone de Fabien, pas reproduit en
  émulation) : le sol n'est plus écrit par putImageData dans la vue (toile accélérée par la carte graphique) ; il est
  calculé sur une petite toile à part (`willReadFrequently`) puis collé par drawImage (`raycaster.js`, fonction sol).
- RETOUR FABIEN (manif) « les CRS disparaissent n'importe où, trop dur, pas assez de soins » → CORRIGÉ :
  fuite : le policier prend la direction la plus dégagée qui l'éloigne de toi (`directionFuite`, 16 directions) et ne
  disparaît que quand tu ne le vois plus (`visible` : dans le champ de vision et pas derrière un mur) — `RG.fuite`.
  Soins : sandwich 25 → 35 ; un policier en fuite lâche son CASSE-CROÛTE 45 % du temps (`RG.soins.casseCroute`, ne
  compte pas dans les objets du rang) ; chaque MANIFESTANT te soigne une fois (+15) quand tu passes à côté
  (`RG.soins.manifestant`). Dégâts : charge du CRS 14 → 10, lacrymo 10 → 7 par seconde.
- **NIVEAU 2 : LA SALLE DE CLASSE** (`JulienClasse.js`, hérite de `JulienManif` ; choix de Fabien : même FPS, 3 phases)
  — FAIT (prototype jouable, dessins provisoires). Fin de la manif → ESPACE = entrer en classe (difficulté gardée).
  Manif déjà finie (`Sauvegarde.fait('julien_manif')`) : touche 2 (▶ sur téléphone) dans le menu des difficultés = direct
  en classe. Menu F1 : « Niveau 2 : la classe ». Plan 15 × 14 (`niveau_classe.js`) : tableau au nord, Julien sur
  l'estrade, tables en îlots décalés (abris : elles arrêtent ses livres ET tes œufs), bureau du prof, porte au sud.
  Julien (`RG.julien`, vie 30) fait les cent pas, s'arrête un instant au bout (`arret` : le moment de viser), lève le
  livre (préavis) puis lance. Phase 1 (> 50 %) : livre / éventail de 3. Phase 2 (« INTERRO SURPRISE ») : copies d'interro
  en vague (elles volettent), DICTIONNAIRE qui rebondit 3 fois sur les murs. Phase 3 (< 20 %, « RETENUE ! ») : rafales,
  plus rapide, il descend dans les allées. Changement de phase : pause de 1,6 s où il est intouchable. Aide à la visée
  qui anticipe sa marche. Tu gardes pancarte, œufs (30), tomates (6) ; moins de 8 œufs → un camarade fait passer une
  boîte (`secours`). Barre de vie de Julien en haut (repères 50 % / 20 %), PHASE n / 3 dans la barre du bas.
  Perdu : « COLLÉ ! » → REJOUER (repart en classe). Victoire = BADGE de Julien. Répliques dans `REPLIQUES`
  (niveau_classe.js) à personnaliser à la finition. Dessins provisoires : `decor_classe.js` (murs 64×96, plafond à néons,
  lino + estrade en parquet, Julien 7 poses, table, bureau, livre, dico, copie).
- Retour Fabien sur le niveau 2 : « pas ultra fun ». AVIS DEV + JOUEURS : `propositions/julien_audit_classe.md`
  (A : mini-niveau « le lycée » avant la classe — surveillant, fayots, cantinière, extincteur, carnet = clé de la
  salle 12 ; B : vrai combat — Julien DE DOS au tableau = fenêtre de punition ×2, mur de copies avec un trou,
  « AU TABLEAU ! » (aimant), « CONFISQUÉ ! », craies, règle ; phases qui changent la salle : rétroprojecteur dans le
  noir, bureau renversé + alarme incendie ; élèves assis qui réagissent ; sarbacane ; salle moins profonde).
  Choix : B puis A.
- FAIT (B, le combat refait, `JulienClasse.js` ; réglages `RG.julien` / `RG.classe`) : salle 15 × 11 (moins profonde) ;
  après chaque grosse attaque (éventail, mur, dico, aimant, rafale ; petites : chance `dosApresPetite`) Julien écrit au
  tableau DE DOS (`dos` s) : dégâts ×2, sarbacane ×3, bulle « ×2 », élèves « VAS-Y ! ». Attaques annoncées en grand
  (+ conseil la 1re fois) : livre, éventail, MUR DE COPIES (toute la largeur, 1 trou, passe au-dessus des tables),
  DICO, « AU TABLEAU ! » (aimant 2 s, au contact : règle + repoussé), « CONFISQUÉ ! » (trop près : arme prise 8 s,
  boîte de la même arme non ramassable pendant ce temps), CRAIES en rafale, RÈGLE au contact. Phase 2 : lumière
  éteinte (`decor.sombre` + sols sombres à l'index +16), rétroprojecteur qui balaie : il ne te voit que dans sa
  lumière ou à moins de 2,5 cases (sinon il vise où il t'a vu). Phase 3 : bureau renversé au centre (abri pour lui,
  ses livres passent, pas tes œufs : contourner), alarme incendie (son toutes les 4 s, flash rouge, gouttes), sol qui
  glisse (`RG.classe.glisse`). 4 élèves assis (plan : 'e') : contents / cachés, répliques `ELEVES` (niveau_classe.js).
  SARBACANE (plan : 'b', arme n° 6 dans `armes.js`, touche 6) : infinie, 0,5 dégât. Vie de Julien 30 → 40.
  Sons ajoutés (`generer_sons.py`, à la fin : la foule n'est pas changée) : craie, papier, alarme.
  Testé (navigateur, sans bot de jeu complet) : toutes les attaques et les 3 phases sans erreur. À faire : faire
  jouer Fabien, équilibrer, puis A (le lycée).
- CORRECTIONS D'AFFICHAGE (retour Fabien « beaucoup de bugs d'affichage ») : élève + table = UNE seule image
  (`te_<k>_<pose>`, fabriquée dans `creerDecor`, le type de la table change selon la pose) → plus d'élève qui passe
  devant / derrière sa table ; sarbacane en main dessinée (petit stylo tenu), plus l'image géante ; titre « JULIEN,
  LE PROF » à gauche de la barre (le bouton II la cachait) ; annonces plus haut (elles cachaient Julien) ; mur de
  copies plus dense et plus gros ; il se retourne seulement quand le mur (1,6 s) ou le dico (0,8 s) est parti.
- IMAGES DE JULIEN LIVRÉES (photo du vrai Julien → portrait → corps entier `julien_reference.jpg` → 2 planches de
  4 poses `julien_prof_1/2.jpg`). Découpe : `python3 outils/julien/decouper_prof.py` (zones EXCLURE : texte
  « ART CLASS 101 » et livres volants effacés) → `julien_julien_<pose>.png` (marche0/1, bras, lance, touche, dos,
  rage, vaincu ; 240 px). Branchées dans `JulienClasse` (`POSES_PROF`). La pose « dos » (au tableau) attend le
  combat refait (B). La photo du vrai Julien n'est PAS dans le dépôt (public). Tenue : veste verte, t-shirt geek
  (Silent Hill) ; il aime les t-shirts de jeux d'horreur (Silent Hill, Resident Evil).
- IMAGES LIVRÉES (lot 2), découpées par `decouper_planches.py` : MANIF → bonus (écharpe, café, K-Way), sac et nuage
  de farine, goutte d'eau, fumigène en vol (`OBJETS_BONUS`, branchés dans `SPRITES`), rideau de fer (mur 9) ;
  CLASSE → murs 128×192 (`MURS_CLASSE` : mur nu, mur + carte de France une case sur 6, fenêtres, porte), tableau
  coupé en 3 (`tableau_0/1/2`, murs 5 6 7 du plan ; une seule porte). Branchés dans `JulienClasse` (`MURS_IMAGES`).
  EN ATTENTE du mini-niveau « le lycée » (dans `assets_inbox/julien/`, pas encore découpés) : murs casiers, couloir
  (panneau d'affichage), cantine ; planches surveillant (6 poses), cantinière (6), fayot (4).
  Lot 3 : OBJETS DE LA CLASSE (`OBJETS_CLASSE`, traits de grille effacés par `TRAITS`) : table (avec sa chaise),
  bureau, livre, dico, copie BRANCHÉS (`OBJETS_IMAGES` dans JulienClasse) ; craie, sarbacane, extincteur, cartable,
  canette découpés pour plus tard ; ÉLÈVES ASSIS `eleve_<0-3>_<content|cache>` découpés (pour le combat refait, B).
- PROMPTS des images du niveau 2 + images manquantes de la manif : `propositions/julien_prompts_images.md`, sections
  10 à 16 (Julien 8 poses, objets de la classe, élèves assis, ennemis du lycée, murs, bonus de la manif, rideau de fer).
- À FAIRE : vrais sons (planche de la tête : 5 niveaux × regard g/c/d + aïe + tousse + content + KO ;
  policiers de face : marche ×2, bras levé, lancer, touché, fuite ; CRS : + cri, charge, essoufflé), musique,
  équilibrage avec Fabien, puis NIVEAU 2 (salle de classe, tables = abris, livres annoncés : seul, éventail de 3,
  dictionnaire qui rebondit ; copies d'interro sous 50 % ; on riposte avec boulettes/craies) et le badge.
- V14 : FEINTES PAR L'IDENTITÉ (idée de Fabien) : pendant l'annonce, tous les intrus font le MÊME bruit, la même ombre et le
  même « ! » (musique coupée pareil) : on ne sait qu'en le voyant. Le GARS QUI VIENT PISSER n'attrape personne (« Pardon,
  urgence ! » : on aurait pu continuer), la MAMIE (un peu sourde) n'attrape que si la charge dépasse 50 %, le VIDEUR attrape tout.
- V15 : porte : jauge de PUISSANCE déplacée à DROITE (ne cache plus les intrus). Pong plus JUSTE : imprécision aléatoire
  très faible (0,01 / 0,016 / 0,025 : ce qu'on vise = ce qu'on touche, la difficulté vient de la courbe, de l'alcool visible,
  de Rémi) ; tir rebond : imprécision mini 0,045 ; rebord : chance de rentrer selon la distance au centre (15 à 85 %) ;
  `tirage` 175 (geste plus précis). Prompts vélo 20 (obstacles + pinte), 21 (pêcheur), 22 (chorale).
- V15b : IMAGES DU VÉLO intégrées (`planches_velo_v15` dans preparer_images.py) : `remi_obstacles.png` (poubelle, pinte,
  verre cassé, flaque ; collisions poubelle 95 de haut), `remi_pecheur.png` (canne tendue / relevée), `remi_chorale.png`
  (3 fêtards : chante / sursaute ; dessinée sur le bourré du milieu `centreChorale`). Méthode `image(o, cle, frame...)`.
  PORTE : les coups se voient : le frappeur plonge vers la porte (`elan`), bulle de BD « BAM ! / POW ! / KRAK ! », CREUX qui
  restent dans le bois, score affiché plus haut. Prompt 23 (facultatif) : planche de coups qui touchent vraiment une porte.
- V16 : NOUVELLE PLANCHE DES COUPS (`remi_coups_planche.jpg`, prompt 23) : en pied, la porte dessinée sur l'image est
  EFFACÉE par `coups_porte()` (on garde à droite de son bord la peau, le jean, l'éclat blanc) → remplace `remi_dos.png` /
  `remi_toi_dos.png` (3 cases : garde, coup, impact ; poing de l'impact x 321 / 317, y 107 ; `DOS` dans RemiPorte.js,
  échelle 0,8, poing calé sur `IMPACT`). (L'ancienne planche de dos reste dans assets_inbox, plus utilisée.)
