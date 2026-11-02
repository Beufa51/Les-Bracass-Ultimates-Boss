// =====================================================================
// RÉMI — JEU 1 : LE VÉLO (vue de PROFIL, la ville défile vers la gauche)
// Rejoindre le bar avant la fermeture en évitant les bourrés :
//   ▶ pédaler   ◀ freiner   ▲ (ou ESPACE) sauter   Z sonnette (DRING : un bourré DEBOUT s'écarte)
//   bourré ALLONGÉ : saute ; bourré DEBOUT : sonne (on ne saute pas par-dessus) ; bourré qui TRAVERSE : freine ou fonce ;
//   verre cassé : saute (sinon crevaison = ça ralentit) ; flaque : saute (sinon glissade).
// Une chute coûte du temps ; si le bar ferme avant ton arrivée : perdu.
// =====================================================================
import { BossScene } from '../../core/BossScene.js';
import { creerTouches, vientDAppuyer } from '../../core/clavier.js';
import { texte } from '../../core/ui.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { jouerSon } from '../../core/ressources.js';
import { estTactile, etiquettesTactiles, disposition } from '../../core/tactile.js';
import { IDENTITE, DIFFICULTES, VELO as V, REPLIQUES } from './reglages.js';
import { cycliste, bourre, verreCasse, flaque, remi, COULEURS } from './dessins.js';
import { bulle, annonce, jeuSuivant, ecranPerdu, hasard, choisir } from './commun.js';
import { choisirDifficulte } from './difficulte.js';

const SOL = 440;                     // hauteur de la route à l'écran
const DEMI_VELO = 50;                // demi-longueur du vélo pour les chocs (un peu plus petite que l'image : indulgent)
const X_VELO = 260;                  // le vélo reste à cet endroit de l'écran (c'est la rue qui défile)
const ETIQUETTES_JEU = { gauche: '◀ Frein', droite: 'Sprint ▶', haut: '▲ Saut', bas: null, espace: null, z: 'DRING', x: null };
// hauteur et demi-largeur de chaque obstacle (collisions)
// (debout et traverse : plus hauts que le plus grand saut, on ne peut pas les sauter)
const TAILLE = { allonge: [40, 45], verre: [10, 28], debout: [160, 18], traverse: [160, 20], vomi: [4, 42] };
// illustration des bourrés (remi_bourres.png : debout, sursaute, allongé, traverse de face) et sa taille à l'écran
const BOURRE = 0.25, IMAGE_BOURRE = { debout: 0, ecarte: 1, allonge: 2, marche: 3 };
const TEINTES = [0xffffff, 0xffe2d8, 0xdfe6ff, 0xe4ffd9, 0xfff3c0];
const AIDES = {
  allonge: () => '▲ SAUTE par-dessus !',
  verre: () => '▲ SAUTE le verre cassé !',
  vomi: () => '▲ SAUTE la flaque !',
  debout: () => (estTactile() ? 'DRING' : 'Z') + ' : SONNE pour qu\'il s\'écarte !',
  traverse: () => '◀ FREINE (ou fonce ▶) : il traverse !',
};

export class RemiVelo extends BossScene {
  constructor() { super('RemiVelo', IDENTITE); }

  create() {
    this.etat = 'intro';
    this.nomDiff = 'normal'; this.diff = DIFFICULTES.normal;
    this.bx = 0; this.v = 0; this.y = 0; this.vy = 0; this.a = 0;
    this.chute = 0; this.glisse = 0; this.recharge = 0; this.dring = 0; this.horloge = 0;
    this.prochainTexto = 9; this.aidesVues = {}; this.chutes = 0;
    this.souffle = 1; this.tenu = 0; this.tampon = 0; this.invincible = 0;
    this.obstacles = [];

    this.creerDecor();
    this.decor = this.add.graphics().setDepth(2);
    this.gVelo = this.add.graphics().setDepth(10);
    // l'illustration du vélo (8 poses) ; sans fichier, c'est le dessin du code
    this.sprVelo = this.textures.exists('remi_velo') ? this.add.sprite(0, 0, 'remi_velo', 0).setOrigin(0.5, 1).setDepth(10).setScale(0.6) : null;
    this.gRemi = this.add.graphics().setDepth(6);
    this.facade = this.textures.exists('remi_bar_facade') ? this.add.image(0, 0, 'remi_bar_facade').setOrigin(0.5, 1).setScale(340 / 917).setDepth(3).setVisible(false) : null;
    this.sprRemi = this.textures.exists('remi_porte') ? this.add.sprite(0, 0, 'remi_porte', 0).setFlipX(true).setOrigin(0.7, 1).setScale(0.42).setDepth(6).setVisible(false) : null;
    this.enseigne = texte(this, 0, 0, 'BAR', 54, '#ff4fd8', { fontStyle: 'bold', stroke: '#5a0a4a', strokeThickness: 6 }).setDepth(4).setVisible(false);
    this.creerHud();

    disposition('separee');
    this.events.once('shutdown', () => disposition('normale'));
    this.touches = creerTouches(this);
    this.dessiner();

    etiquettesTactiles({ haut: null, bas: null, gauche: null, droite: null, espace: 'OK', z: null, x: null });
    const t = estTactile();
    this.afficherIntro('RÉMI - Direction le bar', [
      'Rémi t\'attend au bar... et le bar ferme bientôt !',
      'Le vélo roule tout seul.   ▶ : SPRINT (jauge d\'endurance)   ◀ : freiner',
      '▲' + (t ? '' : ' (ou ESPACE)') + ' : sauter (garde appuyé = saut plus haut et plus long)',
      (t ? 'DRING' : 'Z') + ' : sonnette (un bourré DEBOUT s\'écarte, pas trop tôt !)',
      'Bourré ALLONGÉ, verre cassé, flaque : saute par-dessus.',
      'Bourré qui TRAVERSE : freine pour le laisser passer (ou fonce).',
      'Chaque chute te fait perdre du temps.',
    ], () => this.presentation(() => this.choixDifficulte()));
  }

  presentation(ensuite) {
    this.afficherPresentation({
      image: 'remi_presentation', nom: 'RÉMI', surnom: 'Le Roi du Comptoir', couleur: '#e8742a',
      infos: ['Spécialité : la sortie au bar', 'Arme : le beer pong', 'Signe distinctif : tape dans les portes',
        'Devise : « Allez, une dernière ! »'],
      invite: 'en selle !',
    }, ensuite);
  }

  choixDifficulte() {
    choisirDifficulte(this, 'remi', DIFFICULTES, (nom, diff) => { this.nomDiff = nom; this.diff = diff; this.demarrer(); });
  }

  // (re)démarrage du trajet (aussi appelé directement par les tests)
  demarrer() {
    this.genererParcours();
    this.bx = 0; this.v = 120; this.y = 0; this.vy = 0; this.souffle = 1; this.invincible = 0;
    this.tempsRestant = this.diff.temps;
    this.etat = 'jeu';
    etiquettesTactiles(ETIQUETTES_JEU);
    annonce(this, 'C\'EST PARTI !', '#7fff7f', 0.8);
  }

  genererParcours() {
    for (const o of this.obstacles) { o.g.destroy(); if (o.spr) o.spr.destroy(); }
    this.obstacles = [];
    const poids = Object.entries(V.types), total = poids.reduce((s, [, p]) => s + p, 0);
    const tirer = () => { let r = Math.random() * total; for (const [n, p] of poids) { r -= p; if (r <= 0) return n; } return 'debout'; };
    // les 3 premiers obstacles apprennent les gestes : allongé (saut), debout (sonnette), traverse (frein)
    const debut = ['allonge', 'debout', 'traverse'];
    let x = 1200, k = 0;
    while (x < V.longueur - 800) {
      const type = k < debut.length ? debut[k] : tirer();
      k++;
      if (type === 'groupe') { for (let i = 0; i < 3; i++) this.ajouter('debout', x + i * 70); x += 140; }
      else this.ajouter(type, x);
      x += hasard(V.ecart[0], V.ecart[1]) / this.diff.densite + (type === 'traverse' ? 160 : 0);
    }
  }

  ajouter(type, x) {
    const g = this.add.graphics().setDepth(type === 'traverse' ? 5 : 8);
    const spr = IMAGE_BOURRE[type === 'traverse' ? 'marche' : type] !== undefined && this.textures.exists('remi_bourres')
      ? this.add.sprite(0, 0, 'remi_bourres', 0).setOrigin(0.5, 1).setDepth(g.depth).setTint(choisir(TEINTES)).setVisible(false) : null;
    this.obstacles.push({ type, x, etat: 'normal', t: Math.random() * 6, p: 0, touche: false, g, spr, couleur: choisir(COULEURS.bourre) });
  }

  // ---------- décor : immeubles en 2 plans (textures faites une fois), lampadaires et route dessinés à chaque image ----------
  creerDecor() {
    this.cameras.main.setBackgroundColor('#0d1030');
    const ciel = this.add.graphics().setDepth(0);
    ciel.fillGradientStyle(0x0b0d2a, 0x0b0d2a, 0x2a1f4a, 0x2a1f4a, 1).fillRect(0, 0, LARGEUR, SOL);
    ciel.fillStyle(0xf6f1d0, 1).fillCircle(820, 70, 26);
    ciel.fillStyle(0x0b0d2a, 1).fillCircle(810, 64, 22);
    for (let k = 0; k < 40; k++) ciel.fillStyle(0xffffff, Math.random() * 0.6 + 0.2).fillRect(Math.random() * LARGEUR, Math.random() * 200, 2, 2);
    this.planLoin = this.add.tileSprite(0, SOL - 230, LARGEUR, 230, this.texImmeubles('remi_loin', 0x1c1a3a, 0.35, 160)).setOrigin(0, 0).setDepth(1);
    this.planPres = this.add.tileSprite(0, SOL - 260, LARGEUR, 260, this.texImmeubles('remi_pres', 0x2a2448, 0.8, 230)).setOrigin(0, 0).setDepth(1);
    // l'illustration de la rue (ciel, façades, lampadaires), posée sur le trottoir : remplace les immeubles dessinés
    if (this.textures.exists('remi_rue')) {
      const k = (SOL - 14) / 575;
      this.rue = this.add.tileSprite(0, 0, LARGEUR, SOL - 14, 'remi_rue').setOrigin(0, 0).setTileScale(k).setDepth(1);
      this.rueEchelle = k;
      ciel.setVisible(false); this.planLoin.setVisible(false); this.planPres.setVisible(false);
    }
  }

  texImmeubles(cle, couleur, lumiere, hMax) {
    if (this.textures.exists(cle)) return cle;
    const W = 1600, H = hMax + 30, tex = this.textures.createCanvas(cle, W, H), c = tex.getContext();
    let x = 0;
    while (x < W) {
      const w = Math.min(W - x, 90 + Math.floor(Math.random() * 120)), h = 80 + Math.random() * (hMax - 80);
      c.fillStyle = '#' + couleur.toString(16).padStart(6, '0'); c.fillRect(x, H - h, w - 4, h);
      for (let wy = H - h + 14; wy < H - 20; wy += 26) {
        for (let wx = x + 10; wx < x + w - 20; wx += 22) {
          if (Math.random() < 0.45) { c.fillStyle = `rgba(255, 214, 120, ${lumiere * (0.5 + Math.random() * 0.5)})`; c.fillRect(wx, wy, 11, 14); }
        }
      }
      x += w;
    }
    tex.refresh();
    return cle;
  }

  creerHud() {
    this.hudTemps = texte(this, 140, 26, '', 22, '#ffd84a', { fontStyle: 'bold' }).setDepth(900);
    this.hudBarre = this.add.graphics().setDepth(900);
    this.hudVitesse = texte(this, LARGEUR - 90, 26, '', 20, '#ffffff').setDepth(900);
    this.aide = texte(this, LARGEUR / 2, 500, '', 26, '#ffffff', { fontStyle: 'bold', backgroundColor: '#000000aa', padding: { x: 12, y: 4 } }).setDepth(900).setVisible(false);
  }

  // ---------- boucle ----------
  update(temps, delta) {
    const dt = Math.min(delta, 50) / 1000;
    this.horloge += dt;
    if (this.etat === 'jeu') this.pas(dt);
    else if (this.etat === 'arrivee') this.pasArrivee(dt);
    this.dessiner();
  }

  pas(dt) {
    const T = this.touches;
    this.tempsRestant -= dt;
    if (this.tempsRestant <= 0) {
      this.tempsRestant = 0; this.etat = 'fin';
      ecranPerdu(this, 'LE BAR A FERMÉ', 'Rémi : « Bon ben je rentre... T\'étais où ?! »', this.nomDiff);
      return;
    }
    this.recharge = Math.max(0, this.recharge - dt);
    this.dring = Math.max(0, this.dring - dt);
    this.invincible = Math.max(0, this.invincible - dt);
    const sauter = vientDAppuyer(T.haut) || vientDAppuyer(T.espace), tenu = T.haut.isDown || T.espace.isDown;
    if (sauter) this.tampon = V.tampon;            // un saut demandé un peu trop tôt est gardé en mémoire
    this.tampon = Math.max(0, this.tampon - dt);
    if (this.chute > 0) {
      this.chute -= dt; this.v = 0;
      if (this.chute <= 0) { this.y = 0; this.vy = 0; this.invincible = V.invincible; this.v = V.croisiere * 0.5; }
    } else {
      // vitesse voulue : croisière ; SPRINT (▶) tant qu'il reste du souffle ; ◀ freine
      const sprint = T.droite.isDown && this.souffle > 0.02 && !T.gauche.isDown;
      this.souffle = Phaser.Math.Clamp(this.souffle + (sprint ? -V.endurance : V.recup) * dt, 0, 1);
      if (T.gauche.isDown) this.v = Math.max(0, this.v - V.freinage * dt);
      else {
        const cible = sprint ? V.vitesseMax : V.croisiere;
        this.v += Math.sign(cible - this.v) * Math.min(Math.abs(cible - this.v), V.acceleration * dt);
      }
      this.sprint = sprint;
      if (this.y === 0 && this.vy === 0 && this.tampon > 0) { this.vy = V.saut; this.tenu = 0; this.tampon = 0; jouerSon(this, 'remi_saut'); }
      if (vientDAppuyer(T.z) && this.recharge <= 0) this.sonner();
    }
    // saut : tant que ▲ est maintenu (au début), la gravité est plus faible = saut plus haut et plus long
    if (this.y > 0 || this.vy > 0) {
      this.tenu += dt;
      const leger = tenu && this.vy > 0 && this.tenu < V.sautTenu;
      this.y += this.vy * dt; this.vy -= (leger ? V.graviteTenue : V.gravite) * dt;
      if (this.y <= 0) { this.y = 0; this.vy = 0; jouerSon(this, 'remi_atterrit'); }
    }
    this.glisse = Math.max(0, this.glisse - dt);
    this.bx += this.v * dt;
    this.a += this.v * dt / 14;
    this.obstaclesPas(dt);
    // textos de Rémi
    this.prochainTexto -= dt;
    if (this.prochainTexto <= 0) { this.prochainTexto = hasard(10, 15); bulle(this, '📱 ' + choisir(REPLIQUES.textos), '#9fe0ff', 2.4, 76); jouerSon(this, 'remi_texto'); }
    if (this.bx >= V.longueur) this.arriver();
  }

  sonner() {
    this.recharge = V.sonnette; this.dring = 0.35;
    jouerSon(this, 'remi_sonnette');
    for (const o of this.obstacles) {
      const d = o.x - this.bx;
      if (o.type === 'debout' && o.etat === 'normal' && d > 60 && d < this.diff.sonnette) { o.etat = 'ecarte'; o.p = 0; }
    }
  }

  obstaclesPas(dt) {
    const aide = this.nomDiff !== 'champion';
    let texteAide = '';
    for (const o of this.obstacles) {
      o.t += dt;
      const d = o.x - this.bx;
      if (o.etat === 'ecarte') o.p = Math.min(1, o.p + dt / 0.4);
      // le bourré qui traverse part quand tu arrives (il te coupe la route ~1,1 s plus tard à pleine vitesse)
      if (o.type === 'traverse') {
        if (o.etat === 'normal' && d < 560) o.etat = 'marche';
        if (o.etat === 'marche') o.p = Math.min(1, o.p + dt * this.diff.traverse / 2.1);
      }
      if (aide && !this.aidesVues[o.type] && AIDES[o.type] && d < 520) {
        if (d < 0) this.aidesVues[o.type] = true;
        else if (o.etat !== 'ecarte') texteAide = AIDES[o.type]();
      }
      if (o.touche || this.chute > 0 || (this.invincible > 0 && o.type !== 'verre' && o.type !== 'vomi')) continue;
      const [h, w] = TAILLE[o.type];
      if (Math.abs(d) > w + DEMI_VELO) continue;
      if (o.type === 'debout' && o.etat === 'ecarte') continue;
      if (o.type === 'traverse' && (o.p < 0.36 || o.p > 0.74)) continue;
      if (this.y >= h) continue;
      o.touche = true;
      if (o.type === 'verre') { this.v *= V.crevaison; bulle(this, 'Crevaison... ça roule mal !', '#ffb0b0', 1.4, 120); jouerSon(this, 'remi_crevaison'); }
      else if (o.type === 'vomi') { if (this.v > 250) { this.v *= V.glissade; this.glisse = 0.8; bulle(this, 'Beurk, ça glisse !', '#d8e05a', 1.2, 120); jouerSon(this, 'remi_glisse'); } }
      else this.tomber(o);
    }
    this.aide.setVisible(!!texteAide).setText(texteAide);
  }

  tomber(o) {
    this.chute = V.chute; this.chutes++;
    this.y = 0; this.vy = 0;
    o.etat = 'ecarte'; o.p = 1;
    this.cameras.main.shake(250, 0.012);
    jouerSon(this, 'remi_chute');
    bulle(this, choisir(['Aïe !', 'Il m\'a pas vu !', 'Oh le boulet...', 'Ma roue !']), '#ff9a9a', 1.2, 120);
  }

  arriver() {
    this.etat = 'arrivee'; this.aide.setVisible(false);
    etiquettesTactiles({ haut: null, bas: null, gauche: null, droite: null, espace: null, z: null, x: null });
    jouerSon(this, 'remi_arrivee');
    annonce(this, 'AU BAR !', '#ff4fd8', 1.2);
    const marge = Math.ceil(this.tempsRestant);
    this.time.delayedCall(900, () => bulle(this, `Rémi : « ${REPLIQUES.arrivee} »`, '#ffd84a', 2.6, 90));
    this.time.delayedCall(700, () => bulle(this, `Arrivé ${marge} s avant la fermeture${this.chutes ? `, ${this.chutes} chute${this.chutes > 1 ? 's' : ''}` : ', sans tomber !'}`, '#7fff7f', 3, 140));
    this.time.delayedCall(3600, () => jeuSuivant(this, 'velo', this.nomDiff));
  }

  pasArrivee(dt) {
    this.v = Math.max(0, this.v - 500 * dt);
    if (this.y > 0) { this.y = Math.max(0, this.y + this.vy * dt); this.vy -= V.gravite * dt; }
    this.bx += this.v * dt; this.a += this.v * dt / 14;
  }

  // ---------- dessin ----------
  dessiner() {
    const cam = this.bx - (X_VELO);
    this.planLoin.tilePositionX = cam * 0.15;
    this.planPres.tilePositionX = cam * 0.35;
    if (this.rue) this.rue.tilePositionX = cam * 0.8 / this.rueEchelle;   // presque au pas de la route
    const g = this.decor.clear();
    // trottoir, route, marquages
    g.fillStyle(0x3a3a48, 1).fillRect(0, SOL - 14, LARGEUR, 14);
    g.fillStyle(0x23232c, 1).fillRect(0, SOL, LARGEUR, HAUTEUR - SOL);
    g.fillStyle(0x55556a, 1).fillRect(0, SOL - 14, LARGEUR, 3);
    g.fillStyle(0xdddddd, 0.7);
    for (let x = -((cam) % 120) - 120; x < LARGEUR; x += 120) g.fillRect(x, SOL + 52, 60, 6);
    // lampadaires
    for (let x = -((cam) % 380) - 380; !this.rue && x < LARGEUR + 380; x += 380) {   // (la rue illustrée a les siens)
      g.fillStyle(0xffe9a0, 0.08).fillTriangle(x + 20, SOL - 186, x - 70, SOL, x + 110, SOL);
      g.fillStyle(0x15151c, 1).fillRect(x - 3, SOL - 190, 6, 176).fillRect(x - 3, SOL - 192, 26, 5);
      g.fillStyle(0xffe9a0, 1).fillCircle(x + 20, SOL - 186, 5);
    }
    // le bar au bout du trajet
    const xBar = V.longueur + 260 - cam;
    if (xBar < LARGEUR + 400) {
      if (this.facade) {
        // l'illustration du bar (le néon clignote un peu)
        this.facade.setVisible(true).setPosition(xBar + 60, SOL + 2);
        this.facade.setTint(Math.sin(this.horloge * 9) > 0.6 ? 0xffe6ff : 0xffffff);
      } else {
        g.fillStyle(0x3b1f2b, 1).fillRect(xBar - 200, SOL - 300, 520, 286);
        g.fillStyle(0xffc860, 0.85).fillRect(xBar - 160, SOL - 170, 120, 90).fillRect(xBar + 140, SOL - 170, 120, 90);
        g.fillStyle(0x5a2a10, 1).fillRect(xBar + 30, SOL - 140, 70, 126);
        g.fillStyle(0xffd84a, 1).fillCircle(xBar + 88, SOL - 76, 4);
        this.enseigne.setVisible(true).setPosition(xBar + 60, SOL - 240).setAlpha(0.75 + 0.25 * Math.sin(this.horloge * 9));
      }
      const gr = this.gRemi.clear().setPosition(this.facade ? xBar - 120 : xBar - 20, SOL);
      if (this.sprRemi) this.sprRemi.setVisible(true).setPosition(xBar - 110, SOL + 4);   // Rémi (illustration de la porte, tourné vers toi)
      else remi(gr, 'garde', this.horloge);
    } else { this.enseigne.setVisible(false); this.gRemi.clear(); if (this.facade) this.facade.setVisible(false); if (this.sprRemi) this.sprRemi.setVisible(false); }
    // obstacles
    for (const o of this.obstacles) {
      const sx = o.x - cam;
      o.g.clear();
      if (o.spr) o.spr.setVisible(false);
      if (sx < -200 || sx > LARGEUR + 200) continue;
      if (o.type === 'verre') { o.g.setPosition(sx, SOL); verreCasse(o.g); continue; }
      if (o.type === 'vomi') { o.g.setPosition(sx, SOL); flaque(o.g); continue; }
      if (o.type === 'allonge') {
        if (o.spr) o.spr.setVisible(true).setFrame(IMAGE_BOURRE.allonge).setPosition(sx, SOL + 4).setScale(BOURRE);
        else { o.g.setPosition(sx, SOL).setRotation(0); bourre(o.g, 'allonge', o.t, o.couleur); }
        continue;
      }
      if (o.type === 'traverse') {
        // il arrive du fond (petit, plus haut) et passe devant (plus grand, plus bas)
        const p = o.p, y = SOL - 46 + p * 96, k = 0.72 + p * 0.5;
        o.g.setPosition(sx, y).setScale(k).setDepth(p < 0.55 ? 5 : 15).setRotation(Math.sin(o.t * 3) * 0.12);
        if (o.spr) {
          o.spr.setVisible(true).setFrame(IMAGE_BOURRE[o.etat === 'marche' ? 'marche' : 'debout']).setPosition(sx, y)
            .setScale(BOURRE * k).setDepth(p < 0.55 ? 5 : 15).setRotation(o.g.rotation).setFlipX(Math.sin(o.t * 3.5) > 0);
        } else bourre(o.g, o.etat === 'marche' ? 'marche' : 'debout', o.t, o.couleur);
        if (o.etat === 'marche' && p < 0.36) { o.g.fillStyle(0xff3030, 1).fillTriangle(-12, -168, 12, -168, 0, -146); }
        continue;
      }
      // debout : titube ; s'il a entendu la sonnette, il fait un bond vers le fond
      const p = o.etat === 'ecarte' ? o.p : 0;
      o.g.setPosition(sx + p * 18, SOL - p * 30 - Math.sin(p * Math.PI) * 40).setScale(1 - p * 0.25).setAlpha(1 - p * 0.3).setRotation(Math.sin(o.t * 2.1) * 0.14 - p * 0.3);
      if (o.spr) o.spr.setVisible(true).setFrame(IMAGE_BOURRE[p > 0 && p < 1 ? 'ecarte' : 'debout']).setDepth(p >= 1 ? 4 : 8)   // écarté : il reste sur le trottoir du fond.setPosition(o.g.x, o.g.y)
        .setScale(BOURRE * o.g.scaleX).setAlpha(o.g.alpha).setRotation(o.g.rotation);
      else bourre(o.g, p > 0 ? 'ecarte' : 'debout', o.t, o.couleur);
    }
    // toi
    const gv = this.gVelo.clear();
    const zig = this.glisse > 0 ? Math.sin(this.horloge * 30) * 0.12 : 0;
    const bond = this.chute > 0 ? 0 : -this.y;
    gv.setPosition(X_VELO, SOL + bond);
    if (this.chute > 0) gv.setRotation(-1.3 + (1 - this.chute / V.chute) * 0.2).setPosition(gv.x + 20, SOL - 30);
    else gv.setRotation((this.vy > 0 ? -0.12 : this.y > 0 ? 0.08 : 0) + zig);
    if (this.sprVelo) {
      const f = this.chute > 0 ? 7 : this.y > 0 ? 6 : Math.floor(this.a / (Math.PI * 2) * 6) % 6;
      this.sprVelo.setFrame(f).setPosition(X_VELO, SOL + bond + 6).setRotation(this.chute > 0 ? 0 : gv.rotation)
        .setAlpha(this.invincible > 0 && Math.floor(this.horloge * 12) % 2 ? 0.35 : 1);   // clignote après une chute
      gv.setRotation(0);
      // traits de vitesse en SPRINT
      if (this.sprint && this.etat === 'jeu') {
        gv.lineStyle(3, 0xffffff, 0.5);
        for (let k = 0; k < 5; k++) { const y = -30 - k * 26, x = -95 - ((this.horloge * 900 + k * 47) % 80); gv.lineBetween(x, y, x - 50, y); }
      }
      if (this.dring > 0) gv.lineStyle(3, 0xffe680, 1).strokeCircle(60, -150, 8).strokeCircle(60, -150, 16);
    }
    // PORTÉE DE LA SONNETTE, sur la route devant toi (jaune = prête ; un bourré debout dedans sera écarté)
    if (this.etat === 'jeu') {
      const x0 = X_VELO + 60, x1 = X_VELO + this.diff.sonnette, pret = this.recharge <= 0;
      g.fillStyle(pret ? 0xffe680 : 0x888888, pret ? 0.14 : 0.06).fillRect(x0, SOL - 6, x1 - x0, 12);
      g.lineStyle(2, pret ? 0xffe680 : 0x888888, pret ? 0.7 : 0.3).lineBetween(x1, SOL - 14, x1, SOL + 8);
      for (const o of this.obstacles) {
        const d = o.x - this.bx;
        if (pret && o.type === 'debout' && o.etat === 'normal' && d > 60 && d < this.diff.sonnette) {
          g.fillStyle(0xffe680, 1).fillCircle(X_VELO + d, SOL - 175, 9);   // « il entend la sonnette » : petite cloche
          g.fillStyle(0xffe680, 1).fillTriangle(X_VELO + d - 9, SOL - 175, X_VELO + d + 9, SOL - 175, X_VELO + d, SOL - 166);
        }
      }
    }
    if (!this.sprVelo) cycliste(gv, this.a, { danseuse: this.sprint, sonnette: this.dring > 0 });
    // HUD
    if (this.etat === 'jeu' || this.etat === 'arrivee') {
      const s = Math.max(0, Math.ceil(this.tempsRestant));
      this.hudTemps.setText(`FERMETURE DANS ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`).setColor(s <= 10 ? '#ff5a5a' : '#ffd84a');
      this.hudVitesse.setText(`${Math.round(this.v / 16)} km/h`);
      const hb = this.hudBarre.clear(), x0 = 300, x1 = 760, pr = Math.min(1, this.bx / V.longueur);
      hb.fillStyle(0x000000, 0.5).fillRect(x0 - 4, 18, x1 - x0 + 8, 16);
      hb.fillStyle(0x7fff7f, 1).fillRect(x0, 22, (x1 - x0) * pr, 8);
      hb.fillStyle(0xff4fd8, 1).fillRect(x1 - 6, 14, 12, 24);
      hb.fillStyle(0xffffff, 1).fillCircle(x0 + (x1 - x0) * pr, 26, 7);
      // sonnette : cercle qui se remplit pendant la recharge
      hb.fillStyle(0x000000, 0.5).fillCircle(LARGEUR - 200, 26, 12);
      hb.fillStyle(0xffe680, 1).slice(LARGEUR - 200, 26, 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - this.recharge / V.sonnette), false).fillPath();
      // endurance du sprint (sous la barre du trajet)
      hb.fillStyle(0x000000, 0.5).fillRect(x0 - 4, 40, 164, 12);
      hb.fillStyle(this.souffle < 0.25 ? 0xff5a5a : 0x5ad0ff, 1).fillRect(x0, 43, 156 * this.souffle, 6);
    }
  }
}
