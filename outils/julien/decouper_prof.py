# Découpe les 2 planches de JULIEN, le prof (niveau 2) : assets_inbox/julien/julien_prof_1.jpg et julien_prof_2.jpg
# → assets/sprites/julien/julien_julien_<pose>.png (fond transparent, les 8 poses au même cadre, pieds alignés).
# Les zones EXCLURE (texte « ART CLASS 101 » écrit par Gemini, livres qui volent : le jeu les dessine lui-même)
# sont effacées avant la découpe.
# Utilisation : python3 outils/julien/decouper_prof.py
import sys, os
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from decouper_planches import charger, poses, detourer, meme_taille, SORTIE

HAUTEUR = 240
PLANCHES = [
    ('julien_prof_1.jpg', [('marche0', (185, 400)), ('marche1', (520, 400)), ('bras', (855, 400)), ('lance', (1180, 420))],
     [(1230, 150, 1376, 280)]),                                   # le livre lancé
    ('julien_prof_2.jpg', [('touche', (180, 380)), ('dos', (660, 380)), ('rage', (1020, 380)), ('vaincu', (1400, 430))],
     [(430, 90, 575, 270), (290, 505, 400, 635)]),               # « ART CLASS 101 », le livre tombé
]


def main():
    noms, ims = [], []
    for fichier, liste, exclure in PLANCHES:
        img = charger(fichier).copy()
        for x0, y0, x1, y1 in exclure:
            img[y0:y1, x0:x1] = 255
        masques, _ = poses(img, [c for _, c in liste])
        for (nom, _), m in zip(liste, masques):
            if m is None:
                print('  !! pose introuvable :', nom); continue
            noms.append(nom); ims.append(detourer(img, m, nettoyer=True))
    for n, i in zip(noms, meme_taille(ims, HAUTEUR)):
        i.save(SORTIE + f'julien_julien_{n}.png')
        print('  ', n, i.size)
    planche_3()


# 3e planche (audit nov. 2026, prompt 21a) : 2e image de dos, « AU TABLEAU ! », cri, « CONFISQUÉ ! », la RÈGLE.
# Chaque pose est réduite à 240 px de haut ; la règle (bras levés, Julien plus petit sur l'image) est réduite pour que
# son CORPS (tête → pieds, TETE_REGLE) fasse 225 px, et le haut des règles qui dépasse est coupé.
PLANCHE_3 = ('julien_prof_3.jpg', [('dos2', (130, 365)), ('pointe', (385, 365)), ('crie', (115, 1050)),
                                   ('confisque', (375, 1050)), ('regle', (340, 1750))])
TAILLE_3 = {'dos2': 214}   # hauteur du corps (px, sur 240) : sinon 228
TETE_REGLE = 1550   # ligne (sur la planche) du haut de ses cheveux, sous les règles


def planche_3():
    from PIL import Image
    fichier, liste = PLANCHE_3
    if not os.path.exists('assets_inbox/julien/' + fichier):
        return
    img = charger(fichier)
    masques, _ = poses(img, [c for _, c in liste])
    for (nom, _), m in zip(liste, masques):
        if m is None:
            print('  !! pose introuvable :', nom); continue
        i = detourer(img, m, nettoyer=True)
        if nom == 'regle':
            bas = int(np.where(m.any(axis=1))[0].max()); haut = int(np.where(m.any(axis=1))[0].min())
            k = 225 / (bas - TETE_REGLE)
            i = i.resize((round(i.width * k), round(i.height * k)), Image.LANCZOS)
            i = i.crop((0, i.height - HAUTEUR, i.width, i.height))
        else:   # même taille que les poses des 2 premières planches (« dos2 » alterne avec « dos » : 214 px)
            h = TAILLE_3.get(nom, 228)
            i = i.resize((round(i.width * h / i.height), h), Image.LANCZOS)
            c = Image.new('RGBA', (i.width, HAUTEUR), (0, 0, 0, 0)); c.paste(i, (0, HAUTEUR - h), i); i = c
        i.save(SORTIE + f'julien_julien_{nom}.png')
        print('  ', nom, i.size)


if __name__ == '__main__':
    main()
