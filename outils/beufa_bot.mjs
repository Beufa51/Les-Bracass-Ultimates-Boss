// Bot d'audit de l'INFILTRATION de Beufa : joue les 4 pièces dans un vrai navigateur (Chromium sans écran), en accéléré.
// Le jeu est déterministe tant qu'on n'est pas repéré : le bot PRÉVOIT les rondes (copie des gardes avancée pas à pas)
// et cherche un chemin dans le temps (grille de 12 px, pas de 0,1 s, 4 directions + attendre) qui reste hors des cônes
// et des halos, avec une MARGE. Puis il l'exécute avec des erreurs selon le profil :
//   EXPERT : marge 22 px, aucune erreur ; MOYEN : marge 10 px, hésite 2 % des pas (0,3-1 s), réagit en 0,4 s ;
//   ENFANT : marge 2 px, hésite 5 % des pas, 3 % de pas de travers, réagit en 0,8 s.
// Repéré : il continue vers la sortie (les gardes courent derrière) ; renvoyé : il replanifie depuis l'entrée.
// Lancer : node outils/beufa_bot.mjs [nombre de parties par case, 2 par défaut]   (≈ 3-6 min)
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join, normalize } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const RACINE = process.cwd();
const PARTIES = Number(process.argv[2] || 2);
const DIFFS = (process.argv[3] || 'entrainement,facile,normal,champion').split(',');
const NOMS_P = (process.argv[4] || 'expert,moyen,enfant').split(',');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.json': 'application/json', '.css': 'text/css', '.webmanifest': 'application/json' };
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
  expert: { marge: 22, angle: 8, hesite: 0, travers: 0, reaction: 0 },
  moyen: { marge: 10, angle: 4, hesite: 0.02, travers: 0, reaction: 0.4 },
  enfant: { marge: 2, angle: 0, hesite: 0.05, travers: 0.03, reaction: 0.8 },
};

// ---------------- ce qui tourne DANS la page ----------------
async function jouer({ profil, graine }) {
  let s = graine; const alea = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const sc = window.jeu.scene.getScene('BeufaInfiltration');
  const R = sc.R_bot, PIECES = sc.PIECES_bot;
  sc.majNuit = () => {}; sc.afficher = () => {};   // pas d'affichage : on va vite (la logique est intacte)
  const DT = 0.05, PAS = 0.1, CASE = 12;
  const tick = (k) => { for (const n of ['gauche', 'droite', 'haut', 'bas', 'z']) sc.touches[n].isDown = n === k; sc.update(0, DT * 1000); };
  // la phase de jeu commence (cinématique)
  if (window.__debug) console.log('debut'); let garde = 0; while (sc.phase !== 'jeu' && garde++ < 400) tick(null);
  const norm = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const stats = { pieces: [], erreurs: [] };

  function prevoir(duree) {   // trajectoires des gardes + halos, sans joueur
    const faux = Object.create(sc);
    faux.joueur = { x: -99999, y: -99999 }; faux.attraper = () => {}; faux.temps = sc.temps;
    const gs = sc.gardes.map((g) => ({ ...g, chemin: g.chemin }));
    const traj = [];
    const n = Math.ceil(duree / PAS);
    for (let i = 0; i <= n; i++) {
      traj.push({ g: gs.map((g) => [g.x, g.y, g.angle, g.etat]), p: sc.projecteurs.map((pr) => {
        const t = (Math.sin((faux.temps + (pr.phase || 0)) * Math.PI * 2 / R.projecteur.periode) + 1) / 2;
        return [pr.depart[0] + (pr.arrivee[0] - pr.depart[0]) * t, pr.depart[1] + (pr.arrivee[1] - pr.depart[1]) * t];
      }) });
      for (let k = 0; k < PAS / DT; k++) { faux.temps += DT; for (const g of gs) sc.pasGarde.call(faux, g, DT); }
    }
    return traj;
  }
  const P = () => PIECES[sc.piece];
  function sortie(x, y) {
    const p = P();
    if (p.sortie === 'haut') return y < 36 && x > 445 && x < 515;
    return x > 1396 && y > 330 && y < 400;
  }
  function danger(x, y, etat, pr) {
    const portee = R.garde.portee + pr.marge, ang = (R.garde.angle + pr.angle) * Math.PI / 180;
    let r = 0;
    for (const f of (sc.flaques || [])) if (((x - f.x) / 34) ** 2 + ((y + 20 - f.y) / 21) ** 2 < 1) return 9;
    for (const [gx, gy, ga, ge] of etat.g) {
      const dx = x - gx, dy = y - gy, d = Math.hypot(dx, dy);
      if (d < R.alerte.rattrape + 30) return 9;
      if (ge !== 'ronde' && ge !== 'retour' && ge !== 'verification') { if (d < 300) return 9; continue; }
      if (d > portee) continue;
      if (d < 44 + pr.marge) { r = 1; continue; }
      if (Math.abs(norm(Math.atan2(dy, dx) - ga)) > ang) continue;
      if (!sc.vueBloquee(gx, gy, x, y, null)) r = 1;
    }
    for (const [hx, hy] of etat.p) {
      if (Math.hypot(x - hx, y - hy) < R.projecteur.rayon + pr.marge && !sc.vueBloquee(hx, hy, x, y, null)) return r ? 9 : 2;
    }
    return r;
  }
  // recherche dans le temps (A*), départ = position actuelle
  function planifier(pr) {
    if (window.__debug) console.log('planifier', performance.now()|0); const H = 60, traj = prevoir(H); if (window.__debug) console.log('prevu', performance.now()|0);
    const x0 = sc.joueur.x, y0 = sc.joueur.y, p = P();
    const libre = new Map();
    const estLibre = (i, j) => {
      const k = i * 1000 + j; if (libre.has(k)) return libre.get(k);
      const x = x0 + i * CASE, y = y0 + j * CASE;
      const v = x >= 22 && y >= 22 && x <= p.l - 22 && y <= p.h - 22 && !sc.touche(x, y, R.joueur.rayon);
      libre.set(k, v); return v;
    };
    const cible = p.sortie === 'haut' ? [480, 30] : [1405, 365];
    const h = (i, j) => (Math.abs(x0 + i * CASE - cible[0]) + Math.abs(y0 + j * CASE - cible[1])) / CASE;
    const tas = [], vu = new Set(), parent = new Map();
    const pousser = (n) => { tas.push(n); let i = tas.length - 1; while (i) { const q = (i - 1) >> 1; if (tas[q].f <= n.f) break; tas[i] = tas[q]; tas[q] = n; i = q; } };
    const tirer = () => { const r = tas[0], d = tas.pop(); if (tas.length) { tas[0] = d; let i = 0; for (;;) { const a = 2 * i + 1, b = a + 1; let m = i; if (a < tas.length && tas[a].f < tas[m].f) m = a; if (b < tas.length && tas[b].f < tas[m].f) m = b; if (m === i) break; [tas[i], tas[m]] = [tas[m], tas[i]]; i = m; } } return r; };
    pousser({ i: 0, j: 0, t: 0, q: 0, f: h(0, 0) });
    const DIRS = [[0, 0, null], [1, 0, 'droite'], [-1, 0, 'gauche'], [0, 1, 'bas'], [0, -1, 'haut']];
    let explore = 0;
    while (tas.length && explore++ < 200000) {
      const n = tirer();
      const x = x0 + n.i * CASE, y = y0 + n.j * CASE;
      if (sortie(x, y)) { if (window.__debug) console.log('plan', explore, n.t, pr.tolerance); const plan = []; let k = n.i + ',' + n.j + ',' + n.t + ',' + n.q; while (parent.has(k)) { const [pk, dir] = parent.get(k); plan.unshift(dir); k = pk; } return plan; }
      if (n.t >= traj.length - 1) continue;
      for (const [di, dj, dir] of DIRS) {
        const i = n.i + di, j = n.j + dj, t = n.t + 1;
        if (!estLibre(i, j)) continue;
        const dg = danger(x0 + i * CASE, y0 + j * CASE, traj[t], pr);
        if (dg === 9) continue;
        // la jauge « ? » : elle monte quand on est vu, redescend sinon (on ne la laisse pas dépasser la tolérance)
        let jg = n.q / 20;
        jg = dg === 1 ? jg + PAS / R.garde.reperage : dg === 2 ? jg + PAS / R.projecteur.reperage : Math.max(0, jg - PAS / 0.5);
        if (jg > (pr.tolerance || 0) + 1e-6 && dg) continue;
        const q = Math.round(jg * 20), cle = i + ',' + j + ',' + t + ',' + q;
        if (vu.has(cle)) continue;
        vu.add(cle); parent.set(cle, [n.i + ',' + n.j + ',' + n.t + ',' + n.q, dir]);
        pousser({ i, j, t, q, f: t + h(i, j) * 1.3 + q * 0.05 });
      }
    }
    if (window.__debug) console.log('ECHEC', explore, sc.piece, Math.round(x0), Math.round(y0));
    return null;
  }
  const DIR4 = ['droite', 'gauche', 'bas', 'haut'];
  for (let piece = 0; piece < 4; piece++) {
    const st = { piece: piece + 1, temps: 0, alertes: 0, renvois: 0, sansChemin: 0 };
    const t0 = sc.temps, a0 = sc.alertes;
    let plan = null, k = 0, retard = 0, enAlerte = false;
    let tours = 0;
    while (sc.piece === piece && sc.phase !== 'fin' && sc.temps - t0 < 600 && tours++ < 200000) {
      if (sc.phase === 'attrape') { st.renvois++; while (sc.phase === 'attrape') tick(null); plan = null; continue; }
      if (sc.phase !== 'jeu') { tick(null); continue; }
      const alerte = sc.gardes.some((g) => g.etat === 'poursuite');
      if (alerte && !enAlerte) retard = 0;
      enAlerte = alerte;
      if (!plan || k >= plan.length) {
        plan = null; k = 0;
        if (!alerte) for (const [m, tol] of [[1, 0], [0.5, 0], [0.3, 0.35], [0, 0.6]]) {   // pas de chemin avec sa marge ? il accepte de frôler les cônes
          plan = planifier({ ...profil, marge: profil.marge * m, angle: profil.angle * m, tolerance: tol });
          if (plan) { if (tol) st.frole = (st.frole || 0) + 1; if (m < 1) st.serre = (st.serre || 0) + 1; break; }
        }
        if (!plan) {   // pas de chemin sûr (ou poursuivi) : il fonce vers la sortie au plus court
          if (!alerte) { st.sansChemin++; for (let i = 0; i < 10 && sc.phase === 'jeu'; i++) tick(null); continue; }
          const p = P(), c = p.sortie === 'haut' ? [480, 20] : [1420, 365];
          const dx = c[0] - sc.joueur.x, dy = c[1] - sc.joueur.y;
          const d = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'droite' : 'gauche') : (dy > 0 ? 'bas' : 'haut');
          const bx = sc.joueur.x, by = sc.joueur.y; tick(d); tick(d);
          if (Math.hypot(sc.joueur.x - bx, sc.joueur.y - by) < 1) { const e = DIR4[Math.floor(alea() * 4)]; tick(e); tick(e); }
          plan = null; continue;
        }
      }
      // erreurs du profil : hésitation (il ne bouge plus) ou pas de travers, puis il réagit avec retard
      if (alea() < profil.hesite) { const n = Math.round((0.3 + alea() * 0.7) / DT); for (let i = 0; i < n && sc.phase === 'jeu'; i++) tick(null); retard = profil.reaction; }
      else if (alea() < profil.travers) { const e = DIR4[Math.floor(alea() * 4)]; tick(e); tick(e); retard = profil.reaction; }
      const dir = plan[k++]; tick(dir); tick(dir);
      if (retard > 0) { retard -= PAS; if (retard <= 0) plan = null; }   // il se rend compte du décalage : il replanifie
    }
    st.temps = +(sc.temps - t0).toFixed(1); st.alertes = sc.alertes - a0;
    stats.pieces.push(st);
    if (sc.phase === 'fin') break;
    if (sc.temps - t0 >= 600) { stats.bloque = piece + 1; break; }
  }
  stats.total = +sc.temps.toFixed(1); stats.alertes = sc.alertes; stats.fini = sc.phase === 'fin';
  return stats;
}

// ---------------- le pilote ----------------
const navigateur = await chromium.launch();
const resultats = [];
for (const diff of DIFFS) {
  for (const nomP of NOMS_P) { const profil = PROFILS[nomP];
    for (let n = 0; n < PARTIES; n++) {
      const page = await navigateur.newPage({ viewport: { width: 960, height: 540 } });
      const erreurs = []; page.on('pageerror', (e) => erreurs.push(e.message)); if (process.env.DEBUG) page.on('console', (m) => console.log('  ', m.text()));
      await page.goto(`http://localhost:${port}/index.html`); await page.waitForTimeout(2500);
      await page.evaluate(async (diff) => {
        const R = await import('/src/bosses/beufa/reglages.js');
        const j = window.jeu; j.scene.getScenes(true).forEach((s) => j.scene.stop(s.scene.key));
        j.scene.start('BeufaInfiltration', { rejouer: true, nomDiff: diff, diffObjet: R.DIFFICULTES[diff] });
        window.__R = R;
      }, diff);
      await page.waitForFunction(() => { const sc = window.jeu.scene.getScene('BeufaInfiltration'); return sc && (sc.phase === 'cinema' || sc.phase === 'jeu'); }, null, { timeout: 20000 });
      await page.evaluate((DBG) => { const sc = window.jeu.scene.getScene('BeufaInfiltration'); sc.R_bot = window.__R.REGLAGES; sc.PIECES_bot = window.__R.PIECES; window.jeu.loop.sleep(); window.__debug = DBG; }, !!process.env.DEBUG);
      const r = await page.evaluate(jouer, { profil, graine: 1000 + n * 7919 });
      r.diff = diff; r.profil = nomP; r.erreursJS = erreurs.slice(0, 2);
      resultats.push(r);
      const p = r.pieces.map((q) => `P${q.piece} ${q.temps}s a${q.alertes} r${q.renvois}${q.sansChemin ? ' !' + q.sansChemin : ''}${q.serre ? ' ~' + q.serre : ''}${q.frole ? ' frôle' + q.frole : ''}`).join(' | ');
      console.log(`${r.fini ? '✓' : '✗'} ${diff.padEnd(12)} ${nomP.padEnd(6)} total ${r.total}s alertes ${r.alertes}  ${p}${r.bloque ? ' BLOQUÉ pièce ' + r.bloque : ''}${erreurs.length ? ' ERREURS : ' + erreurs.join(' / ') : ''}`);
      await page.close();
    }
  }
}
await navigateur.close(); serveur.close();
// moyennes
console.log('\nMoyennes (temps total s / alertes / renvois) :');
for (const diff of DIFFS) {
  const l = NOMS_P.map((p) => {
    const rs = resultats.filter((r) => r.diff === diff && r.profil === p);
    const m = (f) => (rs.reduce((a, r) => a + f(r), 0) / rs.length).toFixed(1);
    return `${p} ${m((r) => r.total)} / ${m((r) => r.alertes)} / ${m((r) => r.pieces.reduce((a, q) => a + q.renvois, 0))}`;
  });
  console.log(`${diff.padEnd(12)} ${l.join('   ')}`);
}
