# Génère le plan du niveau manif (à recopier dans src/bosses/julien/niveau_manif.js) et vérifie que le lycée est atteignable.
# Utilisation : python3 outils/julien/plan_manif.py
W, H = 34, 43
g = [['1'] * W for _ in range(H)]
def sol(x0, y0, x1, y1):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): g[y][x] = '.'
def mur(x0, y0, x1, y1, c):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): g[y][x] = c
def put(x, y, c): g[y][x] = c
# textures par défaut : immeubles en alternance briques / crème
for y in range(H):
    for x in range(W): g[y][x] = '1' if (x // 3 + y // 4) % 2 else '2'
mur(0, 0, W - 1, 3, '6')                 # lycée
sol(14, 1, 18, 2); mur(14, 1, 18, 1, 'S')   # cour (arrivée)
mur(14, 3, 18, 3, '7')                   # portail
sol(10, 4, 23, 8)                        # parvis
sol(15, 9, 17, 17)                       # rue du lycée
sol(6, 18, 27, 27)                       # place
sol(6, 28, 8, 35)                        # ruelle taguée
sol(14, 28, 18, 35)                      # avenue (bloquée par les camions)
sol(24, 28, 26, 35)                      # passage commerçant
sol(1, 36, 32, 41)                       # boulevard
mur(0, 42, W - 1, 42, '5')               # palissade en bas
for y in range(36, 42): put(0, y, '4'); put(W - 1, y, '4')
# murs vus depuis chaque rue : vitrines dans la rue du lycée et le passage, tags dans la ruelle
for y in range(9, 18):
    put(14, y, '3' if y % 3 else '8'); put(18, y, '8' if y % 3 else '3')
for y in range(28, 36):
    put(5, y, '4'); put(9, y, '4'); put(13, y, '5'); put(19, y, '5'); put(23, y, '3' if y % 2 else '8'); put(27, y, '8' if y % 2 else '3')
# secrets (mur qui s'ouvre quand on pousse dedans) + leurs recoins
sol(3, 30, 4, 32); put(5, 31, 'X')       # derrière le mur tagué de la ruelle
sol(28, 31, 29, 33); put(27, 32, 'Z')    # derrière une vitrine du passage
# EMBUSCADE du passage : 2 boutiques fermées par un rideau de fer (R), un policier caché derrière chacun
# COULOIR DE SERVICE (audit nov. 2026, « clé + porte + boucle ») : de la place (porte de service D, fermée sans la
# CARTE DE CANTINE q) jusqu'au parvis, en contournant le cordon de la rue du lycée
sol(28, 18, 30, 18); sol(30, 6, 30, 18); sol(24, 6, 29, 6); put(28, 18, 'D')
sol(22, 30, 22, 30); put(23, 30, 'R'); sol(22, 32, 22, 32); put(23, 32, 'R')
objets = {
    # parvis (vague finale)
    (11, 4): 'P', (22, 4): 'P', (16, 6): 'B', (12, 5): 'b', (21, 5): 'b', (13, 8): 'b', (22, 8): 'b',
    (11, 7): 'o', (22, 7): 's',
    # rue du lycée : lanceur derrière le CORDON de 3 CRS
    (16, 10): 'P', (15, 12): 'B', (16, 12): 'b', (17, 12): 'B',   # cordon : 2 CRS + une barrière (16, 16): 'o',
    # place : statue au centre
    (16, 22): 'T', (7, 19): 'P', (26, 19): 'P', (11, 23): 'B',
    (9, 20): 'b', (24, 20): 'b', (8, 21): 'o', (8, 25): 'p', (24, 25): 'p', (12, 26): 'k', (21, 26): 'k',
    # ruelle : un CRS seul
    (7, 30): 'B', (7, 34): 'o', (6, 28): 'p',
    # passage : un lanceur seul
    (25, 29): 'P', (25, 33): 'o',
    # recoins secrets
    (3, 31): 's', (4, 31): 'o', (28, 32): 'o', (29, 32): 'o',
    # avenue bloquée : camions de CRS + barrières + manifestants face à eux
    (15, 30): 'C', (17, 30): 'C', (14, 32): 'b', (15, 32): 'b', (16, 32): 'b', (17, 32): 'b', (18, 32): 'b',
    (15, 34): 'm', (17, 34): 'm',
    # armes : tomates (t) dans la ruelle, pistolet à eau (w) dans le passage, fumigènes (f) sur la place, + recharges
    (8, 32): 't', (24, 31): 'w', (26, 26): 't', (9, 26): 'w', (12, 7): 't', (15, 15): 'w',
    # embuscade : policiers derrière les rideaux de fer (ils sortent quand on ramasse le pistolet à eau)
    (22, 30): 'P', (22, 32): 'B',
    # SACS DE FARINE (a) : un œuf dessus → nuage blanc qui fait fuir les policiers autour (en chaîne)
    (8, 18): 'a', (25, 18): 'a', (14, 4): 'a', (19, 5): 'a', (16, 13): 'a', (26, 30): 'a', (12, 24): 'a', (21, 22): 'a',
    # bonus : écharpe mouillée (e), café serré (c), K-Way (K)
    (25, 34): 'e', (7, 26): 'e', (30, 38): 'c', (21, 7): 'c', (3, 32): 'K', (17, 16): 'K',
    # boulevard : départ au milieu de la foule
    (16, 39): 'J', (12, 37): 'm', (14, 40): 'm', (18, 38): 'm', (20, 40): 'm', (10, 39): 'm', (22, 37): 'm',
    (13, 38): 'm', (19, 37): 'm', (8, 40): 'm', (25, 39): 'm', (4, 38): 'm', (28, 37): 'm', (30, 40): 'm',
    (6, 41): 'p', (27, 41): 'p',
    # audit nov. 2026 : BAC en civil (N), tireur de LBD (L), fumigènes (f), SONO (Y, grand secret), carte de cantine (q)
    (22, 24): 'N', (18, 7): 'N', (20, 19): 'L', (30, 12): 'L', (29, 33): 'f', (4, 30): 'Y', (28, 31): 'q',
}
for (x, y), c in objets.items():
    assert g[y][x] == '.', (x, y, g[y][x]); g[y][x] = c
for l in g: print("  '" + ''.join(l) + "',")
# vérif : chemin du départ à S (en traversant les ennemis, sans les objets bloquants, secrets fermés)
from collections import deque
bloque = set('123456789XZbpTCmkRaD')
dep = next((x, y) for y in range(H) for x in range(W) if g[y][x] == 'J')
vu = {dep}; f = deque([dep])
while f:
    x, y = f.popleft()
    for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
        n = (x+dx, y+dy)
        if 0 <= n[0] < W and 0 <= n[1] < H and n not in vu and (g[n[1]][n[0]] not in bloque or g[n[1]][n[0]] == '7'):
            vu.add(n); f.append(n)
print('// S atteignable :', any(g[y][x] == 'S' for x, y in vu))
