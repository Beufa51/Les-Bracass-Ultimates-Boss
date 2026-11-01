# Julien — niveau 1 « la manif » : prompts des images (FPS façon Doom 93)

Tout est vu de FACE, comme dans Doom : les personnages regardent toujours le joueur.
Chaque prompt = le BLOC DE STYLE (collé tel quel) + le texte de l'image voulue.
Livraison : déposer les images dans `assets_inbox/julien/` avec le nom indiqué ; Claude les découpe, enlève le fond et
les branche (elles remplacent les dessins provisoires de `textures.js` et `visage.js`).
Les personnages et objets DOIVENT être bien séparés (gros espace blanc entre chaque pose), sinon le découpage
automatique est impossible : la phrase « IMPORTANT: … SEPARATED … » est dans les blocs de style.
Conseil : une planche à la fois ; si Gemini mélange les cases, demander les poses une par une (même prompt, « single pose: … »).

## BLOC DE STYLE (personnages et objets)
Pixel art game sprite in the style of DOOM (1993) and Wolfenstein 3D: digitized, slightly gritty 90s look,
limited color palette, visible chunky pixels, strong shading. Full body, seen strictly from the FRONT, facing the
viewer, standing on the ground, no perspective tilt. Plain solid pure white background (#FFFFFF), no shadow on the
ground, no text, no frame. Each pose in its own equal-size cell, all characters at exactly the same scale,
feet aligned on the same bottom line. Humorous, cartoonish French street-protest theme, no blood, no gore.
IMPORTANT: every pose is clearly SEPARATED from the others by a wide empty white gap (at least a quarter of a cell wide) on all sides; no part of a character, weapon, shield, sign or effect may touch or overlap another pose or the cell border; nothing sticks out of its own cell.

## 1. Policier lanceur de lacrymos — `julien_policier.png`
French riot police officer in navy blue uniform, dark blue helmet with raised clear visor, black boots, holding a
tear-gas grenade launcher. Sprite sheet of 6 poses in one row:
1) walking, left foot forward; 2) walking, right foot forward; 3) arm raised high above his head holding a smoking
tear-gas grenade (about to throw); 4) arm thrown forward, just released; 5) hit in the face by an egg, flinching,
egg yolk splattered on his visor; 6) seen from the BACK, running away with both arms in the air, uniform covered in
egg yolk.

## 2. CRS au bouclier — `julien_crs.png`
Heavily armored French CRS riot officer, black armor, black helmet with visor, holding a large transparent riot
shield with the word "POLICE" on it. Sprite sheet of 7 poses in one row:
1) walking behind his shield, left foot forward; 2) same, right foot forward; 3) shouting, shield raised (about to
charge); 4) charging forward, shield held in front, leaning forward; 5) out of breath, bent over, hands on his
knees, shield lowered to the side (exhausted); 6) hit by an egg, flinching, egg yolk on his helmet; 7) seen from
the BACK, running away, armor covered in egg yolk.

## 3. Manifestants (décor) — `julien_manifestants.png`
Four different young French protesters (high-school and university students), casual clothes (hoodie, jacket,
scarf), each one holding a handmade cardboard protest sign above the head. Signs read: "NON !", "GRÈVE",
"BAC POUR TOUS", "ON LÂCHE RIEN". Sprite sheet of 4 characters in one row, standing, chanting.
(Exception au bloc de style : ici le texte des pancartes est voulu.)

## 4. Objets — `julien_objets.png`
Sprite sheet of 8 separate objects in one row, same pixel scale:
1) a grey metal French crowd-control barrier ("barrière Vauban"), front view; 2) a green Paris wheelie trash bin,
overflowing; 3) an open cardboard box of six eggs; 4) a baguette sandwich (ham and lettuce); 5) a single white egg;
6) a splattered broken egg (white and yellow splat); 7) a small metal tear-gas canister with a yellow band, smoking;
8) a cloud of white-greenish tear gas (soft puffy shape).

## 5. Main du héros (bas de l'écran) — `julien_main.png`
First-person view (like the weapon in DOOM), seen from the player's eyes: the player's right hand and forearm in a
navy blue hoodie sleeve, coming from the bottom-right of the image. Sprite sheet of 2 poses:
1) the hand holding a white egg, ready to throw; 2) the arm extended forward and up, hand open, the egg just thrown.
Plain pure white background.

## 6. Tête du héros (barre du bas, comme la tête de Doomguy)
Le héros = un étudiant (cheveux bruns en bataille, sweat à capuche bleu marine). À changer si tu veux qu'il te
ressemble (envoie une photo à Gemini avec le prompt).

BLOC DE STYLE TÊTE :
Pixel art portrait in the exact style of the DOOM (1993) status bar face (Doomguy's mugshot): head and shoulders,
seen from the front, digitized gritty 90s pixel art, limited palette. A young French student, messy brown hair,
navy blue hoodie. Plain pure white background. Each face in its own equal-size cell, same scale and same position.
IMPORTANT: every face is clearly SEPARATED from the others by a wide empty white gap; no hair, shoulder or hoodie
may touch another face or the cell border.

### 6a. `julien_tete_regards.png` — 5 rangées × 3 colonnes
Columns: 1) eyes looking to the LEFT; 2) looking straight ahead; 3) eyes looking to the RIGHT.
Rows (more and more beaten up, cartoon style, no blood):
1) fresh and confident; 2) a small bruise on the cheek; 3) + a band-aid on the forehead, messier hair;
4) + a black eye and a split lip, grimacing; 5) exhausted, both eyes swollen, sweating, hair a mess.

### 6b. `julien_tete_expressions.png` — 1 rangée de 5
1) hit, head turned to the LEFT, eyes shut, mouth open in pain ("ouch"); 2) same, head turned to the RIGHT;
3) coughing in tear gas, eyes squinting with tears, slightly green face; 4) big happy grin (just picked up an
item); 5) knocked out, eyes as crosses, tongue out.

## 7. Murs (textures) — carrés, qui se répètent sans couture
BLOC DE STYLE MURS :
Seamless tileable wall texture for a 90s first-person shooter like DOOM and Wolfenstein 3D, perfectly flat and
seen strictly head-on (no perspective, no shadow cast), square image, the left and right edges must connect
seamlessly, gritty pixel art with limited palette. Parisian street theme.

- `julien_mur_briques.png` : red brick building wall with one window.
- `julien_mur_immeuble.png` : cream Haussmann-style stone facade with two tall windows and a small wrought-iron balcony.
- `julien_mur_boutique.png` : small shop front: red sign band on top with the word "TABAC", glass shop window below.
- `julien_mur_tag.png` : grey concrete wall covered with protest graffiti: "GRÈVE" in pink, "NON !" in green, a raised fist.
- `julien_mur_palissade.png` : green wooden construction hoarding with torn posters.
- `julien_mur_lycee.png` : light beige stone wall of a French high school, with one window.
- `julien_portail_lycee.png` : green metal high-school gate (vertical bars) with a blue plaque "LYCÉE" on top,
  the school courtyard visible through the bars.
