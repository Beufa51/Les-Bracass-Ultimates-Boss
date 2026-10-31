"""Allège les fichiers de Beufa (images et musique) sans changer ce qu'on voit en jeu.

Les images arrivent du générateur en 1000-2500 px pour des sprites de 48 à 184 px à
l'écran : on les ramène à 3 fois leur taille en jeu (assez pour le zoom et les écrans
fins), en JPG qualité 90 sans sous-échantillonnage des couleurs (pixel art net).
Musique (fait une fois à la main) :
  ffmpeg -i musique_originale.mp3 -map 0:a -map_metadata -1 -c:a libmp3lame -b:a 96k assets/audio/beufa/beufa_musique.mp3
Usage : python3 outils/beufa_alleger.py  (déjà allégé = rien ne change)
"""
import re, pathlib
from PIL import Image

RACINE = pathlib.Path(__file__).resolve().parent.parent
MANIF = (RACINE / 'src/bosses/beufa/manifeste.js').read_text(encoding='utf-8')
GRILLES = {'beufa_boss': (4, 2)}   # planche en grille : colonnes, rangées
MARGE = 3

tailles = {}
for m in re.finditer(r"(beufa_\w+):\s*\{[^}]*?largeur: (\d+), hauteur: (\d+), images: (\d+)", MANIF):
    tailles[m.group(1)] = (int(m.group(2)), int(m.group(3)), int(m.group(4)))

for f in sorted((RACINE / 'assets/sprites/beufa').glob('*.jpg')):
    cle = f.stem
    if cle not in tailles:
        print('ignoré (pas dans le manifeste) :', f.name); continue
    l, h, n = tailles[cle]
    cols, rangs = GRILLES.get(cle, (n, 1))
    im = Image.open(f).convert('RGB')
    W, H = im.size
    # la zone DESSINÉE (hors marge blanche) : c'est elle qui sera étirée à la taille du jeu
    masque = im.convert('L').point(lambda v: 255 if v < 238 else 0)
    bx = masque.getbbox() or (0, 0, W, H)
    cW, cH = bx[2] - bx[0], bx[3] - bx[1]
    k = min(1.0, max(MARGE * l * cols / cW, MARGE * h * rangs / cH))
    avant = f.stat().st_size
    if k < 0.95:
        im = im.resize((round(W * k), round(H * k)), Image.LANCZOS)
    elif avant < 150_000:
        continue
    im.save(f, quality=90, subsampling=0, optimize=True)
    print(f'{f.name}: {W}x{H} -> {im.size[0]}x{im.size[1]}, {avant//1024} -> {f.stat().st_size//1024} Ko')
