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
    'main_pancarte': ('julien_main_pancarte.jpg', 240, [('main_pancarte', (330, 350)), ('main_pancarte_tir', (1150, 380))]),
    'main_tomates': ('julien_main_tomates.jpg', 240, [('main_tomates', (330, 330)), ('main_tomates_tir', (1060, 370))]),
    'main_eau': ('julien_main_eau.jpg', 240, [('main_eau', (340, 460)), ('main_eau_tir', (1130, 420))]),
    'main_fumigenes': ('julien_main_fumigenes.jpg', 240, [('main_fumigenes', (360, 330)), ('main_fumigenes_tir', (1060, 500))]),
    # niveau 2 : centres À AJUSTER quand l'image sera livrée
    'main_sarbacane': ('julien_main_sarbacane.jpg', 240, [('main_sarbacane', (340, 400)), ('main_sarbacane_tir', (1100, 400))]),
    # MINI-NIVEAU « LE LYCÉE » : surveillant (le pion), dame de cantine, fayot
    'surveillant': ('julien_surveillant.jpg', 200, [
        ('surveillant_marche0', (135, 400)), ('surveillant_marche1', (380, 400)), ('surveillant_cri', (610, 400)),
        ('surveillant_charge', (820, 420)), ('surveillant_touche', (1045, 400)), ('surveillant_fuite', (1265, 400))]),
    'cantiniere': ('julien_cantiniere.jpg', 190, [
        ('cantiniere_marche0', (135, 420)), ('cantiniere_marche1', (385, 420)), ('cantiniere_bras', (620, 400)),
        ('cantiniere_lance', (870, 420)), ('cantiniere_touche', (1065, 440)), ('cantiniere_fuite', (1280, 410))]),
    'fayot': ('julien_fayot.jpg', 200, [
        ('fayot_bras', (178, 394)), ('fayot_crie', (541, 400)), ('fayot_saute', (881, 360)), ('fayot_fuite', (1234, 394))]),
    # élèves assis (rangée du haut ; celle du bas est un doublon) : A content, A caché, B…, D caché
    'eleves': ('julien_eleves.jpg', 180, [(f'eleve_{k // 2}_{"content" if k % 2 == 0 else "cache"}', (x, 200))
        for k, x in enumerate([115, 300, 465, 630, 815, 990, 1165, 1325])]),
    'tete_regards': ('julien_tete_regards.jpg', 96, [
        (f'r{r}c{c}', (140 + c * 281, 140 + r * 255)) for r in range(3) for c in range(5)]),
    'tete_expr': ('julien_tete_expressions.jpg', 96, [
        (f'e{r}c{c}', (140 + c * 281, 140 + r * 255)) for r in range(3) for c in range(5)]),
}
# objets : chacun sa propre taille (pas de taille commune)
OBJETS = ('julien_objets.jpg', [
    ('barriere', (245, 245), 110), ('poubelle', (600, 245), 130), ('oeufs', (885, 250), 90), ('sandwich', (1215, 265), 60),
    ('oeuf', (220, 620), 40), ('splat', (570, 640), 50), ('grenade', (890, 560), 70), ('nuage', (1215, 540), 160)])

# gros objets du décor, une image chacun : nom → hauteur finale
SEULS = {'statue': 240, 'camion': 140, 'colonne': 220}

OBJETS_ARMES = ('julien_objets_armes.jpg', [
    ('tomates', (245, 215), 90), ('eau_pistolet', (760, 240), 70), ('fumigenes', (1215, 215), 90),
    ('tomate', (240, 585), 40), ('splat_rouge', (760, 580), 50), ('fumee', (1210, 570), 160)])

# objets qui manquaient (bonus, sac et nuage de farine, goutte d'eau, fumigène en vol) ; 2e sac de farine ignoré
OBJETS_BONUS = ('julien_objets_bonus.jpg', [
    ('echarpe', (176, 190), 60), ('cafe', (528, 200), 55), ('kway', (880, 180), 55), ('farine', (1232, 190), 90),
    (None, (176, 576), 90), ('nuage_farine', (528, 570), 160), ('eau', (880, 570), 24), ('fumi', (1232, 560), 50)])

# objets de la CLASSE (niveau 2) ; la 2e copie est ignorée
OBJETS_CLASSE = ('julien_objets_classe.jpg', [
    ('table', (145, 190), 110), ('bureau', (495, 190), 120), ('livre', (825, 185), 50), ('dico', (1060, 190), 60),
    ('copie', (1290, 185), 50), (None, (115, 555), 50), ('craie', (350, 555), 24), ('sarbacane', (565, 570), 70),
    ('extincteur', (820, 560), 110), ('cartable', (1055, 580), 80), ('canette', (1290, 580), 50)])

# traits de grille que le nettoyage automatique rate (cases de largeurs différentes selon la rangée) :
# planche → [(x0, y0, x1, y1), ...] effacés en blanc
TRAITS = {
    'julien_surveillant.jpg': [(255, 0, 262, 768), (930, 0, 937, 768)],   # poses qui se touchent
    'julien_cantiniere.jpg': [(940, 150, 1110, 290)],                    # la louche en vol (le projectile, dessiné à part)
    'julien_objets_classe.jpg': [(x - 3, 0, x + 4, 386) for x in (292, 703, 938, 1173)]
          + [(x - 3, 380, x + 4, 768) for x in (234, 469, 703, 938, 1173)] + [(0, 380, 1408, 388)]}

# murs de la CLASSE (niveau 2) : 2 de large pour 3 de haut, réduits à 128 × 192 ; le tableau est coupé en 3
MURS_CLASSE = ['mur_classe', 'mur_classe_affiche', 'fenetres_classe', 'porte_classe']

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


# Murs dont un PANNEAU unique (plaque de rue, nom du lycée…) se verrait répété sur chaque case : on le recouvre avec
# un morceau du même mur pris ailleurs. (x0, y0, x1, y1) = zone à recouvrir, (sx, sy) = coin du morceau copié
# (sur l'image 1024 × 1024 ; décalages multiples de la hauteur d'une rangée pour garder l'alignement).
SANS_PANNEAU = {
    'mur_briques': [((636, 376, 836, 504), (636, 504))],
    'mur_immeuble': [((800, 30, 1000, 150), (400, 30))],
    'mur_tag': [((670, 20, 1000, 225), (40, 20))],
    'mur_lycee': [((236, 170, 796, 318), (236, 810)), ((332, 704, 692, 776), (332, 896))],
}


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


def detourer(img, m, nettoyer=False):
    """Image RGBA de la pose : boîte englobante, fond (blanc relié au bord) transparent.
    nettoyer (personnages) : les TROUS blancs enfermés (entre un bras levé et la pancarte…) deviennent transparents
    s'ils sont assez larges (> 20 px dans les 2 sens : on garde les rayures d'une marinière, les yeux, les baskets),
    et le liseré clair autour de la silhouette est retiré."""
    ys, xs = np.where(m)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    bloc = img[y0:y1, x0:x1]
    garde = m[y0:y1, x0:x1]
    # blanc à l'intérieur (œuf, yeux, pancarte) : on le garde s'il n'est pas relié au bord
    clair = ~garde
    lab, _ = nd.label(clair)
    bords = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    transparent = np.isin(lab, list(bords))
    if nettoyer:
        mn, mx = bloc.min(axis=2), bloc.max(axis=2)
        blanc = (mn > 225) & (mx - mn < 30)
        lab2, n2 = nd.label(blanc & ~transparent)
        for i, sl in enumerate(nd.find_objects(lab2)):
            if sl and sl[0].stop - sl[0].start > 20 and sl[1].stop - sl[1].start > 20:
                transparent |= lab2 == i + 1
        clair = (mn > 205) & (mx - mn < 40)
        for _ in range(3):   # liseré : pixel clair qui touche le transparent
            voisin = nd.binary_dilation(transparent)
            transparent |= voisin & clair
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
        if not os.path.exists(ENTREE + fichier):
            print('  (absente :', fichier + ')')
            continue
        img = charger(fichier).copy()
        for x0, y0, x1, y1 in TRAITS.get(fichier, []):
            img[y0:y1, x0:x1] = 255
        masques, _ = poses(img, [c for _, c in liste])
        noms, ims = [], []
        for (nom, _), m in zip(liste, masques):
            if nom is None:
                continue
            if m is None:
                print('  !! pose introuvable :', nom)
                continue
            noms.append(nom)
            ims.append(detourer(img, m, nettoyer=groupe in ('policier', 'manif1', 'manif2')))   # pas le CRS : les reflets blancs du bouclier
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

    for fichier, liste in (OBJETS, OBJETS_ARMES, OBJETS_BONUS, OBJETS_CLASSE):
        if not os.path.exists(ENTREE + fichier):
            continue
        img = charger(fichier).copy()
        for x0, y0, x1, y1 in TRAITS.get(fichier, []):
            img[y0:y1, x0:x1] = 255
        masques, _ = poses(img, [c for _, c, _ in liste])
        for (nom, _, h), m in zip(liste, masques):
            if nom is None or m is None:
                continue
            i = detourer(img, m)
            i = i.resize((max(1, round(i.width * h / i.height)), h), Image.LANCZOS)
            i.save(SORTIE + f'julien_{nom}.png')
            print('  ', nom, i.size)

    # gros objets : UN objet par image (toutes les taches dessinées)
    for nom, h in SEULS.items():
        if not os.path.exists(ENTREE + f'julien_{nom}.jpg'):
            continue
        img = charger(f'julien_{nom}.jpg')
        dessin = masque_dessin(img)
        lab, n = nd.label(dessin, structure=np.ones((3, 3)))
        aires = nd.sum(np.ones_like(lab), lab, range(1, n + 1))
        m = np.isin(lab, [i + 1 for i, a in enumerate(aires) if a >= 200])
        # trait de « sol » dessiné sous l'objet (le camion) : il enfermait du blanc entre les roues → on l'enlève
        ys, xs = np.where(m); larg = xs.max() - xs.min() + 1
        for y in range(ys.max(), max(ys.min(), ys.max() - 40), -1):
            if m[y].sum() > 0.6 * larg: m[y] = False
        i = detourer(img, m)
        i = i.resize((max(1, round(i.width * h / i.height)), h), Image.LANCZOS)
        i.save(SORTIE + f'julien_{nom}.png')
        print('  ', nom, i.size)

    # murs : carré réduit à 128 × 128
    for nom in ['mur_briques', 'mur_immeuble', 'mur_boutique', 'mur_tag', 'mur_palissade', 'mur_lycee', 'portail_lycee', 'mur_boutique2', 'mur_rideau',
                'mur_casiers', 'mur_couloir', 'mur_cantine']:   # (les 3 derniers : le lycée, niveau 2)
        if os.path.exists(ENTREE + f'julien_{nom}.jpg'):
            mur = Image.open(ENTREE + f'julien_{nom}.jpg').convert('RGB')
            if nom in SANS_PANNEAU:
                # version AVEC panneau gardée à part (le jeu la pose sur quelques cases seulement)
                mur.resize((128, 128), Image.LANCZOS).save(SORTIE + f'julien_{nom}_panneau.png')
                propre = mur.copy()
                for (x0, y0, x1, y1), (sx, sy) in SANS_PANNEAU[nom]:
                    propre.paste(mur.crop((sx, sy, sx + x1 - x0, sy + y1 - y0)), (x0, y0))
                mur = propre
            mur.resize((128, 128), Image.LANCZOS).save(SORTIE + f'julien_{nom}.png')
            print('  ', nom, '128 x 128', '(+ version avec panneau)' if nom in SANS_PANNEAU else '')

    for nom in MURS_CLASSE:
        if os.path.exists(ENTREE + f'julien_{nom}.jpg'):
            Image.open(ENTREE + f'julien_{nom}.jpg').convert('RGB').resize((128, 192), Image.LANCZOS).save(SORTIE + f'julien_{nom}.png')
            print('  ', nom, '128 x 192')
    if os.path.exists(ENTREE + 'julien_tableau.jpg'):
        t = Image.open(ENTREE + 'julien_tableau.jpg').convert('RGB')
        for k in range(3):
            t.crop((k * t.width // 3, 0, (k + 1) * t.width // 3, t.height)).resize((128, 192), Image.LANCZOS).save(SORTIE + f'julien_tableau_{k}.png')
        print('   tableau 3 x 128 x 192')


if __name__ == '__main__':
    main()
