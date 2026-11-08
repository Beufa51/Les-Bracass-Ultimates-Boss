// BEUFA — PHASE 2 : LE QUIZ (après l'infiltration). Le bureau de Beufa, façon CODEC de Metal Gear :
// une case en bas avec SA TÊTE et ses répliques. Intro : masqué (façon Psycho Mantis), il « lit dans tes
// pensées », puis enlève son masque (« il fait trop chaud ») et lance le quiz.
// 10 questions de culture jeu vidéo (QCM à 4 choix), 1 minute chacune ; chaque erreur = une CROIX rouge,
// 3 croix = GAME OVER (façon MGS). Tout le texte est dans data/beufa_quiz.js.
import { BossScene } from '../../core/BossScene.js';
import { BeufaInfiltration } from './BeufaInfiltration.js';
import { texte } from '../../core/ui.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { jouerSon } from '../../core/ressources.js';
import { jouerMusique, arreterMusique } from '../../core/musique.js';
import { Sauvegarde } from '../../core/sauvegarde.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { IDENTITE, REGLAGES as R, DIFFICULTES, appliquerDifficulte } from './reglages.js';
import { cleRecord } from './difficulte.js';
import { QUESTIONS, LECTURE_DEBUT, LECTURES, MASQUE_CHAUD, DEBUT_QUIZ, MOQUERIES, TROP_TARD, BRAVOS, VICTOIRE, GAME_OVER, RANGS, RANG_PARFAIT } from '../../../data/beufa_quiz.js';

const VERT = 0x38fc8c, VERT_TXT = '#7dffb0';
const hasard = (liste) => liste[Math.floor(Math.random() * liste.length)];
const melange = (liste) => { const l = [...liste]; for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } return l; };

export class BeufaQuiz extends BossScene {
  constructor() { super('BeufaQuiz', IDENTITE); }

  create() {
    // les images de Fabien (fond blanc retiré, taille du jeu) : même préparation que l'infiltration — une seule
    // fois par image, quelle que soit la scène qui passe en premier (on peut lancer le quiz directement)
    BeufaInfiltration.prototype.preparerImages.call(this);
    this.nomDiff = Sauvegarde.difficulte('beufa') || 'normal'; appliquerDifficulte(this.nomDiff);   // V18 : erreurs / temps selon la difficulté
    const Q = R.quiz;
    this.etape = 'intro';
    this.erreurs = 0; this.bons = 0; this.numero = 0; this.serie = 0;
    // V94 : infiltration SANS ALERTE = un JOKER (la première erreur ne compte pas), à chaque tentative
    this.joker = this.donnees.alertes === 0 ? R.quiz.joker : 0;
    this.masque = !this.donnees.reprise;   // une nouvelle tentative après un GAME OVER saute la lecture des pensées
    this.questions = melange(QUESTIONS).slice(0, Q.questions);
    etiquettesTactiles({ espace: 'OK', z: null, x: null, haut: null, bas: null, gauche: null, droite: null });

    this.creerBureau();
    this.creerCodec();
    this.creerHud();

    // le clavier : ESPACE / ENTRÉE avancent ou valident, 1-4 répondent, flèches choisissent
    this.input.keyboard.on('keydown', (ev) => this.touche(ev.key));
    this.input.on('pointerdown', (p) => { if (p.y > 352 && this.etape === 'dialogue') this.avancer(); });

    // V90 : musique de Psycho Mantis pendant la phase masquée, « Duel » ensuite (directement si on reprend)
    const lancer = () => {
      if (this.masque) { jouerMusique(this, 'beufa_mantis'); this.introMasque(); }
      else { jouerMusique(this, 'beufa_duel'); this.visage('machiavelique'); this.dire(DEBUT_QUIZ, () => this.questionSuivante()); }
    };
    if (this.donnees.reprise) lancer();
    else this.afficherIntro('BEUFA — LE QUIZ', [
      'Beufa t\'attend dans son bureau…',
      `${Q.questions} questions de culture JEU VIDÉO, ${Q.temps} s chacune`,
      `Réponds avec ${estTactile() ? 'le doigt' : '1 2 3 4, ou ◀ ▶ ▲ ▼ puis ESPACE'}`,
      `${Q.erreursMax} erreurs = GAME OVER`,
      `${estTactile() ? 'OK' : 'ESPACE'} : faire avancer le dialogue`,
    ], lancer);
  }

  // ---------- le décor : le bureau de Beufa ----------
  creerBureau() {
    // V86 : la SCÈNE illustrée de Fabien (Beufa à son bureau, avec / sans masque) remplace tout le décor dessiné.
    // Un peu plus grande que l'écran (1000×562) : les secousses de Beufa ne montrent jamais de bord.
    if (this.textures.exists('beufa_bureau_scene')) {
      this.scene_ = true;
      this.busteY = HAUTEUR / 2 - 30;   // V87 : remontée pour que ses mains restent au-dessus du codec
      this.buste = this.add.image(LARGEUR / 2, this.busteY, this.masque ? 'beufa_bureau_scene_masque' : 'beufa_bureau_scene');
      return;
    }
    const g = this.add.graphics();
    g.fillStyle(0x1c2030).fillRect(0, 0, LARGEUR, 150);                    // le mur du fond
    g.fillStyle(0x2a3044).fillRect(0, 140, LARGEUR, 10);                   // la plinthe
    if (this.textures.exists('beufa_sol')) this.add.tileSprite(0, 150, LARGEUR, 210, 'beufa_sol').setOrigin(0).setTint(0x8c94b8);
    else g.fillStyle(0x30344a).fillRect(0, 150, LARGEUR, 210);
    for (const x of [230, 730]) if (this.textures.exists('beufa_banniere')) this.add.image(x, 230, 'beufa_banniere').setOrigin(0.5, 1).setScale(1.5);
    for (const x of [60, 900]) if (this.textures.exists('beufa_plante')) this.add.image(x, 300, 'beufa_plante').setScale(1.6);
    // Beufa DEBOUT derrière son bureau (le bureau cache ses jambes)
    this.buste = this.add.image(LARGEUR / 2, 300, this.masque ? 'beufa_buste_masque' : 'beufa_buste').setOrigin(0.5, 1);
    this.buste.setScale(215 / this.buste.height);
    this.busteY = 300;
    // le BUREAU, dessiné : plateau éclairé, façade sombre, tiroirs
    const b = this.add.graphics();
    b.fillStyle(0x6e4a2c).fillRect(270, 262, 420, 26);   // plateau
    b.fillStyle(0x8c6440).fillRect(270, 262, 420, 6);
    b.fillStyle(0x4a301c).fillRect(276, 288, 408, 64);   // façade
    b.lineStyle(2, 0x2a1a10);
    b.strokeRect(270, 262, 420, 26); b.strokeRect(276, 288, 408, 64);
    for (const x of [300, 600]) { b.strokeRect(x, 298, 60, 20); b.strokeRect(x, 322, 60, 20); b.fillStyle(0xc8a050).fillRect(x + 26, 306, 8, 3).fillRect(x + 26, 330, 8, 3); }
    b.fillStyle(0xd8d0b0).fillRect(560, 254, 40, 10);    // des papiers
    b.fillStyle(0x30303a).fillRect(330, 246, 50, 18);    // un poste radio
    b.fillStyle(0xfc3838).fillRect(370, 250, 4, 4);
  }

  // ---------- la case CODEC ----------
  creerCodec() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x000000, 0.92).fillRect(0, 352, LARGEUR, HAUTEUR - 352);
    g.lineStyle(3, VERT, 0.9).strokeRect(6, 358, LARGEUR - 12, HAUTEUR - 364);
    g.lineStyle(2, VERT, 0.9).strokeRect(18, 374, 142, 142);               // le cadre du portrait
    this.portrait = this.add.image(89, 445, this.masque ? 'beufa_portrait_masque' : 'beufa_portrait').setDepth(51);
    this.portrait.setScale(136 / this.portrait.height);
    this.visage('calme');
    // les lignes de balayage de l'écran codec
    const sc = this.add.graphics().setDepth(52);
    sc.fillStyle(0x000000, 0.28);
    for (let y = 377; y < 514; y += 3) sc.fillRect(21, y, 136, 1);
    sc.fillStyle(VERT, 0.08).fillRect(21, 377, 136, 136);
    texte(this, 89, 528, 'BEUFA', 14, VERT_TXT).setDepth(53);
    this.texteCodec = this.add.text(178, 372, '', { fontFamily: 'monospace', fontSize: '20px', color: '#e8fff0', wordWrap: { width: 760 }, lineSpacing: 4 }).setDepth(53);
    this.suite = texte(this, LARGEUR - 34, HAUTEUR - 26, '▼', 18, VERT_TXT).setDepth(53).setVisible(false);
    this.tweens.add({ targets: this.suite, alpha: 0.2, duration: 400, yoyo: true, repeat: -1 });
    this.boutons = [];
  }

  // V83 : les EXPRESSIONS du codec (images de Fabien : beufa_codec_masque / _calme / _choque / _surpris /
  // _machiavelique / _souriant). Tant qu'une image manque, on garde le portrait actuel.
  visage(humeur) {
    // V84 : pas d'image « calme » (le sourire suffit, choix de Fabien) ; une humeur sans image → le sourire
    const cle = this.masque ? 'beufa_codec_masque' : `beufa_codec_${humeur === 'calme' ? 'souriant' : humeur}`;
    const repli = this.masque ? 'beufa_portrait_masque' : (this.textures.exists('beufa_codec_souriant') ? 'beufa_codec_souriant' : 'beufa_portrait');
    const t = this.textures.exists(cle) ? cle : repli;
    if (this.portrait.texture.key === t) return;
    this.portrait.setTexture(t); this.portrait.setScale(136 / this.portrait.height);
  }

  // ---------- en haut : question, croix, chrono ----------
  creerHud() {
    this.hudNumero = texte(this, 20, 22, '', 18, '#ffd84a').setOrigin(0, 0.5).setDepth(60);
    texte(this, LARGEUR - 86 - (R.quiz.erreursMax - 1) * 50, 22, 'ERREURS', 14, '#aaaaaa').setOrigin(1, 0.5).setDepth(60);
    const n = R.quiz.erreursMax;   // V18 : 2 à 5 cases selon la difficulté
    this.croix = [...Array(n).keys()].map((i) => {
      const x = LARGEUR - 60 - (n - 1 - i) * 50;
      this.add.rectangle(x, 24, 38, 34, 0x000000, 0.6).setStrokeStyle(2, 0x888888).setDepth(60);
      return texte(this, x, 24, '✕', 30, '#ff3838').setDepth(61).setVisible(false);
    });
    // V87 : le chrono en haut à gauche (au centre, il passait sur le visage de Beufa)
    this.chronoFond = this.add.rectangle(170, 52, 304, 12, 0x000000, 0.7).setStrokeStyle(1, 0x888888).setDepth(60).setVisible(false);
    this.chronoBarre = this.add.rectangle(20, 52, 300, 8, VERT).setOrigin(0, 0.5).setDepth(61).setVisible(false);
    this.chronoTexte = texte(this, 332, 52, '', 16, '#ffffff').setOrigin(0, 0.5).setDepth(61);
    this.hudJoker = texte(this, LARGEUR - 86 - (R.quiz.erreursMax - 1) * 50, 52, '', 14, '#ffd84a').setOrigin(1, 0.5).setDepth(60);
    this.majJoker();
  }

  majJoker() {
    this.hudJoker.setText(this.joker > 0 ? `★ JOKER x${this.joker} (infiltration sans alerte)` : '');
  }

  // ---------- le dialogue (machine à écrire) ----------
  dire(lignes, ensuite) {
    this.etape = 'dialogue';
    this.file = [...lignes]; this.ensuite = ensuite;
    this.ligneSuivante();
  }

  ligneSuivante() {
    const ligne = this.file.shift();
    if (ligne === undefined) { const f = this.ensuite; this.ensuite = null; if (f) f(); return; }
    if (typeof ligne === 'function') { ligne(); return; }   // une ACTION glissée dans le dialogue (enlever le masque…)
    this.ligne = ligne; this.lettres = 0; this.suite.setVisible(false);
    this.texteCodec.setText('');
  }

  avancer() {
    if (this.etape !== 'dialogue') return;
    if (this.lettres < this.ligne.length) { this.lettres = this.ligne.length; this.texteCodec.setText(this.ligne); return; }
    jouerSon(this, 'ui_valider');
    this.ligneSuivante();
  }

  // ---------- l'intro : Beufa masqué lit dans tes pensées ----------
  introMasque() {
    this.psy = true;   // le portrait et le buste tremblent, l'écran pulse en violet
    const lignes = [LECTURE_DEBUT];
    for (const l of melange(LECTURES).slice(0, 4)) lignes.push(() => { this.flashPsy(); this.ligneSuivante(); }, l);
    lignes.push(() => { this.psy = false; this.ligneSuivante(); }, MASQUE_CHAUD, () => this.enleverMasque(),
      () => { this.visage('machiavelique'); this.ligneSuivante(); });
    this.dire(lignes, () => this.dire(DEBUT_QUIZ, () => this.questionSuivante()));
  }

  flashPsy() {
    jouerSon(this, 'beufa_psy');
    const v = this.add.rectangle(LARGEUR / 2, 176, LARGEUR, 352, 0x8c38fc, 0.3).setDepth(40);
    this.tweens.add({ targets: v, alpha: 0, duration: 700, onComplete: () => v.destroy() });
    this.cameras.main.shake(250, 0.004);
  }

  enleverMasque() {
    this.etape = 'animation';
    this.tweens.add({ targets: this.buste, y: this.busteY - 10, duration: 120, yoyo: true, repeat: 2 });
    // V83 : un RIDEAU se ferme, on change Beufa derrière, puis il se rouvre sur Beufa sans masque à son bureau
    const moitie = LARGEUR / 2;
    const rideaux = [0, 1].map((i) => {
      const r = this.add.rectangle(i ? LARGEUR : 0, 0, moitie + 2, HAUTEUR, 0x050805).setOrigin(i ? 0 : 1, 0).setDepth(800);
      r.setStrokeStyle(3, VERT, 0.9);
      return r;
    });
    this.texteCodec.setText('');
    this.time.delayedCall(700, () => {
      this.tweens.add({ targets: rideaux[0], x: moitie, duration: 450, ease: 'Quad.In' });
      this.tweens.add({ targets: rideaux[1], x: moitie, duration: 450, ease: 'Quad.In', onComplete: () => {
        jouerSon(this, 'beufa_masque');
        arreterMusique('beufa_mantis');   // V90 : rideau fermé, la musique change
        this.cameras.main.shake(150, 0.004);
        this.masque = false;
        if (this.scene_) this.buste.setTexture('beufa_bureau_scene');
        else { this.buste.setTexture('beufa_buste'); this.buste.setScale(215 / this.buste.height); }
        this.visage('calme');
        this.time.delayedCall(700, () => {
          jouerMusique(this, 'beufa_duel');
          this.tweens.add({ targets: rideaux[0], x: 0, duration: 550, ease: 'Quad.Out' });
          this.tweens.add({ targets: rideaux[1], x: LARGEUR, duration: 550, ease: 'Quad.Out', onComplete: () => {
            rideaux.forEach((r) => r.destroy());
            this.etape = 'dialogue'; this.ligneSuivante();
          } });
        });
      } });
    });
  }

  // ---------- les questions ----------
  questionSuivante() {
    if (this.erreurs >= R.quiz.erreursMax) { this.gameOver(); return; }
    if (this.numero >= this.questions.length) { this.gagne(); return; }
    const q = this.questions[this.numero++];
    this.reponse = q.r[0];
    this.choix = melange(q.r);
    this.selection = 0;
    this.etape = 'question';
    this.visage('calme');
    this.reste = R.quiz.temps; this.dernierTic = 99;
    this.hudNumero.setText(`QUESTION ${this.numero}/${this.questions.length}`);
    this.chronoFond.setVisible(true); this.chronoBarre.setVisible(true);
    this.suite.setVisible(false);
    this.texteCodec.setText(q.q);
    this.lettres = 9999;
    this.boutons.forEach((b) => { b.fond.destroy(); b.txt.destroy(); });
    this.boutons = this.choix.map((c, i) => {
      const x = 178 + (i % 2) * 385, y = 432 + Math.floor(i / 2) * 50;
      const fond = this.add.rectangle(x, y, 372, 42, 0x0c2418).setOrigin(0, 0).setStrokeStyle(2, VERT, 0.7).setDepth(54).setInteractive({ useHandCursor: true });
      const txt = this.add.text(x + 12, y + 21, `${i + 1}. ${c}`, { fontFamily: 'monospace', fontSize: '17px', color: '#e8fff0', wordWrap: { width: 350 } }).setOrigin(0, 0.5).setDepth(55);
      fond.on('pointerdown', () => { this.selection = i; this.repondre(i); });
      fond.on('pointerover', () => { if (this.etape === 'question') { this.selection = i; this.majSelection(); } });
      return { fond, txt };
    });
    this.majSelection();
  }

  majSelection() {
    this.boutons.forEach((b, i) => b.fond.setFillStyle(i === this.selection ? 0x1e5a3a : 0x0c2418));
  }

  repondre(i) {
    if (this.etape !== 'question') return;
    this.etape = 'reponse';
    const bon = i >= 0 && this.choix[i] === this.reponse;
    this.boutons.forEach((b, k) => {
      b.fond.disableInteractive();
      if (this.choix[k] === this.reponse) b.fond.setFillStyle(0x1c8c3c).setStrokeStyle(3, 0x7dff7d);
      else if (k === i) b.fond.setFillStyle(0x8c1c1c).setStrokeStyle(3, 0xff5a5a);
      else b.fond.setAlpha(0.4);
    });
    this.chronoFond.setVisible(false); this.chronoBarre.setVisible(false); this.chronoTexte.setText('');
    this.time.delayedCall(900, () => {
      this.boutons.forEach((b) => { b.fond.destroy(); b.txt.destroy(); }); this.boutons = [];
      if (bon) {
        this.bons++;
        jouerSon(this, 'beufa_bon');
        this.serie = (this.serie || 0) + 1;
        this.visage(this.serie >= 3 ? 'choque' : this.serie === 2 ? 'surpris' : 'souriant');   // 3 d'affilée : il n'en revient pas
        this.dire([hasard(BRAVOS)], () => this.questionSuivante());
      } else if (this.joker > 0) {   // V94 : le JOKER efface l'erreur
        this.joker--; this.majJoker(); this.jokersUtilises = (this.jokersUtilises || 0) + 1;
        jouerSon(this, 'beufa_faux');
        this.serie = 0;
        this.visage('surpris');
        this.cameras.main.flash(200, 255, 216, 74);
        this.dire([`JOKER ! Ton infiltration sans alerte te sauve : cette erreur ne compte pas.\n(La bonne réponse : ${this.reponse})`], () => this.questionSuivante());
      } else {
        this.erreurs++;
        jouerSon(this, 'beufa_faux');
        this.serie = 0;
        this.visage('machiavelique');
        const c = this.croix[this.erreurs - 1];
        c.setVisible(true).setScale(3);
        this.tweens.add({ targets: c, scale: 1, duration: 300, ease: 'Back.Out' });
        this.cameras.main.shake(300, 0.008);
        this.cameras.main.flash(200, 255, 40, 40);
        this.rire();
        this.dire([(i < 0 ? TROP_TARD : hasard(MOQUERIES)) + `\n(La bonne réponse : ${this.reponse})`], () => this.questionSuivante());
      }
    });
  }

  // Beufa se moque : il secoue les épaules
  rire() {
    this.tweens.add({ targets: this.buste, y: this.busteY - 6, duration: 90, yoyo: true, repeat: 5 });
  }

  // ---------- les fins ----------
  gameOver() {
    this.etape = 'fin';
    jouerSon(this, 'ui_defaite');
    this.visage('machiavelique');
    this.dire([GAME_OVER], () => { arreterMusique('beufa_duel'); this.ecranGameOver(); });
  }

  // V88 : l'écran GAME OVER façon Metal Gear Solid (vidéo de Fabien) : écran noir, « GAME OVER » en CONTOUR cyan
  // tracé de gauche à droite par un ÉCLAT bleu (traînées horizontales), puis CONTINUE / EXIT dessous.
  ecranGameOver() {
    this.etape = 'fin';
    const CYAN = 0x38d8ff, Y = 225;
    this.add.rectangle(0, 0, LARGEUR, HAUTEUR, 0x000000).setOrigin(0).setDepth(900).setInteractive();
    const style = { fontFamily: '"Arial Black", Impact, sans-serif', fontStyle: 'italic', fontSize: '104px', color: 'rgba(0,0,0,0)', stroke: '#38d8ff', strokeThickness: 3 };
    const titre = this.add.text(LARGEUR / 2, Y, 'GAME  OVER', style).setOrigin(0.5).setDepth(902);
    const halo = this.add.text(LARGEUR / 2, Y, 'GAME  OVER', { ...style, stroke: '#1e78ff', strokeThickness: 9 }).setOrigin(0.5).setDepth(901).setAlpha(0.25);
    const ligne = this.add.rectangle(titre.x - titre.width / 2 + 20, Y + 50, titre.width - 40, 2, CYAN).setOrigin(0, 0.5).setDepth(902);
    // le DÉVOILEMENT : un masque qui s'élargit de gauche à droite, l'éclat suit son bord
    const x0 = titre.x - titre.width / 2 - 10, largeurT = titre.width + 20;
    const formeMasque = this.make.graphics({ add: false });
    const masque = formeMasque.createGeometryMask();
    [titre, halo, ligne].forEach((o) => o.setMask(masque));
    const eclat = this.add.ellipse(x0, Y, 90, 26, 0x2a7cff, 0.9).setDepth(903).setBlendMode(Phaser.BlendModes.ADD);
    const rayon = this.add.rectangle(x0, Y, 6, 200, 0x6ab4ff, 0.8).setDepth(903).setBlendMode(Phaser.BlendModes.ADD);
    const prog = { k: 0 };
    jouerSon(this, 'beufa_gameover');   // V89 : le vrai son (vidéo de Fabien) ; le dévoilement suit son rythme
    this.tweens.add({ targets: prog, k: 1, duration: 3200, ease: 'Sine.InOut',
      onUpdate: () => {
        const bx = x0 + largeurT * prog.k;
        formeMasque.clear().fillStyle(0xffffff).fillRect(x0, Y - 80, largeurT * prog.k, 160);
        eclat.setPosition(bx, Y + Phaser.Math.Between(-30, 30)).setScale(0.8 + Math.random() * 0.6, 1);
        rayon.setPosition(bx, Y).setAlpha(0.4 + Math.random() * 0.5);
        if (Math.random() < 0.35) {   // les traînées fines, comme dans le jeu
          const t = this.add.rectangle(bx - Phaser.Math.Between(20, 200), Y + Phaser.Math.Between(-90, 90), Phaser.Math.Between(40, 160), 1, CYAN, 0.8).setDepth(903);
          this.tweens.add({ targets: t, alpha: 0, x: t.x - 60, duration: 350, onComplete: () => t.destroy() });
        }
      },
      onComplete: () => {
        this.tweens.add({ targets: [eclat, rayon], alpha: 0, duration: 250 });
        this.tweens.add({ targets: halo, alpha: 0.5, duration: 400, yoyo: true, repeat: -1 });
        this.afficherChoixGameOver(Y + 72);
      } });
  }

  afficherChoixGameOver(y) {
    this.choixGO = 0;
    const style = { fontFamily: '"Arial Black", Impact, sans-serif', fontStyle: 'italic', fontSize: '22px', color: '#38d8ff' };
    this.optionsGO = [['CONTINUE', LARGEUR / 2 - 140], ['E X I T', LARGEUR / 2 + 160]].map(([mot, x], i) => {
      const t = this.add.text(x, y, mot, style).setOrigin(0.5).setDepth(902).setInteractive({ useHandCursor: true });
      t.on('pointerover', () => { this.choixGO = i; this.majChoixGO(); });
      t.on('pointerdown', () => { this.choixGO = i; this.validerGameOver(); });
      return t;
    });
    texte(this, LARGEUR / 2, HAUTEUR - 40, `${this.bons} bonne(s) réponse(s) sur ${this.numero}`, 16, '#2a6a80').setDepth(902);
    this.majChoixGO();
    this.time.delayedCall(400, () => { this.etape = 'gameover'; });
  }

  majChoixGO() {
    this.optionsGO.forEach((t, i) => {
      t.setColor(i === this.choixGO ? '#bff4ff' : '#1c6a80').setStroke(i === this.choixGO ? '#38d8ff' : '#000000', i === this.choixGO ? 2 : 0);
      t.setScale(i === this.choixGO ? 1.15 : 1);
    });
  }

  validerGameOver() {
    if (this.etape !== 'gameover') return;
    this.etape = 'fin';
    jouerSon(this, 'ui_valider');
    // V91 : CONTINUE garde les scores de l'infiltration et compte les continues (pour le classement)
    if (this.choixGO === 0) this.scene.restart({ ...this.donnees, reprise: true, continues: (this.donnees.continues || 0) + 1 });
    else this.retourHub();
  }

  gagne() {
    this.hudNumero.setText('');
    jouerSon(this, 'beufa_bon');   // V92 : le son de réussite est gardé pour l'apparition du rang (il jouait 2 fois)
    this.visage('choque');
    this.dire([VICTOIRE], () => {
      this.etape = 'fin';
      this.victoire(`Quiz de BEUFA réussi : ${this.bons}/${this.questions.length} bonnes réponses, ${this.erreurs} erreur(s). Sa base est à toi !`);
    });
  }

  // ---------- V91 : l'écran de RÉSULTATS façon MGS (classement + médaille) ----------
  calculerRang() {
    // V92 : infiltration pas jouée (quiz lancé seul) = 0 point d'infiltration (avant : 50 « gratuits »)
    // V94 : + temps d'infiltration + difficulté (réglages : R.quiz.rang et bonusRang de DIFFICULTES)
    const d = this.donnees, alertes = d.alertes ?? 0, continues = d.continues || 0, Q = R.quiz.rang;
    const joue = d.alertes !== undefined, temps = d.temps ?? 9999;
    this.ptsTemps = joue ? Math.round(Q.bonusTemps * Math.max(0, Math.min(1, (Q.tempsZero - temps) / (Q.tempsZero - Q.tempsPlein)))) : 0;
    this.ptsDiff = (DIFFICULTES[this.nomDiff] || DIFFICULTES.normal).bonusRang || 0;
    const points = this.bons * 10 + (joue ? Math.max(0, Q.alertes - alertes * Q.parAlerte) + this.ptsTemps : 0) + this.ptsDiff - continues * Q.parContinue;
    // BIG BOSS : 0 alerte, 10/10, 0 continue, infiltration rapide, en NORMAL ou EXTREME
    if (joue && alertes === 0 && this.bons === this.questions.length && continues === 0 && temps <= Q.tempsPlein && this.ptsDiff >= 0) return { ...RANG_PARFAIT, points, parfait: true };
    return { ...RANGS.find((r) => points >= r.min), points };
  }

  ecranVictoire() {
    arreterMusique('beufa_duel');
    const P = 1000, d = this.donnees, rang = this.calculerRang();
    // V92 : le MEILLEUR RANG est gardé (affiché au hub sous la porte) — seulement si l'infiltration a été jouée
    const ordre = [RANG_PARFAIT.nom, ...RANGS.map((r) => r.nom)];
    const cle = cleRecord('beufa', this.nomDiff);   // V18 : un record par difficulté (comme les autres boss)
    const avant = Sauvegarde.record(cle);
    // V94 : ENTRAÎNEMENT = pas de record (comme Kédric et Lionel)
    const entrainement = this.nomDiff === 'entrainement';
    const record = d.alertes !== undefined && !entrainement ? Sauvegarde.proposerRecord(cle, rang.nom, d.temps ?? 5999, ordre) : avant;
    const nouveau = d.alertes !== undefined && !entrainement && (!avant || avant.rang !== record.rang || avant.temps !== record.temps);
    const minutes = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    this.add.rectangle(0, 0, LARGEUR, HAUTEUR, 0x000000).setOrigin(0).setDepth(P);
    // les lignes de balayage du codec
    const sc = this.add.graphics().setDepth(P + 1);
    sc.fillStyle(VERT, 0.05); for (let y = 0; y < HAUTEUR; y += 4) sc.fillRect(0, y, LARGEUR, 1);
    const st = (taille, couleur = VERT_TXT) => ({ fontFamily: 'monospace', fontSize: taille + 'px', color: couleur });
    this.add.text(60, 40, 'RÉSULTATS DE LA MISSION', st(26)).setDepth(P + 2);
    this.add.rectangle(60, 80, 520, 2, VERT).setOrigin(0).setDepth(P + 2);
    const lignes = [
      ['DIFFICULTÉ', `${(DIFFICULTES[this.nomDiff] || DIFFICULTES.normal).nom} (${this.ptsDiff >= 0 ? '+' : ''}${this.ptsDiff})`],
      ['TEMPS D\'INFILTRATION', d.temps !== undefined ? `${minutes(d.temps)} (+${this.ptsTemps})` : '—'],
      ['ALERTES', d.alertes !== undefined ? String(d.alertes) : '— (non jouée)'],
      ['BONNES RÉPONSES', `${this.bons} / ${this.questions.length}`],
      ['ERREURS', String(this.erreurs) + (this.jokersUtilises ? ` (+${this.jokersUtilises} effacée par le joker)` : '')],
      ['CONTINUES', String(d.continues || 0)],
      ['POINTS', String(rang.points)],
    ];
    lignes.forEach(([a, b], i) => {
      const y = 100 + i * 30;   // V94 : 8 lignes (30 px d'écart, avant 36)
      const ta = this.add.text(70, y, a, st(20, '#4fbf80')).setDepth(P + 2).setAlpha(0);
      const tb = this.add.text(570, y, b, st(20, '#e8fff0')).setOrigin(1, 0).setDepth(P + 2).setAlpha(0);
      this.tweens.add({ targets: [ta, tb], alpha: 1, delay: 300 + i * 250, duration: 150 });
      this.time.delayedCall(300 + i * 250, () => jouerSon(this, 'beufa_codec'));
    });
    // le RANG (« CODE NAME ») tombe en dernier
    const tDebut = 300 + lignes.length * 250 + 400;
    const titre = this.add.text(60, 340, 'CODE NAME', st(20)).setDepth(P + 2).setAlpha(0);
    const nom = this.add.text(60, 368, rang.nom, { fontFamily: '"Arial Black", Impact, sans-serif', fontStyle: 'italic', fontSize: '64px', color: rang.parfait ? '#ffd84a' : '#bff4ff', stroke: rang.parfait ? '#b37a00' : '#1c8c5a', strokeThickness: 4 }).setDepth(P + 2).setAlpha(0).setScale(2);
    const phrase = this.add.text(62, 450, rang.phrase, st(18, '#e8fff0')).setDepth(P + 2).setAlpha(0);
    this.time.delayedCall(tDebut, () => {
      jouerSon(this, 'beufa_reussi');
      this.cameras.main.flash(250, 120, 255, 170);
      this.tweens.add({ targets: titre, alpha: 1, duration: 200 });
      this.tweens.add({ targets: nom, alpha: 1, scale: 1, duration: 450, ease: 'Back.Out' });
      this.tweens.add({ targets: phrase, alpha: 1, delay: 400, duration: 300 });
      const txtRecord = entrainement ? 'ENTRAÎNEMENT : pas de record' : nouveau ? '★ NOUVEAU RECORD ★' : record ? `MEILLEUR RANG : ${record.rang}` : '(joue l\'infiltration avant pour être classé)';
      const tr = this.add.text(62, 486, txtRecord, st(18, nouveau ? '#ffd84a' : '#4fbf80')).setDepth(P + 2).setAlpha(0);
      this.tweens.add({ targets: tr, alpha: 1, delay: 800, duration: 300 });
      if (nouveau) this.tweens.add({ targets: tr, alpha: 0.4, delay: 1100, duration: 500, yoyo: true, repeat: -1 });
    });
    // la MÉDAILLE de la mission (dessinée), qui se balance
    const medaille = this.dessinerMedaille(P + 3, rang.parfait);
    medaille.setPosition(770, -260);
    this.tweens.add({ targets: medaille, y: 40, delay: 500, duration: 900, ease: 'Bounce.Out' });
    this.tweens.add({ targets: medaille, angle: { from: -4, to: 4 }, delay: 1400, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.add.text(LARGEUR - 30, HAUTEUR - 30, `${estTactile() ? 'OK' : 'ESPACE'} : retour au hub`, st(16, '#4fbf80')).setOrigin(1, 1).setDepth(P + 2);
  }

  // La médaille : ruban rayé (vert / rouge / or), disque doré, étoile, « B » de Beufa. Or plus vif si BIG BOSS.
  dessinerMedaille(prof, parfait) {
    const c = this.add.container(0, 0).setDepth(prof);
    const g = this.add.graphics();
    const rayures = [0x2e6b3a, 0xc8a040, 0xb3202c, 0xc8a040, 0x2e6b3a];
    rayures.forEach((col, i) => g.fillStyle(col).fillRect(-50 + i * 20, 0, 20, 150));
    g.fillStyle(0x000000, 0.25).fillTriangle(-50, 150, 50, 150, 0, 175);
    g.lineStyle(3, 0x1a1a1a).strokeRect(-50, 0, 100, 150);
    const orC = parfait ? 0xffd84a : 0xd8b050, orF = parfait ? 0xb37a00 : 0x8c6a20;
    g.fillStyle(orF).fillCircle(0, 230, 78);
    g.fillStyle(orC).fillCircle(0, 230, 70);
    g.lineStyle(3, orF).strokeCircle(0, 230, 56);
    for (let k = 0; k < 24; k++) {   // les crans du bord
      const a = (k / 24) * Math.PI * 2;
      g.fillStyle(orF).fillCircle(Math.cos(a) * 74, 230 + Math.sin(a) * 74, 3);
    }
    const etoile = this.add.star(0, 230, 5, 20, 46, parfait ? 0xfff3a8 : 0xf0d890).setStrokeStyle(3, orF);
    const lettre = this.add.text(0, 232, 'B', { fontFamily: '"Arial Black", Impact, sans-serif', fontSize: '34px', color: '#8c6a20' }).setOrigin(0.5);
    const titre = this.add.text(0, 320, parfait ? 'BIG BOSS' : 'MÉDAILLE DE BEUFA', { fontFamily: 'monospace', fontSize: '15px', color: '#ffd84a' }).setOrigin(0.5);
    c.add([g, etoile, lettre, titre]);
    return c;
  }

  // ---------- le clavier ----------
  touche(k) {
    if (this.etape === 'dialogue' && (k === ' ' || k === 'Enter')) this.avancer();
    else if (this.etape === 'gameover') {
      if (k === 'ArrowLeft' || k === 'ArrowRight') { this.choixGO ^= 1; this.majChoixGO(); jouerSon(this, 'beufa_codec'); }
      else if (k === ' ' || k === 'Enter') this.validerGameOver();
      else if (k === 'Escape') { this.choixGO = 1; this.validerGameOver(); }
    }
    else if (this.etape === 'question') {
      if (['1', '2', '3', '4'].includes(k)) { this.selection = Number(k) - 1; this.repondre(this.selection); }
      else if (k === 'ArrowLeft' || k === 'ArrowRight') { this.selection ^= 1; this.majSelection(); }
      else if (k === 'ArrowUp' || k === 'ArrowDown') { this.selection ^= 2; this.majSelection(); }
      else if (k === ' ' || k === 'Enter') this.repondre(this.selection);
    }
  }

  update(_, dtMs) {
    const dt = dtMs / 1000;
    // la machine à écrire du codec (un petit « bip » toutes les 3 lettres)
    if (this.etape === 'dialogue' && this.ligne && this.lettres < this.ligne.length) {
      const avant = Math.floor(this.lettres);
      this.lettres = Math.min(this.ligne.length, this.lettres + dt * R.quiz.lettresParSeconde);
      if (Math.floor(this.lettres) !== avant) {
        this.texteCodec.setText(this.ligne.slice(0, Math.floor(this.lettres)));
        if (Math.floor(this.lettres) % 3 === 0) jouerSon(this, 'beufa_codec');
      }
      if (this.lettres >= this.ligne.length) this.suite.setVisible(true);
    }
    // l'effet « Psycho » : portrait et buste qui tremblent pendant la lecture des pensées
    if (this.psy) {
      this.portrait.setPosition(89 + (Math.random() - 0.5) * 4, 445 + (Math.random() - 0.5) * 4);
      this.buste.y = this.busteY + Math.sin(this.time.now / 200) * 4;
    } else if (this.portrait) this.portrait.setPosition(89, 445);
    // le CHRONO : 1 minute ; les 10 dernières secondes, il passe au rouge et fait « tic »
    if (this.etape === 'question') {
      this.reste -= dt;
      const k = Math.max(0, this.reste / R.quiz.temps);
      this.chronoBarre.width = 300 * k;
      this.chronoBarre.setFillStyle(this.reste < 10 ? 0xff3838 : VERT);
      this.chronoTexte.setText(Math.ceil(Math.max(0, this.reste)) + ' s');
      if (this.reste < 10 && this.dernierTic === 99) this.visage('machiavelique');   // il savoure ton stress
      if (this.reste < 10 && Math.ceil(this.reste) !== this.dernierTic) { this.dernierTic = Math.ceil(this.reste); jouerSon(this, 'beufa_tic'); }
      if (this.reste <= 0) this.repondre(-1);
    }
  }
}
