// Manifeste de Julien : ses visuels et sons (rien de partagé avec les autres boss).
// Niveau 1 (la manif) : les murs, policiers et la tête du héros sont dessinés par le code (textures.js, visage.js).
// Sons : bips provisoires pour l'instant (fichier: null) ; plus tard des fichiers dans assets/audio/julien/.
const bip = (frequence, duree) => ({ fichier: null, provisoire: { frequence, duree } });
export const MANIFESTE = {
  images: {},
  sons: {
    julien_lancer: bip(520, 0.05),    // tu lances un œuf
    julien_splat: bip(180, 0.07),     // un œuf s'écrase
    julien_plonk: bip(900, 0.04),     // l'œuf rebondit sur le bouclier
    julien_fuite: bip(760, 0.18),     // un policier s'enfuit
    julien_aie: bip(140, 0.15),       // tu es touché
    julien_tir: bip(300, 0.06),       // un policier tire une lacrymo
    julien_gaz: bip(90, 0.3),         // la lacrymo éclate
    julien_cri: bip(220, 0.25),       // « DISPERSEZ-VOUS ! »
    julien_ramasse: bip(880, 0.12),   // objet ramassé
  },
};
