# Découpe la planche de course de ton coureur vu de dos (assets_inbox/kedric_toi_course_planche.jpg :
# 2 lignes de 8 cases encadrées de noir) en une bande d'images alignées : pieds sur le bas, casque au milieu.
# Les 16 poses à la suite donnaient une jambe qui « se replie » à chaque pas : la planche lève presque toujours la jambe
# GAUCHE. On garde donc les poses de la jambe gauche, et on fabrique celles de la jambe droite en retournant seulement
# les JAMBES (le haut du corps, le numéro 21 et le ballon restent à leur place) : un cycle de 6 images bien symétrique.
# CHOIX : numéros des cases dans l'ordre de lecture (à partir de 0) ; ('miroir', n) = case n avec les jambes retournées.
# Utilisation : python3 outils/kedric/decouper_course.py   (depuis la racine du projet)
import numpy as np, cv2
from PIL import Image
from rembg import remove, new_session

SOURCE, SORTIE = 'assets_inbox/kedric_toi_course_planche.jpg', 'assets/sprites/kedric/kedric_toi_course6.png'
# talon gauche remonté, genou gauche qui revient, appui ; talon droit remonté, genou droit qui revient, appui
CHOIX = [0, 11, 1, ('miroir', 0), ('miroir', 11), 9]
TAILLE = 0.50     # hauteur de la ceinture (fraction de la hauteur du personnage, depuis le haut)
BAS_MAINS = 0.58  # en dessous des mains, on retourne toute la largeur
MAINS_X = 60      # au-dessus, seulement à moins de 60 px du milieu (les jambes)
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
for x, y, w, h in [cases[c[1] if isinstance(c, tuple) else c] for c in CHOIX]:
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
# le casque au milieu de la case (pour pouvoir retourner les jambes autour de lui)
cote = max(max(c for _, _, _, c in poses), max(img.width - c for img, _, _, c in poses)) * k
W, H = int(2 * cote) + 4, HAUTEUR + 4
cellules = []
for img, a, b, c in poses:
    img = img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS)
    cell = Image.new('RGBA', (W, H))
    cell.paste(img, (round(W / 2 - c * k), H - 2 - round(b * k)), img)   # pieds sur le bas, casque au milieu
    cellules.append(cell)
bande = Image.new('RGBA', (W * len(CHOIX), H))
coupe, fondu = int(2 + HAUTEUR * TAILLE), 14
for i, choix in enumerate(CHOIX):
    cell = cellules[i]
    if isinstance(choix, tuple):
        # jambes retournées sous un haut du corps inchangé, avec un fondu à la ceinture
        haut, bas = np.array(cell).astype(np.float32), np.array(cell.transpose(Image.FLIP_LEFT_RIGHT)).astype(np.float32)
        t = np.clip((np.arange(H) - coupe) / fondu + 0.5, 0, 1)[:, None]
        # à hauteur des mains, on ne retourne que le milieu (les jambes) : les gants et le ballon restent en place
        milieu = np.clip((MAINS_X - np.abs(np.arange(W) - W / 2)) / 10 + 0.5, 0, 1)[None, :]
        sous_mains = np.clip((np.arange(H) - 2 - HAUTEUR * BAS_MAINS) / 10 + 0.5, 0, 1)[:, None]
        t = (t * np.maximum(milieu, sous_mains))[:, :, None]
        cell = Image.fromarray((haut * (1 - t) + bas * t).astype(np.uint8))
    bande.paste(cell, (i * W, 0), cell)
bande.save(SORTIE, optimize=True)
print('bande', W, H, len(CHOIX), 'images')
