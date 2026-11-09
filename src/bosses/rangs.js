// Les listes de RANGS de chaque boss, pour écrire « NOM (lettre) » à partir d'un record sauvegardé
// (hub, tableau de progression, cartes de difficulté). Format commun : src/core/rangs.js.
import { trouverRang } from '../core/rangs.js';
import { REGLAGES as RG_GREG } from './greg/reglages.js';
import { REGLAGES as RG_KEDRIC } from './kedric/reglages.js';
import { REGLAGES as RG_LIONEL } from './lionel/reglages.js';
import { RANGS as RANGS_REMI } from './remi/reglages.js';
import { RANGS as RANGS_JULIEN, RANGS_CLASSE } from './julien/reglages.js';
import { RANGS as RANGS_BEUFA, RANG_PARFAIT } from '../../data/beufa_quiz.js';
import { REGLAGES as RG_FINALE } from './finale/reglages.js';

// listes de rangs de chaque boss (pour écrire « NOM (lettre) » à partir de ce qui est sauvegardé)
const LISTES_RANGS = { beufa: [RANG_PARFAIT, ...RANGS_BEUFA], kedric: RG_KEDRIC.rangs, julien: RANGS_JULIEN, julien_classe: RANGS_CLASSE,
  greg: RG_GREG.rangs, remi: RANGS_REMI, lionel: RG_LIONEL.rangs, finale: RG_FINALE.rangs };
// { nom, lettre } d'un rang sauvegardé (record.rang = une lettre ou un nom selon le boss)
export function rangRecord(liste, cle) {
  const r = trouverRang(LISTES_RANGS[liste] || [], cle);
  return r ? { nom: r.nom || cle, lettre: r.lettre || r.rang || cle } : { nom: cle, lettre: cle };
}

