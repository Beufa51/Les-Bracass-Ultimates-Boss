"""Poses façon « commando » de l'intro (images de Fabien, fond blanc) -> assets/sprites/intro/intro_pose_<id>.png
Détourage : on remplit le blanc depuis les bords (le blanc À L'INTÉRIEUR du perso, cerné de traits, reste).
Toutes les poses dans une même boîte 460 x 520 (pieds en bas, centrées). Une pose absente = le buste reste.
Lancer : python3 outils/intro/preparer_poses.py"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

L, H = 460, 520
# retouches par pose : 'trous' = sous cette hauteur (part de l'image), les grandes zones blanches fermées (entre les
# jambes...) deviennent transparentes ; 'ombre' = sous cette hauteur, on efface l'ombre pointillée au sol : on ne garde
# que ce qui touche du teinté (chaussures, jean) : l'ombre grise part
RETOUCHES = {'julien': {'trous': 0.6, 'ombre': 0.85}}
for id_ in ['beufa', 'kedric', 'julien', 'greg', 'remi', 'lionel']:
    src = f'assets_inbox/intro/pose_{id_}.jpg'
    if not os.path.exists(src):
        src = src.replace('.jpg', '.png')
        if not os.path.exists(src): print(id_, ': pas encore de pose'); continue
    im = np.asarray(Image.open(src).convert('RGB')).astype(int)
    blanc = (im.min(2) > 228) & (im.max(2) - im.min(2) < 20)
    lab, _ = ndimage.label(blanc)
    bords = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fond = np.isin(lab, list(bords))
    r = RETOUCHES.get(id_, {})
    if r.get('trous'):
        tailles_b = ndimage.sum(blanc, lab, range(1, lab.max() + 1))
        cy = ndimage.center_of_mass(blanc, lab, range(1, lab.max() + 1))
        gros = [i + 1 for i, (t, c) in enumerate(zip(tailles_b, cy)) if t > 0.002 * blanc.size and c[0] > r['trous'] * blanc.shape[0]]
        fond |= np.isin(lab, gros)
    fond = ndimage.binary_opening(fond, iterations=1)
    perso = ~fond
    if r.get('ombre'):
        y0 = int(r['ombre'] * perso.shape[0])
        colore = (im.max(2) - im.min(2)) >= 16          # l'ombre est grise ; chaussures et jean sont teintés
        colore = ndimage.binary_opening(colore, iterations=2)
        coque = ndimage.binary_fill_holes(ndimage.binary_closing(colore, iterations=8, border_value=1))
        perso[y0:] &= ndimage.binary_dilation(coque, iterations=4)[y0:]
    lab2, n = ndimage.label(perso)                      # on garde les gros morceaux (le perso), pas les poussières
    tailles = ndimage.sum(perso, lab2, range(1, n + 1))
    perso = np.isin(lab2, 1 + np.where(tailles > 0.01 * tailles.max())[0])
    a = ndimage.gaussian_filter(perso.astype(float), 0.7)
    img = Image.fromarray(np.dstack([im, a * 255]).astype(np.uint8), 'RGBA')
    img = img.crop(img.getbbox())
    f = min(L / img.width, H / img.height)
    img = img.resize((round(img.width * f), round(img.height * f)), Image.LANCZOS)
    boite = Image.new('RGBA', (L, H)); boite.alpha_composite(img, ((L - img.width) // 2, H - img.height))
    boite.save(f'assets/sprites/intro/intro_pose_{id_}.png', optimize=True)
    print(id_, img.size)
