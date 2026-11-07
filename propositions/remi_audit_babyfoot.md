# Rémi — audit du BABYFOOT (V19o)

Audit fait sans agent : relecture du code (`src/bosses/remi/RemiBaby.js`, 734 lignes), des réglages, des captures, des
parties de bots (dans le navigateur, sans écran), et des retours de Fabien depuis V19.
Déjà corrigé en V19o (même commit que cet audit) : tirs en bande impossibles, tirs de Rémi sans sensation, musique.

## Côté JOUEUR

### Ce qui marche
- La boucle **lire → arrêter → viser → tirer** est claire. La visée billard avec sa ligne colorée donne vraiment envie
  de chercher l'angle.
- L'alcool des deux côtés crée une histoire dans la partie : tu encaisses, tu tangues ; tu marques, Rémi ralentit.
- Les retours visuels du but (ralenti, filet, confettis) et Rémi qui réagit (penche, râle, boit) donnent du caractère.

### Ce qui coince (du plus important au moins important)
1. **On n'attaque jamais vraiment.** Rémi engage TOUJOURS ; toi, tu ne fais que riposter après un arrêt. Sur 5 buts,
   c'est répétitif. Idée : après TON but, c'est TOI qui engages (tu as la balle, Rémi défend), comme au vrai babyfoot.
2. **La feinte contre sa défense n'est expliquée nulle part.** Sa défense suit ta visée (V19l), mais rien ne le montre.
   Idée : ses défenseurs « regardent » ta ligne (petite flèche au-dessus d'eux), et une astuce au 1er arrêt :
   « Ses défenseurs suivent ta visée : feinte ! ».
3. **Les sons ne sont pas ceux d'un babyfoot.** On réutilise les sons du beer pong et de la porte (tape, rebond, porte,
   foule). Il manque le « clac » de la balle sur le bois, le « tchak » d'une frappe de figurine, le « klong » de la
   balle au fond du but, le « vrrr » d'une roulette. On peut les fabriquer avec `outils/remi/generer_sons.py`.
4. **Tous les tirs de Rémi se ressemblent.** Seules la vitesse et la direction changent. Idée : 3 tirs reconnaissables,
   chacun avec sa pose : la PISSETTE (direct, très rapide, peu de lecture), le TIR EN BANDE (il regarde la bande),
   la FRAPPE LENTE et piégeuse (feinte double).
5. **La roulette se dénonce mal.** Il faut toucher Rémi tout en haut de l'écran, et rien ne l'indique pendant le jeu.
   Idée : un bouton « ROULETTE ! » qui n'apparaît que pendant les 1,6 s où on peut crier.
6. **La gamelle est du pur hasard** (35 % près du poteau). Idée : la récompenser quand on vise volontairement le
   poteau (la ligne finit sur le poteau = « GAMELLE POSSIBLE »).
7. **L'alcool finit par trop gêner.** À 4-5 pintes, la visée ondule ET la ligne raccourcit ET les hoquets arrivent :
   c'est la double peine quand on perd déjà. Idée : plafonner à 3 effets cumulés, ou laisser « boire de l'eau »
   (une action) pour perdre une pinte.
8. **La musique** : le morceau est le même thème joué 3 fois (1 min 49). Corrigé en partie : les blancs sont coupés
   et la musique reprend où elle en était. Mieux : un 2e morceau du même dessin animé pour la balle de match.
9. **Ton propre but est invisible** : juste un trait noir en bas. Quand Rémi marque, on ne voit pas la balle rentrer.
10. **Couleurs** : la ligne vert / jaune / rouge est difficile à distinguer pour un daltonien. Le message en bas aide ;
    un ✓ ou ✗ au bout de la ligne serait plus sûr.

## Côté DÉVELOPPEUR

1. **`RemiBaby.js` est trop gros (734 lignes)** et a reçu 15 retouches (V19 à V19o). À découper en 4 fichiers : la
   physique (trajets, rebonds, `cheminLibre`), Rémi (préparation du tir, ses barres), les effets (traînée, éclats,
   confettis, filet, ivresse) et le dessin. Le risque de casser une chose en en modifiant une autre augmente.
2. **Des chiffres sont écrits directement dans le code** : 0,03 (décalage de la balle tenue), 0,12 s et 1 cm de marge
   du vert, 0,85 (largeur de ses défenseurs), 0,04 par pinte de Rémi. À ranger dans `BABY` comme le reste.
3. **Pas de bot de test dans le dépôt.** Les bots (guide, tirs en bande, arrêts parfaits) sont restés dans un dossier
   temporaire. À ajouter : `outils/remi_baby_bot.mjs`, qui vérifie que tout tir vert marque et donne le score par
   difficulté (comme `remi_verif.mjs` pour les images).
4. **Le jeu dépend de la fluidité.** Un pas de temps est limité à 0,05 s : sur un téléphone lent, tout ralentit. La
   ligne verte prend 0,12 s de marge pour ça. Si le jeu saccade, on peut voir du vert et se faire arrêter.
5. **Les points du bilan n'ont pas été recalés** (`babyEcart` 80, `babyArret` 10, `babyGamelle` 40) depuis le
   changement de jeu. Les seuils de rang (S 1 700, A 1 300, B 900) datent du beer pong : à vérifier sur une soirée.
6. **Les réglages développeur sont incomplets** : ni la vitesse de sa défense, ni l'effet bourré, ni le guide.
7. **Effets de caméra** : un zoom de but est maintenant remis à zéro au démarrage d'une partie (V19o), et la vignette
   n'est plus empilée à chaque partie. À surveiller si on ajoute d'autres effets de caméra.

## Ma proposition de priorités
1. Engagement après TON but (joueur 1) : le plus gros gain de plaisir.
2. Sons de babyfoot (joueur 3) : peu de travail, gros effet sur la sensation.
3. Feinte expliquée et lisible (joueur 2), bouton ROULETTE (joueur 5).
4. Découpage de `RemiBaby.js` et bot de test dans le dépôt (dév 1 et 3) : AVANT d'ajouter d'autres fonctions.
5. Le reste selon tes retours.
