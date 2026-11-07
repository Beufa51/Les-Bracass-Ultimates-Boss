# Rémi — le VÉLO : raccourci + audit de complexité (V20)

Retour de Fabien : « c'est trop simple, on ne voit pas l'intérêt des chemins durs ou pas ; je gagne toujours avec
30 secondes restantes ». Demande : raccourcir le vélo et faire l'audit de complexité.

## 1. Pourquoi il restait 30 s (mesuré)
- Le trajet faisait 30 000 px (~63 s de route en PRESSION) pour 70 s accordées : ~7 s de marge…
- … plus les BONUS de temps : +1 s par pinte, +2 s par série de 5, +3 s par salto. Un joueur correct en gagnait ~25 s.
- Résultat : le chrono ne menaçait jamais, donc le RACCOURCI (plus court mais bondé) n'avait aucun intérêt.

## 2. Ce qui a changé (V20)
- Trajet 30 000 → **21 000 px**.
- Bonus : pinte **+0,5 s**, série **+1 s**, salto **+2 s**.
- Raccourcis un peu plus courts (0,65 → 0,55 d'un tronçon : ~6 s gagnées chacun, annoncé sur le panneau).
- Chrono : DIABOLO 58 s, PANACHÉ 50 s, PRESSION 43 s, CUL SEC 37 s.
- Mesure (bot qui ne chute jamais, n'attrape AUCUNE pinte, n'est jamais ralenti) :

| Difficulté | Grande route | Les 2 raccourcis |
|---|---|---|
| PRESSION | arrive avec 3,3 s | arrive avec 11 s |
| CUL SEC | n'arrive pas (il faut des pintes) | arrive avec 7 s |

Chaque chute coûte ~3 s ; le raccourci est bondé (densité x1,9, poubelles). Donc :
**grande route = sûre mais juste, il faut attraper des pintes ; raccourci = du temps d'avance, mais chaque chute le mange.**

## 3. Audit de complexité : 16 choses dans le vélo
| # | Chose à savoir | Verdict |
|---|---|---|
| 1 | Le vélo roule tout seul et accélère | GARDER |
| 2 | SAUTE (tenir = plus haut) | GARDER |
| 3 | EN BAS : esquive le bourré allongé | GARDER |
| 4 | DRING : le bourré debout s'écarte, celui qui traverse s'arrête | GARDER |
| 5 | Verre, flaque, vomi : saute (sinon ralenti) | GARDER (même geste pour les 3 : rien à apprendre) |
| 6 | Poubelles (raccourcis) : grand saut | GARDER (c'est le prix du raccourci) |
| 7 | Tremplin + voitures : on roule sur le toit | GARDER (le moment spectaculaire) |
| 8 | Pintes en l'air : +0,5 s | GARDER (c'est ce qui rend la grande route possible) |
| 9 | Série de 5 : +1 s | GARDER (invisible : on le découvre en jouant) |
| 10 | SALTO après un tremplin : +2 s | GARDER (bonus caché, annoncé quand on s'envole) |
| 11 | Carrefours : grande route ou raccourci | GARDER — c'était lui qui ne servait à rien, corrigé en V20 |
| 12 | Pêcheur (quais), chorale (centre-ville) | GARDER (variété visuelle, même geste DRING) |
| 13 | Icônes au-dessus des obstacles (sauf CUL SEC) + « le bon moment » | GARDER (c'est ce qui rend 3 gestes lisibles) |
| 14 | Textos de Rémi | GARDER (ambiance, rien à faire) |
| 15 | Chute = temps perdu, puis invincible un instant | GARDER |
| 16 | Chrono « fermeture du bar » | GARDER (il compte enfin) |

**Verdict** : contrairement à la porte et au babyfoot, le vélo n'est PAS trop compliqué. Il n'y a que 3 gestes
(SAUTE, EN BAS, DRING) et tout le reste dit quel geste faire. Son vrai défaut était l'inverse : **trop facile**, donc
les choix (route, pintes, risques) ne comptaient pas. Rien à retirer ; c'est la pression du chrono qui manquait.

## 4. À surveiller
- Que la grande route ne soit pas impossible pour un joueur moyen en PRESSION (il faut ~la moitié des pintes).
  Si c'est trop dur : PRESSION 45 s (réglage `temps` dans DIFFICULTES).
- La soirée complète est plus courte : vélo ~45 s, babyfoot ~2 min, porte ~20 s.
