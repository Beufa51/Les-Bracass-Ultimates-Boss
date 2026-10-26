// Difficulté PERSO de Lionel : tu règles toi-même chaque point (vitesse, réflexes, agressivité...).
// Les réglages sont retenus dans ce navigateur (clé propre à Lionel, rien de partagé avec les autres boss).
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { texte } from '../../core/ui.js';
import { jouerSon } from '../../core/ressources.js';
import { estTactile } from '../../core/tactile.js';

const CLE = 'bracass_lionel_perso';
const entre = (a, b, t) => a + (b - a) * t;

// Chaque réglage : soit un niveau de 0 à 10 (5 = comme en NORMAL), soit un choix dans une liste.
// appliquer(D, t) remplit les réglages de difficulté (t = niveau / 10, ou numéro du choix).
export const REGLAGES_PERSO = [
  { cle: 'vitesse', nom: 'Vitesse de Lionel', gauche: 'tortue', droite: 'fusée', defaut: 5,
    appliquer: (D, t) => { D.vitesse = entre(0.7, 1.3, t); } },
  { cle: 'reflexes', nom: 'Réflexes de Lionel', gauche: 'endormi', droite: 'ninja', defaut: 5,
    appliquer: (D, t) => { D.reaction = entre(0.4, 0.1, t); D.erreur = entre(80, 12, t); } },
  { cle: 'puissance', nom: 'Puissance de ses lancers', gauche: 'mollo', droite: 'boulet', defaut: 5,
    appliquer: (D, t) => { D.disque = entre(0.65, 1.15, t); } },
  { cle: 'agressivite', nom: 'Agressivité (supers, rebonds)', gauche: 'gentil', droite: 'sans pitié', defaut: 5,
    appliquer: (D, t) => {
      D.superHasard = entre(0, 0.14, t); D.publicLionel = entre(0.4, 1.3, t);
      D.biaisApres = Math.round(entre(3, 0, t)); D.superSurLob = t > 0.8; D.lentLob = entre(2.6, 1.3, t);
      D.choix = { droit: entre(72, 28, t), biais: entre(18, 40, t), lob: 14 };
      if (t > 0.8) D.choix.courbe = (t - 0.8) * 110;   // tout en haut : il ose les courbes
    } },
  { cle: 'attrape', nom: 'Ta zone pour attraper', gauche: 'minuscule', droite: 'géante', defaut: 5,
    appliquer: (D, t) => {
      D.attrape = { x: entre(30, 60, t), haut: entre(50, 94, t), bas: entre(24, 40, t) };
      D.fenetreParfait = entre(0.08, 0.22, t); D.ralenti = entre(1, 0.64, t);
    } },
  { cle: 'aides', nom: 'Aide (cercle où arrive le frisbee)', choix: ['aucune', 'après le filet', 'dès le lancer'], defaut: 2,
    appliquer: (D, k) => { D.aides = [false, 'filet', 'tot'][k]; } },
  { cle: 'surprises', nom: 'Surprises (mouette, château, ballon)', choix: ['aucune', 'quelques-unes', 'normal', 'plein !'], defaut: 2,
    appliquer: (D, k) => { D.surprises = [[1e9, 1e9], [22, 32], [12, 20], [5, 9]][k]; } },
];

function lire() {
  try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) { return {}; }
}
function ecrire(v) {
  try { localStorage.setItem(CLE, JSON.stringify(v)); } catch (e) { /* tant pis : pas retenu */ }
}

// Fabrique les réglages de difficulté à partir des niveaux choisis
export function difficultePerso(base, niveaux) {
  const D = { ...base };
  for (const r of REGLAGES_PERSO) {
    const n = niveaux[r.cle] ?? r.defaut;
    r.appliquer(D, r.choix ? n : n / 10);
  }
  return D;
}

// Écran des curseurs ; ensuite(reglagesDeDifficulte) une fois validé
export function reglerPerso(scene, base, ensuite) {
  const niveaux = { ...Object.fromEntries(REGLAGES_PERSO.map(r => [r.cle, r.defaut])), ...lire() };
  let ligne = 0;
  // joystick : toutes les directions (▲ ▼ choisir la ligne, ◀ ▶ régler)
  if (scene.etiquettes) scene.etiquettes({ haut: '▲', bas: '▼', gauche: '◀', droite: '▶', espace: 'OK', z: null, x: null });
  const el = [], P = 100;
  el.push(scene.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, HAUTEUR, 0x0b0b14, 0.96).setDepth(P));
  el.push(texte(scene, LARGEUR / 2, 40, 'LIONEL SUR MESURE', 36, '#c77dff').setDepth(P + 1));
  const Y0 = 100, PAS = 50, XB = 680, NB = 10, LB = 22;   // barre : 10 cases de 22 px centrées en XB (à droite : le joystick prend la moitié gauche)
  const lignes = REGLAGES_PERSO.map((r, k) => {
    const y = Y0 + k * PAS;
    const fond = scene.add.rectangle(LARGEUR / 2, y, LARGEUR - 60, PAS - 6, 0x1d1d30).setDepth(P + 1).setStrokeStyle(2, 0x444455);
    const nom = scene.add.text(50, y, r.nom, { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff' }).setOrigin(0, 0.5).setDepth(P + 2);
    const barre = scene.add.graphics().setDepth(P + 2);
    const valeur = texte(scene, XB, y, '', 17, '#ffd84a').setDepth(P + 3);
    const bornes = r.choix ? null : texte(scene, XB, y + 16, `${r.gauche}          ${r.droite}`, 11, '#999999').setDepth(P + 2);
    // − et + à toucher (sur téléphone)
    const moins = texte(scene, XB - 175, y, '−', 30, '#ffffff').setDepth(P + 2).setInteractive({ useHandCursor: true });
    const plus = texte(scene, XB + 175, y, '+', 30, '#ffffff').setDepth(P + 2).setInteractive({ useHandCursor: true });
    moins.on('pointerdown', () => { ligne = k; changer(-1); });
    plus.on('pointerdown', () => { ligne = k; changer(1); });
    fond.setInteractive().on('pointerdown', () => { ligne = k; maj(); });
    el.push(fond, nom, barre, valeur, moins, plus); if (bornes) el.push(bornes);
    return { fond, barre, valeur, y };
  });
  const yBas = Y0 + REGLAGES_PERSO.length * PAS;
  const remise = texte(scene, 590, yBas + 8, '↺ comme en NORMAL', 18, '#aaaaaa').setDepth(P + 2).setInteractive({ useHandCursor: true });
  const jouer = texte(scene, 830, yBas + 8, '▶ JOUER !', 24, '#7fff7f').setDepth(P + 2).setInteractive({ useHandCursor: true });
  el.push(remise, jouer);
  el.push(texte(scene, LARGEUR / 2, HAUTEUR - 22,
    estTactile() ? '− / + : régler     OK : jouer' : '▲ ▼ : choisir     ◀ ▶ : régler     R : comme en NORMAL     ESPACE : jouer', 15, '#7fff7f').setDepth(P + 1));

  function maj() {
    REGLAGES_PERSO.forEach((r, k) => {
      const L = lignes[k], n = niveaux[r.cle], actif = k === ligne;
      L.fond.setStrokeStyle(actif ? 4 : 2, actif ? 0xc77dff : 0x444455);
      L.barre.clear();
      if (r.choix) { L.valeur.setText('◀ ' + r.choix[n] + ' ▶'); return; }
      L.valeur.setText('');
      for (let c = 0; c < NB; c++) {
        const x = XB - (NB * LB) / 2 + c * LB;
        // vert = facile pour toi, rouge = dur (sauf ta zone d'attrape : grande = facile)
        const f = r.cle === 'attrape' ? 1 - c / (NB - 1) : c / (NB - 1);
        const coul = Phaser.Display.Color.Interpolate.ColorWithColor({ r: 90, g: 220, b: 110 }, { r: 255, g: 80, b: 90 }, 100, f * 100);
        L.barre.fillStyle(c < n ? Phaser.Display.Color.GetColor(coul.r, coul.g, coul.b) : 0x33334a, 1).fillRect(x + 2, L.y - 12, LB - 4, 14);
      }
    });
  }
  function changer(s) {
    const r = REGLAGES_PERSO[ligne], max = r.choix ? r.choix.length - 1 : 10;
    const n = Math.max(0, Math.min(max, niveaux[r.cle] + s));
    if (n !== niveaux[r.cle]) { niveaux[r.cle] = n; jouerSon(scene, 'frisbee_rebond'); }
    maj();
  }
  const remettre = () => { REGLAGES_PERSO.forEach(r => { niveaux[r.cle] = r.defaut; }); jouerSon(scene, 'ui_valider'); maj(); };
  remise.on('pointerdown', remettre);
  maj();

  const kb = scene.input.keyboard;
  const haut = () => { ligne = (ligne + REGLAGES_PERSO.length - 1) % REGLAGES_PERSO.length; maj(); };
  const bas = () => { ligne = (ligne + 1) % REGLAGES_PERSO.length; maj(); };
  const gauche = () => changer(-1), droite = () => changer(1);
  const touches = { 'keydown-UP': haut, 'keydown-DOWN': bas, 'keydown-LEFT': gauche, 'keydown-RIGHT': droite, 'keydown-R': remettre };
  for (const [ev, f] of Object.entries(touches)) kb.on(ev, f);
  let fini = false;
  const valider = () => {
    if (fini) return;
    fini = true;
    for (const [ev, f] of Object.entries(touches)) kb.off(ev, f);
    kb.off('keydown-SPACE', valider);
    ecrire(niveaux);
    el.forEach(e => e.destroy());
    jouerSon(scene, 'ui_valider');
    ensuite(difficultePerso(base, niveaux));
  };
  jouer.on('pointerdown', valider);
  scene.time.delayedCall(300, () => { if (!fini) kb.on('keydown-SPACE', valider); });
  scene.events.once('shutdown', () => { for (const [ev, f] of Object.entries(touches)) kb.off(ev, f); kb.off('keydown-SPACE', valider); });
}
