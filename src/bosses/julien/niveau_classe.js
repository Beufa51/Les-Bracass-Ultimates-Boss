// Plan du niveau 2 : LA SALLE DE CLASSE (le nord est en haut). Julien fait les cent pas devant le tableau ;
// toi, tu entres par la porte du fond. Salle peu profonde (Julien reste proche et bien visible).
//
// Murs (chiffres) : 1 mur de la classe (affiches), 3 fenêtres, 4 porte (fermée), 5 6 7 tableau (gauche, milieu, droite).
// Sol : '.' vide, 'J' départ (regarde vers le tableau), 'U' Julien.
// Objets : 'd' table vide (bloque, abri), 'e' table avec un ÉLÈVE assis (il réagit), 'q' bureau du prof (bloque),
//          's' sandwich. (Pas d'œufs ni de tomates : les armes de la manif sont interdites au lycée, sarbacane seule.)
export const PLAN_CLASSE = [
  '111111567111111',
  '1.............3',
  '1......U......3',
  '1...q.........3',
  '1.............3',
  '1..e...d...e..3',
  '1.............3',
  '1s...e...e....3',
  '1.............3',
  '1s....J.......3',
  '111111141111111',
];

export const OBJETS_CLASSE = { d: 'table', e: 'table', q: 'bureau', o: 'oeufs', t: 'tomates', s: 'sandwich', b: 'sarbacane' };
export const RAYONS_CLASSE = { table: 0.48, bureau: 0.6 };

// Zone où Julien fait les cent pas (phases 1 et 2) ; en phase 3, il reste derrière son bureau renversé
export const ESTRADE = { x0: 1.6, x1: 12.4, y0: 1.5, y1: 3.2 };
export const BUREAU_RENVERSE = { x: 7.5, y: 3.3, rayon: 0.8, marche: 0.4 };   // rayon ≈ la largeur dessinée ; marche : il bouge de ± 0,2 case derrière

// Répliques des ÉLÈVES (à personnaliser lors de la passe de finition)
export const ELEVES = {
  dos: ['« VAS-Y ! »', '« Maintenant ! »', '« Il voit rien ! »', '« Dans le dos ! »'],
  touche: ['« OUAIS ! »', '« En plein dedans ! »', '« Trop fort ! »'],
  aie: ['« Oh là là… »', '« Aïe… »', '« Ça pique ! »'],
  interro: ['« Une interro ?! »', '« J\'ai rien révisé ! »'],
  alarme: ['« Le feu !! »', '« On va être trempés ! »'],
  fin: '« BRAVO ! BRAVO ! »',
};

// Répliques de Julien (à PERSONNALISER avec Fabien lors de la passe de finition)
export const REPLIQUES = {
  debut: '« Tiens, un retardataire… et avec une SARBACANE ! Vous êtes en RETARD ! »',
  lancer: ['« Ouvrez vos livres page 42 ! »', '« Silence au fond ! »', '« On ne souffle pas dans les stylos en classe ! »',
    '« Tu copieras 100 fois : je ne manifeste pas ! »', '« Et ça se dit étudiant ! »'],
  dos: ['« Notez bien ! »', '« Je l\'écris au tableau… »', '« Page 42, exercice 3… »'],
  confisqueOk: '« CONFISQUÉ ! »',
  phase2: '« INTERRO SURPRISE ! Sortez une feuille ! »',
  phase3: '« ÇA SUFFIT ! Tout le monde en RETENUE ! »',   // il renverse son bureau, l'alarme incendie sonne
  touche: ['« Ma veste ! »', '« Zéro de conduite ! »', '« Chez le proviseur ! »'],
  descente: ['« Toi, au fond ! Viens par là… »', '« Qu\'est-ce que tu caches, toi ? »', '« Je descends, et ça va barder ! »'],   // il descend de l'estrade
  vaincu: '« Bon… d\'accord… pas d\'interro pour cette fois. »',
};
