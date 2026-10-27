# Mesure les temps de la musique du battle de danse (assets/audio/kedric/kedric_battle.mp3) pour y caler les pas.
# Pour chaque passage voulu (intro, couplet, refrain), donne le début (un temps fort : celui où la grosse caisse
# tape le plus) et la durée d'un temps, à recopier dans REGLAGES.showtime.passages (src/bosses/kedric/reglages.js).
# Utilisation : python3 outils/kedric/caler_battle.py   (depuis la racine du projet ; pip install librosa)
import librosa, numpy as np

MUSIQUE = 'assets/audio/kedric/kedric_battle.mp3'
PASSAGES = [(1.4, 32), (22, 40), (55, 48)]   # (début approximatif en s, nombre de temps du passage)

y, sr = librosa.load(MUSIQUE, sr=22050)
oenv = librosa.onset.onset_strength(y=y, sr=sr)
tempo, temps = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, units='time', start_bpm=172, tightness=400)
print('tempo', tempo)
# la grosse caisse : énergie sous 150 Hz
S = np.abs(librosa.stft(y)); f = librosa.fft_frequencies(sr=sr)
bas = S[f < 150].sum(0); tb = librosa.frames_to_time(np.arange(len(bas)), sr=sr)
def force(t):
    i = int(np.argmin(abs(tb - t))); return bas[max(0, i - 2):i + 3].max()
for cible, n in PASSAGES:
    i0 = int(np.argmin(abs(temps - cible))); b = temps[i0:i0 + n]
    k = np.arange(len(b)); periode, origine = np.polyfit(k, b, 1)   # grille régulière sur le passage
    dec = 0 if sum(force(t) for t in b[0::2]) >= sum(force(t) for t in b[1::2]) else 1
    print(f"{{ debut: {origine + dec * periode:.3f}, temps: {periode:.4f} }}")
