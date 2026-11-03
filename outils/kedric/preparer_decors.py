# Prépare le STADE (fond) et le TROPHÉE (écran de victoire) de Kédric.
# Utilisation : python3 outils/kedric/preparer_decors.py   (depuis la racine du projet)
#  - kedric_stade.jpg : bande du haut (tribunes, écran géant) ramenée à 960 x 172 (= VUE.horizon), la pelouse est coupée
#  - kedric_trophee.png : fond blanc retiré (remplissage depuis les bords, bords adoucis), 1,5 fois la taille d'affichage
import numpy as np, cv2
from PIL import Image

E, S = 'assets_inbox/kedric', 'assets/sprites/kedric'

# --- stade : on garde de y=160 jusqu'au bas des tribunes (y=470), légèrement tassé en hauteur
st = Image.open(f'{E}/kedric_stade.jpg').convert('RGB')
st.crop((0, 160, st.width, 470)).resize((960, 172), Image.LANCZOS).save(f'{S}/kedric_stade.jpg', quality=88)

# --- trophée
im = np.array(Image.open(f'{E}/kedric_trophee.jpg').convert('RGB')).astype(np.int16)
h, w, _ = im.shape
blanc = (im.min(axis=2) > 225).astype(np.uint8)
masque = np.zeros((h + 2, w + 2), np.uint8)
fond = blanc.copy()
for x, y in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
    if fond[y, x]: cv2.floodFill(fond, masque, (x, y), 2)
fond = (fond == 2)
alpha = np.where(fond, 0, 255).astype(np.uint8)
# bords : on adoucit sur 2 px et on retire le liseré blanc (couleur « démélangée »)
alpha = cv2.GaussianBlur(alpha, (5, 5), 0)
a = alpha.astype(np.float32) / 255
rgb = im.astype(np.float32)
bord = (a > 0.02) & (a < 0.98)
rgb[bord] = np.clip((rgb[bord] - 255 * (1 - a[bord, None])) / a[bord, None], 0, 255)
out = np.dstack([rgb.astype(np.uint8), alpha])
ys, xs = np.where(alpha > 8)
out = out[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
img = Image.fromarray(out, 'RGBA')
H = 450   # 300 px à l'écran x 1,5
img = img.resize((round(img.width * H / img.height), H), Image.LANCZOS)
img.save(f'{S}/kedric_trophee.png')
print('stade 960x172, trophée', img.size)
