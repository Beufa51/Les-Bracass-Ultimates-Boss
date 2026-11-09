// DÉFIS DE MAÎTRISE des 6 boss (3 chacun) : les NOMS sont ici, les tests dans la scène de chaque boss
// (lignesDefis / defisNouveaux de core/sauvegarde.js, avec { id, test }). Le tableau PROGRÈS du hub lit cette liste.
import { REGLAGES as R_LIONEL } from './lionel/reglages.js';
import { REGLAGES as R_FINALE } from './finale/reglages.js';

export const DEFIS = {
  beufa: [
    { id: 'fantome', nom: 'Infiltration sans AUCUNE alerte' },
    { id: 'sansFaute', nom: 'Quiz sans erreur (ni continue)' },
    { id: 'eclair', nom: '5 réponses ÉCLAIR au quiz' },
  ],
  kedric: [
    { id: 'troisTD', nom: '3 TOUCHDOWNS sur 3' },
    { id: 'public80', nom: 'Battle gagné avec 80 % du public pour toi' },
    { id: 'sansPiege', nom: 'Battle sans toucher une flèche DORÉE' },
  ],
  julien: [
    { id: 'notes', nom: 'Classe : toutes les rafales à 20/20' },
    { id: 'dos', nom: 'Classe : 60 % de coups dans le dos' },
    { id: 'vie', nom: 'Battre Julien avec 75 % de vie' },
  ],
  greg: [
    { id: 'ko', nom: 'Gagner par K.O. (pas aux points)' },
    { id: 'jamaisTapis', nom: 'Ne JAMAIS aller au tapis' },
    { id: 'cuirasse', nom: 'Moins de 30 dégâts reçus' },
  ],
  remi: [
    { id: 'zeroChute', nom: 'Vélo sans AUCUNE chute' },
    { id: 'mur', nom: '3 arrêts au babyfoot' },
    { id: 'invisible', nom: 'La porte sans te faire attraper' },
  ],
  lionel: [
    { id: 'sec', nom: 'Gagner sans perdre un seul set' },
    { id: 'troisSupers', nom: 'Marquer 3 SUPER LANCERS' },
    { id: 'hermetique', nom: `Encaisser moins de ${R_LIONEL.defiHermetique} points` },
  ],
  finale: [
    { id: 'intouchable', nom: 'Détruire le mécha sans être touché' },
    { id: 'sansBombe', nom: 'Sans utiliser de bombe' },
    { id: 'rapide', nom: `En moins de ${Math.round(R_FINALE.defiTemps / 60)} minutes` },
  ],
};

export function nomDefi(idBoss, id) { return ((DEFIS[idBoss] || []).find(d => d.id === id) || {}).nom || id; }
