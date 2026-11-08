# Greg — prompts d'images (proposés par l'audit fun / animation)

> **Reçues et branchées (nov. 2026)** : greg_garde_basse, greg_nargue (nouvelle), greg_crochet (refait), greg_ko_debout,
> greg_victoire, greg_arme. **Restent** : greg_releve (nouveau prompt plus simple en fin de fichier), poses du héros,
> portrait / visage / case K.O. / trophée / arbitre.

Pour chaque image : JOINDRE `assets/sprites/greg/heros_garde.png` (pour garder le même boxeur et le même style).
Fond blanc uni (il sera retiré ensuite), personnage entier visible, rien qui touche les bords.
Ranger les fichiers dans `assets_inbox/` ; ils seront détourés puis mis dans `assets/sprites/greg/`.

## heros_esquive.png (priorité 1)
```
Same boxer as the attached image, same manga style, same colors, same outfit and gloves, seen FROM BEHIND
(back to the viewer), upper body and legs visible. He is slipping a punch: torso leaning strongly to the LEFT,
head low and to the left, knees bent, both gloves up near his face. Dynamic pose, small speed lines optional.
Plain pure white background, full figure, nothing touching the edges, no text.
```

## heros_bloque.png (priorité 1)
```
Same boxer as the attached image, same manga style, colors and outfit, seen FROM BEHIND (back to the viewer).
Tight defensive guard: both gloves pressed together in front of his face, elbows tucked against the ribs,
shoulders hunched, slightly crouched, bracing for impact. Plain pure white background, full figure, no text.
```

## heros_corps.png
```
Same boxer as the attached image, same manga style, colors and outfit, seen FROM BEHIND (back to the viewer).
Throwing a powerful hook to the opponent's body: crouched low, torso twisted, right glove driving forward and
upward at stomach height, left glove guarding the chin. Plain pure white background, full figure, no text.
```

## heros_victoire.png
```
Same boxer as the attached image, same manga style, colors and outfit, seen FROM BEHIND (back to the viewer).
Victory pose: right fist raised high to the sky, left glove down, head tilted up, chest proud, sweaty and
slightly battered. Plain pure white background, full figure, no text.
```

## heros_coin.png (écran du coin, entre les rounds)
```
Same boxer as the attached image, same manga style, colors and outfit, seen FROM BEHIND, sitting on a small
boxing corner stool, exhausted, shoulders down, towel around the neck, gloves resting on the knees.
Plain pure white background, full figure with the stool, no text.
```

## greg_arbitre.png (compte au tapis)
```
A boxing referee in manga style (same style as the attached image), white shirt, black bow tie, black pants,
seen from the front, full body, one arm stretched forward counting with fingers raised, mouth open shouting the
count, serious face. Plain pure white background, full figure, nothing touching the edges, no text.
```

---
# REFONTE de Greg (nouvelle tête) — à faire DANS CET ORDRE

## Étape 0 : greg_tatouages.png (les tatouages seuls, pour les garder identiques partout)
Tatouages ORIGINAUX dans l'esprit manga « guerriers » (pas de personnages existants).
```
Tattoo flash sheet, black ink with bold color fills, anime / shonen manga style, plain pure white background,
three separate original tattoo designs side by side, no text:
1. (for the upper right arm) a huge muscular berserker warrior screaming with rage, wild spiky hair,
   bursting out of broken iron chains, surrounded by a raging orange and gold fire aura
2. (for the right forearm, below the first) a lone young swordsman seen from three-quarter, hooded cloak
   flowing in the wind, katana on his back, determined eyes, ruined futuristic city behind him at sunset
3. (for the left arm) a primal martial artist in a fighting stance, crimson tiger stripes painted on his body,
   a roaring tiger spirit coiling around him, blue lightning sparks
```

## Étape 1 : greg_reference.png (fiche du personnage) — version détaillée « boxeur de manga de boxe années 90 »
Joindre DANS CET ORDRE : ① la photo de la tête de Greg, ②③④⑤ les 4 tatouages
(bras droit haut, avant-bras droit, bras gauche haut, avant-bras gauche). Plus besoin de joindre greg_entier.png.
Couleurs de la tenue : à changer dans le prompt si tu veux (ici rouge et or).
```
Highly detailed character reference sheet of a professional boxer, drawn in classic 1990s Japanese boxing manga
style: realistic anatomy, bold confident ink lines, dense cross-hatching in the shadows, dramatic cel shading,
gritty and powerful, very cool and charismatic, not cartoony, not chibi.

FACE: use the face from attached image 1 (a real photo) and keep the likeness: warm tan skin, voluminous dark
curly hair on top with a high skin fade on the sides, thick dark eyebrows, deep-set dark brown eyes, strong nose,
full thick well-groomed dark beard and mustache. Redraw it as a tough, charismatic manga boxer: sharp intense
eyes, strong jaw, slight confident smirk.

BODY: middleweight build, lean and very muscular, broad shoulders, thick neck, defined chest and six-pack abs,
visible veins on the forearms, a little sweat shine on the skin.

TATTOOS: tattoos from attached images 2 to 5, redrawn as detailed ink tattoos with color fills on the skin:
image 2 on the upper RIGHT arm, image 3 on the RIGHT forearm just below it, image 4 on the upper LEFT arm,
image 5 on the LEFT forearm just below it. Clearly visible and identical in every view.

OUTFIT: glossy red satin boxing trunks with a wide gold waistband and gold trim, white hand wraps showing at the
wrists, shiny red leather boxing gloves with white laces and a visible stitching, red and white high-top boxing
boots with white socks, a mouthguard optional.

LAYOUT: the same character 3 times side by side, full body, same scale, feet on the same ground line:
front view, three-quarter view, back view. Neutral boxing stance, gloves at chest height.
Plain pure white background, no text, no logo, nothing touching the edges.
```

## Étape 1 bis : ajouter les tatouages UN PAR UN (si l'étape 1 les rate)
1. Relancer l'étape 1 SANS les tatouages : joindre seulement la photo, et supprimer tout le paragraphe « TATTOOS: ».
   → `greg_reference.png` (sans tatouage).
2. Puis 4 passes de retouche, une par tatouage. À chaque passe, joindre ① la DERNIÈRE image obtenue,
   ② le tatouage. Garder l'image de chaque passe (`greg_ref_t1.png`, `_t2`, `_t3`, `_t4`) ; la dernière
   devient `greg_reference.png`. Si une passe abîme le visage : la relancer depuis l'image précédente.

Passe 1 — bras droit, haut → `greg_ref_t1.png`
```
Edit the attached image 1: keep EVERYTHING exactly the same (face, body, pose, outfit, colors, style, layout,
background, any tattoo already there). Only ADD one tattoo: the design from attached image 2, redrawn as a
detailed ink tattoo with color fills, wrapping naturally around the upper arm (shoulder to elbow) that is on the LEFT side of the image in the front view (= the character's own right arm; in the back view it is the arm on the RIGHT side of the image), following the muscles and
the skin shading. Show it on every view where that arm is visible (front, three-quarter and back views). Do not add anything else.
```
Passe 2 — avant-bras droit → `greg_ref_t2.png`
```
Edit the attached image 1: keep EVERYTHING exactly the same (face, body, pose, outfit, colors, style, layout,
background, any tattoo already there). Only ADD one tattoo: the design from attached image 2, redrawn as a
detailed ink tattoo with color fills, wrapping naturally around the forearm (elbow to wrist) that is on the LEFT side of the image in the front view, just below the tattoo already on that arm (in the back view: the arm on the RIGHT side of the image), following the muscles and
the skin shading. Show it on every view where that arm is visible (front, three-quarter and back views). Do not add anything else.
```
Passe 3 — bras gauche, haut → `greg_ref_t3.png`
```
Edit the attached image 1: keep EVERYTHING exactly the same (face, body, pose, outfit, colors, style, layout,
background, any tattoo already there). Only ADD one tattoo: the design from attached image 2, redrawn as a
detailed ink tattoo with color fills, wrapping naturally around the upper arm (shoulder to elbow) that is on the RIGHT side of the image in the front view, the arm WITHOUT tattoos (= the character's own left arm; in the back view it is the arm on the LEFT side of the image), following the muscles and
the skin shading. Show it on every view where that arm is visible (front, three-quarter and back views). Do not add anything else.
```
Passe 4 — avant-bras gauche → `greg_ref_t4.png` (= `greg_reference.png`)
```
Edit the attached image 1: keep EVERYTHING exactly the same (face, body, pose, outfit, colors, style, layout,
background, any tattoo already there). Only ADD one tattoo: the design from attached image 2, redrawn as a
detailed ink tattoo with color fills, wrapping naturally around the forearm (elbow to wrist) that is on the RIGHT side of the image in the front view, just below the tattoo already on that arm (in the back view: the arm on the LEFT side of the image), following the muscles and
the skin shading. Show it on every view where that arm is visible (front, three-quarter and back views). Do not add anything else.
```

## Étape 2 (NOUVELLE) : une pose par prompt, d'après `greg_reference_face.jpg`
Image de référence validée par Fabien : `assets_inbox/greg_reference_face.jpg` (Greg de face, tatouages).
Pour CHAQUE pose : joindre `greg_reference_face.jpg`, coller le prompt commun puis la ligne POSE.
Si un tatouage change de bras : retoucher avec « Fix the tattoos: they must be exactly where they are in the
reference image, nothing else changes » en joignant la pose + la référence.

Prompt commun :
```
Use the attached image as the exact character reference: same face, curly hair, beard, skin tone, muscular body,
same arm tattoos (each tattoo stays on the SAME arm and at the same place as in the reference), same red satin trunks
with gold belt, red gloves with white wraps, red boots, same detailed 1990s boxing manga drawing style.
Draw him FULL BODY, seen from the FRONT facing the viewer, same scale as the reference.
FRAMING (very important): the WHOLE character must be inside the image, never cropped: top of the hair, both
gloves (even a glove punching toward the viewer or stretched out to the side), both arms, both feet and boots.
Zoom out: the character is centered and small enough to leave a wide empty white margin on ALL four sides
(at least 15% of the image width on the left and right). Plain pure white background, no text, no floor shadow.
POSE: <ligne POSE ci-dessous>
```

- **greg_garde_pied.png** — garde haute (pose de base du combat)
  `classic high guard boxing stance, both gloves up protecting the face, elbows tucked, knees slightly bent, eyes focused over the gloves.`
- **greg_garde_basse_pied.png** — garde basse (visage ouvert)
  `low guard, both gloves at stomach level protecting the body, face open, chin up, cocky confident smile.`
- **greg_arme.png** — il arme son coup (NOUVEAU)
  `winding up a punch: torso turned, one glove pulled far back near his shoulder, the other glove forward, weight on the back leg, eyes locked on the viewer.`
- **greg_pied_jab.png** — jab
  `throwing a straight jab directly at the viewer, the punching glove huge in the foreground (strong foreshortening), other glove guarding the chin, motion lines.`
- **greg_pied_crochet.png** — crochet
  `throwing a wide hook toward the viewer from the side, torso strongly twisted, the punching arm bent at 90 degrees, motion lines.`
- **greg_corps_pied.png** — coup au corps
  `crouched low, driving an uppercut to the viewer's stomach from below, torso leaning forward, other glove guarding the chin.`
- **greg_smash.png** — SMASH (coup final)
  `huge overhand SMASH punch toward the viewer, whole body committed, furious shouting face, glove in the foreground, strong motion lines and wind.`
- **greg_tape_gants.png** — tape ses gants avant le SMASH (NOUVEAU)
  `banging his two gloves together in front of his chest, angry focused face, small impact sparks between the gloves.`
- **greg_touche_pied.png** — touché au visage
  `just got punched in the face: head snapped to the side, sweat drops and spit flying, one eye shut, body knocked off balance.`
- **greg_etourdi.png** — étourdi / essoufflé
  `stunned and exhausted: wobbly knees, gloves dropping, mouth open, unfocused eyes, heavy sweat, shoulders down.`
- **greg_nargue.png** — il nargue (NOUVEAU)
  `taunting the viewer: gloves dropped low, chin stuck out, provoking grin, one glove waving "come on".`
- **greg_ko_debout.png** — il tombe K.O.
  `falling backward knocked out, body tilted back about 20 degrees, eyes blank, arms limp, feet leaving the ground slightly.`
- **greg_releve.png** — il se relève (NOUVEAU)
  `getting up from one knee, one glove on the floor, shaking his head, determined angry face.`
- **greg_pied_victoire.png** — victoire
  `victory pose, both fists raised high, shouting proudly, chest out.`

(L'ancienne étape 2 par planches reste ci-dessous, en secours.)

## Étape 2 : greg_planche_A.png et greg_planche_B.png (toutes les poses, même échelle)
Joindre : `greg_reference.png` (étape 1). Générer les poses PAR PLANCHES (pas une par une) pour qu'elles restent
cohérentes. Chaque pose = corps ENTIER, vu de FACE (il regarde le joueur), pieds sur la même ligne.
Planche A :
```
Same boxer as the attached reference sheet (same head, face, body, colors, manga style, SAME arm tattoos at the same
places: right upper arm, right forearm, left upper arm, left forearm). One sprite sheet,
plain pure white background, 2 rows x 4 columns, each pose full body seen from the FRONT facing the viewer,
all poses at the exact same scale with feet on the same ground line, generous white space between poses, no text:
1. high guard, both gloves up protecting the face, light bounce stance
2. low guard, gloves at stomach level, face open, cocky smile
3. winding up a punch: torso turned, right glove pulled back near the shoulder, eyes locked on the viewer
4. right jab thrown straight at the viewer, glove big in the foreground (foreshortening)
5. left hook swinging toward the viewer from the side, torso twisted
6. crouched low, winding up a body blow, left glove pulled back at hip level
7. body uppercut thrown at the viewer's stomach, rising from below
8. SMASH: huge overhand punch at the viewer, whole body committed, furious face, motion lines
```
Planche B :
```
Same boxer as the attached reference sheet (same head, face, body, colors, manga style, SAME arm tattoos at the same
places: right upper arm, right forearm, left upper arm, left forearm). One sprite sheet,
plain pure white background, 2 rows x 4 columns, each pose full body seen from the FRONT, same scale,
feet on the same ground line, generous white space between poses, no text:
1. getting hit in the face: head snapped back, sweat drops flying, one eye closed
2. stunned: wobbly legs, crossed eyes, gloves dropping, mouth open
3. out of breath: bent forward, hands on knees area, heavy breathing, sweating
4. taunting: gloves low, sticking out chin, provoking grin
5. tapping his gloves together in front of his chest, angry focused face (before a big attack)
6. falling backward knocked out, body tilted, eyes blank
7. getting up from one knee, shaking his head, one glove on the floor
8. victory: both fists raised, shouting, proud
```

---
# PHASE VESTIAIRE (pattes d'ours avec le coach)

## vestiaire_fond.png (décor, format paysage 16:9)
```
Interior of an old boxing gym locker room at night, manga / anime background art style, warm dim lighting,
metal lockers, wooden bench, a heavy bag in the corner, boxing posters on the wall, a door with light coming
through. Seen from eye level, empty center space for characters. Landscape 16:9, no characters, no text.
```

## coach_pattes.png et coach_pattes_frappe.png
Joindre : `assets/sprites/greg/coach_severe.jpg` (pour garder le même coach).
```
Same old boxing coach as the attached image, same manga style. Full body seen from the FRONT facing the viewer,
wearing focus mitts (bear paw pads) on both hands, holding the RIGHT mitt up at face height as a target,
left mitt low, strict focused expression, slightly crouched stance. Plain pure white background, no text.
```
Variante `coach_pattes_frappe.png` :
```
Same coach, same style, full body from the front, wearing focus mitts, swinging the left mitt toward the
viewer like a punch (testing the student's dodge), shouting. Plain pure white background, no text.
```

## greg_crochet.png — À REFAIRE (V93 : la 1re version était ratée)
Joindre `greg_reference_face.jpg`, prompt commun, puis cette ligne POSE :
```
POSE: throwing a powerful LEFT HOOK at the viewer's head. Seen from the front: his torso rotated, the hooking arm
bent at 90 degrees and horizontal at shoulder height, the glove coming from the LEFT side of the image toward
the center, elbow up, fist turned, the other glove tight against his chin, chin tucked, eyes locked on the viewer,
knees bent, weight on the front foot. Only a few short curved motion lines behind the glove, the arm and glove
must be clearly drawn and not blurred. The belt has a plain gold buckle with NO text.
```

---

## AUDIT NOVEMBRE 2026 — 8 nouveaux prompts (voir `propositions/greg_audit.md`, section 4)

Correction : pour `greg_arbitre.png`, joindre `assets/sprites/greg/coach_severe.jpg` (le prompt dit « same style as the attached image »).
Le n°1 remplace la ligne `greg_garde_basse_pied` de l’Étape 2 ; le n°2 remplace la provocation actuelle.

l'Étape 2 : il faut qu'elle soit très différente de la provocation). Joindre `assets_inbox/greg_reference_face.jpg`,
coller le Prompt commun de l'Étape 2, puis :
```
POSE: low boxing guard protecting the BODY: both gloves held tight in front of his stomach and ribs, elbows glued to
his sides, slightly crouched, knees bent, weight forward, face fully open and unprotected, chin up, serious focused
eyes (NOT smiling). The gloves must clearly cover the abs. The belt has a plain gold buckle with NO text.
```

**2. `assets_inbox/greg_v2/greg_nargue.jpg`** — provocation (REMPLACE l'actuelle, trop proche de `greg_entier`).
Joindre `assets_inbox/greg_reference_face.jpg`, Prompt commun de l'Étape 2, puis :
```
POSE: arrogant taunt: both arms dropped completely, gloves hanging at his thighs, torso leaning back, chin pushed
forward, tongue slightly out and a mocking wide grin, one eyebrow raised, head tilted, his stomach fully exposed.
Clearly different from a neutral standing pose. The belt has a plain gold buckle with NO text.
```

**3. `assets_inbox/greg_v2/greg_portrait.jpg`** — présentation (remplace `greg_portrait.jpg`, format vertical 9:16).
Joindre `assets_inbox/greg_reference_face.jpg` (le personnage) ET `assets/sprites/greg/greg_portrait.jpg` (la mise en page).
```
Use the first attached image as the exact character reference (same face, short curly hair, beard, skin tone, body,
same arm tattoos on the same arms, red satin trunks with gold belt, red gloves with white wraps). Use the second
attached image ONLY for the composition and mood: dramatic 1990s boxing manga splash page, vertical 9:16, the boxer
standing in the ring facing the viewer, from the knees up, fists lowered and clenched, intense stare, sweat drops,
steam from his shoulders, stadium lights behind him, blurred crowd, strong speed lines. No readable text, no logo,
no letters on the belt.
```

**4. `assets_inbox/greg_v2/greg_visage.jpg`** — gros plan du bandeau et de l'annonce du SMASH (remplace `greg_visage.jpg`,
format paysage environ 300×260). Joindre `assets_inbox/greg_reference_face.jpg`.
```
Same character as the attached image (same face, short curly hair, beard, skin tone), close-up of the head and
shoulders, facing the viewer, furious shouting face, veins on the forehead, sweat, one red glove raised next to his
cheek, 1990s boxing manga style, dark dramatic background with red speed lines. Head centered and fully visible,
nothing cropped above the hair. No text.
```

**5. `assets_inbox/greg_v2/greg_ko.jpg`** — case manga du K.O. (remplace `greg_ko.png`, format portrait 4:5).
Joindre `assets_inbox/greg_reference_face.jpg`.
```
Same character as the attached image (same face, short curly hair, beard, tattoos on the same arms, red trunks with
gold belt, red gloves, red boots), knocked out lying flat on his back on a blue boxing ring canvas, seen from above,
arms spread, eyes rolled back, mouth open, mouthguard flying out, sweat splashes around him, 1990s boxing manga
style with heavy ink. Whole body visible, plain pure white background around the canvas area, no text.
```

**6. `assets/sprites/greg/greg_trophee.png`** — trophée de l'écran de victoire (aujourd'hui dessiné au code).
Joindre `assets/sprites/greg/heros_garde.png` (pour le style de dessin).
```
A shiny golden boxing championship trophy in 1990s manga style (same drawing style as the attached image): a golden
cup on a black marble base, a small pair of golden boxing gloves on top, a red ribbon around the handles, sparkles,
front view, centered. Plain pure white background, nothing touching the edges, no text, no engraving.
```

**7. `assets/sprites/greg/heros_portrait.png`** — ton boxeur dans le bandeau (aujourd'hui petit dessin pixel).
Joindre `assets/sprites/greg/heros_garde.png`.
```
Same young boxer as the attached image (same spiky brown hair, same green boxing gloves, same manga style), but seen
from the FRONT this time: head and shoulders portrait, determined smile, a small bandage on the cheek, one green
glove raised next to his face. Square image, head centered, plain pure white background, no text.
```

**8. `assets/sprites/greg/heros_dempsey.png`** — Dempsey Roll (aujourd'hui = image du coup penchée). Une seule image,
retournée par le jeu pour l'autre côté. Joindre `assets/sprites/greg/heros_garde.png`.
```
Same boxer as the attached image, same manga style, colors and outfit, seen FROM BEHIND (back to the viewer).
Performing the Dempsey Roll: body crouched very low and swinging to the RIGHT in a figure-eight weave, torso bent
sideways, right glove launching a hook upward, left glove tucked at the chin, speed lines and motion blur following
the weave, explosive power. Plain pure white background, full figure, nothing touching the edges, no text.
```



## greg_releve.jpg — NOUVEAU PROMPT (le 1er ne marchait pas : « à genoux » + corps entier est trop dur)
Joindre `assets_inbox/greg_reference_face.jpg`, coller le Prompt commun de l'Étape 2, puis :
```
POSE: standing up again after a knockdown, still standing on both feet but bent forward, both gloves pressed on his
knees to push himself up, head raised toward the viewer, one eye half closed, sweat dripping, gritted teeth, angry and
determined. Both feet flat on the ground. The belt has a plain gold buckle with NO text.
```
