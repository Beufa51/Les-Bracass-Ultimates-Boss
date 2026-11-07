# Rémi : avis de game designer sur le PLAISIR du babyfoot et de la porte

Fait par Claude (sous-agent) après lecture du code, des réglages, de NOTES.md et des audits précédents. J'ai aussi fait
jouer des bots « humains plausibles » dans le vrai jeu : réaction 0,25 à 0,3 s, lecture imprécise, aucune triche sur
l'avenir. Ils ont joué 4 parties de babyfoot et 3 parties de porte. Aucun fichier du jeu n'a été modifié.

Limites des mesures : le bot de babyfoot vise comme un joueur moyen. Il voit le vert avec du retard et dépasse un peu
l'angle. Un joueur entraîné qui tapote les flèches marquera plus vite. En défense, il est plutôt bon. Les durées sont
en temps de jeu.

---

## 1. LE BABYFOOT

### Verdict : 6/10
La visée façon billard est une vraie bonne idée. La présentation est soignée : sons, ralenti au but, Rémi qui boit.
Mais la partie est **longue et sans danger**. En PRESSION, on gagne presque toujours, en 4 minutes, après une
quarantaine d'échanges identiques : « il tire, j'arrête, je tire, contré ». Le jeu n'est pas « trop facile » parce qu'on
marque trop. Il paraît facile parce que **Rémi ne fait jamais peur**.

### La boucle vécue, seconde par seconde (PRESSION)
1. Rémi promène la balle et se penche (~1,1 s). On place le gardien du côté penché.
2. Il tire. La balle met ~0,45 s à arriver. On corrige et on l'arrête presque toujours.
3. On tourne la visée avec ◀ ▶ et on attend que la ligne passe au vert (~3 s en moyenne, jusqu'à 7 s).
4. On tire. Dans 2 cas sur 3, c'est contré. La balle s'arrête, pause de 0,7 s, et Rémi réengage : retour à l'étape 1.

| Mesure (bot humain) | PANACHÉ | PRESSION | CUL SEC |
|---|---|---|---|
| Résultat | gagné 5-0 | gagné 5-1 | perdu 1-5 |
| Durée de la partie | **2 min 40** | **4 min 10** | 1 min 50 |
| Tirs de Rémi / buts de Rémi | 38 / **0** | 48 / **2** | 24 / 5 |
| Arrêts sur les tirs cadrés | 100 % | 95 % | 95 % |
| Tes tirs / tes buts | 39 / 5 (13 %) | 41 / 5 (12 %) | 19 / 1 (5 %) |
| Tes tirs contrés | 32 | 27 | 14 |
| Tirs encore VERTS au moment où le doigt tape | 2 | 3 | 1 |
| Temps passé à viser | 36 % | **47 %** | 52 % |

Le reste du temps se partage à peu près ainsi en PRESSION : Rémi prépare son tir 21 %, la balle roule 15 %, pauses
et célébrations 15 %. Les célébrations ne sont donc **pas** le problème des temps morts. Le problème, c'est la répétition
du même échange.

### Ce qui marche
- La ligne avec rebonds, les points qui défilent et le rond d'arrivée : c'est le cœur du plaisir, à garder absolument.
- Lire la penche de Rémi avant le tir, puis l'arrêt avec secousse et éclat bleu : c'est satisfaisant.
- L'alcool des deux côtés raconte une histoire. Gamelle et roulette sonnent « bar ».
- Les 3 tirs de Rémi (pissette, piège, normal) sont bien différents à jouer.

### Les problèmes de plaisir (du plus grave au moins grave)
1. **Rémi ne marque presque jamais (PANACHÉ 0 sur 38, PRESSION 2 sur 48).** La défense ne demande pas d'effort, donc
   chaque but encaissé ne compte pas. Cause : la zone d'arrêt de ton gardien (`priseToi` 0,06 de chaque côté, soit
   12 cm) couvre **la moitié du but** (24 cm). En plus, la penche de Rémi annonce le côté et l'aide (`babyAide`) attire
   le gardien. Les retouches V19l à V19v ont toutes durci **ton attaque** (défense et gardien de Rémi qui lisent la
   visée). Résultat : la partie s'allonge, mais elle ne devient pas plus tendue.
2. **L'échange raté ne mène nulle part.** Après un contre, la balle s'arrête (`contre()` : vitesse x 0,3, puis
   `suivant(0.7)`) et Rémi réengage. Un tir raté n'a aucune conséquence. On peut donc tirer n'importe quoi, et 2 échanges
   sur 3 se terminent dans le vide.
3. **Le vert dure trop peu pour un pouce humain.** Sa défense suit ta visée (`retardRemi` 6, `babyDefense` 0,33 m/s).
   Quand l'œil voit le vert, que le pouce lâche la flèche puis tape TIR (~0,35 s), la visée a dépassé ou la défense a
   refermé. Le bot n'a tiré au vert que 3 fois sur 41 en PRESSION. Le joueur ressent alors : « c'était vert et j'ai été
   contré ». À l'inverse, des tirs jaunes rentrent parfois. La ligne devient une épreuve de réflexe au lieu d'un plan
   de billard.
4. **La visée sans limite de temps crée de longues attentes.** Il y a des visées de 6 à 9 s. Il n'y a aucune raison de
   se presser, à part le bonus ÉCLAIR, qui ne dure que 0,74 s.
5. **Les bandes ne servent pas.** Le bot humain n'a fait aucun tir en bande, parce qu'il faut tourner ~1,5 s pour y
   aller. Rien ne récompense un beau coup de billard plus qu'un tir droit.
6. **Le saut de difficulté entre PRESSION et CUL SEC est brutal.** Rémi marque 4 % de ses tirs, puis 21 %. Tes tirs
   rentrent à 12 %, puis 5 %. PRESSION s'ennuie, CUL SEC écrase.
7. **Intro de 7 lignes.** On lit beaucoup avant de jouer (gamelle,
   roulette, pintes...).

### Améliorations proposées (rangées par plaisir / effort)
| # | Ce que voit le joueur | Pourquoi c'est plus fun | Effort | Risque | Image ? |
|---|---|---|---|---|---|
| B1 | **Rémi fait peur** : ses tirs passent plus souvent (`priseToi` par difficulté : 0,06 / 0,055 / 0,048 / 0,045 ; `babyAide` 0 dès PRESSION). Objectif mesuré : Rémi marque 1 tir sur 4 en PRESSION. Et pour compenser, **on retire la dernière couche de défense** (`babyGardienLit` 0,4 → 0,2) | Chaque tir de Rémi devient un vrai moment, et la partie se joue des deux côtés. Plus court : 5 buts arrivent en ~2 min | Petit (réglages + bot) | Moyen : trop dur au téléphone si on va trop loin. Faire jouer Fabien | Non |
| B2 | **Vert « collant »** : un tir tapé moins de 0,2 s après la fin du vert part avec l'angle vert. Et les zones rouges montrent **où vont** ses défenseurs (une flèche), pas seulement où ils sont | Le joueur gagne sur un plan (« je feinte, il part, je reviens ») au lieu d'un réflexe. La promesse « vert = but » redevient vraie pour un humain | Petit | Faible (le bot vérifie déjà que tout tir vert marque) | Non |
| B3 | **BALLE FOLLE après un contre** (proposition A de l'habitué, je suis d'accord, et c'est la plus importante de son avis) : le contre renvoie la balle vers ton but, assez vite. Arrêtée : tu rejoues. Ratée : il peut y avoir but | Un mauvais tir devient risqué, donc le vert devient précieux. Les échanges s'enchaînent sans pause, comme au vrai babyfoot | Moyen | Moyen : il faut que la balle folle reste arrêtable (vitesse plafonnée) | Non |
| B4 | **Règle du bar « 10 secondes »** (c'est une vraie règle de babyfoot) : à partir de 5 s de visée, compte à rebours « 5... 4... » au-dessus de la balle. À 0, Rémi récupère la balle | Fini les visées de 8 s. La pression monte toute seule, sans toucher à la visée sans limite que Fabien aime (5 s, c'est large) | Petit | Faible | Non |
| B5 | **Le beau coup paye** : un but **en bande** = « BILLARD ! », Rémi boit 2 pintes (défense ralentie deux fois). Un but sur le jaune (son gardien pouvait l'avoir) = « CULOT ! », +1 point de bilan | Le joueur a enfin un choix : tir sûr ou tir de patron. La visée billard devient une prise de risque | Petit | Faible | Non |
| B6 | Intro réduite à 3 lignes. Gamelle, roulette et pintes s'expliquent quand elles arrivent pour la première fois (bulle courte) | On joue plus vite, on retient mieux | Petit | Nul | Non |
| B7 | Passe à ton attaque (proposition B de l'habitué) | Variété réelle, mais seulement une fois que la boucle de base tient | Gros | Élevé (nouvelle barre, nouvelle IA) | Peut-être : ton attaque de dos (planche `remi_baby_toi` élargie) |

Je ne suis **pas d'accord** avec la proposition C de l'habitué (puissance en maintenant TIR). Elle ajoute un 3e réglage
sous le même pouce, et le problème n'est pas la puissance. La proposition E (amorti) n'est utile qu'avec la balle folle
(B3) : à faire avec elle ou pas du tout.

---

## 2. LA PORTE ET LE VIDEUR

### Verdict : 4,5/10
L'emballage est très bon : décor, vue de dos, porte qui se bombe, « BAM », musique coupée quand le videur regarde.
Mais **il n'y a plus de décision**. Depuis V18, cacher son poing garde 100 % de la charge, et le videur est toujours
annoncé au moins 0,85 s. Un joueur attentif ne se fait donc **jamais** attraper, et charger à fond ne coûte rien.
Pire : **le joueur qui frappe le plus fort perd** à cause d'un défaut dans le calcul de la fin (voir problème 1).

### La boucle vécue
1. À TOI : on maintient. 100 % de puissance en 1,2 s, et charger plus n'a ni risque ni intérêt.
2. On garde le doigt et on attend que la cible passe sur le +. Si des pas arrivent, on lâche (poing caché, rien de
   perdu), on attend 2 à 4 s, et on recommence.
3. On lâche au bon moment : 850 à 999 de dégâts.
4. Tour de Rémi : on **regarde sans rien faire** (~3 s par tour).
5. On recommence, 4 fois chacun.

| Mesure (bot humain, 3 parties) | PRESSION | PRESSION | CUL SEC |
|---|---|---|---|
| Durée | 44 s | 42 s | 33 s |
| Tes coups (4) | 895 / 999 / 918 / 911 | 956 / 895 / 944 / 944 | 999 / 999 / 852 / 856 |
| Coups de Rémi (4) | 947 / 817 / 905 / 805 | 970 / 892 / 791 / 837 | 897 / 836 / 870 / 794 |
| Total affiché | **TOI 2831 - 3474 RÉMI : PERDU** | **2847 - 3490 : PERDU** | **2897 - 3397 : PERDU** |
| Attrapés (toi / Rémi), sur 30 passages d'intrus | 0 / 0 | 0 / 0 | 0 / 0 |
| Part du temps à ne rien faire (tour de Rémi) | 27 % | 33 % | 49 % |
| Ton tour le plus long (à attendre le videur) | 9,7 s | 12,6 s | 5,2 s |

### Ce qui marche
- Le geste unique (maintenir, lâcher) est parfait sur téléphone.
- L'ambiance : pas, ombre, musique coupée net, « scratch ». Le gars qui vient pisser est un bon gag.
- La sensation du coup (porte qui se bombe, chiffre qui jaillit, arrêt sur image).

### Les problèmes de plaisir (du plus grave au moins grave)
1. **BUG DE RÈGLE : celui qui casse la porte est puni.** Dans `impact()`, le coup qui fait céder la porte ne compte que
   ce qui restait de solidité (`Math.min(score, this.solidite)`, parfois **19 points** pour un coup à 911). L'autre
   joueur reçoit ensuite un DERNIER COUP compté **en entier** (`dernierTour ? score`). Comme TU COMMENCES, c'est
   presque toujours toi qui casses au 4e tour. Résultat : 3 parties sur 3 perdues de ~600 points, alors que le bot
   tapait plus fort que Rémi à chaque tour. Le joueur ressent une injustice totale qu'il ne peut pas comprendre.
2. **Aucun risque, donc aucune décision.** Charger au maximum est toujours le bon choix (la puissance plafonne à 100 %
   sans danger). Cacher son poing est gratuit (V18). Le videur n'attrape jamais un joueur qui réagit en 0,3 s. L'idée de
   l'audit V10 (« encore un peu... ou je lâche ? ») a disparu au fil des corrections pour rendre le jeu plus juste.
   Le videur n'est plus un danger : c'est **une file d'attente**.
3. **La moitié du temps, on regarde.** Pendant le tour de Rémi, le joueur n'a aucune action (27 à 49 % de la partie).
4. **Rémi a la même force dans toutes les difficultés** (~860 en PRESSION comme en CUL SEC). Il attend la cible en
   chargeant, donc il dépasse toujours sa « gourmandise » (`remiCharge`). En CUL SEC, il ne se fait jamais prendre
   (`remiPrudent` 0,85). La difficulté ne change que la taille de ta cible.
5. **La précision pèse peu.** Dégâts = puissance x (0,55 + 0,45 x précision) : un coup mal visé donne encore ~640. Le
   seul talent du jeu (lâcher au bon moment) compte pour moins de la moitié.
6. **Le pisseur ne se devine pas.** Même bruit et même ombre que le videur, voulu en V12. Il n'y a donc rien à lire,
   seulement à attendre, et continuer de charger est un pile ou face.
7. Intro de **8 lignes** : la plus longue des 3 jeux.

### Améliorations proposées (rangées par plaisir / effort)
| # | Ce que voit le joueur | Pourquoi c'est plus fun | Effort | Risque | Image ? |
|---|---|---|---|---|---|
| P1 | **Corriger la fin** : le coup qui casse la porte compte en entier (enlever `Math.min(score, this.solidite)` du total ; la barre, elle, s'arrête à 0) | Celui qui tape le plus fort gagne vraiment. Sans ça, rien d'autre ne sert | **Petit** (1 ligne) | Nul | Non |
| P2 | **LA RAGE** : la jauge continue au-delà de 100 % jusqu'à 130 % (zone rouge, le perso grogne, la manette vibre). Les dégâts montent encore, mais **le bruit attire l'intrus** : plus tu es dans le rouge, plus il arrive vite, et avec une annonce plus courte (jamais sous 0,5 s) | La prise de risque revient : « encore un peu... ». Un joueur prudent fait 900, un joueur culotté fait 1200 ou se fait attraper | Petit-moyen | Moyen : à régler pour que la rage paie 1 fois sur 2 | Non |
| P3 | **Poing caché moins gratuit** : cacher garde 60 % de la charge (au lieu de 100 %) | Une fausse alerte coûte quelque chose. Lâcher trop tôt ou trop tard devient un vrai choix. Se combine avec P2 | Petit | Faible | Non |
| P4 | **SIFFLE LE VIDEUR** pendant le tour de Rémi : un bouton (1 fois par tour de Rémi) qui fait venir l'intrus plus tôt. Si Rémi charge quand il regarde : RÉMI ATTRAPÉ. Mais le videur se méfie de toi : à ton tour suivant, son annonce est plus courte | Le joueur joue pendant le tour de Rémi, avec un coup de vice très « bar ». Rémi attrapé devient le gag qu'il devait être | Moyen | Moyen : il faut que Rémi réagisse parfois à temps | Optionnel : pose « videur méfiant » (prompt plus bas) |
| P5 | **La précision compte plus** : dégâts x (0,35 + 0,65 x précision), et un « PILE DESSUS ! » plus fort (son + cible qui éclate) | Le talent (timing) pèse plus que le hasard | Petit | Faible | Non |
| P6 | **Rémi selon la difficulté** : en DIABOLO / PANACHÉ, il frappe dès sa gourmandise atteinte (~650 à 750) ; en CUL SEC, il fait de la RAGE (P2) et prend des risques | Vraie progression de difficulté, et un Rémi différent à chaque niveau | Petit | Faible | Non |
| P7 | **Le pisseur se devine un peu** : pas traînants + « hips » une fois sur deux pendant l'annonce. Continuer de charger devant lui = « CULOT ! » +15 % | Un indice à écouter, un pari à faire, et le gag du pisseur devient un jeu | Petit | Faible | Non |
| P8 | Intro réduite à 3 lignes (maintenir / lâcher sur le + / lâche si quelqu'un arrive). Le reste s'explique la première fois que ça arrive | Moins de lecture | Petit | Nul | Non |

À propos de l'audit V17 : « porte plus courte en facile » est inutile, car la partie dure déjà ~40 s. Le défi « porte
sans se faire attraper » n'a de sens qu'après P2 / P3 (aujourd'hui, personne ne se fait attraper).

Prompt facultatif pour P4 (nom attendu : `remi_videur_mefiant.png`, à joindre : `remi_videur.png` pour garder le même
personnage). À ranger aussi dans `propositions/remi_prompts_images.md`.
```
Même videur que l'image jointe (même style dessin, mêmes vêtements, même cadrage : il passe la tête au coin d'un mur,
à gauche), nouvelle pose : yeux plissés, sourcil levé, il pointe deux doigts vers ses yeux puis vers le spectateur
(« je te surveille »). Fond transparent, 1 seule pose, même taille que l'image jointe.
```

---

## FAIT (V19x / V19y)
P1 à P8 et B1 à B6 faits. Restent : B7 (passe à ton attaque), et les propositions C (puissance) et E (amorti) de
l'habitué, déconseillées ici.

## 3. TOP 5 GLOBAL (à faire dans cet ordre)
1. **Porte P1** : le coup qui casse la porte compte en entier. 1 ligne, et le joueur arrête de perdre injustement.
2. **Babyfoot B1 + B4** : Rémi plus dangereux (zone d'arrêt plus petite, sans aide dès PRESSION) et règle des
   10 secondes. Partie plus courte et tendue des deux côtés.
3. **Babyfoot B2** : vert « collant » 0,2 s et flèches sur ses défenseurs. Le vert redevient une promesse tenue.
4. **Porte P2 + P3** : la RAGE au-delà de 100 % qui attire le videur, et le poing caché qui ne garde que 60 %. Le
   risque revient.
5. **Babyfoot B3** : balle folle après un contre. Les échanges s'enchaînent et un mauvais tir se paie.

(Ensuite : P4 « siffle le videur », B5 « beau coup », P5 / P6, intros raccourcies.)

## 4. Ce qu'il ne faut SURTOUT PAS faire
- **Ne plus durcir la défense ou le gardien de Rémi** (`babyDefense`, `babyGardienLit`, `retardRemi`). Ça rallonge la
  partie sans créer de tension : c'est ce qui donne l'impression « encore un peu facile » malgré 4 minutes de jeu.
- **Ne pas rendre la ligne verte menteuse** (un vert qui se fait arrêter). La confiance dans la visée est le cœur du
  plaisir. Le bot `remi_baby_bot.mjs` doit continuer à vérifier que tout tir vert marque.
- Ne pas ajouter de 3e réglage au tir (puissance) sous le même pouce.
- Ne pas rallonger la porte et ne pas remettre d'intrus en plus : le problème est le risque, pas la variété.
- Ne pas re-rendre le videur « surprise » à 0,3 s (refusé en V18 pour une bonne raison). Le danger doit venir du choix
  du joueur (rage, poing caché), pas d'une attaque impossible à voir venir.
- Ne pas équilibrer au feeling : relancer un bot « humain » (réaction 0,25 s) après chaque réglage. Le bot qui triche
  ne voit aucun de ces problèmes.
