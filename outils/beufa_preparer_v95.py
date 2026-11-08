"""V95 : prépare les planches livrées par Fabien après l'audit (assets_inbox/beufa/) pour le jeu.

Chaque personnage est repéré comme une tache d'encre (composantes connexes : les fusils qui débordent sur le voisin
ne gênent plus), recopié tel quel (même échelle) sur UNE rangée blanche, pieds alignés en bas, bien espacés :
le découpeur du jeu (preparerImages) retrouve ensuite chaque case tout seul.
Pour que les nouveaux gardes aient la MÊME TAILLE que les anciens, on compare la largeur du CASQUE à la hauteur :
le script affiche le réglage `echelle` à mettre dans le manifeste (1 = la plus haute image remplit la case).
Usage : python3 outils/beufa_preparer_v95.py
"""
import pathlib
import numpy as np
from PIL import Image, ImageOps
from scipy import ndimage

RACINE = pathlib.Path(__file__).resolve().parent.parent
BOITE = RACINE / 'assets_inbox/beufa'
SORTIE = RACINE / 'assets/sprites/beufa'
SEUIL = 225          # plus clair que ça (sur les 3 canaux) = fond blanc
HAUTEUR_SORTIE = 200 # hauteur de la plus grande image dans le fichier produit (≈ 3 × la taille en jeu)


def personnages(fichier):
    """Les personnages d'une planche, dans l'ordre de lecture (rangée par rangée, de gauche à droite)."""
    im = Image.open(BOITE / fichier).convert('RGB')
    a = np.array(im).astype(int)
    encre = a.min(axis=2) < SEUIL
    lab, n = ndimage.label(ndimage.binary_dilation(encre, iterations=2))
    objs = []
    for i, sl in enumerate(ndimage.find_objects(lab)):
        masque = (lab[sl] == i + 1) & encre[sl]
        if masque.sum() < 1500:
            continue   # miettes
        objs.append((sl, masque))
    # rangées : on regroupe par le haut des boîtes
    objs.sort(key=lambda o: o[0][0].start)
    rangs, cur = [], []
    for o in objs:
        if cur and o[0][0].start > cur[0][0][0].start + (cur[0][0][0].stop - cur[0][0][0].start) * 0.5:
            rangs.append(cur); cur = []
        cur.append(o)
    if cur:
        rangs.append(cur)
    res = []
    for r in rangs:
        for sl, masque in sorted(r, key=lambda o: o[0][1].start):
            morceau = np.array(im)[sl].copy()
            morceau[~masque] = 255
            res.append(Image.fromarray(morceau.astype('uint8')))
    return res


def casque(img):
    """Largeur du haut de la tête (10 % du haut) / hauteur de l'image."""
    a = np.array(img.convert('L')) < SEUIL
    h = a.shape[0]
    largeurs = [np.ptp(r.nonzero()[0]) + 1 for r in a[: max(3, h // 10)] if r.any()]
    return max(largeurs) / h


def planche(nom, images, mesurer=None):
    hmax = max(i.height for i in images)
    k = HAUTEUR_SORTIE / hmax
    images = [i.resize((max(1, round(i.width * k)), max(1, round(i.height * k))), Image.LANCZOS) for i in images]
    ecart = 40
    L = sum(i.width for i in images) + ecart * (len(images) + 1)
    H = HAUTEUR_SORTIE + 2 * ecart
    toile = Image.new('RGB', (L, H), 'white')
    x = ecart
    for i in images:
        toile.paste(i, (x, H - ecart - i.height))
        x += i.width + ecart
    toile.save(SORTIE / f'{nom}.jpg', quality=92, subsampling=0)
    print(f'{nom}.jpg : {len(images)} images')


def echelle(nouvelles, reference):
    """Réglage `echelle` pour que le casque des nouvelles images ait la largeur du casque de la référence."""
    ref = np.median([casque(i) * i.height for i in reference]) / max(i.height for i in reference)
    nouv = np.median([casque(i) * i.height for i in nouvelles]) / max(i.height for i in nouvelles)
    return round(float(ref / nouv), 2)


# la référence : les gardes de face actuels (V75)
ref_garde = []
a = np.array(Image.open(SORTIE / 'beufa_garde_face.jpg').convert('RGB')).astype(int)
encre = a.min(axis=2) < SEUIL
lab, n = ndimage.label(ndimage.binary_dilation(encre, iterations=2))
for i, sl in enumerate(ndimage.find_objects(lab)):
    if ((lab[sl] == i + 1) & encre[sl]).sum() > 300:
        ref_garde.append(Image.fromarray(np.where(((lab[sl] == i + 1) & encre[sl])[..., None], a[sl], 255).astype('uint8')))

# 1. Beufa de dos (cinématique) : 2 rangées de 4 = un cycle de 8
planche('beufa_boss_dos', personnages('beufa_boss_dos.jpg'))

# 2. le garde qui court : 3 rangées de 8 (face, dos, profil vers la droite)
course = personnages('beufa_garde_course_3vues.jpg')
assert len(course) == 24, len(course)
for i, sens in enumerate(['face', 'dos', 'profil']):
    planche(f'beufa_garde_course_{sens}', course[i * 8:(i + 1) * 8])
print('  echelle course (face) :', echelle(course[:8], ref_garde))

# 3. le garde de profil : un pas en 4 poses (contact, bas, passage, haut)
planche('beufa_garde_profil4', personnages('beufa_garde_profil_4poses.jpg'))

# 4. le garde surpris : face, dos, profil
surpris = personnages('beufa_garde_surpris.jpg')
planche('beufa_garde_surpris', surpris)
print('  echelle surpris :', echelle(surpris[:1], ref_garde))

# 5. le garde qui tourne la tête : la planche = [profil droit, 3/4 gauche, face, 3/4 droit, profil droit coupé]
#    → jeu : [profil GAUCHE (miroir), 3/4 gauche, face, 3/4 droit, profil droit]
tete = personnages('beufa_garde_tete.jpg')
planche('beufa_garde_tete', [ImageOps.mirror(tete[0]), tete[1], tete[2], tete[3], tete[0]])

# 6. Snake rattrapé : mains en l'air (rangée 1, image 1), puis à genoux (rangée 4, 2 dernières)
snake = personnages('beufa_heros_planche_attrape.jpg')
planche('beufa_heros_attrape', [snake[0], snake[-2], snake[-1]])
