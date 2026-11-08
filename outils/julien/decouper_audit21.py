# Découpe les images livrées pour la section 21 des prompts (audit de novembre 2026) :
#   julien_main_vide.jpg       → julien_main_vide.png (main vide pendant « CONFISQUÉ ! »)
#   julien_eleves_2.jpg        → julien_eleve_<k>_mouille / _mouille_cache (phase 3, sprinklers ; rangée du BAS)
#   julien_surveillant_2.jpg   → julien_surveillant_essouffle / _attrape
#   julien_police_effets.jpg   → julien_lanceur_tousse / _farine, julien_bouclier_tousse / _farine (2e, 3e (CRS bleu) et 5e poses ignorées)
#   julien_bureau_renverse.jpg → julien_bureau_renverse.png (2e version, large)
#   julien_livres_vol.jpg     → julien_livre_<0-2>, julien_dico_<0-2> (en vol)
#   julien_crs_tousse.jpg      → julien_bouclier_tousse.png (CRS noir du jeu)
#   julien_fin_*.jpg           → julien_fin_*.jpg en 960 × 540 (écrans de fin illustrés)
# Chaque pose est réduite avec l'ÉCHELLE de son personnage (k) pour avoir la même taille que ses autres poses,
# puis posée en bas d'un cadre de la hauteur des autres images du personnage.
# Utilisation : python3 outils/julien/decouper_audit21.py
import sys, os
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from decouper_planches import charger, poses, detourer, ENTREE, SORTIE

# planche → [(nom, centre (x, y), échelle k, hauteur du cadre)]
PLANCHES = {
    'julien_main_vide.jpg': [('main_vide', (1010, 480), 240 / 560, 240)],
    'julien_eleves_2.jpg': [(f'eleve_{k}_{p}', (x, 600), 0.6 if k == 1 else 0.5, 180) for k, (x1, x2) in   # B est dessinée plus petite
                            enumerate([(118, 291), (467, 628), (817, 987), (1163, 1323)]) for p, x in (('mouille', x1), ('mouille_cache', x2))],
    'julien_surveillant_2.jpg': [('surveillant_essouffle', (340, 400), 0.215, 200), ('surveillant_attrape', (1060, 400), 0.215, 200)],
    'julien_police_effets.jpg': [(None, (361, 460), 0, 0), ('lanceur_tousse', (160, 470), 0.30, 200), ('lanceur_farine', (595, 460), 0.30, 200),
                                 (None, (830, 460), 0, 0), ('bouclier_farine', (1290, 470), 0.34, 200)],
    # 21c bis / 21d bis (2e livraison) : bureau renversé LARGE ; CRS noir qui tousse
    'julien_bureau_renverse.jpg': [('bureau_renverse', (700, 480), 0.25, None)],
    # 21h : livre et dico en vol, 3 images chacun (même hauteur : le jeu leur donne la hauteur de RG / HAUTEURS)
    'julien_livres_vol.jpg': [(f'{n}_{k}', (x, y), 1, 60) for n, y in (('livre', 190), ('dico', 575)) for k, x in enumerate((250, 760, 1230))],
    'julien_crs_tousse.jpg': [('bouclier_tousse', (740, 400), 0.235, 200)],
}
# les 2 dernières poses des policiers se touchent : on coupe entre elles (zones effacées en blanc avant la découpe)
EFFACER = {'julien_livres_vol.jpg': [(0, 0, 1408, 6), (0, 762, 1408, 768), (0, 0, 6, 768), (1401, 0, 1408, 768),
                                     (498, 0, 510, 768), (1050, 0, 1062, 768), (0, 378, 1408, 390)],
           'julien_police_effets.jpg': [(950, 0, 1182, 625), (950, 625, 1128, 768)]}
MIROIR = {'main_vide'}   # livrée en main GAUCHE : retournée pour faire la main droite (comme les autres mains)
FINS = ['julien_fin_gaze', 'julien_fin_attrape', 'julien_fin_colle', 'julien_fin_victoire']


def main():
    for fichier, liste in PLANCHES.items():
        if not os.path.exists(ENTREE + fichier):
            print('  (absente)', fichier); continue
        img = charger(fichier).copy()
        for x0, y0, x1, y1 in EFFACER.get(fichier, []):
            img[y0:y1, x0:x1] = 255
        masques, _ = poses(img, [c for _, c, _, _ in liste])
        for (nom, _, k, h), m in zip(liste, masques):
            if nom is None:   # pose ignorée (elle sert à ne pas coller ses taches à la pose voisine)
                continue
            if m is None:
                print('  !! pose introuvable :', nom); continue
            i = detourer(img, m, nettoyer=True)
            i = i.resize((max(1, round(i.width * k)), max(1, round(i.height * k))), Image.LANCZOS)
            if nom in MIROIR: i = i.transpose(Image.FLIP_LEFT_RIGHT)
            if h and i.height < h:
                c = Image.new('RGBA', (i.width, h), (0, 0, 0, 0)); c.paste(i, (0, h - i.height), i); i = c
            elif h and i.height > h:
                i = i.resize((round(i.width * h / i.height), h), Image.LANCZOS)
            i.save(SORTIE + f'julien_{nom}.png')
            print('  ', nom, i.size)
    for n in FINS:
        if os.path.exists(ENTREE + n + '.jpg'):
            Image.open(ENTREE + n + '.jpg').convert('RGB').resize((960, 540), Image.LANCZOS).save(SORTIE + n + '.jpg', quality=82)
            print('  ', n, '960 × 540')


if __name__ == '__main__':
    main()
