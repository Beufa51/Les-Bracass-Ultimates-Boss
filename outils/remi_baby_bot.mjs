// Bot de test du BABYFOOT de Rémi (V19p) : joue une partie par difficulté dans un vrai navigateur (Chromium, sans écran).
// Le bot arrête tous les tirs de Rémi (il triche : il sait où passe la balle), puis :
//  - « droit » : il tourne la visée jusqu'au VERT le plus proche (comme le guide) et tire ;
//  - « bande » : il ne tire QU'EN BANDE (angle > 0,45) quand une bande est verte.
// Il vérifie que TOUT TIR VERT MARQUE (sinon la ligne ment au joueur) et donne score, durée et attente avant le vert.
// Lancer : node outils/remi_baby_bot.mjs   (≈ 2 min ; après tout changement de src/bosses/remi/babyfoot/ ou des réglages BABY)
// Sortie 1 si un tir vert a été arrêté ou si une partie ne finit pas.
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join, normalize } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const RACINE = process.cwd();
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.json': 'application/json', '.css': 'text/css' };

const serveur = createServer(async (req, res) => {
  try {
    const chemin = normalize(join(RACINE, decodeURIComponent(req.url.split('?')[0])));
    if (!chemin.startsWith(RACINE)) throw new Error('hors du dépôt');
    const donnees = await readFile(chemin);
    res.writeHead(200, { 'Content-Type': TYPES[extname(chemin)] || 'application/octet-stream' }); res.end(donnees);
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = serveur.address().port;

const navigateur = await chromium.launch();
let echecs = 0;
for (const diff of ['entrainement', 'facile', 'normal', 'champion']) {
  for (const mode of ['droit', 'bande']) {
    const page = await navigateur.newPage({ viewport: { width: 960, height: 540 } });
    const erreurs = []; page.on('pageerror', e => erreurs.push(e.message));
    await page.goto(`http://localhost:${port}/index.html`); await page.waitForTimeout(2500);
    await page.evaluate((diff) => { const j = window.jeu; j.scene.getScenes(true).forEach(s => j.scene.stop(s.scene.key)); j.scene.start('RemiBaby', { phase: 'baby', diff, rejouer: true }); }, diff);
    await page.waitForTimeout(1500);
    const r = await page.evaluate(async (mode) => {
      const sc = window.jeu.scene.getScene('RemiBaby'), st = { tirsVerts: 0, verts_arretes: 0, attente: 0 };
      const oc = sc.contre.bind(sc); sc.contre = (n) => { if (sc.tirVert) st.verts_arretes++; sc.tirVert = false; oc(n); };
      const ob = sc.butToi.bind(sc); sc.butToi = (g) => { sc.tirVert = false; ob(g); };
      const t0 = Date.now(); let debut = 0;
      while (!sc.termine && sc.etat !== 'fin' && Date.now() - t0 < 70000) {
        await new Promise(r => setTimeout(r, 16));
        if (sc.etat === 'tir' && sc.balle) sc.pos.toi = sc.cible = Math.max(-0.13, Math.min(0.13, sc.balle.x + sc.balle.vx * ((sc.balle.z - 0.07) / -sc.balle.vz)));
        if (sc.etat !== 'riposte') { debut = 0; continue; }
        if (!debut) debut = sc.horloge;
        sc.ivresse = 0;   // (le bot ne mesure pas l'effet bourré)
        const ok = (l) => l.libre && !l.enFace;
        let angle = null;
        if (mode === 'droit') { const i = sc.chercherVert(); if (i === 0) angle = sc.visee; else if (i) sc.visee += i * 0.01; }
        else for (let a = 0.45; a <= 0.85 && angle === null; a += 0.01) for (const s of [-1, 1]) if (angle === null && ok(sc.cheminLibre(sc.balle.x, s * a))) angle = s * a;
        if (angle !== null) { st.attente += sc.horloge - debut; st.tirsVerts++; sc.visee = angle; sc.tirVert = true; sc.riposter(angle); }
      }
      return { toi: sc.butsToi, remi: sc.butsRemi, fini: sc.etat === 'fin' || sc.butsToi >= 5, s: Math.round((Date.now() - t0) / 1000), ...st, attente: +(st.attente / Math.max(1, st.tirsVerts)).toFixed(2) };
    }, mode);
    const mauvais = r.verts_arretes > 0 || !r.fini || erreurs.length;
    if (mauvais) echecs++;
    console.log(`${mauvais ? '✗' : '✓'} ${diff.padEnd(12)} ${mode.padEnd(6)} score ${r.toi}-${r.remi} en ${r.s} s ; tirs verts ${r.tirsVerts}, arrêtés ${r.verts_arretes} ; attente moyenne avant le vert ${r.attente} s${erreurs.length ? ' ; ERREURS : ' + erreurs.slice(0, 2).join(' / ') : ''}`);
    await page.close();
  }
}
await navigateur.close(); serveur.close();
console.log(echecs ? `${echecs} problème(s)` : 'Babyfoot : 0 problème');
process.exit(echecs ? 1 : 0);
