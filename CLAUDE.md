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

## Julien
Après tout changement de `src/bosses/julien/` (plans, réglages, images) : `node outils/julien_verif.mjs` doit finir à 0 erreur.

## Rémi
Après tout passage de `outils/remi/preparer_images.py` ou changement de `src/bosses/remi/manifeste.js` :
`node outils/remi_verif.mjs` doit finir à 0 erreur (sinon une planche s'affiche en entier au lieu d'une case).
Après tout changement du babyfoot (`src/bosses/remi/RemiBaby.js`, `src/bosses/remi/babyfoot/`, réglages `BABY` / `baby*`) :
`node outils/remi_baby_bot.mjs` (≈ 2 min) doit finir par « Babyfoot : 0 problème » (tout tir VERT doit marquer).

## Images (demande du propriétaire)
Dès qu'une image manque ou qu'une nouvelle image améliorerait le jeu, DONNE DIRECTEMENT le prompt prêt à copier
(dans la réponse, en bloc de code, avec le nom du fichier attendu et ce qu'il faut joindre), sans attendre qu'il le
demande. Range-le aussi dans le fichier de prompts du boss (`propositions/<boss>_prompts_images.md`).

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
