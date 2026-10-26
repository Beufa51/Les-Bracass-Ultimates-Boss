# Découpe les planches manga de Lionel (assets_inbox/lionel_*.jpg) en une image par pose,
# fond blanc rendu transparent, toutes tournées vers la GAUCHE (Lionel joue à droite du terrain).
# Utilisation : python3 outils/decouper_lionel.py
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd

ENTREE, SORTIE = 'assets_inbox/', 'assets/sprites/lionel/'
REDUCTION = 0.5   # les poses sont affichées petites sur le terrain

# pose : (planche, centre approximatif (x, y) de la pose, regarde vers la droite sur la planche ?)
POSES = {
    'lionel_tient':    ('lionel_planche_1.jpg', (220, 340), False),
    'lionel_course':   ('lionel_planche_1.jpg', (620, 330), True),
    'lionel_lance':    ('lionel_planche_1.jpg', (280, 930), True),
    'lionel_rattrape': ('lionel_planche_1.jpg', (650, 940), False),
    'lionel_plongeon': ('lionel_planche_2.jpg', (350, 200), True),
    'lionel_super':    ('lionel_planche_2.jpg', (600, 370), True),
    'lionel_touche':   ('lionel_planche_2.jpg', (280, 630), False),
    'lionel_victoire': ('lionel_planche_2.jpg', (660, 890), False),
    'lionel_defaite':  ('lionel_planche_2.jpg', (270, 1070), False),
    'lionel_portrait': ('lionel_entier.jpg',    (420, 660), False),
}

def masque(im):
    blanc = (im.min(axis=2) > 225) & (im.max(axis=2) - im.min(axis=2) < 30)
    lab, _ = nd.label(blanc)
    bord = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fond = np.isin(lab, list(bord))
    # trous blancs fermés (entre un bras et le corps...) : aussi du fond, s'ils sont d'un blanc pur
    pur = (im.min(axis=2) > 238) & (im.max(axis=2) - im.min(axis=2) < 12) & ~fond
    lab3, n3 = nd.label(pur)
    if n3:
        aires = nd.sum(pur, lab3, range(1, n3 + 1))
        fond |= np.isin(lab3, [i + 1 for i, a in enumerate(aires) if a > 250])
    return nd.binary_closing(~fond, iterations=2)

planches = {}
for nom, (fichier, (cx, cy), versDroite) in POSES.items():
    if fichier not in planches:
        im = np.asarray(Image.open(ENTREE + fichier).convert('RGB'))
        fg = masque(im.astype(int))
        lab, n = nd.label(fg)
        planches[fichier] = (im, fg, lab, nd.find_objects(lab), nd.sum(fg, lab, range(1, n + 1)))
    im, fg, lab, objs, aires = planches[fichier]
    # la grande forme la plus proche du centre donné
    def dist(i):
        sl = objs[i]; mx = (sl[1].start + sl[1].stop) / 2; my = (sl[0].start + sl[0].stop) / 2
        return (mx - cx) ** 2 + (my - cy) ** 2
    grandes = [i for i, a in enumerate(aires) if a > 20000]
    princ = min(grandes, key=dist)
    sl = objs[princ]
    garder = lab == princ + 1
    # petits morceaux (frisbee par terre, étincelles, tourbillon) dans le cadre de la pose
    y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
    for i, a in enumerate(aires):
        if i == princ or a > 20000 or a < 30: continue
        s = objs[i]
        if s[0].stop < 140 and s[1].stop < 200: continue   # logo « PIXEL ATHLETE 93 » en haut à gauche
        if s[0].start >= y0 - 30 and s[0].stop <= y1 + 45 and s[1].start >= x0 - 30 and s[1].stop <= x1 + 30:
            garder |= lab == i + 1
    ys, xs = np.nonzero(garder)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    alpha = Image.fromarray((garder[y0:y1, x0:x1] * 255).astype(np.uint8))
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    rgba = Image.fromarray(im[y0:y1, x0:x1]).convert('RGBA'); rgba.putalpha(alpha)
    if versDroite: rgba = rgba.transpose(Image.FLIP_LEFT_RIGHT)
    k = 0.55 if nom == 'lionel_portrait' else REDUCTION
    rgba = rgba.resize((round(rgba.width * k), round(rgba.height * k)), Image.LANCZOS)
    rgba.save(SORTIE + nom + '.png', optimize=True)
    print(f"{nom}: {rgba.width}x{rgba.height}")
