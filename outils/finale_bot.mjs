// Bot d'audit du BOSS FINAL (le mécha des Bracass', shoot'em up) : joue des combats COMPLETS dans un vrai navigateur
// (Chromium sans écran), en accéléré (la scène avance image par image, sans attendre le vrai temps).
// Le bot ne triche pas : il VOIT ce qu'un joueur voit (tirs à l'écran, couloirs rouges, traits, cibles au sol, cône) et
// pilote comme un doigt (this.cible), avec un temps de réaction, un horizon d'anticipation et des tirs « pas vus ».
// GAME OVER : il CONTINUE (comme un joueur) jusqu'à 6 fois, puis abandonne.
//
// Lancer :  node outils/finale_bot.mjs [parties par case] [difficultés] [profils]
//   ex.    node outils/finale_bot.mjs                     (4 parties x 3 difficultés x 3 profils)
//          node outils/finale_bot.mjs 2 normal moyen
//   profils : expert (réagit en 0,08 s, voit 0,6 s à l'avance, 2 % de tirs pas vus)
//             moyen  (0,15 s, 0,45 s, 8 %)        enfant (0,25 s, 0,3 s, 18 %)
// Le hasard est fixé (graine) : deux lancements donnent les mêmes chiffres.
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join, normalize } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const RACINE = process.cwd();
const PARTIES = Number(process.argv[2] || 4);
const DIFFS = (process.argv[3] || 'facile,normal,champion').split(',');
const NOMS_P = (process.argv[4] || 'expert,moyen,enfant').split(',');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.json': 'application/json', '.css': 'text/css', '.webmanifest': 'application/json' };
const serveur = createServer(async (req, res) => {
  try {
    const chemin = normalize(join(RACINE, decodeURIComponent(req.url.split('?')[0])));
    if (!chemin.startsWith(RACINE)) throw new Error('hors du dépôt');
    const donnees = await readFile(chemin);
    res.writeHead(200, { 'Content-Type': TYPES[extname(chemin)] || 'application/octet-stream' }); res.end(donnees);
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = serveur.address().port;

const PROFILS = {
  expert: { reac: 0.08, horizon: 0.6, err: 0.02, marge: 6, bruit: 4, bombe: 0.9 },
  moyen:  { reac: 0.15, horizon: 0.45, err: 0.08, marge: 4, bruit: 10, bombe: 0.6 },
  enfant: { reac: 0.25, horizon: 0.3, err: 0.18, marge: 2, bruit: 20, bombe: 0.3 },
};

// ---------------- ce qui tourne DANS la page : jouer jusqu'à la victoire ou au GAME OVER ----------------
async function jouer({ P, graine, limite }) {
  let s = graine; const alea = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const gauss = () => { let u = 0, v = 0; while (!u) u = alea(); while (!v) v = alea(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const { REGLAGES: R } = await import('/src/bosses/finale/reglages.js');
  const sc = window.jeu.scene.getScene('FinaleMecha');
  const Z = R.vaisseau.zone, DT = 1 / 60;
  let n = sc.time.now, prochaine = 0, bonsY = [], bonsYa = -1, coupsPar = {}, viesAvant = sc.vies;
  const vu = new WeakMap();
  const voit = (b) => { if (!vu.has(b)) vu.set(b, alea() > P.err); return vu.get(b); };
  // hauteurs d'où un tir touche la partie visée (les autres parties bloquent)
  const calculerBonsY = () => {
    bonsY = [];
    for (let y = Z.yMin; y <= Z.yMax; y += 10) {
      for (let x = sc.vaisseau.x + 40; x < 960; x += 8) if (sc.partieEn(x, y, sc.parties[sc.actuelle])) { bonsY.push(y); break; }
    }
  };
  const danger = (cx, cy) => {
    const px = cx + R.vaisseau.pointX; let d = 0;
    for (const b of sc.balles) {
      if (!voit(b)) continue;
      for (let t = 0.05; t <= P.horizon; t += 0.05) {
        const bx = b.type === 'copie' ? b.balance + Math.sin((b.age + t) * 3 + b.balance) * 28 : b.x + b.vx * t, by = b.y + b.vy * t;
        if (Math.hypot(bx - px, by - cy) < b.r + R.vaisseau.rayon + P.marge) { d += 12 * (P.horizon + 0.15 - t); break; }
      }
    }
    for (const c of sc.couloirs) if (Math.abs(cy - c.y) < c.h / 2 + 14 + P.marge) d += 40;
    for (const tr of sc.traits) {
      const vx = Math.cos(tr.a), vy = Math.sin(tr.a), k = (px - tr.x) * vx + (cy - tr.y) * vy;
      if (k > 0 && Math.abs((px - tr.x) * vy - (cy - tr.y) * vx) < 26 + P.marge) d += 35;
    }
    for (const c of sc.cibles) if (Math.hypot(c.x - px, c.y - cy) < 40 + P.marge) d += 25 * (c.t / c.duree + 0.3);
    // le ∞ du Dempsey : rester loin du chemin (pointillés) tant que le poing peut y passer
    for (const ch of sc.chemins) for (let k = 0; k < 32; k++) { const q = sc.pointInfini(ch, k / 32 * 2 * Math.PI); if (Math.hypot(q.x - px, q.y - cy) < 40 + P.marge) { d += 8; break; } }
    for (const f of sc.flaques) if (Math.hypot(f.x - px, f.y - cy) < f.r) d += 1.5;
    if (sc.cone && sc.parties[sc.actuelle] && sc.parties[sc.actuelle].id === 'beufa') {
      const c = sc.cone, a = Math.atan2(cy - c.y, px - c.x);
      if (Math.abs(Phaser.Math.Angle.Wrap(a - c.a)) < c.demi + 0.05) d += 2 + 4 * (sc.repere || 0);
    }
    return d;
  };
  while (sc.T < limite) {
    if (sc.etat === 'jeu' && !sc.termine) {
      if (sc.actuelle !== bonsYa || alea() < 0.03) { calculerBonsY(); bonsYa = sc.actuelle; }
      if (sc.T >= prochaine) {
        prochaine = sc.T + P.reac;
        const v = sc.vaisseau; let mieux = null, score = Infinity, dMieux = 0;
        for (let dx = -150; dx <= 150; dx += 50) for (let dy = -150; dy <= 150; dy += 25) {
          const cx = Math.min(Z.xMax, Math.max(Z.xMin, v.x + dx)), cy = Math.min(Z.yMax, Math.max(Z.yMin, v.y + dy));
          const dg = danger(cx, cy);
          const vise = bonsY.length ? Math.min(...bonsY.map(y => Math.abs(y - cy))) : 0;
          const sc2 = dg * 10 + vise * 0.05 + Math.abs(cx - 230) * 0.004 + Math.hypot(dx, dy) * 0.002;
          if (sc2 < score) { score = sc2; mieux = { x: cx, y: cy }; dMieux = dg; }
        }
        sc.cible = { x: mieux.x + gauss() * P.bruit, y: mieux.y + gauss() * P.bruit };
        // panique : même la meilleure place est dangereuse → BOMBE (pas toujours : profil)
        if (dMieux > 1.2 && danger(v.x, v.y) > 2.5 && sc.bombes > 0 && sc.invincible <= 0 && alea() < P.bombe) sc.bombe();
      }
    }
    n += DT * 1000; sc.sys.step(n, DT * 1000);
    if (sc.vies < viesAvant) { const id = sc.parties[sc.actuelle].id; coupsPar[id] = (coupsPar[id] || 0) + (viesAvant - sc.vies); }
    viesAvant = sc.vies;
    if (sc.etat === 'perdu' || sc.gagne) break;
  }
  return { gagne: !!sc.gagne, perdu: sc.etat === 'perdu', partie: sc.actuelle, temps: sc.gagne ? sc.temps : sc.T, vies: sc.vies, bombes: sc.stats.bombes,
    coups: sc.stats.coups, rang: sc.gagne ? sc.resultat.r.rang : null, coupsPar, pv: sc.parties.map(p => Math.max(0, Math.round(p.pv))) };
}

// ---------------- pilotage depuis Node ----------------
const navigateur = await chromium.launch();
const page = await navigateur.newPage({ viewport: { width: 960, height: 540 } });
const erreurs = [];
page.on('pageerror', (e) => erreurs.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') erreurs.push('console : ' + m.text()); });
await page.goto(`http://localhost:${port}/index.html`); await page.waitForTimeout(2500);

async function demarrer(nomDiff, graine, reprise, continues) {
  await page.evaluate(() => window.jeu.loop.wake());
  await page.evaluate(async ({ nomDiff, graine, reprise, continues }) => {
    let s = graine; Math.random = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const { DIFFICULTES } = await import('/src/bosses/finale/reglages.js');
    const j = window.jeu; j.scene.getScenes(true).forEach(sc => j.scene.stop(sc.scene.key));
    j.scene.start('FinaleMecha', { phase: 'mecha', rejouer: true, nomDiff, diffObjet: DIFFICULTES[nomDiff], reprise, continues });
  }, { nomDiff, graine, reprise, continues });
  await page.waitForFunction(() => { const s = window.jeu.scene.getScene('FinaleMecha'); return s && s.sys.isActive() && s.parties && s.vies !== undefined; }, null, { timeout: 20000 });
  await page.evaluate(() => window.jeu.loop.sleep());
}

const resultats = {};
const t0 = Date.now();
for (const diff of DIFFS) for (const nomP of NOMS_P) {
  const cle = `${diff} / ${nomP}`; resultats[cle] = [];
  for (let k = 0; k < PARTIES; k++) {
    const graine = 1000 + k * 77 + DIFFS.indexOf(diff) * 7 + NOMS_P.indexOf(nomP) * 3;
    let reprise = 0, continues = 0, total = 0, coups = 0, bombes = 0, coupsPar = {}, fin;
    for (;;) {
      await demarrer(diff, graine + continues * 13, reprise, continues);
      const r = await page.evaluate(jouer, { P: PROFILS[nomP], graine: graine + continues * 31, limite: 900 });
      total += r.temps; coups += r.coups; bombes += r.bombes;
      for (const [id, c] of Object.entries(r.coupsPar)) coupsPar[id] = (coupsPar[id] || 0) + c;
      if (r.gagne || !r.perdu || continues >= 6) { fin = r; break; }
      continues++; reprise = r.partie;
    }
    resultats[cle].push({ gagne: fin.gagne, continues, temps: total, coups, bombes, rang: fin.rang, vies: fin.vies, coupsPar, partie: fin.partie });
  }
}
await navigateur.close(); serveur.close();

// ---------------- rapport ----------------
const moy = (l) => l.length ? l.reduce((a, b) => a + b, 0) / l.length : 0;
console.log(`\nBOSS FINAL (mécha) — ${PARTIES} partie(s) par case, ${Math.round((Date.now() - t0) / 1000)} s\n`);
for (const [cle, l] of Object.entries(resultats)) {
  const sansCont = l.filter(r => r.gagne && r.continues === 0).length;
  const rangs = l.filter(r => r.rang).map(r => r.rang).join('') || '-';
  const coupsPar = {}; for (const r of l) for (const [id, c] of Object.entries(r.coupsPar)) coupsPar[id] = (coupsPar[id] || 0) + c;
  const pire = Object.entries(coupsPar).sort((a, b) => b[1] - a[1]).map(([id, c]) => `${id} ${(c / l.length).toFixed(1)}`).join(', ');
  console.log(`${cle.padEnd(20)} gagne ${l.filter(r => r.gagne).length}/${l.length} (sans continue ${sansCont})  continues moy ${moy(l.map(r => r.continues)).toFixed(1)}` +
    `  temps ${Math.round(moy(l.map(r => r.temps)))} s  coups ${moy(l.map(r => r.coups)).toFixed(1)}  bombes ${moy(l.map(r => r.bombes)).toFixed(1)}  rangs ${rangs}\n${''.padEnd(22)}coups reçus par partie : ${pire || '0'}`);
}
console.log(erreurs.length ? `\nERREURS (${erreurs.length}) :\n` + [...new Set(erreurs)].slice(0, 10).join('\n') : '\n0 erreur dans la page');
