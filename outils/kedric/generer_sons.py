# Génère les bruitages de la course de Kédric (WAV 16 bits mono, 22 kHz pour rester légers).
# Utilisation : python3 outils/kedric/generer_sons.py assets/audio/kedric
import numpy as np, wave, sys
SR = 22050
rng = np.random.default_rng(21)
out = sys.argv[1]

def t(d): return np.arange(int(SR * d)) / SR
def env(d, attaque, decroissance):
    x = t(d); e = np.exp(-x / decroissance); a = np.clip(x / max(attaque, 1e-4), 0, 1); return e * a
def passe_bas(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); p = 0.0
    for i, v in enumerate(x): p = (1 - a) * v + a * p; y[i] = p
    return y
def passe_haut(x, fc): return x - passe_bas(x, fc)
def balayage(d, f0, f1, courbe=6):
    x = t(d); f = f1 + (f0 - f1) * np.exp(-x * courbe); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def bruit(d): return rng.uniform(-1, 1, int(SR * d))
def ecrire(nom, x, gain=0.9, fondu_fin=True):
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    if fondu_fin:
        fondu = np.ones_like(x); n = min(len(x), 300); fondu[-n:] = np.linspace(1, 0, n); x = x * fondu
    with wave.open(f'{out}/{nom}.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())

# esquive : "fwoush" (souffle rapide qui passe à côté)
d = 0.28; x = t(d)
forme = np.sin(np.pi * np.clip(x / d, 0, 1)) ** 2
ecrire('kedric_esquive', passe_haut(passe_bas(bruit(d), 3500), 500) * forme, 0.7)

# saut : petit "hop" (crampons qui quittent la pelouse + souffle qui monte)
d = 0.22
ecrire('kedric_saut', 0.6 * balayage(d, 220, 520, -4) * env(d, 0.002, 0.07) + passe_haut(bruit(d), 1500) * env(d, 0.001, 0.02), 0.6)

# esquive parfaite : "shiiing" brillant (deux notes aiguës)
d = 0.5; x = t(d)
ecrire('kedric_parfait', (np.sin(2 * np.pi * 1568 * x) + 0.7 * np.sin(2 * np.pi * 2093 * x) * (x > 0.06)) * env(d, 0.002, 0.16)
       + 0.3 * passe_haut(bruit(d), 5000) * env(d, 0.001, 0.03), 0.55)

# plaquage : gros choc d'épaulières "CRAAC" + boum sourd
d = 0.6
choc = passe_bas(bruit(d), 2500) * env(d, 0.0005, 0.05) + 1.3 * balayage(d, 140, 45, 9) * env(d, 0.002, 0.18)
craque = passe_haut(bruit(d), 1800) * env(d, 0.0005, 0.012) * 1.5
ecrire('kedric_plaque', np.tanh((choc + craque) * 2.2), 0.85)

# alerte (symbole au-dessus d'un défenseur) : petit bip
d = 0.07
ecrire('kedric_alerte', np.sign(np.sin(2 * np.pi * 1180 * t(d))) * env(d, 0.001, 0.025), 0.35)

# niveau de vitesse : arpège qui monte
d = 0.36; x = t(d); s = np.zeros_like(x)
for k, f in enumerate((523.25, 659.25, 783.99, 1046.5)):
    m = (x >= k * 0.06); s += m * np.sin(2 * np.pi * f * (x - k * 0.06)) * np.exp(-np.clip(x - k * 0.06, 0, None) / 0.09)
ecrire('kedric_niveau', s, 0.5)

# DEVIL BAT GHOST : souffle fantôme qui tourbillonne + accord étrange
d = 1.3; x = t(d)
souffle = passe_bas(bruit(d), 1200) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * x)) * np.sin(np.pi * np.clip(x / d, 0, 1))
accord = sum(np.sin(2 * np.pi * f * x * (1 + 0.004 * np.sin(2 * np.pi * 5 * x))) for f in (311.1, 370.0, 466.2)) / 3
ecrire('kedric_ghost', souffle + 0.5 * accord * np.clip(x / 0.15, 0, 1) * np.exp(-x / 0.7), 0.7)

# sifflet d'arbitre
def sif(d):
    x = t(d); f = 2900 + 120 * np.sin(2 * np.pi * 32 * x)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.clip(x / 0.01, 0, 1) * np.clip((d - x) / 0.03, 0, 1)
ecrire('kedric_sifflet', sif(0.45) + 0.06 * passe_haut(bruit(0.45), 4000), 0.5)

# touchdown : corne de stade (accord de cuivres) + foule
d = 1.6; x = t(d)
corne = sum(np.sign(np.sin(2 * np.pi * f * x)) * a for f, a in ((233.1, 0.5), (293.7, 0.35), (349.2, 0.3)))
corne = passe_bas(corne, 1800) * np.clip(x / 0.05, 0, 1) * np.clip((1.1 - x) / 0.15, 0, 1)
foule = passe_haut(passe_bas(bruit(d), 2200), 250) * np.clip(x / 0.3, 0, 1) * np.exp(-np.clip(x - 0.8, 0, None) / 0.6)
ecrire('kedric_touchdown', corne + 0.6 * foule, 0.8)

# public qui hurle
d = 2.2; x = t(d)
n = passe_haut(passe_bas(bruit(d), 2200), 250)
vagues = 0.75 + 0.25 * np.sin(2 * np.pi * 3.1 * x) * np.sin(2 * np.pi * 0.7 * x)
ecrire('kedric_foule', n * vagues * np.clip(x / 0.25, 0, 1) * np.exp(-np.clip(x - 0.6, 0, None) / 0.8), 0.6)

# ambiance du stade en continu (boucle de 6 s sans coupure audible)
d = 6.0; x = t(d)
n = passe_haut(passe_bas(bruit(d), 1500), 180)
amb = n * (0.7 + 0.3 * np.sin(2 * np.pi * x / d) * np.sin(2 * np.pi * 3 * x / d))
f = int(SR * 0.5)
amb[:f] = amb[:f] * np.linspace(0, 1, f) + amb[-f:] * np.linspace(1, 0, f)
ecrire('kedric_ambiance', amb[:-f], 0.5, fondu_fin=False)

# foulée : crampons qui mordent la pelouse (petit "tchk" sourd, très court)
d = 0.12
ecrire('kedric_pas', 0.8 * balayage(d, 160, 70, 25) * env(d, 0.001, 0.03) + passe_haut(passe_bas(bruit(d), 4000), 900) * env(d, 0.0005, 0.012), 0.5)
