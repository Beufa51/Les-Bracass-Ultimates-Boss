# Génère les bruitages du combat de Greg (WAV 16 bits mono).
# Utilisation : python3 outils/generer_sons.py assets/audio
import numpy as np, wave, sys
SR = 44100
rng = np.random.default_rng(7)
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
def ecrire(nom, x, gain=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    fondu = np.ones_like(x); n = min(len(x), 400); fondu[-n:] = np.linspace(1, 0, n); x = x * fondu
    with wave.open(f'{out}/{nom}.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())

def reverb(x, d=0.25, mix=0.25):
    y = np.concatenate([x, np.zeros(int(SR * d))])
    for retard, g in [(0.029, 0.5), (0.043, 0.4), (0.061, 0.3), (0.089, 0.22), (0.113, 0.15)]:
        k = int(SR * retard); y[k:k + len(x)] += x * g * mix
    return y

# jab : "bam" sec
d = 0.22
x = 0.9 * balayage(d, 220, 70, 30) * env(d, 0.001, 0.05) + 0.7 * passe_bas(bruit(d), 2500) * env(d, 0.0005, 0.018)
ecrire('greg_coup', reverb(np.tanh(x * 2.5)))

# gros coup : "DOSH" grave, saturé
d = 0.55
x = 1.2 * balayage(d, 150, 38, 12) * env(d, 0.002, 0.16) + 0.9 * passe_bas(bruit(d), 1800) * env(d, 0.0005, 0.03) \
    + 0.4 * passe_haut(bruit(d), 3000) * env(d, 0.0005, 0.008)
ecrire('greg_coup_fort', reverb(np.tanh(x * 3), 0.35, 0.35))

# coup bloqué : claquement de cuir
d = 0.16
x = passe_haut(passe_bas(bruit(d), 3500), 700) * env(d, 0.0005, 0.02) + 0.5 * balayage(d, 300, 140, 40) * env(d, 0.001, 0.03)
ecrire('greg_bloque', reverb(x, 0.15, 0.2), 0.8)

# esquive : souffle d'air qui passe
d = 0.32
n = bruit(d); x = t(d)
souffle = passe_bas(n, 1200) * 0.6 + passe_haut(passe_bas(n, 5000), 2000) * 0.5
forme = np.sin(np.pi * np.clip(x / d, 0, 1)) ** 2
ecrire('greg_esquive', souffle * forme, 0.7)

# cloche de ring : deux "ding"
def ding(d):
    x = t(d); s = np.zeros_like(x)
    for f, g, dec in [(830, 1, 0.9), (830 * 2.76, 0.5, 0.5), (830 * 5.4, 0.3, 0.3), (830 * 8.93, 0.15, 0.15), (1245, 0.4, 0.7)]:
        s += g * np.sin(2 * np.pi * f * x) * np.exp(-x / dec)
    return s * env(d, 0.001, 10)
c = np.zeros(int(SR * 1.9)); a = ding(1.5); c[:len(a)] += a; k = int(SR * 0.4); c[k:k + len(a)] += a[:len(c) - k]
ecrire('greg_cloche', c, 0.7)

# alerte : "shing" métallique
d = 0.35
x = t(d); s = sum(g * np.sin(2 * np.pi * f * x) for f, g in [(2400, 1), (3610, 0.6), (5230, 0.4)])
ecrire('greg_alerte', s * env(d, 0.003, 0.09) + 0.2 * passe_haut(bruit(d), 6000) * env(d, 0.001, 0.03), 0.5)

# compte de l'arbitre : "tock"
d = 0.15
ecrire('greg_compte', balayage(d, 900, 500, 50) * env(d, 0.0005, 0.03) + 0.3 * passe_bas(bruit(d), 3000) * env(d, 0.0005, 0.005), 0.7)

# au tapis : gros boum qui résonne
d = 1.2
x = 1.3 * balayage(d, 90, 30, 4) * env(d, 0.003, 0.4) + passe_bas(bruit(d), 600) * env(d, 0.001, 0.15)
ecrire('greg_tapis', reverb(np.tanh(x * 2.5), 0.5, 0.4))
