# Génère les bruitages de Rémi (WAV 16 bits mono, 22 kHz pour rester légers).
# Utilisation : python3 outils/remi/generer_sons.py assets/audio/remi
import numpy as np, wave, sys
from scipy.signal import lfilter
SR = 22050
rng = np.random.default_rng(7)
out = sys.argv[1] if len(sys.argv) > 1 else 'assets/audio/remi'

def t(d): return np.arange(int(SR * d)) / SR
def env(d, attaque, decroissance):
    x = t(d); return np.exp(-x / decroissance) * np.clip(x / max(attaque, 1e-4), 0, 1)
def passe_bas(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); return lfilter([1 - a], [1, -a], x)
def passe_haut(x, fc): return x - passe_bas(x, fc)
def balayage(d, f0, f1, courbe=6):
    x = t(d); f = f1 + (f0 - f1) * np.exp(-x * courbe); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def bruit(d): return rng.uniform(-1, 1, int(SR * d))
def note(d, f, dec, harmo=(1,)):
    x = t(d); return sum(np.sin(2 * np.pi * f * h * x) / (k + 1) for k, h in enumerate(harmo)) * np.exp(-x / dec)
def ecrire(nom, x, gain=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    n = min(len(x), 300); x[-n:] *= np.linspace(1, 0, n)
    with wave.open(f'{out}/{nom}.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
def place(base, son, debut):
    i = int(debut * SR); base[i:i + len(son)] += son[:len(base) - i]; return base

# ---------- VÉLO ----------
# sonnette « dring-dring » : cloche métallique (partiels inharmoniques) avec trille
d = 0.6; x = t(d)
cloche = sum(a * np.sin(2 * np.pi * f * x) for f, a in ((2350, 1), (3170, 0.6), (4810, 0.35), (5900, 0.2)))
trille = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 22 * x))
ecrire('remi_sonnette', cloche * trille * np.exp(-x / 0.25), 0.55)
# saut : « hop » de pneu + souffle
d = 0.22
ecrire('remi_saut', 0.7 * balayage(d, 180, 420, -5) * env(d, 0.002, 0.06) + 0.5 * passe_haut(bruit(d), 1800) * env(d, 0.001, 0.05), 0.5)
# atterrissage : « tchk » de suspension
d = 0.18
ecrire('remi_atterrit', passe_bas(bruit(d), 900) * env(d, 0.0005, 0.03) + 0.6 * balayage(d, 120, 60, 12) * env(d, 0.001, 0.05), 0.5)
# chute : fracas (métal + choc + verre)
d = 0.9; s = np.zeros(int(SR * d))
place(s, np.tanh(3 * (passe_bas(bruit(0.5), 1800) * env(0.5, 0.0005, 0.08) + 1.4 * balayage(0.5, 150, 50, 8) * env(0.5, 0.002, 0.15))), 0)
place(s, 0.5 * note(0.6, 1900, 0.12, (1, 1.47, 2.3)), 0.08)
place(s, 0.6 * passe_haut(bruit(0.4), 3000) * env(0.4, 0.001, 0.06), 0.15)
ecrire('remi_chute', s, 0.85)
# crevaison : « pssshhh »
d = 0.8; x = t(d)
ecrire('remi_crevaison', passe_haut(bruit(d), 2500) * np.clip(x / 0.03, 0, 1) * np.exp(-x / 0.4), 0.45)
# glissade dans la flaque : « splotch » mou
d = 0.4
ecrire('remi_glisse', passe_bas(bruit(d), 700) * env(d, 0.005, 0.1) * (1 + 0.6 * np.sin(2 * np.pi * 30 * t(d))) + 0.5 * balayage(d, 300, 120, 5) * env(d, 0.003, 0.12), 0.55)
# texto : « ding-ding » de téléphone
d = 0.35; s = np.zeros(int(SR * d))
place(s, note(0.15, 1318.5, 0.05, (1, 2)), 0); place(s, note(0.2, 1760, 0.06, (1, 2)), 0.1)
ecrire('remi_texto', s, 0.35)
# pinte attrapée : « glouk » + petit tintement
d = 0.3; s = np.zeros(int(SR * d))
place(s, balayage(0.12, 300, 700, -8) * env(0.12, 0.002, 0.05), 0); place(s, 0.5 * note(0.2, 2637, 0.06), 0.06)
ecrire('remi_pinte', s, 0.45)
# arrivée / victoire de jeu : petit jingle (arpège majeur)
d = 0.9; s = np.zeros(int(SR * d))
for k, f in enumerate((523.25, 659.25, 783.99, 1046.5)): place(s, note(0.5, f, 0.18, (1, 2, 3)), k * 0.09)
ecrire('remi_arrivee', s, 0.5)

# ---------- BEER PONG ----------
d = 0.12
ecrire('remi_lance', passe_haut(bruit(d), 2000) * env(d, 0.001, 0.03) + 0.5 * balayage(d, 900, 1500, -10) * env(d, 0.001, 0.03), 0.35)
# rebond de balle de ping-pong : « tic » sec
d = 0.08
ecrire('remi_rebond', note(d, 3200, 0.008, (1, 1.6)) + 0.4 * passe_haut(bruit(d), 4000) * env(d, 0.0003, 0.004), 0.5)
# plouf : balle qui tombe dans la bière
d = 0.5; x = t(d)
bulles = sum(np.sin(2 * np.pi * (500 + 900 * k) * x * (1 + 0.8 * x)) * np.exp(-np.clip(x - 0.04 * k, 0, None) / 0.05) * (x > 0.04 * k) for k in range(4))
ecrire('remi_plouf', 0.8 * balayage(d, 900, 250, 14) * env(d, 0.001, 0.08) + 0.4 * bulles + 0.4 * passe_bas(bruit(d), 1500) * env(d, 0.001, 0.04), 0.6)
# « hips » (hoquet quand on a trop bu)
d = 0.25; x = t(d)
ecrire('remi_hips', (balayage(d, 700, 300, 18) * env(d, 0.002, 0.05) + 0.4 * passe_haut(bruit(d), 1500) * env(d, 0.001, 0.03)), 0.5)
# glouglou (on boit)
d = 0.9; x = t(d)
ecrire('remi_boit', sum(np.sin(2 * np.pi * (180 + 60 * np.sin(2 * np.pi * 3 * x)) * x) * (np.sin(2 * np.pi * 6 * x + k) > 0.4) for k in range(2)) * np.clip(x / 0.05, 0, 1) * np.clip((d - x) / 0.1, 0, 1), 0.5)
# foule du bar qui crie
d = 1.2; x = t(d)
voix = sum(np.sin(2 * np.pi * (rng.uniform(180, 420)) * x * (1 + 0.03 * np.sin(2 * np.pi * rng.uniform(4, 8) * x))) for _ in range(14))
ecrire('remi_foule', (0.5 * voix / 14 + passe_bas(bruit(d), 2200)) * np.sin(np.pi * np.clip(x / d, 0, 1)) ** 0.6, 0.5)

# ---------- PORTE ----------
d = 0.06
ecrire('remi_tape', passe_bas(bruit(d), 1500) * env(d, 0.0005, 0.012) + 0.6 * note(d, 180, 0.02), 0.45)
# coup dans la porte : « BOUM » de bois creux
d = 0.5; x = t(d)
bois = sum(a * np.sin(2 * np.pi * f * x) * np.exp(-x / dec) for f, a, dec in ((95, 1, 0.16), (190, 0.6, 0.09), (330, 0.4, 0.05), (520, 0.2, 0.03)))
ecrire('remi_porte', np.tanh(2 * (bois + 0.7 * passe_bas(bruit(d), 2500) * env(d, 0.0005, 0.02))), 0.8)
# gros coup : boum + CRAC du bois qui se fend
d = 0.9; s = np.zeros(int(SR * d))
place(s, np.tanh(2.5 * sum(a * np.sin(2 * np.pi * f * t(0.6)) * np.exp(-t(0.6) / dec) for f, a, dec in ((80, 1, 0.22), (160, 0.7, 0.12), (300, 0.4, 0.06)))), 0)
for k in range(6): place(s, (0.9 - 0.1 * k) * passe_haut(bruit(0.05), 1200) * env(0.05, 0.0003, 0.01), 0.03 + k * 0.035 + rng.uniform(0, 0.02))
ecrire('remi_porte_fort', s, 0.9)
print('sons de Rémi générés dans', out)
