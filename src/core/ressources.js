// Chargement des visuels et sons à partir du manifeste.
// Si un élément n'a pas encore de fichier, on dessine une forme provisoire.
import { MANIFESTE } from './manifestes.js';
import { FORMES } from './dessins.js';
import { Sauvegarde } from './sauvegarde.js';

// À appeler dans preload() : charge les vrais fichiers PNG / sons
export function chargerFichiers(scene) {
  for (const [cle, e] of Object.entries(MANIFESTE.images)) {
    if (e.fichier) scene.load.spritesheet(cle, 'assets/' + e.fichier, { frameWidth: e.largeur, frameHeight: e.hauteur });
  }
  for (const [cle, e] of Object.entries(MANIFESTE.sons)) {
    // les musiques sont jouées à part (voir musique.js)
    if (e.fichier && !e.musique) scene.load.audio(cle, 'assets/' + e.fichier);
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
// options (facultatif) : { rate: vitesse/hauteur, volume }
export function jouerSon(scene, cle, options) {
  const e = MANIFESTE.sons[cle];
  if (!e) return;
  const volSons = Sauvegarde.volume('sons');
  if (volSons <= 0) return;
  if (e.fichier && scene.cache.audio.exists(cle)) { scene.sound.play(cle, { ...options, volume: (options && options.volume || 1) * volSons }); return; }
  const ctx = scene.sound.context;
  if (!ctx || !e.provisoire) return;
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = e.provisoire.frequence;
  vol.gain.setValueAtTime(0.08 * Sauvegarde.volume('sons'), ctx.currentTime);
  vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + e.provisoire.duree);
  osc.connect(vol).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + e.provisoire.duree);
}

// ---------- Formes provisoires (dessins du moteur ou du boss, rattachés par manifestes.js) ----------
const FORME_DEFAUT = FORMES.rect;
function dessinerProvisoire(scene, cle, e) {
  const { largeur: w, hauteur: h, images: n } = e;
  const tex = scene.textures.createCanvas(cle, w * n, h);
  const ctx = tex.getContext();
  const p = e.provisoire || { dessin: FORME_DEFAUT, couleur: '#ff00ff' };
  for (let i = 0; i < n; i++) {
    ctx.save();
    ctx.translate(i * w, 0);
    if (p.pixel) dessinerEnPixels(ctx, w, h, p, { i, n });
    else p.dessin(ctx, w, h, p, { i, n });
    ctx.restore();
    tex.add(i, 0, i * w, 0, w, h);
  }
  tex.refresh();
}

// Style "pixel art" : on dessine en petit (1 / p.pixel), on nettoie la transparence
// et on réduit le nombre de couleurs, puis on agrandit sans lisser.
function dessinerEnPixels(ctx, w, h, p, image) {
  const k = p.pixel, pw = Math.ceil(w / k), ph = Math.ceil(h / k);
  const petit = document.createElement('canvas');
  petit.width = pw; petit.height = ph;
  const c = petit.getContext('2d');
  c.scale(1 / k, 1 / k);
  p.dessin(c, w, h, p, image);
  const img = c.getImageData(0, 0, pw, ph), d = img.data;
  for (let o = 0; o < d.length; o += 4) {
    d[o + 3] = d[o + 3] > 110 ? 255 : 0;
    for (let v = 0; v < 3; v++) d[o + v] = Math.min(255, Math.round(d[o + v] / 28) * 28);
  }
  c.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(petit, 0, 0, pw, ph, 0, 0, pw * k, ph * k);
}
