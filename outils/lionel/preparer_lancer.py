# Prépare la planche du lancer de Lionel (assets_inbox/lionel_lancer_3.jpg : 3 poses tournées vers la DROITE,
# frisbee JAUNE) pour decouper_animation.py :
#  - pose 1 (il arme) : le frisbee jaune est recoloré en rouge (couleur du frisbee du jeu) et reste dans sa main ;
#  - poses 2 et 3 : le frisbee (déjà parti) est effacé (le jeu dessine celui qui vole) ;
#  - planche retournée (les illustrations de Lionel regardent vers la GAUCHE).
# Utilisation : python3 outils/lionel/preparer_lancer.py entree.jpg sortie.png
import sys, numpy as np
from PIL import Image
from scipy import ndimage as nd
im = Image.open(sys.argv[1]).convert('RGB')
a = np.asarray(im).astype(float) / 255
mx, mn = a.max(axis=2), a.min(axis=2)
s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
# jaune : rouge et vert hauts et proches, bleu bas (la peau a G nettement plus bas que R)
jaune = (s > 0.45) & (mx > 0.45) & (g > r * 0.8) & (b < g * 0.6)
jaune = nd.binary_opening(jaune, iterations=1)
jaune = nd.binary_dilation(jaune, iterations=3) & ((s > 0.25) | (mx < 0.45))   # + contour sombre / ombre du disque
lab, n = nd.label(jaune)
out = (a * 255).astype(np.uint8).copy()
W = a.shape[1]
for i, sl in enumerate(nd.find_objects(lab)):
    taille = (lab[sl] == i + 1).sum()
    if taille < 300: continue
    cx = (sl[1].start + sl[1].stop) / 2
    m = lab == i + 1
    if cx < W * 0.3:   # pose 1 : recolorer en rouge, l'ombrage gardé
        v = a[m].max(axis=1)
        out[m] = np.stack([v * 235, v * 50, v * 55], axis=1).astype(np.uint8)
    else:              # poses 2 et 3 : effacer (le disque est en l'air, sur le fond)
        out[nd.binary_dilation(m, iterations=2)] = 255
    print('disque', i + 1, 'x', int(cx), 'pixels', taille, 'recoloré' if cx < W * 0.3 else 'effacé')
Image.fromarray(out).transpose(Image.FLIP_LEFT_RIGHT).save(sys.argv[2])
