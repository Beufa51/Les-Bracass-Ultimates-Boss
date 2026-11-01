// Plan du niveau 2 : LA SALLE DE CLASSE (le nord est en haut). Julien fait les cent pas devant le tableau ;
// toi, tu entres par la porte du fond. Salle peu profonde (Julien reste proche et bien visible).
//
// Murs (chiffres) : 1 mur de la classe (affiches), 3 fenêtres, 4 porte (fermée), 5 6 7 tableau (gauche, milieu, droite).
// Sol : '.' vide, 'J' départ (regarde vers le tableau), 'U' Julien.
// Objets : 'd' table vide (bloque, abri), 'e' table avec un ÉLÈVE assis derrière (il réagit, ne bloque pas les tirs),
//          'q' bureau du prof (bloque), 'o' boîte d'œufs, 't' cagette de tomates, 's' sandwich,
//          'b' la SARBACANE (sous une table).
export const PLAN_CLASSE = [
  '111111567111111',
  '1.............3',
  '1......U......3',
  '1...q.........3',
  '1.............3',
  '1..e...d...e..3',
  '1.......b.....3',
  '1o...e...e...t3',
  '1.............3',
  '1s....J.....o.3',
  '111111141111111',
];

export const OBJETS_CLASSE = { d: 'table', e: 'table', q: 'bureau', o: 'oeufs', t: 'tomates', s: 'sandwich', b: 'sarbacane' };
export const RAYONS_CLASSE = { table: 0.48, bureau: 0.6 };

// Zone où Julien fait les cent pas (phases 1 et 2) ; en phase 3, il reste derrière son bureau renversé
export const ESTRADE = { x0: 1.6, x1: 12.4, y0: 1.5, y1: 3.2 };
export const BUREAU_RENVERSE = { x: 7.5, y: 3.3, rayon: 0.85 };
// Cases où un camarade peut te faire passer une boîte d'œufs (allées entre les tables)
export const CASES_SECOURS = [[1, 6], [4, 6], [10, 6], [13, 6], [3, 8], [7, 8], [11, 8], [3, 9], [9, 9]];

// Répliques des ÉLÈVES (à personnaliser lors de la passe de finition)
export const ELEVES = {
  dos: ['« VAS-Y ! »', '« Maintenant ! »', '« Il voit rien ! »', '« Dans le dos ! »'],
  touche: ['« OUAIS ! »', '« En plein dedans ! »', '« Trop fort ! »'],
  aie: ['« Oh là là… »', '« Aïe… »', '« Ça pique ! »'],
  noir: ['« Qui a éteint ?! »', '« J\'ai peur ! »'],
  alarme: ['« Le feu !! »', '« On va être trempés ! »'],
  fin: '« BRAVO ! BRAVO ! »',
};

// Répliques de Julien (à PERSONNALISER avec Fabien lors de la passe de finition)
export const REPLIQUES = {
  debut: '« Tiens, un retardataire… et plein d\'œufs ! Vous êtes en RETARD ! »',
  lancer: ['« Ouvrez vos livres page 42 ! »', '« Silence au fond ! »', '« On ne mange pas d\'œufs en classe ! »',
    '« Tu copieras 100 fois : je ne manifeste pas ! »', '« Et ça se dit étudiant ! »'],
  dos: ['« Notez bien ! »', '« Je l\'écris au tableau… »', '« Page 42, exercice 3… »'],
  mur: '« SORTEZ UNE FEUILLE ! »',
  aimant: '« TOI ! AU TABLEAU ! »',
  confisque: '« Donne-moi ça ! »',
  confisqueOk: '« CONFISQUÉ ! »',
  regle: '« Recule ! »',
  phase2: '« INTERRO SURPRISE ! On éteint la lumière ! »',
  phase3: '« ÇA SUFFIT ! Tout le monde en RETENUE ! »',   // il renverse son bureau, l'alarme incendie sonne
  touche: ['« Mon costume ! »', '« Zéro de conduite ! »', '« Chez le proviseur ! »'],
  vaincu: '« Bon… d\'accord… pas d\'interro pour cette fois. »',
};
