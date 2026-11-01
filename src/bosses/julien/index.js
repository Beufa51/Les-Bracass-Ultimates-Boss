// Boss Julien : fiche d'identité lue par le hub et le menu de test.
// Niveau 1 : LA MANIF (FPS façon Wolfenstein, rejoindre le lycée). Niveau 2 : la salle de classe, Julien lance des livres (badge).
import { IDENTITE, REGLAGES as R } from './reglages.js';
import { JulienManif } from './JulienManif.js';
import { JulienClasse } from './JulienClasse.js';
import { MANIFESTE } from './manifeste.js';

export default {
  ...IDENTITE,
  pret: true,
  phases: [{ id: 'manif', nom: 'Niveau 1 : la manif', scene: 'JulienManif' }, { id: 'classe', nom: 'Niveau 2 : la classe (Julien)', scene: 'JulienClasse' }],
  manifeste: MANIFESTE,
  scenes: [JulienManif, JulienClasse],
  // réglages développeur (écran caché du hub : 5 appuis sur « Badges ») ; voir src/core/reglagesDev.js
  reglagesDev: [
    { groupe: 'JOUEUR', nom: 'Vie au départ', objet: R.joueur, champ: 'vie', pas: 10, min: 30, max: 300 },
    { groupe: 'JOUEUR', nom: 'Vitesse', objet: R.joueur, champ: 'vitesse', pas: 0.2, min: 1.5, max: 6 },
    { groupe: 'JOUEUR', nom: 'Vitesse de rotation', objet: R.joueur, champ: 'rotation', pas: 0.2, min: 1, max: 5 },
    { groupe: 'PC', nom: 'Souris pour tourner (clic pour l\'activer)', objet: R.joueur, champ: 'sourisActive' },
    { groupe: 'PC', nom: 'Sensibilité de la souris', objet: R.joueur, champ: 'souris', pas: 0.0005, min: 0.001, max: 0.01 },
    { groupe: 'TÉLÉPHONE', nom: 'Joystick à gauche (non = la croix)', objet: R.joueur.tactile, champ: 'joystick' },
    { groupe: 'TÉLÉPHONE', nom: 'Vitesse de rotation (↺ ↻)', objet: R.joueur.tactile, champ: 'rotation', pas: 0.2, min: 1, max: 4 },
    { groupe: 'ŒUFS', nom: 'Œufs au départ', objet: R.oeufs, champ: 'depart', pas: 5, min: 0, max: 99 },
    { groupe: 'ŒUFS', nom: 'Œufs par boîte', objet: R.oeufs, champ: 'boite', pas: 1, min: 1, max: 40 },
    { groupe: 'ŒUFS', nom: 'Aide à la visée clavier (radians)', objet: R.oeufs, champ: 'aide', pas: 0.02, min: 0, max: 0.4 },
    { groupe: 'ŒUFS', nom: 'Aide à la visée au doigt (radians)', objet: R.oeufs, champ: 'aideTactile', pas: 0.02, min: 0, max: 0.5 },
    { groupe: 'POLICIERS', nom: 'Lanceur : œufs pour le faire fuir', objet: R.lanceur, champ: 'vie', pas: 1, min: 1, max: 10 },
    { groupe: 'POLICIERS', nom: 'Lanceur : secondes entre 2 lacrymos', objet: R.lanceur, champ: 'cadence', pas: 0.2, min: 0.8, max: 6 },
    { groupe: 'POLICIERS', nom: 'CRS : œufs pour le faire fuir', objet: R.bouclier, champ: 'vie', pas: 1, min: 1, max: 10 },
    { groupe: 'POLICIERS', nom: 'CRS : temps essoufflé (s)', objet: R.bouclier, champ: 'essouffle', pas: 0.2, min: 0.6, max: 5 },
    { groupe: 'POLICIERS', nom: 'CRS : dégâts de la charge', objet: R.bouclier, champ: 'degats', pas: 2, min: 0, max: 50 },
    { groupe: 'LACRYMOS', nom: 'Dégâts par seconde dans le nuage', objet: R.lacrymo, champ: 'degats', pas: 2, min: 0, max: 40 },
    { groupe: 'LACRYMOS', nom: 'Durée du nuage (s)', objet: R.lacrymo, champ: 'duree', pas: 0.5, min: 1, max: 10 },
    { groupe: 'JULIEN (niveau 2)', nom: 'Vie de Julien (1 œuf = 1)', objet: R.julien, champ: 'vie', pas: 2, min: 4, max: 100 },
    { groupe: 'JULIEN (niveau 2)', nom: 'Vitesse de marche', objet: R.julien, champ: 'vitesse', pas: 0.1, min: 0.4, max: 3 },
    { groupe: 'JULIEN (niveau 2)', nom: 'Dégâts d\'un livre', objet: R.julien.livre, champ: 'degats', pas: 2, min: 0, max: 50 },
    { groupe: 'JULIEN (niveau 2)', nom: 'Vitesse des livres', objet: R.julien.livre, champ: 'vitesse', pas: 0.5, min: 2, max: 12 },
    { groupe: 'JULIEN (niveau 2)', nom: 'Dégâts du dictionnaire', objet: R.julien.dico, champ: 'degats', pas: 2, min: 0, max: 60 },
    { groupe: 'JULIEN (niveau 2)', nom: 'Œufs en entrant en classe', objet: R.classe, champ: 'oeufs', pas: 5, min: 0, max: 99 },
  ],
};
