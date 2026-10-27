# Découpe les planches de FRIME du SHOWTIME (fond blanc, poses séparées) :
#  - Kédric (assets_inbox/kedric_frime_planche.jpg, 3 lignes de 2) : gauche, droite (il pointe), haut (doigt au ciel),
#    bas (grand écart), micro (« à toi ! »), triche (clin d'œil) → kedric_frime_*.png
#  - toi, de dos (assets_inbox/kedric_toi_frime_planche.jpg, 4 poses en ligne) : gauche, droite (ballon tendu), haut (saut),
#    bas (à genoux) → kedric_toi_frime_*.png
# Fond retiré avec rembg (isnet-anime), comme les autres illustrations ; enregistrées 1,5 fois plus grandes que l'écran.
# Utilisation : python3 outils/kedric/decouper_frime.py   (depuis la racine du projet)
import numpy as np, cv2
from PIL import Image
from rembg import remove, new_session

SORTIE = 'assets/sprites/kedric'
# planche, préfixe des images, poses dans l'ordre de lecture, hauteur à l'écran de la plus grande pose, hauteur d'une ligne
# de la planche (pixels ; 0 = une seule ligne, poses rangées de gauche à droite)
PLANCHES = [
    ('assets_inbox/kedric_frime_planche.jpg', 'kedric_frime_', ['gauche', 'droite', 'haut', 'bas', 'micro', 'triche'], 265, 400),
    ('assets_inbox/kedric_toi_frime_planche.jpg', 'kedric_toi_frime_', ['gauche', 'droite', 'haut', 'bas'], 250, 0),
]
session = new_session('isnet-anime')

for SOURCE, prefixe, noms, hauteur, ligne in PLANCHES:
    im = cv2.imread(SOURCE)
    gris = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    # les personnages : tout ce qui n'est pas blanc, un peu épaissi pour souder chaque pose
    masque = cv2.dilate((gris < 235).astype(np.uint8), np.ones((3, 3), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(masque, 8)
    boites = [stats[k][:4] for k in range(1, n) if stats[k][4] > 5000]
    assert len(boites) == len(noms), len(boites)
    boites.sort(key=lambda b: ((b[1] + b[3] / 2) // ligne * 10000 if ligne else 0) + b[0])   # par ligne, puis de gauche à droite

    poses = []
    for x, y, w, h in boites:
        m = 6
        case = Image.fromarray(cv2.cvtColor(im[max(0, y - m):y + h + m, max(0, x - m):x + w + m], cv2.COLOR_BGR2RGB))
        rgba = np.array(remove(case, session=session))
        garde = (rgba[:, :, 3] > 40).astype(np.uint8)
        # le personnage seul (la plus grosse tache), trous bouchés
        nn, ll, ss, _ = cv2.connectedComponentsWithStats(garde, 8)
        garde = (ll == 1 + int(np.argmax(ss[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
        contours, _ = cv2.findContours(garde, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        plein = np.zeros_like(garde); cv2.drawContours(plein, contours, -1, 1, -1)
        trous = ((plein == 1) & (garde == 0)).astype(np.uint8)
        nt, lt, st, _ = cv2.connectedComponentsWithStats(trous, 8)
        for k in range(1, nt):
            if st[k, cv2.CC_STAT_AREA] < 300: garde[lt == k] = 1
        rgba[:, :, 3] = (cv2.GaussianBlur(garde.astype(np.float32), (3, 3), 0) * 255).astype(np.uint8)
        ys, xs = np.nonzero(garde)
        poses.append(Image.fromarray(rgba).crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)))

    # même échelle pour toutes : la plus grande pose fait la hauteur voulue
    k = round(hauteur * 1.5) / max(p.height for p in poses)
    for nom, p in zip(noms, poses):
        p = p.resize((round(p.width * k), round(p.height * k)), Image.LANCZOS)
        p.save(f'{SORTIE}/{prefixe}{nom}.png', optimize=True)
        print(nom, p.width, p.height)
