// Sauvegarde des badges dans le navigateur (localStorage).
// Si le navigateur refuse (navigation privée...), le jeu marche quand même,
// mais la sauvegarde est perdue à la fermeture de l'onglet.
const CLE = 'bracass_sauvegarde_v1';

function lire() {
  try {
    const texte = localStorage.getItem(CLE);
    const d = texte ? JSON.parse(texte) : null;
    if (d && typeof d.badges === 'object') return d;
  } catch (e) { /* ignoré */ }
  return { badges: {} };
}

function ecrire(d) {
  try { localStorage.setItem(CLE, JSON.stringify(d)); } catch (e) { /* ignoré */ }
}

let donnees = lire();

export const Sauvegarde = {
  aLeBadge(id) { return !!donnees.badges[id]; },
  donnerBadge(id) { donnees.badges[id] = true; ecrire(donnees); },
  remettreAZero() { donnees = { badges: {} }; ecrire(donnees); },
};
