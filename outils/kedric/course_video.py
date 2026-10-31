# Fabrique la bande de course (kedric_toi_course6.png) à partir de la VIDÉO du propriétaire (coureur vu de dos, fond blanc).
# Le coureur s'éloigne : chaque image est détourée, recadrée sur le personnage et remise à la MÊME hauteur
# (pieds en bas). On repère une foulée complète (deux pas) par ressemblance des jambes, puis on en garde N images.
# Utilisation : python3 outils/kedric/course_video.py assets_inbox/kedric_toi_course_video.mp4 [N=8]
import sys, subprocess, tempfile, glob, numpy as np
from PIL import Image
VIDEO = sys.argv[1]; N = int(sys.argv[2]) if len(sys.argv) > 2 else 8
SORTIE, L, H = 'assets/sprites/kedric/kedric_toi_course6.png', 197, 326
d = tempfile.mkdtemp()
subprocess.run(['ffmpeg', '-v', 'error', '-i', VIDEO, d + '/%03d.png'], check=True)
poses = []
for f in sorted(glob.glob(d + '/*.png')):
    a = np.array(Image.open(f).convert('RGB')).astype(int)
    fond = (a.min(axis=2) > 235)                       # le blanc du fond
    from scipy import ndimage
    lab, _ = ndimage.label(fond); bords = set(lab[0]) | set(lab[-1]) | set(lab[:, 0]) | set(lab[:, -1])
    alpha = ~np.isin(lab, [b for b in bords if b])     # fond = blanc relié au bord (le blanc du maillot reste)
    alpha = ndimage.binary_opening(alpha, iterations=1)
    ys, xs = np.where(alpha)
    if len(ys) < 500: continue
    y0, y1 = ys.min(), ys.max(); cx = int(np.median(xs))
    rgba = np.dstack([a, alpha * 255]).astype(np.uint8)
    poses.append((Image.fromarray(rgba), y0, y1, cx))
def norm(p):
    im, y0, y1, cx = p
    h = y1 - y0 + 1; s = (H - 6) / h; w = int(L / s)
    c = im.crop((cx - w // 2, y0, cx - w // 2 + w, y1 + 1)).resize((L, H - 6), Image.LANCZOS)
    out = Image.new('RGBA', (L, H)); out.paste(c, (0, 6)); return out
imgs = [norm(p) for p in poses]
jambes = [np.array(i)[int(H * 0.6):, :, 3].astype(float) / 255 for i in imgs]
deb = len(imgs) // 3                                    # au milieu de la vidéo : course bien lancée
dist = [np.abs(jambes[deb] - jambes[deb + k]).mean() for k in range(len(imgs) - deb)]
P = min(range(8, len(dist)), key=lambda k: dist[k])     # période d'une foulée complète (deux pas)
print('images', len(imgs), 'foulée', P, 'images')
choix = [imgs[deb + round(i * P / N)] for i in range(N)]
bande = Image.new('RGBA', (L * N, H))
for i, im in enumerate(choix): bande.paste(im, (i * L, 0))
bande.save(SORTIE); print('écrit', SORTIE, bande.size)
