// Moteur 3D façon Wolfenstein / Doom (« raycaster ») : pour chaque colonne de l'écran, on lance un rayon dans le plan
// en grille ; plus le mur est loin, plus la colonne est petite. Les personnages et objets sont des images toujours
// tournées vers le joueur, cachées colonne par colonne derrière les murs plus proches.
// Pas de visée en hauteur : l'horizon est toujours au milieu de la vue.
//
// Décor (objet `decor`) :
//  murs[code]      : texture du rez-de-chaussée (ou [sans panneau, avec panneau] : le panneau sur 1 case sur 6)
//  etages[code]    : texture des étages au-dessus (immeubles)
//  hauteurs[code]  : hauteur du mur (1 = un étage ; 3 = immeuble de 3 niveaux ; sans « etages » : texture étirée)
//  ciel            : panorama (toile) qui fait le tour complet, il tourne avec la vue
//  sol             : { genres (Uint8Array, un genre de sol par case), largeur, textures [Uint32Array 32×32], image, buf, brume }

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
// ombres toutes prêtes (créer une couleur « rgba(...) » à chaque colonne coûte cher)
const OMBRES = Array.from({ length: 41 }, (_, i) => `rgba(28,30,38,${(i / 50).toFixed(2)})`);
const touches = [];   // murs touchés par un rayon (un mur bas laisse voir le mur plus haut derrière lui)

function ciel(ctx, l, mi, cam, decor) {
  const pano = decor.ciel, pw = pano.width;
  const champ = 2 * Math.atan(Math.hypot(cam.px, cam.py));       // angle de vue
  const vw = pw * champ / (2 * Math.PI);                          // largeur du panorama visible
  let x0 = ((Math.atan2(cam.dy, cam.dx) - champ / 2) / (2 * Math.PI)) * pw;
  x0 = ((x0 % pw) + pw) % pw;
  const a = Math.min(vw, pw - x0);
  ctx.drawImage(pano, x0, 0, a, pano.height, 0, 0, l * a / vw, mi);
  if (a < vw) ctx.drawImage(pano, 0, 0, vw - a, pano.height, l * a / vw, 0, l * (vw - a) / vw, mi);
}

function sol(ctx, l, h, mi, cam, decor) {
  const S = decor.sol, buf = S.buf, W = S.largeur, Hp = S.genres.length / W;
  const r0x = cam.dx - cam.px, r0y = cam.dy - cam.py, r1x = cam.dx + cam.px, r1y = cam.dy + cam.py;
  let i = 0;
  for (let y = 0; y < h - mi; y++) {
    const dist = (0.5 * h) / (y + 0.5);
    const pasX = dist * (r1x - r0x) / l, pasY = dist * (r1y - r0y) / l;
    let fx = cam.x + dist * r0x, fy = cam.y + dist * r0y;
    for (let x = 0; x < l; x++, i++) {
      const cx = fx | 0, cy = fy | 0;   // (le joueur et ce qu'il voit sont toujours dans le plan : coordonnées positives)
      const g = cx >= 0 && cy >= 0 && cx < W && cy < Hp ? S.genres[cy * W + cx] : 0;
      buf[i] = S.textures[g][(((fy - cy) * 32) & 31) * 32 + (((fx - cx) * 32) & 31)];
      fx += pasX; fy += pasY;
    }
  }
  ctx.putImageData(S.image, 0, mi);
  ctx.fillStyle = S.brume; ctx.fillRect(0, mi, l, h - mi);   // plus sombre au loin
}

// ctx : toile de la vue (l × h). cam : { x, y, dx, dy, px, py } (position, direction, plan de la caméra).
// sprites : [{ x, y, toile, haut, z }] (haut : hauteur dans le monde, 1 = un étage ; z : hauteur du bas, 0 = au sol)
export function rendre(ctx, l, h, plan, cam, decor, sprites) {
  const mi = h / 2;
  ciel(ctx, l, mi, cam, decor);
  sol(ctx, l, h, mi, cam, decor);

  for (let x = 0; x < l; x++) {
    const camX = 2 * x / l - 1;
    const rx = cam.dx + cam.px * camX, ry = cam.dy + cam.py * camX;
    let cx = cam.x | 0, cy = cam.y | 0;
    const ddx = Math.abs(1 / rx), ddy = Math.abs(1 / ry);
    const sx = rx < 0 ? -1 : 1, sy = ry < 0 ? -1 : 1;
    let distX = (rx < 0 ? cam.x - cx : cx + 1 - cam.x) * ddx;
    let distY = (ry < 0 ? cam.y - cy : cy + 1 - cam.y) * ddy;
    let n = 0, plusHaut = 0;
    for (let i = 0; i < 64 && n < 4; i++) {
      let cote;
      if (distX < distY) { distX += ddx; cx += sx; cote = 0; } else { distY += ddy; cy += sy; cote = 1; }
      const code = murEn(plan, cx, cy);
      if (!code) continue;
      const hm = decor.hauteurs[code] || 1;
      if (hm <= plusHaut) continue;   // caché par un mur plus proche au moins aussi haut
      const perp = Math.max(0.01, cote === 0 ? distX - ddx : distY - ddy);
      touches[n++] = { code, cote, perp, cx, cy, hm };
      plusHaut = hm;
      if (hm >= 3) break;
    }
    zbuf[x] = n ? touches[0].perp : 1e9;
    // du plus loin au plus proche : le mur proche (bas) se dessine par-dessus le grand mur derrière
    for (let k = n - 1; k >= 0; k--) {
      const { code, cote, perp, cx: tx, cy: ty, hm } = touches[k];
      const hl = h / perp;
      let mx = cote === 0 ? cam.y + perp * ry : cam.x + perp * rx;
      mx -= Math.floor(mx);
      let tex = decor.murs[code] || decor.murs[1];
      if (Array.isArray(tex)) tex = tex[(tx * 31 + ty * 17) % 6 === 0 ? 1 : 0];
      let col = (mx * tex.width) | 0;
      if ((cote === 0 && rx < 0) || (cote === 1 && ry > 0)) col = tex.width - col - 1;
      const bas = mi + hl / 2;
      const haut = decor.etages[code];
      if (!haut) ctx.drawImage(tex, col, 0, 1, tex.height, x, bas - hl * hm, 1, hl * hm);   // une seule texture étirée (portail, palissade)
      else for (let e = 0; e < hm; e++) {   // immeuble : rez-de-chaussée + étages
        const t = e === 0 ? tex : haut;
        const c = Math.min(t.width - 1, (col * t.width / tex.width) | 0);
        ctx.drawImage(t, c, 0, 1, t.height, x, bas - hl * (e + 1), 1, hl);
      }
      const ombre = Math.min(0.8, cote * 0.22 + perp * 0.045);
      if (ombre > 0.02) { ctx.fillStyle = OMBRES[Math.round(ombre * 50)]; ctx.fillRect(x, bas - hl * hm, 1, hl * hm); }
    }
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
