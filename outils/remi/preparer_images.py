# Prépare les images de Rémi (assets_inbox/remi/ -> assets/sprites/remi/) :
#  - fond blanc retiré (le blanc relié au bord devient transparent)
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
    alpha = ndimage.uniform_filter(alpha.astype(float), 2).astype(np.uint8)   # bord adouci
    rgba = np.dstack([a.astype(np.uint8), alpha])
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
    im = detourer(Image.open(SRC + 'remi_velo_planche.jpg'), seuil=205, grand=350)
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
        bande.paste(p, (k * W + (W - p.size[0]) // 2, H - p.size[1]))   # posé en bas, centré
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

def planche_porte():
    # 2 rangées de 3 poses de profil (Rémi en haut, toi en bas) : garde, coup, impact (traits de vitesse)
    # -> remi_porte.png : 6 cases ALIGNÉES À GAUCHE (le pied arrière reste au même endroit), posées en bas
    im = detourer(Image.open(SRC + 'remi_porte_planche.jpg'))
    al = np.asarray(im)[:, :, 3] > 40
    lab, n = ndimage.label(ndimage.binary_dilation(al, iterations=2))
    boites = ndimage.find_objects(lab)
    tailles = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    grands = [i for i in range(n) if tailles[i] > 20000]
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
    ordre = sorted(groupes, key=lambda j: (groupes[j][0].start > al.shape[0] / 2, groupes[j][1].start))
    rgba = np.asarray(im).copy()
    poses = []
    for j in ordre:
        b = groupes[j]
        m = np.isin(lab, membres[j])
        r = rgba.copy(); r[:, :, 3] = np.where(m, r[:, :, 3], 0)
        poses.append(Image.fromarray(r, 'RGBA').crop((b[1].start, b[0].start, b[1].stop, b[0].stop)))
    print('porte : poses', [p.size for p in poses])
    W = max(p.size[0] for p in poses); H = max(p.size[1] for p in poses)
    bande = Image.new('RGBA', (W * len(poses), H), (0, 0, 0, 0))
    for k, p in enumerate(poses): bande.paste(p, (k * W, H - p.size[1]))
    bande.save(DST + 'remi_porte.png')
    print('remi_porte.png', W, H, len(poses))

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

planche_velo()
presentation()
planche_pong()
planche_porte()
planche_bourres()
rue()
facade()
