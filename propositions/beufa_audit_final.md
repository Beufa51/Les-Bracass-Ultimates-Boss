# Beufa — audit final (V91) : développeur, joueur, éditeur

Méthode (économe) : lecture ciblée du code, `beufa_verif` (0 erreur, 0 avertissement), tests Playwright du quiz
(3 erreurs au clavier → GAME OVER → CONTINUE → 1 erreur = 1 seule croix ; temps écoulé = erreur + visage
machiavélique à 10 s ; victoire 10/10 + 0 alerte = BIG BOSS ; 8/10 + 3 alertes + 1 continue = CHICKEN),
infiltration lancée 10 s en bougeant : aucune erreur JS.

## Bugs trouvés
Aucun bug bloquant. Petits défauts :
1. Quiz lancé SEUL (menu de test) : alertes inconnues comptées comme 0 → +50 points « gratuits » (BIG BOSS reste
   impossible). Sans effet en vrai parcours.
2. Le son `beufa_reussi` joue 2 fois à la victoire (début du dialogue + apparition du rang). Voulu ? À trancher.
3. Le meilleur rang n'est PAS sauvegardé : on ne le revoit pas au hub.
4. Le badge du hub (`badge_beufa`) est toujours le dessin provisoire alors que la médaille existe.
5. Scène masquée cadrée plus large que la scène sans masque (le rideau le cache en partie).

## Développeur — 7/10
+ Textes, rangs et réglages hors du code (`data/beufa_quiz.js`, `reglages.js`), outil de vérification des pièces,
  replis si une image manque, NOTES très complètes.
− `BeufaInfiltration.js` dépasse 1 200 lignes (à découper : préparation des images, gardes, radar).
− Le voile de nuit (canvas plein écran) est renvoyé à la carte graphique à CHAQUE image : à surveiller sur mobile.
− Images d'avant devenues inutiles (buste, portrait pixélisé, bureau) gardées en secours : à nettoyer un jour.
− `NOTES.md` : la section « Où on en est » en tête ne parle pas de Beufa (périmée).

## Joueur — 8/10
+ L'ambiance MGS marche : codec, Psycho Mantis qui lit tes pensées, rideau, musique qui change, GAME OVER fidèle,
  classement BIG BOSS → CHICKEN qui donne envie de rejouer.
+ Expressions de Beufa qui réagissent (sourire, surpris, choqué, machiavélique).
− Seulement 30 questions pour 10 tirées : au 3e essai on retombe sur les mêmes → viser 60+.
− 60 s par question, c'est long : 30-40 s rendrait le chrono plus stressant.
− Gardes de profil : poses « jambes serrées » fabriquées par le jeu, à valider à l'œil en mouvement.

## Éditeur — 7,5/10 (8,5 sans le risque juridique)
+ Identité forte, finition au-dessus d'un jeu amateur, le classement allonge la durée de vie.
− RISQUE : musiques (Intruder 2, Psycho Mantis, Duel) et son du GAME OVER sont de Konami, sur une page PUBLIQUE
  (GitHub Pages) ; « Psycho Mantis », « Big Boss », « Fox » sont des marques/noms de la licence. Pour un jeu entre
  amis ça passe ; pour le diffuser plus largement, remplacer par des musiques libres « à la manière de ».
− Poids : 15 Mo d'audio pour Beufa (dont 11 Mo pour la musique d'infiltration) → long au 1er chargement en 4G.

## Prochaines actions conseillées (par ordre)
1. Sauvegarder le meilleur rang + l'afficher au hub ; utiliser la médaille comme badge du hub.
2. Passer à 60 questions (texte seulement, `data/beufa_quiz.js`).
3. Réduire `beufa_musique.mp3` (64 kb/s mono ≈ 4 Mo).
4. Mettre à jour l'en-tête de `NOTES.md`.
