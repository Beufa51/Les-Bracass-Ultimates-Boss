// =====================================================================
// HUB : TABLEAU DE PROGRESSION (audit méta, nov. 2026) — « qu'est-ce qui me reste à faire ? »
// Par boss : battu ou pas, records (par difficulté), défis de maîtrise, étape en cours à reprendre.
// En bas : COPIER sa sauvegarde (un code à garder) et CHARGER un code (nouveau téléphone, données effacées...).
// Réglages : `progression` dans src/hub/reglages.js.
// =====================================================================
import { LARGEUR, HAUTEUR } from '../core/reglages.js';
import { texte } from '../core/ui.js';
import { Sauvegarde, formatTemps, SCENES_REPRISE, codeSauvegarde, chargerCode } from '../core/sauvegarde.js';
import { jouerSon } from '../core/ressources.js';
import { estTactile } from '../core/tactile.js';
import { BOSS } from '../bosses/liste.js';
import { REGLAGES_HUB as R } from './reglages.js';
import { rangLisible } from '../core/rangs.js';
import { rangRecord } from '../bosses/rangs.js';
import { DIFFICULTES as D_BEUFA } from '../bosses/beufa/reglages.js';
import { DIFFICULTES as D_KEDRIC } from '../bosses/kedric/reglages.js';
import { DIFFICULTES as D_JULIEN } from '../bosses/julien/reglages.js';
import { DIFFICULTES as D_GREG } from '../bosses/greg/reglages.js';
import { DIFFICULTES as D_REMI } from '../bosses/remi/reglages.js';
import { DIFFICULTES as D_LIONEL } from '../bosses/lionel/reglages.js';

const DIFFS = { beufa: D_BEUFA, kedric: D_KEDRIC, julien: D_JULIEN, greg: D_GREG, remi: D_REMI, lionel: D_LIONEL };

// records d'un boss, lisibles : « NORMAL S 1'20"00 · CHAMPION A 2'03"10 » (Julien : manif + classe)
function lignesRecords(id) {
  const recs = Sauvegarde.tout().records || {}, morceaux = [];
  const ajouter = (nom, r, liste = id) => {
    if (!r) return;
    const g = rangRecord(liste, r.rang);
    morceaux.push(`${nom} : ${rangLisible(g.nom, g.lettre)} ${formatTemps(r.temps)}`);
  };
  if (id === 'julien') { ajouter('Manif', recs.julien); ajouter('Classe', recs.julien_classe, 'julien_classe'); }
  else {
    const diffs = DIFFS[id] || {};
    for (const n of Object.keys(diffs)) ajouter(diffs[n].nom || n, recs[n === 'normal' ? id : id + '_' + n]);
  }
  return morceaux.length ? 'Records : ' + morceaux.join('  ·  ') : 'Pas encore de record';
}

// ouvre le tableau par-dessus le hub ; ferme() est appelé à la fermeture
export function ouvrirProgression(scene, ferme) {
  const el = [], P = R.progression, Z = 40;
  const ajout = (o) => { el.push(o.setDepth(Z + (el.length ? 1 : 0))); return o; };
  ajout(scene.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, HAUTEUR, 0x050b24, 0.96).setInteractive());   // bloque les touchers
  ajout(texte(scene, LARGEUR / 2, 28, 'TA PROGRESSION', 28, '#ffd84a', { fontStyle: 'bold', stroke: '#b3202c', strokeThickness: 5 }));

  const restants = BOSS.filter(b => b.pret && !Sauvegarde.aLeBadge(b.id));
  ajout(texte(scene, LARGEUR / 2, 60, restants.length ? `À battre : ${restants.map(b => b.nom).join(', ')}` : '★ Les 6 sont battus : vise les rangs S et les défis ! ★',
    18, restants.length ? '#9fd0ff' : '#ffd84a'));

  BOSS.forEach((boss, k) => {
    const y = P.hautY + k * P.ligneH, battu = Sauvegarde.aLeBadge(boss.id);
    ajout(scene.add.rectangle(LARGEUR / 2, y + 10, LARGEUR - 40, P.ligneH - 6, k % 2 ? 0x13235a : 0x0e1b48, 1));
    if (scene.textures.exists('badge_' + boss.id)) ajout(scene.add.image(48, y + 10, battu ? 'badge_' + boss.id : 'badge_vide').setScale(0.6));
    ajout(texte(scene, 80, y, boss.nom.toUpperCase(), 20, battu ? '#ffd84a' : '#ffffff', { fontStyle: 'bold' }).setOrigin(0, 0.5));
    let etat = !boss.pret ? 'bientôt' : battu ? 'BATTU ✓' : 'à battre';
    const nbDefis = P.defis[boss.id];
    if (nbDefis) etat += `   ·   Défis ${Object.keys(Sauvegarde.defis(boss.id)).length}/${nbDefis}`;
    const r = Sauvegarde.reprise(boss.id), etape = r && SCENES_REPRISE[r.scene];
    if (etape) etat += `   ·   En cours : reprise ${etape.nom}`;
    ajout(texte(scene, 210, y, etat, 18, battu ? '#7fff7f' : '#c8d8ff').setOrigin(0, 0.5));
    const recs = ajout(texte(scene, 80, y + 22, lignesRecords(boss.id), 16, '#aab8e0', { align: 'left' }).setOrigin(0, 0.5));
    if (recs.width > LARGEUR - 110) recs.setScale((LARGEUR - 110) / recs.width);   // (Julien : manif + classe sur une ligne)
  });

  // ---- sauvegarde ----
  const message = ajout(texte(scene, LARGEUR / 2, P.basY - 34, 'Garde ton code de sauvegarde quelque part (notes, message à toi-même).', 16, '#c8d8ff'));
  const dire = (t, c = '#7fff7f') => message.setText(t).setColor(c);
  const bouton = (x, txt, f) => {
    const b = ajout(texte(scene, x, P.basY, txt, 19, '#ffffff', { fontStyle: 'bold', backgroundColor: '#1d3a8a', padding: { x: 10, y: 8 } }).setInteractive());
    b.on('pointerup', (p, lx, ly, ev) => { if (ev) ev.stopPropagation(); jouerSon(scene, 'ui_valider'); f(); });
    return b;
  };
  const t = estTactile();
  const copier = () => {
    const code = codeSauvegarde();
    const montrer = () => { window.prompt('Ton code de sauvegarde (copie-le en entier) :', code); dire('Code affiché : copie-le en entier.'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => dire('Code copié ! Colle-le dans tes notes pour le garder.'), montrer);
    } else montrer();
  };
  const charger = () => {
    const code = window.prompt('Colle ici ton code de sauvegarde (il REMPLACE la progression actuelle) :', '');
    if (!code) return;
    if (!chargerCode(code)) { dire('Code pas reconnu : vérifie qu\'il est complet (il commence par BRACASS1-).', '#ff6b6b'); return; }
    dire('Sauvegarde chargée ! Le jeu redémarre...');
    scene.time.delayedCall(900, () => location.reload());
  };
  let fini = false;
  const fermer = () => {
    if (fini) return; fini = true;
    scene.input.keyboard.off('keydown', touche);
    el.forEach(o => o.destroy());
    scene.time.delayedCall(0, ferme);   // (au tour suivant : la touche T ne doit pas rouvrir le tableau aussitôt)
  };
  bouton(LARGEUR / 2 - 300, `💾 COPIER MA SAUVEGARDE${t ? '' : ' (C)'}`, copier);
  bouton(LARGEUR / 2 + 50, `📥 CHARGER UN CODE${t ? '' : ' (V)'}`, charger);
  bouton(LARGEUR - 80, '✖ FERMER', fermer);
  const touche = (ev) => {
    const k = ev.key.toLowerCase();
    if (k === 'c') copier();
    else if (k === 'v') charger();
    else if (k === 't' || k === ' ' || k === 'x') fermer();
  };
  // (au tour suivant : la touche T qui vient d'ouvrir le tableau ne doit pas le refermer)
  scene.time.delayedCall(0, () => { if (!fini) scene.input.keyboard.on('keydown', touche); });
  scene.events.once('shutdown', () => scene.input.keyboard.off('keydown', touche));
}
