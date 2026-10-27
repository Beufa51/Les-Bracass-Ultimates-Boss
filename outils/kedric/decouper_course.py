# Découpe la planche de course de ton coureur vu de dos (assets_inbox/kedric_toi_course_planche.jpg :
# 2 lignes de 8 cases encadrées de noir) en une bande de 16 images alignées : pieds sur le bas, casque au milieu.
# Utilisation : python3 outils/kedric/decouper_course.py   (depuis la racine du projet)
import numpy as np, cv2
from PIL import Image
from rembg import remove, new_session

SOURCE, SORTIE = 'assets_inbox/kedric_toi_course_planche.jpg', 'assets/sprites/kedric/kedric_toi_course16.png'
HAUTEUR = round(215 * 1.5)   # hauteur du personnage dans la bande (1,5 fois l'écran, comme les autres illustrations)
session = new_session('isnet-anime')

im = cv2.imread(SOURCE)
gris = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
_, noir = cv2.threshold(gris, 100, 255, cv2.THRESH_BINARY_INV)
contours, _ = cv2.findContours(noir, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
# les cases : grands rectangles encadrés (environ 156 x 277), dans l'ordre de lecture
cases = []
for c in contours:
    x, y, w, h = cv2.boundingRect(c)
    if 140 < w < 190 and 265 < h < 310 and not any(abs(x - a) < 15 and abs(y - b) < 15 for a, b, _, _ in cases):
        cases.append((x, y, w, h))
cases.sort(key=lambda r: (r[1] // 100, r[0]))
assert len(cases) == 16, len(cases)

poses = []
for x, y, w, h in cases:
    m = 5   # on retire le cadre noir
    case = Image.fromarray(cv2.cvtColor(im[y + m:y + h - m, x + m:x + w - m], cv2.COLOR_BGR2RGB))
    rgba = np.array(remove(case, session=session))
    masque = (rgba[:, :, 3] > 60).astype(np.uint8)
    # seulement le personnage (les flèches et les légendes de la planche partent)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(masque, 8)
    k = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    masque = (lab == k).astype(np.uint8)
    rgba[:, :, 3] = (cv2.GaussianBlur(masque.astype(np.float32), (3, 3), 0) * 255).astype(np.uint8)
    ys, xs = np.nonzero(masque)
    haut = ys.min()
    casque = xs[ys < haut + 25].mean()           # milieu du casque
    poses.append((Image.fromarray(rgba), haut, ys.max(), casque))

# même échelle pour toutes les cases (le personnage a la même taille sur la planche)
grand = max(b - a for _, a, b, _ in poses)
k = HAUTEUR / grand
gauche = max(c for _, _, _, c in poses) * k
droite = max(img.width - c for img, _, _, c in poses) * k
W, H = int(gauche + droite) + 4, HAUTEUR + 4
bande = Image.new('RGBA', (W * 16, H))
for i, (img, a, b, c) in enumerate(poses):
    img = img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS)
    # pieds sur le bas de la case, casque au milieu
    bande.paste(img, (i * W + round(gauche - c * k) + 2, H - 2 - round(b * k)), img)
bande.save(SORTIE, optimize=True)
print('bande', W, H, '16 images')
