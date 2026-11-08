// Plan du niveau 1 : LA MANIF (généré par outils/julien/plan_manif.py, qui vérifie que le lycée est atteignable).
// Le nord est en haut. Parcours en 5 zones (voir propositions/julien_audit_manif.md) :
//  1 BOULEVARD (en bas) : départ dans la foule, zone sûre ; l'avenue du milieu est bloquée par des camions de CRS
//  2a RUELLE TAGUÉE (à gauche) : un CRS seul (apprendre le pas de côté) ; 2b PASSAGE (à droite) : un lanceur seul
//  3 PLACE : statue au centre (abri) ; 4 RUE DU LYCÉE : cordon de 2 CRS + barrière ; 5 PARVIS : portail fermé tant que la
//  police est là (vague finale), puis on entre dans la cour (cases S).
//
// Murs (chiffres) : 1 briques, 2 immeuble crème, 3 tabac (briques), 4 mur tagué, 5 palissade, 6 mur du lycée,
//                   7 portail du lycée (s'ouvre à la fin), 8 tabac (pierre).
// Murs SECRETS (s'ouvrent quand on pousse dedans) : 'X' (aspect mur tagué), 'Z' (aspect tabac).
// Sol : '.' vide, 'J' départ (regarde vers le haut), 'S' arrivée (dans la cour du lycée).
// Ennemis : 'P' policier lanceur de lacrymos, 'B' CRS au bouclier.
// Objets : 'o' boîte d'œufs, 's' sandwich, 'b' barrière, 'p' poubelle, 'm' manifestant, 'T' statue,
//          'C' camion de CRS, 'k' colonne Morris (tous bloquent sauf œufs et sandwich).
// Armes (la 1re trouvée donne l'arme, les suivantes des munitions) : 't' cagette de tomates, 'w' pistolet à eau,
//          (fumigènes SUPPRIMÉS : demande de Fabien), 'Y' la SONO (grand secret de la ruelle : fait fuir
//          tous les policiers en vue).
// Ennemis en plus : 'N' BAC en civil (rapide, t'attrape au corps à corps), 'L' tireur de LBD (balle rapide en ligne droite).
// 'q' CARTE DE CANTINE → ouvre 'D', la PORTE DE SERVICE : couloir de la place au parvis (contourne le cordon).
// Bonus : 'e' écharpe mouillée (pas de toux dans les lacrymos), 'c' café serré (plus rapide), 'K' K-Way (armure).
// 'a' SAC DE FARINE (bloque) : un œuf ou une tomate dessus → nuage blanc, les policiers autour fuient (en chaîne).
// 'R' RIDEAU DE FER (mur n°9) : se lève quand on ramasse le 1er pistolet à eau → embuscade (policiers cachés derrière).
export const PLAN_MANIF = [
  '6666666666666666666666666666666666',
  '66666666666666SSSSS666666666666666',
  '66666666666666.....666666666666666',
  '6666666666666677777666666666666666',
  '1112221112.P..a.......P.1112221112',
  '1112221112..b......a.b..1112221112',
  '1112221112......B..............112',
  '1112221112.ot.....N..cs.111222.112',
  '2221112221...b........b.222111.221',
  '222111222111228...322111222111.221',
  '222111222111223.P.822111222111.221',
  '222111222111223...822111222111.221',
  '111222111222118BbB311222111222L112',
  '111222111222113.a.811222111222.112',
  '111222111222113...811222111222.112',
  '111222111222118w..311222111222.112',
  '222111222111223..K822111222111.221',
  '222111222111223...822111222111.221',
  '222111..a................a..D..221',
  '222111.P............L.....P.112221',
  '111222...b..............b...221112',
  '111222..o...................221112',
  '111222..........T....a......221112',
  '111222.....B................221112',
  '222111......a.........N.....112221',
  '222111..p...............p...112221',
  '222111.e.w..k........k....t.112221',
  '222111......................112221',
  '111224p..42215.....51228...3221112',
  '111224...42215.....51223.P.8221112',
  '111.Y4.B.42215.C.C.512PR..a3221112',
  '111soX...42215.....51223w..8qg1112',
  '222K.4..t41125bbbbb521BR...Zoo2221',
  '222114...41125.....52113.o.8..2221',
  '222114.o.41125.m.m.52118.e.3112221',
  '222114...41125.....52113...8112221',
  '4................................4',
  '4...........m......m..m.....m....4',
  '4...m........m....m...........c..4',
  '4.........m.....J........m.......4',
  '4.......m.....m.....m.........m..4',
  '4.....p....................p.....4',
  '5555555555555555555555555555555555',
];

export const OBJETS = {
  P: 'lanceur', B: 'bouclier', o: 'oeufs', s: 'sandwich', b: 'barriere', p: 'poubelle', m: 'manifestant',
  T: 'statue', C: 'camion', k: 'colonne', t: 'tomates', w: 'eau',
  e: 'echarpe', c: 'cafe', K: 'kway', a: 'farine',
  N: 'bac', L: 'lbd', Y: 'sono', q: 'carte', g: 'pourris',   // g : ŒUFS POURRIS (trésor du secret du passage)   // audit nov. 2026 : BAC en civil, tireur de LBD, la SONO (arme 6), carte de cantine
};
export const PORTES = { D: '9' };   // porte de service (aspect rideau de fer) : s'ouvre en poussant, avec la CARTE DE CANTINE
export const RIDEAUX = { R: '9' };   // lettre du plan → mur « rideau de fer » (n°9)
export const SECRETS = { X: '4', Z: '3' };   // lettre du plan → aspect du mur tant qu'il est fermé

// Messages qui s'affichent la première fois qu'on entre dans une zone (x0, y0, x1, y1 : cases, bornes comprises)
export const ZONES = [
  { x0: 1, y0: 36, x1: 32, y1: 41, texte: 'Les CRS bloquent l\'avenue ! Passe par la RUELLE (à gauche) ou le PASSAGE (à droite).' },
  { x0: 6, y0: 28, x1: 8, y1: 33, texte: 'Un CRS ! Quand il charge : PAS DE CÔTÉ. Puis vise-le pendant qu\'il souffle.' },
  { x0: 24, y0: 28, x1: 26, y1: 33, texte: 'Un lanceur ! Quand il LÈVE LE BRAS, bouge : la lacrymo tombe là où tu étais.' },
  { x0: 6, y0: 18, x1: 27, y1: 27, texte: 'La place ! Cache-toi derrière la statue.' },
  { x0: 15, y0: 9, x1: 17, y1: 17, texte: 'Le lycée est au bout ! Fais fuir le cordon de CRS.' },
  { x0: 10, y0: 4, x1: 23, y1: 8, texte: 'Portail fermé ! Le CPE n\'ouvrira pas tant que la police est sur le parvis.',
    ouvert: 'Le portail est ouvert : fonce dans la cour !' },
];
// Les policiers placés sur le parvis : quand ils ont tous fui, le portail (murs 7) s'ouvre
export const PARVIS = { x0: 10, y0: 4, x1: 23, y1: 8 };
// Difficulté = nombre de policiers (comme Doom) : absents en Lycéen sage / Délégué, renforts en Anarchiste
export const ABSENTS_FACILE = [[26, 19], [16, 10], [22, 4], [18, 7], [30, 12]];   // (+ BAC du parvis, LBD du couloir)
export const RENFORTS_ANARCHISTE = [
  { type: 'bouclier', x: 22, y: 23 }, { type: 'bouclier', x: 19, y: 8 }, { type: 'lanceur', x: 20, y: 25 }, { type: 'lanceur', x: 8, y: 34 },
];
// Dernière vague : quelques secondes après l'arrivée sur le parvis, un fourgon bloque la rue du lycée derrière toi
// et dépose des CRS (le portail ne s'ouvre qu'après eux)
export const FOURGON = { attente: 3, camion: [16.5, 11.0], renforts: [['bouclier', 15.5, 9.5], ['bouclier', 17.5, 9.5]],
  perche: ['lanceur', 16.5, 11.0, 0.62],   // un policier SUR LE TOIT du fourgon (x, y, hauteur) : il ne bouge pas
  renfortAnarchiste: ['lanceur', 16.5, 9.5] };
// Lumière : zones sombres (ruelle) et néons qui clignotent (vitrines de la rue du lycée)
export const SOMBRE = [[3, 28, 9, 35]];
export const NEONS = [[14, 9, 14, 17], [18, 9, 18, 17]];
export const PAR = 210;   // temps de référence (s), comme le « PAR » de Doom
