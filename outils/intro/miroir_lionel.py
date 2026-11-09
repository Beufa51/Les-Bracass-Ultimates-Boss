"""Pose de Lionel : l'image reçue a les bras inversés par rapport à la pose de Jeice -> on la retourne (miroir)
et on remet à l'endroit les écritures (NEO-SPORTS, logo, frisbee au sol).
assets_inbox/intro/pose_lionel_originale.jpg -> assets_inbox/intro/pose_lionel.jpg (puis preparer_poses.py)"""
import numpy as np
from PIL import Image, ImageOps, ImageDraw

im = Image.open('assets_inbox/intro/pose_lionel_originale.jpg').convert('RGB'); W = im.width
m = ImageOps.mirror(im)
a = np.asarray(im).astype(int)
# 1) NEO-SPORTS (lettres claires sur vert) : on repeint le vert sous le texte retourné, puis on recolle les lettres
x0, y0, x1, y1 = 377, 377, 482, 403
vert = tuple(int(v) for v in np.median(a[y0:y1, x0:x1][(a[y0:y1, x0:x1, 1] > a[y0:y1, x0:x1, 0] + 40)], axis=0))
ImageDraw.Draw(m).rectangle((W - x1, y0, W - x0, y1), fill=vert)
patch = im.crop((x0, y0, x1, y1)); pa = np.asarray(patch).astype(int)
masque = Image.fromarray((np.clip((pa.min(2) - 110) / 80, 0, 1) * 255).astype(np.uint8))   # bords doux
m.paste(patch, (W - x1, y0), masque)
# 2) logo rond et 3) frisbee : recollés tels quels à leur place miroir (formes rondes : ça tombe juste)
for (bx0, by0, bx1, by1) in [(441, 343, 480, 372), (385, 1112, 600, 1182)]:
    p = im.crop((bx0, by0, bx1, by1))
    rond = Image.new('L', p.size, 0); ImageDraw.Draw(rond).ellipse((1, 1, p.width - 2, p.height - 2), fill=255)
    m.paste(p, (W - bx1, by0), rond)
m.save('assets_inbox/intro/pose_lionel.jpg', quality=95)
