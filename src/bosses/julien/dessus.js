// Boss Julien — la RAFALE DE MURS DE COPIES en VUE DU DESSUS (shoot them up vertical 2D dans la vue 480 × 222).
// Sorti de JulienClasse.js (audit final : la classe faisait le boss 3D ET le shoot them up). Ces méthodes sont
// ajoutées à JulienClasse (Object.assign(JulienClasse.prototype, VueDessus)) : `this` est la scène de la classe.
// Julien va-et-vient en haut, les murs de copies DESCENDENT (un trou chacun, qui zigzague), tu bouges en bas et tu
// tires vers le haut ; à la fin, la note (20/20 sans être touché, sinon 0/20), puis retour en 3D, Julien DE DOS.
// Réglages : RG.julien.dessus (pixels de la vue), RG.julien.murs (nombre et cadence des murs), RG.julien.mur (dégâts).
import { jouerSon } from '../../core/ressources.js';
import { REGLAGES as RG } from './reglages.js';

const L = 480, VUE_H = 222;   // comme JulienManif
// vue du dessus (section 18 des prompts) ; image absente = dessin fait par le code
// tables d'élèves sur les bords de la vue du dessus : x, y (le bas de l'image), élève ('a' / 'b') ou table seule
const TABLES_DESSUS = [[34, 100, 'a'], [34, 160, 'cahier'], [34, 218, 'vide'], [446, 100, 'b'], [446, 160, 'sac'], [446, 218, 'a']];
export const DESSUS_IMAGES = ['dessus_salle', 'dessus_julien_marche0', 'dessus_julien_marche1', 'dessus_julien_lance', 'dessus_julien_touche',
  'dessus_heros', 'dessus_heros_touche', 'dessus_copie_0', 'dessus_copie_1', 'dessus_copie_2', 'dessus_boulette',
  'dessus_julien_marche2', 'dessus_julien_marche3', 'dessus_julien_rage', 'dessus_julien_pointe',   // (18e) animations en plus
  'dessus_heros_souffle', 'dessus_heros_victoire',
  'dessus_table_a_content', 'dessus_table_a_cache', 'dessus_table_b_content', 'dessus_table_b_cache',   // (18d) tables
  'dessus_table_vide', 'dessus_table_cahier', 'dessus_table_sac',
  'dessus_explosion', 'dessus_etoile', 'dessus_poussiere', 'dessus_feuilles', 'dessus_note0', 'dessus_note20'];   // (18f) effets

export const VueDessus = {
  // ------------------------------------------------------------------ VUE DU DESSUS (rafale de murs de copies)
  // L'écran bascule en shoot them up vertical (2D, dans la vue 480 × 222) : Julien en haut fait des allers-retours,
  // les murs de copies DESCENDENT (un trou chacun, qui zigzague d'un mur à l'autre), tu te déplaces en bas et tu tires
  // vers le haut. Réglages : RG.julien.dessus (px, px/s), RG.julien.murs (nombre et cadence des murs), RG.julien.mur.
  entrerDessus(e) {
    const D = RG.julien.dessus;
    this.livres = []; this.tirs = [];   // une boulette 3D encore en vol ne touche plus Julien pendant la rafale
    this.dessus = { prochain: D.attente, restants: RG.julien.murs.nombre[e.phase - 1] + (e.motif === 'murs' ? 1 : 0),
      murs: [], tirs: [], px: L / 2, py: VUE_H - 26, prof: L / 2, profV: 1, invT: 0, trou: null, sens: Math.random() < 0.5 ? -1 : 1,
      recharge: 0, lanceT: 0, flash: 0, parts: [], fx: [], entree: 0.45, fin: null, rouge: 0, poussiere: 0, touches: 0, souffleT: 0, rageT: 0, murN: 0 };
    e.etat = 'interro';
    this.txtAnnonce.setText('INTERRO : ESQUIVE LES COPIES !'); this.annonceT = 2.5;
    this.txtConseil.setText(!this.vus.has('dessus') ? 'Vue du dessus : passe dans les TROUS (gauche / droite) et tire vers le haut sur Julien !' : '');
    this.vus.add('dessus');
    jouerSon(this, 'julien_papier', { rate: 0.8 });
  },

  // commandes en vue du dessus : gauche / droite (pas de côté OU tourner), haut / bas (avancer / reculer), tirer
  commandesDessus() {
    const k = this.touches, m = this.cmd;
    let x = 0, y = 0, tir;
    if (this.tactile) {
      if (k.gauche.isDown || k.z.isDown) x -= 1;
      if (k.droite.isDown || k.espace.isDown) x += 1;
      if (k.haut.isDown) y -= 1;
      if (k.bas.isDown) y += 1;
      if (this.joy) { const v = this.joy.valeur(); x += v.x; y -= v.y; }
      tir = k.x.isDown;
    } else {
      x = (m.bas('coteG') || m.bas('tourneG') ? -1 : 0) + (m.bas('coteD') || m.bas('tourneD') ? 1 : 0);
      y = (m.bas('avancer') ? -1 : 0) + (m.bas('reculer') ? 1 : 0);
      tir = m.bas('tirer') || this.clic;
    }
    return { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)), tir };
  },

  // petites particules de la vue du dessus : 'feuille' (copie qui vole en tournant), 'bout' (papier), 'poussiere'
  particules(M, x, y, n, genre, force = 60) {
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, v = force * (0.4 + Math.random() * 0.8);
      M.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, vie: genre === 'poussiere' ? 0.35 : 0.5 + Math.random() * 0.4,
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12, genre });
    }
  },

  // un effet en image (explosion, étoile, feuilles…) qui grossit un peu puis s'efface
  effet(M, nom, x, y, taille, vie = 0.35) { M.fx.push({ nom, x, y, taille, vie, t: 0 }); },

  majDessus(dt) {
    const M = this.dessus, D = RG.julien.dessus, J = RG.julien, e = this.julien, j = this.j;
    const X0 = this.T.spr.dessus_table_vide ? 56 : 12, X1 = L - X0;   // (avec les tables sur les bords : zone plus étroite)
    M.entree -= dt; M.rouge = Math.max(0, M.rouge - dt * 2);
    for (const p of M.parts) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94; p.rot += p.vr * dt; }
    M.parts = M.parts.filter(p => p.t < p.vie);
    for (const f of M.fx) f.t += dt;
    M.fx = M.fx.filter(f => f.t < f.vie);
    M.souffleT -= dt; M.rageT -= dt;
    if (M.fin != null) { M.fin -= dt; if (M.fin <= 0) this.sortirDessus(true); return; }   // la note, puis le flash de sortie
    const c = this.commandesDessus();
    const ax = M.px, ay = M.py;
    M.px = Math.max(X0 + 8, Math.min(X1 - 8, M.px + c.x * D.vitesse * dt)); M.dir = c.x;
    M.py = Math.max(VUE_H - 90, Math.min(VUE_H - 12, M.py + c.y * D.vitesse * dt));
    M.bouge = Math.hypot(M.px - ax, M.py - ay) > 0.5;
    if (Math.hypot(M.px - ax, M.py - ay) > 1 && (M.poussiere -= dt) <= 0) { this.particules(M, M.px, M.py + 14, 1, 'poussiere', 15); M.poussiere = 0.08; }
    M.invT -= dt; M.lanceT -= dt; M.flash -= dt;
    // Julien fait des allers-retours en haut
    M.prof += M.profV * D.vitesseProf * dt;
    if (M.prof < X0 + 30 || M.prof > X1 - 30) M.profV = -M.profV;
    // un nouveau mur : le trou près de toi au 1er, puis il zigzague (rebondit sur les bords, change parfois de sens)
    M.prochain -= dt;
    if (M.restants > 0 && M.prochain <= 0) {
      const [d0, d1] = D.derive;
      // trous : jamais sous les boutons du téléphone (joystick en bas à gauche, LANCER / ARME à droite)
      const g0 = (this.tactile ? 85 : X0) + D.trou / 2, g1 = (this.tactile ? 365 : X1) - D.trou / 2;
      if (M.trou == null) M.trou = M.px + (Math.random() - 0.5) * 120;
      else {
        M.trou += M.sens * (d0 + Math.random() * (d1 - d0));
        if (M.trou < g0 || M.trou > g1) { M.sens = -M.sens; M.trou += 2 * M.sens * (d0 + Math.random() * (d1 - d0)); }
        if (Math.random() < 0.3) M.sens = -M.sens;
      }
      M.trou = Math.max(g0, Math.min(g1, M.trou));
      M.murs.push({ y: 40, trou: M.trou, touche: false, x0: M.prof, ouv: 0 }); M.murN++;   // il se déploie depuis les mains de Julien
      M.restants--; M.prochain = J.murs.intervalle[e.phase - 1]; M.lanceT = 0.3;
      this.particules(M, M.prof, 40, 5, 'feuille', 70);
      jouerSon(this, 'julien_papier', { rate: 1.3, volume: 0.7 });
    }
    for (const w of M.murs) {
      w.y += D.vitesseMur * dt; w.ouv = Math.min(1, w.ouv + dt / 0.3);
      if (!w.touche && j.vie > 0 && M.invT <= 0 && Math.abs(w.y - M.py) < 11 && Math.abs(M.px - w.trou) > D.trou / 2 - 6) {
        w.touche = true; M.invT = 0.6; M.rouge = 0.5; M.touches++;
        this.effet(M, 'dessus_feuilles', M.px, M.py - 6, 34, 0.5);
        this.degats(J.mur.degats, e.x, e.y);
        this.cameras.main.shake(140, 0.006);
        this.particules(M, M.px, M.py, 8, 'feuille', 90);
        this.parlerEleves('aie');
      }
    }
    M.murs = M.murs.filter(w => w.y < VUE_H + 12);
    // tes boulettes, vers le haut (sauf sarbacane confisquée)
    M.recharge -= dt;
    if (c.tir && M.recharge <= 0 && !this.confisque) {
      M.tirs.push({ x: M.px + 4, y: M.py - 16 }); M.recharge = RG.sarbacane.cadence; M.souffleT = 0.14;
      this.particules(M, M.px + 4, M.py - 18, 2, 'poussiere', 25);
      jouerSon(this, 'julien_lancer', { rate: 1.6 });
    }
    for (const b of M.tirs) {
      b.y -= D.vitesseTir * dt;
      if (!b.fini && b.y < 50 && b.y > 8 && Math.abs(b.x - M.prof) < 17) {
        b.fini = true; M.flash = 0.15; M.rageT = 0.7;
        this.particules(M, b.x, b.y, 7, 'bout', 80);
        this.effet(M, 'dessus_explosion', b.x, b.y, 28, 0.3); this.effet(M, 'dessus_etoile', M.prof + 10, 14, 18, 0.35);
        this.toucherEnnemi(e, RG.sarbacane.degats, { genre: 'boulette' });
        if (e.etat !== 'interro') { this.sortirDessus(false); return; }   // changement de phase ou vaincu : on revient en 3D
      }
    }
    M.tirs = M.tirs.filter(b => !b.fini && b.y > 0);
    if (M.restants === 0 && M.murs.length === 0) {   // fini : la NOTE (20/20 sans être touché, sinon 0/20), puis retour en 3D
      M.fin = RG.julien.dessus.note + 0.35;
      if (M.touches === 0) { jouerSon(this, 'julien_ramasse', { rate: 1.2 }); this.parlerEleves('touche'); }
      else jouerSon(this, 'julien_plonk', { rate: 0.6 });
    }
  },

  sortirDessus(punir) {
    this.dessus = null;
    if (punir && this.julien.etat === 'interro') this.finAttaque(this.julien, 'mur');   // ouf ! il se retourne : punis-le
  },

  dessinerDessus(g) {
    const M = this.dessus, D = RG.julien.dessus, s = this.T.spr, t = this.time.now / 1000;
    const ombre = (x, y, rx, ry, a = 0.28) => { g.fillStyle = `rgba(10,15,30,${a})`; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
    // la salle vue du dessus (vraie image, sinon : lino en damier, estrade en parquet, le tableau tout en haut)
    if (s.dessus_salle) g.drawImage(s.dessus_salle, 0, 0, L, VUE_H);
    else {
      g.fillStyle = '#7d8590'; g.fillRect(0, 0, L, VUE_H);
      g.fillStyle = '#737a85';
      for (let y = 56; y < VUE_H; y += 24) for (let x = ((y / 24) | 0) % 2 ? 0 : 24; x < L; x += 48) g.fillRect(x, y, 24, 24);
      g.fillStyle = '#8a5f38'; g.fillRect(0, 0, L, 56); g.fillStyle = '#5c3e22'; for (let y = 8; y < 56; y += 8) g.fillRect(0, y, L, 1);
      g.fillStyle = '#2f4a32'; g.fillRect(140, 0, 200, 7); g.fillStyle = '#4b3a2a'; g.fillRect(0, 0, 12, VUE_H); g.fillRect(L - 12, 0, 12, VUE_H);
    }
    // poussière au sol (sous tout le reste)
    for (const p of M.parts) if (p.genre === 'poussiere') {
      const a = 0.6 * (1 - p.t / p.vie);
      if (s.dessus_poussiere) { g.globalAlpha = a; g.drawImage(s.dessus_poussiere, p.x - 4, p.y - 5, 8, 9); g.globalAlpha = 1; }
      else { g.fillStyle = `rgba(220,225,235,${a})`; g.fillRect(p.x - 1.5, p.y - 1.5, 3, 3); }
    }
    // Julien (vue du dessus si livrée, sinon ses poses de face), avec son ombre ; blanc un instant quand il est touché
    const p = s.dessus_julien_marche0 ? 'dessus_julien_' : 'julien_';
    const marche = s.dessus_julien_marche2 ? ['dessus_julien_marche2', 'dessus_julien_marche3'] : [p + 'marche0', p + 'marche1'];
    const pj = M.flash > 0 ? s[p + 'touche']
      : M.lanceT > 0 ? (M.murN % 2 && s.dessus_julien_pointe ? s.dessus_julien_pointe : s[p + 'lance'])   // il lance, ou il pointe du doigt
      : (M.rageT > 0 || this.julien.phase === 3) && s.dessus_julien_rage && ((t * 3) | 0) % 2 ? s.dessus_julien_rage   // touché / phase 3 : RAGE
      : s[marche[((t * 4) | 0) % 2]];
    ombre(M.prof, 50, 13, 4);
    if (pj) { const h = 46, w = h * pj.width / pj.height; g.drawImage(pj, M.prof - w / 2, 6 - (M.lanceT > 0 ? 2 : 0), w, h); }
    if (M.flash > 0) { g.fillStyle = `rgba(255,255,255,${M.flash * 3})`; g.beginPath(); g.arc(M.prof, 26, 18 + (0.15 - M.flash) * 60, 0, Math.PI * 2); g.fill(); }
    // les tables d'élèves sur les bords : l'élève se CACHE quand un mur de copies passe à sa hauteur,
    // et lève les bras quand Julien est touché (ou au 20/20)
    if (s.dessus_table_vide) for (const [x, y, q] of TABLES_DESSUS) {
      let n = 'dessus_table_' + q;
      if (q === 'a' || q === 'b') {
        const peur = M.murs.some(w => Math.abs(w.y - (y - 18)) < 30);
        const joie = M.rageT > 0 || (M.fin != null && M.touches === 0);
        n += peur || !joie ? '_cache' : '_content';
        if (!peur && !joie && ((t * 0.7 + x) | 0) % 3 === 0) n = 'dessus_table_' + q + '_content';   // de temps en temps, ils osent regarder
      }
      const i = s[n]; if (!i) continue;
      const h = 44, w = h * i.width / i.height;
      ombre(x, y - 2, w * 0.4, 3, 0.2);
      g.drawImage(i, x - w / 2, y - h, w, h);
    }
    // les murs de copies : ombres d'abord, puis les copies ; le mur se déploie depuis les mains de Julien
    for (const w of M.murs) {
      const portee = w.ouv * L;
      for (let pass = 0; pass < 2; pass++) for (let x = 12; x < L - 12; x += 15) {
        if (Math.abs(x + 6 - w.trou) <= D.trou / 2 || Math.abs(x + 6 - w.x0) > portee) continue;
        const y = w.y - 8 + Math.sin(x * 0.7 + t * 6) * 1.5;
        if (pass === 0) { g.fillStyle = 'rgba(10,15,30,0.25)'; g.fillRect(x + 2, y + 4, 12, 15); continue; }
        const cp = s['dessus_copie_' + ((x * 7 + (w.trou | 0)) % 5 === 0 ? 1 + ((x / 15) & 1) : 0)];   // surtout des copies droites
        if (cp) { const h = 16, lw = h * cp.width / cp.height; g.drawImage(cp, x + 6 - lw / 2, y, lw, h); continue; }
        g.fillStyle = '#2a2a2a'; g.fillRect(x - 1, y - 1, 14, 18);
        g.fillStyle = '#f6f3ea'; g.fillRect(x, y, 12, 16);
        g.fillStyle = '#9fb6d8'; for (let l = 4; l < 16; l += 3) g.fillRect(x + 1, y + l, 10, 1);
        g.fillStyle = '#d84a4a'; g.fillRect(x + 3, y, 1, 16);
      }
    }
    // tes boulettes, avec une petite traînée
    for (const b of M.tirs) {
      g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(b.x - 1, b.y + 4, 2, 6);
      if (s.dessus_boulette) g.drawImage(s.dessus_boulette, b.x - 3, b.y - 3, 6, 6); else { g.fillStyle = '#ffffff'; g.fillRect(b.x - 2, b.y - 2, 4, 4); }
    }
    // toi (vu du dessus, de dos), avec ton ombre ; tu clignotes après un coup
    ombre(M.px, M.py + 17, 10, 3.5);
    const victoire = M.fin != null && M.touches === 0 && s.dessus_heros_victoire;
    const ph = victoire ? s.dessus_heros_victoire : M.invT > 0.3 ? s.dessus_heros_touche : M.souffleT > 0 && s.dessus_heros_souffle ? s.dessus_heros_souffle
      : s.dessus_heros;   // (les poses « de côté » et « marche » le faisaient marcher en diagonale : retirées, demande de Fabien)
    if (ph && (M.invT <= 0 || ((t * 16) | 0) % 2)) {
      const h = 40, w = h * ph.width / ph.height, rebond = M.bouge ? Math.abs(Math.sin(t * 14)) * 1.5 : 0;
      g.save();
      g.drawImage(ph, M.px - w / 2, M.py - h / 2 - rebond, w, h); g.restore();
    } else if (!ph && (M.invT <= 0 || ((t * 16) | 0) % 2)) {
      g.fillStyle = '#1e2a5a'; g.beginPath(); g.ellipse(M.px, M.py + 2, 9, 7, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#5a3a1a'; g.beginPath(); g.arc(M.px, M.py - 2, 5, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#e8b48a'; g.fillRect(M.px + 6, M.py - 6, 3, 3);
      g.fillStyle = '#c9d6ea'; g.fillRect(M.px + 7, M.py - 14, 1, 9);
    }
    // feuilles et bouts de papier qui volent
    for (const q of M.parts) {
      const a = 1 - q.t / q.vie;
      if (q.genre === 'bout') { g.fillStyle = `rgba(255,255,255,${a})`; g.fillRect(q.x - 1.5, q.y - 1.5, 3, 3); }
      else if (q.genre === 'feuille') {
        g.save(); g.globalAlpha = a; g.translate(q.x, q.y); g.rotate(q.rot);
        if (s.dessus_copie_0) g.drawImage(s.dessus_copie_0, -4, -5, 8, 10); else { g.fillStyle = '#f6f3ea'; g.fillRect(-4, -5, 8, 10); }
        g.restore();
      }
    }
    for (const f of M.fx) {   // effets en image
      const i = s[f.nom]; if (!i) continue;
      const k = f.t / f.vie, h = f.taille * (0.7 + 0.5 * k), w = h * i.width / i.height;
      g.globalAlpha = 1 - k * k; g.drawImage(i, f.x - w / 2, f.y - h / 2, w, h); g.globalAlpha = 1;
    }
    // vignette (bords plus sombres), coup reçu (rouge), entrée (fondu depuis le noir), sortie (flash blanc)
    if (!this.T.vignette) {
      const v = document.createElement('canvas'); v.width = L; v.height = VUE_H;
      const gv = v.getContext('2d'), gr = gv.createRadialGradient(L / 2, VUE_H / 2, VUE_H * 0.45, L / 2, VUE_H / 2, L * 0.62);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.45)'); gv.fillStyle = gr; gv.fillRect(0, 0, L, VUE_H);
      this.T.vignette = v;
    }
    g.drawImage(this.T.vignette, 0, 0);
    if (M.rouge > 0) { g.fillStyle = `rgba(220,30,20,${M.rouge * 0.4})`; g.fillRect(0, 0, L, VUE_H); }
    if (M.entree > 0) { g.fillStyle = `rgba(0,0,0,${Math.min(1, M.entree / 0.45)})`; g.fillRect(0, 0, L, VUE_H); }
    if (M.fin != null) {   // la NOTE de la rafale, tamponnée au milieu, puis le flash blanc
      const n = M.touches === 0 ? s.dessus_note20 : s.dessus_note0, dn = RG.julien.dessus.note, ecoule = dn + 0.35 - M.fin;
      if (n) { const k = Math.min(1, ecoule / 0.15), h = 70 * (1.6 - 0.6 * k), w = h * n.width / n.height;
        g.globalAlpha = k; g.drawImage(n, L / 2 - w / 2, VUE_H / 2 - h / 2 - 10, w, h); g.globalAlpha = 1; }
      if (M.fin < 0.35) { g.fillStyle = `rgba(255,255,255,${1 - Math.max(0, M.fin) / 0.35})`; g.fillRect(0, 0, L, VUE_H); }
    }
  },

};
