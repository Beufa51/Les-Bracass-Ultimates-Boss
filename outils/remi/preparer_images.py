# Prépare les images de Rémi (assets_inbox/remi/ -> assets/sprites/remi/) :
#  - fond blanc retiré (le blanc relié au bord devient transparent) + liseré blanc « démélangé » sur les bords
#  - remi_velo_planche.jpg : découpée en poses (2 rangées) -> remi_velo.png (bande de cases égales, roues en bas)
#    ordre : 6 poses de pédalage, saut, chute
#  - remi_presentation.jpg -> remi_presentation.png
# Lancer : python3 outils/remi/preparer_images.py
import numpy as np
from PIL import Image
from scipy import ndimage

SRC, DST = 'assets_inbox/remi/', 'assets/sprites/remi/'

def detourer(img, seuil=232, grand=10**9):
    a = np.asarray(img.convert('RGB')).astype(int)
    blanc = (a.min(axis=2) >= seuil)
    lab, _ = ndimage.label(blanc)
    bord = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    # + les grandes zones blanches fermées (l'intérieur des roues, entre les rayons)
    tailles = ndimage.sum(blanc, lab, range(1, lab.max() + 1))
    grandes = [i + 1 for i, t in enumerate(tailles) if t > grand]
    fond = np.isin(lab, list(bord) + grandes)
    fond = ndimage.binary_opening(fond, iterations=1)
    alpha = np.where(fond, 0, 255).astype(np.uint8)
    # LISERÉ BLANC (audit V3) : sur une bande de 4 px le long du fond, chaque pixel est « démélangé » du blanc
    # (méthode « couleur vers transparence ») : un gris clair devient un noir à moitié transparent, un trait noir reste plein.
    bande = ndimage.binary_dilation(fond, iterations=4) & ~fond
    c = a.astype(float)
    opac = np.clip((255 - c).max(axis=2) / 255 * 1.25, 0, 1)          # 0 = blanc pur, 1 = couleur franche
    opac = np.where(bande, opac, 1.0)
    alpha = (np.where(fond, 0, 255) * opac).astype(float)
    sur = np.maximum(opac, 1e-3)[:, :, None]
    c = np.where(bande[:, :, None], 255 - (255 - c) / sur, c)            # couleur sans le blanc mélangé
    alpha = ndimage.uniform_filter(alpha, 2)                            # bord adouci
    rgba = np.dstack([np.clip(c, 0, 255).astype(np.uint8), alpha.clip(0, 255).astype(np.uint8)])
    return Image.fromarray(rgba, 'RGBA')

def bandes(plein, axe, ecart):
    # intervalles pleins le long d'un axe (séparés par au moins 'ecart' pixels vides)
    p = plein.any(axis=axe)
    res, debut, vide = [], None, 0
    for i, v in enumerate(p):
        if v:
            if debut is None: debut = i
            vide = 0; fin = i
        elif debut is not None:
            vide += 1
            if vide >= ecart: res.append((debut, fin + 1)); debut = None
    if debut is not None: res.append((debut, fin + 1))
    return [r for r in res if r[1] - r[0] > 40]

def planche_velo():
    im = detourer(Image.open(SRC + 'remi_velo_planche.jpg'), seuil=200, grand=60)
    al = np.asarray(im)[:, :, 3] > 40
    # chaque pose = un groupe de pixels reliés (un peu épaissis pour garder les rayons des roues) ;
    # les petits morceaux (casquette qui vole) rejoignent la pose la plus proche
    lab, n = ndimage.label(ndimage.binary_dilation(al, iterations=3))
    boites = ndimage.find_objects(lab)
    tailles = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    grands = [i for i in range(n) if tailles[i] > 8000]
    groupes = {i: list(boites[i]) for i in grands}
    for i in range(n):
        if i in groupes or tailles[i] < 300: continue
        b = boites[i]; cy, cx = (b[0].start + b[0].stop) / 2, (b[1].start + b[1].stop) / 2
        j = min(grands, key=lambda g: abs((groupes[g][0].start + groupes[g][0].stop) / 2 - cy) + abs((groupes[g][1].start + groupes[g][1].stop) / 2 - cx))
        g = groupes[j]; groupes[j] = [slice(min(g[0].start, b[0].start), max(g[0].stop, b[0].stop)), slice(min(g[1].start, b[1].start), max(g[1].stop, b[1].stop))]
    rangs = sorted(groupes.values(), key=lambda b: (b[0].start > 380, b[1].start))
    poses = []
    for b in rangs:
        c = im.crop((b[1].start, b[0].start, b[1].stop, b[0].stop))
        m = np.zeros(lab.shape, bool); m[b[0], b[1]] = True
        poses.append(c)
    print('poses trouvées :', len(poses), [p.size for p in poses])
    # rangée 1 : pédale, pédale, pédale, saut, chute (sans vélo) ; rangée 2 : pédale x3, chute avec le vélo
    # la rangée 2 est dessinée un peu plus grande : remise à l'échelle de la rangée 1 (largeur des vélos qui pédalent)
    k = np.mean([p.size[0] for p in poses[0:3]]) / np.mean([p.size[0] for p in poses[5:8]])
    poses = poses[:5] + [p.resize((round(p.size[0] * k), round(p.size[1] * k)), Image.LANCZOS) for p in poses[5:]]
    ordre = [0, 1, 2, 5, 6, 7, 3, 8]
    poses = [poses[i] for i in ordre]
    W = max(p.size[0] for p in poses); H = max(p.size[1] for p in poses)
    bande = Image.new('RGBA', (W * len(poses), H), (0, 0, 0, 0))
    for k, p in enumerate(poses):
        bande.paste(p, (k * W + (W - p.size[0]), H - p.size[1]))   # posé en bas, CALÉ À DROITE (la roue avant) : plus de vélo qui glisse d'une image à l'autre
    bande.save(DST + 'remi_velo.png')
    print('remi_velo.png', W, H, len(poses))

def presentation():
    im = detourer(Image.open(SRC + 'remi_presentation.jpg'))
    a = np.asarray(im)[:, :, 3] > 40
    lab, n = ndimage.label(a)
    t = ndimage.sum(a, lab, range(1, n + 1))
    garde = np.isin(lab, [i + 1 for i in range(n) if t[i] > 2000])
    im.putalpha(Image.fromarray(np.where(garde, np.asarray(im)[:, :, 3], 0).astype(np.uint8)))
    im = im.crop(im.getbbox())
    im.save(DST + 'remi_presentation.png')
    print('remi_presentation.png', im.size)

def planche_pong():
    # 4 cases (2 x 2) séparées par des traits noirs, chacune finie en bas par un bout de table en bois (retiré) :
    # attend, lance, boit, nargue -> remi_pong.png (Rémi de face, coupé à la taille)
    im = Image.open(SRC + 'remi_pong_planche.jpg').convert('RGB')
    cases = [(3, 3, 405, 580), (426, 3, 829, 580), (3, 644, 405, 1216), (426, 644, 829, 1216)]
    poses = [detourer(im.crop(c), grand=1500) for c in cases]
    W = max(p.size[0] for p in poses); H = max(p.size[1] for p in poses)
    bande = Image.new('RGBA', (W * 4, H), (0, 0, 0, 0))
    for k, p in enumerate(poses): bande.paste(p, (k * W + (W - p.size[0]) // 2, H - p.size[1]))
    bande.save(DST + 'remi_pong.png')
    print('remi_pong.png', W, H)

def poses_planche(fichier, grand=20000, seuil_rangee=None, bas=None):
    # découpe une planche en poses : groupes de pixels reliés (un peu épaissis) ; les petits morceaux (traits de vitesse)
    # rejoignent la pose la plus proche ; on ne garde QUE les pixels de chaque pose. Rangées de haut en bas, puis de gauche à droite.
    src = Image.open(SRC + fichier)
    if bas: src = src.crop((0, 0, src.size[0], bas))   # coupe sous les poses (ex. la ligne du sol qui relie les voitures)
    im = detourer(src)
    al = np.asarray(im)[:, :, 3] > 40
    lab, n = ndimage.label(ndimage.binary_dilation(al, iterations=2))
    boites = ndimage.find_objects(lab)
    tailles = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    grands = [i for i in range(n) if tailles[i] > grand]
    groupes = {i: list(boites[i]) for i in grands}
    membres = {i: [i + 1] for i in grands}   # étiquettes de chaque pose (pour ne garder QUE ses pixels)
    for i in range(n):
        if i in groupes or tailles[i] < 150: continue
        b = boites[i]; cy, cx = (b[0].start + b[0].stop) / 2, (b[1].start + b[1].stop) / 2
        # un trait de vitesse rejoint le corps dont la boîte est la plus proche (souvent le poing juste à droite)
        def dist(g):
            gg = groupes[g]
            dx = max(gg[1].start - cx, 0, cx - gg[1].stop); dy = max(gg[0].start - cy, 0, cy - gg[0].stop)
            # à égalité (dans les deux boîtes) : le corps dont le centre est le plus proche en hauteur
            return (dx + dy, abs((gg[0].start + gg[0].stop) / 2 - cy) + abs(gg[1].stop - cx) * 0.2)
        j = min(grands, key=dist); g = groupes[j]; membres[j].append(i + 1)
        groupes[j] = [slice(min(g[0].start, b[0].start), max(g[0].stop, b[0].stop)), slice(min(g[1].start, b[1].start), max(g[1].stop, b[1].stop))]
    milieu = seuil_rangee or al.shape[0] / 2
    ordre = sorted(groupes, key=lambda j: (groupes[j][0].start > milieu, groupes[j][1].start))
    rgba = np.asarray(im).copy()
    poses = []
    for j in ordre:
        b = groupes[j]
        m = np.isin(lab, membres[j])
        r = rgba.copy(); r[:, :, 3] = np.where(m, r[:, :, 3], 0)
        poses.append(Image.fromarray(r, 'RGBA').crop((b[1].start, b[0].start, b[1].stop, b[0].stop)))
    print(fichier, ': poses', [p.size for p in poses])
    return poses

def bande_gauche(poses, nom):
    # cases ALIGNÉES À GAUCHE (le corps reste au même endroit, le bras part à droite), posées en bas
    W = max(p.size[0] for p in poses); H = max(p.size[1] for p in poses)
    bande = Image.new('RGBA', (W * len(poses), H), (0, 0, 0, 0))
    for k, p in enumerate(poses): bande.paste(p, (k * W, H - p.size[1]))
    bande.save(DST + nom)
    print(nom, W, H, len(poses), 'largeurs', [p.size[0] for p in poses])

def planche_porte():
    # 2 rangées de 3 poses de profil (Rémi en haut, toi en bas) : garde, coup, impact (traits de vitesse) -> remi_porte.png
    bande_gauche(poses_planche('remi_porte_planche.jpg'), 'remi_porte.png')

def planches_dos():
    # LA PORTE VUE DE DOS (audit C1). Toi : rangée 1 = garde, élan, coup ; rangée 2 = garde, élan haut, impact
    # -> remi_toi_dos.png : garde, élan, coup, impact. Rémi : rangée 1 = garde, coup ; rangée 2 = impact -> remi_dos.png
    t = poses_planche('remi_toi_dos_planche.jpg')
    bande_gauche([t[3], t[1], t[2], t[5]], 'remi_toi_dos.png')
    r = poses_planche('remi_porte_dos_planche.jpg')
    bande_gauche([r[0], r[1], r[2]], 'remi_dos.png')

def planche_bourres():
    # 4 bourrés sur une ligne : debout, sursaute, allongé (bouteilles), traverse de face.
    # Les petits morceaux (gouttes, « Zzz », pointillés du zigzag, traits de mouvement) sont jetés ;
    # les moyens (bouteilles par terre) rejoignent le bourré le plus proche. -> remi_bourres.png (posés en bas, centrés)
    im = detourer(Image.open(SRC + 'remi_bourres_planche.jpg'), grand=300)
    al = np.asarray(im)[:, :, 3] > 40
    lab, n = ndimage.label(ndimage.binary_dilation(al, iterations=2))
    boites = ndimage.find_objects(lab)
    tailles = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    grands = [i for i in range(n) if tailles[i] > 20000]
    groupes = {i: list(boites[i]) for i in grands}
    membres = {i: [i + 1] for i in grands}
    for i in range(n):
        if i in groupes or tailles[i] < 1500: continue
        b = boites[i]; cy, cx = (b[0].start + b[0].stop) / 2, (b[1].start + b[1].stop) / 2
        j = min(grands, key=lambda g: max(groupes[g][1].start - cx, 0, cx - groupes[g][1].stop) + max(groupes[g][0].start - cy, 0, cy - groupes[g][0].stop))
        g = groupes[j]; membres[j].append(i + 1)
        groupes[j] = [slice(min(g[0].start, b[0].start), max(g[0].stop, b[0].stop)), slice(min(g[1].start, b[1].start), max(g[1].stop, b[1].stop))]
    ordre = sorted(groupes, key=lambda j: groupes[j][1].start)
    rgba = np.asarray(im).copy(); poses = []
    for j in ordre:
        b = groupes[j]; r = rgba.copy(); r[:, :, 3] = np.where(np.isin(lab, membres[j]), r[:, :, 3], 0)
        poses.append(Image.fromarray(r, 'RGBA').crop((b[1].start, b[0].start, b[1].stop, b[0].stop)))
    print('bourrés : poses', [p.size for p in poses])
    W = max(p.size[0] for p in poses); H = max(p.size[1] for p in poses)
    bande = Image.new('RGBA', (W * len(poses), H), (0, 0, 0, 0))
    for k, p in enumerate(poses): bande.paste(p, (k * W + (W - p.size[0]) // 2, H - p.size[1]))
    bande.save(DST + 'remi_bourres.png')
    print('remi_bourres.png', W, H, len(poses))

def rue():
    # fond de rue (défile derrière le vélo) : bande noire du bas coupée, bords gauche / droit fondus l'un dans l'autre
    # sur 90 px pour que l'image se répète sans couture -> remi_rue.jpg
    a = np.asarray(Image.open(SRC + 'remi_rue.jpg').convert('RGB')).astype(float)[:575]
    F = 90
    t = np.linspace(0, 1, F)[None, :, None]
    debut = a[:, -F:] * (1 - t) + a[:, :F] * t       # la fin de l'image se fond dans le début
    out = np.concatenate([debut, a[:, F:-F]], axis=1)
    Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(DST + 'remi_rue.jpg', quality=88)
    print('remi_rue.jpg', out.shape[1], out.shape[0])

def tuile(a, F=90):
    # bords gauche / droit fondus l'un dans l'autre sur F px : l'image se répète sans couture
    t = np.linspace(0, 1, F)[None, :, None]
    return np.concatenate([a[:, -F:] * (1 - t) + a[:, :F] * t, a[:, F:-F]], axis=1)

def rues_quartiers():
    # 2e quartier (les quais) : vue de profil, répétable -> remi_rue2.jpg (hauteur 575 comme la rue de base)
    a = np.asarray(Image.open(SRC + 'remi_rue2.jpg').convert('RGB')).astype(float)[:575]
    Image.fromarray(tuile(a).clip(0, 255).astype(np.uint8)).save(DST + 'remi_rue2.jpg', quality=88)
    # 3e quartier (centre-ville) : l'image est en perspective (la rue file au centre) : on garde les deux rangées de
    # façades à terrasses (gauche et droite) mises bout à bout -> remi_rue3.jpg
    b = np.asarray(Image.open(SRC + 'remi_rue3.jpg').convert('RGB')).astype(float)[:575]
    g, d = b[:, :640], b[:, 1150:]
    F = 60; t = np.linspace(0, 1, F)[None, :, None]
    joint = np.concatenate([g[:, :-F], g[:, -F:] * (1 - t) + d[:, :F] * t, d[:, F:]], axis=1)
    Image.fromarray(tuile(joint).clip(0, 255).astype(np.uint8)).save(DST + 'remi_rue3.jpg', quality=88)
    print('remi_rue2.jpg / remi_rue3.jpg', tuile(a).shape[1], tuile(joint).shape[1])

def petites_images():
    # tremplin, Rémi qui t'accueille (en pied) : fond retiré, recadrés
    for nom, mini in (('remi_tremplin', 3000), ('remi_accueil', 5000)):
        im = detourer(Image.open(SRC + nom + '.jpg'), grand=400)
        a = np.asarray(im)[:, :, 3] > 40
        lab, n = ndimage.label(a)
        t = ndimage.sum(a, lab, range(1, n + 1))
        garde = np.isin(lab, [i + 1 for i in range(n) if t[i] > mini])   # (la ligne du sol du tremplin est fine : jetée)
        im.putalpha(Image.fromarray(np.where(garde, np.asarray(im)[:, :, 3], 0).astype(np.uint8)))
        im = im.crop(im.getbbox()); im.save(DST + nom + '.png'); print(nom + '.png', im.size)
    # voitures : 3 cases (citadine, berline, camionnette), posées en bas, centrées
    p = poses_planche('remi_voitures_planche.jpg', grand=20000, bas=468)
    W = max(x.size[0] for x in p); H = max(x.size[1] for x in p)
    bande = Image.new('RGBA', (W * len(p), H), (0, 0, 0, 0))
    for k, x in enumerate(p): bande.paste(x, (k * W + (W - x.size[0]) // 2, H - x.size[1]))
    bande.save(DST + 'remi_voitures.png'); print('remi_voitures.png', W, H, [x.size for x in p])
    # intérieur du bar (fond du beer pong) à la largeur du jeu
    im = Image.open(SRC + 'remi_bar_interieur.jpg').convert('RGB')
    im = im.resize((960, round(im.size[1] * 960 / im.size[0])), Image.LANCZOS); im.save(DST + 'remi_bar_interieur.jpg', quality=88)
    print('remi_bar_interieur.jpg', im.size)

def videur():
    # les INTRUS de la porte (videur, gars qui vient pisser, mamie) : 2 poses coupées à la taille (distrait, furieux)
    # -> remi_<nom>.png, posées en bas, centrées
    for nom in ('videur', 'pisseur', 'mamie'):
        p = poses_planche(f'remi_{nom}_planche.jpg', grand=20000)
        W = max(x.size[0] for x in p); H = max(x.size[1] for x in p)
        bande = Image.new('RGBA', (W * len(p), H), (0, 0, 0, 0))
        for k, x in enumerate(p): bande.paste(x, (k * W + (W - x.size[0]) // 2, H - x.size[1]))
        bande.save(DST + f'remi_{nom}.png'); print(f'remi_{nom}.png', W, H, len(p))

def planches_velo_v15():
    # pêcheur (2 poses, la canne fine est gardée : petits morceaux rattachés), obstacles (4 objets ; la ligne du sol est
    # coupée), chorale (2 poses ; les « La la » et les notes restent avec le groupe) -> cases posées en bas, centrées
    def bande(poses, nom, aligne='centre'):
        W = max(x.size[0] for x in poses); H = max(x.size[1] for x in poses)
        b = Image.new('RGBA', (W * len(poses), H), (0, 0, 0, 0))
        for k, x in enumerate(poses): b.paste(x, (k * W + ((W - x.size[0]) // 2 if aligne == 'centre' else W - x.size[0]), H - x.size[1]))
        b.save(DST + nom); print(nom, W, H, len(poses), [x.size for x in poses])
    bande(poses_planche('remi_pecheur_planche.jpg', grand=15000), 'remi_pecheur.png', 'droite')   # (calé à droite : le corps ne bouge pas)
    bande(poses_planche('remi_obstacles_planche.jpg', grand=3000, bas=574), 'remi_obstacles.png')
    bande(poses_planche('remi_chorale_planche.jpg', grand=30000), 'remi_chorale.png')

def coups_porte():
    # planche des COUPS (V16) : Rémi (ligne 1) et toi (ligne 2), en pied, garde / coup / impact ; une porte est dessinée à
    # droite des impacts : on l'EFFACE (on ne garde à droite de son bord que la peau, le jean, le blanc de l'éclat, et les
    # traits noirs tout près d'eux) -> remi_coups_sans_porte.png, puis découpe -> remi_dos.png / remi_toi_dos.png
    a = np.asarray(Image.open(SRC + 'remi_coups_planche.jpg').convert('RGB')).astype(int)
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    peau = (r > 205) & (g > 150) & (b > 120) & (r - b > 30)   # (le bois de la porte est plus sombre : r < 180)
    eclat = a.min(axis=2) > 215
    jean = (b > r + 15) & (b > 80)
    garder = ndimage.binary_dilation(peau | eclat, iterations=5) | ndimage.binary_dilation(jean, iterations=2)
    zone = np.zeros(r.shape, bool); zone[:, 712:] = True
    out = a.copy()
    out[zone & ~garder] = 255
    # (le blanc pur de l'éclat qui touche la porte devient du blanc de fond : on le teinte à peine pour le garder)
    out[zone & eclat & garder] = np.clip(out[zone & eclat & garder] - [0, 10, 40], 0, 255)
    # le chant de la porte (bande claire) : effacé partout sauf à hauteur des poings et des pieds
    for y0, y1 in ((0, 100), (250, 545), (610, 715), (880, 1165)):
        out[y0:y1, 712:] = 255
    pres_peau = ndimage.binary_dilation(peau, iterations=3)
    for y0, y1 in ((100, 250), (715, 880)):                      # à hauteur des poings : le chant de la porte, sauf la peau
        bande = ~pres_peau[y0:y1, 712:742]
        out[y0:y1, 712:742][bande] = 255
    for y0, y1 in ((545, 610), (1165, 1260)):                    # à hauteur des pieds : le bas de la porte
        out[y0:y1, 745:] = 255
        clair = out[y0:y1, 712:745].min(axis=2) > 150                   # (le bois clair, pas les chaussures)
        out[y0:y1, 712:745][clair] = 255
    Image.fromarray(out.astype(np.uint8)).save(SRC + 'remi_coups_sans_porte.png')
    p = poses_planche('remi_coups_sans_porte.png', grand=20000)
    bande_gauche(p[0:3], 'remi_dos.png')
    bande_gauche(p[3:6], 'remi_toi_dos.png')

def facade():
    # façade du bar (arrivée du vélo) : fond blanc retiré (et entre les pieds des tabourets) -> remi_bar_facade.png
    im = detourer(Image.open(SRC + 'remi_bar_facade.jpg'), grand=300, seuil=225)
    a = np.asarray(im)[:, :, 3] > 40
    lab, n = ndimage.label(a)
    t = ndimage.sum(a, lab, range(1, n + 1))
    garde = np.isin(lab, [i + 1 for i in range(n) if t[i] > 5000])   # miettes du fond (bruit du JPEG) jetées
    im.putalpha(Image.fromarray(np.where(garde, np.asarray(im)[:, :, 3], 0).astype(np.uint8)))
    im = im.crop(im.getbbox())
    im.save(DST + 'remi_bar_facade.png')
    print('remi_bar_facade.png', im.size)

def decor_porte():
    # fond du jeu de la porte (toilettes du bar), mis à la largeur du jeu (960) -> remi_porte_decor.jpg
    # (la porte de l'image est à x ≈ 774 - 914, sol à y ≈ 467 : voir RemiPorte.js)
    im = Image.open(SRC + 'remi_porte_decor.jpg').convert('RGB')
    im = im.resize((960, round(im.size[1] * 960 / im.size[0])), Image.LANCZOS)
    im.save(DST + 'remi_porte_decor.jpg', quality=88)
    print('remi_porte_decor.jpg', im.size)

def planche_baby():
    # V19 BABYFOOT : planche de 7 cases encadrées de noir (étiquettes en haut à gauche, bout de table en bois en bas, retirés)
    # -> remi_baby.png, 7 cases égales ALIGNÉES SUR LE HAUT DE LA CASQUETTE (le bas est caché par la table du jeu) :
    # 0 attend, 1 penché vers SA droite (à gauche de l'écran), 2 penché vers SA gauche, 3 roulette, 4 marque, 5 boit, 6 râle
    im = Image.open(SRC + 'remi_babyfoot_planche.jpg').convert('RGB')
    cases = [(4, 4, 406, 586), (426, 4, 829, 281), (426, 327, 829, 601), (4, 648, 406, 921),
             (426, 648, 829, 925), (4, 967, 406, 1240), (426, 967, 829, 1240)]
    poses = []
    for k, c in enumerate(cases):
        p = detourer(im.crop(c), grand=1500)
        a = np.asarray(p).copy()
        al = a[:, :, 3] > 40
        lab, n = ndimage.label(ndimage.binary_dilation(al, iterations=2))
        tailles = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
        gros = int(np.argmax(tailles)) + 1
        garde = [gros]
        for i, b in enumerate(ndimage.find_objects(lab)):
            if i + 1 == gros or tailles[i] < 400: continue
            if b[0].stop < 62 and b[1].stop < 260: continue          # l'étiquette (texte en haut à gauche, 2 lignes)
            if k == 6 and b[1].start > 230: continue                 # la bulle « Mais elle était dedans ! »
            garde.append(i + 1)                                       # traits de vitesse de la roulette...
        a[:, :, 3] = np.where(np.isin(lab, garde), a[:, :, 3], 0)
        q = Image.fromarray(a, 'RGBA'); q = q.crop(q.getbbox())
        if k == 0: q = q.resize((round(q.size[0] * 0.82), round(q.size[1] * 0.82)), Image.LANCZOS)   # dessiné plus grand
        poses.append(q)
    W = max(p.size[0] for p in poses); H = max(p.size[1] for p in poses)
    bande = Image.new('RGBA', (W * len(poses), H), (0, 0, 0, 0))
    for k, p in enumerate(poses): bande.paste(p, (k * W + (W - p.size[0]) // 2, 0), p)
    bande.save(DST + 'remi_baby.png')
    print('remi_baby.png', W, H, [p.size for p in poses])
    fond = Image.open(SRC + 'remi_bar_babyfoot.jpg').convert('RGB')
    fond = fond.resize((960, round(fond.size[1] * 960 / fond.size[0])), Image.LANCZOS); fond.save(DST + 'remi_bar_babyfoot.jpg', quality=88)
    print('remi_bar_babyfoot.jpg', fond.size)

planche_velo()
presentation()
planche_pong()
planche_porte()
planches_dos()
coups_porte()
planche_bourres()
rue()
facade()
rues_quartiers()
petites_images()
videur()
planches_velo_v15()
decor_porte()
planche_baby()
