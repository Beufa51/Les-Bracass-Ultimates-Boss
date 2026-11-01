# Les Bracass' — consignes pour Claude

Jeu web Phaser 3 (boss par boss). L'état du projet est dans `NOTES.md` : lis seulement la section utile
(cherche-la avec grep), pas tout le fichier.

## Travail en parallèle
Le propriétaire avance aussi avec une autre IA. Avant chaque modification : `git fetch origin main` puis
`git merge --ff-only FETCH_HEAD`. Ne travaille jamais sur un boss qu'il est en train de modifier ailleurs (demande si tu as un doute).

## Rappel au propriétaire
Quand les 6 boss sont finalisés : lui rappeler la passe de FINITION où l'on personnalise les textes de chaque jeu
(voir « À RAPPELER À FABIEN » en tête de `NOTES.md`).

## Beufa
Après tout changement de `src/bosses/beufa/reglages.js` : `node outils/beufa_verif.mjs` doit finir à 0 erreur, 0 avertissement.

## Économiser l'utilisation (demande du propriétaire)
Le propriétaire atteint vite la limite d'utilisation. Donc :
- À la fin de chaque tâche terminée (commit poussé), ajoute UNE ligne de conseil :
  « 👉 Tu peux faire /clear maintenant » quand la suite porte sur un autre sujet ou un autre boss, ou que la
  conversation est déjà longue (plusieurs grosses tâches, ou un résumé automatique a déjà eu lieu) ;
  sinon « 👉 Pas besoin de /clear : la suite a besoin du contexte actuel ». Avant un /clear, tout ce qui compte doit
  être écrit dans le dépôt (code poussé, `NOTES.md` à jour) : rien ne doit rester seulement dans la conversation.
- Préviens AVANT une action coûteuse (agent / sous-agent, nombreuses captures d'écran, longues parties de bots,
  lecture de gros fichiers) et propose la version économe. Pas d'agent sans demande explicite.
- Lis les fichiers par morceaux ciblés (grep, plages de lignes) ; ne relis pas un fichier déjà lu.
- Captures d'écran : seulement celles qui prouvent le résultat (2 ou 3, pas plus).
- Réponses courtes : ce qui a changé, comment tester, ce qui reste.
