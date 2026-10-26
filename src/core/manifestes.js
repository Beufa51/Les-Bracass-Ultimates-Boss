// Registre de TOUS les visuels et sons du jeu : ceux du moteur commun (assets/manifeste.js :
// hub, badges, interface) + ceux de chaque boss (src/bosses/<boss>/manifeste.js).
// Chaque boss apporte aussi ses propres dessins provisoires ("formes") : un dessin n'est
// cherché que dans les formes de SON manifeste, deux boss ne peuvent donc pas se gêner.
import { FORMES } from './dessins.js';

export const MANIFESTE = { images: {}, sons: {}, clips: {} };
// les mêmes, rangés par groupe ('commun' = hub et badges, sinon l'id du boss) : chaque groupe est chargé à part
const GROUPES = {};

export function manifesteDe(groupe) { return GROUPES[groupe] || { images: {}, sons: {} }; }

// m = { images, sons, clips, formes } ; appelé au démarrage (main.js) pour le moteur ('commun') et pour chaque boss (son id)
export function enregistrer(m, groupe = 'commun') {
  const formes = { ...FORMES, ...(m.formes || {}) };
  const g = GROUPES[groupe] = { images: {}, sons: {} };
  for (const [cle, e] of Object.entries(m.images || {})) {
    if (MANIFESTE.images[cle]) console.warn('Visuel en double :', cle);
    // le dessin provisoire est rattaché tout de suite à sa fonction
    const p = e.provisoire;
    MANIFESTE.images[cle] = g.images[cle] = p ? { ...e, provisoire: { ...p, dessin: formes[p.forme] || FORMES.rect } } : e;
  }
  for (const [cle, e] of Object.entries(m.sons || {})) {
    if (MANIFESTE.sons[cle]) console.warn('Son en double :', cle);
    MANIFESTE.sons[cle] = g.sons[cle] = e;
  }
  Object.assign(MANIFESTE.clips, m.clips || {});
}
