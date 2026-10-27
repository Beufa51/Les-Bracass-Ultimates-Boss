// =====================================================================
// SHOWTIME : le BATTLE DE DANSE contre Kédric, le boss de fin (façon PaRappa / jeu de rythme).
// D'abord l'ANNONCE : Kédric sur scène (décor kedric_scene) lance le défi et explique les règles.
// Puis chaque manche : les flèches glissent sur une PISTE vers un cercle. Les premières sont celles de Kédric : quand
// elles arrivent dans le cercle, il fait le pas (une pose, un son). Puis il te tend le micro : « À TOI ! » ; les mêmes
// flèches reviennent, et tu appuies (◀ ▶ ▲ ▼) quand elles arrivent dans le cercle. Pas besoin de retenir la suite.
// Une FLÈCHE ROUGE : Kédric triche, il faut faire l'INVERSE (◀ ↔ ▶, ▲ ↔ ▼) ; en FACILE et NORMAL, ta piste montre
// déjà la flèche retournée (diff.aideRouge).
// La jauge du PUBLIC fait le tir à la corde : pile sur le temps = le public est pour toi.
// Les pas sont calés sur la musique (kedric_battle) ; chaque manche la reprend à un autre passage. L'horloge de la
// manche suit la musique quand elle joue, sinon le temps du jeu. Toute la logique avance dans maj(dt, touches) (pas de
// minuteries Phaser) : les bots peuvent jouer en accéléré (scene.horlogeJeu = true : la musique est ignorée).
// =====================================================================
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { texte } from '../../core/ui.js';
import { jouerSon } from '../../core/ressources.js';
import { jouerMusique, arreterMusique, placerMusique, tempsMusique } from '../../core/musique.js';
import { dispositionDanse } from '../../core/tactile.js';
import { onomatopee, lignesImpact } from './effets.js';
import { REGLAGES as R } from './reglages.js';

const S = R.showtime;
const PISTE = S.piste;
const FLECHES = { gauche: '◀', droite: '▶', haut: '▲', bas: '▼' };
const COULEURS = { gauche: '#3fa7ff', droite: '#ff9a3c', haut: '#ffd84a', bas: '#d9a0ff' };
const INVERSE = { gauche: 'droite', droite: 'gauche', haut: 'bas', bas: 'haut' };
const SON = { gauche: 0.9, droite: 1.1, haut: 1.3, bas: 0.75 };   // une note par direction
const P = 600;   // profondeur d'affichage (au-dessus du terrain et du HUD, sous les encarts)
// sur scène : Kédric en grand, debout sur l'estrade ; toi de dos, au premier plan à gauche
const KED = { x: 480, pieds: 392, hauteur: 335 };
const TOI = { x: 205, pieds: HAUTEUR + 24, zoom: 1.3 };

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
    this.flecheKedric = this.ajout(texte(scene, 735, 190, '', 130, '#ffffff', { fontStyle: 'bold', strokeThickness: 14 }).setDepth(P + 4));
    // la jauge du public (tir à la corde), en haut : à gauche Kédric (vert), à droite toi (rouge)
    this.jaugeG = this.ajout(scene.add.graphics().setDepth(P + 4));
    this.etiquettesJauge = [
      texte(scene, LARGEUR / 2 - 290, 30, 'KÉDRIC', 18, '#7fff7f', { fontStyle: 'bold' }),
      texte(scene, LARGEUR / 2 + 290, 30, 'TOI', 18, '#ff7f7f', { fontStyle: 'bold' }),
      texte(scene, LARGEUR / 2, 56, 'PUBLIC', 14, '#ffffff'),
    ].map(t => this.ajout(t.setDepth(P + 4)));
    // la piste des flèches (en bas) et son cercle
    this.pisteG = this.ajout(scene.add.graphics().setDepth(P + 5));
    this.etiquettePiste = this.ajout(texte(scene, PISTE.x, PISTE.y - 66, '', 20, '#ffffff', { fontStyle: 'bold', strokeThickness: 6 }).setDepth(P + 7));
    this.retour = this.ajout(texte(scene, LARGEUR / 2 + 60, 405, '', 32, '#ffffff', { fontStyle: 'bold', strokeThickness: 8 }).setDepth(P + 7));
    // la musique du battle (celle du match s'arrête) ; gros boutons tactiles (rangés pendant la pause)
    arreterMusique('kedric_musique');
    jouerMusique(scene, S.musique);
    dispositionDanse(true);
    this.surPause = () => dispositionDanse(false);
    this.surReprise = () => dispositionDanse(true);
    scene.events.on('pause', this.surPause); scene.events.on('resume', this.surReprise);
    this.annonce();
  }

  ajout(o) { this.el.push(o); return o; }

  detruire() {
    this.el.forEach(o => o.destroy()); this.viderNotes(); this.viderAnnonce(); this.el = [];
    this.s.events.off('pause', this.surPause); this.s.events.off('resume', this.surReprise);
    dispositionDanse(false);
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
    const regles = texte(s, LARGEUR / 2, HAUTEUR - 92,
      'Kédric danse... puis il te tend le micro : À TOI !\nAppuie sur la flèche quand elle arrive dans le CERCLE, en rythme.\nFLÈCHE ROUGE = Kédric triche : fais l\'INVERSE !', 19, '#ffffff', { align: 'center', lineSpacing: 6 }).setDepth(P + 10);
    this.invite = texte(s, LARGEUR / 2, HAUTEUR - 22, 'Appuie sur une flèche quand tu es prêt !', 20, '#7fff7f', { fontStyle: 'bold' }).setDepth(P + 10).setAlpha(0);
    this.elAnnonce = [voile, titre, sous, bulle, regles, this.invite];
    jouerSon(s, 'kedric_touchdown', { volume: 0.7 });
    jouerSon(s, 'kedric_foule', { volume: 0.8 });
  }

  viderAnnonce() {
    if (!this.elAnnonce) return;
    this.elAnnonce.forEach(o => { this.s.tweens.killTweensOf(o); o.destroy(); });
    this.elAnnonce = null;
  }

  // ---------- une manche : Kédric montre, puis toi, sur un passage de la musique ----------
  //  (en pas depuis le début du passage) 0..annonce-1 : on se prépare ; annonce + i : Kédric fait son pas i ;
  //  annonce + n : il tend le micro ; annonce + n + 1 + i : ton pas i
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
    const nr = (this.o.rouges || [])[this.manche] || 0;
    while (rouges.size < Math.min(nr, n - 1)) rouges.add(1 + Math.floor(Math.random() * (n - 1)));
    this.pas = seq.map((d, i) => ({ montre: d, rouge: rouges.has(i), attendu: rouges.has(i) ? INVERSE[d] : d, note: null }));
    // le passage de la musique : la manche commence pile sur un temps fort
    const passage = S.passages[this.manche % S.passages.length];
    this.origine = passage.debut;
    this.duree = passage.temps * S.tempsParPas;   // durée d'un pas (s)
    placerMusique(S.musique, this.origine);
    const fen = this.s.diff.fenetreShow;
    this.fenetre = { parfait: Math.min(S.parfait * fen, this.duree * 0.25), bien: Math.min(S.bien * fen, this.duree * 0.45) };
    this.T = 0; this.phase = 'annonce'; this.iMontre = -1; this.dernierPas = -1;
    this.creerNotes();
    const titre = `MANCHE ${this.manche + 1} / ${this.o.manches.length} : ${n} PAS`;
    this.s.bandeau.setText(nr ? `${titre}  -  FLÈCHE ROUGE = fais l'INVERSE !` : titre).setColor(nr ? '#ff9a9a' : '#ffd84a').setVisible(true);
    this.poseKedric('portrait');
    this.poseToi(null);
  }

  // les flèches de la piste : celles de Kédric (petites, il les danse), puis les tiennes (grandes, à toi de jouer)
  creerNotes() {
    this.viderNotes();
    const aide = this.s.diff.aideRouge;
    this.pas.forEach((p, i) => {
      const demo = texte(this.s, -99, PISTE.y, FLECHES[p.montre], 44, p.rouge ? '#ff3030' : COULEURS[p.montre], { fontStyle: 'bold', strokeThickness: 6 }).setDepth(P + 6);
      this.notes.push({ t: (S.annonce + i) * this.duree, objet: demo, demo: true, pas: p });
      // ta flèche : celle à faire (déjà retournée si aideRouge), cerclée de rouge si Kédric a triché
      const dir = p.rouge && aide ? p.attendu : p.montre;
      const tienne = texte(this.s, -99, PISTE.y, FLECHES[dir], 60, p.rouge && !aide ? '#ff3030' : COULEURS[dir], { fontStyle: 'bold', strokeThickness: 8 }).setDepth(P + 6);
      this.notes.push({ t: this.cible(i), objet: tienne, demo: false, pas: p });
    });
  }

  viderNotes() { this.notes.forEach(n => n.objet.destroy()); this.notes = []; }

  // moment (s depuis le début du passage) de ton pas i
  cible(i) { return (S.annonce + this.pas.length + 1 + i) * this.duree; }

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
    if (this.phase === 'annonce') {
      if (k >= S.annonce) { this.phase = 'montre'; this.s.bandeau.setVisible(false); }
    }
    if (this.phase === 'montre') {
      // Kédric fait un pas à chaque temps (sa flèche arrive dans le cercle)
      const i = k - S.annonce;
      if (i > this.iMontre && i < n) {
        this.iMontre = i;
        const p = this.pas[i];
        this.poseKedric(p.rouge ? 'triche' : p.montre);   // flèche rouge : il triche (clin d'œil)
        this.flecheKedric.setText(FLECHES[p.montre]).setColor(p.rouge ? '#ff3030' : COULEURS[p.montre]).setScale(1.3);
        this.s.tweens.add({ targets: this.flecheKedric, scale: 1, duration: 150 });
        jouerSon(this.s, 'kedric_alerte', { rate: SON[p.montre], volume: 0.9 });
        this.public(-S.kedricParPas);
      }
      if (i >= n) {
        // il te tend le micro : à toi !
        this.phase = 'toi';
        this.flecheKedric.setText('');
        this.poseKedric('micro');
        onomatopee(this.s, KED.x, 150, 'À TOI !', 54, '#ffffff');
        jouerSon(this.s, 'kedric_niveau');
      }
    } else if (this.phase === 'toi') {
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

  // à chaque pas de musique : pendant l'attente, le décompte 3, 2, 1
  surLeTemps(k) {
    if (this.phase === 'annonce' && k >= S.annonce - 3 && k < S.annonce) {
      onomatopee(this.s, KED.x + 230, 300, String(S.annonce - k), 44, '#ffd84a');
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
    if (note === 'parfait') { this.bilan.parfaits++; this.public(S.gain.parfait); jouerSon(this.s, 'kedric_parfait', { rate: SON[p.attendu] }); this.retour.setText('PARFAIT !').setColor('#7fe8ff'); lignesImpact(this.s, PISTE.x, PISTE.y, 0x9fe0ff, 10, 80); }
    else if (note === 'bien') { this.bilan.bien++; this.public(S.gain.bien); jouerSon(this.s, 'kedric_esquive', { rate: SON[p.attendu] }); this.retour.setText('BIEN !').setColor('#7fff7f'); }
    else { this.bilan.rates++; this.public(-S.gain.rate); jouerSon(this.s, 'kedric_alerte', { rate: 0.5 }); this.retour.setText(p.rouge ? 'RATÉ ! (flèche rouge = l\'inverse)' : 'RATÉ !').setColor('#ff6b6b'); this.poseKedric('haut'); }
    this.s.tweens.killTweensOf(this.retour); this.retour.setAlpha(1).setScale(1.2);
    this.s.tweens.add({ targets: this.retour, scale: 1, duration: 120 });
    if (n) { n.note = note; n.objet.setColor(note === 'rate' ? '#ff6b6b' : note === 'parfait' ? '#7fe8ff' : '#7fff7f'); }
    // public tout à Kédric : perdu tout de suite (sinon on joue toutes les manches, pour le spectacle)
    if (this.jauge <= -100) this.terminer(false);
  }

  finManche() {
    if (this.manche >= this.o.manches.length - 1) { this.terminer(this.jauge > 0); return; }
    this.phase = 'bilan'; this.finBilan = this.T + S.pause;
    this.poseKedric(this.jauge > 0 ? 'haut' : 'portrait');
  }

  terminer(gagne) {
    if (this.termine) return;
    this.termine = true;
    this.phase = 'fin';
    this.viderNotes();
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
    this.afficherPiste(boum);
  }

  // la piste : une bande sombre, le cercle à gauche (il « bat » sur le temps), les flèches qui glissent vers lui
  afficherPiste(boum) {
    const c = this.pisteG; c.clear();
    const actif = ['annonce', 'montre', 'toi', 'bilan'].includes(this.phase);
    this.etiquettePiste.setVisible(actif);
    if (!actif) { this.notes.forEach(n => n.objet.setVisible(false)); return; }
    const aToi = this.phase === 'toi';
    c.fillStyle(0x000000, 0.55); c.fillRoundedRect(PISTE.x - 56, PISTE.y - 46, PISTE.fin - PISTE.x + 90, 92, 46);
    // le cercle : bleu quand ta flèche est dans la fenêtre, blanc pile au bon moment
    let couleur = aToi ? 0xffffff : 0x7fff7f;
    const i = aToi ? this.pas.findIndex(p => p.note === null) : -1;
    if (i >= 0) {
      const reste = Math.abs(this.cible(i) - this.T);
      couleur = reste <= this.fenetre.parfait ? 0xffffff : reste <= this.fenetre.bien ? 0x3fa7ff : 0xffd84a;
    }
    c.fillStyle(couleur, 0.18 + 0.2 * boum); c.fillCircle(PISTE.x, PISTE.y, 42);
    c.lineStyle(6, couleur, 1); c.strokeCircle(PISTE.x, PISTE.y, 42 + 5 * boum);
    // des petits traits sur la piste, un par pas de musique (on voit venir le rythme)
    const d = this.duree;
    c.lineStyle(2, 0xffffff, 0.25);
    for (let k = Math.ceil(this.T / d); (k * d - this.T) * PISTE.vitesse + PISTE.x < PISTE.fin + 20; k++) {
      const x = PISTE.x + (k * d - this.T) * PISTE.vitesse;
      if (x > PISTE.x + 44) c.lineBetween(x, PISTE.y - 30, x, PISTE.y + 30);
    }
    this.etiquettePiste.setText(aToi ? 'À TOI !' : this.phase === 'montre' || this.phase === 'annonce' ? 'KÉDRIC' : '').setColor(aToi ? '#ffd84a' : '#7fff7f');
    // les flèches : elles arrivent de la droite et touchent le cercle pile sur leur temps
    for (const n of this.notes) {
      const dt = n.t - this.T, x = PISTE.x + dt * PISTE.vitesse;
      const visible = x <= PISTE.fin + 30 && dt > -0.35;
      n.objet.setVisible(visible);
      if (!visible) continue;
      n.objet.setX(x);
      // passée le cercle : elle s'efface ; celles de Kédric sont plus petites et plus pâles
      const efface = dt < 0 ? Math.max(0, 1 + dt / 0.35) : 1;
      n.objet.setAlpha((n.demo ? 0.75 : 1) * efface);
      if (!n.note) n.objet.setScale(Math.abs(dt) < 0.12 ? 1.15 : 1);
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
