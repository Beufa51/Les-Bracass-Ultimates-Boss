# Rémi — audit développeur + joueur (V3, après intégration des images)

Retour de Fabien : « le beer pong n'est pas fun, la porte n'est pas en face donc pas crédible, la maniabilité du vélo est
nulle et on voit du blanc autour ».

## Notes

| Jeu | Joueur | Développeur | Verdict |
|---|---|---|---|
| 1. Vélo | **4/10** | 6/10 | Idée bonne et lisible, mais le contrôle est mou et injuste. |
| 2. Beer pong | **3/10** | 6/10 | Fonctionne mais sans sensation : on vise des points minuscules, on attend. |
| 3. La porte | **4/10** | 6/10 | Mise en scène fausse (on frappe le mur à côté d'une porte vue de face). |
| Images (détourage) | 5/10 | — | Liseré blanc autour du vélo, des bourrés, de Rémi ; intérieur des roues blanc par endroits. |
| **Rémi global** | **4/10** | **6/10** | Jouable de bout en bout, mais pas encore au niveau de Greg / Beufa. |

---

## 1. Le vélo

### Côté joueur — ce qui ne va pas
1. **Collisions fausses** : le vélo affiché fait ~160 px de long, mais la zone de choc n'en fait que 80 (`DEMI_VELO = 40`,
   réglée pour l'ancien dessin). On « traverse » visuellement un bourré sans rien, puis on tombe plus loin : sentiment d'injustice.
2. **Le vélo glisse sur l'écran** : sa position dépend de la vitesse (`210 + v × 0,25`) : il avance quand on accélère, recule
   quand on freine. On perd ses repères au moment où il faut viser un saut.
3. **Pédaler = garder ▶ enfoncé tout le temps** : fatigant sur téléphone, et rien à gagner à faire autre chose.
4. **Saut toujours identique** : même hauteur, même durée, quelle que soit la pression. Sauter un allongé exige une vitesse
   précise (à basse vitesse, impossible) : on ne comprend pas pourquoi on rate.
5. **Aucune tolérance** : le saut ne part que si on est exactement au sol (pas de « saut mémorisé » quelques images avant
   l'atterrissage), la sonnette a 1,5 s de recharge sans indication claire de la portée.
6. **Pas de récompense** : pas de score, pas de « parfait », pas de combo ; seul le chrono compte.

### Côté développeur
- Constantes de collision non recalculées après le passage aux images ; tailles en dur (`setScale(0.6)`, `BOURRE = 0.25`).
- Animation de pédalage = 6 cases dont l'ordre du pédalier n'est pas garanti (2 rangées de la planche) : petites saccades.
- Liseré blanc : le détourage « blanc relié au bord » garde les pixels de bord mélangés au blanc (6 % des pixels opaques du vélo
  sont presque blancs). `rembg` (modèle isnet-anime, déjà installé et utilisé pour Kédric) détoure beaucoup mieux.

### Améliorations proposées (vélo)
- **A1** Vélo FIXE à l'écran (x = 260) ; la vitesse se voit par le décor et des traits de vitesse.
- **A2** Collisions recalculées sur l'image (roue avant / roue arrière), un peu INDULGENTES (80 % de la taille visible).
- **A3** Le vélo roule tout seul à vitesse de croisière. ▶ = SPRINT (plus vite, jauge d'endurance qui se vide),
  ◀ = freiner. Plus besoin de garder un doigt appuyé en permanence.
- **A4** Saut à HAUTEUR VARIABLE (appui court = petit saut, appui long = grand saut), saut mémorisé 0,15 s avant
  l'atterrissage, et 0,1 s de « grâce » après avoir quitté le sol.
- **A5** Sonnette : cercle de portée dessiné devant le vélo + icône qui se recharge ; un bourré qui a entendu s'écarte toujours.
- **A6** Score de « style » : saut juste au-dessus (« RAS ! »), sonnette au dernier moment, aucun freinage → bonus de temps.
- **A7** Ralenti + caméra qui tremble à la chute, le vélo repart avec 1 s de clignotement (invincible).

---

## 2. Le beer pong

### Côté joueur — ce qui ne va pas
1. **Les verres de Rémi sont minuscules** (~30 px) : la caméra est trop loin et trop haute ; on vise des points, pas des verres.
2. **Lancer en 2 étapes mécaniques** (toucher le verre, puis arrêter une jauge) : aucune sensation de geste, toujours pareil.
3. **Pas de tension** : pas d'effet au rebord, pas de ralenti, pas de foule, un « PLOUF » discret.
4. **Trop d'attente** : 2 lancers de Rémi à chaque tour, sans rien à faire.
5. **Pas de variété** : 6 verres immobiles, aucune règle spéciale, Rémi ne fait rien pour te gêner.

### Côté développeur
- Projection maison correcte et réglable, mais les constantes de caméra (`CAM_Z`, `CAM_H`, `F`) sont en dur dans la scène.
- La planche de Rémi (4 poses) est bien utilisée ; la table et les verres sont encore dessinés au code (corrects).

### Améliorations proposées (beer pong)
- **B1** Caméra plus proche et plus basse : les verres de Rémi 2 fois plus gros, table qui remplit l'écran.
- **B2** **Lancer « fronde »** : on pose le doigt sur la balle, on TIRE VERS SOI (comme un lance-pierre), une courbe en
  pointillés montre le début de la trajectoire (toute la trajectoire en FACILE), on lâche = la balle part.
  Longueur = force, angle = direction, avec un aperçu : on voit ce qu'on fait (le premier glissé n'en avait pas).
  Clavier : ◀ ▶ angle, ▲ ▼ force, ESPACE lance (même courbe affichée).
- **B3** Mise en scène : balle qui tourne avec une traînée, ralenti quand elle passe près d'un verre, rebord = la balle tourne
  autour du verre avant de tomber dedans ou dehors, gerbe de bière, foule qui crie « BOIS ! ».
- **B4** **EN FEU** : 3 verres de suite → la balle s'enflamme, la zone parfaite s'élargit pour le lancer suivant.
- **B5** Rémi joue plus vite (ses 2 lancers enchaînés en 2 s) et te DÉCONCENTRE parfois : il agite les bras → la courbe
  d'aperçu tremble ; clique sur lui juste avant pour lui dire « Chut ! » (petit QTE optionnel).
- **B6** Rack de 10 verres en NORMAL / CHAMPION avec un « re-rack » automatique en losange à 4 verres restants.

---

## 3. La porte

### Côté joueur — ce qui ne va pas
1. **Pas crédible** : la porte du décor est vue DE FACE sur le mur du fond, et les personnages sont DE PROFIL à côté :
   ils frappent l'air (ou le mur) à gauche de la porte.
2. **On ne voit pas l'impact** : petit poing de profil, petites fissures ; un coup à 950 ressemble à un coup à 400.
3. **Le tour de Rémi est passif** (on regarde un chiffre monter).

### Améliorations proposées (porte)
- **C1** **Vue DE DOS, façon Punch-Out** : la porte EN GRAND au centre de l'écran (on zoome sur la porte du décor actuel),
  le frappeur de dos au premier plan, il frappe VERS l'écran. Il faut 2 nouvelles planches (prompts ci-dessous).
- **C2** Impact proportionnel : à 900+ la porte se fend en étoile, éclats de bois, gel de 0,15 s, flash blanc ;
  à 999 : la porte s'ouvre d'un coup.
- **C3** Pendant le tour de Rémi, tu peux PARIER (plus / moins de 800 ?) : un bon pari donne +30 à ton élan.
- **C4** L'élan reste tapoté, mais la jauge monte en « paliers » colorés (comme une borne de bar) avec un son qui monte.

---

## 4. Ordre de travail proposé (validé ; FAIT en V4 : A1-A5, A7, détourage, B1-B5, C1, C2, C4 — RESTE : A6, B6, C3)
1. **Vélo** : A1, A2, A3, A4, A5 + nouveau détourage `rembg` de TOUTES les images (règle aussi « le blanc autour »).
2. **Beer pong** : B1, B2, B3, puis B4 / B5.
3. **Porte** : C1 (dès réception des planches de dos), C2, C4 ; C3 en option.
4. Puis A6, A7, B6 et une partie de bots pour régler la difficulté.

## 5. Images nécessaires (pour C1)

`remi_porte_dos_planche.jpg` — joindre l'image de Rémi (beer pong ou présentation) :
```
Même personnage que l'image jointe (casquette noire à l'envers, barbe, veste en jean, tee-shirt orange, jean), style manga/anime
identique, contours noirs nets, fond BLANC uni, aucun texte, aucun cadre. Vu DE DOS (on voit son dos et l'arrière de sa casquette),
coupé à mi-cuisses, face à une porte qu'on ne dessine pas. 3 poses sur une ligne, même échelle, bien espacées :
1 : en garde, poings levés ; 2 : élan, épaule droite tirée en arrière, poing droit armé près de l'oreille ;
3 : coup de poing droit lancé droit devant lui (vers le fond de l'image), bras tendu, traits de vitesse autour du poing.
```

`remi_toi_dos_planche.jpg` — joindre la planche de la porte (le jeune homme en tee-shirt bleu) :
```
Même jeune homme que sur l'image jointe (cheveux bruns, tee-shirt bleu, jean), même style manga/anime, contours noirs nets,
fond BLANC uni, aucun texte, aucun cadre. Vu DE DOS, coupé à mi-cuisses. 3 poses sur une ligne, même échelle, bien espacées :
1 : en garde, poings levés ; 2 : élan, poing droit armé près de l'oreille ; 3 : coup de poing droit lancé droit devant lui
(vers le fond de l'image), bras tendu, traits de vitesse.
```
