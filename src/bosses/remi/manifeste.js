// =====================================================================
// MANIFESTE DE RÉMI : ses visuels et sons (et seulement les siens).
// Pour l'instant tout est dessiné par le code (dessins.js) et les sons sont des bips provisoires.
// Fichiers à venir dans assets/sprites/remi/ et assets/audio/remi/ (voir propositions/remi_prompts_images.md).
// =====================================================================
const bip = (frequence, duree) => ({ fichier: null, provisoire: { frequence, duree } });

export const MANIFESTE = {
  images: {
    // outils/remi/preparer_images.py : planche de assets_inbox/remi/ détourée et découpée
    // vélo de profil : 6 poses de pédalage, saut, chute (posées en bas, centrées)
    remi_velo: { fichier: 'sprites/remi/remi_velo.png', largeur: 266, hauteur: 296, images: 8, vitesse: 10 },
    // Rémi de face au beer pong : attend, lance, boit, nargue
    remi_pong: { fichier: 'sprites/remi/remi_pong.png', largeur: 403, hauteur: 577, images: 4, vitesse: 1 },
    // la porte, de profil : Rémi garde / coup / impact, toi garde / coup / impact (alignées sur le pied arrière)
    remi_porte: { fichier: 'sprites/remi/remi_porte.png', largeur: 345, hauteur: 562, images: 6, vitesse: 1 },
    // les bourrés du vélo : debout (titube), sursaute (sonnette), allongé (bouteilles), traverse de face
    remi_bourres: { fichier: 'sprites/remi/remi_bourres.png', largeur: 495, hauteur: 560, images: 4, vitesse: 1 },
    // le fond de rue de nuit (répétable), derrière le vélo
    remi_rue: { fichier: 'sprites/remi/remi_rue.jpg', largeur: 1702, hauteur: 575, images: 1, vitesse: 1 },
    remi_presentation: { fichier: 'sprites/remi/remi_presentation.png', largeur: 832, hauteur: 1202, images: 1, vitesse: 1 },
  },
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
