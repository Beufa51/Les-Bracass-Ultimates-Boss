"""Séquence d'intro (façon opening de Final Bout) : un GRAND buste de chaque boss, en couleur.
L'ombre est faite dans le jeu (même image teintée en noir) : rien d'autre à préparer.
Source : l'image détourée de chaque boss (les mêmes que l'écran de sélection) -> assets/sprites/intro/intro_<id>.png
Lancer : python3 outils/intro/preparer_intro.py"""
import numpy as np
from PIL import Image

SOURCES = {   # id : (image détourée, part du haut du corps gardée)
    'beufa': ('beufa/beufa_presentation.png', 0.62), 'kedric': ('kedric/kedric_portrait.png', 0.62),
    'julien': ('julien/julien_presentation.png', 0.60), 'greg': ('greg/greg2_entier.png', 0.70),
    'remi': ('remi/remi_presentation.png', 0.64), 'lionel': ('lionel/lionel_portrait.png', 0.62),
}
L, H = 400, 440
for id_, (src, part) in SOURCES.items():
    im = Image.open('assets/sprites/' + src).convert('RGBA')
    im = im.crop(im.getbbox())
    buste = im.crop((0, 0, im.width, int(im.height * part)))
    a = np.asarray(buste)[:, :, 3] > 40
    xs = np.where(a.any(axis=0))[0]; buste = buste.crop((xs.min(), 0, xs.max() + 1, buste.height))
    f = min(L / buste.width, H / buste.height)
    buste = buste.resize((max(1, round(buste.width * f)), max(1, round(buste.height * f))), Image.LANCZOS)
    case = Image.new('RGBA', (L, H)); case.alpha_composite(buste, ((L - buste.width) // 2, H - buste.height))
    case.save(f'assets/sprites/intro/intro_{id_}.png', optimize=True)
    print(id_, buste.size)
