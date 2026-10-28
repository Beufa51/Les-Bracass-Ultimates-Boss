// =====================================================================
// SHOWTIME : le BATTLE DE DANSE contre Kédric, le boss de fin (façon DDR / jeu de danse).
// Une SEULE SESSION CONTINUE d'UNE MINUTE : la musique (kedric_battle) démarre sur le refrain
// à l'annonce et n'est JAMAIS REPLACÉE — pas de coupure, et elle s'ARRÊTE à la fin du battle.
// Les flèches TOMBENT dans 4 COULOIRS (◀ ▶ à gauche, ▲ ▼ à droite) jusqu'à la touche à
// presser, PILE SUR LE RYTHME (une flèche tous les 'tempsParPas' temps ~0,69 s).
// Kédric danse AVEC TOI et il triche comme une vraie star :
//  - le GEL : il GLACE LE PLANCHER, tu ne peux plus appuyer quelques secondes
//    pendant que les flèches continuent de tomber (2 fois, 3 en CHAMPION) ;
//  - le SOLO : quand tu approaches la victoire, il fait un SOLO qui draine le public —
//    contre-attaque : tes PARFAITS rapportent DOUBLE pendant son solo ;
//  - la COUPURE DE COURANT : les projecteurs s'éteignent, on ne voit les flèches
//    qu'au dernier moment (juste avant la touche) ;
//  - les FLÈCHES DOUBLÉES : dans les 15 dernières secondes, deux flèches à la fois ! ;
//  - le COMBO : 5 PARFAITS d'affilée et la foule est à toi (gains x1,5 pendant 10 s).
// En CHAMPION (diff.flechesRouges), tout est encore plus corsé : 3 gels, solo déclenché
// dès +40, flèches rouges bien plus fréquentes.
// La jauge du public est un KAMÉHAMÉHA père-fils : ton faisceau BLEU à gauche, le DORÉ de
// Kédric à droite ; la BOULE BLANCHE du point de CHOC se repousse selon PARFAIT / BIEN /
// RATÉ — c'est elle qui désigne le gagnant (jauge > 0 à la fin = victoire, -100 = perdu).
// Chaque appui a un RETOUR FRAPPANT : vibration (si le téléphone le permet), flash plein
// écran, secousse de caméra et la touche qui éclate — impossible de douter d'avoir réussi.
// L'horloge de la session suit la musique par un temps MONOTONE (les tours de boucle de la
// piste s'additionnent : le temps ne recule jamais). Toute la logique avance dans
// maj(dt, touches) (pas de minuteries Phaser) : les bots peuvent jouer en accéléré.
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
// le KAMÉHAMÉHA du public, en haut : ton faisceau (bleu) part de la gauche, celui de Kédric (doré) de la droite
const KHAM = { y: 36, h: 18, marge: 170, portee: 280 };
// la coupure de courant : dans le noir, on ne voit une flèche que dans ses 'visibilite' dernières secondes
const NOIR = { visibilite: 0.55 };

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
    // le flash plein écran du feedback d'appui (bleu-blanc = réussi, rouge = raté)
    this.flash = this.ajout(scene.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, HAUTEUR, 0xffffff, 0).setDepth(P + 9));
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
    voile.fillStyle(0x000000, 0.6); voile.fillRect(0, HAUTEUR - 170, LARGEUR, 170);
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
    const regles = texte(s, LARGEUR / 2, HAUTEUR - 104,
      'UNE MINUTE CHRONO : Kédric danse avec toi, garde la boule du public de TON côté !\n' +
      'Les flèches TOMBENT en rythme : appuie quand elles arrivent en bas.' +
      (estTactile() ? '\nLe bouton à presser S\'ALLUME de plus en plus fort jusqu\'au bon moment.' : '') +
      '\nKédric est une star, il TRICHE : plancher GLACÉ, coupure de projecteurs, flèches DOUBLÉES\nen fin de battle... et un SOLO quand il sent qu\'il va perdre !' +
      (this.s.diff.flechesRouges ? '\nFLÈCHE ROUGE = fais l\'INVERSE !' : ''), 17, '#ffffff', { align: 'center', lineSpacing: 6 }).setDepth(P + 10);
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
  demarrer() {
    this.viderAnnonce();
    this.etiquettesJauge.forEach(t => t.setVisible(true));
    const m = tempsMusique(S.musique);
    this.suiviMusique = null; this.tempsMusical = 0; this.dureePiste = null;   // suivi musical monotone (horloge)
    this.origine = m === null ? S.introMusique : m;   // le temps musical courant (jamais de re-placement)
    this.T = 0;
    this.duree = S.tempo.temps * S.tempsParPas;   // durée entre deux flèches (~0,69 s), calée sur la musique
    const fen = this.s.diff.fenetreShow;
    this.fenetre = { parfait: Math.min(S.parfait * fen, this.duree * 0.25), bien: Math.min(S.bien * fen, this.duree * 0.45) };
    // en CHAMPION, tout est corsé : 3 gels, solo dès +40, flèches rouges presque 2x plus fréquentes
    const champ = !!this.s.diff.flechesRouges;
    this.eff = { pieges: champ ? 3 : S.piege.nombre, seuilSolo: champ ? 40 : S.solo.seuil, rouge: champ ? S.rougeChance * 1.8 : S.rougeChance };
    this.parRound = Math.floor(S.dureeRound / this.duree);   // ~87 flèches par round
    this.genererPas();   // toutes les flèches du battle (pièges, doublées...), d'un coup
    this.phase = 'annonce'; this.dernierPas = -1; this.finBandeau = null;
    this.gel = 0; this.soloFait = false; this.soloJusqua = 0;
    this.noir = 0; this.comboJusqua = 0; this.consecParfaits = 0; this.doublesAnnonces = false;
    // les coupures de courant : déclenchées à deux moments du battle (pas tout au début ni à la toute fin)
    this.noirs = [0.35, 0.72].map(f => Math.floor((S.annonce + this.parRound * f)) * this.duree);
    this.calculerCouloirs();
    this.creerNotes();
    this.s.bandeau.setText(S.rounds > 1 ? `ROUND 1 / ${S.rounds} : DANSE AVEC KÉDRIC !` : 'DANSE AVEC KÉDRIC : UNE MINUTE CHRONO !').setColor('#ffd84a').setVisible(true);
    this.poseKedric('portrait');
    this.poseToi(null);
  }

  // toutes les flèches du battle, calées sur la grille des temps forts de la musique.
  //  - flèche rouge (fais l'inverse) : par probabilité, jamais sur la toute première ;
  //  - GEL : quelques flèches pièges au milieu du battle → Kédric glace le plancher juste avant ;
  //  - DOUBLÉES : dans les 'S.double.duree' dernières secondes, une flèche sur deux arrive en double.
  genererPas() {
    this.pas = [];
    let prec = null, prec2 = null;
    const n = this.parRound * S.rounds;
    const debutDoubles = (S.annonce + n) * this.duree - S.double.duree;
    for (let j = 0; j < n; j++) {
      const t = (S.annonce + j) * this.duree;
      const ajoute = (montre, t, slot, double = false) => {
        const rouge = this.s.diff.flechesRouges && slot > 0 && Math.random() < this.eff.rouge;
        this.pas.push({ montre, rouge, attendu: rouge ? INVERSE[montre] : montre, note: null, t, slot, piege: false, declenche: false, double });
      };
      let d;
      do { d = DIRS[Math.floor(Math.random() * 4)]; } while (j >= 2 && d === prec && d === prec2);
      ajoute(d, t, j);
      // DOUBLÉE : dans la dernière ligne droite, une flèche sur deux tombe en DEUX exemplaires
      if (t >= debutDoubles && j % 2 === 0 && t < (S.annonce + n) * this.duree - 1.5) {
        let e;
        do { e = DIRS[Math.floor(Math.random() * 4)]; } while (e === d);
        ajoute(e, t, j, true);
      }
      prec2 = prec; prec = d;
    }
    // les pièges (GEL) : répartis au hasard dans le milieu du battle, bien séparés entre eux
    const pieges = new Set();
    while (pieges.size < Math.min(this.eff.pieges, n - 10)) {
      const j = 6 + Math.floor(Math.random() * (n - 12));
      if (![...pieges].every(p => Math.abs(p - j) >= 8)) continue;
      pieges.add(j);
    }
    for (const j of pieges) this.pas.filter(p => p.slot === j).forEach(p => p.piege = true);
    // la première flèche doublée : pour l'annoncer à l'écran
    const premDouble = this.pas.filter((p, i) => this.pas.findIndex(q => q.t === p.t) !== i);
    this.tPremDouble = premDouble.length ? Math.min(...premDouble.map(p => p.t)) : null;
  }

  // moment (s depuis le début de la session) de la flèche i
  cible(i) { return this.pas[i].t; }

  // Les couloirs : sur téléphone, juste au-dessus des boutons ◀ ▶ ▲ ▼ (la flèche tombe jusqu'à la touche à presser)
  calculerCouloirs() {
    this.c = COULOIRS;
    const ecran = this.s.game.canvas.getBoundingClientRect();
    const rects = DIRS.map(n => rectBouton(n));
    if (!ecran.width || !rects.every(r => r)) return;
    const kx = LARGEUR / ecran.width, ky = HAUTEUR / ecran.height;
    const largeur = Math.min(110, Math.min(...rects.map(r => r.width * kx)) * 0.8);
    const x = {};
    DIRS.forEach((n, i) => { x[n] = Phaser.Math.Clamp((rects[i].left + rects[i].width / 2 - ecran.left) * kx, largeur / 2 + 4, LARGEUR - largeur / 2 - 4); });
    const hautBoutons = Math.min(...rects.map(r => (r.top - ecran.top) * ky));
    this.c = { x, cibleY: Phaser.Math.Clamp(hautBoutons - largeur * 0.5, 240, 470), largeur, haut: 84 };
  }

  // les flèches qui tombent : à toi de jouer (Kédric danse avec toi, il ne démontre plus)
  creerNotes() {
    this.viderNotes();
    this.pas.forEach((p, i) => {
      const tienne = texte(this.s, -99, 0, FLECHES[p.montre], p.double ? 50 : 58, p.rouge ? '#ff3030' : COULEURS[p.montre], { fontStyle: 'bold', strokeThickness: 8 }).setDepth(P + 6);
      this.notes.push({ t: p.t, objet: tienne, pas: p });
    });
  }

  viderNotes() { this.notes.forEach(n => n.objet.destroy()); this.notes = []; }

  // l'horloge de la session : le temps du jeu, recalé sur la musique quand elle joue vraiment.
  // La piste du battle est en BOUCLE : quand elle reboucle, son temps de lecture repart du début ;
  // on suit donc une horloge musicale MONOTONE (les tours de boucle s'additionnent), le temps de la
  // session ne recule JAMAIS (c'est ce qui figeait les flèches au milieu du battle).
  horloge(dt) {
    this.T += dt;
    if (this.phase === 'intro' || this.phase === 'fin' || this.s.horlogeJeu) return;
    const m = tempsMusique(S.musique);
    if (m === null) return;   // musique en pause / en chargement : le temps du jeu avance seul
    if (this.suiviMusique === null) { this.suiviMusique = m; this.tempsMusical = m; }
    let d = m - this.suiviMusique;
    if (d < -1) {   // la lecture a sauté en arrière : REBOUCLEMENT de la piste (elle était arrivée au bout)
      if (!this.dureePiste) this.dureePiste = Math.max(1, this.suiviMusique);   // là où elle était arrivée ≈ sa durée
      if (Math.abs(this.suiviMusique - this.dureePiste) < 2) d += this.dureePiste;   // oui, c'est bien un tour de boucle
      else d = 0;   // non (onglet caché, reprise de lecture) : on ignore le saut
    }
    this.suiviMusique = m;
    this.tempsMusical += d;   // le temps musical CONTINU (rebouclé, il ne revient jamais en arrière)
    const ecart = (this.tempsMusical - this.origine) - this.T;
    if (Math.abs(ecart) <= 0.12) this.T += ecart * 0.1;        // petit décalage : en douceur
    else if (ecart > 0) this.T += ecart;                       // la musique a pris de l'avance : on se cale d'un coup
    else this.T += ecart * 0.05;                               // elle a pris du retard (onglet caché) : on rattrape en douceur
  }

  // le GEL est-il en cours (le plancher est glacé : plus aucun appui possible) ?
  gele() { return this.gel > this.T; }
  // le SOLO de Kédric est-il en cours ?
  solo() { return this.soloJusqua > this.T; }
  // la coupure de courant est-elle en cours ?
  noirOn() { return this.noir > this.T; }
  // la foule est-elle à toi (combo de PARFAITS) ?
  combo() { return this.comboJusqua > this.T; }

  // un bandeau d'évènement qui se range tout seul
  bandeau(txt, couleur, duree = 2.5) {
    this.s.bandeau.setText(txt).setColor(couleur).setVisible(true);
    this.finBandeau = this.T + duree;
  }

  // ---------- la boucle ----------
  maj(dt, e) {
    if (this.termine) { this.afficher(); return; }
    this.horloge(dt);
    if (this.phase === 'intro') {
      if (this.T >= S.introMini && this.invite.alpha === 0) this.s.tweens.add({ targets: this.invite, alpha: { from: 1, to: 0.35 }, duration: 500, yoyo: true, repeat: -1 });
      const appui = DIRS.some(k => e[k]);
      if ((appui && this.T >= S.introMini) || this.T >= S.intro) this.demarrer();
      this.afficher();
      return;
    }
    const d = this.duree, n = this.pas.length, k = Math.floor(this.T / d);
    if (k > this.dernierPas) { this.dernierPas = k; this.surLeTemps(k); }
    if (this.phase === 'annonce' && k >= S.annonce) { this.phase = 'jeu'; this.finBandeau = this.T + 1.5; }
    if (this.phase === 'jeu') {
      // le PIÈGE : juste avant la flèche piégée, Kédric GLACE LE PLANCHER — les flèches continuent de tomber
      const i = this.pas.findIndex(p => p.note === null);
      if (i >= 0 && this.pas[i].piege && !this.pas[i].declenche && this.pas[i].t - this.T <= 1.2) {
        this.pas.filter(p => p.piege && p.slot === this.pas[i].slot).forEach(p => p.declenche = true);
        this.gel = this.T + S.piege.duree;
        this.bandeau('KÉDRIC GLACE LE PLANCHER !', '#9fe0ff', S.piege.duree + 0.5);
        this.poseKedric('triche');
        onomatopee(this.s, LARGEUR / 2, 150, 'GLACÉ !', 54, '#9fe0ff');
      }
      // la COUPURE DE COURANT : les projecteurs s'éteignent, on ne voit plus les flèches au loin
      if (this.noirs.length && this.T >= this.noirs[0]) {
        this.noirs.shift();
        this.noir = this.T + S.noir.duree;
        this.bandeau('COUPURE DE COURANT !', '#ff9a9a', S.noir.duree + 0.5);
        onomatopee(this.s, LARGEUR / 2, 150, 'NOIR !', 54, '#9a9aff');
      }
      // les FLÈCHES DOUBLÉES : annonce la première fois
      if (!this.doublesAnnonces && this.tPremDouble !== null && this.T >= this.tPremDouble - 2.5) {
        this.doublesAnnonces = true;
        this.bandeau('FLÈCHES DOUBLÉES : DEUX À LA FOIS !', '#d9a0ff', 2.5);
      }
      // le SOLO : quand il est à deux doigts de perdre, Kédric joue sa carte et draine le public
      if (!this.soloFait && this.T > 10 && this.jauge > this.eff.seuilSolo) {
        this.soloFait = true;
        this.soloJusqua = this.T + S.solo.duree;
        this.bandeau('SOLO DE KÉDRIC : CONTRE-ATTAQUE !', '#ff9a3c', S.solo.duree + 0.5);
        this.poseKedric('micro');
        onomatopee(this.s, LARGEUR / 2, 150, 'SOLO !', 54, '#ff9a3c');
      }
      if (this.solo()) this.public(-S.solo.drain * dt);   // son solo : le public glisse vers lui
      if (!this.gele()) for (const t of DIRS) if (e[t]) this.appui(t);
      for (let i = 0; i < n; i++) {
        const p = this.pas[i];
        if (p.note === null && this.T > p.t + this.fenetre.bien) this.noter(i, 'rate');
      }
      // fin de la session (toutes les flèches jouées) : la boule du kaméhaméha désigne le gagnant
      if (!this.termine && this.pas.every(p => p.note !== null) && this.T > this.cible(n - 1) + d * 0.5) this.terminer(this.jauge > 0);
    }
    this.afficher();
  }

  // à chaque temps de musique : le décompte 3, 2, 1 ; Kédric prend la pose de la flèche (il danse avec toi)
  surLeTemps(k) {
    const j = k - S.annonce;
    if (j < 0) {
      if (this.phase === 'annonce' && k >= S.annonce - 3 && k < S.annonce)
        onomatopee(this.s, KED.x + 230, 300, String(S.annonce - k), 44, '#ffd84a');
      return;
    }
    const p = this.pas.find(q => q.slot === j);
    if (p) this.poseKedric(p.rouge ? 'triche' : p.montre);   // Kédric fait le pas en même temps que toi
  }

  appui(t) {
    if (this.gele()) return;   // plancher glacé : les appuis ne servent à rien (les flèches continuent !)
    // les flèches dont le moment arrive (les DOUBLÉES partagent le même moment : deux touches différentes)
    const fen = Math.min(this.fenetre.bien * 1.5, this.duree * 0.5);
    const proches = [];
    for (let i = 0; i < this.pas.length; i++) {
      const p = this.pas[i];
      if (p.note === null) { const ecart = Math.abs(this.T - p.t); if (ecart <= fen) proches.push(i); else break; }
    }
    if (!proches.length) return;   // appui bien trop tôt : ignoré
    // d'abord la flèche qui attend CETTE touche (sinon : la prochaine flèche prend le raté)
    const bon = proches.find(i => this.pas[i].attendu === t);
    const i = bon !== undefined ? bon : proches[0];
    const p = this.pas[i];
    this.poseToi(t);
    if (t !== p.attendu) this.noter(i, 'rate');
    else {
      const ecart = Math.abs(this.T - p.t);
      this.noter(i, ecart <= this.fenetre.parfait ? 'parfait' : ecart <= this.fenetre.bien ? 'bien' : 'rate');
    }
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
    // la foule est à toi (combo) : tes réussites rapportent PLUS (x1,5)
    const mult = this.combo() ? S.combo.mult : 1;
    if (note === 'parfait') {
      // pendant son SOLO, tes PARFAITS le contre-attaquent : DOUBLE gain
      this.bilan.parfaits++;
      this.public(S.gain.parfait * mult + (this.solo() ? S.solo.bonusParfait : 0));
      this.retour.setText(this.solo() ? 'CONTRE-PARFAIT !' : 'PARFAIT !').setColor('#7fe8ff');
      lignesImpact(this.s, xc, this.c.cibleY, 0x9fe0ff, 10, 70); lignesImpact(this.s, xChoc, KHAM.y, 0xffffff, 12, 100);
      // le COMBO : 5 PARFAITS d'affilée et la foule est à toi !
      this.consecParfaits++;
      if (this.consecParfaits >= S.combo.nombre && !this.combo()) {
        this.comboJusqua = this.T + S.combo.duree;
        this.bandeau('LA FOULE EST À TOI !', '#7fff7f', S.combo.duree);
        onomatopee(this.s, LARGEUR / 2, 150, 'COMBO !', 54, '#7fff7f');
      }
    } else if (note === 'bien') {
      this.bilan.bien++; this.public(S.gain.bien * mult);
      this.retour.setText('BIEN !').setColor('#7fff7f');
      this.consecParfaits = 0;   // un BIEN casse le combo (seuls les PARFAITS le montent)
    } else {
      this.bilan.rates++; this.public(-S.gain.rate);
      this.retour.setText(this.gele() ? 'GLACÉ !' : p.rouge ? 'RATÉ ! (l\'inverse !)' : 'RATÉ !').setColor('#ff6b6b');
      lignesImpact(this.s, xChoc, KHAM.y, 0xff6b6b, 12, 100);
      if (!this.gele()) this.poseKedric('haut');
      this.consecParfaits = 0;
    }
    // ---------- le RETOUR FRAPPANT de l'appui ----------
    // ça se SENT (vibration, si le téléphone l'autorise) et ça se VOIT partout (même sur iPhone) :
    // flash plein écran + secousse de caméra + la touche qui éclate (raté : elle s'effondre)
    const echec = note === 'rate';
    if (navigator.vibrate) navigator.vibrate(echec ? 80 : note === 'parfait' ? 45 : 20);
    const tc = this.touchesC[p.attendu];
    this.s.tweens.killTweensOf(tc); tc.setScale(echec ? 0.55 : 1.8);
    this.s.tweens.add({ targets: tc, scale: 1, duration: echec ? 260 : 180 });
    this.s.tweens.killTweensOf(this.flash);
    this.flash.setFillStyle(echec ? 0xff3030 : note === 'parfait' ? 0x9fe0ff : 0x7fff7f, 0.3);
    this.flash.setAlpha(0.3);
    this.s.tweens.add({ targets: this.flash, alpha: 0, duration: echec ? 320 : 200 });
    this.s.cameras.main.shake(echec ? 160 : 90, echec ? 0.008 : 0.003);
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
    arreterMusique(S.musique);   // le battle est fini : la musique s'arrête net
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
      // le SOLO de Kédric : son faisceau luit et le point de choc vibre
      if (this.solo()) { g.lineStyle(4, 0xffd84a, 0.7); g.strokeCircle(cx, y, h * 1.5 + 3 * Math.sin(this.T * 20)); }
      // la foule est à toi : ton faisceau luit vert
      if (this.combo()) { g.lineStyle(3, 0x7fff7f, 0.6); g.strokeRoundedRect(KHAM.marge - 3, y - h / 2 - 3, Math.max(0, cx - KHAM.marge) + 6, h + 6, 8); }
    }
    // le bandeau d'un évènement se range tout seul après un moment
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
    if (i >= 0 && !this.gele()) {
      const dt = this.pas[i].t - this.T, reste = Math.abs(dt);
      const couleur = reste <= this.fenetre.parfait ? '#ffffff' : reste <= this.fenetre.bien ? '#3fa7ff' : '#ffd84a';
      // (flèche rouge en CHAMPION : pas d'aide, c'est à toi d'inverser)
      if (dt < d * 1.5 && !this.pas[i].rouge) cible = { nom: this.pas[i].attendu, force: Math.max(0.15, Math.min(1, 1 - dt / (d * 1.5))), couleur };
    }
    for (const n of DIRS) allumerBouton(n, cible && cible.nom === n ? cible.force : 0, cible ? cible.couleur : undefined);
    for (const n of DIRS) {
      const x = C.x[n];
      g.fillStyle(0x000000, this.noirOn() ? 0.7 : 0.45); g.fillRoundedRect(x - w / 2, C.haut, w, C.cibleY - C.haut + w / 2, 14);
      const allume = cible && cible.nom === n;
      const coul = allume ? Phaser.Display.Color.HexStringToColor(cible.couleur).color : Phaser.Display.Color.HexStringToColor(COULEURS[n]).color;
      g.fillStyle(coul, allume ? 0.25 + 0.35 * cible.force : 0.1 + 0.15 * boum); g.fillCircle(x, C.cibleY, w * 0.45);
      g.lineStyle(allume ? 6 : 4, coul, allume ? 1 : 0.8); g.strokeCircle(x, C.cibleY, w * 0.45 + 3 * boum);
      this.touchesC[n].setPosition(x, C.cibleY).setAlpha(allume ? 0.9 : 0.45);
    }
    // des petits traits en travers des couloirs, un par temps de musique (on voit venir le rythme)
    g.lineStyle(2, 0xffffff, this.noirOn() ? 0.1 : 0.22);
    for (let k = Math.ceil(this.T / d); C.cibleY - (k * d - this.T) * v > C.haut; k++) {
      const y = C.cibleY - (k * d - this.T) * v;
      if (y > C.cibleY - w * 0.5) continue;
      for (const [a, b] of [['gauche', 'droite'], ['haut', 'bas']]) g.lineBetween(Math.min(C.x[a], C.x[b]) - w / 2 + 6, y, Math.max(C.x[a], C.x[b]) + w / 2 - 6, y);
    }
    // le GEL en cours : le plancher est glacé — les couloirs gèlent, les flèches continuent de tomber
    if (this.gele()) {
      g.fillStyle(0x9fe0ff, 0.3); g.fillRect(0, 0, LARGEUR, HAUTEUR);
      g.fillStyle(0x000000, 0.55); g.fillRoundedRect(LARGEUR / 2 - 190, 250, 380, 54, 14);
    }
    // la COUPURE DE COURANT : tout s'assombrit
    if (this.noirOn()) g.fillStyle(0x000000, 0.5), g.fillRect(0, 0, LARGEUR, HAUTEUR);
    // les flèches : elles tombent dans leur couloir et touchent la touche pile sur leur temps ;
    // dans le NOIR, on ne les voit que dans leurs toutes dernières secondes de chute
    for (const n of this.notes) {
      const dt = n.t - this.T, y = C.cibleY - dt * v;
      const visible = y >= C.haut + 10 && dt > -0.3 && (!this.noirOn() || dt < NOIR.visibilite);
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
