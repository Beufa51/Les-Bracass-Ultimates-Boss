// Registre de TOUS les visuels et sons du jeu : ceux du moteur commun (assets/manifeste.js :
// hub, badges, interface) + ceux de chaque boss (src/bosses/<boss>/manifeste.js).
// Chaque boss apporte aussi ses propres dessins provisoires ("formes") : un dessin n'est
// cherché que dans les formes de SON manifeste, deux boss ne peuvent donc pas se gêner.
import { FORMES } from './dessins.js';

export const MANIFESTE = { images: {}, sons: {}, clips: {} };

// m = { images, sons, clips, formes } ; appelé au démarrage (main.js) pour le moteur et pour chaque boss
export function enregistrer(m) {
  const formes = { ...FORMES, ...(m.formes || {}) };
  for (const [cle, e] of Object.entries(m.images || {})) {
    if (MANIFESTE.images[cle]) console.warn('Visuel en double :', cle);
    // le dessin provisoire est rattaché tout de suite à sa fonction
    const p = e.provisoire;
    MANIFESTE.images[cle] = p ? { ...e, provisoire: { ...p, dessin: formes[p.forme] || FORMES.rect } } : e;
  }
  for (const [cle, e] of Object.entries(m.sons || {})) {
    if (MANIFESTE.sons[cle]) console.warn('Son en double :', cle);
    MANIFESTE.sons[cle] = e;
  }
  Object.assign(MANIFESTE.clips, m.clips || {});
}
