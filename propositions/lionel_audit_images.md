# Lionel — audit des IMAGES et ANIMATIONS (nov. 2026)

Lionel est VALIDÉ côté jeu : cet audit ne touche pas aux règles, seulement à ce qu'on VOIT.
Prompts prêts : `propositions/lionel_prompts_images.md`.
**FAIT (nov. 2026)** : lancer de Lionel en 3 temps (image reçue), élan au code pour ton lancer, tremblement au touché,
Lionel sur l'écran de défaite. Voir `NOTES.md` (« LIONEL — AUDIT IMAGES »).

## 1. Ce qui existe

| Qui | Images (dans `assets/sprites/lionel/`) | Animé comment |
|---|---|---|
| Lionel (tourné vers la gauche) | attente, **pas chassé (8 images)**, **course (6 images)**, tient, lance, super, rattrape, plongeon, touché, victoire, défaite, portrait | course et recul = vraies animations ; tout le reste = image FIGÉE |
| Toi (blond, maillot rouge) | attente, **pas chassé (6 images)**, **course (6 images)**, lance, super, plongeon, touché, victoire, défaite | idem |
| Terrain | `lionel_terrain.jpg` (plage, grillage, public en haut, arbitre et photographe en bas) | figé |
| Dessiné au code | frisbee (4 images qui tournent), mouette (4 images), ballon (12 images), château de sable, trophée | |
| Effets au code | traînée / flammes / étincelles du frisbee, nuages de sable, onde de choc, cinématique de super (grande pose + images fantômes), zoom au point | |
| Autour | présentation = `lionel_portrait`, écran de victoire = `lionel_defaite` + trophée dessiné ; hub / intro / finale ont leurs images | |

## 2. Poses provisoires (une image fait le travail d'une autre)

| Moment du jeu | Ce qu'on voit aujourd'hui | Problème |
|---|---|---|
| **LANCER** (le geste le plus vu du match) | une seule image « lance » pendant 0,28 s | pas d'élan : le joueur passe d'« attente » à « bras tendu » d'un coup |
| **LOB** | la même image « lance » (bras à l'horizontale) | rien ne distingue un lob d'un tir à plat |
| **Toi : tenir / rattraper** | ta pose de COURSE + frisbee posé dans le poing par le code | tu sembles courir à l'arrêt quand tu tiens le frisbee |
| **Se relever après un plongeon** | on reste couché (image « plongeon ») puis on réapparaît debout | saut brutal, aucune transition |
| **Lionel nargue** (il garde le frisbee pour te chambrer) | son image de VICTOIRE + frisbee dessiné au bout du doigt | même pose qu'au point marqué : on ne lit pas « il se moque » |
| **Touché** (le frisbee rentre dans ton but) | une image figée 0,9 s | correct, mais fixe |
| **Écran de DÉFAITE** (Lionel gagne le match) | texte seul, **aucune image de Lionel** | le seul écran de fin sans personnage — se règle SANS nouvelle image (sa pose « victoire » existe) |
| **Public** | dessiné dans le décor, figé | la jauge dit « LE PUBLIC EST EN FEU ! » mais personne ne bouge |
| **Arbitre** sur sa chaise | dans le décor, figé | il « siffle » (son) sans bouger |

Fichiers présents mais **inutilisés** : `lionel_course.png` (remplacé par la course en 6 images), `heros_frisbee_garde.png`,
`heros_frisbee_tient.png`, `heros_frisbee_rattrape.png` (pose de face rejetée). On peut les laisser ou les ranger.

## 3. Ce qui se fait SANS image (code seulement, à valider)

1. **Écran de défaite avec Lionel** : `lionel_victoire` qui glisse comme sur l'écran de victoire + une réplique en bulle.
2. **Lancer en 3 temps au code** (en attendant les vraies images) : l'image « lance » arrive légèrement tournée en
   arrière puis claque vers l'avant (rotation + étirement 80 ms). Petit gain, gratuit.
3. **Public qui saute** : découper la bande du public (haut du décor, ~35 px) dans une image à part et la faire
   rebondir quand une jauge est pleine ou sur un point spectaculaire. Aucune nouvelle image à générer.
4. **Relève** : en attendant la pose, remonter l'image « plongeon » en la redressant (rotation) sur la durée de relève.
5. **Touché** : petit recul + tremblement de 0,2 s sur l'image existante.

## 4. Images à générer (priorités)

| Priorité | Fichier attendu (dans `assets_inbox/`) | Pour quoi | Joindre |
|---|---|---|---|
| 1 | `lionel_lancer_3.jpg` | Lionel : élan → lâcher → accompagnement (remplace le lancer figé) | `lionel_lance.png` + `lionel_attente.png` |
| 1 | `heros_frisbee_lancer_3.jpg` | Toi : idem | `heros_frisbee_lance.png` + `heros_frisbee_attente.png` |
| 2 | `lionel_lob.jpg` | Lionel : lancer par en dessous, vers le ciel | `lionel_lance.png` |
| 2 | `heros_frisbee_lob.jpg` | Toi : idem | `heros_frisbee_lance.png` |
| 2 | `heros_frisbee_tient_cote.jpg` | Toi : à l'arrêt, de côté, frisbee en main (remplace la course figée) | `heros_frisbee_attente.png` |
| 3 | `lionel_releve.jpg` / `heros_frisbee_releve.jpg` | se relever après un plongeon (2 poses) | leur `_plongeon.png` + `_attente.png` |
| 3 | `lionel_nargue.jpg` | Lionel fait tourner le frisbee sur son doigt, sourire moqueur | `lionel_tient.png` + `lionel_portrait.png` |
| 4 | `lionel_arbitre.jpg` | arbitre qui siffle (2 poses), posé sur la chaise du décor | `lionel_terrain.jpg` |
| 4 | `lionel_trophee.png` | trophée illustré (remplace le dessin du code) | `lionel_terrain.jpg` |

Branchement prévu : découpe avec `outils/lionel/decouper_animation.py` (planches en ligne, fond blanc) puis une ligne
par image dans `src/bosses/lionel/manifeste.js` ; le code des lancers lira l'animation à 3 images si elle existe
(sinon l'image « lance » actuelle reste).

## 5. Mon conseil
Commencer par le **code seul** (points 1 et 3 du §3 : défaite avec Lionel + public qui saute), puis la
**priorité 1** (lancers en 3 images) : c'est le geste qu'on voit 100 fois par match.
