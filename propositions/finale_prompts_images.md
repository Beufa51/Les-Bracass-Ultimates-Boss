# FINALE (mécha des Bracass') : prompts d'images

Toutes les images vont dans `assets_inbox/finale/`. Ordre conseillé = ordre de la liste. Le n° 1 sert de RÉFÉRENCE de
style pour les suivants (le joindre à chaque fois). Proposition complète : `propositions/finale_mecha.md`.

## 1. Le mécha complet (référence) — `assets_inbox/finale/mecha_complet.png`
Joindre : les 6 images `assets/sprites/hub/select_<boss>.png` (beufa, kedric, julien, greg, remi, lionel).
```
Les 6 images jointes sont 6 amis. Dessine UN robot géant de combat façon sentai / Power Rangers (Megazord) formé par
eux : chaque partie du robot est un véhicule-armure aux couleurs et au thème d'un ami, avec SON visage reconnaissable
dans un petit cockpit vitré de cette partie.
- Tête : Julien (prof : visage de l'image Julien, motifs de cahiers et de copies notées 20/20, une antenne en règle).
- Torse et cœur (cockpit central) : Beufa (style base militaire Metal Gear, camouflage gris-vert, grand œil-radar).
- Bras droit : Greg (boxeur : énorme poing en gant de boxe rouge).
- Bras gauche : Lionel (plage : lanceur de frisbees orange au poignet, couleurs maillot vert et blanc).
- Jambe droite : Kédric (football américain : casque et épaulières bleu et blanc, ballons sur le mollet).
- Jambe gauche : Rémi (bar : fût de bière en cuivre, pompe à bière, chope au genou).
Vue de PROFIL, tourné vers la GAUCHE, debout, pose menaçante. Style illustration BD / cartoon, traits noirs épais,
couleurs franches, ombres en aplats (le même style que les images jointes). Robot ENTIER, seul, fond BLANC UNI, rien
d'autre, format portrait 1000 x 1400.
```

Ce n° 1 sert AUSSI à la case du milieu du hub : je le découpe moi-même en buste + ombre (`select_mecha.png`,
`select_mecha_ombre.png`, comme `outils/hub/preparer_selection.py`). Rien d'autre à générer pour le hub.

## 2. Les 6 parties séparées (pour qu'elles explosent une par une) — `assets_inbox/finale/mecha_parties.png`
Joindre : `mecha_complet.png` (n° 1).
```
Redessine le robot de l'image jointe, EXACTEMENT le même (mêmes couleurs, mêmes formes, même style, même angle), mais
DÉMONTÉ en 6 morceaux posés côte à côte sur UNE rangée, bien séparés par du blanc, dans cet ordre de gauche à droite :
tête, torse, bras droit, bras gauche, jambe droite, jambe gauche. Chaque morceau est entier et garde exactement sa
taille relative. Fond BLANC UNI, rien d'autre, format paysage 2400 x 800.
```

## 3. Ton vaisseau — `assets_inbox/finale/vaisseau.png`
Joindre : `assets/sprites/greg/heros_portrait.png` (ton visage) + `mecha_complet.png` (pour le style).
```
Petit vaisseau spatial de shoot'em up rétro, rouge et blanc, rapide et rond, piloté par le personnage de l'image 1 dont
on voit la tête dans le cockpit vitré, air déterminé. Même style de dessin que l'image 2 (BD, traits noirs épais,
couleurs franches). Vu de DESSUS en légère perspective, nez tourné vers la DROITE. Vaisseau seul, fond BLANC UNI, rien
d'autre, format paysage 900 x 600.
```

## 4. (Facultatif) Les 6 potes sonnés en tas — `assets_inbox/finale/tas_bracass.png`
Joindre : les 6 `select_<boss>.png`.
```
Les 6 personnages des images jointes, effondrés les uns sur les autres en un tas comique après une explosion :
vêtements roussis, cheveux ébouriffés de fumée, petites étoiles et oiseaux qui tournent au-dessus des têtes, sourires
un peu sonnés. Même style de dessin que les images jointes. Groupe entier, fond BLANC UNI, rien d'autre, format paysage
1600 x 1000.
```

## 5. (Facultatif) Le décor — `assets_inbox/finale/fond_espace.jpg`
Joindre : rien.
```
Décor de shoot'em up années 90 vu de dessus : ciel au-dessus d'une ville la nuit avec néons, un peu de brume, étoiles,
couleurs violet et bleu nuit. SANS personnage ni vaisseau ni texte. Image qui peut se répéter à l'horizontale (le bord
gauche raccorde avec le bord droit), format panoramique 2400 x 540.
```
