# Julien — audit final (manif → lycée → classe)

Version économe demandée par Fabien : une seule passe, trois casquettes (développeur, joueur, QA), sans complaisance.
Mesures faites avec des bots dans le navigateur (PC et téléphone simulé), les 4 difficultés, les 3 niveaux.

## 1. Le développeur (game design + code)

**Ce qui est solide**
- Un seul moteur 3D (raycaster) réutilisé par les 3 niveaux : `JulienLycee` et `JulienClasse` héritent de `JulienManif`.
- Tous les chiffres sont dans `reglages.js`, commentés en français ; les plans sont générés et vérifiés par script
  (`plan_manif.py`, plan du lycée) ; la découpe des images est reproductible (`decouper_planches.py`).
- Bonne boucle de boss : préavis lisible → esquive → fenêtre de punition (Julien de dos) ; chaque phase change la
  salle (interro, bureau renversé + alarme) ; deux genres dans le même boss (FPS + shoot them up vu du dessus).

**Ce qui coince**
- `JulienClasse.js` fait ~880 lignes : le boss en 3D ET le shoot them up 2D dans la même classe. À extraire dans un
  module `dessus.js` (logique + dessin), pour la lisibilité.
- La boucle `update()` est recopiée 3 fois (manif, lycée, classe) avec de petites différences : risque d'oublier une
  correction dans l'une des trois.
- Code mort laissé par les itérations : murs de copies en 3D (`genre 'mur'` dans `avancerLivres` / `spritesEnPlus`,
  `RG.julien.mur.vitesse/ecart`), poses « marche » et « de côté » du héros vu du dessus (chargées, plus affichées),
  tests sur l'arme `'pancarte'` en classe.
- Piège Phaser : une scène est RÉUTILISÉE quand on rejoue ; tout état gardé sur `this` survit à la partie d'avant.
  C'est ce qui a causé le plantage trouvé ci-dessous. Règle : tout remettre à zéro dans `lireNiveau()` / `create()`.
- Pas de vérification automatique dans le dépôt (les bots de cet audit sont jetables) : un `outils/julien_verif.mjs`
  comme pour Beufa éviterait les régressions.

**Note développeur : 6,5 / 10** (bon jeu, code qui a grossi vite et mérite un ménage).

## 2. Le joueur

**J'ai aimé**
- La progression : la manif (chaos, CRS, lacrymos) → le lycée (on change d'ambiance, la sarbacane, Duke Nukem) →
  le boss (Streets of Rage 2). Chaque niveau a sa couleur.
- Le boss est varié : livres, craies, dico qui rebondit, « AU TABLEAU ! », « CONFISQUÉ ! », pluie de copies, et la
  rafale de murs en vue du dessus avec la note 20/20. Les élèves qui réagissent et Julien qui se planque font rire.
- La vue du dessus est la meilleure trouvaille : lisible, nerveuse, jolie depuis les vraies images.

**J'ai moins aimé**
- Beaucoup de texte à lire en plein combat (réplique + grosse annonce + conseil + élèves), surtout sur téléphone.
- Le lycée est court (5 ennemis, 2 à 3 minutes) : agréable mais on aimerait un « moment » de plus (ex. le
  surveillant chef, ou une poursuite).
- En ANARCHISTE, le lycée et la classe ne changent que les dégâts et la cadence : pas de surprise en plus.
- Pas de point de reprise : mourir pendant le boss renvoie au début du boss (acceptable, mais frustrant en phase 3).

**Note joueur : 7,5 / 10**

## 3. La QA (bugs, difficultés, textes)

| Niveau | LYCÉEN SAGE | DÉLÉGUÉ | BLOQUEUR | ANARCHISTE |
|---|---|---|---|---|
| Manif (PV pris en 20 s par un bot simple) | 16 | 24 | 32 | 50 (17 policiers) |
| Lycée | 8 | 18 | 40 | 40 |
| Classe | 42 | 26 | 40 | 40 |

(Bot volontairement bête : il fonce et tire. La difficulté monte bien dans la manif et le lycée ; la classe dépend
surtout des attaques tirées au hasard.)

**Bugs trouvés et CORRIGÉS pendant l'audit**
1. GRAVE : rejouer la classe (après « COLLÉ ! ») ou le lycée faisait PLANTER le jeu (texte de la partie d'avant).
2. Textes qui sortaient de l'écran : message du hall du lycée, intros du lycée et de la classe (lignes raccourcies,
   messages qui passent à la ligne).
3. Le premier surveillant du lycée était trop près du départ : −22 PV avant même de bouger (déplacé).
4. Textes incohérents : « ton arme » au lieu de « ta sarbacane », Julien qui parle encore d'œufs en classe,
   « Mon costume ! » (il porte une veste).

**Vérifié OK** : aucune erreur dans les 12 combinaisons niveau × difficulté ; manif → lycée → classe ; défaite puis
« rejouer » dans les 3 niveaux ; victoire → badge enregistré ; menu de test sur téléphone ; écran d'intro de chaque
niveau.

**Pas testé** (à faire en jouant pour de vrai) : une manif complète de bout en bout par un humain, la fluidité sur un
vieux téléphone, le volume relatif des musiques et des bruitages.

**Note QA : 7 / 10 avant l'audit, 8 / 10 après les corrections.**

## Note finale : 7,5 / 10

Un boss riche, drôle et varié, le plus ambitieux du jeu. Pour viser 8,5 : faire le ménage du code (dessus.js,
boucle commune, code mort), alléger les textes en combat, ajouter une vraie surprise en ANARCHISTE, et faire la passe
de FINITION des textes avec Fabien (répliques personnalisées).
