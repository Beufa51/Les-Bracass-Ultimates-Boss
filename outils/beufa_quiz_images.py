# Fabrique les images du QUIZ de Beufa à partir de assets_inbox/beufa_face.jpg (Beufa de face, en pied) :
#   beufa_portrait(_masque).jpg : sa tête pour la case « codec » (pixélisée façon 16 bits)
#   beufa_buste(_masque).jpg    : tête → ceinture, posé derrière son bureau dans la scène
# Le MASQUE (façon masque à gaz, gros yeux ronds, cartouche + tuyau) est dessiné ici, par-dessus le visage.
# Lancer : python3 outils/beufa_quiz_images.py
from PIL import Image, ImageDraw

SRC = 'assets_inbox/beufa_face.jpg'
OUT = 'assets/sprites/beufa/'
OEIL_G, OEIL_D = (410, 130), (457, 130)   # repères mesurés sur l'image source


def masque(im):
    im = im.copy()
    d = ImageDraw.Draw(im)
    cx = (OEIL_G[0] + OEIL_D[0]) // 2
    # le corps du masque : du front au menton, joues comprises
    d.ellipse((cx - 64, 92, cx + 64, 226), fill=(62, 66, 58), outline=(20, 22, 18), width=4)
    d.ellipse((cx - 56, 98, cx + 56, 150), fill=(78, 82, 72))                       # reflet du haut
    # les deux GROS YEUX ronds (verre sombre, cerclage métal, reflet)
    for (ex, ey) in (OEIL_G, OEIL_D):
        d.ellipse((ex - 22, ey - 20, ex + 22, ey + 22), fill=(140, 140, 130), outline=(20, 22, 18), width=3)
        d.ellipse((ex - 16, ey - 14, ex + 16, ey + 16), fill=(40, 10, 16))
        d.ellipse((ex - 10, ey - 9, ex - 2, ey - 2), fill=(230, 120, 120))
    # la cartouche filtrante (le « groin ») + ses rainures
    d.ellipse((cx - 24, 168, cx + 24, 214), fill=(110, 112, 100), outline=(20, 22, 18), width=3)
    for k in range(-14, 16, 7):
        d.line((cx + k, 176, cx + k, 206), fill=(50, 52, 46), width=2)
    # le tuyau qui descend vers le torse
    for t in range(0, 70, 6):
        d.ellipse((cx - 10 + t // 3, 208 + t, cx + 12 + t // 3, 222 + t), fill=(48, 50, 44), outline=(20, 22, 18))
    # les sangles vers les oreilles
    d.line((cx - 64, 150, cx - 78, 128), fill=(30, 30, 28), width=6)
    d.line((cx + 64, 150, cx + 78, 128), fill=(30, 30, 28), width=6)
    return im


def pixel(im, bloc):
    # pixélisation façon 16 bits : on réduit, puis on regrossit sans lissage
    w, h = im.size
    petit = im.resize((w // bloc, h // bloc), Image.BOX)
    return petit.resize((w // bloc * bloc, h // bloc * bloc), Image.NEAREST)


src = Image.open(SRC).convert('RGB')
for suffixe, image in (('', src), ('_masque', masque(src))):
    portrait = image.crop((342, 38, 542, 238))                 # carré tête + col
    pixel(portrait, 4).save(f'{OUT}beufa_portrait{suffixe}.jpg', quality=92)
    buste = image.crop((220, 30, 680, 560))                    # tête → ceinture
    pixel(buste, 3).save(f'{OUT}beufa_buste{suffixe}.jpg', quality=92)
print('ok')
