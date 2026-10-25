# NOTES : état du projet "Les Bracass'"

## Où on en est
**Étape 0 terminée : squelette jouable.**
**Étape 1 terminée : boss Greg jouable** (formes provisoires dessinées par le code).

## Décisions
- Moteur : **Phaser 3.90** (gratuit, licence MIT), copié dans `lib/`. Aucune installation pour jouer.
- Jeu en ligne : GitHub Pages (lien dans README.md).
- Greg : **vue Punch-Out** (ton boxeur de dos, Greg de face) + **règles façon Hajime no Ippo**.
  C'est le **premier boss développé**.

## Ce qui est fini
- Hub vue du dessus : héros mobile, 6 portes (Beufa, Kédric, Julien, Greg, Rémi, Lionel), noms, "Bientôt".
- Barre de 6 badges, sauvegarde dans le navigateur.
- Retour au hub devant la porte du boss après chaque combat.
- Modèle de boss commun (`src/core/BossScene.js`) : écran des commandes, victoire (badge), défaite, retour hub.
- Boss "Modèle" de test (menu F1 uniquement) : Z = gagner, X = perdre.
- Menu de test caché (F1) : lancer n'importe quel boss / phase, remettre la sauvegarde à zéro.
- **Smartphone / tablette** : boutons tactiles à l'écran (`src/core/tactile.js`), qui "appuient" sur
  les touches du clavier. Chaque scène choisit le texte de ses boutons (`etiquettesTactiles`).
  Le menu de test (F1) n'existe que sur ordinateur.
- Manifeste unique des visuels/sons : `assets/manifeste.js`. Tant qu'un visuel n'a pas de fichier,
  il est dessiné par le code dans `src/core/dessins.js` (style manga : contours, ombres, reflets).
  Option `pixel: 3` possible (dessin fait en petit puis agrandi, style pixel art).
  Greg en combat = ses illustrations détourées (fond retiré avec rembg, modèle u2net / isnet-anime) :
  garde basse `greg_combat.png`, garde haute `greg_garde_haute.png`, coup au corps `greg_coup_corps.png`,
  coup au visage `greg_coup_visage.png`, K.O. `greg_ko.png` (originaux dans `assets_inbox/`).
  Chaque image est calée sur la tête (réglages `illustre` dans `src/bosses/greg/reglages.js`).
  Greg est vu en entier : ses jambes (`greg_jambes.png`, tirées de `assets_inbox/greg_entier.jpg`)
  restent posées sur le tapis sous le haut du corps.
  Quand il prépare un coup, on voit l'image du coup grossir vers toi avant l'impact.
  L'illustration complète sert aussi pour la présentation (`greg_portrait`) et l'annonce du SMASH (`greg_visage`).
- Bruitages du combat : générés par `outils/generer_sons.py` (Python + numpy) dans `assets/audio/`.
- Rendu lissé (`pixelArt: false` dans `src/main.js`).
- Combat de Greg inspiré de Super Punch-Out (SNES) : bandeau avec portraits et « VS », public dense,
  tapis bleu avec logo, ton boxeur petit et transparent (réglages `tailleJoueur`, `transparenceJoueur`).
- **Greg** (`src/bosses/greg/`) : combat de boxe en 3 rounds de 60 s.
  - Commandes : ◀ ▶ esquive, Espace = coup au visage, Z = coup au corps, Bas (maintenu) = garde,
    X = Dempsey Roll (quand la jauge d'esprit est pleine).
  - Les coups au visage partent de GAUCHE ou de DROITE (le « ! », Greg et l'image du coup sont de ce côté) :
    il faut esquiver du côté OPPOSÉ ; une flèche « ESQUIVE » l'indique. Le SMASH part du centre.
  - Greg prévient avant de frapper : « ! » jaune = visage (esquive ou garde),
    « ! ▼ » bleu = corps (garde seulement), « !! » rouge = SMASH (esquive seulement, round 3).
  - Esquive réussie = fenêtre de CONTRE (dégâts x2). Garde de Greg haute = vise le corps, basse = le visage.
  - 3 coups encaissés d'affilée : Greg se couvre puis riposte.
  - Coups au corps = vident le souffle de Greg ; à bout de souffle, il est grand ouvert.
  - Jauge d'esprit combatif pleine : DEMPSEY ROLL = jeu de rythme. La boule attend dans le cercle de droite :
    ▶ lance le roll, puis ◀ quand elle arrive à gauche, ▶ à droite (PARFAIT / BIEN). Chaque coup accélère
    et frappe plus fort, 10 coups = FINISH. 2 ratés pardonnés, le 3e arrête le roll.
    Round 3 : Greg contre (boule rouge) → ▼ pour freiner.
  - Lancement du Dempsey Roll : joue `assets/sprites/greg/dempsey.gif` s'il existe (voir « clips »
    dans le manifeste), sinon une animation dessinée par le code.
  - Au tapis : compte de l'arbitre, marteler Espace. 3 tapis = K.O. Greg : 3 tapis = victoire.
  - Le vieux coach donne des conseils avant chaque round. Fin du round 3 sans K.O. = décision aux points.
  - Tout l'équilibrage est dans `src/bosses/greg/reglages.js`.
  - Musique de fond : `assets/audio/greg_musique.mp3` (chargée au début du combat, en boucle, volume dans le manifeste).
  - Menu de test F1 : commencer directement au round 1, 2 ou 3.

## Ordre de développement (mis à jour)
1. ~~Greg (style Hajime no Ippo)~~ fait
2. **Beufa, phase quiz**  ← prochaine étape
3. Julien
4. Kédric
5. Rémi
6. Lionel
7. Beufa, phase infiltration
8. Phase design (STYLE_GUIDE.md, ASSETS_TODO.md complet, intégration des visuels)
9. Finitions

## Plan des dossiers
| Dossier | Contenu |
|---|---|
| `index.html` | page du jeu |
| `lib/` | moteur Phaser (ne pas toucher) |
| `src/main.js` | démarrage du jeu |
| `src/core/` | code partagé : sauvegarde, clavier, badges, modèle de boss, menu de test |
| `src/hub/` | le hub (+ `reglages.js`) |
| `src/bosses/<boss>/` | un dossier par boss : `index.js` (fiche), `reglages.js` (équilibrage), scènes |
| `src/bosses/liste.js` | ordre des portes |
| `data/` | données (questions du quiz, plus tard) |
| `assets/manifeste.js` | LA liste de tous les visuels et sons |
| `assets/sprites/<boss>/`, `assets/ui/`, `assets/audio/` | fichiers définitifs |
| `assets_inbox/` | où tu déposes tes fichiers bruts |

## Ajouter un boss (rappel technique)
Copier `src/bosses/modele/`, renommer, puis dans `src/bosses/<boss>/index.js` : `pret: true`, `phases`, `scenes`.
