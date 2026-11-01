# Découpe les planches de Julien (niveau manif) déposées dans assets_inbox/julien/ en une image par pose,
# fond blanc rendu transparent, dans assets/sprites/julien/.
# Chaque pose est repérée par son CENTRE approximatif sur la planche : on prend les taches dessinées les plus proches
# de ce centre (les lignes de grille que Gemini ajoute parfois sont effacées avant).
# Toutes les poses d'un même personnage ont la même taille d'image (pieds sur la même ligne) : il ne change pas
# de taille en changeant de pose.
# Utilisation : python3 outils/julien/decouper_planches.py
import os
import numpy as np
from PIL import Image
from scipy import ndimage as nd

ENTREE = 'assets_inbox/julien/'
SORTIE = 'assets/sprites/julien/'

# groupe : (planche, hauteur finale en pixels, [(nom, (x, y) du centre), ...]) ; nom None = pose ignorée
GROUPES = {
    'policier': ('julien_policier.jpg', 200, [
        ('lanceur_marche0', (125, 450)), ('lanceur_marche1', (345, 450)), ('lanceur_bras', (560, 430)),
        ('lanceur_lance', (800, 450)), ('lanceur_touche', (1050, 450)), ('lanceur_fuite', (1265, 440))]),
    'crs': ('julien_crs.jpg', 200, [
        ('bouclier_marche0', (140, 200)), ('bouclier_marche1', (420, 200)), ('bouclier_cri', (760, 200)),
        ('bouclier_charge', (1240, 200)), (None, (140, 580)), ('bouclier_essouffle', (420, 590)),
        ('bouclier_touche', (690, 580)), ('bouclier_fuite', (990, 580)), (None, (1270, 580))]),
    'manif1': ('julien_manifestants.jpg', 240, [
        ('manifestant_0', (175, 400)), ('manifestant_1', (540, 400)), ('manifestant_2', (880, 400)), ('manifestant_3', (1240, 400))]),
    'manif2': ('julien_manifestants_2.jpg', 240, [
        ('manifestant_4', (190, 400)), ('manifestant_5', (540, 400)), ('manifestant_6', (920, 400)), ('manifestant_7', (1250, 400))]),
    'main': ('julien_main.jpg', 240, [('main_tient', (345, 460)), ('main_lance', (1020, 440))]),
    'tete_regards': ('julien_tete_regards.jpg', 96, [
        (f'r{r}c{c}', (140 + c * 281, 140 + r * 255)) for r in range(3) for c in range(5)]),
    'tete_expr': ('julien_tete_expressions.jpg', 96, [
        (f'e{r}c{c}', (140 + c * 281, 140 + r * 255)) for r in range(3) for c in range(5)]),
}
# objets : chacun sa propre taille (pas de taille commune)
OBJETS = ('julien_objets.jpg', [
    ('barriere', (245, 245), 110), ('poubelle', (600, 245), 130), ('oeufs', (885, 250), 90), ('sandwich', (1215, 265), 60),
    ('oeuf', (220, 620), 40), ('splat', (570, 640), 50), ('grenade', (890, 560), 70), ('nuage', (1215, 540), 160)])

# Tête du héros : 5 niveaux d'amochage × regard (gauche, face, droite), puis les expressions.
# ('rLcC', miroir ?) : la planche des regards ne suit pas exactement la demande → regards manquants = miroir d'un autre.
TETES = [
    ('r0c0', 0), ('r0c1', 0), ('r0c4', 0),          # niveau 0 : frais
    ('r1c0', 0), ('r1c1', 0), ('r1c0', 1),          # niveau 1 : bleu sur la joue
    ('r1c4', 1), ('r1c2', 0), ('r1c4', 0),          # niveau 2 : pansement
    ('r2c0', 0), ('r2c1', 0), ('r2c0', 1),          # niveau 3 : œil au beurre noir
    ('r2c2', 0), ('r2c3', 0), ('r2c4', 0),          # niveau 4 : épuisé
    ('e0c0', 0), ('e0c1', 0), ('e0c2', 0), ('e0c3', 0), ('e0c4', 0),   # aïe gauche, aïe droite, tousse, content, KO
]


def charger(fichier):
    return np.asarray(Image.open(ENTREE + fichier).convert('RGB')).astype(np.int16)


def masque_dessin(img):
    """Vrai là où il y a un dessin (pas le fond blanc), lignes de grille effacées."""
    mn, mx = img.min(axis=2), img.max(axis=2)
    dessin = ~((mn > 228) & (mx - mn < 25))
    h, w = dessin.shape
    fond = ~dessin
    # lignes de grille : rangées / colonnes dessinées presque d'un bord à l'autre (elles passent entre les poses)
    for y in np.where(dessin.mean(axis=1) > 0.9)[0]:
        haut, bas = max(0, y - 9), min(h - 1, y + 9)
        efface = fond[haut] | fond[bas]   # un côté vide suffit : le trait longe une pose
        dessin[y, efface] = False
        dessin[max(0, y - 2):y + 3, efface] = False
    for x in np.where(dessin.mean(axis=0) > 0.9)[0]:
        g, d = max(0, x - 9), min(w - 1, x + 9)
        efface = fond[:, g] | fond[:, d]
        for dx in range(-2, 3):
            if 0 <= x + dx < w:
                dessin[efface, x + dx] = False
    # cadre tout autour de la planche
    dessin[:6] = False; dessin[-6:] = False; dessin[:, :6] = False; dessin[:, -6:] = False
    return dessin


def poses(img, centres):
    """Pour chaque centre : le masque des taches dont le centre est le plus proche (taches < 25 px ignorées)."""
    dessin = masque_dessin(img)
    lab, n = nd.label(dessin, structure=np.ones((3, 3)))
    if n == 0:
        return [None] * len(centres)
    aires = nd.sum(np.ones_like(lab), lab, range(1, n + 1))
    cms = nd.center_of_mass(dessin, lab, range(1, n + 1))
    choix = [[] for _ in centres]
    for i, ((cy, cx), a) in enumerate(zip(cms, aires)):
        if a < 25:
            continue
        d = [np.hypot(cx - x, cy - y) for (x, y) in centres]
        k = int(np.argmin(d))
        if d[k] < 320:
            choix[k].append(i + 1)
    return [np.isin(lab, c) if c else None for c in choix], dessin


def detourer(img, m):
    """Image RGBA de la pose : boîte englobante, fond (blanc relié au bord) transparent."""
    ys, xs = np.where(m)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    bloc = img[y0:y1, x0:x1]
    garde = m[y0:y1, x0:x1]
    # blanc à l'intérieur (œuf, yeux, pancarte) : on le garde s'il n'est pas relié au bord
    clair = ~garde
    lab, _ = nd.label(clair)
    bords = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    transparent = np.isin(lab, list(bords))
    alpha = np.where(transparent, 0, 255).astype(np.uint8)
    rgba = np.dstack([bloc.clip(0, 255).astype(np.uint8), alpha])
    return Image.fromarray(rgba, 'RGBA')


def meme_taille(images, hauteur):
    """Même cadre pour toutes les poses : centrées en largeur, posées sur la ligne du bas, puis réduites."""
    L = max(i.width for i in images)
    H = max(i.height for i in images)
    sorties = []
    for i in images:
        c = Image.new('RGBA', (L, H), (0, 0, 0, 0))
        c.paste(i, ((L - i.width) // 2, H - i.height), i)
        sorties.append(c.resize((max(1, round(L * hauteur / H)), hauteur), Image.LANCZOS))
    return sorties


def main():
    os.makedirs(SORTIE, exist_ok=True)
    morceaux = {}
    for groupe, (fichier, hauteur, liste) in GROUPES.items():
        img = charger(fichier)
        masques, _ = poses(img, [c for _, c in liste])
        noms, ims = [], []
        for (nom, _), m in zip(liste, masques):
            if nom is None:
                continue
            if m is None:
                print('  !! pose introuvable :', nom)
                continue
            noms.append(nom)
            ims.append(detourer(img, m))
        if groupe.startswith('tete'):
            for n, i in zip(noms, ims):
                morceaux[n] = i
            continue
        for n, i in zip(noms, meme_taille(ims, hauteur)):
            i.save(SORTIE + f'julien_{n}.png')
            print('  ', n, i.size)

    # tête du héros : 20 cases de même taille sur UNE planche (ligne) julien_tetes.png
    cases = [morceaux[n].transpose(Image.FLIP_LEFT_RIGHT) if miroir else morceaux[n] for n, miroir in TETES]
    cases = meme_taille(cases, 96)
    L = cases[0].width
    planche = Image.new('RGBA', (L * len(cases), 96), (0, 0, 0, 0))
    for k, c in enumerate(cases):
        planche.paste(c, (k * L, 0), c)
    planche.save(SORTIE + 'julien_tetes.png')
    print('   tetes', L, 'x 96 ×', len(cases))

    fichier, liste = OBJETS
    img = charger(fichier)
    masques, _ = poses(img, [c for _, c, _ in liste])
    for (nom, _, h), m in zip(liste, masques):
        i = detourer(img, m)
        i = i.resize((max(1, round(i.width * h / i.height)), h), Image.LANCZOS)
        i.save(SORTIE + f'julien_{nom}.png')
        print('  ', nom, i.size)

    # murs : carré réduit à 128 × 128
    for nom in ['mur_briques', 'mur_immeuble', 'mur_boutique', 'mur_tag', 'mur_palissade', 'mur_lycee', 'portail_lycee', 'mur_boutique2']:
        if os.path.exists(ENTREE + f'julien_{nom}.jpg'):
            Image.open(ENTREE + f'julien_{nom}.jpg').convert('RGB').resize((128, 128), Image.LANCZOS).save(SORTIE + f'julien_{nom}.png')
            print('  ', nom, '128 x 128')


if __name__ == '__main__':
    main()
