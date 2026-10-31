# Beufa — revue « cohérence d'une base militaire » (V62)

Regard de level designer de jeu d'infiltration (école Metal Gear) : le joueur doit CROIRE au lieu.
Contrainte : ne pas casser le gameplay (rondes, couvertures, passages).

## Les règles
1. **Une pièce = une fonction.** Tout objet sert cette fonction. Sinon, il sort.
2. **Le périmètre se distingue de l'intérieur.** Barbelés, miradors et projecteurs : seulement sur l'enceinte.
3. **L'ordre militaire.** Rangées, alignements, séries (on stocke en nombre, jamais un objet seul).
4. **Collé au mur ou vrai passage.** Un objet est contre le mur, ou à ≥ 34 px. Pas de faux passage.
5. **L'échelle.** Snake fait la taille d'un homme : un véhicule, une étagère ou un conteneur sont plus hauts que lui.
6. **La progression.** Gardes, sécurité et prestige augmentent jusqu'à la porte du chef.

## Les 4 pièces
| Pièce | Fonction | Fait |
|---|---|---|
| 1. Cour | Entrée : portail, quartiers, stockage | Barbelés seulement sud/ouest/est (enceinte). Panneau absurde retiré. |
| 2. Parc | Garage des véhicules + carburant | Jeeps à l'échelle, barbelés seulement au nord (enceinte). |
| 3. Arsenal | Dépôt de missiles + armes | 4 missiles en batterie au centre + réserve de 2 au nord-ouest ; râtelier, munitions, atelier à l'entrée. |
| 4. QG | Salle des opérations puis SAS de sécurité | Le bureau de Beufa est retiré (il ira dans la pièce du QUIZ). Le sas a un poste d'écrans et des archives. Le tapis à son emblème mène à SA porte. |

## Encore à faire (à valider par Fabien)
- Camions et étagères plus hauts que Snake : prompts `beufa_prompts_hauteur.md`.
- Parc : la pompe et les jerricans (prompts V59 n°6-7) à côté du réservoir = vraie station-service.
- Réservoir (cour, parc) et jeep : encore dessinés vus d'en haut, pas en 3/4 → à refaire.
- Cour : conteneurs dans tous les sens. Les aligner serait plus « militaire », mais ça déplace des couvertures
  (gameplay) : à décider.
- La bannière (prompt V59 n°11) et le bureau iront dans la pièce du QUIZ.
