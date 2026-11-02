// Manifeste de Julien : ses visuels et sons (rien de partagé avec les autres boss).
// Images : assets/sprites/julien/ (textures.js) ; bruitages : outils/julien/generer_sons.py → assets/audio/julien/.
// Sons : fichiers WAV de assets/audio/julien/ (bip provisoire si le fichier manque).
const son = (nom) => ({ fichier: `audio/julien/julien_${nom}.wav`, provisoire: { frequence: 440, duree: 0.08 } });
export const MANIFESTE = {
  images: {
    // écran de PRÉSENTATION (avant la manif) : Julien en haute définition, détouré (tiré de assets_inbox/julien/julien_presentation.jpg, version non caricaturale)
    julien_presentation: { fichier: 'sprites/julien/julien_presentation.png', largeur: 341, hauteur: 999, images: 1, vitesse: 1 },
  },
  sons: {
    // MUSIQUE DE FOND (src/core/musique.js, en boucle) : DOOM « At Doom's Gate » (E1M1), déposée par Fabien, mono 64 kb/s,
    // silences du début (1,1 s) et de la fin (5,4 s) coupés pour qu'elle reparte tout de suite
    julien_musique: { fichier: 'audio/julien/julien_musique.mp3', musique: true, volume: 0.4 },
    // LE LYCÉE : thème de Duke Nukem 3D (déposé par Fabien), mono 64 kb/s, silence de la fin coupé
    julien_lycee_musique: { fichier: 'audio/julien/julien_lycee_musique.mp3', musique: true, volume: 0.4 },
    // LE BOSS (la classe) : Streets of Rage 2, thème du niveau 1 (déposé par Fabien ; remplace Sephiroth), mono 64 kb/s, fin coupée
    julien_boss_musique: { fichier: 'audio/julien/julien_boss_musique.mp3', musique: true, volume: 0.4 },
    // AMBIANCE de manif en boucle (foule, tambour), jouée en même temps que la musique
    julien_foule: { fichier: 'audio/julien/julien_foule.mp3', musique: true, volume: 0.3 },
    // BRUITAGES fabriqués par outils/julien/generer_sons.py
    julien_lancer: son('lancer'),     // tu lances un œuf
    julien_splat: son('splat'),       // un œuf s'écrase
    julien_plonk: son('plonk'),       // l'œuf rebondit sur le bouclier
    julien_fuite: son('fuite'),       // un policier s'enfuit (petits pas pressés)
    julien_aie: son('aie'),           // tu es touché
    julien_toux: son('toux'),         // tu tousses dans le gaz
    julien_tir: son('tir'),           // un policier tire une lacrymo
    julien_gaz: son('gaz'),           // la lacrymo éclate
    julien_cri: son('cri'),           // le CRS crie avant de charger
    julien_ramasse: son('ramasse'),   // objet ramassé
    julien_portail: son('portail'),   // le portail du lycée s'ouvre
    julien_secret: son('secret'),     // un passage secret s'ouvre
    julien_pancarte: son('pancarte'), // coup de pancarte
    julien_halte: son('halte'),       // un policier te repère
    julien_farine: son('farine'),     // sac de farine qui éclate
    julien_fourgon: son('fourgon'),   // le fourgon de CRS arrive
    julien_rideau: son('rideau'),     // rideau de fer qui se lève (embuscade)
    julien_eau: son('eau'),           // pistolet à eau
    julien_fumigene: son('fumigene'), // un fumigène s'allume
    julien_craie: son('craie'),       // niveau 2 : la craie crisse (Julien écrit au tableau, craies en rafale)
    julien_papier: son('papier'),     // niveau 2 : « Sortez une feuille ! » (mur de copies)
    julien_alarme: son('alarme'),     // niveau 2 : alarme incendie (phase 3)
  },
};
