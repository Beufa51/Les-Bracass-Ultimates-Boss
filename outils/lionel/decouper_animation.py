# Découpe une planche d'animation (personnages sur fond blanc, rangés en lignes) en une BANDE d'images
# de même taille, alignées sur les pieds, prête pour le jeu (animation image par image).
# Utilisation : python3 outils/lionel/decouper_animation.py planche.jpg sortie.png hauteur_voulue ordre [premiere.png]
#                 [--par-ligne N]
#   ordre : numéros des poses dans l'ordre de lecture (ex. 1,2,3,4,3,2 pour un aller-retour)
#   premiere.png (facultatif) : la pose 1 seule, en plus (pour la pose d'attente)
#   --par-ligne N : nombre de poses par ligne ; si deux poses se touchent, elles sont coupées en deux
#                   le long du chemin qui traverse le moins de dessin (entre leurs deux corps).
# Les lignes de sol (traits sombres horizontaux très longs) sont effacées.
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd

args = sys.argv[1:]
parLigne = None
if '--par-ligne' in args:
    k = args.index('--par-ligne'); parLigne = int(args[k + 1]); del args[k:k + 2]
planche, sortie, hauteur, ordre = args[0], args[1], int(args[2]), [int(k) for k in args[3].split(',')]
premiere = args[4] if len(args) > 4 else None
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
# lignes de sol : traits sombres qui traversent presque toute la planche
sombre = a.max(axis=2) < 90
for y in range(a.shape[0]):
    if sombre[y].sum() > a.shape[1] * 0.45: fg[max(0, y - 2):y + 3, :] = False
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

def couper(m):
    # coupe un masque contenant DEUX poses collées : chemin de haut en bas, entre 35 % et 65 % de la largeur,
    # qui traverse le moins de pixels dessinés (programmation dynamique, déplacement d'1 px par ligne au plus)
    ys, xs = np.nonzero(m); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    xa, xb = x0 + int((x1 - x0) * 0.35), x0 + int((x1 - x0) * 0.65)
    cout = m[y0:y1, xa:xb].astype(float)
    tot = cout.copy(); dep = np.zeros(cout.shape, int)
    for y in range(1, cout.shape[0]):
        g = np.r_[np.inf, tot[y - 1, :-1]]; d = np.r_[tot[y - 1, 1:], np.inf]; c = tot[y - 1]
        choix = np.argmin(np.vstack([g + 0.01, c, d + 0.01]), axis=0) - 1
        tot[y] += np.minimum(np.minimum(g + 0.01, c), d + 0.01); dep[y] = choix
    x = int(np.argmin(tot[-1])); chemin = np.zeros(cout.shape[0], int)
    for y in range(cout.shape[0] - 1, -1, -1):
        chemin[y] = x + xa; x += dep[y, x]
    gauche = np.zeros_like(m); droite = np.zeros_like(m)
    for k, y in enumerate(range(y0, y1)):
        gauche[y, :chemin[k]] = m[y, :chemin[k]]; droite[y, chemin[k] + 1:] = m[y, chemin[k] + 1:]
    # on ne garde que le plus gros morceau de chaque côté
    garder = lambda mm: (lambda l, n: l == (1 + int(np.argmax(nd.sum(mm, l, range(1, n + 1))))) if n else mm)(*nd.label(mm))
    return garder(gauche), garder(droite)

masques = []
for l in lignes:
    ml = [lab == i + 1 for i in sorted(l, key=lambda i: objs[i][1].start)]
    # trop peu de poses dans la ligne : on coupe la plus large en deux, jusqu'à avoir le bon nombre
    while parLigne and len(ml) < parLigne:
        k = max(range(len(ml)), key=lambda k: np.ptp(np.nonzero(ml[k])[1]))
        g, d = couper(ml[k]); ml[k:k + 1] = [g, d]
    masques += ml

poses = []
for m in masques:
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
if premiere:
    c = Image.new('RGBA', (L, H), (0, 0, 0, 0)); c.alpha_composite(poses[0], ((L - poses[0].width) // 2, H - poses[0].height)); c.save(premiere, optimize=True)
