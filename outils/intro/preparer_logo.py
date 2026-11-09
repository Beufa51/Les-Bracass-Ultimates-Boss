"""Logo du titre de l'intro : l'image fournie (JPG) a un faux damier « transparent » dessiné dedans.
On garde les lettres (contour bleu foncé rebouché) + une lueur bleutée propre ; l'explosion mêlée au damier est jetée.
assets_inbox/intro/logo_titre_source.jpg -> assets/sprites/intro/intro_logo.png
Lancer : python3 outils/intro/preparer_logo.py"""
import numpy as np
from PIL import Image
from scipy import ndimage

im = np.asarray(Image.open('assets_inbox/intro/logo_titre_source.jpg').convert('RGB')).astype(float)
gris = im.mean(2); sat = im.max(2) - im.min(2)
# pixels sûrs du damier (gris clair ou gris moyen, sans couleur)
fond = (sat < 14) & (((gris > 188) & (gris < 210)) | ((gris > 214) & (gris < 236)))
# on garde SEULEMENT les lettres : le contour bleu foncé, rebouché ; l'explosion derrière (mêlée au damier) est jetée
# et remplacée par une lueur propre (le jeu ajoute ses flashs et ses traits)
contour = (im[..., 2] > im[..., 0] + 10) & (gris < 120) | (gris < 60)
contour = ndimage.binary_closing(contour, iterations=2)
lab, n = ndimage.label(contour)
tailles = ndimage.sum(contour, lab, range(1, n + 1))
gros = np.isin(lab, 1 + np.where(tailles > 3000)[0])
forme = ndimage.binary_fill_holes(gros)
forme &= ~ndimage.binary_erosion(fond & forme & ~gros, iterations=1)   # creux des lettres où l'on voit le damier
forme = ndimage.binary_opening(forme, iterations=1)
a = ndimage.gaussian_filter(forme.astype(float), 0.8)
lueur = np.clip(ndimage.gaussian_filter(forme.astype(float), 14) * 1.6, 0, 1) * 0.75
A = a + lueur * (1 - a)
couleurLueur = np.array([150, 200, 255.0])
F = (im * a[..., None] + couleurLueur * (lueur * (1 - a))[..., None]) / np.maximum(A[..., None], 1e-3)
out = np.dstack([np.clip(F, 0, 255), A * 255]).astype(np.uint8)
img = Image.fromarray(out, 'RGBA'); img = img.crop(img.getbbox())
img = img.resize((900, round(900 * img.height / img.width)), Image.LANCZOS)
img.save('assets/sprites/intro/intro_logo.png', optimize=True)
print(img.size)
