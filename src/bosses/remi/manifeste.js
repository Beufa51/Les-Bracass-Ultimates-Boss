// =====================================================================
// MANIFESTE DE RÉMI : ses visuels et sons (et seulement les siens).
// Pour l'instant tout est dessiné par le code (dessins.js) et les sons sont des bips provisoires.
// Fichiers à venir dans assets/sprites/remi/ et assets/audio/remi/ (voir propositions/remi_prompts_images.md).
// =====================================================================
const bip = (frequence, duree) => ({ fichier: null, provisoire: { frequence, duree } });

export const MANIFESTE = {
  images: {},
  sons: {
    // vélo
    remi_sonnette:   bip(1760, 0.18),
    remi_saut:       bip(520, 0.06),
    remi_atterrit:   bip(180, 0.05),
    remi_chute:      bip(90, 0.3),
    remi_crevaison:  bip(140, 0.25),
    remi_glisse:     bip(300, 0.2),
    remi_texto:      bip(1320, 0.07),
    remi_arrivee:    bip(880, 0.35),
    // beer pong
    remi_lance:      bip(700, 0.04),
    remi_rebond:     bip(1100, 0.03),
    remi_plouf:      bip(260, 0.15),
    // porte
    remi_tape:       bip(400, 0.03),
    remi_porte:      bip(120, 0.18),
    remi_porte_fort: bip(70, 0.4),
  },
};
