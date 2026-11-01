// BEUFA — PHASE 2 : LE QUIZ (après l'infiltration). Le bureau de Beufa, façon CODEC de Metal Gear :
// une case en bas avec SA TÊTE et ses répliques. Intro : masqué (façon Psycho Mantis), il « lit dans tes
// pensées », puis enlève son masque (« il fait trop chaud ») et lance le quiz.
// 10 questions de culture jeu vidéo (QCM à 4 choix), 1 minute chacune ; chaque erreur = une CROIX rouge,
// 3 croix = GAME OVER (façon MGS). Tout le texte est dans data/beufa_quiz.js.
import { BossScene } from '../../core/BossScene.js';
import { BeufaInfiltration } from './BeufaInfiltration.js';
import { texte, voile } from '../../core/ui.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { jouerSon } from '../../core/ressources.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { IDENTITE, REGLAGES as R } from './reglages.js';
import { QUESTIONS, LECTURE_DEBUT, LECTURES, MASQUE_CHAUD, DEBUT_QUIZ, MOQUERIES, TROP_TARD, BRAVOS, VICTOIRE, GAME_OVER } from '../../../data/beufa_quiz.js';

const VERT = 0x38fc8c, VERT_TXT = '#7dffb0';
const hasard = (liste) => liste[Math.floor(Math.random() * liste.length)];
const melange = (liste) => { const l = [...liste]; for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } return l; };

export class BeufaQuiz extends BossScene {
  constructor() { super('BeufaQuiz', IDENTITE); }

  create() {
    // les images de Fabien (fond blanc retiré, taille du jeu) : même préparation que l'infiltration — une seule
    // fois par image, quelle que soit la scène qui passe en premier (on peut lancer le quiz directement)
    BeufaInfiltration.prototype.preparerImages.call(this);
    const Q = R.quiz;
    this.etape = 'intro';
    this.erreurs = 0; this.bons = 0; this.numero = 0;
    this.masque = !this.donnees.reprise;   // une nouvelle tentative après un GAME OVER saute la lecture des pensées
    this.questions = melange(QUESTIONS).slice(0, Q.questions);
    etiquettesTactiles({ espace: 'OK', z: null, x: null, haut: null, bas: null, gauche: null, droite: null });

    this.creerBureau();
    this.creerCodec();
    this.creerHud();

    // le clavier : ESPACE / ENTRÉE avancent ou valident, 1-4 répondent, flèches choisissent
    this.input.keyboard.on('keydown', (ev) => this.touche(ev.key));
    this.input.on('pointerdown', (p) => { if (p.y > 352 && this.etape === 'dialogue') this.avancer(); });

    const lancer = () => (this.masque ? this.introMasque() : (this.visage('machiavelique'), this.dire(DEBUT_QUIZ, () => this.questionSuivante())));
    if (this.donnees.reprise) lancer();
    else this.afficherIntro('BEUFA — LE QUIZ', [
      'Beufa t\'attend dans son bureau…',
      '10 questions de culture JEU VIDÉO, 1 minute chacune',
      `Réponds avec ${estTactile() ? 'le doigt' : '1 2 3 4, ou ◀ ▶ ▲ ▼ puis ESPACE'}`,
      '3 erreurs = GAME OVER',
      `${estTactile() ? 'OK' : 'ESPACE'} : faire avancer le dialogue`,
    ], lancer);
  }

  // ---------- le décor : le bureau de Beufa ----------
  creerBureau() {
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
    texte(this, LARGEUR - 186, 22, 'ERREURS', 14, '#aaaaaa').setOrigin(1, 0.5).setDepth(60);
    this.croix = [0, 1, 2].map((i) => {
      const x = LARGEUR - 160 + i * 50;
      this.add.rectangle(x, 24, 38, 34, 0x000000, 0.6).setStrokeStyle(2, 0x888888).setDepth(60);
      return texte(this, x, 24, '✕', 30, '#ff3838').setDepth(61).setVisible(false);
    });
    this.chronoFond = this.add.rectangle(LARGEUR / 2, 52, 404, 12, 0x000000, 0.7).setStrokeStyle(1, 0x888888).setDepth(60).setVisible(false);
    this.chronoBarre = this.add.rectangle(LARGEUR / 2 - 200, 52, 400, 8, VERT).setOrigin(0, 0.5).setDepth(61).setVisible(false);
    this.chronoTexte = texte(this, LARGEUR / 2 + 230, 52, '', 16, '#ffffff').setOrigin(0, 0.5).setDepth(61);
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
        this.cameras.main.shake(150, 0.004);
        this.masque = false;
        this.buste.setTexture('beufa_buste'); this.buste.setScale(215 / this.buste.height);
        this.visage('calme');
        this.time.delayedCall(700, () => {
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
    this.dire([GAME_OVER], () => {
      this.etape = 'fin';
      voile(this, 0.9).setDepth(900);
      texte(this, LARGEUR / 2, 200, 'GAME OVER', 72, '#ff3838').setDepth(901);
      texte(this, LARGEUR / 2, 290, `${this.bons} bonne(s) réponse(s) sur ${this.numero}`, 22, '#ffffff').setDepth(901);
      const rejouer = texte(this, LARGEUR / 2, 380, `${estTactile() ? 'OK' : 'ESPACE'} : CONTINUE ?`, 28, '#ffd84a').setDepth(901).setInteractive();
      const hub = texte(this, LARGEUR / 2, 440, 'Retour au hub', 20, '#aaaaaa').setDepth(901).setInteractive();
      rejouer.on('pointerdown', () => this.scene.restart({ reprise: true }));
      hub.on('pointerdown', () => this.retourHub());
      this.time.delayedCall(500, () => { this.etape = 'gameover'; });
    });
  }

  gagne() {
    this.hudNumero.setText('');
    jouerSon(this, 'beufa_reussi');
    this.visage('choque');
    this.dire([VICTOIRE], () => {
      this.etape = 'fin';
      this.victoire(`Quiz de BEUFA réussi : ${this.bons}/${this.questions.length} bonnes réponses, ${this.erreurs} erreur(s). Sa base est à toi !`);
    });
  }

  // ---------- le clavier ----------
  touche(k) {
    if (this.etape === 'dialogue' && (k === ' ' || k === 'Enter')) this.avancer();
    else if (this.etape === 'gameover' && (k === ' ' || k === 'Enter')) this.scene.restart({ reprise: true });
    else if (this.etape === 'gameover' && k === 'Escape') this.retourHub();
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
      this.chronoBarre.width = 400 * k;
      this.chronoBarre.setFillStyle(this.reste < 10 ? 0xff3838 : VERT);
      this.chronoTexte.setText(Math.ceil(Math.max(0, this.reste)) + ' s');
      if (this.reste < 10 && this.dernierTic === 99) this.visage('machiavelique');   // il savoure ton stress
      if (this.reste < 10 && Math.ceil(this.reste) !== this.dernierTic) { this.dernierTic = Math.ceil(this.reste); jouerSon(this, 'beufa_tic'); }
      if (this.reste <= 0) this.repondre(-1);
    }
  }
}
