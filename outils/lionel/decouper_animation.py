# Découpe une planche d'animation (personnages sur fond blanc, rangés en lignes) en une BANDE d'images
# de même taille, alignées sur les pieds, prête pour le jeu (animation image par image).
# Utilisation : python3 outils/lionel/decouper_animation.py planche.jpg sortie.png hauteur_voulue ordre [premiere.png]
#   ordre : numéros des poses dans l'ordre de lecture (ex. 1,2,3,4,3,2 pour un aller-retour)
#   premiere.png (facultatif) : la pose 1 seule, en plus (pour la pose d'attente)
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd

planche, sortie, hauteur, ordre = sys.argv[1], sys.argv[2], int(sys.argv[3]), [int(k) for k in sys.argv[4].split(',')]
im = np.asarray(Image.open(planche).convert('RGB'))
a = im.astype(int)
blanc = (a.min(axis=2) > 225) & (a.max(axis=2) - a.min(axis=2) < 30)
lab, _ = nd.label(blanc)
bord = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
fond = np.isin(lab, list(bord))
pur = (a.min(axis=2) > 238) & (a.max(axis=2) - a.min(axis=2) < 12) & ~fond   # trous blancs fermés
lab3, n3 = nd.label(pur)
if n3:
    aires = nd.sum(pur, lab3, range(1, n3 + 1))
    fond |= np.isin(lab3, [i + 1 for i, s in enumerate(aires) if s > 250])
fg = nd.binary_closing(~fond, iterations=2)
lab, n = nd.label(fg)
aires = nd.sum(fg, lab, range(1, n + 1))
objs = nd.find_objects(lab)
grandes = [i for i, s in enumerate(aires) if s > 20000]
# ordre de lecture : ligne par ligne (par le haut), puis de gauche à droite
# (deux poses sont sur la même ligne si leurs milieux sont à moins d'une demi-hauteur l'un de l'autre)
centre = lambda i: (objs[i][0].start + objs[i][0].stop) / 2
haut_pose = np.median([objs[i][0].stop - objs[i][0].start for i in grandes])
grandes.sort(key=centre)
lignes, ligne = [], []
for i in grandes:
    if ligne and centre(i) - centre(ligne[0]) > haut_pose / 2: lignes.append(ligne); ligne = []
    ligne.append(i)
lignes.append(ligne)
grandes = [i for l in lignes for i in sorted(l, key=lambda i: objs[i][1].start)]
poses = []
for i in grandes:
    m = lab == i + 1
    ys, xs = np.nonzero(m)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    alpha = Image.fromarray((m[y0:y1, x0:x1] * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    p = Image.fromarray(im[y0:y1, x0:x1]).convert('RGBA'); p.putalpha(alpha)
    poses.append(p)
print(len(poses), 'poses trouvées :', [p.size for p in poses])
k = hauteur / np.median([p.height for p in poses])   # même échelle pour toutes
poses = [p.resize((round(p.width * k), round(p.height * k)), Image.LANCZOS) for p in poses]
L = max(p.width for p in poses); H = max(p.height for p in poses)
bande = Image.new('RGBA', (L * len(ordre), H), (0, 0, 0, 0))
for j, num in enumerate(ordre):
    p = poses[num - 1]
    bande.alpha_composite(p, (j * L + (L - p.width) // 2, H - p.height))   # centrée, pieds en bas
bande.save(sortie, optimize=True)
print('bande', bande.size, 'case', L, 'x', H, 'images', len(ordre))
if len(sys.argv) > 5:
    c = Image.new('RGBA', (L, H), (0, 0, 0, 0)); c.alpha_composite(poses[0], ((L - poses[0].width) // 2, H - poses[0].height)); c.save(sys.argv[5], optimize=True)
