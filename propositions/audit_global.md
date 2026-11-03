# Audit global des 6 boss (V18 — version économe)

Méthode (choix de Fabien : version économe) : vérifications automatiques, chaque scène lancée dans le navigateur avec
20 s de touches au hasard, « rejouer » testé (2 parties de suite dans la même page), lecture ciblée des zones à risque,
NOTES et audits existants. **Le plaisir de jeu est jugé sur les règles et les réglages, pas sur de vraies parties** :
les notes sont des estimations à confirmer en main.

## 1. Bugs

| Test | Résultat |
|---|---|
| Chargement de tous les modules (`outils/verif_modules.cjs`) | 0 erreur |
| `beufa_verif` / `julien_verif` / `remi_verif` | 0 erreur, 0 avertissement |
| 14 lancements de scène (tous les jeux + Kédric finale, Greg round 3, Lionel set décisif) + touches au hasard | 0 plantage |
| 2 parties de suite dans la même page (11 scènes) | 0 plantage |
| Images / sons du manifeste introuvables sur le disque | aucun |
| Écouteurs du navigateur (clavier, redimensionnement) retirés en quittant | oui partout |

Petits défauts trouvés (non bloquants) :
- **B1 — Écran de fin (VICTOIRE / PERDU du modèle commun)** : seul ESPACE (ou le bouton OK du téléphone) ramène au hub ;
  un **clic de souris** ne fait rien sur ordinateur (`attendreRetour` dans `src/core/BossScene.js`). Correction : 3 lignes.
- **B2 — Manif de Julien** : chaque visite ajoute une entrée dans l'historique du navigateur (`history.pushState`) ;
  après plusieurs parties, le bouton « Retour » du téléphone doit être pressé plusieurs fois pour quitter le site. Mineur.
- **B3 — Kédric** : le **trophée** de l'écran de victoire est encore dessiné au code (image manquante) ; le stade aussi.
  Prompts prêts : `propositions/kedric_prompts_images.md`.
- **À vérifier en main** : la nouvelle pichenette du beer pong et la porte V18 (testées par bots seulement).

## 2. Plaisir de jeu (estimations sur 10)

| Boss | Note | Points forts | Ce qui peut gêner |
|---|---|---|---|
| **Greg** (boxe Punch-Out) | 8 | Lisible (« ! » jaune / violet / rouge), contre, Dempsey Roll, coach, équilibré par bots | Défaite = retour au hub, on refait l'intro |
| **Lionel** (Windjammers) | 8 | Entraînement, aides claires, supers spectaculaires, difficulté PERSO | Beaucoup de gestes pour un débutant (lob visé, contre parfait, plongeon) |
| **Beufa** (Metal Gear + quiz) | 7,5 | Ambiance MGS forte, quiz drôle, CONTINUE | Pas de choix de difficulté (le quiz tire déjà ses questions au hasard parmi 60 : bien) |
| **Julien** (FPS manif + lycée + classe) | 7 | Le plus riche, fenêtre de punition de dos | La chaîne la plus longue ; équilibrage pas encore validé par Fabien |
| **Kédric** (football + show) | 6,5 | Showtime (duel de frime en rythme) original | **Empilement de règles** (coup d'envoi, essais, GHOST, ▲▼ obligatoires, duel, showtime) : même risque que l'ancien beer pong |
| **Rémi** (vélo, pong, porte) | 6,5 → ? | 3 jeux variés, ambiance bar | Pong et porte refaits en V18 : à rejouer ; le vélo a eu beaucoup de retours |

## 3. Améliorations proposées (par ordre de rapport plaisir / coût)

1. **REJOUER PARTOUT** (coût : faible, 1 fichier commun) — à l'écran PERDU, « ESPACE : rejouer / X : hub » pour **tous**
   les boss (aujourd'hui seulement Julien et Rémi). Greg, Lionel, Kédric : on retourne au hub et on refait les intros.
   + B1 (clic souris sur l'écran de fin).
2. **Kédric : passe « une seule règle »** (coût : moyen) — même méthode que le beer pong : garder le cœur (courir,
   esquiver, showtime) et retirer ou automatiser une ou deux couches (ex. ▲▼ obligatoires, jauge GHOST). À décider avec
   Fabien après une partie.
3. **Harmoniser les difficultés** (coût : faible à moyen) — Greg 3 niveaux, Lionel 3 + PERSO, Kédric / Julien / Rémi 4,
   Beufa aucune. Proposition : 4 niveaux partout dont un **ENTRAÎNEMENT** (manque à Greg et Lionel), noms au thème de
   chaque boss (comme Rémi et Julien).
4. **Récompense des 6 badges** (coût : moyen) — dans le hub, quand les 6 badges sont gagnés : une scène finale (photo de
   groupe des Bracass', crédits) et éventuellement un **BOSS RUSH** chronométré (les 6 à la suite, record).
5. **Images** : trophée et stade de Kédric (prompts dans `propositions/kedric_prompts_images.md`) ; Rémi : voir
   `propositions/remi_prompts_images.md`.
6. **Phase de FINITION** (déjà prévue) : personnaliser les textes de chaque jeu avec Fabien.

## 4. Ce qu'il faut faire jouer à Fabien en priorité
1. Rémi : beer pong (pichenette) et porte (poing caché, tu commences).
2. Kédric : un match complet en NORMAL, pour décider du point 2.
3. Julien : la classe (équilibrage).

## 5. Fait en V18 (demande de Fabien : « toutes les corrections »)
B1, B2, B3, points 1 à 5 faits (voir NOTES.md, « V18 — CORRECTIONS DE L'AUDIT GLOBAL »). Seul le BOSS RUSH (facultatif) n'est pas fait.
