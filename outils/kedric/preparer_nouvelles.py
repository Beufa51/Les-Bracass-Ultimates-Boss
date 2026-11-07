# Prépare les 2 illustrations demandées par l'audit de Kédric (prompts n°3 et n°4 de propositions/kedric_prompts_images.md) :
#  - assets_inbox/kedric/kedric_def_course_planche.jpg -> kedric_def_course4.png (le défenseur qui court : 4 images côte à côte)
#  - assets_inbox/kedric/kedric_toi_reception.jpg      -> kedric_toi_reception.png (toi qui attrapes le ballon, de dos)
# Même traitement que preparer_images.py : fond retiré (rembg isnet-anime), bords nets, 1,5 fois la taille d'affichage.
# Utilisation : python3 outils/kedric/preparer_nouvelles.py   (depuis la racine du projet)
import numpy as np, cv2
from PIL import Image
from rembg import remove, new_session

ENTREE, SORTIE, ZOOM = 'assets_inbox/kedric', 'assets/sprites/kedric', 1.5
session = new_session('isnet-anime')

def masque_de(rgba):
    masque = (rgba[:, :, 3] > 40).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(masque, 8)
    if n > 1:   # on enlève les poussières
        grand = stats[1:, cv2.CC_STAT_AREA].max()
        masque = np.isin(lab, [k for k in range(1, n) if stats[k, cv2.CC_STAT_AREA] >= grand * 0.02]).astype(np.uint8)
    # petits trous bouchés (on garde les vrais vides, entre les bras par exemple)
    contour, _ = cv2.findContours(masque, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    plein = np.zeros_like(masque); cv2.drawContours(plein, contour, -1, 1, -1)
    nt, labt, statst, _ = cv2.connectedComponentsWithStats(((plein == 1) & (masque == 0)).astype(np.uint8), 8)
    for k in range(1, nt):
        if statst[k, cv2.CC_STAT_AREA] < 400: masque[labt == k] = 1
    return masque

def detourer(nom):
    rgba = np.array(remove(Image.open(f'{ENTREE}/{nom}.jpg').convert('RGB'), session=session))
    masque = masque_de(rgba)
    rgba[:, :, 3] = (np.clip(cv2.GaussianBlur(masque.astype(np.float32), (3, 3), 0), 0, 1) * 255).astype(np.uint8)
    return rgba, masque

def recadrer(rgba, masque):
    ys, xs = np.nonzero(masque)
    return Image.fromarray(rgba).crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

# ---------- le défenseur qui court : 4 cases séparées par des colonnes vides ----------
rgba, masque = detourer('kedric_def_course_planche')
colonnes = masque.any(axis=0)
cases, x = [], 0
while x < len(colonnes):
    if colonnes[x]:
        x0 = x
        while x < len(colonnes) and colonnes[x]: x += 1
        if x - x0 > 40: cases.append((x0, x))
    x += 1
assert len(cases) == 4, f'{len(cases)} cases trouvées au lieu de 4'
images = []
for x0, x1 in cases:
    m = np.zeros_like(masque); m[:, x0:x1] = masque[:, x0:x1]
    images.append(recadrer(rgba, m))
# même échelle pour les 4 (la plus grande fait la hauteur voulue), posées sur leurs pieds, centrées
H = round(205 * ZOOM); k = H / max(i.height for i in images)
images = [i.resize((round(i.width * k), round(i.height * k)), Image.LANCZOS) for i in images]
W = max(i.width for i in images)
bande = Image.new('RGBA', (W * 4, H))
for n, i in enumerate(images): bande.paste(i, (n * W + (W - i.width) // 2, H - i.height))
bande.save(f'{SORTIE}/kedric_def_course4.png', optimize=True)
print('kedric_def_course4', W, H)

# ---------- toi qui attrapes le ballon ----------
img = recadrer(*detourer('kedric_toi_reception'))
h = round(300 * ZOOM); w = round(img.width * h / img.height)   # bras levés : le corps garde la taille de ta course
img.resize((w, h), Image.LANCZOS).save(f'{SORTIE}/kedric_toi_reception.png', optimize=True)
print('kedric_toi_reception', w, h)
