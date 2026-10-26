# Prépare les illustrations de Kédric pour le jeu : retire le fond (rembg, modèle isnet-anime),
# nettoie les bords, recadre sur le personnage et réduit à la bonne taille.
# Les images sont gardées en 1,5 fois la taille d'affichage (plus nettes) : le jeu les réduit (ZOOM_ILLUSTRE dans KedricCourse.js).
# Utilisation : python3 outils/kedric/preparer_images.py   (depuis la racine du projet)
import numpy as np, cv2
from PIL import Image
from rembg import remove, new_session

ENTREE, SORTIE = 'assets_inbox', 'assets/sprites/kedric'
ZOOM = 1.5
session = new_session('isnet-anime')

# image de assets_inbox -> (image du jeu, hauteur À L'ÉCRAN en pixels) ; 'buste' = tête et épaules seulement
# SEUL : images où des traits du décor restent collés : on ne garde que le personnage (la plus grosse tache)
SEUL = {'kedric_danse_hanche'}
IMAGES = [
    ('kedric_toi_course', 'kedric_toi_course', 215),
    ('kedric_toi_saut', 'kedric_toi_saut', 200),
    ('kedric_toi_rotation', 'kedric_toi_rotation', 160),
    ('kedric_toi_plaque', 'kedric_toi_plaque', 245),
    ('kedric_toi_victoire', 'kedric_toi_victoire', 250),
    ('kedric_def_course', 'kedric_def_course', 205),
    ('kedric_def_garde', 'kedric_def_garde', 195),
    ('kedric_def_bas', 'kedric_def_bas', 160),
    ('kedric_def_plonge', 'kedric_def_plonge', 125),
    ('kedric_def_bras', 'kedric_def_bras', 180),
    ('kedric_def_rate', 'kedric_def_rate', 150),
    ('kedric_star', 'kedric_star', 215),
    ('kedric_portrait', 'kedric_portrait', 430),
    ('kedric_defaite', 'kedric_defaite', 300),
    ('kedric_danse_hanche', 'kedric_danse_1', 300),
    ('kedric_danse_disco', 'kedric_danse_2', 300),
    ('kedric_bras_croises', 'kedric_coach_1', 'buste'),
    ('kedric_portrait', 'kedric_coach_2', 'buste'),
]

def detourer(nom):
    im = Image.open(f'{ENTREE}/{nom}.jpg').convert('RGB')
    rgba = np.array(remove(im, session=session))
    a = rgba[:, :, 3]
    # masque franc : les zones à moitié transparentes (pantalon blanc sur fond clair) deviennent pleines
    masque = (a > (90 if nom in SEUL else 40)).astype(np.uint8)
    # traits fins du décor collés au personnage : une « ouverture » les coupe
    if nom in SEUL: masque = cv2.morphologyEx(masque, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    # on garde le personnage (la plus grosse tache) et ce qui est assez gros, on bouche les trous
    n, lab, stats, _ = cv2.connectedComponentsWithStats(masque, 8)
    if n > 1:
        grand = stats[1:, cv2.CC_STAT_AREA].max()
        mini = grand if nom in SEUL else grand * 0.04
        garder = [k for k in range(1, n) if stats[k, cv2.CC_STAT_AREA] >= mini]
        masque = np.isin(lab, garder).astype(np.uint8)
    contour, _ = cv2.findContours(masque, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    plein = np.zeros_like(masque); cv2.drawContours(plein, contour, -1, 1, -1)
    # petits trous seulement (on garde les vrais vides, entre les bras par exemple)
    trous = (plein == 1) & (masque == 0)
    nt, labt, statst, _ = cv2.connectedComponentsWithStats(trous.astype(np.uint8), 8)
    for k in range(1, nt):
        if statst[k, cv2.CC_STAT_AREA] < 400: masque[labt == k] = 1
    alpha = cv2.GaussianBlur(masque.astype(np.float32), (3, 3), 0)
    rgba[:, :, 3] = (np.clip(alpha, 0, 1) * 255).astype(np.uint8)
    ys, xs = np.nonzero(masque)
    return Image.fromarray(rgba).crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

def buste(img):
    # tête et épaules : carré centré sur la tête, en haut du personnage
    a = np.array(img)[:, :, 3]
    h = img.height
    haut = a[: int(h * 0.1)]
    cx = int(np.nonzero(haut)[1].mean())
    cote = int(h * 0.3)
    return img.crop((cx - cote // 2, -int(cote * 0.04), cx + cote // 2, cote - int(cote * 0.04)))

cache = {}
for source, dest, hauteur in IMAGES:
    if source not in cache: cache[source] = detourer(source)
    img = cache[source]
    if hauteur == 'buste': img, hauteur = buste(img), 120
    h = round(hauteur * ZOOM); w = round(img.width * h / img.height)
    img = img.resize((w, h), Image.LANCZOS)
    img.save(f'{SORTIE}/{dest}.png', optimize=True)
    print(dest, w, h)

# la danse : 2 images côte à côte, de la même taille, posées sur leurs pieds
cases = [Image.open(f'{SORTIE}/kedric_danse_{k}.png') for k in (1, 2)]
W, H = max(c.width for c in cases), max(c.height for c in cases)
bande = Image.new('RGBA', (W * 2, H))
for k, c in enumerate(cases): bande.paste(c, (k * W + (W - c.width) // 2, H - c.height))
bande.save(f'{SORTIE}/kedric_danse.png', optimize=True)
# le coach : 2 bustes côte à côte (1 = bras croisés, 2 = il parle au micro)
cases = [Image.open(f'{SORTIE}/kedric_coach_{k}.png') for k in (1, 2)]
W = max(c.width for c in cases); H = max(c.height for c in cases)
bande = Image.new('RGBA', (W * 2, H))
for k, c in enumerate(cases): bande.paste(c, (k * W + (W - c.width) // 2, 0))
bande.save(f'{SORTIE}/kedric_coach.png', optimize=True)
print('bandes : danse et coach', W, H)
# les images séparées ne servent plus (elles sont dans les bandes)
import os
for n in ('kedric_danse_1', 'kedric_danse_2', 'kedric_coach_1', 'kedric_coach_2'): os.remove(f'{SORTIE}/{n}.png')
