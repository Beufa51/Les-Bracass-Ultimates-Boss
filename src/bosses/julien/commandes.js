// Commandes CLAVIER (PC) de la manif : préréglages + touches personnalisables, gardés dans le navigateur.
// Chaque ACTION a une liste de touches (noms de Phaser.Input.Keyboard.KeyCodes). « inverser » est une touche à
// maintenir qui échange pas de côté ↔ tourner (comme Alt dans Doom). Les touches 1 à 5 (armes) et Tab / M (carte)
// sont fixes. La souris est une option à part (sourisActive).
const CLE = 'bracass_julien_commandes_v1';

export const ACTIONS = [
  ['avancer', 'Avancer'], ['reculer', 'Reculer'], ['coteG', 'Pas de côté gauche'], ['coteD', 'Pas de côté droite'],
  ['tourneG', 'Tourner à gauche'], ['tourneD', 'Tourner à droite'], ['tirer', 'Tirer'], ['marcher', 'Marcher (maintenu)'],
  ['arme', 'Arme suivante'], ['inverser', 'Inverser côté / tourner'],
];

export const PRESETS = {
  moderne: { nom: 'MODERNE', texte: '← → pas de côté (comme sur téléphone), Q / D pour tourner, souris possible',
    touches: { avancer: ['UP'], reculer: ['DOWN'], coteG: ['LEFT'], coteD: ['RIGHT'], tourneG: ['Q', 'A'], tourneD: ['D'],
      tirer: ['CTRL', 'Z'], marcher: ['SHIFT'], arme: ['E'], inverser: ['ALT', 'X'] }, souris: true },
  doom: { nom: 'DOOM 93', texte: '← → tournent, Alt + ← → (ou , et .) pas de côté, Ctrl pour tirer',
    touches: { avancer: ['UP'], reculer: ['DOWN'], coteG: ['COMMA'], coteD: ['PERIOD'], tourneG: ['LEFT'], tourneD: ['RIGHT'],
      tirer: ['CTRL', 'Z'], marcher: ['SHIFT'], arme: ['E'], inverser: ['ALT', 'X'] }, souris: false },
  zqsd: { nom: 'ZQSD + SOURIS', texte: 'Clavier AZERTY : Z Q S D pour bouger, souris pour viser, clic ou Espace pour tirer',
    touches: { avancer: ['Z', 'UP'], reculer: ['S', 'DOWN'], coteG: ['Q'], coteD: ['D'], tourneG: ['LEFT', 'A'], tourneD: ['RIGHT', 'E'],
      tirer: ['SPACE', 'CTRL'], marcher: ['SHIFT'], arme: ['R'], inverser: ['ALT'] }, souris: true },
  wasd: { nom: 'WASD + SOURIS', texte: 'Clavier QWERTY : W A S D pour bouger, souris pour viser, clic ou Espace pour tirer',
    touches: { avancer: ['W', 'UP'], reculer: ['S', 'DOWN'], coteG: ['A'], coteD: ['D'], tourneG: ['LEFT', 'Q'], tourneD: ['RIGHT', 'E'],
      tirer: ['SPACE', 'CTRL'], marcher: ['SHIFT'], arme: ['R'], inverser: ['ALT'] }, souris: true },
};

const NOMS = { UP: '↑', DOWN: '↓', LEFT: '←', RIGHT: '→', CTRL: 'Ctrl', SHIFT: 'Maj', ALT: 'Alt', SPACE: 'Espace', COMMA: ',',
  PERIOD: '.', ENTER: 'Entrée', BACKSPACE: 'Retour', TAB: 'Tab' };
export const nomTouche = (t) => NOMS[t] || t;
export const nomsTouches = (liste) => liste.map(nomTouche).join(' / ') || '—';

// Réglage choisi : { preset, touches (copie modifiable), souris, toujoursCourir }
export function lireCommandes() {
  let r = null;
  try { r = JSON.parse(localStorage.getItem(CLE) || 'null'); } catch (e) { /* ignoré */ }
  if (!r || !r.touches) r = { preset: 'moderne', touches: structuredClone(PRESETS.moderne.touches), souris: true, toujoursCourir: true };
  for (const [a] of ACTIONS) if (!r.touches[a]) r.touches[a] = [];
  return r;
}
export function ecrireCommandes(r) {
  try { localStorage.setItem(CLE, JSON.stringify(r)); } catch (e) { /* ignoré */ }
}
export function appliquerPreset(r, nom) {
  r.preset = nom; r.touches = structuredClone(PRESETS[nom].touches); r.souris = PRESETS[nom].souris;
}

// Les touches de la partie : bas('avancer'), vient('tirer') (vient d'être enfoncée)
export function creerCommandes(scene, r) {
  const K = Phaser.Input.Keyboard.KeyCodes, cles = {};
  for (const [a] of ACTIONS) cles[a] = r.touches[a].filter(t => K[t] !== undefined).map(t => scene.input.keyboard.addKey(K[t]));
  return {
    bas: (a) => cles[a].some(k => k.isDown),
    vient: (a) => cles[a].some(k => Phaser.Input.Keyboard.JustDown(k)),
  };
}

// Nom Phaser d'une touche à partir d'un événement clavier (pour la personnalisation)
export function toucheDeEvenement(ev) {
  const K = Phaser.Input.Keyboard.KeyCodes;
  return Object.keys(K).find(n => K[n] === ev.keyCode && !/^NUMPAD/.test(n)) || null;
}
