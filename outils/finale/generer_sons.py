# Génère les bruitages du BOSS FINAL (mécha des Bracass') : WAV 16 bits mono, synthétisés (aucun fichier extérieur).
# Utilisation : python3 outils/finale/generer_sons.py assets/audio/finale
import numpy as np, wave, sys
SR = 44100
rng = np.random.default_rng(66)
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
def carre(s): return np.sign(s) * 0.6 + s * 0.4
def bruit(d): return rng.uniform(-1, 1, int(SR * d))
def ecrire(nom, x, gain=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    fondu = np.ones_like(x); n = min(len(x), 300); fondu[-n:] = np.linspace(1, 0, n); x = x * fondu
    with wave.open(f'{out}/{nom}.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())

# TIR : « piou » laser court et sec (joué à chaque salve, doit rester discret)
d = 0.09
ecrire('finale_tir', carre(balayage(d, 2400, 700, 35)) * env(d, 0.001, 0.03) + 0.15 * passe_haut(bruit(d), 4000) * env(d, 0.0005, 0.01), 0.5)

# IMPACT sur le mécha : « tink » métallique
d = 0.1
ecrire('finale_impact', (np.sin(2 * np.pi * 1850 * t(d)) + 0.6 * np.sin(2 * np.pi * 2730 * t(d))) * env(d, 0.0005, 0.025)
       + 0.7 * passe_haut(bruit(d), 2500) * env(d, 0.0005, 0.008), 0.6)

# EXPLOSION (pinte qui éclate, petits boums)
d = 0.7
ecrire('finale_explosion', passe_bas(bruit(d), 900) * env(d, 0.002, 0.18) + 0.8 * np.sin(2 * np.pi * np.cumsum(70 * np.exp(-t(d) * 3) + 40) / SR) * env(d, 0.002, 0.25), 0.9)

# GROSSE EXPLOSION : une partie du mécha saute (grondement + crépitements)
d = 1.6
crep = np.zeros(int(SR * d))
for k in range(28):
    i = int(rng.uniform(0.05, 1.2) * SR); n = int(0.03 * SR)
    crep[i:i + n] += bruit(0.03)[:len(crep[i:i + n])] * np.exp(-np.arange(len(crep[i:i + n])) / 300) * rng.uniform(0.3, 1)
ecrire('finale_partie', passe_bas(bruit(d), 500) * env(d, 0.004, 0.45) + 1.0 * np.sin(2 * np.pi * np.cumsum(55 * np.exp(-t(d) * 2) + 30) / SR) * env(d, 0.003, 0.6)
       + 0.5 * passe_haut(crep, 1500), 0.95)

# BOMBE : souffle qui monte puis énorme boum
d1, d2 = 0.35, 1.2
monte = passe_haut(passe_bas(bruit(d1), 6000), 800) * np.linspace(0, 1, int(SR * d1)) ** 2 + 0.3 * balayage(d1, 200, 1600, -4) * np.linspace(0, 1, int(SR * d1))
boum = passe_bas(bruit(d2), 700) * env(d2, 0.002, 0.35) + 1.2 * np.sin(2 * np.pi * np.cumsum(90 * np.exp(-t(d2) * 4) + 35) / SR) * env(d2, 0.002, 0.45)
ecrire('finale_bombe', np.concatenate([monte * 0.5, boum]), 0.95)

# TOUCHÉ : ton vaisseau prend un coup (« bzzt » qui descend + choc)
d = 0.4
ecrire('finale_touche', carre(balayage(d, 520, 110, 7)) * env(d, 0.002, 0.15) + 0.6 * passe_bas(bruit(d), 2500) * env(d, 0.001, 0.06), 0.85)

# ALERTE : « tu-tu » (une attaque spéciale arrive)
d = 0.12
bip = lambda f: carre(np.sin(2 * np.pi * f * t(d))) * env(d, 0.003, 0.08)
ecrire('finale_alerte', np.concatenate([bip(988), np.zeros(int(0.03 * SR)), bip(740)]), 0.55)

# DEMPSEY : souffle du poing qui tournoie (« wouf wouf »)
d = 0.5
x = t(d)
ecrire('finale_dempsey', passe_bas(bruit(d), 1800) * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * x)) * env(d, 0.02, 0.3) + 0.3 * balayage(d, 140, 90, 3), 0.8)
print('sons générés dans', out)
