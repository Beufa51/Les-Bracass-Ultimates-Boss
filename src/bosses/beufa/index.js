// Boss Beufa : infiltration de nuit dans sa base militaire (vue du dessus, façon Metal Gear),
// puis (à venir) le QUIZ. Une pièce à l'écran à la fois : gardes à cônes de vision,
// conteneurs qui coupent la vue, projecteurs au bord dont le halo rejoint le milieu.
// pret: false => la porte du hub affiche « Bientôt » (à remettre si on ne veut pas que les joueurs entrent).
import { IDENTITE, REGLAGES as R } from './reglages.js';
import { BeufaInfiltration } from './BeufaInfiltration.js';
import { MANIFESTE } from './manifeste.js';

export default {
  ...IDENTITE,
  pret: true,
  phases: [{ id: 'infiltration', nom: 'Infiltration de la base (squelette)', scene: 'BeufaInfiltration' }],
  manifeste: MANIFESTE,   // ses visuels et sons (rien de partagé avec les autres boss)
  scenes: [BeufaInfiltration],
  // réglages développeur (écran caché du hub : 5 appuis sur « Badges ») ; voir src/core/reglagesDev.js
  reglagesDev: [
    { groupe: 'INFILTRATION', nom: 'Vitesse de marche (px/s)', objet: R.joueur, champ: 'vitesse', pas: 10, min: 80, max: 300 },
    { groupe: 'INFILTRATION', nom: 'Vitesse de sprint (px/s)', objet: R.joueur, champ: 'sprint', pas: 10, min: 100, max: 400 },
    { groupe: 'INFILTRATION', nom: 'Rayon d\'audition du sprint (px)', objet: R.joueur, champ: 'bruit', pas: 10, min: 40, max: 400 },
    { groupe: 'GARDES', nom: 'Portée de vision (px)', objet: R.garde, champ: 'portee', pas: 10, min: 100, max: 350 },
    { groupe: 'GARDES', nom: 'Demi-angle du cône (°)', objet: R.garde, champ: 'angle', pas: 2, min: 10, max: 60 },
    { groupe: 'GARDES', nom: 'Temps de repérage avant le « ! » (s)', objet: R.garde, champ: 'reperage', pas: 0.05, min: 0.2, max: 2 },
    { groupe: 'GARDES', nom: 'Vitesse de poursuite (px/s)', objet: R.garde, champ: 'vitessePoursuite', pas: 10, min: 100, max: 400 },
    { groupe: 'GARDES', nom: 'Pause au bout de la ronde (s)', objet: R.garde, champ: 'pause', pas: 0.2, min: 0, max: 5 },
    { groupe: 'PROJECTEURS', nom: 'Rayon du halo au sol (px)', objet: R.projecteur, champ: 'rayon', pas: 5, min: 30, max: 95 },
    { groupe: 'PROJECTEURS', nom: 'Période du va-et-vient (s)', objet: R.projecteur, champ: 'periode', pas: 0.5, min: 3, max: 16 },
    { groupe: 'PROJECTEURS', nom: 'Repérage dans le halo (s)', objet: R.projecteur, champ: 'reperage', pas: 0.05, min: 0.3, max: 3 },
  ],
};
