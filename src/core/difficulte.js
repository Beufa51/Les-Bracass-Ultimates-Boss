// Écran de choix de la difficulté (FACILE / NORMAL / CHAMPION), commun à tous les boss.
// Le dernier choix est retenu, et chaque difficulté a son propre record.
import { LARGEUR, HAUTEUR } from './reglages.js';
import { texte } from './ui.js';
import { jouerSon } from './ressources.js';
import { estTactile, etiquettesTactiles } from './tactile.js';
import { Sauvegarde, formatTemps } from './sauvegarde.js';

// Clé du record : 'greg' en NORMAL, 'greg_facile', 'greg_champion' sinon
export function cleRecord(idBoss, nomDiff) { return nomDiff === 'normal' ? idBoss : idBoss + '_' + nomDiff; }

// ensuite(nom, reglagesDeLaDifficulte) est appelé une fois le choix validé
export function choisirDifficulte(scene, idBoss, difficultes, ensuite, son = 'ui_valider') {
  const noms = Object.keys(difficultes);
  let i = Math.max(0, noms.indexOf(Sauvegarde.difficulte(idBoss)));
  etiquettesTactiles({ haut: null, bas: null, z: null, x: null, espace: 'OK' });
  const el = [];
  el.push(scene.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, HAUTEUR, 0x0b0b14, 0.95).setDepth(100));
  el.push(texte(scene, LARGEUR / 2, 70, 'DIFFICULTÉ', 44, '#ffd84a').setDepth(101));
  const cartes = noms.map((n, k) => {
    const D = difficultes[n], x = LARGEUR / 2 + (k - 1) * 290;
    const fond = scene.add.rectangle(x, 260, 260, 220, 0x1d1d30).setDepth(101).setStrokeStyle(4, 0x555566);
    const titre = texte(scene, x, 190, D.nom, 30, D.couleur).setDepth(102);
    const desc = texte(scene, x, 275, D.texte, 15, '#dddddd', { wordWrap: { width: 230 } }).setDepth(102);
    const rec = Sauvegarde.record(cleRecord(idBoss, n));
    const r = texte(scene, x, 350, rec ? `Record : ${rec.rang} ${formatTemps(rec.temps)}` : 'Pas encore de record', 13, '#aaaaaa').setDepth(102);
    el.push(fond, titre, desc, r);
    return fond;
  });
  el.push(texte(scene, LARGEUR / 2, HAUTEUR - 60, `◀ ▶ : choisir     ${estTactile() ? 'OK' : 'ESPACE'} : valider`, 20, '#7fff7f').setDepth(101));
  const maj = () => cartes.forEach((c, k) => {
    c.setStrokeStyle(k === i ? 6 : 3, k === i ? 0xffd84a : 0x555566).setScale(k === i ? 1.06 : 0.95);
  });
  maj();
  const kb = scene.input.keyboard;
  const gauche = () => { i = (i + noms.length - 1) % noms.length; maj(); jouerSon(scene, son); };
  const droite = () => { i = (i + 1) % noms.length; maj(); jouerSon(scene, son); };
  kb.on('keydown-LEFT', gauche); kb.on('keydown-RIGHT', droite);
  // sur téléphone : toucher une carte la choisit
  cartes.forEach((c, k) => c.setInteractive().on('pointerdown', () => { i = k; maj(); }));
  scene.time.delayedCall(300, () => kb.once('keydown-SPACE', () => {
    kb.off('keydown-LEFT', gauche); kb.off('keydown-RIGHT', droite);
    Sauvegarde.reglerDifficulte(idBoss, noms[i]);
    el.forEach(e => e.destroy());
    jouerSon(scene, 'ui_valider');
    ensuite(noms[i], difficultes[noms[i]]);
  }));
}
