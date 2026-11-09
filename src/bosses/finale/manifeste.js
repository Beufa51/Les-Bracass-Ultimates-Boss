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
  // bruitages synthétisés : python3 outils/finale/generer_sons.py assets/audio/finale
  sons: {
    finale_tir:       { fichier: 'audio/finale/finale_tir.wav' },
    finale_impact:    { fichier: 'audio/finale/finale_impact.wav' },
    finale_touche:    { fichier: 'audio/finale/finale_touche.wav' },
    finale_alerte:    { fichier: 'audio/finale/finale_alerte.wav' },
    finale_bombe:     { fichier: 'audio/finale/finale_bombe.wav' },
    finale_explosion: { fichier: 'audio/finale/finale_explosion.wav' },
    finale_partie:    { fichier: 'audio/finale/finale_partie.wav' },
    finale_dempsey:   { fichier: 'audio/finale/finale_dempsey.wav' },
  },
};
