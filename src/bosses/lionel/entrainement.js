// Mini-tutoriel du match de Lionel (environ 30 secondes) : Lionel lance lentement, tu apprends à attraper,
// lancer, faire un CONTRE PARFAIT, plonger, lancer en biais, attraper un lob, guider ton super et faire un lob profond.
// Joué automatiquement la première fois (après le choix de la difficulté), ou depuis le menu F1.
//  depart : qui a le frisbee au début de l'étape ('l' = Lionel lance, 'j' = c'est toi)
//  lionel : le lancer que fait Lionel ; but : ce qu'il faut réussir
//   'attrape' | 'attrapeLob' | 'parfait' | 'lance' (droit ou biais) | 'biais' | 'superGuide' | 'lob' | 'lobProfond'
//  joueurLoin : tu commences en haut du terrain (Lionel lance en bas : il faut courir, ou plonger)
export const ETAPES = [
  { depart: 'l', lionel: 'droit', but: 'attrape',
    texte: (b) => 'Lionel lance. Cours sur le CERCLE VERT pour attraper !' },
  { depart: 'j', but: 'lance',
    texte: (b) => `Bravo ! ${b.lancer} pour lancer vers le mur de Lionel.` },
  { depart: 'l', lionel: 'droit', but: 'parfait',
    texte: (b) => `Quand le cercle devient BLEU, appuie sur ${b.lancer} : CONTRE PARFAIT !` },
  { depart: 'l', lionel: 'biais', but: 'attrape',
    texte: (b) => 'Celui-là rebondit sur le mur ! Suis les POINTS BLANCS.' },
  { depart: 'l', lionel: 'biais', but: 'attrape', joueurLoin: true,
    texte: (b) => `Celui-là est loin : cours vers lui et ${b.lancer} pour PLONGER !` },
  { depart: 'j', but: 'biais',
    texte: (b) => `Maintiens ▲ ou ▼ et ${b.lancer} : lancer en biais !` },
  { depart: 'l', lionel: 'lob', but: 'attrapeLob',
    texte: (b) => 'Un LOB ! Va dans le cercle où il va tomber.' },
  { depart: 'j', but: 'superGuide', superPret: true,
    texte: (b) => `SUPER PRÊT ! ${b.lancer}, puis GUIDE-LE avec ▲ ▼ pendant qu'il vole !` },
  { depart: 'j', but: 'lobProfond',
    texte: (b) => `Maintiens ▶ et ${b.lob} : lob profond (3 points) !` },
];

export const VITESSE_ENTRAINEMENT = 0.75;   // les lancers de Lionel sont plus lents pendant l'entraînement
