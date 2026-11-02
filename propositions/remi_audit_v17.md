# Rémi — audit global V17 (bugs, UI, plaisir de jeu)

Méthode économe : relecture ciblée du code des 3 jeux + parties de bots (vélo complet, ruelles, écran de fin).
Pas de vraie partie humaine : à confirmer en jouant.

## 1. Bugs

| # | Jeu | Problème | État |
|---|-----|----------|------|
| B1 | Porte | Attrapé juste après le coup qui fait céder la porte : le « rafistolage » (+300) remettait la porte debout et un nouveau tour repartait derrière l'écran de victoire. | CORRIGÉ |
| B2 | Porte / vélo / pong | Doigt relâché HORS de l'écran : la charge (porte), le saut ou l'esquive (vélo), le lancer (pong) restaient bloqués. | CORRIGÉ (`pointerupoutside`) |
| B3 | Porte | L'image de la mamie (1,2 Mo) était encore téléchargée alors qu'elle ne sert plus. | CORRIGÉ (retirée du manifeste) |
| B4 | Porte | Un coup « attrapé » dans les 0,25 s après la frappe a DÉJÀ fait ses dégâts, puis la porte est rafistolée : la règle « coup perdu » n'est vraie qu'à moitié. | CORRIGÉ (coup annulé) |
| B5 | Vélo | L'esquive utilise le même son que la flaque (`remi_glisse`) : on croit avoir glissé. | CORRIGÉ (`remi_esquive.wav`) |
| B6 | Outils | `node --check` ne voit pas certaines erreurs de syntaxe des modules (un retour à la ligne dans un texte a bloqué tout le jeu au chargement). | Vérifier avec un import dans le navigateur (voir NOTES). |

## 2. Interface (UI)

- Vélo : boutons revus (pouce gauche DRING, pouce droit SAUTE / EN BAS empilés) — à valider sur téléphone.
- Écran PERDU : n'affiche ni les points ni ce qui a coûté la partie. Proposition : 1 ligne « ce qui t'a fait perdre » +
  1 conseil (comme le bilan du coach de Kédric).
- Pendant le pong et la porte, les points ne sont pas visibles (seulement à la fin). Proposition : petit compteur
  « pts de la soirée » en haut à droite, qui grimpe à chaque verre / coup.
- Écran de fin : on voit encore l'afficheur « 000 » de la porte à travers le voile (sans gravité).

## 3. Plaisir de jeu (notes estimées, joueur / dev)

| Jeu | Note | Ce qui marche | Ce qui manque |
|-----|------|---------------|---------------|
| Vélo | 7/10 | 3 gestes clairs, carrefours, tremplins + salto | Le nouveau geste EN BAS n'a pas de récompense |
| Beer pong | 6,5/10 | Visée lance-pierre, ivresse, BALLS BACK | Peu de suspense en fin de partie |
| Porte | 6,5/10 | Bluff videur / gars qui pisse, musique coupée | Partie un peu longue (~5 coups chacun), peu de variété |

Propositions (par ordre d'intérêt) :
1. **Défis de maîtrise** (le moteur a déjà `lignesDefis`) : « vélo sans chute », « pong sans boire un verre »,
   « porte sans se faire attraper », « rang S en CUL SEC ». Gros gain de rejouabilité pour peu de code.
2. **Vélo : pintes « en bas »** posées au bord du trottoir, qu'on n'attrape qu'en esquivant → le geste EN BAS devient
   aussi une récompense, pas seulement une punition.
3. **Pong : dernier verre = « verre de la honte »** (plus petit, Rémi le protège en soufflant plus fort) → fin plus tendue.
4. **Porte : une manche plus courte en DIABOLO / PANACHÉ** (`solidite` par difficulté), et le gars qui vient pisser qui
   fait parfois tomber son téléphone (fausse fausse-alerte) pour varier.
5. Écran PERDU avec conseil (voir UI).

## 4. Fait dans cette passe (V17)

- 4 difficultés façon Kédric aux noms de boissons : **DIABOLO** (entraînement), **PANACHÉ** (facile),
  **PRESSION** (normal), **CUL SEC** (champion). Record séparé par difficulté.
- **Points** de chaque jeu (`POINTS` dans reglages.js) et **rang** de la soirée complète (`RANGS`) :
  S ROI DU COMPTOIR (1700), A PILIER DE BAR (1300), B HABITUÉ DU ZINC (900), C BUVEUR DE DIABOLO.
  Repère bot : vélo parfait ≈ 1050 pts.
- Écran de victoire : points par jeu, total, rang (lettre + nom), difficulté, temps, record, « prochain rang à X pts ».
