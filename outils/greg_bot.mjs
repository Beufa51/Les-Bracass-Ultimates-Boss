// Bot d'audit du boss GREG (boxe façon Punch-Out, 3 rounds de 60 s) : joue des combats COMPLETS dans un vrai navigateur
// (Chromium sans écran), en accéléré (on fait avancer la scène Phaser image par image, sans attendre le vrai temps).
// Toute la logique du jeu tourne pour de vrai ; le bot ne triche pas : il LIT LES SIGNAUX comme un humain
// (« ! » jaune + côté, « ! ▼ » violet, « !! » SMASH, garde haute / basse de Greg, « hé... » du moment secret,
// fenêtre de contre, boule du Dempsey Roll, compte au tapis) et réagit avec un temps de réaction et des erreurs.
//
// Lancer :  node outils/greg_bot.mjs [parties par case] [difficultés] [profils]
//   ex.    node outils/greg_bot.mjs                       (3 parties x 4 difficultés x 5 profils = 60 combats, ≈ 1 min ; 1 combat ≈ 1 s)
//          node outils/greg_bot.mjs 1 normal expert        (1 combat, ≈ 5 s avec le démarrage)
//   difficultés : entrainement,facile,normal,champion
//   profils     : expert  (réagit en 0,25 s, 3 % d'erreurs, contre, coups au corps, moment secret, Dempsey Roll)
//                 moyen   (0,35 s, 8 % d'erreurs, contre 7 fois sur 10, voit le moment secret 1 fois sur 2)
//                 enfant  (0,5 s, 15 % d'erreurs, souvent du mauvais côté, tape un peu n'importe comment)
//                 spam    (abus : tape sans arrêt, ne se défend jamais)        tortue (abus : garde tout le temps)
// Le 1er combat d'une case démarre la scène ; après une DÉFAITE, le suivant passe par le vrai bouton REJOUER
// (on vérifie que tout repart à zéro). Après une victoire, on rentre à nouveau chez Greg (comme depuis le hub).
// JSON=chemin devant la commande : écrit aussi tous les chiffres bruts dans ce fichier.
// VARIANTE='{"etourdi":{"baisse":6}}' devant la commande : essaie d'autres réglages (fusionnés dans REGLAGES, en mémoire
// seulement : aucun fichier n'est modifié). Pour une difficulté : '{"DIFFICULTES":{"champion":{"vitesse":0.8}}}'.
// Le hasard est fixé (graine) : deux lancements donnent les mêmes chiffres.
import { createServer } from 'http';
import { readFile, writeFile } from 'fs/promises';
import { extname, join, normalize } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const RACINE = process.cwd();
const PARTIES = Number(process.argv[2] || 3);
const DIFFS = (process.argv[3] || 'entrainement,facile,normal,champion').split(',');
const NOMS_P = (process.argv[4] || 'expert,moyen,enfant,spam,tortue').split(',');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.gif': 'image/gif', '.wav': 'audio/wav', '.json': 'application/json', '.css': 'text/css', '.webmanifest': 'application/json' };
const serveur = createServer(async (req, res) => {
  try {
    const chemin = normalize(join(RACINE, decodeURIComponent(req.url.split('?')[0])));
    if (!chemin.startsWith(RACINE)) throw new Error('hors du dépôt');
    const donnees = await readFile(chemin);
    res.writeHead(200, { 'Content-Type': TYPES[extname(chemin)] || 'application/octet-stream' }); res.end(donnees);
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = serveur.address().port;

//  reac : temps de réaction (s)   err : part des signaux ratés exprès   sd : imprécision du moment de l'esquive (s)
//  vise : il esquive quand il reste ce temps avant l'impact   contre : chance de placer le contre après une esquive
//  libres : coups « libres » max quand Greg ne fait rien   bonneZone : vise la zone ouverte   secret : voit le « hé... »
//  rythme : imprécision au Dempsey Roll (s)   tapis : appuis ◀ ▶ par seconde au tapis   mauvaisCote : part des erreurs = mauvais côté
//  tapePrepa : chance par seconde de taper pendant que Greg arme (il pare)
const PROFILS = {
  expert: { reac: 0.25, err: 0.03, sd: 0.05, vise: 0.2, contre: 1, libres: 2, bonneZone: 0.97, secret: 0.9, rythme: 0.035, tapis: 9, mauvaisCote: 0.4, tapePrepa: 0, souffleMin: 30, intervalle: 0.35, corpsContre: true },
  moyen: { reac: 0.35, err: 0.08, sd: 0.08, vise: 0.2, contre: 0.7, libres: 3, bonneZone: 0.85, secret: 0.5, rythme: 0.06, tapis: 7, mauvaisCote: 0.5, tapePrepa: 0.1, souffleMin: 15, intervalle: 0.4 },
  enfant: { reac: 0.5, err: 0.15, sd: 0.12, vise: 0.22, contre: 0.4, libres: 5, bonneZone: 0.55, secret: 0.2, rythme: 0.09, tapis: 5, mauvaisCote: 0.65, tapePrepa: 0.6, souffleMin: 0, intervalle: 0.3 },
  spam: { abus: 'spam', tapis: 6 },
  tortue: { abus: 'tortue', tapis: 6 },
};

// ---------------- ce qui tourne DANS la page : un combat complet ----------------
async function jouer({ P, nomDiff, graine, limite }) {
  let s = graine; const alea = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const gauss = () => { let u = 0, v = 0; while (!u) u = alea(); while (!v) v = alea(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const { REGLAGES: R } = await import('/src/bosses/greg/reglages.js');
  const sc = window.jeu.scene.getScene('GregCombat');
  const proto = Object.getPrototypeOf(sc);           // GregCombat.prototype
  const protoBoss = Object.getPrototypeOf(proto);    // BossScene.prototype
  const K = sc.touches;
  const DT = 1 / 60;
  let now = sc.time.now, tReel = 0;

  // ---------- le carnet de la partie ----------
  const res = {
    fin: null, message: '', rang: null, round: 1, tReel: 0, tempsTotal: 0,
    downsDonnes: 0, downsRecus: 0, pvPerdus: 0, pvDonnes: 0,
    signaux: {},   // type -> { esquive, garde, brisee, encaisse, feinte }
    rounds: [1, 2, 3].map(() => ({ recus: 0, donnes: 0, coupsRecus: 0, signaux: 0 })),
    contres: 0, libresTouches: 0, libresPares: 0, pareEnArmant: 0,
    dempsey: [], secrets: 0, nargues: 0, nargueVu: 0, nargueRate: 0,
    injustes: [], prepas: {}, gapsMax: 0, gaps3: 0, gaps: [],
    enerve: false, etourdis: 0, essoufflements: 0, gardesBrisees: 0, ripostes: 0,
    rejouerOk: null, rejouerProblemes: [], erreursInternes: [],
  };
  // ---------- vérification « rejouer / nouvelle partie : tout repart à zéro » ----------
  {
    const pb = [];
    const ok = (c, m) => { if (!c) pb.push(m); };
    ok(sc.j.vie === 100 && sc.g.vie === 100, `vie joueur ${sc.j.vie} / Greg ${sc.g.vie}`);
    ok(sc.j.downs === 0 && sc.g.downs === 0, `tapis joueur ${sc.j.downs} / Greg ${sc.g.downs}`);
    ok(sc.round === 1, `round ${sc.round}`);
    ok(sc.stats.donnes === 0 && sc.stats.recus === 0, 'statistiques non remises à zéro');
    ok(sc.tempsTotal === 0, 'chrono non remis à zéro');
    ok(!sc.secretFait, 'coup secret déjà « fait »');
    ok(!sc.g.enerve && sc.g.fureur === 1, 'Greg encore énervé');
    ok(sc.j.esprit === 0, 'jauge d\'esprit non vide');
    ok(sc.nomDiff === nomDiff, `difficulté ${sc.nomDiff} au lieu de ${nomDiff}`);
    ok(!sc.smashAnnonce, 'annonce du SMASH déjà faite');
    if (sc.texteAideDempsey && !sc.texteAideDempsey.active) pb.push('texte d\'aide du Dempsey : objet détruit gardé de la partie d\'avant');
    res.rejouerProblemes = pb; res.rejouerOk = pb.length === 0;
  }

  // ---------- on écoute le jeu (sans rien changer à ses règles) ----------
  const ROUND = () => res.rounds[Math.min(2, sc.round - 1)];
  const sig = (type) => (res.signaux[type] = res.signaux[type] || { esquive: 0, garde: 0, brisee: 0, encaisse: 0, feinte: 0 });
  let plan = null;          // le coup de Greg en cours de lecture
  let esquiveReussieA = -1;
  const env = (nom, f) => { sc[nom] = function (...a) { return f.call(this, (...b) => proto[nom].apply(this, b.length ? b : a), ...a); }; };
  env('impactGreg', function (orig) {
    const j = this.j, g = this.g, at = g.attaque;
    const type = at.feinte ? 'feinte' : (at.cible === 'tete' ? (g.riposteEnCours ? 'riposte' : (at.id === 'rafale' ? 'rafale' : 'visage')) : at.cible);
    const gardait = j.garde, avant = this.stats.recus, cleAvant = cleAttaque();
    const etatJ = { sonne: j.sonne > 0, action: !!j.action, pause: j.esquivePause > 0, esqVieille: j.esquive && j.esquive.t > this.diff.esquive, esquive: !!j.esquive, cote: j.esquive && j.esquive.cote };
    orig();
    const S = sig(type);
    let issue;
    if (at.feinte) issue = 'feinte';
    else if (Math.abs(j.contreJusqua - (this.horloge + R.contreFenetre)) < 1e-9) { issue = 'esquive'; esquiveReussieA = tReel; }
    else if (gardait && j.sonne > 0) issue = 'brisee';
    else if (gardait) issue = 'garde';
    else issue = 'encaisse';
    S[issue]++;
    if (issue === 'brisee') res.gardesBrisees++;
    if (issue === 'encaisse' || issue === 'brisee') ROUND().coupsRecus++;
    ROUND().recus += this.stats.recus - avant;
    // signal « injuste » : le bot n'avait pas décidé de se tromper, et le coup passe quand même
    if (plan && plan.cle === cleAvant && (issue === 'encaisse' || issue === 'brisee') && !plan.erreur && P.abus === undefined) {
      const dispo = tReel - plan.t0;
      let cause = 'timing';
      if (dispo < P.reac + 0.05) cause = 'signal trop court';
      else if (etatJ.sonne) cause = 'encore sonné';
      else if (etatJ.pause) cause = 'esquive précédente pas finie';
      else if (etatJ.esqVieille) cause = 'esquive précédente encore en cours';
      else if (etatJ.action) cause = 'en train de frapper';
      else if (plan.type === 'corps' && !gardait) cause = 'garde pas levée (occupé)';
      res.injustes.push({ type, cause, dispo: +dispo.toFixed(2), round: this.round, enerve: !!g.enerve });
    }
    if (plan && plan.cle === cleAvant) plan.fini = true;
    if (!at.coups || g.coupIndex >= at.coups) g.riposteEnCours = false;
  });
  env('riposter', function (orig) { res.ripostes++; orig(); this.g.riposteEnCours = true; });
  env('coupDuJoueur', function (orig, coup) {
    const g = this.g, j = this.j, avant = this.stats.donnes;
    const contre = this.horloge < j.contreJusqua, prep = g.etat === 'prepare' && g.attaque && g.attaque.cible !== 'smash';
    const etatAvant = g.etat;
    orig();
    const d = this.stats.donnes - avant;
    ROUND().donnes += d;
    if (contre && d > 0) res.contres++;
    else if (prep && d === 0) res.pareEnArmant++;
    else if (d > 0) res.libresTouches++;
    else if (etatAvant !== 'nargue') res.libresPares++;
    if (etatAvant === 'nargue') { if (d > 0) res.secrets++; else res.nargueRate++; }
    if (this.g.etat === 'etourdi' && etatAvant !== 'etourdi') res.etourdis++;
  });
  env('narguer', function (orig) { res.nargues++; orig(); });
  env('lancerDempsey', function (orig) { res.dempsey.push({ round: this.round, coups: 0, parfaits: 0, fin: '?', degats: 0, pvGreg: this.g.vie }); orig(); });
  env('coupDempsey', function (orig, appui, parfait) {
    const D = res.dempsey[res.dempsey.length - 1]; const avant = this.stats.donnes;
    orig(); if (D) { D.coups++; if (parfait) D.parfaits++; D.degats += this.stats.donnes - avant; if (this.g.etat === 'sol') D.fin = 'tapis'; }
  });
  env('casserDempsey', function (orig, raison) { const D = res.dempsey[res.dempsey.length - 1]; if (D) D.fin = 'cassé (' + raison + ')'; orig(); });
  env('contreDempsey', function (orig) { const D = res.dempsey[res.dempsey.length - 1]; if (D) D.fin = 'contre de Greg'; orig(); });
  env('finDempsey', function (orig) { const D = res.dempsey[res.dempsey.length - 1]; if (D && D.fin === '?') D.fin = 'FINISH'; orig(); });
  env('gregAuTapis', function (orig) { res.downsDonnes++; orig(); });
  env('joueurAuTapis', function (orig) { res.downsRecus++; orig(); });
  sc.victoire = function (m) { res.fin = 'victoire'; res.message = m; return protoBoss.victoire.call(this, m); };
  sc.defaite = function (m) { res.fin = 'defaite'; res.message = m; return protoBoss.defaite.call(this, m); };
  const cleAttaque = () => sc.g.attaque ? sc.g.attaque.__id + ':' + sc.g.coupIndex : null;
  let idAtt = 0;

  // ---------- les commandes ----------
  const appuyer = (n) => { K[n]._justDown = true; };
  const libre = () => { const j = sc.j; return !j.action && !j.esquive && j.sonne <= 0 && !j.dempsey; };

  // ---------- état du bot ----------
  let libresFaits = 0, prochainCoup = 0, contrePrevu = null, narguePrevu = null, nargueVuPour = -1;
  let dernierSignal = null, roundGap = 0, enDempsey = false, demiVu = null, demiPlan = null, debutCompte = -1, dernierCote = 'd', prochainAppuiTapis = 0;
  let coin = 0;
  const finGap = (t) => { if (dernierSignal !== null) { const gap = t - dernierSignal; res.gaps.push(+gap.toFixed(2)); if (gap > res.gapsMax) res.gapsMax = gap; if (gap > 3) res.gaps3++; } };

  function decider() {
    const j = sc.j, g = sc.g;
    K.bas.isDown = false;
    if (sc.etat === 'coin') {   // dans le coin : ESPACE dès que l'écran l'accepte
      coin += DT;
      if (coin > 0.8 && sc.input.keyboard.listenerCount('keydown-SPACE') > 0) { sc.input.keyboard.emit('keydown-SPACE'); coin = 0; }
      dernierSignal = null; plan = null;
      return;
    }
    coin = 0;
    if (sc.etat === 'compte') {
      dernierSignal = null; plan = null;
      if (sc.compte && sc.compte.qui === 'joueur') {
        if (debutCompte < 0) debutCompte = tReel;
        if (tReel - debutCompte > 0.6 && tReel >= prochainAppuiTapis) {
          dernierCote = dernierCote === 'd' ? 'g' : 'd';
          appuyer(dernierCote === 'g' ? 'gauche' : 'droite');
          prochainAppuiTapis = tReel + (1 / P.tapis) * (0.8 + 0.4 * alea());
        }
      }
      return;
    }
    debutCompte = -1;
    if (sc.etat !== 'combat') return;

    // ---------- profils « abus » ----------
    if (P.abus === 'tortue') { K.bas.isDown = true; return; }
    if (P.abus === 'spam') {
      if (tReel >= prochainCoup) { appuyer(alea() < 0.5 ? 'espace' : 'z'); prochainCoup = tReel + 0.12; }
      return;
    }

    // ---------- DEMPSEY ROLL (jeu de rythme) ----------
    if (j.dempsey) {
      const d = j.dempsey;
      if (!enDempsey) { enDempsey = true; demiVu = null; demiPlan = null; }
      if (d.attente > 0) {   // « Appuie sur ▶ pour lancer le roll »
        if (!demiPlan) demiPlan = { t: tReel + P.reac + 0.3 * alea() };
        if (tReel >= demiPlan.t) { appuyer('droite'); demiPlan = null; }
        return;
      }
      if (d.demi !== demiVu) {   // nouveau côté du « ∞ » : on prévoit son appui
        demiVu = d.demi;
        const rate = alea() < P.err;
        demiPlan = { fait: d.touche, bruit: gauss() * P.rythme, rate, contreVu: d.contre, t0: tReel, mauvais: rate && alea() < 0.5 };
      }
      if (!demiPlan || demiPlan.fait || d.touche) return;
      const w = Math.PI * 2 / d.periode, reste = (d.demi * Math.PI - d.phi) / w / sc.ralenti;
      if (reste > demiPlan.bruit) return;
      demiPlan.fait = true;
      if (demiPlan.rate && !demiPlan.mauvais) return;   // il oublie d'appuyer
      const cote = d.demi % 2 === 0 ? 'droite' : 'gauche';
      if (d.contre && tReel - demiPlan.t0 >= P.reac) { appuyer('bas'); return; }   // boule rouge : FREIN (▼)
      appuyer(demiPlan.mauvais ? (cote === 'droite' ? 'gauche' : 'droite') : cote);
      return;
    }
    enDempsey = false;

    // ---------- lecture des signaux de Greg ----------
    if (g.etat === 'prepare' && g.attaque) {
      if (!g.attaque.__id) g.attaque.__id = ++idAtt;
      const cle = cleAttaque();
      if (!plan || plan.cle !== cle) {
        const at = g.attaque;
        const type = at.cible === 'tete' ? 'tete' : at.cible;
        finGap(sc.horloge);
        dernierSignal = sc.horloge;
        ROUND().signaux++;
        const nomType = at.feinte ? 'feinte' : (type === 'tete' ? (g.riposteEnCours ? 'riposte' : (at.id === 'rafale' ? 'rafale' : 'visage')) : type);
        const prepaReel = (g.prepa) / sc.ralenti;
        (res.prepas[nomType] = res.prepas[nomType] || []).push(+prepaReel.toFixed(3));
        const erreur = alea() < P.err;
        let faute = null;
        if (erreur) {
          const x = alea();
          if (type === 'tete') faute = x < P.mauvaisCote ? 'mauvaisCote' : (x < P.mauvaisCote + 0.25 ? 'tropTot' : 'rien');
          else if (type === 'corps') faute = x < 0.6 ? 'esquive' : 'rien';
          else faute = x < 0.5 ? 'garde' : 'rien';
        }
        plan = { cle, type, cote: at.cote, t0: tReel, reac: P.reac * (0.8 + 0.4 * alea()), bruit: gauss() * P.sd * (sc.diff.aides ? 1 : 1.3),
          erreur, faute, fait: false, fini: false, dernierAppui: -9 };
        libresFaits = 0; contrePrevu = null;
      }
    }
    if (plan && !plan.fini && (g.etat === 'prepare') && plan.cle === cleAttaque()) {
      const p = plan, pret = tReel - p.t0 >= p.reac;
      const reste = (g.prepa - g.t) / sc.ralenti;
      if (pret) {
        const coteBon = p.cote === 'g' ? 'droite' : (p.cote === 'd' ? 'gauche' : (alea() < 0.5 ? 'gauche' : 'droite'));
        if (p.type === 'corps' || p.faute === 'garde') {
          if (p.faute === 'esquive') { if (reste <= P.vise + p.bruit && tReel - p.dernierAppui > 0.1 && !j.esquive) { appuyer(alea() < 0.5 ? 'gauche' : 'droite'); p.dernierAppui = tReel; } }
          else if (p.faute !== 'rien') K.bas.isDown = true;
        } else if (p.faute !== 'rien') {
          const moment = p.faute === 'tropTot' ? 99 : P.vise + p.bruit;
          if (reste <= moment && !(j.esquive && j.esquive.t <= sc.diff.esquive) && tReel - p.dernierAppui > 0.1) {
            const c = p.faute === 'mauvaisCote' ? (coteBon === 'gauche' ? 'droite' : 'gauche') : coteBon;
            if (!p.fait || !j.esquive) { appuyer(c); p.dernierAppui = tReel; p.fait = true; }
          }
        }
      }
      // l'enfant (et un peu le moyen) tape parfois pendant que Greg arme : il pare
      if (!pret && P.tapePrepa && alea() < P.tapePrepa * DT && libre()) appuyer(alea() < 0.5 ? 'espace' : 'z');
      return;
    }
    // garde maintenue jusqu'à l'impact du coup au corps (l'impact arrive dans l'image où l'état passe à « frappe »)
    if (plan && !plan.fini && plan.type === 'corps' && g.etat === 'frappe') K.bas.isDown = true;

    // ---------- CONTRE juste après une esquive réussie ----------
    if (esquiveReussieA > 0 && sc.horloge < j.contreJusqua) {
      if (!contrePrevu) contrePrevu = { t: esquiveReussieA + P.reac * (0.6 + 0.4 * alea()), oui: alea() < P.contre, fait: false };
      if (contrePrevu.oui && !contrePrevu.fait && tReel >= contrePrevu.t && !j.action && j.sonne <= 0) {
        const corps = P.corpsContre ? g.garde === 'haute' || alea() < 0.5 : alea() < 0.5;
        appuyer(corps ? 'z' : 'espace'); contrePrevu.fait = true; esquiveReussieA = -1; libresFaits = 1;
        return;
      }
    } else if (sc.horloge >= j.contreJusqua) { esquiveReussieA = -1; }

    // ---------- moment secret : « hé... » ----------
    if (g.etat === 'nargue') {
      if (nargueVuPour !== g.nargueDebut) {
        nargueVuPour = g.nargueDebut;
        narguePrevu = alea() < P.secret ? { t: tReel + P.reac * (0.8 + 0.4 * alea()), coup: alea() < (P.corpsContre ? 0.97 : P.bonneZone) ? 'z' : 'espace' } : null;
        if (narguePrevu) res.nargueVu++;
      }
      if (narguePrevu && tReel >= narguePrevu.t && libre()) { appuyer(narguePrevu.coup); narguePrevu = null; }
      return;
    }

    // ---------- DEMPSEY ROLL dès que la jauge est pleine et que Greg n'attaque pas ----------
    if (j.esprit >= 100 && libre() && (g.etat === 'garde' || g.etat === 'recup' || g.etat === 'touche' || g.etat === 'essouffle' || g.etat === 'etourdi')) {
      if (alea() < 0.2) appuyer('x');   // (le temps de voir le bouton s'allumer)
      return;
    }

    // ---------- coups « libres » quand Greg ne fait rien ou est ouvert ----------
    const ouvert = g.etat === 'essouffle' || g.etat === 'etourdi';
    const calme = g.etat === 'garde' || g.etat === 'touche' || g.etat === 'recup';
    if ((ouvert || calme) && libre() && tReel >= prochainCoup && j.souffle >= P.souffleMin + 11) {
      if (!ouvert && libresFaits >= P.libres) return;
      if (!ouvert && g.etat === 'garde' && g.couvert > 0) return;   // « Il se couvre » : on attend
      const zoneOuverte = g.garde === 'haute' ? 'z' : 'espace';
      const coup = ouvert ? (alea() < 0.5 ? 'z' : 'espace') : (alea() < P.bonneZone ? zoneOuverte : (zoneOuverte === 'z' ? 'espace' : 'z'));
      appuyer(coup);
      libresFaits++;
      prochainCoup = tReel + P.intervalle * (0.85 + 0.3 * alea());
    }
  }

  // ---------- la boucle : une image = 1/60 s ----------
  let roundAvant = sc.round, horlogeAvant = 0;
  while (!sc.termine && tReel < limite) {
    try { decider(); } catch (e) { res.erreursInternes.push(String(e && e.message)); if (res.erreursInternes.length > 5) break; }
    now += DT * 1000; tReel += DT;
    sc.sys.step(now, DT * 1000);
    if (sc.round !== roundAvant) { roundAvant = sc.round; dernierSignal = null; }
    if (sc.etat !== 'combat' || (sc.j && sc.j.dempsey)) dernierSignal = dernierSignal === null ? null : sc.horloge;   // les pauses (tapis, Dempsey) ne comptent pas
    if (sc.g.etat === 'essouffle' && horlogeAvant !== 'essouffle') res.essoufflements++;
    horlogeAvant = sc.g.etat;
  }
  res.round = sc.round; res.tReel = +tReel.toFixed(1); res.tempsTotal = +sc.tempsTotal.toFixed(1);
  res.pvPerdus = Math.round(sc.stats.recus); res.pvDonnes = Math.round(sc.stats.donnes);
  res.enerve = !!sc.g.enerve;
  const m = /RANG (\w)/.exec(res.message || ''); res.rang = m ? m[1] : null;
  res.ko = /K\.O\./.test(res.message || '');
  res.points = /points/.test(res.message || '');
  res.vieFin = Math.round(sc.j.vie); res.vieGregFin = Math.round(sc.g.vie);
  res.secretFait = !!sc.secretFait;
  if (!res.fin) res.fin = 'pas fini';
  return res;
}

// ======================================================= le pilote
const navigateur = await chromium.launch();
const contexte = await navigateur.newContext({ viewport: { width: 960, height: 540 } });
const page = await contexte.newPage();
const erreurs = [];
page.on('pageerror', (e) => erreurs.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') erreurs.push('console : ' + m.text()); });
await page.goto(`http://localhost:${port}/index.html`); await page.waitForTimeout(2500);
const t0 = Date.now();
const resultats = [];
const VARIANTE = process.env.VARIANTE ? JSON.parse(process.env.VARIANTE) : null;
const DIFF_OBJ = await page.evaluate(async (V) => {
  const M = await import('/src/bosses/greg/reglages.js');
  const fusion = (cible, src) => { for (const [k, v] of Object.entries(src)) { if (v && typeof v === 'object' && !Array.isArray(v) && cible[k]) fusion(cible[k], v); else cible[k] = v; } };
  if (V) { const { DIFFICULTES, ...reste } = V; fusion(M.REGLAGES, reste); if (DIFFICULTES) fusion(M.DIFFICULTES, DIFFICULTES); }
  return M.DIFFICULTES;
}, VARIANTE);
if (VARIANTE) console.log('VARIANTE :', JSON.stringify(VARIANTE));

async function demarrer(nomDiff, graine, parRejouer) {
  await page.evaluate(async ({ nomDiff, graine, diffObjet, parRejouer }) => {
    let s = graine; Math.random = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const j = window.jeu; j.loop.wake();
    const sc = j.scene.getScene('GregCombat');
    window.__jAvant = sc && sc.j;
    if (parRejouer) { sc.input.keyboard.emit('keydown-SPACE'); return; }   // le vrai bouton REJOUER de l'écran PERDU
    const { Sauvegarde } = await import('/src/core/sauvegarde.js');
    Sauvegarde.reglerDifficulte('greg', nomDiff);
    j.scene.getScenes(true).forEach((x) => j.scene.stop(x.scene.key));
    // comme une nouvelle visite, sans l'écran des commandes ni la présentation ni le choix (déjà testés à la main)
    j.scene.start('GregCombat', { rejouer: true, nomDiff, diffObjet });
  }, { nomDiff, graine, diffObjet: DIFF_OBJ[nomDiff], parRejouer });
  await page.waitForFunction(() => { const s = window.jeu.scene.getScene('GregCombat'); return s && s.j && s.j !== window.__jAvant && s.etat === 'coin' && !s.termine && s.input.keyboard.listenerCount('keydown-SPACE') > 0; }, null, { timeout: 30000 });
  await page.evaluate(() => window.jeu.loop.sleep());
}

for (const diff of DIFFS) for (const nomP of NOMS_P) {
  let derniere = null;
  for (let k = 0; k < PARTIES; k++) {
    const graine = 1000 + k * 7919 + NOMS_P.indexOf(nomP) * 31 + DIFFS.indexOf(diff) * 101;
    const parRejouer = !!(derniere && derniere.fin === 'defaite');
    if (parRejouer) {   // l'écran PERDU accepte ESPACE après 0,7 s : on laisse le temps passer
      await page.evaluate(() => { const sc = window.jeu.scene.getScene('GregCombat'); let n = sc.time.now; for (let i = 0; i < 60; i++) { n += 1000 / 60; sc.sys.step(n, 1000 / 60); } });
    }
    const nbErr = erreurs.length, debut = Date.now();
    await demarrer(diff, graine, parRejouer);
    const r = await page.evaluate(jouer, { P: PROFILS[nomP], nomDiff: diff, graine: graine + 17, limite: 600 });
    Object.assign(r, { diff, profil: nomP, k, viaRejouer: parRejouer, mur: ((Date.now() - debut) / 1000).toFixed(1), erreursJS: erreurs.slice(nbErr) });
    resultats.push(r); derniere = r;
    const issue = r.fin === 'victoire' ? `GAGNÉ ${r.ko ? 'K.O.' : 'aux points'} round ${r.round} rang ${r.rang}` : r.fin === 'defaite' ? `PERDU ${r.ko ? 'K.O.' : (r.points ? 'aux points' : '')} round ${r.round}` : 'PAS FINI';
    const D = r.dempsey.map((d) => `${d.coups}c/${d.fin}`).join(' ');
    console.log(`${diff.padEnd(12)} ${nomP.padEnd(7)} #${k + 1}${parRejouer ? 'R' : ' '} ${issue.padEnd(34)} ${String(r.tempsTotal).padStart(5)} s  tapis ${r.downsDonnes}/${r.downsRecus}  PV perdus ${r.pvPerdus}  contres ${r.contres}  secret ${r.secrets}/${r.nargues}  Dempsey [${D}]  injustes ${r.injustes.length}${r.rejouerOk ? '' : ' REJOUER: ' + r.rejouerProblemes.join(', ')}${r.erreursJS.length ? ' ERREURS JS : ' + r.erreursJS.join(' / ') : ''}${r.erreursInternes.length ? ' BOT: ' + r.erreursInternes.join('/') : ''}`);
  }
}

// ======================================================= synthèse
const moy = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
console.log(`\n=== SYNTHÈSE (${((Date.now() - t0) / 1000).toFixed(0)} s) ===`);
console.log('case : victoires/parties (K.O.), rangs, temps de combat moyen, tapis donnés/reçus moyens, PV perdus moyens');
for (const diff of DIFFS) {
  const cases = NOMS_P.map((p) => {
    const L = resultats.filter((r) => r.diff === diff && r.profil === p);
    const v = L.filter((r) => r.fin === 'victoire');
    return `${p}: ${v.length}/${L.length} (${v.filter((r) => r.ko).length} KO) ${v.map((r) => r.rang).join('') || '-'} ${moy(L.map((r) => r.tempsTotal)).toFixed(0)}s ${moy(L.map((r) => r.downsDonnes)).toFixed(1)}/${moy(L.map((r) => r.downsRecus)).toFixed(1)} ${moy(L.map((r) => r.pvPerdus)).toFixed(0)}PV`;
  });
  console.log(diff.toUpperCase().padEnd(13) + cases.join(' | '));
}
console.log('\nSignaux par type (tous profils sauf abus) : esquive / garde / garde brisée / encaissé');
for (const diff of DIFFS) {
  const tot = {};
  for (const r of resultats.filter((x) => x.diff === diff && !PROFILS[x.profil].abus)) for (const [t, o] of Object.entries(r.signaux)) {
    tot[t] = tot[t] || { esquive: 0, garde: 0, brisee: 0, encaisse: 0, feinte: 0 }; for (const k in o) tot[t][k] += o[k];
  }
  console.log(diff.padEnd(13) + Object.entries(tot).map(([t, o]) => `${t} ${o.esquive}/${o.garde}/${o.brisee}/${o.encaisse}${o.feinte ? ' (' + o.feinte + ')' : ''}`).join('  '));
}
console.log('\nTemps de préparation vu par le joueur (s) : min / moyenne, par type');
for (const diff of DIFFS) {
  const P = {};
  for (const r of resultats.filter((x) => x.diff === diff)) for (const [t, l] of Object.entries(r.prepas)) (P[t] = P[t] || []).push(...l);
  console.log(diff.padEnd(13) + Object.entries(P).map(([t, l]) => `${t} ${Math.min(...l).toFixed(2)}/${moy(l).toFixed(2)}`).join('  '));
}
console.log('\nCoups « injustes » (bot sans erreur volontaire, touché quand même) : causes');
for (const diff of DIFFS) for (const p of NOMS_P.filter((x) => !PROFILS[x].abus)) {
  const L = resultats.filter((r) => r.diff === diff && r.profil === p).flatMap((r) => r.injustes);
  const c = {}; for (const i of L) { const k = `${i.type}/${i.cause}`; c[k] = (c[k] || 0) + 1; }
  console.log(`${diff.padEnd(13)}${p.padEnd(8)} ${L.length} : ` + Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', '));
}
console.log('\nPar round (profils expert/moyen/enfant) : PV perdus moyens, coups encaissés, dégâts donnés');
for (const diff of DIFFS) {
  const L = resultats.filter((r) => r.diff === diff && !PROFILS[r.profil].abus);
  console.log(diff.padEnd(13) + [0, 1, 2].map((i) => { const R = L.filter((r) => r.round > i || i === 0).map((r) => r.rounds[i]); return `R${i + 1}: ${moy(R.map((x) => x.recus)).toFixed(0)} PV, ${moy(R.map((x) => x.coupsRecus)).toFixed(1)} coups, ${moy(R.map((x) => x.donnes)).toFixed(0)} donnés (${R.length})`; }).join(' | '));
}
console.log('\nDempsey Roll, moment secret, temps morts');
for (const diff of DIFFS) for (const p of NOMS_P.filter((x) => !PROFILS[x].abus)) {
  const L = resultats.filter((r) => r.diff === diff && r.profil === p), D = L.flatMap((r) => r.dempsey);
  const fins = {}; D.forEach((d) => { const k = d.fin.split(' (')[0]; fins[k] = (fins[k] || 0) + 1; });
  console.log(`${diff.padEnd(13)}${p.padEnd(8)} Dempsey ${D.length} (${Object.entries(fins).map(([k, v]) => k + ' ' + v).join(', ')}, ${moy(D.map((d) => d.coups)).toFixed(1)} coups, ${moy(D.map((d) => d.degats)).toFixed(0)} dégâts)  secret ${L.reduce((a, r) => a + r.secrets, 0)}/${L.reduce((a, r) => a + r.nargues, 0)} (vu ${L.reduce((a, r) => a + r.nargueVu, 0)})  contres ${moy(L.map((r) => r.contres)).toFixed(1)}  étourdi ${moy(L.map((r) => r.etourdis)).toFixed(1)}  essoufflé ${moy(L.map((r) => r.essoufflements)).toFixed(1)}  temps mort max ${Math.max(...L.map((r) => r.gapsMax)).toFixed(1)} s (>3 s : ${L.reduce((a, r) => a + r.gaps3, 0)})`);
}
const rej = resultats.filter((r) => r.viaRejouer);
console.log(`\nREJOUER : ${rej.length} parties lancées par le bouton, ${rej.filter((r) => r.rejouerOk).length} repartent à zéro.` + [...new Set(resultats.flatMap((r) => r.rejouerProblemes))].map((x) => ' ' + x).join(';'));
console.log(`Erreurs JavaScript : ${erreurs.length ? [...new Set(erreurs)].join(' / ') : 'aucune'}`);
if (process.env.JSON) await writeFile(process.env.JSON, JSON.stringify(resultats, null, 1));
await navigateur.close(); serveur.close();
