"""V102 : détoure l'image de présentation de Beufa (assets_inbox/beufa/beufa_presentation_fabien.jpg)
→ assets/sprites/beufa/beufa_presentation.png (fond TRANSPARENT, sans l'ombre sous les pieds, bords adoucis).
Le fond gris-bleu clair et l'ombre (gris-bleu un peu plus foncé) sont retirés s'ils touchent le bord de l'image ;
au contour, chaque pixel devient à demi transparent selon sa ressemblance avec le fond (plus de liseré clair).
Usage : python3 outils/beufa/presentation_detourer.py
"""
import pathlib
import numpy as np
from PIL import Image
from scipy import ndimage

R = pathlib.Path(__file__).resolve().parents[2]
im = Image.open(R / 'assets_inbox/beufa/beufa_presentation_fabien.jpg').convert('RGB')
a = np.array(im).astype(float)
# le fond a DEUX couleurs : blanc en haut, gris-bleu clair (le « sol ») en bas
haut, sol = np.median(a[0], axis=0), np.median(a[-1], axis=0)
e_haut, e_sol = np.abs(a - haut).max(axis=2), np.abs(a - sol).max(axis=2)
ecart = np.minimum(e_haut, e_sol)                          # différence avec le fond le plus proche
fond = np.where((e_haut <= e_sol)[..., None], haut, sol)   # couleur du fond la plus proche, pixel par pixel
H = a.shape[0]
# le fond (et ses runes, à peine plus foncées) = très proche de la couleur du fond ; l'OMBRE sous les pieds (gris-bleu
# un peu plus foncé) n'est cherchée que tout en bas (sous les chevilles), pour ne jamais manger la chemise claire
gris = ecart < 16
bas = np.zeros_like(gris); bas[int(H * 0.93):] = True
gris |= bas & (e_sol < 70) & (a.max(axis=2) - a.min(axis=2) < 26) & (a.min(axis=2) > 120)
lab, _ = ndimage.label(gris)
bord = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
dehors = np.isin(lab, list(bord))
dehors = ndimage.binary_closing(dehors, iterations=1) | dehors
perso = ~dehors
perso = ndimage.binary_fill_holes(perso)                  # rien de transparent À L'INTÉRIEUR du personnage
# on garde la plus grande tache (le personnage) : les miettes de runes disparaissent
lab2, n = ndimage.label(perso)
tailles = ndimage.sum(perso, lab2, range(1, n + 1))
perso = lab2 == (1 + int(np.argmax(tailles)))
perso = ndimage.binary_erosion(perso, iterations=1)   # on ronge 1 px : le liseré clair du JPG part (le trait noir du dessin reste)
lab3, n3 = ndimage.label(perso)   # ce que l'érosion a détaché (points sous les chaussures) disparaît
perso = lab3 == (1 + int(np.argmax(ndimage.sum(perso, lab3, range(1, n3 + 1)))))
# contour adouci : à 1-2 px du bord, l'opacité dépend de la différence avec le fond
interieur = ndimage.binary_erosion(perso, iterations=2)
alpha = np.where(interieur, 1.0, np.where(perso, np.clip((ecart - 12) / 70, 0, 1), 0.0))
alpha = ndimage.gaussian_filter(alpha, 0.5) * perso + alpha * interieur * 0
alpha = np.maximum(alpha, interieur.astype(float))
# on retire la couleur du fond mélangée au contour (sinon liseré clair)
k = np.clip(alpha, 0.05, 1)[..., None]
couleur = np.clip((a - (1 - k) * fond) / k, 0, 255)
rgba = np.dstack([couleur, alpha * 255]).astype('uint8')
y, x = np.nonzero(alpha > 0.03)
Image.fromarray(rgba, 'RGBA').crop((x.min(), y.min(), x.max() + 1, y.max() + 1)).save(R / 'assets/sprites/beufa/beufa_presentation.png')
print('ok', x.max() - x.min() + 1, 'x', y.max() - y.min() + 1)
