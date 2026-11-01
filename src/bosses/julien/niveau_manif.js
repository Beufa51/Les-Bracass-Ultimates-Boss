// Plan du niveau 1 : LA MANIF (généré par outils/julien/plan_manif.py, qui vérifie que le lycée est atteignable).
// Le nord est en haut. Parcours en 5 zones (voir propositions/julien_audit_manif.md) :
//  1 BOULEVARD (en bas) : départ dans la foule, zone sûre ; l'avenue du milieu est bloquée par des camions de CRS
//  2a RUELLE TAGUÉE (à gauche) : un CRS seul (apprendre le pas de côté) ; 2b PASSAGE (à droite) : un lanceur seul
//  3 PLACE : statue au centre (abri) ; 4 RUE DU LYCÉE : cordon de 3 CRS ; 5 PARVIS : portail fermé tant que la
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
//          'f' fumigènes.
// Bonus : 'e' écharpe mouillée (pas de toux dans les lacrymos), 'c' café serré (plus rapide), 'K' K-Way (armure).
export const PLAN_MANIF = [
  '6666666666666666666666666666666666',
  '66666666666666SSSSS666666666666666',
  '66666666666666.....666666666666666',
  '6666666666666677777666666666666666',
  '1112221112.P..........P.1112221112',
  '1112221112..b........b..1112221112',
  '1112221112......B.......1112221112',
  '1112221112.ot........cs.1112221112',
  '2221112221...b.....B..b.2221112221',
  '222111222111228...3221112221112221',
  '222111222111223.P.8221112221112221',
  '222111222111223...8221112221112221',
  '111222111222118BBB3112221112221112',
  '111222111222113...8112221112221112',
  '111222111222113...8112221112221112',
  '111222111222118w..3112221112221112',
  '222111222111223.oK8221112221112221',
  '222111222111223...8221112221112221',
  '222111......................112221',
  '222111.P..................P.112221',
  '111222...b..f...........b...221112',
  '111222..o...................221112',
  '111222..........T...........221112',
  '111222.....B..........B.....221112',
  '222111..........f........s..112221',
  '222111..p...............p...112221',
  '222111.e.w..k........k....t.112221',
  '222111......................112221',
  '111224p..42215.....51228...3221112',
  '111224...42215.....51223.P.8221112',
  '111..4.B.42215.C.C.51228...3221112',
  '111soX...42215.....51223w..8..1112',
  '222K.4..t41125bbbbb52118...Zoo2221',
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
  T: 'statue', C: 'camion', k: 'colonne', t: 'tomates', w: 'eau', f: 'fumigenes',
  e: 'echarpe', c: 'cafe', K: 'kway',
};
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
export const PAR = 210;   // temps de référence (s), comme le « PAR » de Doom
