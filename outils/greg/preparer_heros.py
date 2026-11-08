"""Ton boxeur (vu de dos) + images autour du combat de Greg (nov. 2026).
- assets_inbox/greg_heros/heros_{esquive,bloque,dempsey,victoire}.jpg -> assets/sprites/greg/heros_*.png :
  fond blanc retiré, contour bleu clair (comme les anciennes images), mis à la MÊME taille que heros_garde.png
  (largeur du short), et affiche l'origine [x, y] = milieu du HAUT DU SHORT, à mettre dans reglages.js (herosIllustre.images).
- heros_portrait.jpg -> heros_portrait.png (128 x 128) ; greg_visage.jpg -> greg_visage.jpg (300 x 260) ;
  greg_ko.jpg -> greg_ko.jpg (case K.O.) ; greg_trophee.jpg / greg_arbitre.jpg -> .png détourés.
Lancer : python3 outils/greg/preparer_heros.py"""
import numpy as np
from PIL import Image
from scipy import ndimage

H, V, DST = 'assets_inbox/greg_heros', 'assets_inbox/greg_v2', 'assets/sprites/greg'

def detourer(im, seuil=232, trous=True):
    a = np.asarray(im.convert('RGB')).astype(np.int16)
    mini = a.min(axis=2); blanc = mini > seuil
    lab, n = ndimage.label(blanc)
    bord = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    tailles = ndimage.sum(blanc, lab, range(n + 1))
    fond = np.isin(lab, list(bord)) | (((tailles[lab] > 6000) & blanc) if trous else False)
    autour = ndimage.binary_dilation(fond) & ~fond
    alpha = np.where(fond, 0, 255).astype(np.float32)
    alpha[autour] = np.clip((255 - mini[autour]) * 4, 60, 255)
    return Image.fromarray(np.dstack([a.astype(np.uint8), alpha.astype(np.uint8)]), 'RGBA')

def contour_bleu(im, ep=5):
    a = np.asarray(im).copy(); dedans = a[:, :, 3] > 100
    pad = ep + 2
    a = np.pad(a, ((pad, pad), (pad, pad), (0, 0))); dedans = np.pad(dedans, pad)
    halo = ndimage.binary_dilation(dedans, iterations=ep) & ~dedans
    a[halo] = [127, 232, 255, 200]
    return Image.fromarray(a, 'RGBA')

def short(im):
    """(x du milieu, y du haut, largeur) du short bleu marine"""
    a = np.asarray(im).astype(np.int16); r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    marine = (al > 128) & (b > 60) & (b > r + 25) & (r < 100)
    lignes = marine.sum(axis=1); ys = np.where(lignes > lignes.max() * 0.4)[0]
    y = ys[0]; xs = np.where(marine[y + 15])[0]
    return (xs.min() + xs.max()) / 2, y, xs.max() - xs.min()

ref = Image.open(f'{DST}/heros_garde.png').convert('RGBA')
_, _, largeur_ref = short(ref)
for nom in ['esquive', 'bloque', 'dempsey', 'victoire']:
    im = detourer(Image.open(f'{H}/heros_{nom}.jpg'))
    im = im.crop(im.getbbox())
    f = largeur_ref / short(im)[2]
    im = contour_bleu(im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS))
    im.save(f'{DST}/heros_{nom}.png', optimize=True)
    x, y, _ = short(im)
    print(f"heros_{nom}: [{x / im.width:.3f}, {y / im.height:.3f}]  {im.width}x{im.height}")

p = Image.open(f'{H}/heros_portrait.jpg').convert('RGB')
p.crop((120, 40, 920, 840)).resize((128, 128), Image.LANCZOS).save(f'{DST}/heros_portrait.png', optimize=True)
Image.open(f'{V}/greg_visage.jpg').convert('RGB').resize((300, 260), Image.LANCZOS).save(f'{DST}/greg_visage.jpg', quality=88)
k = Image.open(f'{V}/greg_ko.jpg').convert('RGB'); k.resize((round(k.width * 410 / k.height), 410), Image.LANCZOS).save(f'{DST}/greg_ko.jpg', quality=86)
for nom, haut in [('trophee', 300), ('arbitre', 320)]:
    im = detourer(Image.open(f'{V}/greg_{nom}.jpg'), trous=(nom != 'arbitre')); im = im.crop(im.getbbox())   # chemise blanche de l'arbitre : gardée
    im = im.resize((round(im.width * haut / im.height), haut), Image.LANCZOS); im.save(f'{DST}/greg_{nom}.png', optimize=True)
    print(f"greg_{nom}: {im.width}x{im.height}")
