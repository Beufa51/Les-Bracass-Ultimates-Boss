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
  boxeurFace(ctx, w, h, p) { dessinerBoxeurFace(ctx, w, h, p); },
  boxeurDos(ctx, w, h, p) { dessinerBoxeurDos(ctx, w, h, p); },
  ring(ctx, w, h) { dessinerRing(ctx, w, h); },
  coach(ctx, w, h) { dessinerCoach(ctx, w, h); },
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


// ---------- Boxeurs, vue "Punch-Out" ----------
// Coordonnées : (0, 0) = milieu du bas de la case, le haut est vers les y négatifs.
// [x, y, rayon] pour chaque gant. "g" = gant à gauche de l'écran, "d" = à droite.

// Adversaire vu de FACE (grand, au fond du ring)
const POSES_FACE = {
  garde:         { g: [-46, -268, 34], d: [46, -262, 34] },
  garde_basse:   { g: [-56, -168, 34], d: [56, -172, 34] },
  prepare:       { g: [-44, -268, 34], d: [118, -300, 30], dx: 16 },
  prepare_bas:   { g: [-44, -262, 34], d: [108, -150, 30], dx: 12, dy: 10 },
  prepare_smash: { g: [-44, -250, 34], d: [74, -86, 38], dy: 30, dx: 10 },
  jab:           { g: [-14, -236, 60], d: [48, -262, 34], dy: -4 },
  crochet:       { g: [-50, -262, 34], d: [-70, -250, 54], dx: -22 },
  corps:         { g: [-50, -262, 34], d: [8, -150, 56], dy: 16 },
  uppercut:      { g: [-50, -250, 34], d: [10, -330, 58], dy: -10 },
  bloque:        { g: [-26, -300, 40], d: [26, -290, 40], dy: 6 },
  touche:        { g: [-118, -196, 34], d: [104, -224, 34], dx: 26, tete: 'ko' },
  essouffle:     { g: [-62, -138, 34], d: [62, -142, 34], dy: 26, tete: 'souffle' },
  victoire:      { g: [-46, -268, 34], d: [96, -372, 36] },
};

function dessinerBoxeurFace(ctx, w, h, p) {
  const P = POSES_FACE[p.pose] || POSES_FACE.garde;
  const peau = p.peau || '#f2c9a0', ombre = p.peauOmbre || '#d9a77c';
  ctx.save();
  ctx.translate(w / 2, h);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (p.pose === 'sol') { dessinerFaceAuSol(ctx, p, peau); ctx.restore(); return; }
  const dx = P.dx || 0, dy = P.dy || 0;
  const contour = (couleur, epaisseur = 3) => { ctx.fillStyle = couleur; ctx.strokeStyle = CONTOUR; ctx.lineWidth = epaisseur; ctx.fill(); ctx.stroke(); };

  // jambes (coupées par le bas)
  ctx.beginPath(); ctx.rect(-70, -30, 52, 30); ctx.rect(18, -30, 52, 30); contour(ombre);
  // short
  ctx.beginPath(); ctx.moveTo(-78 + dx * 0.3, -110 + dy); ctx.lineTo(78 + dx * 0.3, -110 + dy);
  ctx.lineTo(84, -26); ctx.lineTo(-84, -26); ctx.closePath(); contour(p.couleur);
  ctx.fillStyle = p.ceinture || '#ffffff'; ctx.fillRect(-78 + dx * 0.3, -110 + dy, 156, 12);
  // torse
  ctx.beginPath();
  ctx.moveTo(-92 + dx, -252 + dy); ctx.lineTo(92 + dx, -252 + dy);
  ctx.lineTo(66 + dx * 0.4, -106 + dy); ctx.lineTo(-66 + dx * 0.4, -106 + dy); ctx.closePath(); contour(peau);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2;   // pectoraux et abdos
  ctx.beginPath(); ctx.moveTo(dx, -235 + dy); ctx.lineTo(dx * 0.7, -120 + dy);
  ctx.moveTo(-60 + dx, -200 + dy); ctx.quadraticCurveTo(-30 + dx, -185 + dy, dx, -200 + dy);
  ctx.moveTo(60 + dx, -200 + dy); ctx.quadraticCurveTo(30 + dx, -185 + dy, dx, -200 + dy);
  for (let i = 0; i < 3; i++) { ctx.moveTo(-20 + dx * 0.6, -170 + i * 20 + dy); ctx.lineTo(20 + dx * 0.6, -170 + i * 20 + dy); }
  ctx.stroke();
  // cou + tête
  ctx.beginPath(); ctx.rect(-20 + dx, -280 + dy, 40, 34); contour(peau);
  const tx = dx + (P.tete === 'ko' ? 22 : 0), ty = -312 + dy;
  ctx.beginPath(); ctx.ellipse(tx, ty, 40, 46, P.tete === 'ko' ? 0.3 : 0, 0, Math.PI * 2); contour(peau);
  // cheveux en pics
  ctx.beginPath();
  ctx.moveTo(tx - 44, ty - 6);
  for (let i = 0; i <= 8; i++) ctx.lineTo(tx - 44 + i * 11, ty - 40 - (i % 2 ? 26 : 4));
  ctx.lineTo(tx + 44, ty - 6); ctx.quadraticCurveTo(tx, ty - 30, tx - 44, ty - 6);
  contour(p.cheveux || '#111');
  // visage
  ctx.strokeStyle = CONTOUR; ctx.fillStyle = CONTOUR; ctx.lineWidth = 3;
  if (P.tete === 'ko') {
    for (const ox of [-16, 16]) {
      ctx.beginPath(); ctx.moveTo(tx + ox - 7, ty - 7); ctx.lineTo(tx + ox + 7, ty + 5);
      ctx.moveTo(tx + ox + 7, ty - 7); ctx.lineTo(tx + ox - 7, ty + 5); ctx.stroke();
    }
    ctx.beginPath(); ctx.ellipse(tx + 4, ty + 24, 10, 7, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    // sourcils froncés + yeux
    ctx.beginPath(); ctx.moveTo(tx - 28, ty - 18); ctx.lineTo(tx - 8, ty - 10);
    ctx.moveTo(tx + 28, ty - 18); ctx.lineTo(tx + 8, ty - 10); ctx.stroke();
    ctx.fillRect(tx - 22, ty - 6, 9, 9); ctx.fillRect(tx + 13, ty - 6, 9, 9);
    if (P.tete === 'souffle') { ctx.beginPath(); ctx.ellipse(tx, ty + 24, 9, 11, 0, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(tx - 14, ty + 24); ctx.lineTo(tx + 14, ty + 20); ctx.stroke(); }
  }
  // bras + gants (devant le corps)
  const bras = (epX, gant) => {
    const [gx, gy, r] = gant;
    ctx.strokeStyle = CONTOUR; ctx.lineWidth = 32;
    ctx.beginPath(); ctx.moveTo(epX + dx, -238 + dy); ctx.lineTo(gx + dx, gy + dy); ctx.stroke();
    ctx.strokeStyle = peau; ctx.lineWidth = 25; ctx.stroke();
    ctx.beginPath(); ctx.arc(gx + dx, gy + dy, r, 0, Math.PI * 2); contour(p.gants, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.arc(gx + dx - r * 0.3, gy + dy - r * 0.35, r * 0.3, 0, Math.PI * 2); ctx.fill();
  };
  // le gant le plus "en avant" (le plus gros) est dessiné en dernier
  if (P.g[2] >= P.d[2]) { bras(80, P.d); bras(-80, P.g); } else { bras(-80, P.g); bras(80, P.d); }
  ctx.restore();
}

function dessinerFaceAuSol(ctx, p, peau) {
  // allongé sur le dos, vu en raccourci
  ctx.strokeStyle = CONTOUR; ctx.lineWidth = 3;
  ctx.fillStyle = p.couleur; ctx.beginPath(); ctx.ellipse(-40, -40, 60, 26, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = peau; ctx.beginPath(); ctx.ellipse(50, -46, 80, 30, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(140, -54, 34, 28, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = p.cheveux || '#111'; ctx.beginPath(); ctx.ellipse(162, -60, 18, 26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = p.gants;
  for (const [x, y] of [[40, -96], [90, -14]]) { ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = '#ffd84a'; ctx.font = 'bold 26px monospace'; ctx.textAlign = 'center';
  ctx.fillText('* * *', 140, -100);
}

// Ton boxeur vu de DOS (au premier plan, en bas de l'écran)
const POSES_DOS = {
  garde:     { g: [-58, -222, 27], d: [58, -222, 27] },
  jab:       { g: [-22, -292, 20], d: [56, -220, 27], dx: -6 },
  crochet:   { g: [-58, -220, 27], d: [14, -280, 22], dx: 10 },
  corps:     { g: [-58, -214, 27], d: [10, -228, 22], dx: 8, dy: 14 },
  esquive:   { g: [-50, -200, 27], d: [50, -200, 27], dy: 26 },
  bloque:    { g: [-24, -232, 30], d: [24, -232, 30], dy: 4 },
  touche:    { g: [-84, -200, 27], d: [80, -196, 27], dy: -6, tete: 10 },
  victoire:  { g: [-78, -300, 27], d: [78, -300, 27] },
  dempsey_g: { g: [-10, -270, 23], d: [60, -200, 27], dx: -36, dy: 34 },
  dempsey_d: { g: [-60, -200, 27], d: [10, -270, 23], dx: 36, dy: 34 },
};

function dessinerBoxeurDos(ctx, w, h, p) {
  const peau = p.peau || '#f2c9a0', ombre = p.peauOmbre || '#d9a77c';
  ctx.save();
  ctx.translate(w / 2, h);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const contour = (couleur) => { ctx.fillStyle = couleur; ctx.strokeStyle = CONTOUR; ctx.lineWidth = 3; ctx.fill(); ctx.stroke(); };
  if (p.pose === 'sol') {
    ctx.beginPath(); ctx.ellipse(-30, -40, 90, 34, 0, 0, Math.PI * 2); contour(peau);
    ctx.beginPath(); ctx.ellipse(-90, -40, 40, 34, 0, 0, Math.PI * 2); contour(p.couleur);
    ctx.beginPath(); ctx.arc(80, -46, 32, 0, Math.PI * 2); contour(p.cheveux);
    ctx.beginPath(); ctx.arc(20, -86, 24, 0, Math.PI * 2); contour(p.gants);
    ctx.beginPath(); ctx.arc(30, -6, 24, 0, Math.PI * 2); contour(p.gants);
    ctx.restore(); return;
  }
  const P = POSES_DOS[p.pose] || POSES_DOS.garde;
  const dx = P.dx || 0, dy = P.dy || 0;
  // short + dos
  ctx.beginPath(); ctx.moveTo(-62, -96 + dy); ctx.lineTo(62, -96 + dy); ctx.lineTo(70, 0); ctx.lineTo(-70, 0); ctx.closePath(); contour(p.couleur);
  ctx.fillStyle = p.ceinture || '#ffffff'; ctx.fillRect(-62, -96 + dy, 124, 10);
  ctx.beginPath();
  ctx.moveTo(-76 + dx, -200 + dy); ctx.lineTo(76 + dx, -200 + dy);
  ctx.lineTo(58, -94 + dy); ctx.lineTo(-58, -94 + dy); ctx.closePath(); contour(peau);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2;   // colonne + omoplates
  ctx.beginPath(); ctx.moveTo(dx, -196 + dy); ctx.lineTo(0, -100 + dy);
  ctx.moveTo(-50 + dx, -180 + dy); ctx.quadraticCurveTo(-30 + dx, -150 + dy, -12 + dx, -170 + dy);
  ctx.moveTo(50 + dx, -180 + dy); ctx.quadraticCurveTo(30 + dx, -150 + dy, 12 + dx, -170 + dy); ctx.stroke();
  // nuque + arrière de la tête (cheveux)
  const tx = dx + (P.tete || 0), ty = -232 + dy;
  ctx.beginPath(); ctx.rect(-14 + dx, -214 + dy, 28, 20); contour(peau);
  ctx.beginPath(); ctx.ellipse(tx - 33, ty + 4, 7, 11, 0, 0, Math.PI * 2); contour(peau);
  ctx.beginPath(); ctx.ellipse(tx + 33, ty + 4, 7, 11, 0, 0, Math.PI * 2); contour(peau);
  ctx.beginPath(); ctx.ellipse(tx, ty, 32, 36, 0, 0, Math.PI * 2); contour(p.cheveux);
  // bras + gants
  const bras = (epX, [gx, gy, r]) => {
    ctx.strokeStyle = CONTOUR; ctx.lineWidth = 26;
    ctx.beginPath(); ctx.moveTo(epX + dx, -188 + dy); ctx.lineTo(gx + dx, gy + dy); ctx.stroke();
    ctx.strokeStyle = ombre; ctx.lineWidth = 19; ctx.stroke();
    ctx.beginPath(); ctx.arc(gx + dx, gy + dy, r, 0, Math.PI * 2); contour(p.gants);
  };
  bras(-66, P.g); bras(66, P.d);
  ctx.restore();
}

function dessinerRing(ctx, w, h) {
  // public dans l'ombre
  const fond = ctx.createLinearGradient(0, 0, 0, h * 0.6);
  fond.addColorStop(0, '#06060c'); fond.addColorStop(1, '#1d1a2e');
  ctx.fillStyle = fond; ctx.fillRect(0, 0, w, h);
  for (let rang = 0; rang < 5; rang++) {
    const y = 150 + rang * 34;
    ctx.fillStyle = `rgba(${40 + rang * 12},${36 + rang * 10},${60 + rang * 10},1)`;
    for (let x = -10 + (rang % 2) * 14; x < w + 20; x += 28) {
      ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(x - 13, y + 8, 26, 30);
    }
  }
  // projecteurs
  ctx.fillStyle = 'rgba(255,250,210,0.06)';
  for (const x of [200, 480, 760]) {
    ctx.beginPath(); ctx.moveTo(x - 20, 0); ctx.lineTo(x + 20, 0); ctx.lineTo(x + 200, h); ctx.lineTo(x - 200, h); ctx.fill();
  }
  // tapis (en perspective)
  ctx.fillStyle = '#9fb3c8';
  ctx.beginPath(); ctx.moveTo(110, 330); ctx.lineTo(w - 110, 330); ctx.lineTo(w, 500); ctx.lineTo(0, 500); ctx.fill();
  ctx.fillStyle = '#b8c9da';
  ctx.beginPath(); ctx.ellipse(w / 2, 420, 260, 50, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6a7f95'; ctx.font = 'bold 40px monospace'; ctx.textAlign = 'center';
  ctx.fillText("BRACASS' GYM", w / 2, 434);
  // tablier du ring
  ctx.fillStyle = '#2a3c8f'; ctx.fillRect(0, 500, w, h - 500);
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 18px monospace';
  ctx.fillText("BRACASS' BOXING CLUB  ·  CHAMPIONNAT DES BOSS", w / 2, 528);
  // poteaux de coin
  ctx.fillStyle = '#c0392b'; ctx.fillRect(100, 200, 16, 135);
  ctx.fillStyle = '#2c6fbf'; ctx.fillRect(w - 116, 200, 16, 135);
  // cordes du fond
  const cordes = ['#e74c3c', '#ecf0f1', '#3498db'];
  cordes.forEach((c, i) => {
    ctx.strokeStyle = c; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(108, 220 + i * 34); ctx.lineTo(w - 108, 220 + i * 34); ctx.stroke();
  });
}

function dessinerCoach(ctx, w, h) {
  // vieux coach : crâne chauve, moustache blanche, canne
  ctx.fillStyle = '#2b2b2b'; ctx.fillRect(w * 0.2, h * 0.62, w * 0.6, h * 0.38);
  ctx.fillStyle = '#f0c8a0'; ctx.strokeStyle = CONTOUR; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(w / 2, h * 0.4, w * 0.24, h * 0.26, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(w * 0.4, h * 0.52, w * 0.12, h * 0.05, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(w * 0.6, h * 0.52, w * 0.12, h * 0.05, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = CONTOUR;
  ctx.fillRect(w * 0.38, h * 0.36, w * 0.08, 4); ctx.fillRect(w * 0.55, h * 0.36, w * 0.08, 4);
  ctx.strokeStyle = '#8b5a2b'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(w * 0.85, h * 0.45); ctx.lineTo(w * 0.85, h); ctx.stroke();
  ctx.beginPath(); ctx.arc(w * 0.8, h * 0.45, w * 0.05, Math.PI, 0); ctx.stroke();
}
