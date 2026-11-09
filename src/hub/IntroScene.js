// =====================================================================
// INTRO au lancement du jeu, façon opening de Dragon Ball Final Bout (demande de Fabien, nov. 2026).
// Écran « Appuie pour lancer » (obligatoire : sans appui, le navigateur bloque la musique), puis chaque boss arrive
// en OMBRE avec un liseré de sa couleur et repart vers le haut dans un trait de lumière ; à la fin, le titre.
// Un boss BATTU se DÉVOILE (flash blanc puis couleurs) : l'intro se remplit au fur et à mesure de la partie.
// Calée sur la musique (intro_musique, 161 BPM) : les dates sont lues sur la lecture réelle du morceau.
// Toucher / touche pendant la séquence = sauter au titre ; sur le titre = aller à l'écran de sélection.
// Images : python3 outils/intro/preparer_intro.py. Réglages : INTRO ci-dessous.
// =====================================================================
import { LARGEUR, HAUTEUR } from '../core/reglages.js';
import { texte } from '../core/ui.js';
import { Sauvegarde } from '../core/sauvegarde.js';
import { jouerMusique, tempsMusique, placerMusique } from '../core/musique.js';
import { etiquettesTactiles, montrerBoutonPause } from '../core/tactile.js';
import { BOSS } from '../bosses/liste.js';

const T = 60 / 161;   // un temps de la musique (s)
export const INTRO = {
  // ordre de passage, couleur du trait, date d'arrivée (s, sur un temps fort du morceau)
  passages: [
    { id: 'beufa',  couleur: 0x2f8bff, debut: 2.88 },
    { id: 'kedric', couleur: 0x2fe05a, debut: 5.87 },
    { id: 'greg',   couleur: 0xff2a2a, debut: 8.89 },
    { id: 'julien', couleur: 0xff8a1a, debut: 11.91 },
    { id: 'remi',   couleur: 0xffd21a, debut: 14.91 },
    { id: 'lionel', couleur: 0xb04aff, debut: 17.93 },
  ],
  rafale: 20.9,    // les 6 traits de couleur à la suite
  titre: 22.41,    // le gros coup du morceau : le titre tombe
};

export class IntroScene extends Phaser.Scene {
  constructor() { super('Intro'); }

  create() {
    etiquettesTactiles({ espace: null, z: null, x: null, haut: null, bas: null, gauche: null, droite: null });
    montrerBoutonPause(false);
    this.events.once('shutdown', () => montrerBoutonPause(true));
    this.etat = 'attente';
    this.t = 0; this.attente = 0; this.faits = new Set();
    this.couleurFond = 0x000000;
    this.fond = this.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, HAUTEUR, 0x000000);
    this.teinte = this.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, HAUTEUR, 0x000000, 0);
    this.lignes = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD);
    this.vitesse = 0.25;   // vitesse des traits du fond (0 = immobiles)
    this.traits = Array.from({ length: 70 }, () => this.nouveauTrait(true));
    this.calque = this.add.container(0, 0).setDepth(10);

    this.invite = texte(this, LARGEUR / 2, HAUTEUR / 2, '▶  APPUIE POUR LANCER', 26, '#ffffff', { fontStyle: 'bold' });
    this.tweens.add({ targets: this.invite, alpha: 0.25, duration: 600, yoyo: true, repeat: -1 });
    this.input.on('pointerdown', () => this.appui());
    this.input.keyboard.on('keydown', (e) => { if (e.key !== 'F1' && e.key !== 'Escape') this.appui(); });
  }

  appui() {
    if (this.etat === 'attente') {
      this.etat = 'sequence';
      this.invite.destroy();
      jouerMusique(this, 'intro_musique');   // pendant l'appui : autorisé même sur téléphone
    } else if (this.etat === 'sequence') {
      this.sauterAuTitre();
    } else if (this.etat === 'titre' && this.t > INTRO.titre + 0.6) {
      this.etat = 'fin';
      this.cameras.main.fadeOut(400, 255, 255, 255);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Hub'));
    }
  }

  // ---------------- horloge calée sur la musique ----------------
  update(_, dtMs) {
    const dt = dtMs / 1000;
    this.dessinerFond(dt);
    if (this.etat === 'attente' || this.etat === 'fin') return;
    const m = tempsMusique('intro_musique');
    if (m !== null) this.t = m;
    else if ((this.attente += dt) > 1.2) this.t += dt;   // musique bloquée ou absente : on avance quand même
    const evt = (cle, date, f) => { if (this.t >= date && !this.faits.has(cle)) { this.faits.add(cle); f(); } };
    evt('ouverture', 0, () => this.ouverture());
    if (this.etat === 'sequence') {
      INTRO.passages.forEach((p, i) => evt('boss' + i, p.debut, () => this.passage(p, i)));
      evt('rafale', INTRO.rafale, () => this.rafale());
      evt('titre', INTRO.titre, () => this.montrerTitre());
    }
  }

  // ---------------- fond : traits de lumière qui filent vers le haut ----------------
  nouveauTrait(partout) {
    return { x: Math.random() * LARGEUR, y: partout ? Math.random() * HAUTEUR : HAUTEUR + Math.random() * 200,
      l: 40 + Math.random() * 160, v: 0.6 + Math.random(), e: Math.random() < 0.2 ? 3 : 1, blanc: Math.random() < 0.35 };
  }

  dessinerFond(dt) {
    const g = this.lignes.clear();
    for (const tr of this.traits) {
      tr.y -= tr.v * this.vitesse * 1400 * dt;
      if (tr.y + tr.l < 0) Object.assign(tr, this.nouveauTrait(false));
      g.fillStyle(tr.blanc ? 0xffffff : this.couleurFond, tr.blanc ? 0.35 : 0.6);
      g.fillRect(tr.x, tr.y, tr.e, tr.l * (0.4 + this.vitesse));
    }
  }

  ambiance(couleur, force = 0.22) {
    this.couleurFond = couleur;
    this.teinte.setFillStyle(couleur, force);
  }

  // ---------------- les étapes ----------------
  ouverture() {
    this.ambiance(0x1a2a6a, 0.25);
    this.tweens.add({ targets: this, vitesse: 1, duration: 2600, ease: 'Quad.In' });
    // une fente de lumière s'ouvre juste avant le premier boss
    const fente = this.add.rectangle(LARGEUR / 2, HAUTEUR / 2, LARGEUR, 3, 0xffffff).setScale(0, 1).setDepth(5);
    this.calque.add(fente);
    this.tweens.add({ targets: fente, scaleX: 1, duration: 300, delay: 1900, ease: 'Cubic.Out',
      onComplete: () => this.tweens.add({ targets: fente, scaleY: 60, alpha: 0, duration: 450 }) });
  }

  passage(p, i) {
    const boss = BOSS.find(b => b.id === p.id);
    const battu = Sauvegarde.aLeBadge(p.id);
    const cle = 'intro_' + p.id;
    if (!this.textures.exists(cle)) return;
    const gauche = i % 2 === 0;           // un coup à gauche, un coup à droite
    const x = gauche ? 330 : 630, y = HAUTEUR + 10;
    const [r, v, b] = [(p.couleur >> 16) & 255, (p.couleur >> 8) & 255, p.couleur & 255];
    this.cameras.main.flash(160, r, v, b);
    this.ambiance(p.couleur);

    // liseré lumineux (même image teintée de la couleur, un peu plus grande) puis l'ombre par-dessus
    const halo = this.add.image(gauche ? -300 : LARGEUR + 300, y, cle).setOrigin(0.5, 1).setTintFill(p.couleur)
      .setScale(1.05).setBlendMode(Phaser.BlendModes.ADD);
    const corps = this.add.image(halo.x, y, cle).setOrigin(0.5, 1).setTintFill(0x05060c);
    this.calque.add([halo, corps]);
    this.tweens.add({ targets: [halo, corps], x, duration: 260, ease: 'Back.Out' });
    this.tweens.add({ targets: halo, alpha: 0.55, duration: T * 1000 / 2, yoyo: true, repeat: -1 });

    // le nom tombe du côté opposé
    const nx = gauche ? 690 : 270;
    const nom = texte(this, gauche ? LARGEUR + 300 : -300, 250, (boss ? boss.nom : p.id).toUpperCase(), 64, '#ffffff',
      { fontStyle: 'bold italic', stroke: '#' + p.couleur.toString(16).padStart(6, '0'), strokeThickness: 10 });
    const sous = texte(this, nx, 318, battu ? '' : '???', 26, '#' + p.couleur.toString(16).padStart(6, '0'),
      { fontStyle: 'bold' }).setAlpha(0);
    this.calque.add([nom, sous]);
    this.time.delayedCall(T * 1000, () => {
      this.tweens.add({ targets: nom, x: nx, duration: 180, ease: 'Cubic.Out',
        onComplete: () => this.cameras.main.shake(120, 0.008) });
      this.tweens.add({ targets: sous, alpha: 1, duration: 200, delay: 200 });
    });

    // battu : il se dévoile (flash blanc, couleurs)
    if (battu) this.time.delayedCall(T * 2000, () => {
      this.cameras.main.flash(220, 255, 255, 255);
      corps.clearTint();
      this.tweens.add({ targets: halo, scale: 1.08, duration: 200, yoyo: true });
    });

    // il repart vers le haut dans un trait de sa couleur
    this.time.delayedCall(T * 6000, () => {
      const trait = this.add.rectangle(x, HAUTEUR, 150, HAUTEUR * 2, p.couleur).setOrigin(0.5, 1)
        .setScale(1, 0).setBlendMode(Phaser.BlendModes.ADD);
      const coeur = this.add.rectangle(x, HAUTEUR, 26, HAUTEUR * 2, 0xffffff).setOrigin(0.5, 1).setScale(1, 0);
      this.calque.addAt([trait, coeur], 0);
      this.tweens.add({ targets: [trait, coeur], scaleY: 1, duration: 220, ease: 'Cubic.In' });
      this.tweens.add({ targets: [trait, coeur], scaleX: 0, alpha: 0, delay: 260, duration: 500, ease: 'Quad.In',
        onComplete: () => { trait.destroy(); coeur.destroy(); } });
      this.tweens.add({ targets: [halo, corps], y: -150, scaleY: 2.4, scaleX: 0.45, duration: 280, ease: 'Cubic.In',
        onComplete: () => { halo.destroy(); corps.destroy(); } });
      this.tweens.add({ targets: [nom, sous], alpha: 0, x: '+=' + (gauche ? 120 : -120), duration: 220,
        onComplete: () => { nom.destroy(); sous.destroy(); } });
    });
  }

  // les 6 traits de couleur à la suite, juste avant le titre
  rafale() {
    this.ambiance(0x000000, 0);
    INTRO.passages.forEach((p, i) => this.time.delayedCall(i * T * 500, () => {
      const x = 110 + i * 148;
      const trait = this.add.rectangle(x, HAUTEUR, 60, HAUTEUR, p.couleur).setOrigin(0.5, 1).setScale(1, 0)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.calque.add(trait);
      this.tweens.add({ targets: trait, scaleY: 1, duration: 150, ease: 'Cubic.Out' });
      this.tweens.add({ targets: trait, scaleX: 0, alpha: 0, delay: 700, duration: 500, onComplete: () => trait.destroy() });
    }));
  }

  sauterAuTitre() {
    this.time.removeAllEvents();
    this.tweens.killAll();
    this.calque.removeAll(true);
    this.cameras.main.resetFX();
    for (const p of INTRO.passages) this.faits.add('boss' + INTRO.passages.indexOf(p));
    this.faits.add('ouverture').add('rafale');
    placerMusique('intro_musique', INTRO.titre - 0.05);
    this.t = INTRO.titre;
    this.vitesse = 1;
    this.montrerTitre();
  }

  montrerTitre() {
    if (this.etat === 'titre') return;
    this.faits.add('titre');
    this.etat = 'titre';
    this.ambiance(0x1a2a6a, 0.35);
    this.cameras.main.flash(500, 255, 255, 255);
    this.cameras.main.shake(300, 0.012);
    if (this.textures.exists('intro_logo')) {
      // explosion de rayons derrière le logo (dessinée ici : celle de l'image était mêlée au damier)
      const rayons = this.add.graphics().setPosition(LARGEUR / 2, 190).setBlendMode(Phaser.BlendModes.ADD).setScale(0);
      const couleurs = [0xffffff, 0x7fc4ff, 0xff9a3a];
      for (let k = 0; k < 28; k++) {
        const ang = k / 28 * Math.PI * 2 + Math.random() * 0.1, l = 200 + Math.random() * 240, e = 0.015 + Math.random() * 0.03;
        rayons.fillStyle(couleurs[k % 3], 0.22);
        rayons.fillTriangle(0, 0, Math.cos(ang - e) * l, Math.sin(ang - e) * l, Math.cos(ang + e) * l, Math.sin(ang + e) * l);
      }
      const logo = this.add.image(LARGEUR / 2, 190, 'intro_logo').setScale(2.6).setAlpha(0);
      this.calque.add([rayons, logo]);
      this.tweens.add({ targets: logo, scale: 0.82, alpha: 1, duration: 240, ease: 'Cubic.In',
        onComplete: () => this.tweens.add({ targets: logo, scale: 0.85, duration: T * 1000, yoyo: true, repeat: -1 }) });
      this.tweens.add({ targets: rayons, scale: 1, duration: 300, delay: 200, ease: 'Back.Out' });
      this.tweens.add({ targets: rayons, angle: 360, duration: 30000, repeat: -1 });
    } else {   // sans l'image : le titre en texte
      const t1 = texte(this, LARGEUR / 2, 150, "LES BRACASS'", 92, '#ffffff',
        { fontStyle: 'bold italic', stroke: '#b3202c', strokeThickness: 12 }).setScale(3).setAlpha(0);
      const t2 = texte(this, LARGEUR / 2, 245, 'ULTIMATE BOSS', 62, '#ffd84a',
        { fontStyle: 'bold italic', stroke: '#0a1440', strokeThickness: 10 }).setScale(3).setAlpha(0);
      this.calque.add([t1, t2]);
      this.tweens.add({ targets: t1, scale: 1, alpha: 1, duration: 220, ease: 'Cubic.In' });
      this.tweens.add({ targets: t2, scale: 1, alpha: 1, duration: 220, delay: T * 1000, ease: 'Cubic.In',
        onComplete: () => this.cameras.main.shake(150, 0.008) });
    }

    // les 6 boss en ligne : ombre tant qu'ils ne sont pas battus
    INTRO.passages.forEach((p, i) => {
      const cle = 'intro_' + p.id;
      if (!this.textures.exists(cle)) return;
      const x = 130 + i * 140;
      const halo = this.add.image(x, HAUTEUR + 200, cle).setOrigin(0.5, 1).setScale(0.36).setTintFill(p.couleur)
        .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.8);
      const img = this.add.image(x, HAUTEUR + 200, cle).setOrigin(0.5, 1).setScale(0.34);
      if (!Sauvegarde.aLeBadge(p.id)) img.setTintFill(0x05060c);
      this.calque.add([halo, img]);
      this.tweens.add({ targets: [halo, img], y: HAUTEUR - 52, duration: 350, delay: 400 + i * T * 500, ease: 'Back.Out' });
    });
    const nb = BOSS.filter(b => Sauvegarde.aLeBadge(b.id)).length;
    const appuie = texte(this, LARGEUR / 2, HAUTEUR - 26, `APPUIE POUR JOUER   ·   ${nb} / ${BOSS.length} dévoilés`, 20,
      '#ffffff', { fontStyle: 'bold', stroke: '#0a1440', strokeThickness: 5 }).setAlpha(0).setDepth(12);
    this.tweens.add({ targets: appuie, alpha: 1, duration: 300, delay: 1400,
      onComplete: () => this.tweens.add({ targets: appuie, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 }) });
  }
}
