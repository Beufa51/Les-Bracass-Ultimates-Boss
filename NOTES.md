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
- Manifeste unique des visuels/sons : `assets/manifeste.js` (formes provisoires dessinées par le code).
- **Greg** (`src/bosses/greg/`) : combat de boxe en 3 rounds de 60 s.
  - Greg prévient avant de frapper : « ! » jaune = visage (esquive Gauche/Droite ou garde X),
    « ! ▼ » bleu = corps (garde X seulement), « !! » rouge = SMASH (esquive seulement, round 3).
  - Esquive réussie = fenêtre de CONTRE (dégâts x2). Garde de Greg haute = vise le corps, basse = la tête.
  - 3 coups encaissés d'affilée : Greg se couvre puis riposte.
  - Coups au corps = vident le souffle de Greg ; à bout de souffle, il est grand ouvert.
  - Jauge d'esprit combatif pleine : Haut + Z = DEMPSEY ROLL (alterner Gauche/Droite ;
    au round 3 Greg peut le contrer : Bas pour freiner).
  - Au tapis : compte de l'arbitre, marteler Espace. 3 tapis = K.O. Greg : 3 tapis = victoire.
  - Le vieux coach donne des conseils avant chaque round. Fin du round 3 sans K.O. = décision aux points.
  - Tout l'équilibrage est dans `src/bosses/greg/reglages.js`.
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
