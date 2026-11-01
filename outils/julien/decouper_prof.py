# Découpe les 2 planches de JULIEN, le prof (niveau 2) : assets_inbox/julien/julien_prof_1.jpg et julien_prof_2.jpg
# → assets/sprites/julien/julien_julien_<pose>.png (fond transparent, les 8 poses au même cadre, pieds alignés).
# Les zones EXCLURE (texte « ART CLASS 101 » écrit par Gemini, livres qui volent : le jeu les dessine lui-même)
# sont effacées avant la découpe.
# Utilisation : python3 outils/julien/decouper_prof.py
import sys, os
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


if __name__ == '__main__':
    main()
