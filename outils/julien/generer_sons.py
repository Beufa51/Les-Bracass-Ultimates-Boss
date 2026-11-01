# Génère les bruitages de la manif de Julien (WAV 16 bits mono, 22 kHz pour rester légers), façon années 90.
# Utilisation : python3 outils/julien/generer_sons.py assets/audio/julien
import numpy as np, wave, sys
SR = 22050
rng = np.random.default_rng(7)
out = sys.argv[1]


def t(d): return np.arange(int(SR * d)) / SR
def env(d, attaque, decroissance):
    x = t(d); return np.exp(-x / decroissance) * np.clip(x / max(attaque, 1e-4), 0, 1)
def passe_bas(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); p = 0.0
    for i, v in enumerate(x): p = (1 - a) * v + a * p; y[i] = p
    return y
def passe_haut(x, fc): return x - passe_bas(x, fc)
def bande(x, f0, f1): return passe_bas(passe_haut(x, f0), f1)
def bruit(d): return rng.uniform(-1, 1, int(SR * d))
def glisse(d, f0, f1, forme=np.sin):
    x = t(d); f = f0 + (f1 - f0) * x / d; return forme(2 * np.pi * np.cumsum(f) / SR)
def scie(phase): return 2 * ((phase / (2 * np.pi)) % 1) - 1
def carre(phase): return np.sign(np.sin(phase))
def ecrire(nom, x, gain=0.9):
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    n = min(len(x), 300); x[-n:] *= np.linspace(1, 0, n)
    with wave.open(f'{out}/{nom}.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
def coller(*morceaux): return np.concatenate(morceaux)
def silence(d): return np.zeros(int(SR * d))


# lancer d'œuf : petit « fwip »
d = 0.16; x = t(d)
ecrire('julien_lancer', bande(bruit(d), 900, 4500) * np.sin(np.pi * x / d) ** 2 + 0.25 * glisse(d, 500, 900) * env(d, 0.01, 0.05), 0.6)

# œuf qui s'écrase : « splotch » mouillé + petit choc sourd
d = 0.3
splat = passe_bas(bruit(d), 1400) * env(d, 0.002, 0.06) + 0.5 * glisse(d, 160, 70) * env(d, 0.001, 0.04)
splat += 0.35 * bande(bruit(d), 1500, 3500) * env(d, 0.03, 0.05) * (np.sin(2 * np.pi * 37 * t(d)) > 0)
ecrire('julien_splat', splat, 0.75)

# œuf qui rebondit sur le bouclier en plastique : « tonk »
d = 0.18; x = t(d)
ecrire('julien_plonk', (np.sin(2 * np.pi * 620 * x) + 0.6 * np.sin(2 * np.pi * 1390 * x)) * env(d, 0.001, 0.04)
       + 0.4 * passe_haut(bruit(d), 2000) * env(d, 0.001, 0.01), 0.6)

# policier qui s'enfuit : petits pas pressés qui s'éloignent (Fabien : pas de sifflet, c'était agaçant)
pas = [passe_bas(bruit(0.05), 900) * env(0.05, 0.001, 0.012) * (1 - k / 7) + 0.4 * glisse(0.05, 140, 90) * env(0.05, 0.001, 0.015) * (1 - k / 7)
       for k in range(7)]
ecrire('julien_fuite', coller(*[coller(p, silence(0.045)) for p in pas]), 0.6)

# héros touché : grognement « hmpf » (scie filtrée qui descend)
d = 0.22
ecrire('julien_aie', passe_bas(glisse(d, 210, 120, scie), 900) * env(d, 0.005, 0.09) + 0.3 * passe_bas(bruit(d), 700) * env(d, 0.001, 0.03), 0.8)

# lance-grenade : « pomp » sourd
d = 0.25
ecrire('julien_tir', glisse(d, 110, 50) * env(d, 0.001, 0.07) + 0.6 * passe_bas(bruit(d), 1800) * env(d, 0.001, 0.03), 0.8)

# lacrymo qui éclate : « pop » puis long « pschhhh »
d = 1.0; x = t(d)
gaz = bande(bruit(d), 1800, 7000) * np.clip(x / 0.05, 0, 1) * np.exp(-x / 0.45)
gaz[:int(SR * 0.04)] += 0.8 * passe_bas(bruit(0.04), 900)
ecrire('julien_gaz', gaz, 0.55)

# CRS qui va charger : cri grave dans le casque « HAAA ! » (voix grésillante, pas de sifflet)
d = 0.45; x = t(d)
voix = glisse(d, 150, 120, scie) * (1 + 0.08 * np.sin(2 * np.pi * 6 * x))
voix = np.tanh(3 * bande(voix, 350, 1600))   # grésillement de mégaphone
ecrire('julien_cri', voix * np.clip(x / 0.03, 0, 1) * np.exp(-np.maximum(0, x - 0.25) / 0.08), 0.5)

# objet ramassé : petit arpège rétro
notes = [523, 659, 784, 1047]
ecrire('julien_ramasse', coller(*[carre(2 * np.pi * f * t(0.06)) * env(0.06, 0.002, 0.05) for f in notes]), 0.35)

# toux dans le gaz : deux quintes
def quinte(d): return bande(bruit(d), 400, 2200) * env(d, 0.005, d / 3) + 0.3 * passe_bas(glisse(d, 160, 110, scie), 800) * env(d, 0.005, d / 3)
ecrire('julien_toux', coller(quinte(0.13), silence(0.07), quinte(0.11)), 0.7)

# portail qui s'ouvre : grincement métallique puis « clang »
d = 1.3; x = t(d)
grince = passe_bas(glisse(d, 140, 70, scie), 1600) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * x)) * np.clip(x / 0.1, 0, 1) * (x < 1.0)
clang = np.zeros_like(x); k = int(SR * 1.0); n = len(x) - k
clang[k:] = (np.sin(2 * np.pi * 330 * t(n / SR)) + 0.7 * np.sin(2 * np.pi * 873 * t(n / SR))) * env(n / SR, 0.001, 0.1)
ecrire('julien_portail', grince * 0.6 + clang, 0.7)

# passage secret : mur qui coulisse (grondement de pierre)
d = 0.8; x = t(d)
ecrire('julien_secret', passe_bas(bruit(d), 300) * np.sin(np.pi * x / d) + 0.3 * passe_bas(glisse(d, 60, 45, scie), 400) * np.sin(np.pi * x / d), 0.8)

# coup de pancarte : « vouf » + choc de carton
d = 0.3; x = t(d)
choc = coller(silence(0.15), passe_bas(bruit(0.15), 800) * env(0.15, 0.001, 0.03) + 0.6 * glisse(0.15, 140, 80) * env(0.15, 0.001, 0.04))
choc = np.pad(choc, (0, max(0, len(x) - len(choc))))[:len(x)]
ecrire('julien_pancarte', bande(bruit(d), 400, 2500) * np.sin(np.pi * np.clip(x / 0.18, 0, 1)) ** 2 * (x < 0.18) + choc, 0.8)

# pistolet à eau : petit « pschit » mouillé (joué pendant le jet)
d = 0.12
ecrire('julien_eau', bande(bruit(d), 2500, 8000) * env(d, 0.005, 0.04), 0.35)

# fumigène qui s'allume : « pop » + chuintement
d = 0.9; x = t(d)
f = bande(bruit(d), 900, 5000) * np.clip(x / 0.08, 0, 1) * np.exp(-x / 0.5)
f[:int(SR * 0.03)] += 0.9 * passe_bas(bruit(0.03), 1200)
ecrire('julien_fumigene', f, 0.5)

# ambiance de manif en boucle (8 s) : brouhaha de foule et tambour (sans sifflets)
d = 8.0; x = t(d)
foule = np.zeros_like(x)
for f0, f1 in [(250, 900), (500, 1600), (900, 2600)]:   # voix mélangées : bruit filtré qui ondule
    foule += bande(bruit(d), f0, f1) * (0.6 + 0.4 * np.sin(2 * np.pi * (0.3 + rng.random() * 0.5) * x + rng.random() * 6))
foule *= 0.8
for k in range(16):   # tambour de manif (2 coups par seconde)
    p = int(SR * k * 0.5); n = int(SR * 0.25)
    foule[p:p + n] += 1.4 * glisse(0.25, 110, 55) * env(0.25, 0.001, 0.06)
n = int(SR * 0.5)   # raccord de boucle : fondu croisé du début et de la fin
foule[:n] = foule[:n] * np.linspace(0, 1, n) + foule[-n:] * np.linspace(1, 0, n)
foule = foule[:-n]
x = foule / (np.max(np.abs(foule)) + 1e-9) * 0.6
with wave.open(f'{out}/julien_foule.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
import subprocess, os   # l'ambiance (longue) en mp3 pour rester légère
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f'{out}/julien_foule.wav', '-ac', '1', '-b:a', '48k', f'{out}/julien_foule.mp3'], check=True)
os.remove(f'{out}/julien_foule.wav')
print('bruitages générés dans', out)
