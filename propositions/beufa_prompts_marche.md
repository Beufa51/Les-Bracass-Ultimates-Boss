# Beufa — prompts pour les planches de marche (héros + garde)

Le jeu détecte tout seul les personnages séparés par du blanc (3 à 9 images).
Une fois la planche reçue : la déposer dans `assets/sprites/beufa/` (beufa_heros.jpg / beufa_garde.jpg),
lancer `python3 outils/beufa_alleger.py`, puis régler la pose d'arrêt (`poseArretHeros` / `poseArretGarde`)
sur l'image 3 (index 2, pieds côte à côte).

## HÉROS
Pixel art sprite sheet, 16-bit SNES style like Metal Gear (1990), strict TOP-DOWN view (camera directly above,
we see the top of the head, the shoulders and the feet sticking out in front and behind).
Character: [DÉCRIS TON HÉROS ICI : ex. a young stealth commando, dark navy sneaking suit, black bandana, small backpack].
The character faces DOWN (toward the bottom of the image) in every frame.
8 frames of a smooth, natural WALK CYCLE, side by side on ONE single horizontal row, in this order:
1. contact: left foot forward, right foot back, right arm forward, left arm back;
2. down: weight on the left foot, body slightly lower, legs closer;
3. passing: feet side by side under the body, arms by the sides;
4. up: right foot coming forward, left foot pushing behind;
5. contact: right foot forward, left foot back, left arm forward, right arm back (mirror of frame 1);
6. down (mirror of 2); 7. passing (same as 3); 8. up (mirror of 4).
The head stays at exactly the same place in every frame; only legs, feet and arms move, the shoulders turn
very slightly with the arms. Opposite arm and leg swing together. Same size, same scale, same center point
in every frame, evenly spaced with clear white space between frames. Pure white background, no ground shadow,
no text, no grid lines, no extra characters.

## HÉROS — VERSION « SOLID SNAKE »
Pixel art sprite sheet, 16-bit SNES style like Metal Gear (1990), strict TOP-DOWN view (camera directly above,
we see the top of the head, the shoulders and the feet sticking out in front and behind).
Character: a tactical espionage soldier inspired by Solid Snake: muscular build, dark grey-blue tight sneaking suit
with black shoulder and knee pads, long dark blue BANDANA knotted at the back of the head with two tails hanging
down the back, short brown hair, black tactical harness with pouches on the chest and belt, black gloves, black
combat boots, a small handgun in a thigh holster. Crouched, careful sneaking posture, shoulders forward.
The character faces DOWN (toward the bottom of the image) in every frame.
8 frames of a smooth, natural, careful SNEAKING WALK CYCLE, side by side on ONE single horizontal row, in this order:
1. contact: left foot forward, right foot back, right arm forward, left arm back;
2. down: weight on the left foot, body slightly lower, legs closer;
3. passing: feet side by side under the body, arms close to the body;
4. up: right foot coming forward, left foot pushing behind;
5. contact: right foot forward, left foot back, left arm forward, right arm back (mirror of frame 1);
6. down (mirror of 2); 7. passing (same as 3); 8. up (mirror of 4).
The head stays at exactly the same place in every frame; the bandana tails sway gently from side to side with
each step. Opposite arm and leg swing together, arms bent and close to the body. Same size, same scale, same
center point in every frame, evenly spaced with clear white space between frames. Pure white background,
no ground shadow, no text, no grid lines, no extra characters.

## GARDE
Pixel art sprite sheet, 16-bit SNES style like Metal Gear (1990), strict TOP-DOWN view (camera directly above,
we see the top of the helmet, the shoulders and the boots sticking out in front and behind).
Character: enemy soldier, olive green uniform, round green helmet, holding a rifle diagonally across the chest
with both hands (the rifle does NOT swing).
The soldier faces DOWN (toward the bottom of the image) in every frame.
8 frames of a calm, heavy PATROL WALK CYCLE, side by side on ONE single horizontal row, in this order:
1. contact: left boot forward, right boot back; 2. down: weight on the left boot;
3. passing: boots side by side under the body; 4. up: right boot coming forward;
5. contact: right boot forward, left boot back (mirror of 1); 6. down (mirror of 2);
7. passing (same as 3); 8. up (mirror of 4).
Only the legs and boots move; elbows move very little because the hands hold the rifle; the shoulders sway
very slightly. The helmet stays at exactly the same place in every frame. Same size, same scale, same center
point in every frame, evenly spaced with clear white space between frames. Pure white background, no ground
shadow, no text, no grid lines, no extra characters.

## SNAKE — PLANCHES DOS ET PROFIL (V37 : il reste debout, une planche par direction)
Joindre au générateur la planche de face (`assets_inbox/beufa_heros_snake.jpg`) comme référence.

### Dos (quand il monte)
Same character, same pixel art style, same size and same camera angle as the attached sprite sheet
(slightly high 3/4 view), but seen FROM THE BACK: we see the back of his head, the bandana knot with its two
long tails hanging down his back, the back of the sneaking suit and harness, the soles of the boots.
He walks AWAY from the camera (toward the top of the image). 6 frames of a natural walking cycle on ONE single
horizontal row, evenly spaced with clear white space between frames: 1. left foot forward, 2. passing,
3. right foot up, 4. right foot forward, 5. passing, 6. left foot up. Opposite arm and leg swing together,
the head stays at the same height. Pure white background, no ground shadow, no text, no extra characters.

### Profil (quand il va à droite ; le jeu le retourne pour la gauche)
Same character, same pixel art style, same size and same camera angle as the attached sprite sheet
(slightly high 3/4 view), but seen FROM THE SIDE, facing and walking toward the RIGHT of the image:
we see his profile, the bandana tails flowing behind him to the left, the holster on his thigh.
6 frames of a natural, careful sneaking walking cycle on ONE single horizontal row, evenly spaced with clear
white space between frames: 1. contact, right leg forward; 2. down; 3. passing (legs together); 4. contact,
left leg forward; 5. down; 6. passing. Arms swing opposite to the legs, slightly bent; the head stays at the
same height in every frame. Pure white background, no ground shadow, no text, no extra characters.

## SNAKE — PROFIL 8 IMAGES (prompt complet, sans image de référence)
Pixel art sprite sheet, detailed 16-bit SNES style, slightly high camera angle.
Character: a tactical espionage soldier inspired by Solid Snake: tall, muscular, broad shoulders; short messy
brown hair; light stubble; long dark navy-blue BANDANA tied around the forehead, knotted at the back, with two
long tails flowing behind him; tight dark grey-blue sneaking suit with visible muscle shading; black tactical
harness with straps over the shoulders and chest; black belt with pouches; black knee pads and elbow pads;
black gloves; black combat boots; holster on the right thigh. He holds a black handgun low in his right hand,
pointing at the ground.
STRICT SIDE VIEW at exactly 90 degrees, like a 2D side-scrolling game: he faces and walks toward the RIGHT edge
of the image. Only ONE eye and ONE ear visible, nose and chest pointing right, the far arm and far leg partly
hidden behind the body. Bandana tails flowing behind him to the left.
8 frames of a complete, smooth WALK CYCLE, side by side on ONE single horizontal row, evenly spaced with clear
white space between frames, every frame the SAME size, the SAME scale and the SAME head height:
1. contact: near leg far forward, heel touching the ground, far leg far behind on its toes;
2. down: near foot flat, knee bent, far leg starting to lift;
3. passing: near leg straight under the body, far leg lifted and crossing it, knee bent;
4. up: body slightly higher, far leg swinging forward;
5. contact: FAR leg far forward, heel touching the ground, near leg far behind (opposite of frame 1);
6. down (opposite of 2); 7. passing (opposite of 3); 8. up (opposite of 4).
The legs must clearly change from frame to frame; the free arm swings opposite to the legs.
Pure white background, no ground shadow, no text, no grid, no extra characters.
