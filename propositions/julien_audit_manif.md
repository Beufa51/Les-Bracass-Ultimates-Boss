# Julien — audit du niveau 1 « la manif » (level design + décors)

Point de vue : développeur ET joueur. Références : Doom (1993), Wolfenstein 3D, et les règles de level design
connues (apprendre une chose à la fois, repères visibles de loin, rythme calme / combat, verrou + clé, secrets).

## Verdict
Le moteur, les commandes et les images tiennent la route. Le NIVEAU, lui, est une suite de rectangles vides où rien
n'oblige à se battre : le meilleur choix est de courir jusqu'au portail en ignorant les policiers. Les décors sont
plats (murs bas, sol et ciel unis, panneaux répétés). Il faut repenser le parcours ET enrichir le moteur de décor.

---------------------------------------------------------------------------------------------------------------------
## A. Problèmes de JOUABILITÉ (le plus grave)

1. **Aucune raison de se battre.** Le portail s'ouvre toujours : on gagne en touchant la case `S`, même avec 3
   policiers vivants devant. « Policiers repoussés » ne sert à rien. → Le joueur malin fonce, le jeu dure 40 s.
2. **Pas de progression / pas d'apprentissage.** Doom présente chaque ennemi SEUL d'abord, dans un endroit sûr.
   Ici, on rencontre lanceurs et CRS mélangés sur une grande place ouverte : on ne comprend ni le préavis du bras
   levé, ni le « pas de côté puis vise » du CRS.
3. **Départ raté.** On part dans un grand rectangle vide (le boulevard, 30 × 4) ; la boussole pointe vers un mur ;
   la ruelle de gauche est collée au départ et permet de sauter la moitié du niveau.
4. **La place est une boîte vide de 20 × 6.** Pas d'abri au centre : on se fait gazer de loin sans pouvoir se
   cacher, ou on contourne tout le monde.
5. **Culs-de-sac sans intérêt** : la droite du boulevard (colonnes 23-30) ne mène à rien qu'à une boîte d'œufs.
6. **Munitions mal dosées** : 12 + 3 boîtes × 6 = 30 œufs pour 10 policiers qui en demandent ~34 (sans rater).
   Se battre est donc puni → encore une raison de fuir.
7. **Viser est dur** : pas de viseur, rayon de touche 0,35, ennemis fins de loin. Doom aidait à viser en hauteur ;
   nous n'avons aucune aide, surtout pénible au doigt.
8. **Ennemis passifs** : ils attendent sur place jusqu'à te voir (pas de ronde, pas de cris qui alertent les autres,
   le bruit d'un œuf n'alerte personne).
9. **Pas de fin « Doom »** : Doom finit chaque niveau par le tableau KILLS / ITEMS / SECRETS / TIME / PAR, qui donne
   envie de rejouer. Ici : une ligne de texte.
10. **Pas de secret** : en Doom, les secrets (mur qui s'ouvre, recoin caché) sont la moitié du plaisir d'exploration.

## B. Problèmes de DÉCOR

1. **Murs trop bas** : tous les murs font 1 étage → on se croit dans un labyrinthe de murets, pas en ville.
   Il faut des immeubles de 3-4 étages (le moteur peut les dessiner plus hauts).
2. **Panneaux uniques répétés** : « LYCÉE JULES FERRY », « RUE DU BALCON », « 18 RUE DES PROTESTATIONS », « 24 bis »
   se répètent sur CHAQUE case de mur → ça saute aux yeux. Il faut une version SANS panneau de chaque mur (pour
   répéter) et garder la version avec panneau pour 1 case de temps en temps.
3. **Sol uni gris** : pas de trottoir, pas de bordure, pas de passage piéton, pas de bouche d'égout. Le sol est la
   moitié de l'écran : c'est ce qui fait le plus « vide ».
4. **Ciel en simple dégradé** : Doom avait un ciel panoramique qui tourne avec la vue. Une ligne de toits de Paris
   avec des fumées de lacrymo changerait tout pour presque rien.
5. **Trop peu d'objets de décor** et toujours les mêmes (barrière, poubelle, 8 manifestants isolés). Une manif
   = une FOULE, des banderoles, des fumigènes, un camion sono, des camions de CRS, des voitures garées…
6. **Aucune zone ne se reconnaît** : boulevard, ruelle, place, rue se ressemblent (couloirs à angle droit,
   même lumière). Pas de point de repère (statue, fontaine, colonne Morris) pour s'orienter.
7. **Le lycée n'est pas visible de loin** : on ne voit le but qu'au dernier moment ; il devrait être au bout d'une
   longue rue droite, visible depuis la place.

---------------------------------------------------------------------------------------------------------------------
## C. NOUVEAU PARCOURS proposé (≈ 3-4 min, 5 zones qui se reconnaissent)

```
 [5 PARVIS] portail FERMÉ ── s'ouvre quand le parvis est dégagé (combat final : vague de 4-5)
      │
 [4 RUE DU LYCÉE] longue et droite, le portail visible au bout ; CORDON de 3 CRS + camion de CRS
      │
 [3 PLACE] grande place avec STATUE au centre (abri), 4-5 policiers, objets autour ; 2 sorties
      │                                   │
 [2a RUELLE TAGUÉE] sombre, 1 CRS seul    [2b PASSAGE COMMERÇANT] vitrines, 1 lanceur + secret
      │   (apprend le pas de côté)        │   (apprend le préavis du lacrymo)
 [1 BOULEVARD] départ DANS la foule (zone sûre), banderoles, camion sono ; barrage de camions de CRS
    devant → on est obligé de passer par 2a ou 2b
```
- **1 Boulevard** : on démarre au milieu des manifestants (personne ne tire). Message : « Les CRS bloquent le
  boulevard ! Passe par les petites rues. » Le barrage (camions) se voit au fond.
- **2a / 2b** : chacune apprend UN ennemi, seul, avec de la place pour l'esquiver. Elles se rejoignent sur la place.
- **3 Place** : l'arène du milieu, statue au centre pour se cacher des lacrymos, objets dans les coins.
- **4 Rue du lycée** : on voit enfin le lycée au bout. Le cordon de CRS bloque la rue (il ne s'ouvre qu'en les
  faisant fuir) : impossible de passer en courant.
- **5 Parvis** : portail fermé, message « Le CPE n'ouvrira pas tant que la police est là ! ». Dernière vague,
  puis le portail s'ouvre (bruit + texture qui change) → on entre → tableau de fin.
- **Secrets (2)** : un recoin derrière un mur tagué qui s'ouvre (sandwich + œufs), une porte cochère dans le passage.
- **Tableau de fin façon Doom** : POLICIERS %, OBJETS %, SECRETS %, TEMPS, « PAR » (temps de référence).

## D. Réglages de jeu proposés
- Œufs : départ 15, boîtes de 8, 5 boîtes placées → ~55 œufs pour ~14 policiers (on peut rater).
- Aide à la visée horizontale : un œuf lancé à moins de ~6° d'un policier est dévié vers lui (plus large au doigt).
- Petit viseur discret au centre (désactivable).
- Alerte : un policier qui te voit crie ; ceux à moins de 6 cases (même sans te voir) arrivent.
- Rondes : certains policiers font des allers-retours (on peut les surprendre de dos).
- Lacrymo : visée là où tu VAS être (un peu en avance) pour le lanceur « expérimenté » de la fin.

## E. Moteur de décor à ajouter (code, pas d'images nécessaires sauf indiqué)
1. **Hauteur des murs par type** : immeubles 3 étages (la texture est répétée vers le haut, rez-de-chaussée =
   vitrine, étages = fenêtres), murets / barrières 0,5, portail 1,2.
2. **Sol texturé** (calcul par pixel en basse résolution, possible en 480 × 111) : chaussée, TROTTOIR le long des
   immeubles, bordure, passage piéton, plaques d'égout, pavés sur la place.
3. **Ciel panoramique** qui tourne avec la vue (1 image : toits de Paris + fumées de lacrymo).
4. **Variantes de murs** : version sans panneau (répétable) + version avec panneau (posée à la main dans le plan).
5. **Gros objets solides** : voitures, camion de CRS, camion sono, statue, abribus, kiosque, colonne Morris.
6. **Portail qui s'ouvre** et **mur secret qui coulisse**.
7. **Ambiance** : fumigènes colorés (sprites animés), confettis de tracts au sol, sons de foule et slogans en fond.

## F. Images à demander à Gemini (prompts à écrire si validé)
- Murs : immeuble SANS plaque de rue, tabac SANS plaque, lycée SANS « Jules Ferry », mur tagué SANS plaque ;
  étage d'immeuble (fenêtres seulement) pour les étages ; portail OUVERT.
- Sol : chaussée, trottoir, passage piéton, pavés (textures carrées vues de dessus).
- Ciel : panorama large des toits de Paris avec fumées.
- Objets : voiture garée, camion de CRS, camion sono avec banderole, statue (Marianne), colonne Morris, abribus,
  fumigène (3 images d'animation), banderole « LYCÉENS EN COLÈRE » tendue, groupe de manifestants serrés.

## G. Ordre conseillé
1. **Parcours + règles de jeu (C, D)** — code seul, c'est ce qui rend le niveau JOUABLE. Testable tout de suite
   avec les images actuelles.
2. **Moteur de décor (E 1-4)** — gros gain visuel, surtout les murs hauts et le sol.
3. **Images (F)** — en parallèle : Fabien génère pendant que Claude code.
