// Plan du MINI-NIVEAU « LE LYCÉE » (entre la manif et la salle de classe ; audit A : propositions/julien_audit_classe.md).
// On arrive de la cour dans le HALL (en bas), on monte le COULOIR DES CASIERS (à gauche) jusqu'à la porte de la
// SALLE 12, fermée : il faut d'abord récupérer son CARNET DE CORRESPONDANCE sur le comptoir de la CANTINE (en haut à
// droite ; 2 chemins pour y aller). Le nord est en haut. Plan fait (et vérifié atteignable) par un petit script
// Python ; on peut le retoucher à la main.
//
// Murs (chiffres) : 1 casiers, 2 couloir (panneau d'affichage), 3 cantine (carrelage), 4 PORTE DE LA SALLE 12, 5 mur nu.
// Secret : 'X' = casier ouvert (aspect casiers) : on pousse dedans → placard secret (sandwich, K-Way, canette).
// Sol : '.' vide, 'J' départ (regarde vers le haut).
// Ennemis : 'V' surveillant (le pion : il siffle puis te fonce dessus ; pas de bouclier),
//           'Q' dame de cantine (lance de la purée : flaque où tu avances au ralenti).
// 'F' FAYOT : on ne peut pas le blesser ; quand il te voit il crie « M'SIEUR ! IL EST LÀ ! » et alerte tout le monde.
// Objets : 'x' extincteur (un œuf dessus → nuage de mousse : les ennemis autour glissent et sont aveuglés),
//          'n' canette (petit soin), 'k' CARNET (la clé), 'd' table de cantine (abri), 'q' comptoir,
//          's' sandwich, 'K' K-Way. (Pas d'œufs ni de tomates : les armes de la manif sont interdites au lycée.)
export const PLAN_LYCEE = [
  '555555555555555555555555',
  '511411533333333333333335',
  '51...153.......qqqq...35',
  '51...111...Q....k.....35',
  '51.V..............d...35',
  '51........d.d.d.......35',
  '51...111...........Q..35',
  '51..F153..d.d.d.......35',
  '51...153........x...V.35',
  '51.x.153.s............35',
  '51...1.K33333...33333335',
  '51...Xs.55552...25555555',
  '51F..1.n55552.F.25555555',
  '51...15555552...25555555',
  '51...15555552n..25555555',
  '51...12222222...25555555',
  '51s.............25555555',
  '52......V.......25555555',
  '52..............25555555',
  '52.n.......n....25555555',
  '52.......J......25555555',
  '522222222222222225555555',
];

export const OBJETS_LYCEE = {
  V: 'surveillant', Q: 'cantiniere', F: 'fayot', x: 'extincteur', n: 'canette', k: 'carnet', d: 'table', q: 'comptoir',
  s: 'sandwich', K: 'kway',
};
export const SECRETS_LYCEE = { X: '1' };
export const PORTE_SALLE_12 = { x: 3, y: 1 };

// Messages à la 1re entrée dans une zone (x0, y0, x1, y1 : cases, bornes comprises)
export const ZONES_LYCEE = [
  { x0: 2, y0: 16, x1: 15, y1: 20, texte: 'Le hall du lycée. Attention au SURVEILLANT : il siffle, puis il te fonce dessus (pas de côté !).' },
  { x0: 2, y0: 2, x1: 4, y1: 15, texte: 'Le couloir des casiers. Les FAYOTS vont te dénoncer : contourne-les vite !' },
  { x0: 8, y0: 2, x1: 21, y1: 9, texte: 'La cantine ! Ton CARNET DE CORRESPONDANCE est sur le comptoir. Gare à la purée !' },
  { x0: 2, y0: 2, x1: 4, y1: 3, texte: 'La salle 12, enfin. On entend Julien derrière la porte…' },
];

// Répliques (à personnaliser lors de la passe de finition)
export const REPLIQUES_LYCEE = {
  sifflet: '« TWEEET ! Hé toi ! Tu vas où comme ça ?! »',
  fayot: ['« M\'SIEUR ! IL EST LÀ ! »', '« Je vais le dire au CPE ! »', '« Il a des ŒUFS, m\'sieur ! »'],
  fayotTouche: '« Hé ! Je vais le dire ! »',
  puree: '« Reprends donc de la purée ! »',
  porteFermee: 'Fermée à clé ! Sans ton CARNET DE CORRESPONDANCE, pas question d\'entrer (il est à la cantine).',
  carnet: 'Ton CARNET DE CORRESPONDANCE ! Maintenant, la salle 12 (en haut du couloir des casiers).',
  porte: '« Entrez !… Vous êtes en RETARD. »',
};
