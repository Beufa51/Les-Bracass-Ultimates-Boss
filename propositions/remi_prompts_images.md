# Rémi — prompts d'images (à copier dans Gemini)

Tout est dessiné au code pour l'instant (`src/bosses/remi/dessins.js`). Dépose les images reçues dans
`assets_inbox/remi/` avec le nom indiqué : je les découpe / détoure et je les branche.

Style commun à mettre dans chaque prompt : **manga / anime coloré, contours noirs nets, fond BLANC uni** (pour le détourage).

## 1. Présentation de Rémi — `remi_presentation.jpg` ✅ REÇUE ET INTÉGRÉE
À joindre : **une ou deux photos de Rémi** (visage bien visible).
```
Dessine la personne de la photo jointe en style manga/anime coloré, contours noirs nets, NON caricatural (on doit le reconnaître).
Buste coupé aux hanches, de 3/4 face, sourire chambreur, une pinte de bière levée dans une main, l'autre poing serré.
Tenue de sortie au bar (tee-shirt orange ou chemise ouverte, casquette noire). Fond blanc uni, aucun texte, image verticale.
```

## 2. Toi à vélo, de profil — `remi_velo_planche.jpg` ✅ REÇUE ET INTÉGRÉE
À joindre : rien (ou ta photo si tu veux être reconnaissable).
```
Planche de sprites style manga/anime coloré, contours noirs nets, fond blanc uni. Un jeune homme à vélo de ville vu
STRICTEMENT DE PROFIL, tourné vers la DROITE, tee-shirt bleu, jean. 6 poses alignées sur une ligne, même taille, même échelle :
1-4 : il pédale (4 positions du pédalier, un tour complet), 5 : saut (bunny hop, les deux roues en l'air, vélo légèrement cabré),
6 : chute (il passe par-dessus le guidon). Pas d'ombre au sol, pas de décor, aucun texte, cases bien séparées.
```

## 3. Les bourrés — `remi_bourres_planche.jpg` ✅ REÇUE ET INTÉGRÉE
```
Planche de sprites style manga/anime coloré et drôle, contours noirs nets, fond blanc uni. Des fêtards ivres la nuit, entiers, de profil
ou de 3/4, même échelle, sur une ligne : 1 : debout qui titube, bouteille à la main, nez rouge ; 2 : le même qui sursaute et s'écarte
(bras levés, surpris) ; 3 : un autre couché par terre sur le dos qui dort (« Zzz »), bouteille à côté ; 4 : un troisième qui traverse en
zigzag, vu de FACE, bras écartés ; 5 : un groupe de 3 copains bras dessus bras dessous qui chantent. Pas d'ombre, aucun texte.
```

## 4. La rue de nuit (fond qui défile) — `remi_rue.jpg` ✅ REÇUE ET INTÉGRÉE
```
Décor de jeu vidéo en défilement horizontal, style manga/anime, rue d'une petite ville française LA NUIT, vue de PROFIL (de côté) :
façades d'immeubles avec fenêtres éclairées, bars et kebabs fermés, lampadaires orangés, trottoir au premier plan, ciel nuit avec lune.
Image très large (format 3:1), les bords gauche et droit doivent pouvoir se raccorder (répétable), aucun personnage, aucun texte lisible.
```

## 5. La façade du bar (arrivée) — `remi_bar_facade.jpg` ✅ REÇUE ET INTÉGRÉE
```
Façade d'un bar de quartier la nuit, style manga/anime, vue de face : enseigne néon rose « BAR », vitrines chaudes et éclairées,
porte en bois, quelques tables hautes en terrasse. Aucun personnage. Fond = la rue de nuit. Image horizontale.
```

## 6. Le beer pong : Rémi en face — `remi_pong_planche.jpg` ✅ REÇUE ET INTÉGRÉE
À joindre : les photos de Rémi (et l'image `remi_presentation.jpg` une fois faite, pour garder le même style).
```
Même personnage que l'image jointe, style manga/anime, contours noirs nets, fond blanc uni. Vu DE FACE, coupé à la taille
(il est derrière une table), 4 poses sur une ligne, même échelle : 1 : il attend en souriant, 2 : il lance une balle de ping-pong
(bras levé), 3 : il boit un gobelet rouge (il a perdu un verre), 4 : il nargue (index pointé, grand sourire). Aucun texte.
```

## 7. La porte : Rémi et toi de profil — `remi_porte_planche.jpg` ✅ REÇUE ET INTÉGRÉE
À joindre : les photos de Rémi.
```
Style manga/anime, contours noirs nets, fond blanc uni. Deux personnages entiers vus DE PROFIL tournés vers la DROITE, même échelle.
Ligne 1 : le personnage de la photo jointe (casquette noire, tee-shirt orange) : en garde, bras armé en arrière (élan), coup de poing
bras tendu (frappe, traits de vitesse). Ligne 2 : un jeune homme en tee-shirt bleu, mêmes 3 poses. Aucun texte, cases bien séparées.
```

## 8. Les toilettes du bar (fond de la porte) — `remi_porte_decor.jpg` ✅ REÇUE ET INTÉGRÉE
```
Décor de jeu style manga/anime : couloir des toilettes d'un bar, vu de côté, carrelage, néon blafard, une porte de WC en bois
à DROITE de l'image (bien visible, de face, pictogramme WC), murs couverts d'autocollants. Aucun personnage, image horizontale 16:9.
```

## 9. La porte vue DE DOS (audit V3, amélioration C1) ✅ REÇUES ET INTÉGRÉES
Prompts dans `propositions/remi_audit.md`, section 5 : `remi_porte_dos_planche.jpg` (Rémi de dos) et
`remi_toi_dos_planche.jpg` (toi de dos).

## 10. L'intérieur du bar (fond du beer pong, derrière Rémi) — `remi_bar_interieur.jpg` ✅ REÇUE ET INTÉGRÉE
À joindre : la façade du bar (`remi_bar_facade.jpg`) pour garder le style.
```
Même style que l'image jointe (manga/anime, contours nets, couleurs chaudes). Intérieur d'un bar de quartier la nuit, vu DE FACE,
cadré à hauteur de poitrine : le comptoir en bois au fond avec des étagères pleines de bouteilles éclairées, des tireuses à bière,
un néon rose « BAR » et un néon bleu « BEER PONG » au mur, guirlandes lumineuses, quelques silhouettes floues de clients sur
les côtés. Le CENTRE de l'image reste dégagé (un personnage s'y tiendra). Aucun texte lisible à part les néons. Image 16:9.
```

## 11. Les quais de nuit (2e quartier du vélo) — `remi_rue2.jpg` ✅ REÇUE ET INTÉGRÉE
À joindre : la rue de nuit (`remi_rue.jpg`) pour garder le style.
```
Même style et même cadrage que l'image jointe (décor de jeu en défilement horizontal, vue STRICTEMENT DE PROFIL, la nuit) :
les quais d'une rivière en ville, parapet en pierre, réverbères, péniches amarrées, la rivière et des reflets de lumières,
des immeubles sur l'autre rive au loin, ciel nuit avec lune. Le bas de l'image s'arrête au niveau du quai (pas de route).
Image très large (format 3:1), bords gauche et droit raccordables. Aucun personnage, aucun texte.
```

## 12. Le centre-ville animé (3e quartier du vélo) — `remi_rue3.jpg` ✅ REÇUE ET INTÉGRÉE
```
Même style et même cadrage que l'image jointe (défilement horizontal, vue de profil, la nuit) : une rue piétonne animée du
centre-ville, terrasses de bars éclairées, guirlandes lumineuses au-dessus de la rue, enseignes néon (sans texte lisible),
façades colorées. Le bas de l'image s'arrête au pied des façades. Image très large (3:1), bords raccordables, aucun personnage.
```

## 13. Rémi qui t'attend devant le bar (fin du vélo) — `remi_accueil.png` (détendu, PAS en garde) ✅ REÇUE ET INTÉGRÉE
À joindre : l'image de présentation de Rémi.
```
Même personnage que l'image jointe (casquette noire à l'envers, barbe, veste en jean, tee-shirt orange, jean, baskets), même style
manga/anime, contours noirs nets, fond BLANC uni, aucun texte. Vu de 3/4 face, EN PIED (des chaussures à la casquette),
détendu et souriant : il lève une pinte de bière d'une main et fait un grand signe « viens ! » de l'autre. Une seule pose, centrée.
```

## 14. Les voitures garées du vélo — `remi_voitures_planche.jpg` ✅ REÇUE ET INTÉGRÉE
```
Planche de sprites style manga/anime, contours noirs nets, fond BLANC uni, aucun texte. 3 petites voitures de ville garées,
vues STRICTEMENT DE PROFIL, toutes tournées vers la DROITE, même échelle et même hauteur, alignées sur une ligne et bien espacées :
une citadine rouge, une berline bleue, une petite camionnette jaune. Toit plat bien visible (on roule dessus à vélo). Pas d'ombre au sol.
```

## 15. Le tremplin du vélo — `remi_tremplin.png` ✅ REÇUE ET INTÉGRÉE
```
Style manga/anime, contours noirs nets, fond BLANC uni, aucun texte. Vu STRICTEMENT DE PROFIL : un tremplin de fortune fait d'une
planche de bois posée en pente (montant vers la DROITE) sur une pile de caisses de bière en plastique jaune. Une seule image, centrée.
```

## 16. Le videur (refonte de la porte) — `remi_videur_planche.jpg` ✅ REÇUE ET INTÉGRÉE
```
Style manga/anime coloré, contours noirs nets, fond BLANC uni, aucun texte, aucun cadre. Un videur de bar costaud, crâne rasé,
tee-shirt noir moulant avec « SECURITY » illisible, oreillette, bras énormes. 2 poses côte à côte, même échelle, bien espacées,
vu de face et coupé à la taille, comme s'il passait la tête et une épaule au coin d'un mur (le mur n'est PAS dessiné) :
1 : il jette un coup d'œil distrait sur le côté, en mâchant un chewing-gum ; 2 : il te repère, furieux, il pointe du doigt.
```

## 17. (facultatif) La foule du bar au bout du couloir — `remi_foule_couloir.jpg`
```
Style manga/anime coloré, contours noirs nets, fond BLANC uni, aucun texte. Un petit groupe de 6 clients d'un bar, vus de face,
coupés à la taille, serrés les uns contre les autres, qui crient et lèvent leurs verres (encouragements), une seule image large.
```

## 18. Le gars qui vient pisser (porte) — `remi_pisseur_planche.jpg` ✅ REÇUE ET INTÉGRÉE
À joindre : la planche du videur (pour le même style et le même cadrage).
```
Même style et même cadrage que l'image jointe (manga/anime, contours noirs nets, fond BLANC uni, aucun texte, coupé à la taille,
comme s'il passait la tête et une épaule au coin d'un mur). Un jeune fêtard éméché, chemise à fleurs ouverte, joues rouges,
il se tient l'entrejambe (il a très envie). 2 poses côte à côte, même échelle, bien espacées : 1 : il jette un œil vague en
se dandinant ; 2 : il te voit et sursaute, scandalisé, il pointe du doigt.
```

## 19. La mamie (porte) — `remi_mamie_planche.jpg` ✅ REÇUE ET INTÉGRÉE
À joindre : la planche du videur.
```
Même style et même cadrage que l'image jointe (manga/anime, contours noirs nets, fond BLANC uni, aucun texte, coupée à la taille,
comme si elle passait la tête au coin d'un mur). Une petite mamie à chignon gris, grosses lunettes, gilet violet, sac à main,
canne. 2 poses côte à côte, même échelle, bien espacées : 1 : elle regarde, curieuse, en plissant les yeux ;
2 : elle te voit, furieuse, elle lève sa canne d'un air menaçant.
```

## 20. Les petits obstacles du vélo — `remi_obstacles_planche.jpg`
À joindre : la planche des bourrés (pour garder le style).
```
Même style que l'image jointe (manga/anime, contours noirs nets), fond BLANC uni, aucun texte. Planche de 4 objets vus
STRICTEMENT DE PROFIL, posés au sol, même échelle, bien espacés sur une ligne : 1 : une grosse poubelle de rue verte à roulettes,
couvercle fermé ; 2 : des tessons de bouteille de bière cassée par terre (verre vert et brun qui brille) ; 3 : une flaque de
bière renversée, mousseuse et dorée, avec un gobelet en plastique couché ; 4 : une pinte de bière dorée avec de la mousse, entourée
d'un petit halo lumineux (un bonus à attraper).
```

## 21. Le pêcheur des quais (vélo) — `remi_pecheur_planche.jpg`
À joindre : la planche des bourrés.
```
Même style que l'image jointe (manga/anime, contours noirs nets), fond BLANC uni, aucun texte. Un vieux pêcheur de nuit, en ciré
jaune, bonnet, bottes, une canne à pêche à la main, entier, vu de profil tourné vers la GAUCHE. 2 poses côte à côte, même échelle,
bien espacées : 1 : il pêche tranquillement, sa longue canne tendue horizontalement vers la gauche (elle barre le passage) ;
2 : il sursaute (sonnette !) et relève sa canne vers le ciel.
```

## 22. La chorale de fêtards (vélo, centre-ville) — `remi_chorale_planche.jpg`
À joindre : la planche des bourrés.
```
Même style que l'image jointe (manga/anime, contours noirs nets, drôle), fond BLANC uni, aucun texte. 3 fêtards éméchés bras dessus
bras dessous, entiers, vus de face, qui chantent à tue-tête (bouches grandes ouvertes, notes de musique), une pinte à la main.
2 poses côte à côte, même échelle, bien espacées : 1 : ils chantent en se balançant ; 2 : ils sursautent ensemble et s'écartent
(sonnette !), surpris.
```
