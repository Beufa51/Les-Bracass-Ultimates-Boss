# Beufa — prompts des décors (remplacements + nouveaux éléments)

Règle n°1 du jeu : il est vu **du dessus**. Tout objet dessiné de face (on voit ses pieds, ses roues de côté,
sa façade) casse l'illusion. Chaque prompt commence donc par le même BLOC DE STYLE : colle-le tel quel,
puis ajoute la ligne « Object: … » de l'élément voulu.

À la livraison : déposer le JPG dans `assets/sprites/beufa/` avec le nom indiqué, lancer
`python3 outils/beufa_alleger.py`, et (pour un NOUVEL élément) demander à Claude de le brancher
(manifeste + position dans `reglages.js`).

## BLOC DE STYLE (à mettre au début de chaque prompt)
Pixel art game asset, 16-bit SNES style like the original Metal Gear (1990), strict TOP-DOWN view: the camera
is directly above, looking straight down — we only see the TOP of the object, no front face, no side, no legs,
no wheels seen from the side, no perspective. Single object, centered, filling the image, pure white
background, no cast shadow, no text, no grid, no border. Muted military night palette: olive drab, khaki,
gunmetal grey, dark steel blue, rust; 3-4 shades per color with dithering, dark 1-pixel outline.

---

## A. À REMPLACER (déjà dans le jeu, mais vus de face ou de côté)

### Camion — `beufa_camion.jpg` (en jeu 176×72, horizontal, cabine à DROITE)
Object: a military cargo truck seen from directly above, pointing to the RIGHT. Left two thirds: the olive canvas
tarp roof of the cargo bed with its metal hoops showing as ridges across it. Right third: the cab roof, the hood,
the two side mirrors sticking out. The wheels only peek out slightly under the sides. Long horizontal image, ratio 5:2.

### Tente — `beufa_tente.jpg` (en jeu 148×96)
Object: a military olive canvas tent seen from directly above: a ridge line running left to right in the middle,
the two roof slopes in two shades of olive (lit top, darker bottom), tension ropes going out to small pegs at each
corner, the entrance flap at the bottom slightly open. Ratio 3:2.

### Table à cartes — `beufa_table.jpg` (en jeu 140×90)
Object: a wooden command table seen from directly above (only the tabletop, no legs): a large tactical map of a
military base with blue arrows and a red target, a few papers, a compass, a radio and a mug placed on it. Ratio 3:2.

### Projecteur — `beufa_projecteur.jpg` (en jeu 36×36, le jeu le fait tourner vers la pièce)
Object: a searchlight seen from directly above: a round dark steel base, the lamp body pointing to the RIGHT,
its round glass lens glowing pale yellow at the right end. No light beam. Square image.

### Baril — `beufa_baril.jpg` (en jeu 48×48 ; aujourd'hui dessiné par le code)
Object: a steel oil drum seen from directly above: a dark blue-green circle with two concentric rings (rims), the
filler cap and the small vent cap, a few scratches and a yellow-black hazard band on the rim. Square image.

### Râtelier — `beufa_ratelier.jpg` (en jeu 140×52)
Object: a long wooden weapon rack seen from directly above, like a low shelf: a dark wood frame with 5 assault
rifles lying side by side across it, barrels pointing up, plus a small row of ammo magazines at one end.
Long horizontal image, ratio 8:3.

### Caisse — `beufa_caisse.jpg` (en jeu 64×64 ; déjà corrigée, à refaire seulement si tu veux mieux)
Object: ONE olive-drab military supply crate seen from directly above: lid with two metal straps, stencilled
star, a small metal label plate. ONE crate only. Square image.

### Conteneur — `beufa_conteneur.jpg` (rouille) et `beufa_conteneur_olive.jpg` (kaki) (en jeu 140×52)
Object: a shipping container seen from directly above: its corrugated ROOF (ribs running across), corner
castings, the door end on the RIGHT. Color: [rust red] / [olive drab]. Long horizontal image, ratio 8:3.

---

## B. NOUVEAUX ÉLÉMENTS (suggestions de designer)

Deux familles, à ne pas mélanger :
- **Obstacles** (bloquent + cachent) : volumes nets, foncés, contour marqué.
- **Décor au sol** (on marche dessus) : plats, peu contrastés, sans contour noir — sinon l'enfant croit
  que c'est un mur. Ils donnent de la vie sans changer la difficulté.

### Pièce 1 — La cour du portail
- **Guérite du portail** — `beufa_guerite.jpg`, obstacle 64×64.
  Object: a small square sentry box seen from directly above: flat corrugated metal roof, a tiny antenna and a
  red warning light on the roof. Square image.
- **Barrière levante** — `beufa_barriere.jpg`, décor 140×24 (posée près de la porte d'entrée, non bloquante).
  Object: a red-and-white striped boom barrier arm seen from directly above, lying horizontally, with its grey
  counterweight post at the left end. Very long thin horizontal image, ratio 6:1.
- **Pile de palettes** — `beufa_palettes.jpg`, obstacle 64×64.
  Object: a stack of wooden pallets seen from directly above: we see the top pallet's planks, with the edges of
  the pallets below slightly offset. Square image.
- **Flaques** (sol) — `beufa_flaque.jpg`, décor 64×40.
  Object: a dark rain puddle on concrete seen from directly above, reflecting a pale blue night sky, soft
  irregular edges, NO outline. Ratio 3:2.

### Pièce 2 — Le parc à véhicules
- **Pompe à carburant** — `beufa_pompe.jpg`, obstacle 48×48.
  Object: a military fuel pump seen from directly above: a grey metal box with a hose coiled on top and a
  yellow "fuel" stencil square. Square image.
- **Plots de chantier** — `beufa_plot.jpg`, décor 20×20 (balisent la route, non bloquants).
  Object: an orange traffic cone seen from directly above: a square black base, the orange cone as concentric
  circles with a white reflective ring, the small hole at the tip. Square image.
- **Tache d'huile** (sol) — `beufa_huile.jpg`, décor 64×48.
  Object: a black oil stain on concrete seen from directly above, with a faint rainbow sheen, soft edges,
  NO outline. Ratio 4:3.
- **Pneus empilés** — `beufa_pneus.jpg`, obstacle 48×48.
  Object: a stack of 3 black truck tyres seen from directly above: thick black rings with tread pattern, the
  hole in the middle showing the ground. Square image.

### Pièce 3 — L'arsenal
- **Caisses de munitions** — `beufa_munitions.jpg`, obstacle 64×40.
  Object: two small olive ammunition boxes side by side seen from directly above, with carrying handles on
  their lids and yellow stencilled markings. Ratio 3:2.
- **Missile sur chariot** — `beufa_missile.jpg`, obstacle 140×52 (remplace un râtelier pour varier).
  Object: a large grey missile lying on a low yellow transport trolley, seen from directly above, nose pointing
  RIGHT, four tail fins at the left. Long horizontal image, ratio 8:3.
- **Établi** — `beufa_etabli.jpg`, obstacle 140×52.
  Object: a long metal workbench seen from directly above (top only): a vice at one end, tools, a
  disassembled rifle, a lamp. Long horizontal image, ratio 8:3.

### Pièce 4 — Le QG de Beufa
Aujourd'hui l'antichambre, les « rayonnages » et le « classeur » du bureau sont des **conteneurs de port**
posés à l'intérieur d'un bâtiment : c'est l'incohérence la plus visible de la pièce. À remplacer par :
- **Étagère métallique** — `beufa_etagere.jpg`, obstacle 140×52 (remplace les conteneurs du QG ; le jeu la
  tourne pour les rayonnages verticaux).
  Object: a long grey metal storage shelf seen from directly above: we see the top shelf with cardboard boxes,
  folders and a few radios on it. Long horizontal image, ratio 8:3.
- **Bureau du commandant** — `beufa_bureau.jpg`, obstacle 140×80.
  Object: a big dark wooden desk seen from directly above (top only), with a computer screen, a desk lamp,
  papers stamped "TOP SECRET" (no readable text), a coffee mug, and a leather office chair behind it. Ratio 7:4.
- **Consoles radar** — `beufa_console.jpg`, obstacle 96×52.
  Object: a row of military computer consoles seen from directly above: green radar screens glowing, many small
  buttons and switches. Ratio 2:1.
- **Tapis à l'emblème de Beufa** (sol) — `beufa_tapis.jpg`, décor 160×100.
  Object: a dark red carpet lying flat on the floor, seen from directly above, with a gold emblem in the center
  (a bull's head inside a star), gold fringe at both ends, NO outline. Ratio 8:5.
- **Plante en pot** — `beufa_plante.jpg`, obstacle 40×40.
  Object: a potted palm plant seen from directly above: green palm fronds radiating from the center, covering
  most of a round brown pot. Square image.
