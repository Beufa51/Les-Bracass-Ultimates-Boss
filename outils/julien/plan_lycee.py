# Génère le plan du LYCÉE (à recopier dans src/bosses/julien/niveau_lycee.js, PLAN_LYCEE) et vérifie le parcours.
# Utilisation : python3 outils/julien/plan_lycee.py
# Parcours : hall (départ) → 2e couloir ou couloir des casiers → CANTINE → CDI (le CARNET, tout au fond)
#            → retour au couloir des casiers → porte de la SALLE 12 (en haut à gauche).
W, H = 32, 22
g = [['#'] * W for _ in range(H)]
zone = {}
def salle(x0, y0, x1, y1, z):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): g[y][x] = '.'; zone[(x, y)] = z
salle(2, 2, 4, 15, 'casiers')     # couloir des casiers (monte vers la salle 12)
salle(5, 4, 7, 5, 'casiers')      # passage couloir -> cantine
salle(8, 2, 21, 9, 'cantine')     # cantine
salle(2, 16, 15, 20, 'hall')      # hall (on arrive de la cour)
salle(13, 10, 15, 15, 'hall')     # 2e couloir hall -> cantine (boucle)
salle(6, 10, 7, 12, 'placard')    # placard secret derrière un casier
salle(22, 5, 23, 6, 'cdi')        # porte cantine -> CDI
salle(24, 2, 29, 19, 'cdi')       # le CDI (étagères = abris)
code = {'casiers': '1', 'cantine': '3', 'hall': '2', 'placard': '1', 'cdi': '5'}
for y in range(H):
    for x in range(W):
        if g[y][x] != '#': continue
        v = [zone.get((x + dx, y + dy)) for dx in (-1, 0, 1) for dy in (-1, 0, 1)]
        v = [z for z in v if z and z != 'placard']
        g[y][x] = code[v[0]] if v else '5'
def met(x, y, c): g[y][x] = c
met(3, 1, '4')                    # porte de la salle 12 (fermée sans le carnet)
met(5, 11, 'X')                   # casier ouvert = passage secret vers le placard
met(9, 20, 'J')
for (x, y, c) in [
    (3, 16, 'V'), (3, 19, 'n'), (2, 16, 's'), (11, 19, 'n'),                          # hall
    (2, 12, 'F'), (4, 7, 'F'), (3, 9, 'x'), (3, 4, 'V'),                              # couloir des casiers
    (14, 12, 'F'), (13, 14, 'n'),                                                     # 2e couloir
    (11, 3, 'Q'), (19, 6, 'Q'), (20, 8, 'V'), (16, 8, 'x'), (9, 9, 's'),             # cantine
    (15, 2, 'q'), (16, 2, 'q'), (17, 2, 'q'), (18, 2, 'q'),                           # comptoir
    (10, 5, 'd'), (12, 5, 'd'), (14, 5, 'd'), (10, 7, 'd'), (12, 7, 'd'), (14, 7, 'd'), (18, 4, 'd'),
    (6, 11, 's'), (7, 10, 'K'), (7, 12, 'n'),                                         # placard secret
    # CDI : rangées d'étagères (abris), 2 surveillants, une cantinière égarée, 2 fayots, le CARNET au fond
    (25, 4, 'd'), (27, 4, 'd'), (25, 7, 'd'), (28, 7, 'd'), (24, 10, 'd'), (26, 10, 'd'), (28, 10, 'd'),
    (25, 13, 'd'), (27, 13, 'd'), (25, 16, 'd'), (28, 16, 'd'),
    (26, 3, 'F'), (29, 12, 'F'), (27, 8, 'V'), (25, 14, 'V'), (28, 18, 'Q'),
    (29, 2, 'x'), (24, 12, 'x'), (29, 9, 'n'), (24, 17, 's'), (27, 19, 'k'),
]:
    assert g[y][x] == '.', (x, y, g[y][x]); g[y][x] = c
rows = [''.join(r) for r in g]
for r in rows: print(f"  '{r}',")
# vérif : le carnet, le passage secret et la porte sont atteignables depuis J
from collections import deque
bloque = set('12345#dqxF')
d = deque([(9, 20)]); vu = {(9, 20)}
while d:
    x, y = d.popleft()
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        n = (x + dx, y + dy)
        if n in vu or not (0 <= n[0] < W and 0 <= n[1] < H): continue
        if rows[n[1]][n[0]] in bloque: continue
        vu.add(n); d.append(n)
for c in 'kX4':
    pos = [(x, y) for y in range(H) for x in range(W) if rows[y][x] == c]
    ok = all(any((x + dx, y + dy) in vu for dx, dy in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1))) for x, y in pos)
    print('//', c, pos, 'OK' if ok else 'INACCESSIBLE')
