"""BOSS FINAL (mécha des Bracass') : prépare les images reçues de Fabien (assets_inbox/finale/).
- mecha_complet.jpg -> assets/sprites/finale/mecha.png (fond blanc retiré, 50 %) + les 6 PARTIES découpées dans le robot
  (mecha_<partie>.png : même taille que mecha.png, transparent ailleurs → on les superpose au même endroit)
- vaisseau.jpg -> vaisseau.png ; fond_espace.jpg -> fond.jpg (hauteur 540, le jeu le fait défiler)
- case du milieu du hub : assets/sprites/hub/select_mecha.png + select_mecha_ombre.png
Lancer : python3 outils/finale/preparer_images.py   (option --controle : image de vérification des zones)"""
import sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

ENTREE, SORTIE = 'assets_inbox/finale/', 'assets/sprites/finale/'

# zones des 6 parties, en pixels de mecha_complet.jpg (864 x 1216). Le TORSE (Beufa) = tout ce qui reste.
# Le robot nous fait FACE : son bras droit (Greg) est à GAUCHE de l'image, celui de Lionel à droite.
ZONES = {
    'julien': [(340, 0), (600, 0), (600, 262), (340, 262)],
    'greg':   [(30, 205), (335, 205), (335, 262), (285, 280), (285, 400), (262, 425), (262, 800), (215, 845), (150, 890), (30, 890)],
    'lionel': [(555, 240), (864, 240), (864, 800), (650, 800), (640, 640), (605, 590), (600, 300)],
    'kedric': [(170, 640), (300, 605), (405, 620), (440, 700), (458, 1216), (170, 1216)],
    'remi':   [(470, 700), (500, 610), (560, 600), (615, 600), (640, 640), (650, 800), (800, 800), (800, 1216), (458, 1216)],
}
# ordre de « prise » des pixels (une zone ne reprend pas ce qu'une précédente a pris) ; Beufa = le reste
PRISE = ['julien', 'greg', 'lionel', 'kedric', 'remi']
ORDRE = ['kedric', 'remi', 'lionel', 'greg', 'julien', 'beufa']


def detourer(chemin):
    """fond blanc relié aux bords -> transparent (+ trous blancs fermés assez grands)"""
    im = Image.open(chemin).convert('RGB')
    a = np.asarray(im).astype(int)
    blanc = (a.min(axis=2) > 225) & (a.max(axis=2) - a.min(axis=2) < 30)
    lab, _ = nd.label(blanc)
    bord = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fond = np.isin(lab, list(bord))
    pur = (a.min(axis=2) > 240) & (a.max(axis=2) - a.min(axis=2) < 12) & ~fond
    lab3, n3 = nd.label(pur)
    if n3:
        aires = nd.sum(pur, lab3, range(1, n3 + 1))
        fond |= np.isin(lab3, [i + 1 for i, s in enumerate(aires) if s > 400])
    fg = nd.binary_closing(~fond, iterations=2)
    alpha = (nd.gaussian_filter(fg.astype(float), 0.7) * 255).astype(np.uint8)
    rgba = np.dstack([np.asarray(im), alpha])
    return Image.fromarray(rgba, 'RGBA')


def masque(zone, taille):
    m = Image.new('L', taille, 0); ImageDraw.Draw(m).polygon(zone, fill=255)
    return np.asarray(m) > 0


# ---- le robot et ses parties ----
robot = detourer(ENTREE + 'mecha_complet.jpg')
A = np.asarray(robot)
pris = np.zeros(A.shape[:2], bool)
parties = {}
for nom in PRISE:
    m = masque(ZONES[nom], robot.size) & ~pris
    pris |= m; parties[nom] = m
parties['beufa'] = ~pris

if '--controle' in sys.argv:   # chaque partie teintée d'une couleur, pour vérifier les zones
    COUL = {'julien': (60, 200, 60), 'greg': (230, 40, 40), 'lionel': (40, 160, 230), 'kedric': (40, 60, 230),
            'remi': (230, 150, 30), 'beufa': (150, 150, 150)}
    c = A[:, :, :3].astype(float).copy()
    for nom, m in parties.items():
        sel = m & (A[:, :, 3] > 40); c[sel] = c[sel] * 0.45 + np.array(COUL[nom]) * 0.55
    Image.fromarray(c.astype(np.uint8)).save(sys.argv[sys.argv.index('--controle') + 1]); sys.exit()

# Fabien : le robot doit être tourné VERS TON VAISSEAU (à gauche) : tout est retourné en MIROIR après la découpe
# (les ZONES restent en coordonnées de l'image d'origine). Le lanceur de frisbees de Lionel vise ainsi à gauche.
MIROIR = Image.FLIP_LEFT_RIGHT
boite = robot.getbbox()
f = 0.5
taille = (round((boite[2] - boite[0]) * f), round((boite[3] - boite[1]) * f))
robot.crop(boite).resize(taille, Image.LANCZOS).transpose(MIROIR).save(SORTIE + 'mecha.png', optimize=True)
for nom, m in parties.items():
    a = A.copy(); a[~m, 3] = 0
    Image.fromarray(a, 'RGBA').crop(boite).resize(taille, Image.LANCZOS).transpose(MIROIR).save(SORTIE + f'mecha_{nom}.png', optimize=True)
print('mecha', taille)

# ---- le vaisseau (nez vers la droite) ----
v = detourer(ENTREE + 'vaisseau.jpg'); v = v.crop(v.getbbox())
v = v.resize((200, round(200 * v.height / v.width)), Image.LANCZOS); v.save(SORTIE + 'vaisseau.png', optimize=True)
print('vaisseau', v.size)

# ---- les 6 potes sonnés en tas (cinématique de fin, src/hub/FinaleScene.js) ----
import os
if os.path.exists(ENTREE + 'tas_bracass.jpg'):
    tas = detourer(ENTREE + 'tas_bracass.jpg'); tas = tas.crop(tas.getbbox())
    tas = tas.resize((760, round(760 * tas.height / tas.width)), Image.LANCZOS); tas.save(SORTIE + 'tas.png', optimize=True)
    print('tas', tas.size)

# ---- le décor (défile à l'horizontale) ----
d = Image.open(ENTREE + 'fond_espace.jpg').convert('RGB')
d = d.resize((round(d.width * 540 / d.height), 540), Image.LANCZOS); d.save(SORTIE + 'fond.jpg', quality=85)
print('fond', d.size)

# ---- la case du milieu du hub : le robot entier + son ombre ----
L, H = 240, 338
r = robot.crop(boite).transpose(MIROIR); r = r.resize((round(r.width * H / r.height), H), Image.LANCZOS)
case = Image.new('RGBA', (L, H)); case.alpha_composite(r, ((L - r.width) // 2, 0))
case.save('assets/sprites/hub/select_mecha.png', optimize=True)
al = np.asarray(case)[:, :, 3] > 90
liser = nd.binary_dilation(al, iterations=2) & ~al
o = np.zeros((H, L, 4), np.uint8); o[al] = [16, 20, 40, 255]; o[liser] = [190, 120, 255, 210]
Image.fromarray(o, 'RGBA').save('assets/sprites/hub/select_mecha_ombre.png', optimize=True)
print('case du hub', case.size)
