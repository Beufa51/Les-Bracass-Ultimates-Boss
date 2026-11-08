"""Greg v2 : détoure les poses de assets_inbox/greg_v2/*.jpg (fond blanc) -> assets/sprites/greg/greg2_*.png.
Toutes les poses sont réduites du MÊME facteur (Greg garde la même taille d'une pose à l'autre).
Affiche pour chaque pose : taille finale et position x de la tête (0 à 1) pour reglages.js."""
import sys, numpy as np
from PIL import Image
from scipy import ndimage

SRC, DST = 'assets_inbox/greg_v2', 'assets/sprites/greg'
POSES = ['garde_haute', 'nargue', 'entier', 'jab', 'crochet', 'corps', 'smash', 'touche', 'etourdi', 'tape_gants',
         'garde_basse', 'ko_debout', 'victoire', 'releve']   # + 'arme' quand la nouvelle image sera là   # nov. 2026
HAUTEUR_ENTIER = 560   # hauteur finale de la pose "entier" (les autres suivent le même facteur)

def detourer(im):
    a = np.asarray(im.convert('RGB')).astype(np.int16)
    mini = a.min(axis=2)
    blanc = mini > 232
    lab, n = ndimage.label(blanc)
    bord = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    tailles = ndimage.sum(blanc, lab, range(n + 1))
    fond = np.isin(lab, list(bord)) | (tailles[lab] > 6000) & blanc   # + grands trous blancs fermés (entre bras et corps)
    # bord adouci : 1 pixel autour du fond devient semi-transparent selon sa clarté
    autour = ndimage.binary_dilation(fond) & ~fond
    alpha = np.where(fond, 0, 255).astype(np.float32)
    alpha[autour] = np.clip((255 - mini[autour]) * 4, 60, 255)
    rgba = np.dstack([a.astype(np.uint8), alpha.astype(np.uint8)])
    return Image.fromarray(rgba, 'RGBA')

def effacer_texte_ceinture(img):
    # la boucle de ceinture de "tape_gants" porte un texte inventé : on le recouvre de doré
    a = np.asarray(img).copy()
    h, w = a.shape[:2]
    y0, y1, x0, x1 = int(h * 0.44), int(h * 0.49), int(w * 0.45), int(w * 0.57)
    zone = a[y0:y1, x0:x1, :3].astype(np.int16)
    clair = zone.sum(axis=2) > 330
    if clair.any():
        couleur = np.median(zone[clair], axis=0)
        sombre = ~clair
        zone[sombre] = couleur
        a[y0:y1, x0:x1, :3] = zone.astype(np.uint8)
    return Image.fromarray(a, 'RGBA')

images = {p: detourer(Image.open(f'{SRC}/greg_{p}.jpg')) for p in POSES}

# Poses dessinées à une autre échelle (autre format d'image) : on les met à la taille de la TÊTE de "entier"
# (largeur des cheveux noirs en haut du personnage).
A_LA_TETE = ['corps']   # nov. 2026 : coup au corps DE FACE (accroupi : on se cale sur la tête)
A_LA_HAUTEUR = {'jab': 545, 'crochet': 545}   # jab DE FACE (debout, tête dessinée plus grosse : on se cale sur la hauteur)
def largeur_tete(im):
    a = np.asarray(im.crop(im.getbbox()))
    al = a[:, :, 3] > 128; noir = (a[:, :, :3].max(axis=2) < 70) & al
    ys = np.where(al.any(axis=1))[0]
    bande = noir[ys[0]:ys[0] + int((ys[-1] - ys[0]) * 0.06)]
    xs = np.where(bande.any(axis=0))[0]
    return xs.max() - xs.min()
bb = images['entier'].getbbox()
f = HAUTEUR_ENTIER / (bb[3] - bb[1])
for p, im in images.items():
    im = im.crop(im.getbbox())
    fp = f * largeur_tete(images['entier']) / largeur_tete(images[p]) if p in A_LA_TETE else f
    if p in A_LA_HAUTEUR: fp = A_LA_HAUTEUR[p] / im.height
    im = im.resize((round(im.width * fp), round(im.height * fp)), Image.LANCZOS)
    if p == 'tape_gants': im = effacer_texte_ceinture(im)
    im.save(f'{DST}/greg2_{p}.png', optimize=True)
    a = np.asarray(im)[:, :, 3] > 128
    ys = np.where(a.any(axis=1))[0]
    tete = a[ys[0]:ys[0] + int(im.height * 0.12)]
    hx = np.where(tete.any(axis=0))[0].mean() / im.width
    print(f"{p:12s} {im.width}x{im.height}  tete_x={hx:.3f}")
