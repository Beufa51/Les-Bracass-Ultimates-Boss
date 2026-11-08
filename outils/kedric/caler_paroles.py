# Cale les flèches du battle de Kédric sur les PAROLES (le chant) au lieu de la batterie.
#  1. sépare la voix de l'accompagnement (méthode REPET-SIM de librosa : ce qui se RÉPÈTE = batterie / accords,
#     le reste = la voix ; pas d'outil d'IA lourd : la séparation n'est pas parfaite, une guitare peut passer) ;
#  2. repère les ATTAQUES de la voix (début des syllabes) et où elle chante (énergie de la voix) ;
#  3. cale chaque attaque sur le DEMI-TEMPS le plus proche (on reste en rythme), garde les plus nettes,
#     avec un écart minimum entre deux flèches (jouable sur téléphone) ;
#  4. dans les longs passages SANS chant, quelques flèches sur les temps (on ne reste pas les bras ballants).
# Écrit src/bosses/kedric/paroles.js : pour chaque musique, les moments des flèches (s) depuis la 1re flèche.
# Utilisation : python3 outils/kedric/caler_paroles.py   (depuis la racine du projet, ~1 min)
import json, re
import numpy as np, librosa

REG = open('src/bosses/kedric/reglages.js', encoding='utf-8').read()
MAN = open('src/bosses/kedric/manifeste.js', encoding='utf-8').read()
CHUTE = float(re.search(r'piste: \{ chute: ([\d.]+)', REG).group(1))
HOP, SR = 512, 22050

# musique -> (fichier, 1er temps fort (s), durée d'un temps (s), temps par pas, durée de la manche (s), réglages)
#  ecart : écart minimum entre deux flèches (s) ; densite : flèches par seconde visées pendant le chant ;
#  delta : sensibilité des attaques (plus petit = plus d'attaques)
MANCHES = []
for m in re.finditer(r"\{ musique: '(\w+)', duree: ([\d.]+), tempo: \{ debut: ([\d.]+), temps: ([\d.]+) \}, tempsParPas: (\d+)", REG):
    cle, duree, debut, temps, tpp = m.group(1), float(m.group(2)), float(m.group(3)), float(m.group(4)), int(m.group(5))
    fichier = re.search(cle + r":\s+\{ fichier: '([^']+)'", MAN).group(1)
    MANCHES.append((cle, 'assets/' + fichier, debut, temps, tpp, duree))
REGLAGES = { 'kedric_chala': { 'ecart': 0.38, 'densite': 1.8, 'delta': 0.10 },
             'kedric_dbz':   { 'ecart': 0.50, 'densite': 1.6, 'delta': 0.06 } }

def voix(fichier, duree):
    y, sr = librosa.load(fichier, sr=SR, mono=True, duration=duree)
    S, _ = librosa.magphase(librosa.stft(y, n_fft=2048, hop_length=HOP))
    fond = np.minimum(S, librosa.decompose.nn_filter(S, aggregate=np.median, metric='cosine',
                                                     width=int(librosa.time_to_frames(2, sr=SR, hop_length=HOP))))
    Sv = librosa.util.softmask(S - fond, 10 * fond, power=2) * S
    b = (librosa.fft_frequencies(sr=SR, n_fft=2048) > 200) & (librosa.fft_frequencies(sr=SR, n_fft=2048) < 4000)
    Sv = Sv[b]
    env = librosa.onset.onset_strength(S=librosa.amplitude_to_db(Sv, ref=np.max), sr=SR, hop_length=HOP)
    rms = np.sqrt((Sv ** 2).mean(axis=0)); rms = rms / np.percentile(rms, 95)
    rms = np.convolve(rms, np.ones(21) / 21, mode='same')   # lissée sur ~0,5 s : « elle chante en ce moment »
    t = librosa.frames_to_time(np.arange(len(env)), sr=SR, hop_length=HOP)
    return env, rms, t

sortie = {}
for cle, fichier, debut, temps, tpp, duree in MANCHES:
    R = REGLAGES[cle]
    d = temps * tpp
    m = max(2, int(np.ceil((CHUTE + 0.2) / d)))
    F0 = debut + m * d                      # moment (dans le fichier) où tombe la 1re flèche de la manche
    env, rms, t = voix(fichier, F0 + duree + 2)
    demi = temps / 2
    on = librosa.onset.onset_detect(onset_envelope=env, sr=SR, hop_length=HOP, units='time', delta=R['delta'], wait=2)
    chante = rms > np.percentile(rms[(t >= F0) & (t <= F0 + duree)], 35)
    # chaque attaque -> le demi-temps le plus proche ; score = force de l'attaque
    cand = {}
    for o in on:
        if o < F0 - 0.05 or o > F0 + duree: continue
        k = int(round((o - F0) / demi))
        if k < 0: continue
        fr = min(len(env) - 1, int(librosa.time_to_frames(o, sr=SR, hop_length=HOP)))
        if not chante[fr]: continue
        cand[k] = max(cand.get(k, 0), env[fr])
    actif = chante[(t >= F0) & (t <= F0 + duree)].mean() * duree
    cible = int(R['densite'] * actif)
    pris = []
    for k, sc in sorted(cand.items(), key=lambda kv: -kv[1]):
        if len(pris) >= cible: break
        if all(abs(k - q) * demi >= R['ecart'] - 1e-6 for q in pris): pris.append(k)
    temps_fleches = sorted(k * demi for k in pris)
    # longs blancs sans chant (> 3 s) : une flèche tous les 2 pas, sur les temps
    bouche = []
    bords = [-d] + temps_fleches + [duree]
    for a, b in zip(bords, bords[1:]):
        if b - a > 3:
            x = (int(a / d) + 2) * d
            while x < b - 1.0: bouche.append(round(x / demi) * demi); x += 2 * d
    tous = sorted(set(round(x, 4) for x in temps_fleches + bouche))
    sortie[cle] = tous
    print(f'{cle}: {len(temps_fleches)} flèches sur le chant + {len(bouche)} dans les blancs = {len(tous)} '
          f'(avant : {int(duree / d)}) ; chant {actif:.0f} s sur {duree:.0f}')

with open('src/bosses/kedric/paroles.js', 'w', encoding='utf-8') as f:
    f.write('// FICHIER GÉNÉRÉ par outils/kedric/caler_paroles.py (ne pas modifier à la main) :\n'
            '// les flèches du battle calées sur les PAROLES. Pour chaque musique : les moments des flèches (s) depuis la 1re flèche\n'
            '// de la manche (des demi-temps du morceau). Une manche avec `paroles: true` (reglages.js) les utilise.\n')
    f.write('export const PAROLES = ' + json.dumps(sortie).replace('], "', '],\n  "').replace('{"', '{\n  "').replace(']}', '],\n};') + '\n')
print('écrit : src/bosses/kedric/paroles.js')
