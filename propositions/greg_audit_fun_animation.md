# Greg — audit joueur : fun et animations (V92)

Audit fait en lisant le combat (`GregCombat.js`, `reglages.js`, images de `assets/sprites/greg/`), du point de vue
d'un joueur. Rien n'a été modifié dans le jeu. Greg est TERMINÉ : tout ceci est OPTIONNEL, classé par rapport
fun / effort.

## Ce qui marche déjà bien (à ne pas casser)
- Lecture claire : « ! » jaune / violet / rouge, côté du coup, flèche ESQUIVE, cible qui se resserre.
- Boucle esquive → fenêtre de CONTRE x3 → jauge → Dempsey Roll : très gratifiante.
- Hit-stop, zoom, onomatopées manga, coach entre les rounds, Greg ÉNERVÉ avec feintes, coup secret.

## A. Améliorations de FUN

### Gros gain, petit effort
1. **Enchaînements moins prévisibles au 2e passage.** Aujourd'hui Greg joue les enchaînements « dans l'ordre ».
   Au bout de 2 parties on récite par cœur. Proposition : ordre fixe au round 1 (apprentissage), puis au hasard
   parmi la liste aux rounds 2 et 3 (avec « jamais deux fois le même d'affilée »). Une ligne dans `choisirAttaque`.
2. **Délai variable avant le coup (« la pause qui fait peur »).** Ajouter parfois 0,2–0,5 s de garde immobile avant un
   coup, ou un « ! » qui reste plus longtemps. C'est le principal ressort de tension de Punch-Out ; aujourd'hui le
   rythme est trop régulier.
3. **Combo du joueur récompensé.** Afficher un compteur « 3 HITS ! 5 HITS ! » pendant les fenêtres de contre, avec un
   petit bonus (dégâts +10 % par coup, ou étourdissement plus rapide). Donne envie de « vider » la fenêtre au maximum.
4. **Esquive PARFAITE.** Si l'esquive part dans les 0,12 dernières secondes avant l'impact : « PARFAIT ! », ralenti
   plus long, flash bleu, +5 d'esprit en plus. Récompense le skill sans changer la difficulté de base.
5. **Greg qui commente ta façon de jouer.** Déjà des répliques ; en ajouter selon le style : spam de coups
   (« Tu tapes dans le vide, gamin »), garde permanente (« Tu vas camper toute la nuit ? »), 3 esquives réussies
   (« ...pas mal »). Contenu purement texte, à faire pendant la passe de FINITION (textes perso).

### Gain moyen, effort moyen
6. **Une 3e garde : « garde de crabe » (Philly shell) au round 3.** Greg protège tout pendant 2 s ; seul un coup au
   corps juste après son jab passe. Ajoute un nouveau « puzzle » au lieu de juste accélérer.
7. **Attaque signature lisible de Greg** (comme le « TAP TAP » du SMASH) : par ex. il recule, sautille, puis
   « FLICKER » en 5 coups dont 1 au corps — l'idée est d'avoir une 2e attaque « événement » au round 2, qui manque
   (le round 2 n'a pas de moment spectaculaire).
8. **Retournement de situation.** À 20 % de vie au round 3 : Greg crie, musique qui accélère, écran légèrement rouge,
   ses coups deviennent plus rapides mais il se fatigue plus vite (souffle). Fin de combat plus épique.
9. **Mode « revanche » après victoire** : relancer directement en CHAMPION avec « Greg n'a pas dit son dernier mot ».
   Rejouabilité sans contenu nouveau.

### Bonus (si envie)
10. **Défis affichés sur l'écran de victoire** (« Gagner sans garde », « Coup secret au round 1 », « Dempsey FINISH »)
    avec une petite étoile par défi réussi gardée dans la sauvegarde. Gros moteur de rejouabilité.
11. **Entrée sur le ring** : Greg entre avec la musique, salue / provoque le public (2–3 s, passable avec une touche).

## B. Améliorations d'ANIMATION

Constat : Greg est animé par **déplacement / zoom / rotation d'images fixes** (bonne base), le héros a seulement
5 images (garde, coup, uppercut, touché, sol). Les manques les plus visibles :

### Le héros (ce que le joueur regarde le plus)
1. **Pas d'image d'esquive ni de garde** : aujourd'hui l'esquive = image de garde descendue de 40 px, la garde =
   image de garde réduite à 96 %. C'est le manque n°1 (le joueur esquive 50 fois par combat).
   → Images `heros_esquive.png` (penché sur le côté, une seule, retournée pour l'autre côté) et `heros_bloque.png`
   (gants collés devant le visage). Prompts dans `propositions/greg_prompts_images.md`.
2. **En attendant les images (code seul)** : pendant l'esquive, incliner le héros de ±12° côté esquive, petite
   traînée (2 copies transparentes qui s'effacent) ; pendant la garde, léger tremblement à chaque coup bloqué
   + étincelle blanche sur les gants.
3. **Coup au corps / Dempsey** : même image que le jab, juste baissée. → image `heros_corps.png` (crochet au
   ventre) ; pendant le Dempsey Roll, ajouter un balancement en ∞ du buste (rotation ±15° suivant la boule) et
   des traits de vitesse.
4. **Victoire** : réutilise l'uppercut. → image `heros_victoire.png` (bras levé, de dos, face au public).

### Greg
5. **Anticipation plus marquée** : quand il arme, ajouter un petit recul (échelle 0,93 → 1) + un « shine »
   (éclat blanc sur le gant qui va partir), façon Punch-Out. Lisible ET joli, quelques lignes de code.
6. **Squash & stretch à l'impact reçu** : quand tu le touches, écraser l'image 1 image (scaleX 1,06 / scaleY 0,94)
   puis revenir avec un petit rebond (`ease: 'Back.Out'`). Gros effet de « poids » pour très peu de code.
7. **Sueur et marques progressives** : gouttes qui volent de sa tête à chaque coup fort, et à partir du 2e tapis,
   une teinte légèrement rouge / un pansement dessiné sur la joue. On voit que le combat avance.
8. **Relève après tapis** : aujourd'hui il disparaît puis réapparaît. → courte animation de remontée (il sort du bas
   de l'écran en se redressant, 0,4 s) + il secoue la tête.
9. **Respiration en garde** : il se balance déjà ; ajouter une respiration (scaleY 1 ↔ 1,015, période 1,2 s),
   plus rapide quand il est essoufflé.

### Ring et effets
10. **Flashs d'appareils photo** synchronisés sur les gros coups (contre, SMASH, tapis) dans le public.
11. **Arbitre** visible pendant le compte (silhouette qui lève les doigts) — aujourd'hui le compte est seulement du
    texte. Une image `greg_arbitre.png` (prompt fourni).
12. **Transition entre rounds** : carton « ROUND 2 » qui claque (zoom 2 → 1 + secousse) et la cloche ; écran du coin
    avec le héros assis sur le tabouret (image `heros_coin.png`, prompt fourni).

## Ordre conseillé (si on y touche)
1. Squash & stretch de Greg + inclinaison/traînée d'esquive du héros (code seul, ~30 lignes, gros effet).
2. Images `heros_esquive` + `heros_bloque` (les plus vues).
3. Enchaînements au hasard aux rounds 2-3 + pause variable avant les coups.
4. Combo « X HITS » + esquive PARFAITE.
5. Le reste selon l'envie (arbitre, défis, retournement de situation).

Après tout changement : refaire tourner les bots (rangs S/A/B/C attendus dans `NOTES.md`, section Greg).
