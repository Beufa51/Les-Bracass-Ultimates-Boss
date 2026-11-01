# Julien — niveau 2 : avis des développeurs et des joueurs (« c'est pas ultra fun »)

Retour de Fabien sur le prototype : pas très fun. Il faudrait un mini-niveau dans le lycée avant d'arriver dans la
salle du boss, et même le combat n'est pas terrible.

## Pourquoi ce n'est pas fun (diagnostic)

**Avis des développeurs (habitués des doom-like et des combats de boss)**
1. **Pas de montée en tension.** On sort de la manif et on tombe directement sur le boss. Dans Doom, un boss se
   *mérite* : un couloir, sa voix qu'on entend, une porte qu'on ouvre. Ici, rien ne prépare la rencontre.
2. **Un duel de tir à distance.** Julien reste au fond, toi au fond aussi : tu restes à couvert et tu tires
   en boucle. Pour qu'un boss soit fun, il doit **forcer le mouvement** (attaques qui chassent d'un abri, zones à éviter)
   et laisser des **fenêtres de punition** claires (le CRS essoufflé de la manif est le meilleur moment du niveau 1).
3. **Toutes les attaques s'esquivent pareil** (un pas de côté). Une bonne attaque de boss demande UNE réponse précise
   et lisible : sauter de côté, reculer, se cacher, foncer…
4. **Rien ne change entre les phases** à part la vitesse. Une phase doit changer la SALLE ou les RÈGLES.
5. **Une salle vide et grande.** Une classe sans élèves, c'est triste ; la salle est aussi trop profonde (12 cases) :
   Julien est minuscule au fond.
6. **Les armes de la manif** (œufs, tomates) ne racontent rien de nouveau : il manque un jouet propre à la classe.

**Avis des joueurs**
- « Je me planque, je sors, je tire, je me replanque : au bout de 30 s j'ai tout vu. »
- « Je ne sais pas quand il faut taper fort. »
- « Il ne se passe rien d'drôle : je veux voir Julien péter les plombs, les élèves réagir. »
- « Le tableau répété 5 fois fait bizarre ; Julien est trop petit au fond. »
- « J'ai aimé : le dico qui rebondit, la barre de vie avec les phases, les répliques. »

## Propositions

### A. Mini-niveau « LE LYCÉE » avant la classe (2-3 min, même moteur)
On entre par la cour (la fin de la manif) et on monte jusqu'à la **salle 12**. Petit, linéaire avec un détour secret.
1. **Le hall** : un **SURVEILLANT** (le « pion ») qui siffle et te court dessus (ennemi rapide au corps à corps,
   2 œufs le font fuir). Panneau d'affichage, distributeur de boissons (canette = petit soin).
2. **Le couloir des casiers** : **ÉLÈVES FAYOTS** qui crient « M'SIEUR ! IL EST LÀ ! » (ils alertent tout le
   couloir, on ne peut pas les blesser : on les contourne ou on leur passe derrière). Un casier ouvert = secret.
   **Extincteur** (le baril de Doom) : un œuf dessus → nuage de mousse, les ennemis glissent et tombent.
3. **La cantine** (ou le CDI) : une **DAME DE CANTINE** qui lance de la purée (un lanceur sous un autre costume :
   flaque de purée = tu glisses / tu ralentis). Plateaux = abris. La **clé** : ton **carnet de correspondance**,
   sur le comptoir.
4. **L'escalier → porte de la salle 12** (fermée sans le carnet). Derrière la porte, on entend Julien :
   « Entrez !… Vous êtes en RETARD. »
Coût : surtout des réglages et des images ; le moteur, les commandes, la carte et les ennemis existent déjà
(surveillant = CRS sans bouclier, dame de cantine = policier lanceur).

### B. Un VRAI combat contre Julien
**Salle** : moins profonde (8-9 cases), Julien plus proche et plus gros, des **élèves assis** (ils ne bloquent pas
les tirs mais réagissent : « OUAIS ! », « oh là là… », ils se cachent sous la table quand ça chauffe).
Tableau en 3 parties (gauche / milieu / droite), plus de répétition.

**La fenêtre de punition (le moment fort, comme le CRS essoufflé)** : après chaque grosse attaque, Julien se
**retourne pour écrire au tableau** (« Notez bien ! ») : 2 s DE DOS, dégâts ×2, les élèves chuchotent « VAS-Y ! ».
Le joueur apprend vite : esquiver la grosse attaque → foncer → punir.

**Des attaques qui demandent chacune une réponse précise**
| Attaque | Préavis lisible | Réponse |
|---|---|---|
| Livre seul / éventail | il lève le livre | pas de côté |
| **Mur de copies** : une ligne de copies sur toute la largeur avec UN trou | « Sortez une feuille ! » + bruit de papier | trouver le trou et s'y placer |
| **Dico qui rebondit** | il sort le gros dico rouge | ne pas rester près des murs |
| **« AU TABLEAU ! »** : il t'attire vers l'estrade (comme un aimant) pendant 2 s | il pointe du doigt | courir vers le fond, ou se coller à une table |
| **« CONFISQUÉ ! »** : si tu es trop près, il prend ton arme 8 s | il tend la main | ne pas rester collé / changer d'arme |
| **Craies en rafale** (rapides, petits dégâts) | crissement de craie | rester derrière une table |
| **Règle géante** : coup en arc s'il est au contact | il lève la règle | reculer |

**Des phases qui changent la salle**
1. **Cours normal** : livres, éventail, craies ; il se retourne souvent au tableau (on apprend la fenêtre).
2. **« INTERRO SURPRISE ! »** : il éteint la lumière et allume le **rétroprojecteur** (salle sombre, rayon de lumière
   dans lequel on se fait repérer) ; murs de copies + dictionnaire ; les élèves se cachent sous les tables.
3. **« TOUT LE MONDE EN RETENUE ! »** : il **renverse son bureau** (il devient un abri pour LUI, il faut le contourner),
   l'**alarme incendie** sonne (sprinklers : tout le monde glisse un peu), « AU TABLEAU ! » et « CONFISQUÉ ! » plus
   souvent, mais il se retourne aussi plus souvent (il perd ses moyens).

**Un jouet de la classe** : la **SARBACANE** (stylo vidé + boulettes de papier mâché) trouvée sous une table :
infinie, précise, petits dégâts, mais **×3 dans le dos** de Julien. On garde œufs et tomates de la manif (ils
sont drôles), en munitions plus rares.

**Fin** : Julien vaincu s'assoit, sonné, les élèves l'applaudissent… pas lui, toi. Puis il se relève : « Bon…
pas d'interro pour cette fois. » → BADGE.

### Ordre conseillé
1. **B (le combat)** d'abord : c'est le cœur du boss ; si le combat est bon, le niveau l'est aussi.
2. **A (le lycée)** ensuite : la montée en tension ; le niveau prend toute sa valeur avec le boss refait.
3. Images (prompts dans `julien_prompts_images.md`, sections 10 à 16) dès maintenant, en parallèle.
