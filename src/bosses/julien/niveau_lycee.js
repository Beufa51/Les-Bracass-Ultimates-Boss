// Plan du MINI-NIVEAU « LE LYCÉE » (entre la manif et la salle de classe ; audit A : propositions/julien_audit_classe.md).
// On arrive de la cour dans le HALL (en bas), on traverse la CANTINE (en haut) jusqu'au CDI (à droite) où est ton
// CARNET DE CORRESPONDANCE (la clé), puis on revient par le COULOIR DES CASIERS (à gauche) jusqu'à la porte de la
// SALLE 12, en haut. Le nord est en haut. Plan généré et vérifié par `outils/julien/plan_lycee.py` (à relancer et
// recopier après un changement).
//
// Murs (chiffres) : 1 casiers, 2 couloir (panneau d'affichage), 3 cantine (carrelage), 4 PORTE DE LA SALLE 12,
//                   5 mur peint (l'extérieur), 6 mur du CDI (étagères de livres).
// Secret : 'X' = casier ouvert (aspect casiers) : on pousse dedans → placard secret (sandwich, K-Way, canette).
// Sol : '.' vide, 'J' départ (regarde vers le haut).
// Ennemis : 'V' surveillant (le pion : il siffle puis te fonce dessus ; pas de bouclier),
//           'Q' dame de cantine (lance de la purée : flaque où tu avances au ralenti).
// 'F' FAYOT : on ne peut pas le blesser ; quand il te voit il crie « M'SIEUR ! IL EST LÀ ! » et alerte tout le monde.
// Objets : 'x' extincteur (un œuf dessus → nuage de mousse : les ennemis autour glissent et sont aveuglés),
//          'n' canette (petit soin), 'k' CARNET (la clé), 'd' table de cantine (abri), 'q' comptoir,
//          CDI : 'E' étagère haute, 'B' étagère basse, 'L' table de lecture, 'O' ordinateur (tous des abris),
//          's' sandwich, 'K' K-Way. (Pas d'œufs ni de tomates : les armes de la manif sont interdites au lycée.)
export const PLAN_LYCEE = [
  '55555555555555555555555555555555',
  '51141153333333333333333666666665',
  '51...153.......qqqq...36.....x65',
  '51...111...Q..........36..F...65',
  '51.V..............d...36.E.E..65',
  '51........d.d.d...............65',
  '51...111...........Q..........65',
  '51..F153..d.d.d.......36.B..O.65',
  '51...153........x...V.36...V..65',
  '51.x.153.s............36.....n65',
  '51...1.K33333...33333336E.E.E.65',
  '51...Xs.55552...25555556......65',
  '51F..1.n55552.F.25555556x....F65',
  '51...15555552...25555556.L.L..65',
  '51...15555552n..25555556.V....65',
  '51...12222222...25555556......65',
  '51sV............25555556.O..B.65',
  '52..............25555556s.....65',
  '52..............25555556....Q.65',
  '52.n.......n....25555556...k..65',
  '52.......J......2555555666666665',
  '52222222222222222555555555555555',
];

export const OBJETS_LYCEE = {
  V: 'surveillant', Q: 'cantiniere', F: 'fayot', x: 'extincteur', n: 'canette', k: 'carnet', d: 'table', q: 'comptoir',
  s: 'sandwich', K: 'kway', E: 'etagere', B: 'etagere_basse', L: 'table_lecture', O: 'ordinateur',
};
export const SECRETS_LYCEE = { X: '1' };
export const PORTE_SALLE_12 = { x: 3, y: 1 };
// ANARCHISTE : renforts (type, case x, case y) — couloir des casiers, 2e couloir, cantine
export const RENFORTS_LYCEE = [['surveillant', 3, 6], ['cantiniere', 14, 13], ['surveillant', 20, 4]];

// Messages à la 1re entrée dans une zone (x0, y0, x1, y1 : cases, bornes comprises)
export const ZONES_LYCEE = [
  { x0: 2, y0: 16, x1: 15, y1: 20, texte: 'Le hall du lycée. Attention au SURVEILLANT : il siffle, puis il te fonce dessus (pas de côté !).' },
  { x0: 2, y0: 2, x1: 4, y1: 15, texte: 'Le couloir des casiers. Les FAYOTS vont te dénoncer : contourne-les vite !' },
  { x0: 8, y0: 2, x1: 21, y1: 9, texte: 'La cantine ! Gare à la purée. Ton CARNET est au CDI, la porte à droite.' },
  { x0: 24, y0: 2, x1: 29, y1: 19, texte: 'Le CDI : chut ! Ton CARNET DE CORRESPONDANCE est tout au fond. Les étagères t\'abritent.' },
];

// Répliques (à personnaliser lors de la passe de finition)
export const REPLIQUES_LYCEE = {
  sifflet: '« TWEEET ! Hé toi ! Tu vas où comme ça ?! »',
  fayot: ['« M\'SIEUR ! IL EST LÀ ! »', '« Je vais le dire au CPE ! »', '« Il a une SARBACANE, m\'sieur ! »'],
  fayotTouche: '« Hé ! Je vais le dire ! »',
  puree: '« Reprends donc de la purée ! »',
  porteFermee: 'Fermée à clé ! Sans ton CARNET DE CORRESPONDANCE, pas question d\'entrer (il est au CDI).',
  carnet: 'Ton CARNET DE CORRESPONDANCE ! Vite, la salle 12 : en haut du couloir des casiers, tout à gauche.',
  porte: '« Entrez !… Vous êtes en RETARD. »',
  fuite: ['Au bureau du CPE !', 'Il file se changer !', 'Un de moins !', 'Il retourne en salle des profs !'],
};
