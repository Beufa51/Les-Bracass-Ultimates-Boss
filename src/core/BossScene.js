// =====================================================================
// Modèle commun à tous les boss.
// Chaque boss "hérite" de cette scène et obtient gratuitement :
//   - l'écran des commandes avant de commencer (afficherIntro)
//   - la victoire (badge sauvegardé) et la défaite
//   - le retour au hub devant la porte du boss
// =====================================================================
import { LARGEUR, HAUTEUR } from './reglages.js';
import { Sauvegarde, SCENES_REPRISE } from './sauvegarde.js';
import { texte, voile } from './ui.js';
import { jouerSon, chargerFichiers, preparerVisuels } from './ressources.js';
import { estTactile, etiquettesTactiles, etiquettesActuelles } from './tactile.js';
// écrans de règles et de présentation : seul le bouton OK reste (les autres gênaient la lecture sur téléphone)
const SEULEMENT_OK = { espace: 'OK', z: null, x: null, haut: null, bas: null, gauche: null, droite: null, hg: null, hd: null };

// Avis jouabilité (nov. 2026) : un écran de texte se ferme avec ESPACE / OK, ou en touchant N'IMPORTE OÙ (au lever du
// doigt, pour que ce toucher ne frappe pas aussi dans le jeu). delai : on ignore les appuis trop rapides.
export function attendreOK(scene, ensuite, delai = 400) {
  let fait = false;
  const fin = () => {
    if (fait) return; fait = true;
    scene.input.keyboard.off('keydown-SPACE', fin); window.removeEventListener('pointerup', toucher);
    ensuite();
  };
  const toucher = (e) => { if (e.target && e.target.closest && e.target.closest('button')) return; fin(); };
  scene.time.delayedCall(delai, () => {
    if (fait) return;
    scene.input.keyboard.once('keydown-SPACE', fin);
    window.addEventListener('pointerup', toucher);
  });
  scene.events.once('shutdown', () => { fait = true; window.removeEventListener('pointerup', toucher); });
}

export class BossScene extends Phaser.Scene {
  // cle : nom unique de la scène ; identite : { id, nom } du boss
  constructor(cle, identite) {
    super(cle);
    this.identite = identite;
  }

  init(donnees) {
    this.donnees = donnees || {};
    this.termine = false;
    // REPRISE : arrivé à une étape qu'on peut reprendre depuis le hub (babyfoot, lycée, quiz...) → on la retient
    const etape = SCENES_REPRISE[this.scene.key];
    if (etape && etape.boss === this.identite.id) {
      const { rejouer, nomDiff, diffObjet, ...reste } = this.donnees;
      Sauvegarde.noterReprise(etape.boss, this.scene.key, { ...reste, ...(etape.ajout || {}) });
    }
  }

  // Les visuels et sons de CE boss sont chargés en entrant chez lui (le démarrage du jeu ne charge que le hub).
  // Une deuxième visite ne recharge rien.
  preload() {
    const id = this.identite.id;
    chargerFichiers(this, id);
    if (this.load.list.size === 0) { preparerVisuels(this, id); return; }
    const titre = texte(this, LARGEUR / 2, HAUTEUR / 2 - 30, `Chez ${this.identite.nom}...`, 28, '#ffd84a');
    const fond = this.add.rectangle(LARGEUR / 2, HAUTEUR / 2 + 20, 404, 24, 0x000000).setStrokeStyle(2, 0xffffff, 0.6);
    const barre = this.add.rectangle(LARGEUR / 2 - 200, HAUTEUR / 2 + 20, 0, 18, 0xffd84a).setOrigin(0, 0.5);
    this.load.on('progress', (v) => { barre.width = 400 * v; });
    this.load.once('complete', () => {
      this.load.off('progress');
      titre.destroy(); fond.destroy(); barre.destroy();
      preparerVisuels(this, id);
    });
  }

  // Affiche le titre et la liste des commandes, puis attend Espace
  afficherIntro(titre, commandes, quandPret) {
    // V18 : REJOUER après une défaite → on saute l'écran des commandes (déjà lu)
    // Avis jouabilité (nov. 2026) : les règles ne s'affichent que la 1re FOIS (menu pause : « Revoir les règles »)
    const vu = 'regles_' + this.identite.id + '_' + titre;
    if (this.donnees.rejouer || Sauvegarde.fait(vu)) { this.time.delayedCall(0, quandPret); return; }
    // (Fabien) sur téléphone, les boutons du jeu gênaient la lecture des règles : on ne garde que OK pendant cet écran,
    // et on remet EXACTEMENT les boutons du niveau quand on appuie sur OK
    const avant = etiquettesActuelles();
    etiquettesTactiles(SEULEMENT_OK);
    const liste = texte(this, LARGEUR / 2, 220, commandes.join('\n'), 20, '#ffffff', { lineSpacing: 6, wordWrap: { width: LARGEUR - 60, useAdvancedWrap: true } }).setOrigin(0.5, 0).setDepth(1001);
    // V100 : les longues règles sortaient de l'écran sur les côtés : elles passent à la ligne (ci-dessus),
    // et si la liste devient trop haute, le texte rapetisse jusqu'à tenir au-dessus de l'invite verte
    for (let t = 19; liste.height > HAUTEUR - 220 - 50 && t >= 13; t--) liste.setFontSize(t);
    // le texte vert se place SOUS les commandes, à la hauteur MESURÉE de la liste :
    // plus jamais par-dessus (Kédric et ses 9 lignes de règles du match chevauchaient l'invite !)
    const vert = texte(this, LARGEUR / 2,
      Math.min(HAUTEUR - 14, Math.max(HAUTEUR - 45, 220 + liste.height + 16)),
      `${estTactile() ? 'Touche l\'écran' : 'Appuie sur ESPACE'} pour commencer`, 22, '#7fff7f').setDepth(1001);
    const elements = [
      voile(this, 0.85).setDepth(1000),
      texte(this, LARGEUR / 2, 120, titre, 40, '#ffd84a').setDepth(1001),
      texte(this, LARGEUR / 2, 190, 'COMMANDES', 22, '#aaaaaa').setDepth(1001),
      liste, vert,
    ];
    attendreOK(this, () => {
      Sauvegarde.marquerFait(vu);
      elements.forEach(el => el.destroy());
      etiquettesTactiles(avant);
      jouerSon(this, 'ui_valider');
      quandPret();
    }, 250);
  }

  // Écran de PRÉSENTATION du boss (comme Greg, Kédric, Lionel) : son avatar glisse depuis la droite,
  // son nom, son surnom et quelques infos à gauche. o = { image, nom, surnom, infos: [...], couleur, fond, invite, son }
  afficherPresentation(o, ensuite) {
    // V18 : rejouer = pas de présentation ; avis jouabilité : seulement la 1re fois (pause : « Revoir les règles »)
    const vu = 'regles_' + this.identite.id + '_presentation';
    if (this.donnees.rejouer || Sauvegarde.fait(vu)) { this.time.delayedCall(0, ensuite); return; }
    const avant = etiquettesActuelles();   // boutons du jeu (ex. Sprint de Beufa) : remis après la présentation
    etiquettesTactiles(SEULEMENT_OK);   // (la croix aussi est cachée : elle gênait la lecture)
    const el = [];
    el.push(this.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, HAUTEUR, o.fond ?? 0x0b0b14, 1).setDepth(1000));
    const g = this.add.graphics().setDepth(1001);
    g.lineStyle(2, 0xffffff, 0.12);
    for (let k = 0; k < 40; k++) { const y = Math.random() * HAUTEUR; g.lineBetween(0, y, 600, y + (Math.random() - 0.5) * 20); }
    el.push(g);
    if (this.textures.exists(o.image)) {
      const p = this.add.image(LARGEUR + 250, HAUTEUR / 2 + 18, o.image).setDepth(1001);
      const s = Math.min(500 / p.height, 380 / p.width);   // tient dans 380 × 500 (marge en haut)
      p.setScale(s);
      // centré dans la zone libre à droite des textes (x 570 → LARGEUR), sans coller au bord
      const cible = Math.min((570 + LARGEUR) / 2, LARGEUR - 20 - p.displayWidth / 2);
      this.tweens.add({ targets: p, x: cible, duration: 350, ease: 'Cubic.Out' });
      el.push(p);
    }
    el.push(texte(this, 300, 90, o.nom, 96, '#ffffff', { fontStyle: 'bold italic', stroke: o.couleur || '#b3202c', strokeThickness: 14 }).setDepth(1002));
    el.push(texte(this, 300, 175, o.surnom, 34, '#ffd84a').setDepth(1002));
    el.push(texte(this, 300, 300, o.infos.join('\n'), 20, '#dddddd', { lineSpacing: 10, wordWrap: { width: 540 } }).setDepth(1002));
    el.push(texte(this, 300, 460, `${estTactile() ? 'Touche l\'écran' : 'ESPACE'} : ${o.invite || 'c\'est parti !'}`, 22, '#7fff7f').setDepth(1002));
    if (o.son) jouerSon(this, o.son);
    this.cameras.main.shake(200, 0.008);
    attendreOK(this, () => {
      Sauvegarde.marquerFait(vu);
      el.forEach(e => e.destroy());
      etiquettesTactiles(avant);
      jouerSon(this, 'ui_valider');
      ensuite();
    }, 500);
  }

  victoire(message = 'Badge obtenu !') {
    if (this.termine) return;
    this.termine = true;
    Sauvegarde.donnerBadge(this.identite.id);
    Sauvegarde.oublierReprise(this.identite.id);   // boss battu : la prochaine visite repart du début
    jouerSon(this, 'ui_badge');
    this.ecranFin('VICTOIRE', message, '#ffd84a', true);
  }

  defaite(message = 'Retente ta chance !') {
    if (this.termine) return;
    this.termine = true;
    jouerSon(this, 'ui_defaite');
    this.ecranFin('PERDU', message, '#ff6b6b', false);
  }

  // V18 (audit global) : REJOUER pour tous les boss. La scène repart avec les mêmes données (phase, round...) et la même
  // difficulté ; l'intro, la présentation et le choix de difficulté sont sautés (donnees.rejouer).
  rejouer() {
    this.scene.restart({ ...this.donnees, rejouer: true, nomDiff: this.nomDiff, diffObjet: this.diff });
  }

  // (analyse comparée) PARTAGER son résultat aux copains (WhatsApp, SMS...) : bouton en bas à gauche, seulement si le
  // téléphone sait partager (navigator.share) ; il disparaît en quittant l'écran.
  boutonPartager(gagne, message) {
    if (!navigator.share) return;
    const rang = (message.match(/RANG (\w)/) || [])[1];
    const texteP = gagne
      ? `J'ai battu ${this.identite.nom} dans Les Bracass'${rang ? ` avec le rang ${rang}` : ''} ! À toi de faire mieux 😎`
      : `${this.identite.nom} m'a battu dans Les Bracass'... Qui me venge ? 😤`;
    const b = document.createElement('button');
    b.textContent = '📤 Partager';
    Object.assign(b.style, { position: 'fixed', left: '10px', bottom: '10px', zIndex: 12, padding: '10px 14px', font: 'bold 16px monospace',
      color: '#fff', background: 'rgba(30,60,140,0.85)', border: '2px solid #ffd84a', borderRadius: '12px', touchAction: 'none' });
    b.addEventListener('pointerup', (e) => { e.preventDefault(); e.stopPropagation(); navigator.share({ title: 'Les Bracass\'', text: texteP, url: location.href }).catch(() => {}); });
    document.body.appendChild(b);
    this.events.once('shutdown', () => b.remove());
  }

  ecranFin(titre, message, couleur, gagne) {
    etiquettesTactiles({ espace: 'OK', z: null, x: null, haut: null, bas: null, gauche: null, droite: null });
    this.boutonPartager(gagne, message);
    if (gagne && this.ecranVictoire) { this.ecranVictoire(message); this.attendreRetour(1200); return; }
    voile(this, 0.8).setDepth(1000);
    texte(this, LARGEUR / 2, 170, titre, 56, couleur).setDepth(1001);
    texte(this, LARGEUR / 2, 270, message, 24, '#ffffff', { wordWrap: { width: 800 } }).setDepth(1001);
    if (gagne) this.add.image(LARGEUR / 2, 400, 'badge_' + this.identite.id).setScale(2).setDepth(1001);
    if (!gagne) {
      // V18 : PERDU → REJOUER tout de suite (ESPACE / clic / OK) ou X / bouton Hub
      const t = estTactile();
      etiquettesTactiles({ espace: 'Rejouer', x: 'Hub', z: null, haut: null, bas: null, gauche: null, droite: null });
      texte(this, LARGEUR / 2, HAUTEUR - 60, `${t ? 'Rejouer' : 'ESPACE ou clic'} : rejouer     ${t ? 'Hub' : 'X'} : retour au hub`, 22, '#7fff7f').setDepth(1001);
      this.time.delayedCall(700, () => {
        let fait = false;
        const une = (f) => () => { if (fait) return; fait = true; f(); };
        const rejouer = une(() => this.rejouer()), hub = une(() => this.retourHub());
        this.input.keyboard.once('keydown-SPACE', rejouer);
        this.input.keyboard.once('keydown-X', hub);
        this.input.once('pointerdown', (p) => { if (!t) rejouer(); });   // (téléphone : les boutons Rejouer / Hub)
      });
      return;
    }
    texte(this, LARGEUR / 2, HAUTEUR - 60, `${estTactile() ? 'OK' : 'ESPACE ou clic'} : retour au hub`, 20, '#aaaaaa').setDepth(1001);
    this.attendreRetour(600);
  }

  // ESPACE (ou un clic, V18) : retour au hub (petit délai pour ne pas sauter l'écran par accident)
  attendreRetour(delai) {
    this.time.delayedCall(delai, () => {
      let fait = false;
      const retour = () => { if (fait) return; fait = true; this.retourHub(); };
      this.input.keyboard.once('keydown-SPACE', retour);
      if (!estTactile()) this.input.once('pointerdown', retour);
    });
  }

  retourHub() {
    this.scene.start('Hub', { depuis: this.identite.id });
  }
}
