"""Écran de sélection des boss (façon Mega Man) : pour chaque boss, un BUSTE en couleur et son OMBRE.
Source : l'image détourée (fond transparent) de chaque boss -> assets/sprites/hub/select_<id>.png et select_<id>_ombre.png
(150 x 130, buste posé en bas de la case). Lancer : python3 outils/hub/preparer_selection.py"""
import numpy as np
from PIL import Image
from scipy import ndimage

SOURCES = {   # id : (image détourée, part du haut du corps gardée)
    'beufa': ('beufa/beufa_presentation.png', 0.40), 'kedric': ('kedric/kedric_portrait.png', 0.40),
    'julien': ('julien/julien_presentation.png', 0.38), 'greg': ('greg/greg2_entier.png', 0.45),
    'remi': ('remi/remi_presentation.png', 0.42), 'lionel': ('lionel/lionel_portrait.png', 0.40),
}
L, H = 150, 130
for id_, (src, part) in SOURCES.items():
    im = Image.open('assets/sprites/' + src).convert('RGBA')
    im = im.crop(im.getbbox())
    buste = im.crop((0, 0, im.width, int(im.height * part)))
    a = np.asarray(buste)[:, :, 3] > 40          # recadrage serré sur ce qui reste
    xs = np.where(a.any(axis=0))[0]; buste = buste.crop((xs.min(), 0, xs.max() + 1, buste.height))
    f = min(L / buste.width, H / buste.height)
    buste = buste.resize((max(1, round(buste.width * f)), max(1, round(buste.height * f))), Image.LANCZOS)
    case = Image.new('RGBA', (L, H)); case.alpha_composite(buste, ((L - buste.width) // 2, H - buste.height))
    case.save(f'assets/sprites/hub/select_{id_}.png', optimize=True)
    # l'ombre : silhouette sombre + fin liseré bleu clair (comme les écrans de sélection Mega Man)
    al = np.asarray(case)[:, :, 3] > 90
    liser = ndimage.binary_dilation(al, iterations=2) & ~al
    o = np.zeros((H, L, 4), np.uint8)
    o[al] = [16, 20, 40, 255]; o[liser] = [90, 170, 255, 200]
    Image.fromarray(o, 'RGBA').save(f'assets/sprites/hub/select_{id_}_ombre.png', optimize=True)
    print(id_, buste.size)
