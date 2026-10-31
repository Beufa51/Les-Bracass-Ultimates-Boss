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
