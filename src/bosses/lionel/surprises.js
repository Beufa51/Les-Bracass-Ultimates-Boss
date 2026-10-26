// Surprises sur le terrain de Lionel : une mouette qui traverse, un château de sable qui pousse,
// un ballon de plage qui roule. Si le frisbee les touche, il est dévié (il continue toujours
// vers le même camp, seul son angle change). Les super lancers passent à travers (et cassent le château).
// Les lobs volent au-dessus.
import { TERRAIN as T, REGLAGES as R } from './reglages.js';
import { onomatopee } from './effets.js';
import { jouerSon } from '../../core/ressources.js';

const entre = (min, max) => min + Math.random() * (max - min);
const profondeur = (y) => 10 + y / 10;   // même ordre d'affichage que les joueurs
const ECHELLE = { mouette: 0.8, chateau: 0.5, ballon: 0.5 };   // les dessins sont en double taille

export class Surprises {
  constructor(scene) {
    this.s = scene;
    this.liste = [];
    this.attente = entre(...scene.diff.surprises) * 0.6;   // la première arrive un peu plus vite
  }

  // une surprise à la fois ; appelé à chaque image de jeu
  maj(dt) {
    if (!this.liste.length) {
      this.attente -= dt;
      if (this.attente <= 0) { this.apparaitre(); this.attente = entre(...this.s.diff.surprises); }
    }
    for (const o of this.liste) o.maj(dt);
    this.liste = this.liste.filter(o => o.vivant);
  }

  apparaitre() {
    const types = [Mouette, Chateau, Ballon];
    this.liste.push(new types[Math.floor(Math.random() * types.length)](this.s));
  }

  // Le frisbee touche-t-il une surprise ? (renvoie vrai s'il a été dévié)
  toucher(d) {
    if (d.type === 'lob' || d.arret > 0) return false;
    for (const o of this.liste) {
      if (!o.vivant || o.touche) continue;
      const dx = d.x - o.x, dy = d.y - o.y, n = Math.hypot(dx, dy);
      if (n > o.rayon + R.rayonDisque) continue;
      // pas de déviation d'un tir de Lionel tout près de toi (ce serait injuste) : il passe à travers
      if (d.vx < 0 && Math.hypot(d.x - this.s.j.x, d.y - this.s.j.y) < R.surprisePresDeToi) continue;
      o.touche = true;
      if (d.type.startsWith('super')) { o.casser(); return false; }   // le super passe à travers
      // déviation : on garde le sens (vers le même camp), on change l'angle
      const v = Math.hypot(d.vx, d.vy), sensX = Math.sign(d.vx) || 1;
      const angle = entre(0.35, 0.7) * (dy >= 0 ? 1 : -1);
      d.vx = sensX * v * Math.cos(angle); d.vy = v * Math.sin(angle); d.ay = 0;
      d.y += (dy >= 0 ? 1 : -1) * 4;
      o.choc(d);
      return true;
    }
    return false;
  }

  vider() { this.liste.forEach(o => o.disparaitre()); this.liste = []; }
}

// ---------- la mouette : traverse le terrain de haut en bas (ou l'inverse) ----------
class Mouette {
  constructor(s) {
    this.s = s; this.vivant = true; this.rayon = R.mouette.rayon;
    this.sens = Math.random() < 0.5 ? 1 : -1;
    this.x0 = entre(T.x0 + 140, T.x1 - 140); this.x = this.x0;
    this.y = this.sens > 0 ? T.y0 - 70 : T.y1 + 70; this.t = 0; this.vitesse = R.mouette.vitesse;
    this.ombre = s.add.ellipse(this.x, this.y, 34, 10, 0x000000, 0.22).setDepth(4.6);
    this.sprite = s.add.sprite(this.x, this.y - R.mouette.hauteur, 'lionel_mouette').play('lionel_mouette').setDepth(70).setScale(ECHELLE.mouette);
    this.versDroite = Math.random() < 0.5;   // vue de profil : elle regarde à droite ou à gauche
    this.sprite.setFlipX(!this.versDroite);
  }
  maj(dt) {
    this.t += dt;
    this.y += this.sens * this.vitesse * dt;
    this.x = this.x0 + Math.sin(this.t * 2.2) * 40;
    // vue de profil, le bec penche un peu vers où elle va (vers le bas ou vers le haut de l'écran)
    const penche = this.sens * 22 * (this.versDroite ? 1 : -1);
    this.sprite.setPosition(this.x, this.y - R.mouette.hauteur).setAngle(penche + Math.cos(this.t * 2.2) * 8);
    this.ombre.setPosition(this.x, this.y);
    if (this.y < T.y0 - 90 || this.y > T.y1 + 90) this.disparaitre();
  }
  choc() {
    onomatopee(this.s, this.x, this.y - 80, 'COUAC !', 30, '#ffffff');
    jouerSon(this.s, 'frisbee_rebond');
    // plumes qui tombent, et la mouette file deux fois plus vite
    for (let k = 0; k < 8; k++) {
      const p = this.s.add.ellipse(this.x, this.y - R.mouette.hauteur, 6, 3, 0xffffff).setDepth(70);
      this.s.tweens.add({ targets: p, x: p.x + entre(-50, 50), y: p.y + entre(20, 70), angle: entre(-180, 180), alpha: 0,
        duration: 900, onComplete: () => p.destroy() });
    }
    this.vitesse *= 2.5;
  }
  casser() { this.choc(); }
  disparaitre() { if (!this.vivant) return; this.vivant = false; this.sprite.destroy(); this.ombre.destroy(); }
}

// ---------- le château de sable : pousse dans un camp, le frisbee rebondit dessus, il s'écroule ----------
class Chateau {
  constructor(s) {
    this.s = s; this.vivant = true; this.rayon = R.chateau.rayon; this.reste = R.chateau.duree;
    // dans ton camp ou dans celui de Lionel, jamais sur un joueur ni sur le frisbee
    const loinDe = (x, y) => [s.j, s.l, s.d].every(o => !o || Math.hypot(o.x - x, o.y - y) > 90);
    for (let essai = 0; essai < 12; essai++) {
      const cote = Math.random() < 0.5;
      this.x = cote ? entre(T.x0 + 190, T.filet - 90) : entre(T.filet + 90, T.x1 - 190);
      this.y = entre(T.y0 + 60, T.y1 - 40);
      if (loinDe(this.x, this.y)) break;
    }
    this.sprite = s.add.image(this.x, this.y + 8, 'lionel_chateau').setOrigin(0.5, 1).setDepth(profondeur(this.y)).setScale(0);
    s.tweens.add({ targets: this.sprite, scale: ECHELLE.chateau, duration: 350, ease: 'Back.Out' });
    onomatopee(s, this.x, this.y - 70, 'POP !', 24, '#ffd84a');
  }
  maj(dt) { this.reste -= dt; if (this.reste <= 0) this.casser(); }
  choc() { onomatopee(this.s, this.x, this.y - 70, 'PAF !', 30, '#ffd84a'); jouerSon(this.s, 'frisbee_rebond'); this.casser(); }
  casser() {
    if (!this.vivant) return;
    this.vivant = false;
    // il s'écroule en une gerbe de sable
    for (let k = 0; k < 16; k++) {
      const g = this.s.add.circle(this.x, this.y - 20, entre(3, 6), Math.random() < 0.5 ? 0xe9cf92 : 0xc9a65e).setDepth(profondeur(this.y) + 1);
      const a = -Math.PI * Math.random();
      this.s.tweens.add({ targets: g, x: this.x + Math.cos(a) * entre(30, 80), y: this.y - 20 + Math.sin(a) * entre(20, 60) + 30, alpha: 0,
        duration: 600, onComplete: () => g.destroy() });
    }
    this.s.tweens.add({ targets: this.sprite, scaleY: 0, alpha: 0, duration: 250, onComplete: () => this.sprite.destroy() });
  }
  disparaitre() { if (this.vivant) { this.vivant = false; this.sprite.destroy(); } }
}

// ---------- le ballon de plage : roule en rebondissant sur les murs, file quand le frisbee le touche ----------
class Ballon {
  constructor(s) {
    this.s = s; this.vivant = true; this.rayon = R.ballon.rayon; this.reste = R.ballon.duree;
    this.x = entre(T.x0 + 160, T.x1 - 160); this.y = Math.random() < 0.5 ? T.y0 + 25 : T.y1 - 25;
    const a = entre(0.4, 1.2) * (this.y < (T.y0 + T.y1) / 2 ? 1 : -1);
    this.vx = R.ballon.vitesse * Math.cos(a) * (Math.random() < 0.5 ? 1 : -1); this.vy = R.ballon.vitesse * Math.sin(a);
    this.ombre = s.add.ellipse(this.x, this.y + 2, 32, 10, 0x000000, 0.22).setDepth(4.6);
    this.sprite = s.add.sprite(this.x, this.y - 18, 'lionel_ballon').play('lionel_ballon').setDepth(profondeur(this.y)).setScale(0);
    s.tweens.add({ targets: this.sprite, scale: ECHELLE.ballon, duration: 300, ease: 'Back.Out' });
  }
  maj(dt) {
    this.reste -= dt;
    if (this.attenteRetouche > 0 && (this.attenteRetouche -= dt) <= 0) this.touche = false;   // il peut être retouché
    this.x += this.vx * dt; this.y += this.vy * dt;
    if (this.y < T.y0 + 20 || this.y > T.y1 - 10) this.vy = -this.vy;
    if (this.x < T.x0 + 40 || this.x > T.x1 - 40) this.vx = -this.vx;
    // il ralentit doucement après un coup
    const v = Math.hypot(this.vx, this.vy);
    if (v > R.ballon.vitesse) { const k = Math.max(R.ballon.vitesse, v - 160 * dt) / v; this.vx *= k; this.vy *= k; }
    // il roule : ses quartiers tournent (plus ou moins vite), la lumière reste en haut à gauche
    this.sprite.setPosition(this.x, this.y - 18).setDepth(profondeur(this.y)).setFlipX(this.vx < 0);
    this.sprite.anims.timeScale = Math.max(0.2, Math.hypot(this.vx, this.vy) / R.ballon.vitesse);
    this.ombre.setPosition(this.x, this.y + 2);
    if (this.reste <= 0) {
      this.vivant = false;
      this.s.tweens.add({ targets: [this.sprite, this.ombre], alpha: 0, duration: 300, onComplete: () => { this.sprite.destroy(); this.ombre.destroy(); } });
    }
  }
  choc(d) {
    onomatopee(this.s, this.x, this.y - 60, 'BOING !', 30, '#7fd0ff');
    jouerSon(this.s, 'frisbee_rebond');
    // le ballon file dans le sens du frisbee
    const v = Math.hypot(d.vx, d.vy) || 1;
    this.vx = d.vx / v * 380; this.vy = -d.vy / v * 380;
    this.attenteRetouche = 0.4;   // il pourra être retouché un peu plus tard
  }
  casser() { this.choc(this.s.d || { vx: 1, vy: 0 }); }
  disparaitre() { if (this.vivant) { this.vivant = false; this.sprite.destroy(); this.ombre.destroy(); } }
}
