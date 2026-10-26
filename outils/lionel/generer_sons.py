# Génère les bruitages du match de frisbee de Lionel (WAV 16 bits mono).
# Utilisation : python3 outils/lionel/generer_sons.py assets/audio/lionel
import numpy as np, wave, sys
SR = 44100
rng = np.random.default_rng(93)
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

# lancer : "fwiiip" (souffle qui monte, comme un disque qui part en tournant)
d = 0.35
x = t(d); n = bruit(d)
forme = np.sin(np.pi * np.clip(x / d, 0, 1)) ** 1.5
tourne = 0.6 + 0.4 * np.sin(2 * np.pi * 38 * x)
ecrire('frisbee_lancer', (passe_haut(passe_bas(n, 4500), 900) * tourne + 0.25 * balayage(d, 500, 1400, -2) * 0.3) * forme, 0.7)

# rattraper : "tchak" (claque dans la main)
d = 0.14
ecrire('frisbee_attrape', passe_haut(passe_bas(bruit(d), 5000), 600) * env(d, 0.0005, 0.018) + 0.6 * balayage(d, 420, 180, 40) * env(d, 0.001, 0.03), 0.8)

# rebond sur le mur : "plonk" plastique
d = 0.18
ecrire('frisbee_rebond', balayage(d, 1300, 700, 30) * env(d, 0.0005, 0.03) + 0.3 * passe_haut(bruit(d), 3000) * env(d, 0.0005, 0.006), 0.6)

# but : grosse explosion de buzzer + choc
d = 0.9
x = t(d)
buzz = np.sign(np.sin(2 * np.pi * 185 * x)) * 0.4 + np.sign(np.sin(2 * np.pi * 277 * x)) * 0.3
choc = 1.2 * balayage(d, 160, 40, 10) * env(d, 0.002, 0.15) + passe_bas(bruit(d), 1500) * env(d, 0.001, 0.05)
ecrire('frisbee_but', np.tanh((passe_bas(buzz, 2500) * env(d, 0.005, 0.5) + choc) * 2), 0.8)

# sifflet d'arbitre (deux coups)
def sif(d):
    x = t(d); f = 2900 + 120 * np.sin(2 * np.pi * 32 * x)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.clip(x / 0.01, 0, 1) * np.clip((d - x) / 0.03, 0, 1)
s = np.zeros(int(SR * 0.75)); a = sif(0.18); s[:len(a)] += a; b = sif(0.4); k = int(SR * 0.28); s[k:k + len(b)] += b
ecrire('frisbee_sifflet', s + 0.08 * passe_haut(bruit(len(s) / SR), 4000) * (np.abs(s) > 0.01), 0.55)

# super lancer : grand souffle grave + accord doux et lumineux (pas de sirène, pas de saturation)
bruit(0.8)   # (même tirage que l'ancien super : les sons suivants restent identiques)
d = 1.1
x = t(d)
souffle = passe_bas(np.random.default_rng(7).uniform(-1, 1, len(x)), 900)   # son propre hasard : ne change pas les autres sons * np.sin(np.pi * np.clip(x / 0.7, 0, 1)) ** 2
coup = balayage(d, 140, 45, 7) * env(d, 0.004, 0.18)
accord = sum(np.sin(2 * np.pi * f * x) for f in (523.25, 659.25, 783.99)) / 3 * np.clip((x - 0.12) / 0.08, 0, 1) * np.exp(-np.clip(x - 0.12, 0, None) / 0.35)
ecrire('frisbee_super', 0.9 * souffle + 0.8 * coup + 0.35 * accord, 0.6)

# super prêt / jauge pleine : petit « ding-ding » joyeux
d = 0.55
x = t(d)
note = lambda f, debut: np.sin(2 * np.pi * f * x) * (x >= debut) * np.exp(-np.clip(x - debut, 0, None) / 0.12)
ecrire('frisbee_pret', note(659.25, 0) + note(880, 0.12) + 0.3 * note(1318.5, 0.12), 0.5)

# plongeon dans le sable : "pffshh"
d = 0.4
ecrire('frisbee_plongeon', passe_bas(bruit(d), 1800) * env(d, 0.01, 0.12) + 0.4 * balayage(d, 120, 50, 10) * env(d, 0.002, 0.06), 0.7)

# frisbee qui tombe dans le sable (lob raté)
d = 0.35
ecrire('frisbee_sol', passe_bas(bruit(d), 900) * env(d, 0.002, 0.07) + 0.8 * balayage(d, 140, 60, 20) * env(d, 0.001, 0.05), 0.8)
