// Boss Lionel : match de frisbee façon Windjammers (2 sets gagnants).
// Le menu de test (F1) permet aussi de commencer directement au set décisif.
import { IDENTITE, DIFFICULTES as D } from './reglages.js';
import { LionelMatch } from './LionelMatch.js';
import { MANIFESTE } from './manifeste.js';

export default {
  ...IDENTITE,
  pret: true,
  phases: [
    { id: 'set1', nom: 'Match (depuis le set 1)', scene: 'LionelMatch' },
    { id: 'decisif', nom: 'Match (set décisif, 1-1)', scene: 'LionelMatch' },
    { id: 'entrainement', nom: 'Entraînement puis match', scene: 'LionelMatch' },
  ],
  manifeste: MANIFESTE,   // ses visuels et sons (rien de partagé avec les autres boss)
  scenes: [LionelMatch],
  // réglages développeur (écran caché du hub : 5 appuis sur « Badges ») ; voir src/core/reglagesDev.js
  reglagesDev: ['facile', 'normal', 'champion'].flatMap(n => [
    { groupe: D[n].nom, nom: 'Vitesse de course de Lionel (x)', objet: D[n], champ: 'vitesse', pas: 0.02, min: 0.4, max: 2 },
    { groupe: D[n].nom, nom: 'Temps de réaction de Lionel (s)', objet: D[n], champ: 'reaction', pas: 0.01, min: 0.05, max: 0.8 },
    { groupe: D[n].nom, nom: 'Ses erreurs de placement (pixels)', objet: D[n], champ: 'erreur', pas: 2, min: 0, max: 150 },
    { groupe: D[n].nom, nom: 'Vitesse de ses lancers (x)', objet: D[n], champ: 'disque', pas: 0.02, min: 0.4, max: 2 },
    { groupe: D[n].nom, nom: 'Fenêtre du lancer parfait (s)', objet: D[n], champ: 'fenetreParfait', pas: 0.01, min: 0.03, max: 0.5 },
    { groupe: D[n].nom, nom: 'Jauge du public de Lionel (x)', objet: D[n], champ: 'publicLionel', pas: 0.05, min: 0, max: 2 },
  ]),
};
