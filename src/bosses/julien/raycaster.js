// Moteur 3D façon Wolfenstein (« raycaster ») : pour chaque colonne de l'écran, on lance un rayon dans le plan
// en grille jusqu'au premier mur ; plus le mur est loin, plus la colonne est petite. Les personnages et objets sont
// des images toujours tournées vers le joueur, cachées colonne par colonne derrière les murs plus proches.
// Pas de visée en hauteur : l'horizon est toujours au milieu de la vue.

// Code du mur dans une case (0 = vide). Hors du plan = mur.
export function murEn(plan, x, y) {
  const ligne = plan[y | 0];
  if (!ligne) return 1;
  const c = ligne.charCodeAt(x | 0);
  return c >= 49 && c <= 57 ? c - 48 : (Number.isNaN(c) ? 1 : 0);
}

// Vrai si rien ne bloque la vue entre (ax, ay) et (bx, by)
export function vueLibre(plan, ax, ay, bx, by) {
  const d = Math.hypot(bx - ax, by - ay), n = Math.ceil(d / 0.15);
  for (let i = 1; i < n; i++) {
    const t = i / n;
    if (murEn(plan, ax + (bx - ax) * t, ay + (by - ay) * t)) return false;
  }
  return true;
}

const zbuf = [];

// ctx : toile de la vue (l × h). cam : { x, y, dx, dy, px, py } (position, direction, plan de la caméra).
// sprites : [{ x, y, toile, haut, z }] (haut : hauteur dans le monde, 1 = un mur ; z : hauteur du bas, 0 = au sol)
export function rendre(ctx, l, h, plan, cam, murs, sprites, ciel, sol) {
  const mi = h / 2;
  ctx.drawImage(ciel, 0, 0, l, mi);
  ctx.drawImage(sol, 0, mi, l, h - mi);

  for (let x = 0; x < l; x++) {
    const camX = 2 * x / l - 1;
    const rx = cam.dx + cam.px * camX, ry = cam.dy + cam.py * camX;
    let cx = cam.x | 0, cy = cam.y | 0;
    const ddx = Math.abs(1 / rx), ddy = Math.abs(1 / ry);
    const sx = rx < 0 ? -1 : 1, sy = ry < 0 ? -1 : 1;
    let distX = (rx < 0 ? cam.x - cx : cx + 1 - cam.x) * ddx;
    let distY = (ry < 0 ? cam.y - cy : cy + 1 - cam.y) * ddy;
    let cote = 0, code = 0;
    for (let i = 0; i < 64; i++) {
      if (distX < distY) { distX += ddx; cx += sx; cote = 0; } else { distY += ddy; cy += sy; cote = 1; }
      code = murEn(plan, cx, cy);
      if (code) break;
    }
    const perp = Math.max(0.01, cote === 0 ? distX - ddx : distY - ddy);
    zbuf[x] = perp;
    const hl = h / perp;
    let mx = cote === 0 ? cam.y + perp * ry : cam.x + perp * rx;
    mx -= Math.floor(mx);
    const tex = murs[code] || murs[1];
    let tx = (mx * tex.width) | 0;
    if ((cote === 0 && rx < 0) || (cote === 1 && ry > 0)) tx = tex.width - tx - 1;
    const haut = mi - hl / 2;
    ctx.drawImage(tex, tx, 0, 1, tex.height, x, haut, 1, hl);
    // ombre (un côté plus sombre) + brume au loin
    const ombre = Math.min(0.8, cote * 0.22 + perp * 0.045);
    if (ombre > 0.02) { ctx.fillStyle = `rgba(28,30,38,${ombre})`; ctx.fillRect(x, haut, 1, hl); }
  }

  // sprites, du plus loin au plus proche
  const inv = 1 / (cam.px * cam.dy - cam.dx * cam.py);
  const vus = [];
  for (const s of sprites) {
    const ox = s.x - cam.x, oy = s.y - cam.y;
    const tx = inv * (cam.dy * ox - cam.dx * oy);
    const ty = inv * (-cam.py * ox + cam.px * oy);
    if (ty > 0.15) vus.push({ s, tx, ty });
  }
  vus.sort((a, b) => b.ty - a.ty);
  for (const { s, tx, ty } of vus) {
    const ecranX = (l / 2) * (1 + tx / ty);
    const unite = h / ty;
    const sh = s.haut * unite, sw = sh * s.toile.width / s.toile.height;
    const bas = mi + (0.5 - (s.z || 0)) * unite;
    const x0 = Math.round(ecranX - sw / 2), x1 = Math.round(ecranX + sw / 2);
    for (let x = Math.max(0, x0); x < Math.min(l, x1); x++) {
      if (ty >= zbuf[x]) continue;
      const colTex = Math.min(s.toile.width - 1, ((x - x0) / (x1 - x0) * s.toile.width) | 0);
      ctx.drawImage(s.toile, colTex, 0, 1, s.toile.height, x, bas - sh, 1, sh);
    }
  }
  return zbuf;
}
