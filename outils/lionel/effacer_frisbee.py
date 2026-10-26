# Efface le frisbee dessiné d'une pose de Lionel (dans une boîte x0,y0,x1,y1).
# (à relancer après decouper_planches.py, qui remet les poses d'origine)
# Utilisation : python3 outils/lionel/effacer_frisbee.py lionel_touche:95,5,226,70 lionel_defaite:90,130,154,168
import numpy as np, sys
from PIL import Image
from scipy import ndimage
S='assets/sprites/lionel/'
def masque_disque(a, boite):
    r,g,b,al=[a[...,k].astype(float) for k in range(4)]
    mx=np.maximum(np.maximum(r,g),b); mn=np.minimum(np.minimum(r,g),b); sat=(mx-mn)/(mx+1e-6)
    # rouge/rose/violet/bleu saturé, ou cyan des lettres (le vert du maillot est exclu : g dominant)
    disque=((sat>0.35)&((r>g+25)|(b>g+25))) | ((b>r+40)&(g>r+20)&(b>=g-10))
    m=np.zeros(disque.shape,bool); x0,y0,x1,y1=boite; m[y0:y1,x0:x1]=True
    disque&=m&(al>0)
    # on garde la plus grosse tache (le disque) puis on l'épaissit pour avaler le trait noir
    lab,n=ndimage.label(ndimage.binary_closing(disque,iterations=3))
    if n==0: return disque
    tailles=ndimage.sum(np.ones_like(lab),lab,range(1,n+1)); k=1+int(np.argmax(tailles))
    d=ndimage.binary_fill_holes(lab==k)
    return ndimage.binary_dilation(d,iterations=3)&m
for nom,boite in [(n.split(':')[0],tuple(map(int,n.split(':')[1].split(',')))) for n in sys.argv[1:]]:
    im=Image.open(f'assets/sprites/lionel/{nom}.png').convert('RGBA'); a=np.array(im)
    m=masque_disque(a,boite); a[m,3]=0
    # petits bouts isolés qui restent dans la boîte
    al=a[...,3]>0; lab,n=ndimage.label(al)
    if n>1:
        tailles=ndimage.sum(np.ones_like(lab),lab,range(1,n+1))
        for k,t in enumerate(tailles,1):
            if t<120: a[lab==k,3]=0
    Image.fromarray(a).save(S+nom+'.png'); print(nom,m.sum())
