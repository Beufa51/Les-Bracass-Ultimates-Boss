# Beufa — prompts d'images (audit V94)

Rangés par ordre d'importance. Livrer dans `assets_inbox/beufa/` ; je découpe et branche ensuite.
Les anciens prompts (décors, codec, marche) restent dans les autres fichiers `beufa_prompts_*.md`.

## N°1 — BEUFA QUI MARCHE DE DOS (la cinématique d'ouverture)
Aujourd'hui la cinématique utilise l'ANCIENNE planche vue du dessus (`beufa_boss.jpg`), retournée tête en bas pour
qu'il monte vers le nord, et plus petite que Snake : c'est le seul personnage qui n'est pas debout en 3/4.
À joindre : `assets/sprites/beufa/beufa_buste.jpg` (son visage, sa chemise) et `assets/sprites/beufa/beufa_garde_dos.jpg`
(le style et la taille). À livrer : `assets_inbox/beufa/beufa_boss_dos.jpg`.
```
Pixel art sprite sheet, detailed 16-bit SNES style, slightly high camera angle (3/4 view, same as the attached soldier sheet), ONE character drawn 8 times in ONE ROW with EXACTLY the same proportions, the same height and the same scale in every frame. Character: the man from the attached portrait: a stocky middle-aged military commander, short dark hair, light blue shirt with sleeves rolled up, dark navy trousers, black shoes, a watch on the left wrist, realistic adult proportions (head about 1/7 of the body height), as tall as the attached soldier. BACK VIEW: he walks AWAY from the camera, toward the top of the image, confident heavy walk, arms swinging. The 8 frames are one full walk cycle (left foot contact, down, passing, up, right foot contact, down, passing, up). The head stays at the same height in every frame, only the legs and arms move. Evenly spaced with clear white space between frames. Pure white background, no shadow, no text, no grid lines.
```

## N°2 — LE GARDE QUI COURT (quand il te poursuit)
En alerte, le garde te court après avec sa planche de MARCHE (jambes qui défilent vite) : on ne sent pas le danger.
À joindre : `assets/sprites/beufa/beufa_garde_face.jpg`. À livrer : `assets_inbox/beufa/beufa_garde_course_3vues.jpg`.
```
Pixel art sprite sheet, detailed 16-bit SNES style, slightly high camera angle (3/4 view), the SAME soldier as the attached image (same olive helmet, same olive uniform, same rifle, same size and proportions), drawn 18 times on 3 ROWS of 6 frames. ROW 1: running TOWARD the camera (front view). ROW 2: running AWAY from the camera (back view). ROW 3: running toward the RIGHT (strict side view, only one eye visible). In every row: a fast aggressive RUN cycle of 6 frames (contact, push, flight with both feet off the ground, contact with the other foot, push, flight), body leaning forward, rifle held in both hands pointing forward and slightly down, knees high. Same scale and same head height in every frame of a row, evenly spaced with clear white space between frames. Pure white background, no shadow, no text, no grid lines.
```

## N°3 — GARDE : PROFIL EN 4 POSES (prompt déjà prêt depuis la V88, pas encore livré)
Les poses « jambes serrées » du profil sont toujours FABRIQUÉES par le jeu (V89). Le prompt complet est dans
`propositions/beufa_prompts_marche.md`, section « GARDE — PROFIL : UN SEUL PAS EN 4 POSES ».
À livrer : `assets_inbox/beufa_garde_profil_4poses.jpg`.

## N°4 — LE GARDE SURPRIS (le « ! »)
Quand il te repère, seul un « ! » apparaît : le garde garde sa pose de marche. Une pose « sursaut » (0,4 s) ferait
le moment Metal Gear. À joindre : `assets/sprites/beufa/beufa_garde_face.jpg`. À livrer : `assets_inbox/beufa/beufa_garde_surpris.jpg`.
```
Pixel art sprite sheet, detailed 16-bit SNES style, slightly high camera angle (3/4 view), the SAME soldier as the attached image (same helmet, uniform, rifle, size and proportions), drawn 3 times in ONE ROW: 1) front view, 2) back view turning his head over his shoulder, 3) strict side view facing RIGHT. In all 3 frames he is STARTLED: small jump, both feet slightly off the ground, shoulders up, eyes wide, rifle raised in both hands. Same scale and same head height in every frame, clear white space between frames. Pure white background, no exclamation mark, no shadow, no text, no grid lines.
```

## N°5 — SNAKE QUI COURT DE FACE ET DE DOS
Le sprint n'a une vraie course que DE PROFIL ; vers le haut ou le bas, Snake garde la marche (accélérée).
À joindre : `assets/sprites/beufa/beufa_heros_course_profil.jpg` et `assets/sprites/beufa/beufa_heros.jpg`.
À livrer : `assets_inbox/beufa/beufa_heros_course_facedos.jpg`.
```
Pixel art sprite sheet, detailed 16-bit SNES style, slightly high camera angle (3/4 view), the SAME character as the attached images (Solid Snake–like commando, dark navy-blue bandana with two tails, grey-blue sneaking suit, harness, same size and proportions), drawn 16 times on 2 ROWS of 8 frames. ROW 1: RUNNING toward the camera (front view). ROW 2: RUNNING away from the camera (back view, bandana tails flying behind). Each row is one full run cycle of 8 frames (contact, down, push, flight, other foot contact, down, push, flight), body leaning forward, arms bent and pumping. Same scale and same head height in every frame of a row, clear white space between frames. Pure white background, no shadow, no text, no grid lines.
```

## N°6 (bonus) — SNAKE RATTRAPÉ (« RENVOYÉ ! »)
Aujourd'hui : l'écran tremble et Snake reste figé dans sa pose de marche. À joindre : `assets/sprites/beufa/beufa_heros.jpg`.
À livrer : `assets_inbox/beufa/beufa_heros_attrape.jpg`.
```
Pixel art sprite, detailed 16-bit SNES style, slightly high camera angle (3/4 view), the SAME character as the attached image (same bandana, suit, size and proportions), drawn 2 times in ONE ROW, front view: 1) caught by surprise, hands raised at shoulder height, leaning back; 2) kneeling on one knee, head down, hands behind his head. Same scale in both frames, clear white space between frames. Pure white background, no shadow, no text, no grid lines.
```

## N°7 — LE VEILLEUR QUI TOURNE LA TÊTE (garde planté qui balaie)
Le veilleur de la porte (quai) et le garde du sas balaient du regard sur place : le jeu bascule d'une planche
entière face ↔ profil, il « saute » d'une pose à l'autre. 5 poses intermédiaires rendraient le balayage fluide.
À joindre : `assets/sprites/beufa/beufa_garde_face.jpg`. À livrer : `assets_inbox/beufa/beufa_garde_tete.jpg`.
```
Pixel art sprite sheet, detailed 16-bit SNES style, slightly high camera angle (3/4 view), the SAME soldier as the attached image (same olive helmet, same olive uniform, same rifle, same size and proportions), standing still on guard, drawn 5 times in ONE ROW. Only the head and shoulders turn, the feet stay planted: 1) looking strictly to the LEFT (side view), 2) three-quarter left, 3) facing the camera, 4) three-quarter right, 5) looking strictly to the RIGHT (side view). Rifle held across the chest in both hands in every frame. Same scale, same position of the feet and same head height in every frame, evenly spaced with clear white space between frames. Pure white background, no shadow, no text, no grid lines.
```
