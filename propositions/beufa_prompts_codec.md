# Beufa — prompts des portraits CODEC (phase quiz)

Avec chaque prompt : **joindre la photo de Beufa de face** (`assets_inbox/beufa_face.jpg`).
Faire les 6 images dans la MÊME conversation Gemini (pour garder le même visage) : d'abord le n°1 (SOURIANT,
sinon le visage n'est pas naturel), puis les autres dans l'ordre « same character, same framing, only the expression changes ».

Une fois reçues, les déposer dans `assets_inbox/` avec ces noms exacts, et Claude les branche :
`beufa_codec_masque.jpg`, `beufa_codec_calme.jpg`, `beufa_codec_choque.jpg`, `beufa_codec_surpris.jpg`,
`beufa_codec_machiavelique.jpg`, `beufa_codec_souriant.jpg`.

Quand elles s'affichent dans le jeu :
| Image | Moment |
|---|---|
| masque | toute la lecture des pensées (avant le rideau) |
| calme | après le rideau, et pendant chaque question |
| machiavelique | « début du quiz », erreur, temps écoulé, 10 dernières secondes, GAME OVER |
| souriant | 1re bonne réponse d'une série (« pas mal… ») |
| surpris | 2 bonnes réponses d'affilée |
| choque | 3 bonnes réponses d'affilée, et la victoire |

## Bloc de style (commun, déjà inclus dans chaque prompt)
Metal Gear Solid (PS1, 1998) CODEC portrait screen. Square close-up portrait, head and top of the shoulders,
facing the camera, centered. Monochrome phosphor GREEN palette only (dark green-black background, mid greens,
bright mint-green highlights), like a retro game codec screen: NOT realistic, a fun friendly CARTOON caricature in clean 16-bit
pixel art (big readable shapes, simple flat shading, soft lighting, no dark shadows on the eyes, nothing scary,
likable comic look like a Nintendo / Advance Wars character portrait), visible horizontal CRT scanlines, slight screen glow. No text, no frame,
no UI, no logo. 1:1 square image.

## 1. SOURIANT (à faire en premier)
Using the attached photo as the reference, keep EXACTLY the same head as in the photo (stylized as a cartoon, but still clearly him): same face shape and
features, same hair length and haircut, same beard length and shape, same glasses if any. Do not make him younger,
thinner or more muscular, do not change his hair or beard. Draw this man as a Metal Gear Solid (PS1, 1998) CODEC portrait. Square close-up portrait, head and top of the
shoulders, facing the camera, centered. Monochrome phosphor GREEN palette only (dark green-black background, mid
greens, bright mint-green highlights), like a retro game codec screen: NOT realistic, a fun friendly CARTOON caricature in clean 16-bit
pixel art (big readable shapes, simple flat shading, soft lighting, no dark shadows on the eyes, nothing scary,
likable comic look like a Nintendo / Advance Wars character portrait), visible horizontal CRT scanlines, slight screen glow.
Expression: SMILING — a warm, genuine friendly smile showing a little of the teeth, relaxed eyebrows, eyes slightly
squinted by the smile, small smile lines at the corners of the eyes, like a boss who is amused and pleased. He wears the SAME SHIRT as in the photo (same type of shirt and collar), no jacket, no uniform. No text, no frame, no UI, no logo. 1:1 square image.

## 2. CALME
Same character, same framing, same style as the previous image: friendly CARTOON caricature in clean 16-bit pixel art, monochrome phosphor green codec screen, simple flat shading, soft lighting, nothing realistic or scary, CRT scanlines. Keep exactly the same head
(same hair length, same beard length), same shirt as in the photo. Only the expression changes: CALM and confident,
relaxed closed mouth with a tiny confident hint of a smile, calm friendly eyes, the cool look of a boss who controls everything. No text, no frame.
1:1 square image.

## 3. MACHIAVÉLIQUE
Same character, same framing, same style as the previous image: friendly CARTOON caricature in clean 16-bit pixel art, monochrome phosphor green codec screen, simple flat shading, soft lighting, nothing realistic or scary, CRT scanlines. Keep exactly the same head (same hair length, same beard length), same shirt as in
the photo. Only the expression changes: MACHIAVELLIAN — a wide sly smirk on one side of the mouth, eyebrows angled down toward the nose, eyes
narrowed, like a cartoon villain who just set a funny trap, playful not scary.
No text, no frame. 1:1 square image.

## 4. SURPRIS
Same character, same framing, same style as the previous image: friendly CARTOON caricature in clean 16-bit pixel art, monochrome phosphor green codec screen, simple flat shading, soft lighting, nothing realistic or scary, CRT scanlines. Keep exactly the same head (same hair length, same beard length), same shirt as in
the photo. Only the expression changes: SURPRISED —
eyebrows raised high, eyes wide open, mouth slightly open (« oh ? »), head pulled back a little. Surprised but
still in control, not afraid. No text, no frame. 1:1 square image.

## 5. CHOQUÉ
Same character, same framing, same style as the previous image: friendly CARTOON caricature in clean 16-bit pixel art, monochrome phosphor green codec screen, simple flat shading, soft lighting, nothing realistic or scary, CRT scanlines. Keep exactly the same head (same hair length, same beard length), same shirt as in
the photo. Only the expression changes: SHOCKED —
eyes very wide with small pupils, eyebrows up and pinched, jaw dropped, a big cartoon drop of sweat on the temple,
comic and exaggerated, like a boss who cannot believe he is losing. No text, no frame. 1:1 square image.

## 6. MASQUÉ (façon Psycho Mantis)
Same character, same framing, same style as the previous image: friendly CARTOON caricature in clean 16-bit pixel art, monochrome phosphor green codec screen, simple flat shading, soft lighting, nothing realistic or scary, CRT scanlines. Now his whole face is hidden behind a
PSYCHO MANTIS style gas mask: a smooth leather-like face mask fitting the skull, two big round dark glass eye
lenses, a corrugated breathing hose hanging from the mouth area down to the chest, a high collar. His hair stays
visible on top, exactly the same hair length as in the photo, and he still wears the same shirt as in the photo. Head slightly tilted to the side, mysterious but cartoon and fun, not scary, faint psychic glow around the head.
Still monochrome phosphor green only. No text, no frame. 1:1 square image.

## (Option) Beufa à son bureau, sans masque
Si tu veux aussi remplacer le Beufa debout derrière le bureau (aujourd'hui fait à partir de la photo) :
Using the attached photo as the face reference, full color 16-bit pixel art in the style of Metal Gear (MSX/NES),
this man standing behind a desk seen from the front, visible from the head to the belt, the SAME SHIRT as in the photo
and exactly the same head (same hair and beard length), arms crossed, confident smirk. Plain pure white background, nothing else, no desk, no shadow on the floor.
Portrait orientation.

---------------------------------------------------------------------------------------------------------
# Le BUREAU de Beufa (décor du quiz, remplace le bureau dessiné et le buste) — V86

Image ENTIÈRE du haut de l'écran : le jeu la met en fond plein écran (16:9) et la case codec cache le TIERS DU BAS.
Donc Beufa et le bureau doivent tenir dans les 2 tiers du haut. Faire d'abord SANS masque (photo jointe), puis le
masque dans la même conversation (même cadrage exact). Noms : `beufa_bureau_scene.jpg`, `beufa_bureau_scene_masque.jpg`.

## A. Bureau, sans masque (en premier) — dans une NOUVELLE conversation, joindre 2 images :
## la photo ET le portrait codec souriant (`assets_inbox/beufa_codec_souriant.jpg`)
Two images are attached: a photo of the man, and a green codec portrait of him SMILING. Keep EXACTLY the same head
(stylized as a cartoon, but still clearly him): same face, same hair length and haircut, same beard length and shape,
same shirt as in the photo. His expression must be EXACTLY the one of the smiling codec portrait: a warm, genuine,
friendly smile, relaxed eyebrows, eyes slightly squinted by the smile. NOT a smirk, NOT a villain face, NOT narrowed
eyes, NOT eyebrows angled down. Ignore any previous expression.
Wide 16:9 game scene in FULL COLOR, friendly CARTOON 16-bit pixel art (clean outlines, simple flat shading, soft
lighting, likable comic look like a Nintendo / Advance Wars character, nothing realistic or scary), front view.
The secret office of a villain boss inside a military base: he sits behind a big wooden desk facing the camera,
hands joined on the desk, warm friendly smile. On the desk: an old military radio with a small red light, a stack of
files, a desk lamp. Behind him: a dark steel wall with a red banner with a gold star on each side, a big world map,
a small potted plant in each corner. COMPOSITION: the whole character and the top of the desk must be in the UPPER
TWO THIRDS of the image; the bottom third only shows the front of the desk and the floor (it will be hidden by the
dialogue box). No text, no UI, no frame. 16:9 image.

## B. Bureau, masqué façon Psycho Mantis (même conversation, juste après)
Exactly the same scene, same framing, same pixel art style, same colors and same desk, same shirt. Only change:
his whole face is hidden behind a PSYCHO MANTIS style gas mask (smooth leather-like mask fitting the skull, two big
round dark glass eye lenses, a corrugated breathing hose hanging down to the chest), his hair still visible on top
with the same length. Mysterious but cartoon and fun, not scary, a faint purple psychic glow around him.
No text, no UI, no frame. 16:9 image.
