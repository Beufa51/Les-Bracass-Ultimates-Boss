// =====================================================================
// SHOWTIME : le BATTLE DE DANSE contre Kédric, le boss de fin (façon PaRappa / jeu de rythme).
// D'abord l'ANNONCE : Kédric sur scène (décor kedric_scene) lance le défi et explique les règles.
// Puis chaque manche, en QUESTIONS / RÉPONSES, façon Guitar Hero / jeu de danse : les flèches TOMBENT dans 4 COULOIRS
// (◀ ▶ à gauche, ▲ ▼ à droite) jusqu'à la touche à presser. Sur téléphone, chaque couloir est posé juste au-dessus de
// son bouton (et le bouton à presser s'allume). Kédric fait 4 pas (ses flèches, petites et pâles : il prend la pose
// quand elles arrivent en bas), puis « À TOI ! » : 4 grandes flèches, appuie quand elles arrivent sur la touche ; et on
// recommence. Pas de bips : seulement la musique.
// En CHAMPION seulement (diff.flechesRouges), des FLÈCHES ROUGES : Kédric triche, il faut faire l'INVERSE (◀ ↔ ▶, ▲ ↔ ▼).
// La jauge du PUBLIC fait le tir à la corde : pile sur le temps = le public est pour toi.
// Les pas sont calés sur la musique (kedric_battle) ; chaque manche la reprend à un autre passage. L'horloge de la
// manche suit la musique quand elle joue, sinon le temps du jeu. Toute la logique avance dans maj(dt, touches) (pas de
// minuteries Phaser) : les bots peuvent jouer en accéléré (scene.horlogeJeu = true : la musique est ignorée).
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

export class Showtime {
  // options : { manches: [4, 6, 8], rouges: [0, 1, 1], jauge: -30..30, replique, sousTitre } ;
  // fin(gagne, bilan) appelé à la fin
  constructor(scene, options, fin) {
    this.s = scene; this.o = options; this.fin = fin;
    this.jauge = options.jauge || 0;
    this.manche = -1;
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
    // la jauge du public (tir à la corde), en haut : à gauche Kédric (vert), à droite toi (rouge)
    this.jaugeG = this.ajout(scene.add.graphics().setDepth(P + 4));
    this.etiquettesJauge = [
      texte(scene, LARGEUR / 2 - 290, 30, 'KÉDRIC', 18, '#7fff7f', { fontStyle: 'bold' }),
      texte(scene, LARGEUR / 2 + 290, 30, 'TOI', 18, '#ff7f7f', { fontStyle: 'bold' }),
      texte(scene, LARGEUR / 2, 56, 'PUBLIC', 14, '#ffffff'),
    ].map(t => this.ajout(t.setDepth(P + 4)));
    // les 4 couloirs : le fond, la touche en bas de chacun (un rond et sa flèche), qui joue (au-dessus de chaque paire)
    this.couloirsG = this.ajout(scene.add.graphics().setDepth(P + 5));
    this.touchesC = {};
    for (const n of DIRS) this.touchesC[n] = this.ajout(texte(scene, 0, 0, FLECHES[n], 40, '#ffffff', { fontStyle: 'bold' }).setDepth(P + 5).setAlpha(0.45));
    this.etiquettesTour = [0, 1].map(() => this.ajout(texte(scene, 0, 0, '', 18, '#ffffff', { fontStyle: 'bold', strokeThickness: 6 }).setDepth(P + 7)));
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
    placerMusique(S.musique, S.introMusique);   // sur le refrain
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
      'Kédric fait 4 pas... puis À TOI : les mêmes 4 pas ! Et on recommence.\nLes flèches TOMBENT jusqu\'aux touches : appuie quand elles arrivent en bas, en rythme.' + (estTactile() ? '\nLe bouton à presser S\'ALLUME de plus en plus fort jusqu\'au bon moment.' : '') +
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

  // ---------- une manche : questions / réponses sur un passage de la musique ----------
  //  (en pas de musique depuis le début du passage) 0..annonce-1 : on se prépare ; puis, par groupes de 'phrase' pas :
  //  Kédric fait ses pas, puis toi les mêmes (voir slotKedric / slotToi)
  mancheSuivante() {
    this.manche++;
    const n = this.o.manches[this.manche];
    const seq = [];
    for (let i = 0; i < n; i++) {
      let d;
      do { d = ['gauche', 'droite', 'haut', 'bas'][Math.floor(Math.random() * 4)]; } while (i >= 2 && d === seq[i - 1] && d === seq[i - 2]);
      seq.push(d);
    }
    // flèches rouges (fais l'inverse) : jamais sur le premier pas
    const rouges = new Set();
    const nr = this.s.diff.flechesRouges ? (this.o.rouges || [])[this.manche] || 0 : 0;
    while (rouges.size < Math.min(nr, n - 1)) rouges.add(1 + Math.floor(Math.random() * (n - 1)));
    this.pas = seq.map((d, i) => ({ montre: d, rouge: rouges.has(i), attendu: rouges.has(i) ? INVERSE[d] : d, note: null }));
    // le passage de la musique : la manche commence pile sur un temps fort
    const passage = S.passages[this.manche % S.passages.length];
    this.origine = passage.debut;
    this.duree = passage.temps * S.tempsParPas;   // durée d'un pas (s)
    placerMusique(S.musique, this.origine);
    const fen = this.s.diff.fenetreShow;
    this.fenetre = { parfait: Math.min(S.parfait * fen, this.duree * 0.25), bien: Math.min(S.bien * fen, this.duree * 0.45) };
    this.T = 0; this.phase = 'annonce'; this.dernierPas = -1; this.premierAToi = true;
    this.calculerCouloirs();
    this.creerNotes();
    const titre = `MANCHE ${this.manche + 1} / ${this.o.manches.length} : ${n} PAS, ${S.phrase} PAR ${S.phrase}`;
    this.s.bandeau.setText(nr ? `${titre}  -  FLÈCHE ROUGE = fais l'INVERSE !` : titre).setColor(nr ? '#ff9a9a' : '#ffd84a').setVisible(true);
    this.poseKedric('portrait');
    this.poseToi(null);
  }

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

  // les flèches qui tombent : celles de Kédric (petites et pâles, il les danse), puis les tiennes (grandes, à toi de jouer)
  creerNotes() {
    this.viderNotes();
    this.pas.forEach((p, i) => {
      const demo = texte(this.s, -99, 0, FLECHES[p.montre], 38, p.rouge ? '#ff3030' : COULEURS[p.montre], { fontStyle: 'bold', strokeThickness: 6 }).setDepth(P + 6);
      this.notes.push({ t: this.slotKedric(i) * this.duree, objet: demo, demo: true, pas: p });
      // ta flèche (rouge si Kédric a triché : à toi de faire l'inverse)
      const tienne = texte(this.s, -99, 0, FLECHES[p.montre], 58, p.rouge ? '#ff3030' : COULEURS[p.montre], { fontStyle: 'bold', strokeThickness: 8 }).setDepth(P + 6);
      this.notes.push({ t: this.cible(i), objet: tienne, demo: false, pas: p });
    });
  }

  viderNotes() { this.notes.forEach(n => n.objet.destroy()); this.notes = []; }

  // les pas de musique (slots) du pas i : celui de Kédric, puis le tien une phrase plus tard
  slotKedric(i) { return S.annonce + Math.floor(i / S.phrase) * 2 * S.phrase + i % S.phrase; }
  slotToi(i) { return this.slotKedric(i) + S.phrase; }
  // moment (s depuis le début du passage) de ton pas i
  cible(i) { return this.slotToi(i) * this.duree; }
  // à qui le tour au pas de musique k : 'kedric' ou 'toi'
  tour(k) { return k < S.annonce || (k - S.annonce) % (2 * S.phrase) < S.phrase ? 'kedric' : 'toi'; }

  // l'horloge de la manche : le temps du jeu, recalé sur la musique quand elle joue vraiment
  horloge(dt) {
    this.T += dt;
    if (this.phase === 'bilan' || this.phase === 'intro' || this.s.horlogeJeu) return;
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
      const appui = ['gauche', 'droite', 'haut', 'bas'].some(k => e[k]);
      if ((appui && this.T >= S.introMini) || this.T >= S.intro) {
        this.viderAnnonce();
        this.etiquettesJauge.forEach(t => t.setVisible(true));
        this.mancheSuivante();
      }
      this.afficher();
      return;
    }
    const d = this.duree, n = this.pas.length, k = Math.floor(this.T / d);   // k : numéro du pas de musique en cours
    if (k > this.dernierPas) { this.dernierPas = k; this.surLeTemps(k); }
    if (this.phase === 'annonce' && k >= S.annonce) { this.phase = 'jeu'; this.s.bandeau.setVisible(false); }
    if (this.phase === 'jeu') {
      for (const t of ['gauche', 'droite', 'haut', 'bas']) if (e[t]) this.appui(t);
      for (let i = 0; i < n; i++) {
        const p = this.pas[i];
        if (p.note === null && this.T > this.cible(i) + this.fenetre.bien) this.noter(i, 'rate');
      }
      if (!this.termine && this.pas.every(p => p.note !== null) && this.T > this.cible(n - 1) + d * 0.5) this.finManche();
    } else if (this.phase === 'bilan') {
      if (this.T >= this.finBilan) this.mancheSuivante();
    }
    this.afficher();
  }

  // à chaque pas de musique : le décompte 3, 2, 1 ; Kédric fait son pas ; ou il te tend le micro
  surLeTemps(k) {
    if (this.phase === 'annonce' && k >= S.annonce - 3 && k < S.annonce) {
      onomatopee(this.s, KED.x + 230, 300, String(S.annonce - k), 44, '#ffd84a');
      return;
    }
    if (k < S.annonce || this.phase !== 'jeu' && this.phase !== 'annonce') return;
    const i = this.pas.findIndex((p, j) => this.slotKedric(j) === k);
    if (i >= 0) {
      // Kédric fait son pas (sa flèche arrive en bas) ; flèche rouge : il triche (clin d'œil)
      const p = this.pas[i];
      this.poseKedric(p.rouge ? 'triche' : p.montre);
      this.public(-S.kedricParPas);
    } else if (this.tour(k) === 'toi' && this.tour(k - 1) === 'kedric') {
      // il te tend le micro : à toi !
      this.poseKedric('micro');
      if (this.premierAToi) { this.premierAToi = false; onomatopee(this.s, KED.x, 150, 'À TOI !', 54, '#ffffff'); }
    }
  }

  appui(t) {
    // le prochain pas pas encore noté, s'il est assez proche dans le temps
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
    const n = this.notes.find(o => !o.demo && o.pas === p);
    // le message au-dessus de la touche du pas
    const xc = this.c.x[p.attendu];
    this.retour.setPosition(Phaser.Math.Clamp(xc, 90, LARGEUR - 90), this.c.cibleY - this.c.largeur * 0.5 - 30);
    if (note === 'parfait') { this.bilan.parfaits++; this.public(S.gain.parfait); this.retour.setText('PARFAIT !').setColor('#7fe8ff'); lignesImpact(this.s, xc, this.c.cibleY, 0x9fe0ff, 10, 70); }
    else if (note === 'bien') { this.bilan.bien++; this.public(S.gain.bien); this.retour.setText('BIEN !').setColor('#7fff7f'); }
    else { this.bilan.rates++; this.public(-S.gain.rate); this.retour.setText(p.rouge ? 'RATÉ ! (l\'inverse !)' : 'RATÉ !').setColor('#ff6b6b'); this.poseKedric('haut'); }
    this.s.tweens.killTweensOf(this.retour); this.retour.setAlpha(1).setScale(1.2);
    this.s.tweens.add({ targets: this.retour, scale: 1, duration: 120 });
    if (n) { n.note = note; n.objet.setColor(note === 'rate' ? '#ff6b6b' : note === 'parfait' ? '#7fe8ff' : '#7fff7f'); }
    // public tout à Kédric : perdu tout de suite (sinon on joue toutes les manches, pour le spectacle)
    if (this.jauge <= -100) this.terminer(false);
  }

  finManche() {
    if (this.manche >= this.o.manches.length - 1) { this.terminer(this.jauge > 0); return; }
    this.phase = 'bilan'; this.finBilan = this.T + S.pause;
    eteindreBoutons();
    this.poseKedric(this.jauge > 0 ? 'haut' : 'portrait');
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

  // ---------- affichage ----------
  afficher() {
    // jauge du public
    const g = this.jaugeG; g.clear();
    if (this.phase !== 'intro') {
      const x0 = LARGEUR / 2 - 240, w = 480, y = 22, h = 18;
      g.fillStyle(0x000000, 0.5); g.fillRect(x0 - 4, y - 4, w + 8, h + 8);
      g.fillStyle(0x1d8a4a, 1); g.fillRect(x0, y, w, h);
      g.fillStyle(0xc8202c, 1); g.fillRect(x0 + w / 2 - (this.jauge / 100) * w / 2, y, w / 2 + (this.jauge / 100) * w / 2, h);
      g.fillStyle(0xffffff, 1); g.fillRect(x0 + w / 2 - (this.jauge / 100) * w / 2 - 2, y - 5, 4, h + 10);
      g.lineStyle(2, 0xffffff, 0.8); g.strokeRect(x0, y, w, h);
    }
    // Kédric marque le temps : un petit rebond au début de chaque pas de musique
    const f = this.duree ? (this.T / this.duree) % 1 : 1;
    const boum = this.phase === 'intro' ? 0 : Math.max(0, 1 - f * 4);
    if (this.baseKedric && !this.termine) this.kedric.setScale(this.baseKedric.x, this.baseKedric.y * (1 - 0.035 * boum));
    this.afficherCouloirs(boum);
  }

  // les couloirs : fonds sombres, la touche en bas (elle « bat » sur le temps, s'éclaire quand c'est le moment),
  // les flèches qui tombent jusqu'à elle
  afficherCouloirs(boum) {
    const g = this.couloirsG; g.clear();
    const actif = ['annonce', 'jeu', 'bilan'].includes(this.phase);
    this.etiquettesTour.forEach(t => t.setVisible(actif));
    for (const n of DIRS) this.touchesC[n].setVisible(actif);
    if (!actif) { this.notes.forEach(n => n.objet.setVisible(false)); return; }
    const C = this.c, d = this.duree, w = C.largeur, v = PISTE.vitesse;
    const aToi = this.phase === 'jeu' && this.tour(Math.floor(this.T / d + 0.5)) === 'toi';
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
    // des petits traits en travers des couloirs, un par pas de musique (on voit venir le rythme)
    g.lineStyle(2, 0xffffff, 0.22);
    for (let k = Math.ceil(this.T / d); C.cibleY - (k * d - this.T) * v > C.haut; k++) {
      const y = C.cibleY - (k * d - this.T) * v;
      if (y > C.cibleY - w * 0.5) continue;
      for (const [a, b] of [['gauche', 'droite'], ['haut', 'bas']]) g.lineBetween(Math.min(C.x[a], C.x[b]) - w / 2 + 6, y, Math.max(C.x[a], C.x[b]) + w / 2 - 6, y);
    }
    // qui joue : au-dessus de chaque paire de couloirs
    const libelle = aToi ? 'À TOI !' : this.phase === 'bilan' ? '' : 'KÉDRIC';
    [['gauche', 'droite'], ['haut', 'bas']].forEach(([a, b], k) =>
      this.etiquettesTour[k].setPosition((C.x[a] + C.x[b]) / 2, C.haut - 14).setText(libelle).setColor(aToi ? '#ffd84a' : '#7fff7f'));
    // les flèches : elles tombent dans leur couloir et touchent la touche pile sur leur temps
    for (const n of this.notes) {
      const dt = n.t - this.T, y = C.cibleY - dt * v;
      const visible = y >= C.haut + 10 && dt > -0.3;
      n.objet.setVisible(visible);
      if (!visible) continue;
      n.objet.setPosition(C.x[n.pas.montre], y);
      // passée la touche : elle s'efface ; celles de Kédric sont plus petites et plus pâles
      const efface = dt < 0 ? Math.max(0, 1 + dt / 0.3) : 1;
      n.objet.setAlpha((n.demo ? 0.6 : 1) * efface);
      if (!n.note) n.objet.setScale(Math.abs(dt) < 0.1 ? 1.12 : 1);
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
