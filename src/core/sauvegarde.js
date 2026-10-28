// Sauvegarde dans le navigateur (localStorage) : badges, volumes, records.
// Si le navigateur refuse (navigation privée...), le jeu marche quand même,
// mais la sauvegarde est perdue à la fermeture de l'onglet.
const CLE = 'bracass_sauvegarde_v1';
const VOLUMES_DEFAUT = { musique: 1, sons: 1, voix: 1 };

function lire() {
  let d = null;
  try {
    const texte = localStorage.getItem(CLE);
    d = texte ? JSON.parse(texte) : null;
  } catch (e) { /* ignoré */ }
  if (!d || typeof d.badges !== 'object') d = { badges: {} };
  d.volumes = { ...VOLUMES_DEFAUT, ...(d.volumes || {}) };
  d.records = d.records || {};
  // ancien emplacement du record de Greg
  try {
    const ancien = JSON.parse(localStorage.getItem('bracass_greg_record') || 'null');
    if (ancien && !d.records.greg) d.records.greg = ancien;
  } catch (e) { /* ignoré */ }
  return d;
}

function ecrire(d) {
  try { localStorage.setItem(CLE, JSON.stringify(d)); } catch (e) { /* ignoré */ }
}

let donnees = lire();

export const Sauvegarde = {
  aLeBadge(id) { return !!donnees.badges[id]; },
  donnerBadge(id) { donnees.badges[id] = true; ecrire(donnees); },
  remettreAZero() { donnees = { badges: {}, volumes: donnees.volumes, records: {} }; ecrire(donnees); },

  // volumes de 0 à 1 : 'musique', 'sons', 'voix'
  volume(type) { return donnees.volumes[type] ?? 1; },
  reglerVolume(type, v) { donnees.volumes[type] = Math.round(Math.max(0, Math.min(1, v)) * 10) / 10; ecrire(donnees); },

  // choses déjà faites une fois (ex. 'lionel_entrainement')
  fait(cle) { return !!(donnees.faits || {})[cle]; },
  marquerFait(cle) { donnees.faits = { ...(donnees.faits || {}), [cle]: true }; ecrire(donnees); },

  // DÉFIS DE MAÎTRISE d'un boss (une clé par défi, gardés pour toujours)
  defis(id) { return (donnees.defis || {})[id] || {}; },
  reussirDefi(id, cle) {
    const deja = !!this.defis(id)[cle];
    donnees.defis = { ...(donnees.defis || {}), [id]: { ...this.defis(id), [cle]: true } };
    if (!deja) ecrire(donnees);
    return !deja;   // true seulement la PREMIÈRE fois : l'écran de victoire peut le fêter
  },

  // dernière difficulté choisie pour un boss
  difficulte(id) { return (donnees.difficultes || {})[id] || 'normal'; },
  reglerDifficulte(id, nom) { donnees.difficultes = { ...(donnees.difficultes || {}), [id]: nom }; ecrire(donnees); },

  // record d'un boss : { rang, temps } ; ordreRangs = ['S', 'A', 'B', 'C'] (du meilleur au moins bon)
  record(id) { return donnees.records[id] || null; },
  proposerRecord(id, rang, temps, ordreRangs) {
    const r = donnees.records[id];
    if (!r || ordreRangs.indexOf(rang) < ordreRangs.indexOf(r.rang) || (rang === r.rang && temps < r.temps)) {
      donnees.records[id] = { rang, temps };
      ecrire(donnees);
    }
    return donnees.records[id];
  },
};

// Lignes de DÉFIS DE MAÎTRISE pour un écran de victoire : un défi réussi POUR LA PREMIÈRE
// FOIS est fêté en ★, les déjà réussis restent cochés, les autres sont proposés pour la revanche.
export function lignesDefis(idBoss, liste) {
  const lignes = [];
  for (const d of liste) {
    if (d.test()) {
      const nouveau = Sauvegarde.reussirDefi(idBoss, d.id);
      lignes.push(`${nouveau ? '★ DÉFI RÉUSSI : ' : 'Défi déjà réussi : '}${d.nom}`);
    } else {
      lignes.push(`Défi à débloquer : ${d.nom}`);
    }
  }
  return lignes;
}

// Temps au format 1'16"55
export function formatTemps(x) {
  return `${Math.floor(x / 60)}'${String(Math.floor(x % 60)).padStart(2, '0')}"${String(Math.floor((x % 1) * 100)).padStart(2, '0')}`;
}
