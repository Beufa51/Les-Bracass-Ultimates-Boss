// Chargement des visuels et sons à partir du manifeste.
// Si un élément n'a pas encore de fichier, on dessine une forme provisoire.
import { MANIFESTE } from '../../assets/manifeste.js';

// À appeler dans preload() : charge les vrais fichiers PNG / sons
export function chargerFichiers(scene) {
  for (const [cle, e] of Object.entries(MANIFESTE.images)) {
    if (e.fichier) scene.load.spritesheet(cle, 'assets/' + e.fichier, { frameWidth: e.largeur, frameHeight: e.hauteur });
  }
  for (const [cle, e] of Object.entries(MANIFESTE.sons)) {
    if (e.fichier) scene.load.audio(cle, 'assets/' + e.fichier);
  }
}

// À appeler dans create() : crée les visuels provisoires et les animations
export function preparerVisuels(scene) {
  for (const [cle, e] of Object.entries(MANIFESTE.images)) {
    if (!scene.textures.exists(cle)) dessinerProvisoire(scene, cle, e);
    if (!scene.anims.exists(cle)) {
      scene.anims.create({
        key: cle,
        frames: scene.anims.generateFrameNumbers(cle, { start: 0, end: e.images - 1 }),
        frameRate: e.vitesse,
        repeat: e.boucle === false ? 0 : -1,
      });
    }
  }
}

// Joue un son du manifeste (ou un bip provisoire)
export function jouerSon(scene, cle) {
  const e = MANIFESTE.sons[cle];
  if (!e) return;
  if (e.fichier && scene.cache.audio.exists(cle)) { scene.sound.play(cle); return; }
  const ctx = scene.sound.context;
  if (!ctx || !e.provisoire) return;
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = e.provisoire.frequence;
  vol.gain.setValueAtTime(0.08, ctx.currentTime);
  vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + e.provisoire.duree);
  osc.connect(vol).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + e.provisoire.duree);
}

// ---------- Dessin des formes provisoires ----------
function dessinerProvisoire(scene, cle, e) {
  const { largeur: w, hauteur: h, images: n } = e;
  const tex = scene.textures.createCanvas(cle, w * n, h);
  const ctx = tex.getContext();
  const p = e.provisoire || { forme: 'rect', couleur: '#ff00ff' };
  for (let i = 0; i < n; i++) {
    ctx.save();
    ctx.translate(i * w, 0);
    // petit rebond d'une image à l'autre pour voir l'animation
    const rebond = n > 1 ? Math.round(Math.sin((i / n) * Math.PI * 2) * 3) : 0;
    FORMES[p.forme] ? FORMES[p.forme](ctx, w, h, p, rebond) : FORMES.rect(ctx, w, h, p, rebond);
    ctx.restore();
    tex.add(i, 0, i * w, 0, w, h);
  }
  tex.refresh();
}

const CONTOUR = '#151515';

const FORMES = {
  rect(ctx, w, h, p, r) {
    ctx.fillStyle = p.couleur; ctx.strokeStyle = CONTOUR; ctx.lineWidth = 3;
    ctx.fillRect(6, 6 + r, w - 12, h - 12); ctx.strokeRect(6, 6 + r, w - 12, h - 12);
  },
  cercle(ctx, w, h, p) {
    ctx.fillStyle = p.couleur; ctx.strokeStyle = CONTOUR; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(w / 2, h / 2, Math.min(w, h) / 2 - 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  },
  badge(ctx, w, h, p) {
    FORMES.cercle(ctx, w, h, p);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(w / 2, h / 2, Math.min(w, h) / 2 - 8, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.font = `bold ${Math.round(h * 0.45)}px monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(p.lettre || '?', w / 2, h / 2 + 1);
  },
  perso(ctx, w, h, p, r) {
    ctx.strokeStyle = CONTOUR; ctx.lineWidth = 3;
    // corps
    ctx.fillStyle = p.couleur;
    ctx.fillRect(w * 0.28, h * 0.45 + r, w * 0.44, h * 0.45); ctx.strokeRect(w * 0.28, h * 0.45 + r, w * 0.44, h * 0.45);
    // tête
    ctx.fillStyle = '#f2c9a0';
    ctx.beginPath(); ctx.arc(w / 2, h * 0.3 + r, w * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // yeux (regardent vers la droite)
    ctx.fillStyle = CONTOUR;
    ctx.fillRect(w * 0.52, h * 0.26 + r, 4, 5); ctx.fillRect(w * 0.62, h * 0.26 + r, 4, 5);
  },
  porte(ctx, w, h, p) {
    ctx.fillStyle = '#3b2a1a'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = p.couleur; ctx.strokeStyle = CONTOUR; ctx.lineWidth = 3;
    ctx.fillRect(8, 8, w - 16, h - 8); ctx.strokeRect(8, 8, w - 16, h - 8);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, w - 32, h * 0.35); ctx.strokeRect(16, h * 0.5, w - 32, h * 0.38);
    ctx.fillStyle = '#e8c547'; ctx.beginPath(); ctx.arc(w - 20, h * 0.55, 4, 0, Math.PI * 2); ctx.fill();
  },
  dalle(ctx, w, h, p) {
    ctx.fillStyle = p.couleur; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, w - 2, h - 2);
  },
  mur(ctx, w, h, p) {
    ctx.fillStyle = p.couleur; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
    for (let y = 0; y < h; y += 16) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      const dec = (y / 16) % 2 ? w / 2 : 0;
      for (let x = dec; x < w; x += w) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 16); ctx.stroke(); }
    }
  },
};
