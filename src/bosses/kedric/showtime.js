// =====================================================================
// SHOWTIME : le BATTLE DE DANSE contre Kédric, le boss de fin (façon DDR / jeu de danse).
// DEUX MANCHES (~45 s puis 1 MINUTE) : la première sur la musique d'origine (reglages.js manches[0]),
// la DEUXIÈME sur le GÉNÉRIQUE DRAGON BALL Z (manches[1]) — le morceau change entre les deux,
// sans jamais être coupé en cours de manche. À la fin : la musique s'arrête net.
// Les flèches TOMBENT dans 4 COULOIRS (◀ ▶ à gauche, ▲ ▼ à droite) jusqu'à la touche à
// presser, PILE SUR LE RYTHME (une flèche tous les 'tempsParPas' temps ; chaque manche a
// le tempo de SON morceau, et la session se cale sur le TEMPS FORT le plus proche).
// Kédric danse AVEC TOI et triche comme une vraie star — chaque piège coupe le battle le temps
// d'un ÉCRAN SUPER POUVOIR (façon supers de Lionel : fond noir, lignes de vitesse, Kédric en
// grand et son pouvoir en ÉNORME, ~1,5 s — impossible à rater, même concentré sur les touches) :
//  - le GEL : il GLACE LE PLANCHER, tu ne peux plus appuyer pendant quelques secondes
//    pendant que les flèches continuent de tomber (1 par manche, plus long en CHAMPION) ;
//  - la COUPURE DE COURANT : un vrai noir, on ne voit les flèches qu'au tout dernier
//    moment (1 par manche) ;
//  - les FLÈCHES DOUBLÉES : dans les dernières secondes de chaque manche, deux à la fois ;
//  - le SOLO : quand tu approaches la victoire, il fait un SOLO qui draine le public —
//    contre-attaque : tes PARFAITS rapportent DOUBLE pendant son solo ;
//  - le COMBO : 5 PARFAITS d'affilée et la foule est à toi (gains x1,5 pendant 10 s).
// Et quand tu mènes trop large, son public à lui se rappelle à lui : la jauge glisse
// doucement vers Kédric (drain passif) — il faut rester bon jusqu'au bout.
// En CHAMPION (diff.flechesRouges) : flèches rouges bien plus fréquentes, gel plus long.
// La jauge du public est un KAMÉHAMÉHA père-fils : ton faisceau BLEU à gauche, le DORÉ de
// Kédric à droite ; la BOULE BLANCHE du point de CHOC désigne le gagnant (>0 à la fin = victoire).
// Chaque appui a un RETOUR FRAPPANT : vibration (si le téléphone l'autorise), flash plein
// écran, secousse de caméra et la touche qui éclate. L'horloge de chaque manche suit la
// musique par un temps MONOTONE (les tours de boucle de la piste s'additionnent : le temps
// ne recule jamais). Toute la logique avance dans maj(dt, touches) (pas de minuteries
// Phaser) : les bots peuvent jouer en accéléré.
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
// le KAMÉHAMÉHA du public : un RAIL fin avec une GRANDE AIGUILLE pointée sur la boule du point
// de choc (elle glisse d'un côté ou de l'autre au fil des réussites). Position : this.yJauge —
// tout en bas s'il y a la place, sinon EN HAUT (sur téléphone les boutons occupent le bas) :
// le rail ne recouvre JAMAIS les flèches, les touches à presser ni les boutons.
const KHAM = { marge: 170, portee: 280 };
// la coupure de courant : dans le noir, on ne voit une flèche que dans ses 'visibilite' dernières secondes
const NOIR = { visibilite: 0.3 };
// la durée de l'ÉCRAN SUPER POUVOIR (façon supers de Lionel) : le battle s'arrête le temps
// de l'écran, puis reprend PILE sur le piège, toujours dans le rythme
const ECRAN_POUVOIR = 1.6;
// le DÉCOMPTE avant la première flèche de chaque manche : 5 SECONDES PILE (5, 4, 3, 2, 1… GO !),
// calées sur le tempo de CHAQUE morceau (le nombre de pas de battement est recalculé par manche)
const DECOMPTE = 5;

export class Showtime {
  // options : { jauge: -30..30, replique, sousTitre } ; fin(gagne, bilan) appelé à la fin
  constructor(scene, options, fin) {
    this.s = scene; this.o = options; this.fin = fin;
    this.jauge = options.jauge || 0;
    this.bilan = { parfaits: 0, bien: 0, rates: 0 };
    this.el = []; this.notes = [];
    this.musique = S.manches[0].musique;   // la musique de la manche en cours
    this.numManche = 0;
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
    // le flash plein écran (feedback d'appui + écran SUPER POUVOIR) et le voile du noir
    this.flash = this.ajout(scene.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, HAUTEUR, 0xffffff, 0).setDepth(P + 9));
    this.voileNoir = this.ajout(scene.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, HAUTEUR, 0x000000, 0).setDepth(P + 8));   // P+8 : AU-DESSUS des touches, des flèches et des retours — un VRAI noir total
    // le KAMÉHAMÉHA du public : étiquettes aux deux bouts du rail (elles suivent this.yJauge)
    this.jaugeG = this.ajout(scene.add.graphics().setDepth(P + 4));
    this.yJauge = HAUTEUR - 12;   // le rail, tout en bas par défaut (remonté en haut sur téléphone)
    this.etiquettesJauge = [
      texte(scene, 24, this.yJauge, 'TOI', 16, '#7fe8ff', { fontStyle: 'bold' }).setOrigin(0, 0.5),
      texte(scene, LARGEUR - 24, this.yJauge, 'KÉDRIC', 16, '#ff9a3c', { fontStyle: 'bold' }).setOrigin(1, 0.5),
      texte(scene, LARGEUR / 2, this.yJauge - 16, 'PUBLIC', 13, '#ffffff'),
    ].map(t => this.ajout(t.setDepth(P + 4)));
    // les 4 couloirs : le fond, la touche en bas de chacun (un rond et sa flèche)
    this.couloirsG = this.ajout(scene.add.graphics().setDepth(P + 5));
    this.touchesC = {};
    for (const n of DIRS) this.touchesC[n] = this.ajout(texte(scene, 0, 0, FLECHES[n], 40, '#ffffff', { fontStyle: 'bold' }).setDepth(P + 6).setAlpha(0.45));   // P+6 : SOUS le voile du noir (P+8) : dans le noir total, on ne voit plus RIEN
    // le compte à rebours du GEL (au-dessus des couloirs gelés)
    this.gelCompte = this.ajout(texte(scene, LARGEUR / 2, 265, '', 24, '#dff6ff', { fontStyle: 'bold', strokeThickness: 7 }).setDepth(P + 6)).setVisible(false);
    this.retour = this.ajout(texte(scene, 0, 0, '', 26, '#ffffff', { fontStyle: 'bold', strokeThickness: 7 }).setDepth(P + 7));
    this.c = COULOIRS;
    // la musique de la 1re manche (celle du match s'arrête) ; gros boutons tactiles (rangés pendant la pause)
    arreterMusique('kedric_musique');
    jouerMusique(scene, this.musique);
    disposition('danse');
    this.surPause = () => { eteindreBoutons(); disposition('normale'); this.s.cameras.main.resetFX(); };
    this.surReprise = () => { disposition('danse'); this.calculerCouloirs(); };
    scene.events.on('pause', this.surPause); scene.events.on('resume', this.surReprise);
    // ABANDON depuis la pause pendant le battle : detruire() ne sera jamais appelé (seule la fin l'appelle).
    // Au shutdown de la scène, on éteint au moins les boutons (sinon ils restent allumés au hub) —
    // sans relancer la musique du match : le shutdown s'en occupe déjà, lui.
    scene.events.once('shutdown', () => eteindreBoutons());
    this.annonce();
  }

  ajout(o) { this.el.push(o); return o; }

  detruire() {
    this.el.forEach(o => o.destroy()); this.viderNotes(); this.viderAnnonce(); this.el = [];
    this.s.events.off('pause', this.surPause); this.s.events.off('resume', this.surReprise);
    eteindreBoutons();
    disposition('separee');   // la disposition du match de Kédric
    arreterMusique(this.musique);
    jouerMusique(this.s, 'kedric_musique');
  }

  // ---------- l'ANNONCE : Kédric sur scène lance le défi et explique les règles ----------
  annonce() {
    const s = this.s;
    this.phase = 'intro'; this.T = 0;
    placerMusique(this.musique, S.introMusique);   // sur le refrain de la 1re manche
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
      `${S.manches.length} MANCHES (${Math.round(S.dureeRound)} s puis ${Math.round(S.manches[1].duree || S.dureeRound)} s), chacune sur SA musique : garde l'aiguille du public de TON côté !\n` +
      'Les flèches TOMBENT en rythme : appuie quand elles arrivent en bas.' +
      (estTactile() ? '\nLe bouton à presser S\'ALLUME de plus en plus fort jusqu\'au bon moment.' : '') +
      '\nKédric est une star, il TRICHE : plancher GLACÉ, coupure de projecteurs, flèches DOUBLÉES\nen fin de manche... et un SOLO quand il sent qu\'il va perdre !' +
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
    this.numManche = 0;
    this.debutManche = 0;   // la manche 1 commence à T = 0 (les flèches arrivent après 'annonce' temps)
    this.demarrerManche(true);
    this.calculerCouloirs();
    this.creerNotes();
    this.s.bandeau.setText(`MANCHE 1 / ${S.manches.length} : DANSE AVEC KÉDRIC !`).setColor('#ffd84a').setVisible(true);
    this.poseKedric('portrait');
    this.poseToi(null);
  }

  // une manche : sa musique, son tempo, son horloge musicale (appelée aussi pour la manche 2)
  demarrerManche(premiere = false) {
    const M = S.manches[this.numManche];
    this.musique = M.musique;
    this.duree = M.tempo.temps * S.tempsParPas;   // durée entre deux flèches, calée sur LE morceau de la manche
    this.parRound = Math.floor((S.manches[this.numManche].duree || S.dureeRound) / this.duree);
    this.dernierPas = -1;
    this.gel = 0; this.noir = 0; this.techT = -99; this.dernierCompte = 99;   // techT : espacement mini ; dernierCompte : le décompte
    const fen = this.s.diff.fenetreShow;
    this.fenetre = { parfait: Math.min(S.parfait * fen, this.duree * 0.25), bien: Math.min(S.bien * fen, this.duree * 0.45) };
    if (premiere) {
      // on démarre PILE SUR UN TEMPS du morceau (peu importe quand l'écran d'annonce a été quitté)
      const m = tempsMusique(this.musique);
      const battement = M.tempo.temps;
      this.suiviMusique = null; this.tempsMusical = 0; this.dureePiste = null;
      this.origine = m === null ? M.tempo.debut : M.tempo.debut + Math.round((m - M.tempo.debut) / battement) * battement;
      this.soloFait = false; this.soloJusqua = 0; this.comboJusqua = 0; this.consecParfaits = 0;
      this.phase = 'annonce'; this.finBandeau = null;
      this.genererPas();   // toutes les flèches des 2 manches (pièges, doublées...), d'un coup
    } else {
      // MANCHE 2 : on change de morceau — l'horloge repart sur le temps du nouveau
      arreterMusique(S.manches[this.numManche - 1].musique);
      jouerMusique(this.s, this.musique);
      this.suiviMusique = null; this.tempsMusical = 0; this.dureePiste = null;
      this.origine = S.manches[this.numManche].tempo.debut;   // le morceau repart de son début : temps de référence
      this.poseKedric('micro');
    }
  }

  // toutes les flèches des manches, chacune calée sur le tempo de SA musique.
  //  - flèche rouge (fais l'inverse) : par probabilité, jamais sur la toute première ;
  //  - GEL : des flèches pièges par manche → Kédric glace le plancher juste avant (S.piege.nombre par manche) ;
  //  - DOUBLÉES : dans les 'S.double.duree' dernières secondes de chaque manche, une flèche sur deux tombe en double.
  genererPas() {
    this.pas = [];
    this.tManches = [];   // début de chaque manche (temps de session)
    this.tNoirs = [];     // instants des coupures de courant (par manche)
    const champ = !!this.s.diff.flechesRouges;
    const rouge = champ ? S.rougeChance * 1.8 : S.rougeChance;
    this.dureeGel = champ ? S.piege.duree + 1 : S.piege.duree;   // en CHAMPION le gel dure plus longtemps
    this.comptes = [];   // le décompte de chaque manche, en pas de SA musique : DECOMPTE secondes pile
    let debut = 0;
    for (let r = 0; r < S.manches.length; r++) {
      const M = S.manches[r];
      const d = M.tempo.temps * S.tempsParPas;
      const n = Math.floor((M.duree || S.dureeRound) / d);   // la manche dure SA durée (la chanson 2 : 'duree: 60' = 1 minute)
      const compte = Math.max(1, Math.round(DECOMPTE / d));   // le décompte : DECOMPTE secondes, calées sur CE tempo
      this.comptes.push(compte);
      this.tManches.push(debut);
      const attente = S.annonce + compte;   // les flèches attendent le DÉCOMPTE : pas de flèche direct à l'écran
      const debutDoubles = (attente + n) * d - S.double.duree;
      let prec = null, prec2 = null;
      for (let j = 0; j < n; j++) {
        const t = debut + (attente + j) * d;
        const ajoute = (montre, double = false) => {
          const rougee = this.s.diff.flechesRouges && (r > 0 || j > 0) && Math.random() < rouge;
          this.pas.push({ montre, rouge: rougee, attendu: rougee ? INVERSE[montre] : montre, note: null, t, slot: j, manche: r, piege: false, declenche: false, double });
        };
        let dir;
        do { dir = DIRS[Math.floor(Math.random() * 4)]; } while (j >= 2 && dir === prec && dir === prec2);
        ajoute(dir);
        if (t - debut >= debutDoubles && j % 2 === 0 && j < n - 1) {
          let e;
          do { e = DIRS[Math.floor(Math.random() * 4)]; } while (e === dir);
          ajoute(e, true);
        }
        prec2 = prec; prec = dir;
      }
      // les pièges (GEL) de cette manche : jamais trop près du début ni de la fin, et LOIN de la
      // coupure de courant (S.ecartTech d'écart minimum : deux techniques trop proches, c'est la mitraille)
      const tNoirManche = S.noir.nombre > 0 ? (attente + n * 0.4) * d : -1e9;
      const pieges = new Set();
      while (pieges.size < Math.min(S.piege.nombre, n - 14)) {
        const j = 8 + Math.floor(Math.random() * (n - 16));
        if (![...pieges].every(p => Math.abs(p - j) >= 8)) continue;
        if (Math.abs((attente + j) * d - tNoirManche) < S.ecartTech + ECRAN_POUVOIR) continue;   // pas collé au noir
        pieges.add(j);
      }
      for (const j of pieges) this.pas.filter(p => p.manche === r && p.slot === j).forEach(p => p.piege = true);
      // la coupure de courant de cette manche : vers 40 % de la manche
      if (S.noir.nombre > 0) this.tNoirs.push(debut + (attente + n * 0.4) * d);
      debut = debut + (attente + n) * d + 0.6 + S.pause;   // fin de la manche, puis une pause
    }
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
    // sur téléphone, les boutons occupent le bas de l'écran : la jauge remonte EN HAUT (elle ne
    // doit jamais recouvrir les flèches, les touches à presser ni les boutons)
    // sur TÉLÉPHONE les boutons occupent le bas : SEULEMENT LÀ la jauge remonte en haut.
    // Sur ORDINATEUR (pas d'écran tactile), le rail reste TOUT EN BAS, bien petit, sous les flèches.
    this.yJauge = estTactile() && hautBoutons > HAUTEUR * 0.5 ? 40 : HAUTEUR - 12;
    this.etiquettesJauge[0].setPosition(24, this.yJauge);
    this.etiquettesJauge[1].setPosition(LARGEUR - 24, this.yJauge);
    this.etiquettesJauge[2].setPosition(LARGEUR / 2, this.yJauge - 16);
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
  // La piste de la manche est en BOUCLE : quand elle reboucle, son temps de lecture repart du début ;
  // on suit donc une horloge musicale MONOTONE (les tours de boucle s'additionnent), le temps de la
  // session ne recule JAMAIS (c'est ce qui figeait les flèches au milieu du battle).
  horloge(dt) {
    this.T += dt;
    if (this.phase === 'intro' || this.phase === 'fin' || this.s.horlogeJeu) return;
    const m = tempsMusique(this.musique);
    if (m === null) return;   // musique en pause / en chargement : le temps du jeu avance seul
    if (this.suiviMusique === null) { this.suiviMusique = m; this.tempsMusical = m; }
    let d = m - this.suiviMusique;
    if (d < -1) {   // la lecture a sauté en arrière : REBOUCLEMENT de la piste (elle était arrivée au bout)
      if (!this.dureePiste) this.dureePiste = Math.max(1, this.suiviMusique);   // là où elle était arrivée ≈ sa durée
      if (Math.abs(this.suiviMusique - this.dureePiste) < 2) d += this.dureePiste;   // oui, c'est bien un tour de boucle
      else d = 0;   // non (onglet caché, changement de piste) : on ignore le saut
    }
    this.suiviMusique = m;
    this.tempsMusical += d;   // le temps musical CONTINU (rebouclé, il ne revient jamais en arrière)
    const TL = this.T - this.debutManche;   // temps local de la manche en cours
    const ecart = (this.tempsMusical - this.origine) - TL;
    if (Math.abs(ecart) <= 0.12) this.T += ecart * 0.1;        // petit décalage : en douceur
    else if (ecart > 0) this.T += ecart;                       // la musique a pris de l'avance : on se cale d'un coup
    else this.T += ecart * 0.05;                               // elle a pris du retard (onglet caché) : on rattrape en douceur
  }

  // le GEL est-il en cours (le plancher est glacé : plus aucun appui possible) ?
  gele() { return this.gel > this.T; }
  // la coupure de courant est-elle en cours ?
  noirOn() { return this.noir > this.T; }
  // le SOLO de Kédric est-il en cours ?
  solo() { return this.soloJusqua > this.T; }
  // la foule est-elle à toi (combo de PARFAITS) ?
  combo() { return this.comboJusqua > this.T; }

  // un bandeau d'évènement qui se range tout seul
  bandeau(txt, couleur, duree = 2.5) {
    this.s.bandeau.setText(txt).setColor(couleur).setVisible(true);
    this.finBandeau = this.T + duree;
  }

  // l'ÉCRAN SUPER POUVOIR, comme les supers de Lionel : fond noir, lignes de vitesse qui
  // tournent, Kédric en grand qui débarque de la droite et son pouvoir en ÉNORME — le temps
  // d'un écran, impossible à rater. Les flèches qui tomberaient PENDANT l'écran sont retirées
  // (aucune pénalité, aucune flèche perdue derrière le fond) : le battle reprend pile sur le
  // piège, toujours dans le rythme (pas plus de 2 écrans par manche : le gel et le noir).
  superPouvoir(nom, couleur, info, opts = {}) {
    const s = this.s, cx = LARGEUR / 2, cy = HAUTEUR / 2, coul = Phaser.Display.Color.HexStringToColor(couleur).color;
    // les flèches qui tomberaient pendant l'écran sont retirées (jamais les pièges du gel)
    this.pas.forEach(p => { if (p.note === null && !p.declenche && p.t < this.T + ECRAN_POUVOIR) { p.note = 'esquive'; p.mange = true; } });
    this.ecranT = this.T;   // un seul écran à la fois (les autres pièges attendent la fin)
    this.techT = this.T;    // …et les autres techniques attendent S.ecartTech secondes (pas la mitraille)
    this.poseKedric('triche');
    const el = [];
    // le fond noir et les lignes de vitesse qui tournent
    const fond = this.ajout(s.add.rectangle(cx, cy, LARGEUR, HAUTEUR, opts.coupure ? 0x000000 : 0x05030c, 0).setDepth(P + 20));   // coupure : NOIR PUR, la scène ne transparaît pas
    s.tweens.add({ targets: fond, fillAlpha: opts.coupure ? 0.98 : 0.93, duration: 120 });
    const lignes = this.ajout(s.add.graphics().setDepth(P + 21).setPosition(cx, cy));
    for (let k = 0; k < 40; k++) {
      const a = (k / 40) * Math.PI * 2 + Math.random() * 0.1, r = 90 + Math.random() * 80;
      const cLignes = opts.coupure ? (k % 3 ? 0x555a66 : 0x888888) : (k % 3 ? coul : 0xffffff);   // coupure : lignes GRISES, des projecteurs qui meurent
      lignes.lineStyle(2 + Math.random() * 4, cLignes, 0.3 + Math.random() * 0.4);
      lignes.lineBetween(Math.cos(a) * r, Math.sin(a) * r, Math.cos(a) * 900, Math.sin(a) * 900);
    }
    s.tweens.add({ targets: lignes, angle: 35, duration: ECRAN_POUVOIR * 1000 });
    el.push(fond, lignes);
    // Kédric en grand, qui débarque de la droite avec ses images rémanentes
    const kx = 690;
    const perso = this.ajout(s.add.image(LARGEUR + 260, HAUTEUR - 4, 'kedric_portrait').setOrigin(0.5, 1).setDepth(P + 24));
    perso.setScale(430 / perso.height);
    s.tweens.add({ targets: perso, x: kx, duration: 260, ease: 'Cubic.Out' });
    el.push(perso);
    for (let k = 1; k <= 3; k++) {
      const fantome = this.ajout(s.add.image(LARGEUR + 260, HAUTEUR - 4, 'kedric_portrait').setOrigin(0.5, 1).setDepth(P + 23)
        .setScale(perso.scaleX).setTint(coul).setAlpha(0.5 - k * 0.12));
      s.tweens.add({ targets: fantome, x: kx + k * 48, duration: 260 + k * 60, ease: 'Cubic.Out' });
      el.push(fantome);
    }
    // des étincelles qui jaillissent autour de lui
    for (let k = 0; k < 22; k++) {
      const e = this.ajout(s.add.star(kx, cy, 4, 3, 9, k % 2 ? coul : 0xffffff).setDepth(P + 25).setScale(0.4 + Math.random()));
      const a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 240;
      s.tweens.add({ targets: e, x: kx + Math.cos(a) * d, y: cy + Math.sin(a) * d, angle: 360, alpha: 0,
        delay: 150 + Math.random() * 300, duration: 700 + Math.random() * 400 });
      el.push(e);
    }
    // le gros titre qui claque, à gauche, et l'info du piège en dessous
    const xt = 330;
    const haut = this.ajout(texte(s, xt, cy - 92, 'KÉDRIC UTILISE SON', 30, '#ffffff', { fontStyle: 'bold', strokeThickness: 8 }).setOrigin(0.5).setDepth(P + 26).setAlpha(0));
    s.tweens.add({ targets: haut, alpha: 1, delay: 120, duration: 200 });
    const titre = this.ajout(s.add.text(xt, cy - 10, nom, {
      fontFamily: 'monospace', fontStyle: 'bold italic', fontSize: '66px', color: couleur, align: 'center',
      stroke: '#000000', strokeThickness: 11, wordWrap: { width: 560 },
    }).setOrigin(0.5).setDepth(P + 26).setScale(3).setAlpha(0).setAngle(-6));
    s.tweens.add({ targets: titre, scale: 1, alpha: 1, delay: 220, duration: 220, ease: 'Back.Out',
      onComplete: () => s.cameras.main.shake(220, 0.014) });
    el.push(haut, titre);
    if (opts.coupure) {
      // la coupure : le titre CLIGNOTE comme un néon qui rend l'âme, et le « ZZZT ! » du disjoncteur
      s.tweens.add({ targets: titre, alpha: { from: 0.55, to: 1 }, duration: 90, yoyo: true, repeat: 4 });
      onomatopee(s, cx, cy + 130, 'ZZZT !', 44, '#9fe0ff');
    }
    if (info) {
      const sous = this.ajout(texte(s, xt, cy + 66, info, 24, '#ffffff', { fontStyle: 'bold', strokeThickness: 7 }).setOrigin(0.5).setDepth(P + 26).setAlpha(0));
      s.tweens.add({ targets: sous, alpha: 1, delay: 420, duration: 200 });
      el.push(sous);
    }
    // puis tout se range en fondu et le battle reprend dans le rythme
    s.tweens.add({ targets: el, alpha: 0, delay: ECRAN_POUVOIR * 1000 - 250, duration: 250 });
    this.bandeau(nom, couleur, ECRAN_POUVOIR + 0.5);
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
    // MANCHE SUIVANTE : à l'heure prévue, on change de morceau (le temps de session continue)
    if (this.numManche < this.tManches.length - 1 && this.T >= this.tManches[this.numManche + 1]) {
      this.numManche++;
      this.debutManche = this.tManches[this.numManche];
      this.demarrerManche(false);
      this.bandeau('GO POUR LA DEUXIÈME CHANSON — VOUS ÊTES CHAUD, PUBLIC ?', '#ffd84a', 3.5);
    }
    // le DÉCOMPTE : les secondes restantes avant la première flèche de la manche, puis « GO ! »
    // (DECOMPTE secondes pour se placer, calées sur le tempo : les flèches ne tombent pas tout de suite)
    {
      const t0 = this.tManches[this.numManche] + (S.annonce + this.comptes[this.numManche]) * this.duree;
      const sec = Math.ceil(t0 - this.T);
      if (sec !== this.dernierCompte) {
        this.dernierCompte = sec;
        if (sec >= 1 && sec <= DECOMPTE) onomatopee(this.s, LARGEUR / 2, 190, String(sec), 62, '#ffd84a');
        else if (sec === 0) onomatopee(this.s, LARGEUR / 2, 190, 'GO !', 78, '#7fff7f');
      }
    }
    const TL = this.T - this.debutManche, d = this.duree, k = Math.floor(TL / d);
    if (k > this.dernierPas) { this.dernierPas = k; this.surLeTemps(k); }
    if (this.phase === 'annonce' && k >= S.annonce) { this.phase = 'jeu'; this.finBandeau = this.T + 1.5; }
    if (this.phase === 'jeu') {
      // le PIÈGE : un écran plein jeu annonce le gel AVANT la flèche piégée (l'écran dure
      // ECRAN_POUVOIR s, puis le plancher reste glacé : les flèches continuent de tomber)
      const libre = this.T > (this.ecranT === undefined ? -9 : this.ecranT + ECRAN_POUVOIR);   // pas 2 écrans à la fois
      const calme = this.T > this.techT + S.ecartTech;   // ni 2 techniques trop rapprochées : Kédric triche, il ne mitraille pas
      const piegeProche = libre && calme && this.pas.find(p => p.piege && !p.declenche && p.note === null && p.t - this.T <= ECRAN_POUVOIR + 0.8);
      if (piegeProche) {
        this.pas.filter(p => p.piege && p.manche === piegeProche.manche && p.slot === piegeProche.slot).forEach(p => p.declenche = true);
        this.gel = this.T + ECRAN_POUVOIR + this.dureeGel;
        this.superPouvoir('PLANCHER GLACÉ !', '#9fe0ff', `${Math.ceil(this.dureeGel)} SECONDES SANS APPUI !`);
      }
      // la COUPURE DE COURANT : les projecteurs s'éteignent, on ne voit plus les flèches au loin
      if (libre && calme && this.tNoirs.length && this.T >= this.tNoirs[0]) {
        this.tNoirs.shift();
        this.noir = this.T + ECRAN_POUVOIR + S.noir.duree;
        this.noirDebut = this.T + ECRAN_POUVOIR;   // juste après l'écran, les projecteurs vacillent avant de mourir
        this.superPouvoir('COUPURE DE COURANT !', '#ff9a9a', "ON NE VOIT LES FLÈCHES QU'À LA FIN !", { coupure: true });
      }
      // le SOLO : quand il est à deux doigts de perdre, Kédric joue sa carte et draine le public
      if (libre && calme && !this.soloFait && this.T - this.debutManche > 10 && this.jauge > S.solo.seuil) {
        this.soloFait = true;
        this.soloJusqua = this.T + ECRAN_POUVOIR + S.solo.duree;
        this.superPouvoir('SOLO DE KÉDRIC !', '#ff9a3c', 'ENCHAÎNE LES PARFAITS POUR CONTRER !');
        this.poseKedric('micro');
      }
      if (this.solo()) this.public(-S.solo.drain * dt);        // son solo : le public glisse vers lui
      if (this.jauge > S.drain.seuil) this.public(-S.drain.force * dt);   // tu mènes trop : son public se rappelle à lui
      if (!this.gele()) for (const t of DIRS) if (e[t]) this.appui(t);
      for (let i = 0; i < this.pas.length; i++) {
        const p = this.pas[i];
        if (p.note === null && this.T > p.t + this.fenetre.bien) this.noter(i, 'rate');
      }
      // fin de la session (toutes les flèches des 2 manches jouées) : la boule désigne le gagnant
      if (!this.termine && this.pas.every(p => p.note !== null) && this.T > this.cible(this.pas.length - 1) + d * 0.5) this.terminer(this.jauge > 0);
    }
    this.afficher();
  }

  // à chaque temps de musique : Kédric prend la pose de la flèche (il danse avec toi)
  surLeTemps(k) {
    const j = k - S.annonce - this.comptes[this.numManche];   // le décompte a fait glisser les flèches (DECOMPTE s, en pas de SA musique)
    if (j < 0) return;   // pendant le décompte : rien (les secondes s'affichent depuis maj())
    const p = this.pas.find(q => q.manche === this.numManche && q.slot === j);
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
      lignesImpact(this.s, xc, this.c.cibleY, 0x9fe0ff, 10, 70); lignesImpact(this.s, xChoc, this.yJauge, 0xffffff, 12, 100);
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
      if (!this.gele()) onomatopee(this.s, LARGEUR / 2, 150, 'RATÉ !', 54, '#ff6b6b');   // le public le VOIT : gros RATÉ bien marqué au milieu de l'écran
      lignesImpact(this.s, xChoc, this.yJauge, 0xff6b6b, 12, 100);
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
    this.flash.setAlpha(echec ? 0.5 : 0.3);   // un RATÉ : le rouge INONDE l'écran, impossible à louper
    this.s.tweens.add({ targets: this.flash, alpha: 0, duration: echec ? 320 : 200 });
    this.s.cameras.main.shake(echec ? 220 : 90, echec ? 0.013 : 0.003);
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
    arreterMusique(this.musique);   // le battle est fini : la musique s'arrête net
    this.viderNotes();
    eteindreBoutons();
    // tu gagnes : il s'effondre ; il gagne : clin d'œil de star (jamais la pose du perdant)
    this.poseKedric(gagne ? 'defaite' : 'triche');
    this.poseToi(gagne ? 'haut' : null);
    this.fin(gagne, { ...this.bilan, jauge: Math.round(this.jauge) });   // + la part du public à la fin : pour le bilan de victoire
  }

  public(n) { this.jauge = Math.max(-100, Math.min(100, this.jauge + n)); }

  // le point de choc du kaméhaméha : plus le public est pour toi, plus ta boule repousse celle de Kédric
  pointChoc() { return LARGEUR / 2 + (this.jauge / 100) * KHAM.portee; }

  // ---------- affichage ----------
  afficher() {
    // la COUPURE de courant, comme une vraie : les projecteurs VACILLENT (quelques clignotements)
    // puis MEURENT d'un coup — NOIR TOTAL, plus rien du tout : seule la DERNIÈRE flèche (juste
    // avant de la presser) réapparaît au-dessus du voile, comme un éclair dans le noir
    if (this.noirOn()) {
      const dn = this.T - (this.noirDebut ?? this.T);
      // pendant l'écran SUPER POUVOIR (dn <= 0), le voile reste SOUS l'écran (P+8) ;
      // pendant le VRAI noir (dn > 0), il monte AU-DESSUS DE TOUT (1099) : HUD, bandeau,
      // jauge, touches, onomatopées... plus RIEN ne reste allumé — une vraie coupure de courant
      this.voileNoir.setDepth(dn > 0 ? 1099 : P + 8);
      this.voileNoir.setAlpha(dn > 0 && dn < 0.55 && Math.sin(dn * 60) < -0.3 ? 0.35 : 1);
    } else { this.voileNoir.setAlpha(0); this.voileNoir.setDepth(P + 8); }
    // la JAUGE DU PUBLIC : rail fin + GRANDE AIGUILLE (elle glisse d'un côté ou de l'autre).
    // Placée là où elle ne gêne RIEN (this.yJauge) : en bas s'il y a la place, sinon en haut
    const g = this.jaugeG; g.clear();
    if (this.phase !== 'intro') {
      const y = this.yJauge, h = 8;
      const cx = this.pointChoc();
      const puls = 1 + 0.12 * Math.sin(this.T * 9);
      g.fillStyle(0x000000, 0.55); g.fillRoundedRect(KHAM.marge - 10, y - h / 2 - 4, LARGEUR - 2 * KHAM.marge + 20, h + 8, 6);
      g.fillStyle(0x2f8fff, 0.9); g.fillRoundedRect(KHAM.marge, y - h / 2, Math.max(0, cx - KHAM.marge), h, h / 2);
      g.fillStyle(0xffffff, 0.35); g.fillRect(KHAM.marge, y - 2, Math.max(0, cx - KHAM.marge), 4);
      g.fillStyle(0xff9a3c, 0.9); g.fillRoundedRect(cx, y - h / 2, Math.max(0, LARGEUR - KHAM.marge - cx), h, h / 2);
      g.fillStyle(0xffffff, 0.35); g.fillRect(cx, y - 2, Math.max(0, LARGEUR - KHAM.marge - cx), 4);
      // la boule du point de choc (blanche, pulsante) : les impacts PARFAIT / RATÉ la frappent ici
      g.fillStyle(0xffffff, 0.95); g.fillCircle(cx, y, h * 1.1 * puls);
      // LA GRANDE AIGUILLE : le triangle qui pointe sur la boule par-dessus le rail
      // (bleu glacier quand tu mènes, doré quand Kédric mène — on voit d'un coup d'œil qui gagne)
      g.fillStyle(this.jauge >= 0 ? 0x7fe8ff : 0xff9a3c, 0.95);
      g.fillTriangle(cx - 13, y + h / 2 + 2, cx + 13, y + h / 2 + 2, cx, y - 15);
      g.lineStyle(2, 0xffffff, 0.8);
      g.lineBetween(cx - 13, y + h / 2 + 2, cx, y - 15); g.lineBetween(cx + 13, y + h / 2 + 2, cx, y - 15);
      // le SOLO de Kédric : la boule luit et l'aiguille vibre
      if (this.solo()) { g.lineStyle(4, 0xffd84a, 0.7); g.strokeCircle(cx, y, h * 1.6 + 3 * Math.sin(this.T * 20)); }
      // la foule est à toi : ton faisceau luit vert
      if (this.combo()) { g.lineStyle(3, 0x7fff7f, 0.6); g.strokeRoundedRect(KHAM.marge - 3, y - h / 2 - 3, Math.max(0, cx - KHAM.marge) + 6, h + 6, 6); }
    }
    // le bandeau d'un évènement se range tout seul après un moment
    if (this.finBandeau !== null && this.T > this.finBandeau) { this.s.bandeau.setVisible(false); this.finBandeau = null; }
    // Kédric marque le temps : un petit rebond au début de chaque temps de musique
    const f = this.duree ? ((this.T - this.debutManche) / this.duree) % 1 : 1;
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
    if (!actif) { this.notes.forEach(n => n.objet.setVisible(false)); this.gelCompte.setVisible(false); return; }
    const C = this.c, d = this.duree, w = C.largeur, v = PISTE.vitesse;
    const TL = this.T - this.debutManche;
    // la prochaine flèche à faire : sa touche s'éclaire (et le bouton du téléphone s'allume)
    let cible = null;
    const i = this.phase === 'jeu' ? this.pas.findIndex(p => p.note === null) : -1;
    if (i >= 0 && !this.gele()) {
      const dt = this.pas[i].t - this.T, reste = Math.abs(dt);
      const couleur = reste <= this.fenetre.parfait ? '#ffffff' : reste <= this.fenetre.bien ? '#3fa7ff' : '#ffd84a';
      // (flèche rouge en CHAMPION : pas d'aide, c'est à toi d'inverser)
      if (dt < d * 1.5 && !this.pas[i].rouge) cible = { nom: this.pas[i].attendu, force: Math.max(0.15, Math.min(1, 1 - dt / (d * 1.5))), couleur };
    }
    const noirReel = this.noirOn() && this.T - (this.noirDebut ?? this.T) > 0;   // pendant le VRAI noir, les boutons du téléphone s'éteignent eux aussi
    for (const n of DIRS) allumerBouton(n, !noirReel && cible && cible.nom === n ? cible.force : 0, cible ? cible.couleur : undefined);
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
    for (let k = Math.ceil(TL / d); C.cibleY - (k * d - TL) * v > C.haut; k++) {
      const y = C.cibleY - (k * d - TL) * v;
      if (y > C.cibleY - w * 0.5) continue;
      for (const [a, b] of [['gauche', 'droite'], ['haut', 'bas']]) g.lineBetween(Math.min(C.x[a], C.x[b]) - w / 2 + 6, y, Math.max(C.x[a], C.x[b]) + w / 2 - 6, y);
    }
    // le GEL en cours : le plancher est glacé — chaque touche est PRISONNIÈRE d'un bloc de
    // glace (bloc bleu, fissures, glaçons qui pendent) : on comprend d'un coup d'œil qu'on
    // ne peut plus appuyer, pendant que les flèches continuent de tomber
    if (this.gele()) {
      const reste = Math.max(1, Math.ceil(this.gel - this.T));
      g.fillStyle(0x9fe0ff, 0.14); g.fillRect(0, 0, LARGEUR, HAUTEUR);
      for (const n of DIRS) {
        const x = C.x[n];
        g.fillStyle(0xbfefff, 0.5); g.fillCircle(x, C.cibleY, w * 0.52);
        g.fillStyle(0x9fe0ff, 0.8); g.fillCircle(x, C.cibleY, w * 0.42);
        g.lineStyle(3, 0xffffff, 0.9);   // les fissures de la glace
        for (const [dx, dy] of [[-1, -1], [1, 1], [1, -1], [-1, 1]])
          g.lineBetween(x, C.cibleY, x + dx * w * 0.38, C.cibleY + dy * w * 0.38);
        g.fillStyle(0xdff6ff, 0.95);   // les glaçons qui pendent au-dessus de la touche
        for (let k = -2; k <= 2; k++) {
          const px = x + k * w * 0.19, lg = w * (0.1 + 0.05 * Math.abs(Math.sin(px)));
          g.fillTriangle(px - 5, C.cibleY - w * 0.52, px + 5, C.cibleY - w * 0.52, px, C.cibleY - w * 0.52 + lg);
        }
        this.touchesC[n].setColor('#bfefff');
      }
      this.gelCompte.setVisible(true).setText(`PLANCHER GLACÉ ! ${reste} ${reste > 1 ? 'SECONDES' : 'SECONDE'} SANS APPUI`);
    } else {
      this.gelCompte.setVisible(false);
      for (const n of DIRS) this.touchesC[n].setColor('#ffffff');
    }
    // les flèches : elles tombent dans leur couloir et touchent la touche pile sur leur temps ;
    // dans le NOIR, on ne les voit que dans leurs toutes dernières secondes de chute
    for (const n of this.notes) {
      const dt = n.t - this.T, y = C.cibleY - dt * v;
      const visible = !n.pas.mange && y >= C.haut + 10 && dt > -0.3 && (!this.noirOn() || dt < NOIR.visibilite);
      n.objet.setVisible(visible);
      n.objet.setDepth(visible && this.noirOn() && this.T - (this.noirDebut ?? this.T) > 0 ? 1100 : P + 6);   // dans le VRAI noir : la flèche de la fin reste la seule lueur (au-dessus du voile 1099)
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


