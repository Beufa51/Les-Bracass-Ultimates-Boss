// Mini-tutoriel du match de Lionel (environ 20 secondes) : Lionel lance lentement,
// tu apprends à attraper, lancer droit, lancer en biais, attraper un lob et faire ton super.
// Joué automatiquement la première fois (après le choix de la difficulté), ou depuis le menu F1.
//  depart : qui a le frisbee au début de l'étape ('l' = Lionel lance, 'j' = c'est toi)
//  lionel : le lancer que fait Lionel ; but : ce qu'il faut réussir
//   'attrape' | 'attrapeLob' | 'lance' (droit ou biais) | 'biais' | 'super' | 'lob' | 'lobProfond'
export const ETAPES = [
  { depart: 'l', lionel: 'droit', but: 'attrape',
    texte: (b) => 'Lionel lance. Cours sur le CERCLE VERT pour attraper !' },
  { depart: 'j', but: 'lance',
    texte: (b) => `Bravo ! ${b.lancer} pour lancer vers le mur de Lionel.` },
  { depart: 'l', lionel: 'biais', but: 'attrape',
    texte: (b) => 'Celui-là rebondit sur le mur ! Suis les POINTS BLANCS.' },
  { depart: 'j', but: 'biais',
    texte: (b) => `Maintiens ▲ ou ▼ et ${b.lancer} : lancer en biais !` },
  { depart: 'l', lionel: 'lob', but: 'attrapeLob',
    texte: (b) => 'Un LOB ! Va dans le cercle où il va tomber.' },
  { depart: 'j', but: 'super', superPret: true,
    texte: (b) => `SUPER PRÊT ! ${b.lancer}, puis guide-le avec ▲ ▼ !` },
  { depart: 'j', but: 'lobProfond',
    texte: (b) => `Maintiens ▶ et ${b.lob} : lob profond (3 points) !` },
];

export const VITESSE_ENTRAINEMENT = 0.75;   // les lancers de Lionel sont plus lents pendant l'entraînement
