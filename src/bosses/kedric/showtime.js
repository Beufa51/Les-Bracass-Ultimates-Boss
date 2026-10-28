// =====================================================================
// SHOWTIME : le BATTLE DE DANSE contre Kédric, le boss de fin (façon DDR / jeu de danse).
// Une SEULE SESSION CONTINUE : la musique (kedric_battle) démarre sur le refrain à l'annonce
// et n'est JAMAIS REPLACÉE — pas de coupure entre l'annonce, le round 1 et le round 2.
// À l'ANNONCE, Kédric sur scène (décor kedric_scene) lance le défi et explique les règles.
// Puis les flèches TOMBENT dans 4 COULOIRS (◀ ▶ à gauche, ▲ ▼ à droite) jusqu'à la touche
// à presser, PILE SUR LE RYTHME : toutes les flèches des 2 rounds sont générées d'un coup,
// calées sur la grille des temps forts (une flèche tous les 'tempsParPas' temps ~0,69 s).
// Kédric danse AVEC TOI du début à la fin : il prend la pose de chaque flèche
// (plus de flèches de démo, plus de tour « À TOI ! »).
// Après 1 minute de musique : ROUND 2, MÊMES RÈGLES (bandeau), la musique continue.
// En CHAMPION seulement (diff.flechesRouges), des FLÈCHES ROUGES : Kédric triche, il faut
// faire l'INVERSE (◀ ↔ ▶, ▲ ↔ ▼). Jamais sur la toute première flèche.
// La jauge du public est un KAMÉHAMÉHA père-fils : ton faisceau BLEU part de la gauche,
// celui de Kédric (DORÉ) de la droite ; la BOULE BLANCHE du point de CHOC se repousse selon
// PARFAIT / BIEN / RATÉ — c'est elle qui désigne le gagnant (jauge > 0 à la fin = victoire).
// L'horloge de la session suit la musique quand elle joue, sinon le temps du jeu. Toute la
// logique avance dans maj(dt, touches) (pas de minuteries Phaser) : les bots peuvent jouer
// en accéléré (scene.horlogeJeu = true : la musique est ignorée).
// =====================================================================
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { texte } from '../../core/ui.js';
import { jouerSon } from '../../core/ressources.js';
import { jouerMusique, arreterMusique, placerMusique, tempsMusique } from '../../core/musique.js';
import { disposition, allumerBouton, eteindreBoutons, estTactile, rectBouton } from '../../core/tactile.js';
import { onomatopee, lignesImpact } from './effets.js';
import { REGLAGES as R } from './reglages.js';

const S = R.showtime;
const PISTE = S.piste;
const DIRS = ['gauche', 'droite', 'haut', 'bas'];
const FLECHES = { gauche: '◀', droite: '▶', haut: '▲', bas: '▼' };
const COULEURS = { gauche: '#3fa7ff', droite: '#ff9a3c', haut: '#ffd84a', bas: '#d9a0ff' };
const INVERSE = { gauche: 'droite', droite: 'gauche', haut: 'bas', bas: 'haut' };
const P = 600;   // profondeur d'affichage (au-dessus du terrain et du HUD, sous les encarts)
// sur scène : Kédric en grand, debout sur l'estrade (entre les couloirs) ; toi de dos, au premier plan, en bas au milieu
const KED = { x: 480, pieds: 392, hauteur: 335 };
const TOI = { x: 480, pieds: HAUTEUR + 34, zoom: 0.85 };
// les couloirs sans écran tactile (sur téléphone : au-dessus des boutons, voir calculerCouloirs)
const COULOIRS = { x: { gauche: 105, droite: 215, haut: 745, bas: 855 }, cibleY: 455, largeur: 96, haut: 84 };
// le KAMÉHAMÉHA du public, en haut : ton faisceau (bleu) part de la gauche, celui de Kédric (doré) de la droite ;
// marge : où les faisceaux commencent ; portee : jusqu'où le point de choc peut se repousser
const KHAM = { y: 36, h: 18, marge: 170, portee: 280 };

export class Showtime {
  // options : { jauge: -30..30, replique, sousTitre } ; fin(gagne, bilan) appelé à la fin
  constructor(scene, options, fin) {
    this.s = scene; this.o = options; this.fin = fin;
    this.jauge = options.jauge || 0;
    this.bilan = { parfaits: 0, bien: 0, rates: 0 };
    this.el = []; this.notes = [];
    // le décor : la scène de concert (sinon une scène sombre et deux projecteurs dessinés)
    if (scene.estIllustre('kedric_scene')) this.ajout(scene.add.image(LARGEUR / 2, HAUTEUR / 2, 'kedric_scene').setDisplaySize(LARGEUR, HAUTEUR).setDepth(P));
    else {
      const g = this.ajout(scene.add.graphics().setDepth(P));
      g.fillStyle(0x120a1e, 1); g.fillRect(0, 0, LARGEUR, HAUTEUR);
      g.fillStyle(0x3a2a20, 1); g.fillRect(70, KED.pieds - 30, LARGEUR - 140, 80);
      g.fillStyle(0xfff3a8, 0.12);
      for (const x0 of [300, 660]) { g.beginPath(); g.moveTo(x0, 0); g.lineTo(KED.x - 150, KED.pieds); g.lineTo(KED.x + 150, KED.pieds); g.closePath(); g.fillPath(); }
    }
    // la poursuite (projecteur) sur Kédric
    const halo = this.ajout(scene.add.graphics().setDepth(P + 1));
    halo.fillStyle(0xfff3a8, 0.22); halo.fillEllipse(KED.x, KED.pieds - 4, 280, 44);
    this.kedric = this.ajout(scene.add.sprite(KED.x, KED.pieds, 'kedric_portrait').setOrigin(0.5, 1).setDepth(P + 2));
    this.toi = this.ajout(scene.add.sprite(TOI.x, TOI.pieds, 'kedric_toi_course', 0).setOrigin(0.5, 1).setDepth(P + 3));
    // le KAMÉHAMÉHA du public, en haut : ton étiquette à gauche (bleu), celle de Kédric à droite (doré)
    this.jaugeG = this.ajout(scene.add.graphics().setDepth(P + 4));
    this.etiquettesJauge = [
      texte(scene, KHAM.marge - 20, 30, 'TOI', 18, '#7fe8ff', { fontStyle: 'bold' }).setOrigin(1, 0.5),
      texte(scene, LARGEUR - KHAM.marge + 20, 30, 'KÉDRIC', 18, '#ff9a3c', { fontStyle: 'bold' }).setOrigin(0, 0.5),
      texte(scene, LARGEUR / 2, 66, 'PUBLIC', 14, '#ffffff'),
    ].map(t => this.ajout(t.setDepth(P + 4)));
    // les 4 couloirs : le fond, la touche en bas de chacun (un rond et sa flèche)
    this.couloirsG = this.ajout(scene.add.graphics().setDepth(P + 5));
    this.touchesC = {};
    for (const n of DIRS) this.touchesC[n] = this.ajout(texte(scene, 0, 0, FLECHES[n], 40, '#ffffff', { fontStyle: 'bold' }).setDepth(P + 5).setAlpha(0.45));
    this.retour = this.ajout(texte(scene, 0, 0, '', 26, '#ffffff', { fontStyle: 'bold', strokeThickness: 7 }).setDepth(P + 7));
    this.c = COULOIRS;
    // la musique du battle (celle du match s'arrête) ; gros boutons tactiles (rangés pendant la pause)
    arreterMusique('kedric_musique');
    jouerMusique(scene, S.musique);
    disposition('danse');
    this.surPause = () => { eteindreBoutons(); disposition('normale'); };
    this.surReprise = () => { disposition('danse'); this.calculerCouloirs(); };
    scene.events.on('pause', this.surPause); scene.events.on('resume', this.surReprise);
    this.annonce();
  }

  ajout(o) { this.el.push(o); return o; }

  detruire() {
    this.el.forEach(o => o.destroy()); this.viderNotes(); this.viderAnnonce(); this.el = [];
    this.s.events.off('pause', this.surPause); this.s.events.off('resume', this.surReprise);
    eteindreBoutons();
    disposition('separee');   // la disposition du match de Kédric
    arreterMusique(S.musique);
    jouerMusique(this.s, 'kedric_musique');
  }

  // ---------- l'ANNONCE : Kédric sur scène lance le défi et explique les règles ----------
  annonce() {
    const s = this.s;
    this.phase = 'intro'; this.T = 0;
    placerMusique(S.musique, S.introMusique);   // sur le refrain — la musique n'est plus jamais replacée
    this.poseKedric('micro');
    this.poseToi(null);
    this.etiquettesJauge.forEach(t => t.setVisible(false));
    const voile = s.add.graphics().setDepth(P + 8);
    voile.fillStyle(0x000000, 0.45); voile.fillRect(0, 0, LARGEUR, HAUTEUR);
    voile.fillStyle(0x000000, 0.6); voile.fillRect(0, HAUTEUR - 150, LARGEUR, 150);
    const titre = texte(s, LARGEUR / 2, 62, 'BATTLE DE DANSE !', 64, '#ffd84a', { fontStyle: 'bold', strokeThickness: 12 }).setDepth(P + 10).setScale(0);
    s.tweens.add({ targets: titre, scale: 1, duration: 450, ease: 'Back.Out' });
    s.tweens.add({ targets: titre, angle: { from: -3, to: 3 }, duration: 700, yoyo: true, repeat: -1 });
    const sous = texte(s, LARGEUR / 2, 112, this.o.sousTitre || '', 20, '#ffffff', { strokeThickness: 6 }).setDepth(P + 10);
    // sa réplique, dans une bulle à côté de lui
    const bulle = s.add.text(KED.x + 150, 240, `« ${this.o.replique || ''} »`, {
      fontFamily: 'monospace', fontSize: '19px', color: '#111111', backgroundColor: '#ffffff', padding: { x: 12, y: 8 },
      wordWrap: { width: 300 }, align: 'center',
    }).setOrigin(0, 0.5).setDepth(P + 10).setAlpha(0);
    s.tweens.add({ targets: bulle, alpha: 1, delay: 300, duration: 250 });
    const regles = texte(s, LARGEUR / 2, HAUTEUR - 96,
      'Une seule session : 2 ROUNDS de 1 minute, Kédric danse AVEC toi du début à la fin !\n' +
      'Les flèches TOMBENT en rythme avec la musique : appuie quand elles arrivent en bas.' +
      (estTactile() ? '\nLe bouton à presser S\'ALLUME de plus en plus fort jusqu\'au bon moment.' : '') +
      '\nLe KAMÉHAMÉHA du public : PARFAIT = ta boule repousse la sienne, RATÉ = elle recule.\nÀ la fin, la boule du côté de KÉDRIC = il gagne le public !' +
      (this.s.diff.flechesRouges ? '\nFLÈCHE ROUGE = Kédric triche : fais l\'INVERSE !' : ''), 17, '#ffffff', { align: 'center', lineSpacing: 6 }).setDepth(P + 10);
    this.invite = texte(s, LARGEUR / 2, HAUTEUR - 22, 'Appuie sur une flèche quand tu es prêt !', 20, '#7fff7f', { fontStyle: 'bold' }).setDepth(P + 10).setAlpha(0);
    this.elAnnonce = [voile, titre, sous, bulle, regles, this.invite];
    jouerSon(s, 'kedric_foule', { volume: 0.8 });   // le public (pas de bips au battle : seulement la musique)
  }

  viderAnnonce() {
    if (!this.elAnnonce) return;
    this.elAnnonce.forEach(o => { this.s.tweens.killTweensOf(o); o.destroy(); });
    this.elAnnonce = null;
  }

  // ---------- LA SESSION : on quitte l'écran d'annonce SANS replacer la musique ----------
  // l'origine de la session est le temps musical ACTUEL : la transition annonce → danse est
  // d'une douceur totale, la musique n'a pas une seule coupure jusqu'à la fin
  demarrer() {
    this.viderAnnonce();
    this.etiquettesJauge.forEach(t => t.setVisible(true));
    const m = tempsMusique(S.musique);
    this.origine = m === null ? S.introMusique : m;   // le temps musical courant (jamais de re-placement)
    this.T = 0;
    this.duree = S.tempo.temps * S.tempsParPas;   // durée entre deux flèches (~0,69 s), calée sur la musique
    const fen = this.s.diff.fenetreShow;
    this.fenetre = { parfait: Math.min(S.parfait * fen, this.duree * 0.25), bien: Math.min(S.bien * fen, this.duree * 0.45) };
    this.parRound = Math.floor(S.dureeRound / this.duree);   // ~87 flèches par round
    this.genererPas();   // TOUTES les flèches des 2 rounds, d'un coup
    this.phase = 'annonce'; this.dernierPas = -1; this.finBandeau = null;
    this.calculerCouloirs();
    this.creerNotes();
    this.s.bandeau.setText(`ROUND 1 / ${S.rounds} : DANSE AVEC KÉDRIC !`).setColor('#ffd84a').setVisible(true);
    this.poseKedric('portrait');
    this.poseToi(null);
  }

  // toutes les flèches des 2 rounds, calées sur la grille des temps forts de la musique ;
  // flèche rouge (fais l'inverse) : CHAMPION seulement, par probabilité, jamais sur la toute première
  genererPas() {
    this.pas = [];
    let prec = null, prec2 = null;
    for (let j = 0; j < this.parRound * S.rounds; j++) {
      let d;
      do { d = DIRS[Math.floor(Math.random() * 4)]; } while (j >= 2 && d === prec && d === prec2);
      const rouge = this.s.diff.flechesRouges && j > 0 && Math.random() < S.rougeChance;
      this.pas.push({ montre: d, rouge, attendu: rouge ? INVERSE[d] : d, note: null });
      prec2 = prec; prec = d;
    }
  }

  // moment (s depuis le début de la session) de la flèche j : pile sur un temps fort de la grille
  cible(j) { return (S.annonce + j) * this.duree; }
  // le round de la flèche j (0 = premier)
  roundDe(j) { return Math.floor(j / this.parRound); }

  // Les couloirs : sur téléphone, juste au-dessus des boutons ◀ ▶ ▲ ▼ (la flèche tombe jusqu'à la touche à presser) ;
  // sans écran tactile, à gauche et à droite de la scène
  calculerCouloirs() {
    this.c = COULOIRS;
    const ecran = this.s.game.canvas.getBoundingClientRect();
    const rects = DIRS.map(n => rectBouton(n));
    if (!ecran.width || !rects.every(r => r)) return;
    const kx = LARGEUR / ecran.width, ky = HAUTEUR / ecran.height;
    const largeur = Math.min(110, Math.min(...rects.map(r => r.width * kx)) * 0.8);
    const x = {};
    // (un bouton dans la marge noire sur le côté : son couloir reste au bord de l'écran)
    DIRS.forEach((n, i) => { x[n] = Phaser.Math.Clamp((rects[i].left + rects[i].width / 2 - ecran.left) * kx, largeur / 2 + 4, LARGEUR - largeur / 2 - 4); });
    const hautBoutons = Math.min(...rects.map(r => (r.top - ecran.top) * ky));
    this.c = { x, cibleY: Phaser.Math.Clamp(hautBoutons - largeur * 0.5, 240, 470), largeur, haut: 84 };
  }

  // les flèches qui tombent : à toi de jouer les 2 rounds d'une traite (Kédric danse avec toi, il ne démontre plus)
  creerNotes() {
    this.viderNotes();
    this.pas.forEach((p, i) => {
      // ta flèche (rouge si Kédric a triché : à toi de faire l'inverse)
      const tienne = texte(this.s, -99, 0, FLECHES[p.montre], 58, p.rouge ? '#ff3030' : COULEURS[p.montre], { fontStyle: 'bold', strokeThickness: 8 }).setDepth(P + 6);
      this.notes.push({ t: this.cible(i), objet: tienne, pas: p });
    });
  }

  viderNotes() { this.notes.forEach(n => n.objet.destroy()); this.notes = []; }

  // l'horloge de la session : le temps du jeu, recalé sur la musique quand elle joue vraiment
  horloge(dt) {
    this.T += dt;
    if (this.phase === 'intro' || this.phase === 'fin' || this.s.horlogeJeu) return;
    const m = tempsMusique(S.musique);
    if (m === null) return;
    const ecart = (m - this.origine) - this.T;
    if (Math.abs(ecart) > 0.12) this.T += ecart;   // gros décalage (chargement, saut dans la musique) : on se cale d'un coup
    else this.T += ecart * 0.1;                     // petit : en douceur
  }

  // ---------- la boucle ----------
  maj(dt, e) {
    if (this.termine) { this.afficher(); return; }
    this.horloge(dt);
    if (this.phase === 'intro') {
      // une flèche (après un petit moment), ou on y va tout seul
      if (this.T >= S.introMini && this.invite.alpha === 0) this.s.tweens.add({ targets: this.invite, alpha: { from: 1, to: 0.35 }, duration: 500, yoyo: true, repeat: -1 });
      const appui = DIRS.some(k => e[k]);
      if ((appui && this.T >= S.introMini) || this.T >= S.intro) this.demarrer();
      this.afficher();
      return;
    }
    const d = this.duree, n = this.pas.length, k = Math.floor(this.T / d);   // k : numéro du temps de musique en cours
    if (k > this.dernierPas) { this.dernierPas = k; this.surLeTemps(k); }
    if (this.phase === 'annonce' && k >= S.annonce) { this.phase = 'jeu'; this.finBandeau = this.T + 1.5; }
    if (this.phase === 'jeu') {
      for (const t of DIRS) if (e[t]) this.appui(t);
      for (let i = 0; i < n; i++) {
        const p = this.pas[i];
        if (p.note === null && this.T > this.cible(i) + this.fenetre.bien) this.noter(i, 'rate');
      }
      // fin de la session (toutes les flèches jouées) : la boule du kaméhaméha désigne le gagnant
      if (!this.termine && this.pas.every(p => p.note !== null) && this.T > this.cible(n - 1) + d * 0.5) this.terminer(this.jauge > 0);
    }
    this.afficher();
  }

  // à chaque temps de musique : le décompte 3, 2, 1 ; Kédric prend la pose de la flèche (il danse avec toi) ;
  // au premier temps du round 2 : le bandeau, MÊMES RÈGLES, la musique continue sans coupure
  surLeTemps(k) {
    const j = k - S.annonce;
    if (j < 0) {
      if (this.phase === 'annonce' && k >= S.annonce - 3 && k < S.annonce)
        onomatopee(this.s, KED.x + 230, 300, String(S.annonce - k), 44, '#ffd84a');
      return;
    }
    if (j >= this.pas.length) return;
    const p = this.pas[j];
    this.poseKedric(p.rouge ? 'triche' : p.montre);   // Kédric fait le pas en même temps que toi
    if (j > 0 && j % this.parRound === 0) {
      const num = this.roundDe(j) + 1;
      this.s.bandeau.setText(`ROUND ${num} / ${S.rounds} : MÊMES RÈGLES !`).setColor('#ffd84a').setVisible(true);
      this.finBandeau = this.T + 2.5;
      onomatopee(this.s, LARGEUR / 2, 150, `ROUND ${num} !`, 54, '#ffd84a');
    }
  }

  appui(t) {
    // la prochaine flèche pas encore notée, si elle est assez proche dans le temps
    const i = this.pas.findIndex(p => p.note === null);
    if (i < 0) return;
    const ecart = Math.abs(this.T - this.cible(i));
    if (ecart > Math.min(this.fenetre.bien * 1.5, this.duree * 0.5)) return;   // appui bien trop tôt : ignoré
    const p = this.pas[i];
    this.poseToi(t);
    if (t !== p.attendu) this.noter(i, 'rate');
    else this.noter(i, ecart <= this.fenetre.parfait ? 'parfait' : ecart <= this.fenetre.bien ? 'bien' : 'rate');
  }

  noter(i, note) {
    const p = this.pas[i];
    p.note = note;
    const n = this.notes[i];
    // le message au-dessus de la touche du pas
    const xc = this.c.x[p.attendu];
    this.retour.setPosition(Phaser.Math.Clamp(xc, 90, LARGEUR - 90), this.c.cibleY - this.c.largeur * 0.5 - 30);
    // le point de CHOC du kaméhaméha : les faisceaux s'y affrontent, il bouge avec la jauge
    const xChoc = this.pointChoc();
    if (note === 'parfait') { this.bilan.parfaits++; this.public(S.gain.parfait); this.retour.setText('PARFAIT !').setColor('#7fe8ff'); lignesImpact(this.s, xc, this.c.cibleY, 0x9fe0ff, 10, 70); lignesImpact(this.s, xChoc, KHAM.y, 0xffffff, 12, 100); }
    else if (note === 'bien') { this.bilan.bien++; this.public(S.gain.bien); this.retour.setText('BIEN !').setColor('#7fff7f'); }
    else { this.bilan.rates++; this.public(-S.gain.rate); this.retour.setText(p.rouge ? 'RATÉ ! (l\'inverse !)' : 'RATÉ !').setColor('#ff6b6b'); lignesImpact(this.s, xChoc, KHAM.y, 0xff6b6b, 12, 100); this.poseKedric('haut'); }
    this.s.tweens.killTweensOf(this.retour); this.retour.setAlpha(1).setScale(1.2);
    this.s.tweens.add({ targets: this.retour, scale: 1, duration: 120 });
    if (n) n.objet.setColor(note === 'rate' ? '#ff6b6b' : note === 'parfait' ? '#7fe8ff' : '#7fff7f');
    // public tout à Kédric : sa boule t'a écrasé, perdu tout de suite
    if (this.jauge <= -100) this.terminer(false);
  }

  terminer(gagne) {
    if (this.termine) return;
    this.termine = true;
    this.phase = 'fin';
    this.viderNotes();
    eteindreBoutons();
    // tu gagnes : il s'effondre ; il gagne : clin d'œil de star (jamais la pose du perdant)
    this.poseKedric(gagne ? 'defaite' : 'triche');
    this.poseToi(gagne ? 'haut' : null);
    this.fin(gagne, this.bilan);
  }

  public(n) { this.jauge = Math.max(-100, Math.min(100, this.jauge + n)); }

  // le point de choc du kaméhaméha : plus le public est pour toi, plus ta boule repousse celle de Kédric
  pointChoc() { return LARGEUR / 2 + (this.jauge / 100) * KHAM.portee; }

  // ---------- affichage ----------
  afficher() {
    // le KAMÉHAMÉHA du public : ton faisceau BLEU depuis la gauche, le DORÉ de Kédric depuis la droite,
    // la BOULE BLANCHE pulsante au point de choc — c'est ELLE qui désigne le gagnant
    const g = this.jaugeG; g.clear();
    if (this.phase !== 'intro') {
      const y = KHAM.y, h = KHAM.h;
      const cx = this.pointChoc();
      const puls = 1 + 0.15 * Math.sin(this.T * 9);
      // ton faisceau (bleu) et celui de Kédric (doré)
      g.fillStyle(0x2f8fff, 0.9); g.fillRoundedRect(KHAM.marge, y - h / 2, Math.max(0, cx - KHAM.marge), h, h / 2);
      g.fillStyle(0xffffff, 0.35); g.fillRect(KHAM.marge, y - 2, Math.max(0, cx - KHAM.marge), 4);
      g.fillStyle(0xff9a3c, 0.9); g.fillRoundedRect(cx, y - h / 2, Math.max(0, LARGEUR - KHAM.marge - cx), h, h / 2);
      g.fillStyle(0xffffff, 0.35); g.fillRect(cx, y - 2, Math.max(0, LARGEUR - KHAM.marge - cx), 4);
      // la boule du point de choc (blanche, pulsante) : les impacts PARFAIT / RATÉ la frappent ici
      g.fillStyle(0xffffff, 0.95); g.fillCircle(cx, y, h * 0.85 * puls);
      g.lineStyle(3, 0xffffff, 0.9); g.strokeCircle(cx, y, h * 0.85 * puls + 4);
    }
    // le bandeau d'un round se range tout seul après un moment
    if (this.finBandeau !== null && this.T > this.finBandeau) { this.s.bandeau.setVisible(false); this.finBandeau = null; }
    // Kédric marque le temps : un petit rebond au début de chaque temps de musique
    const f = this.duree ? (this.T / this.duree) % 1 : 1;
    const boum = this.phase === 'intro' ? 0 : Math.max(0, 1 - f * 4);
    if (this.baseKedric && !this.termine) this.kedric.setScale(this.baseKedric.x, this.baseKedric.y * (1 - 0.035 * boum));
    this.afficherCouloirs(boum);
  }

  // les couloirs : fonds sombres, la touche en bas (elle « bat » sur le temps, s'éclaire quand c'est le moment),
  // les flèches qui tombent jusqu'à elle
  afficherCouloirs(boum) {
    const g = this.couloirsG; g.clear();
    const actif = ['annonce', 'jeu', 'fin'].includes(this.phase);
    for (const n of DIRS) this.touchesC[n].setVisible(actif);
    if (!actif) { this.notes.forEach(n => n.objet.setVisible(false)); return; }
    const C = this.c, d = this.duree, w = C.largeur, v = PISTE.vitesse;
    // la prochaine flèche à faire : sa touche s'éclaire (et le bouton du téléphone s'allume)
    let cible = null;
    const i = this.phase === 'jeu' ? this.pas.findIndex(p => p.note === null) : -1;
    if (i >= 0) {
      const dt = this.cible(i) - this.T, reste = Math.abs(dt);
      const couleur = reste <= this.fenetre.parfait ? '#ffffff' : reste <= this.fenetre.bien ? '#3fa7ff' : '#ffd84a';
      // (flèche rouge en CHAMPION : pas d'aide, c'est à toi d'inverser)
      if (dt < d * 1.5 && !this.pas[i].rouge) cible = { nom: this.pas[i].attendu, force: Math.max(0.15, Math.min(1, 1 - dt / (d * 1.5))), couleur };
    }
    for (const n of DIRS) allumerBouton(n, cible && cible.nom === n ? cible.force : 0, cible ? cible.couleur : undefined);
    for (const n of DIRS) {
      const x = C.x[n];
      g.fillStyle(0x000000, 0.45); g.fillRoundedRect(x - w / 2, C.haut, w, C.cibleY - C.haut + w / 2, 14);
      const allume = cible && cible.nom === n;
      const coul = allume ? Phaser.Display.Color.HexStringToColor(cible.couleur).color : Phaser.Display.Color.HexStringToColor(COULEURS[n]).color;
      g.fillStyle(coul, allume ? 0.25 + 0.35 * cible.force : 0.1 + 0.15 * boum); g.fillCircle(x, C.cibleY, w * 0.45);
      g.lineStyle(allume ? 6 : 4, coul, allume ? 1 : 0.8); g.strokeCircle(x, C.cibleY, w * 0.45 + 3 * boum);
      this.touchesC[n].setPosition(x, C.cibleY).setAlpha(allume ? 0.9 : 0.45);
    }
    // des petits traits en travers des couloirs, un par temps de musique (on voit venir le rythme)
    g.lineStyle(2, 0xffffff, 0.22);
    for (let k = Math.ceil(this.T / d); C.cibleY - (k * d - this.T) * v > C.haut; k++) {
      const y = C.cibleY - (k * d - this.T) * v;
      if (y > C.cibleY - w * 0.5) continue;
      for (const [a, b] of [['gauche', 'droite'], ['haut', 'bas']]) g.lineBetween(Math.min(C.x[a], C.x[b]) - w / 2 + 6, y, Math.max(C.x[a], C.x[b]) + w / 2 - 6, y);
    }
    // les flèches : elles tombent dans leur couloir et touchent la touche pile sur leur temps
    for (const n of this.notes) {
      const dt = n.t - this.T, y = C.cibleY - dt * v;
      const visible = y >= C.haut + 10 && dt > -0.3;
      n.objet.setVisible(visible);
      if (!visible) continue;
      n.objet.setPosition(C.x[n.pas.montre], y);
      // passée la touche : elle s'efface
      const efface = dt < 0 ? Math.max(0, 1 + dt / 0.3) : 1;
      n.objet.setAlpha(efface);
      if (!n.pas.note) n.objet.setScale(Math.abs(dt) < 0.1 ? 1.12 : 1);
    }
  }

  // Kédric : une image par pas ; tant que ses images de frime n'existent pas, on prend ses images de danse
  poseKedric(pose) {
    const s = this.s, k = this.kedric;
    const voulue = 'kedric_frime_' + pose;
    let cle = 'kedric_portrait', image = 0, retourne = false, ecrase = 1;
    if (s.estIllustre(voulue)) cle = voulue;
    else if (pose === 'gauche') { cle = 'kedric_danse'; image = 0; }
    else if (pose === 'droite') { cle = 'kedric_danse'; image = 0; retourne = true; }
    else if (pose === 'haut') { cle = 'kedric_danse'; image = 1; }
    else if (pose === 'bas') { cle = 'kedric_danse'; image = 0; ecrase = 0.78; }
    else if (pose === 'defaite') cle = 'kedric_defaite';
    k.setTexture(cle, image).setFlipX(retourne);
    // ses images de frime sont toutes à la même échelle (la plus grande fait 265 px, le grand écart est plus bas) ;
    // les autres : mises à la bonne hauteur
    const z = cle.startsWith('kedric_frime_') ? s.zoom(cle) * KED.hauteur / 265 : (pose === 'defaite' ? 0.85 : 1) * KED.hauteur / k.frame.height;
    this.baseKedric = { x: z, y: z * ecrase };
    k.setScale(z, z * ecrase);
  }

  // Toi (de dos) : une pose par pas ; tant que tes images de frime n'existent pas, on prend tes poses de match
  poseToi(pose) {
    const s = this.s, t = this.toi;
    const voulue = 'kedric_toi_frime_' + pose;
    let cle = 'kedric_toi_course', angle = 0, monte = 0;
    if (pose && s.estIllustre(voulue)) cle = voulue;
    else if (pose === 'gauche') { cle = 'kedric_toi_victoire'; angle = -16; }
    else if (pose === 'droite') { cle = 'kedric_toi_victoire'; angle = 16; }
    else if (pose === 'haut') { cle = 'kedric_toi_saut'; monte = 40; }
    else if (pose === 'bas') cle = 'kedric_toi_rotation';
    t.setTexture(cle, 0).setAngle(angle).setY(TOI.pieds - monte);
    t.setScale(TOI.zoom * s.zoom(cle));
    if (pose) { s.tweens.killTweensOf(t); t.setScale(t.scaleX * 1.08); s.tweens.add({ targets: t, scale: t.scaleX / 1.08, duration: 160 }); }
  }
}
