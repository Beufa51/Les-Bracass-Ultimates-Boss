// Manifeste du BOSS FINAL : ses images (outils/finale/preparer_images.py) et ses sons provisoires.
const partie = (id) => ({ fichier: `sprites/finale/mecha_${id}.png`, largeur: 406, hauteur: 594, images: 1, vitesse: 1 });
export const MANIFESTE = {
  images: {
    finale_mecha: { fichier: 'sprites/finale/mecha.png', largeur: 406, hauteur: 594, images: 1, vitesse: 1 },
    finale_mecha_kedric: partie('kedric'), finale_mecha_remi: partie('remi'), finale_mecha_lionel: partie('lionel'),
    finale_mecha_greg: partie('greg'), finale_mecha_julien: partie('julien'), finale_mecha_beufa: partie('beufa'),
    finale_vaisseau: { fichier: 'sprites/finale/vaisseau.png', largeur: 200, hauteur: 116, images: 1, vitesse: 1 },
    finale_fond: { fichier: 'sprites/finale/fond.jpg', largeur: 2466, hauteur: 540, images: 1, vitesse: 1 },
  },
  sons: {
    finale_tir:       { fichier: null, provisoire: { frequence: 1400, duree: 0.03 } },
    finale_impact:    { fichier: null, provisoire: { frequence: 300, duree: 0.04 } },
    finale_touche:    { fichier: null, provisoire: { frequence: 140, duree: 0.3 } },
    finale_alerte:    { fichier: null, provisoire: { frequence: 880, duree: 0.12 } },
    finale_bombe:     { fichier: null, provisoire: { frequence: 90, duree: 0.6 } },
    finale_explosion: { fichier: null, provisoire: { frequence: 70, duree: 0.8 } },
  },
};
