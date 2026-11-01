// Plan du niveau 2 : LA SALLE DE CLASSE (le nord est en haut). Julien fait les cent pas devant le tableau ;
// toi, tu entres par la porte du fond. Les TABLES bloquent les livres : ce sont tes abris.
//
// Murs (chiffres) : 1 mur de la classe (affiches), 3 fenêtres, 4 porte (fermée), 5 6 7 tableau (gauche, milieu, droite).
// Sol : '.' vide, 'J' départ (regarde vers le tableau), 'U' Julien.
// Objets : 'd' table d'élève (bloque, abri), 'q' bureau du prof (bloque), 'o' boîte d'œufs, 't' cagette de tomates,
//          's' sandwich.
export const PLAN_CLASSE = [
  '111111567111111',
  '1.............3',
  '1......U......3',
  '1...q.........3',
  '1.............3',
  '1.............3',
  '1..d...d...d..3',
  '1............t3',
  '1....d...d....3',
  '1o............3',
  '1..d...d...d..3',
  '1.............3',
  '1s....J.....o.3',
  '111111141111111',
];

export const OBJETS_CLASSE = { d: 'table', q: 'bureau', o: 'oeufs', t: 'tomates', s: 'sandwich' };
export const RAYONS_CLASSE = { table: 0.48, bureau: 0.6 };

// Zone où Julien fait les cent pas (phases 1 et 2) ; en phase 3, il descend dans les allées vers toi
export const ESTRADE = { x0: 1.6, x1: 12.4, y0: 1.5, y1: 3.4 };
// Cases où un camarade peut te faire passer une boîte d'œufs (allées entre les tables)
export const CASES_SECOURS = [[1, 7], [4, 7], [9, 7], [13, 9], [4, 9], [10, 11], [1, 11], [13, 11], [5, 12], [9, 12]];

// Répliques de Julien (à PERSONNALISER avec Fabien lors de la passe de finition)
export const REPLIQUES = {
  debut: '« Tiens, un retardataire… et plein d\'œufs ! Interro surprise ! »',
  lancer: ['« Ouvrez vos livres page 42 ! »', '« Silence au fond ! »', '« On ne mange pas d\'œufs en classe ! »',
    '« Tu copieras 100 fois : je ne manifeste pas ! »', '« Au tableau ! »', '« Et ça se dit étudiant ! »'],
  phase2: '« INTERRO SURPRISE ! Sortez une feuille ! »',
  phase3: '« ÇA SUFFIT ! Tout le monde en RETENUE ! »',
  touche: ['« Mon costume ! »', '« Zéro de conduite ! »', '« Chez le proviseur ! »'],
  vaincu: '« Bon… d\'accord… pas d\'interro pour cette fois. »',
};
