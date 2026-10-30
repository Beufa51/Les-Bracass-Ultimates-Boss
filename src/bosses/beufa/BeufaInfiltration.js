// =====================================================================
// BEUFA : infiltration de nuit dans sa base militaire, vue du dessus (façon Metal Gear).
// UNE PIÈCE À L'ÉCRAN, UNE À LA FOIS (conseil de designer stealth — Mark of the
// Ninja : un espace de rencontre = UN écran ; au-delà le joueur se perd). Passer
// une PORTE fait un fondu vers la pièce suivante, et se faire prendre renvoie à
// L'ENTRÉE DE LA PIÈCE : un checkpoint par rencontre, jamais tout à refaire.
//
// LA BASE, PENSÉE COMME UNE VRAIE BASE : la cour d'entrée a une ROUTE du portail
// à la porte du QG (éclairée par LE projecteur du mur nord), une cour de stockage
// à l'ouest, un motor pool à l'est, un poste de contrôle en sacs de sable ; la
// salle du QG est un poste de commandement : rayonnages contre les murs, TABLE À
// CARTES au centre — les deux projecteurs latéraux SE REJOIGNENT juste au-dessus.
// Les gardes ne sont pas posés au hasard : CHACUN SURVEILLE quelque chose.
//
// Le cône d'un garde ou le halo d'un projecteur te voit : la jauge « ? » monte ;
// pleine = « ! » + POURSUITE. Touché = RENVOYÉ à l'entrée de la pièce.
// Z = sprint (rapide mais BRUYANT), X = lancer une PIERRE : les gardes iront voir ailleurs.
// Toute la logique avance dans update() (pas de minuteries Phaser). (La phase 2 —
// le QUIZ de Beufa — arrive ensuite.)
// =====================================================================
import { BossScene } from '../../core/BossScene.js';
import { creerTouches, vientDAppuyer } from '../../core/clavier.js';
import { texte } from '../../core/ui.js';
import { LARGEUR, HAUTEUR } from '../../core/reglages.js';
import { jouerSon } from '../../core/ressources.js';
import { estTactile, etiquettesTactiles } from '../../core/tactile.js';
import { formatTemps } from '../../core/sauvegarde.js';
import { IDENTITE, REGLAGES as R, PIECES } from './reglages.js';
import { manifesteDe } from '../../core/manifestes.js';
import { jouerMusique } from '../../core/musique.js';

const normAngle = (a) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
const styleAlerte = { fontFamily: 'monospace', fontStyle: 'bold', fontSize: '26px', color: '#ffd84a', stroke: '#000000', strokeThickness: 5 };

export class BeufaInfiltration extends BossScene {
  constructor() { super('BeufaInfiltration', IDENTITE); }

  create() {
    this.phase = 'intro';   // intro | cinema | jeu | transition | attrape | fin
    this.touches = creerTouches(this);
    etiquettesTactiles({ haut: '▲', bas: '▼', gauche: '◀', droite: '▶', espace: 'OK', z: 'Sprint', x: 'Pierre' });   // Espace valide l'intro (bouton OK sur téléphone)
    this.cameras.main.setBackgroundColor('#0a0e15');
    this.programme = [];   // la file des « dans X secondes, fais ça » (décomptée dans update)

    // LES IMAGES DE FABIEN arrivent GRANDES et sur FOND BLANC : on les prépare une fois
    // (fond retiré, recadrées, mises à la TAILLE DU JEU) avant de dessiner quoi que ce soit.
    this.preparerImages();
    // la MUSIQUE d'infiltration (assets/audio/beufa/beufa_musique.mp3), en boucle
    jouerMusique(this, 'beufa_musique');

    // le sol de la base (nuit) — le même carreau pave tout, sans couture ;
    // sa TEINTE change avec la pièce (cour extérieure / salle du QG)
    this.sol = this.add.tileSprite(0, 0, LARGEUR, HAUTEUR, 'beufa_sol', 0).setOrigin(0);

    // LA PIÈCE COURANTE : on ne charge QUE elle (murs, route, conteneurs, gardes,
    // projecteurs…). Passer une porte détruit tout et charge la pièce suivante.
    this.piece = 0;
    this.decor = [];      // tout ce qui disparaît au changement de pièce
    this.obstacles = [];  // ce qui bloque le passage ET la vue
    this.gardes = []; this.projecteurs = [];

    // le héros (placé par chargerPiece, à l'entrée de la pièce)
    this.joueur = { x: 0, y: 0, angle: -Math.PI / 2 };
    this.sprJoueur = this.add.sprite(0, 0, 'beufa_heros', 0).setDepth(30);

    // les cônes de vision et les halos (redessinés à chaque image)
    this.conesG = this.add.graphics().setDepth(15);

    // le RADAR façon MGS (en haut à droite) : LA PIÈCE COURANTE, les gardes et leurs cônes.
    // Il se COUPE pendant une alerte — dans MGS aussi, le radar saute quand on te cherche.
    this.radarG = this.add.graphics().setDepth(901);
    this.radarEtat = texte(this, 858, 204, 'NORMAL', 13, '#7fff7f').setDepth(901);

    this.alertes = 0; this.pierres = R.joueur.pierres; this.temps = 0; this.pierre = null;

    // le HUD
    this.hudTitre = texte(this, 18, 20, '', 20, '#ffd84a', { fontStyle: 'bold' }).setOrigin(0, 0.5).setDepth(900);
    this.hudTemps = texte(this, LARGEUR - 18, 20, '', 18, '#dff6ff').setOrigin(1, 0.5).setDepth(900);
    this.hudPierres = texte(this, 18, 44, '', 16, '#ffd84a').setOrigin(0, 0.5).setDepth(900);
    this.hudAlertes = texte(this, LARGEUR - 18, 44, '', 16, '#ff9a9a').setOrigin(1, 0.5).setDepth(900);
    texte(this, LARGEUR / 2, HAUTEUR - 12, (estTactile() ? 'Sprint : bruyant !   Pierre : diversion   une pièce, puis l\'autre — jusqu\'au QG' : 'Z : sprint (bruyant)   X : pierre (diversion)   une pièce, puis l\'autre — jusqu\'au QG'), 13, '#8a94a4').setDepth(900);
    this.message = texte(this, LARGEUR / 2, 150, '', 40, '#ffffff', { fontStyle: 'bold', strokeThickness: 8 }).setOrigin(0.5).setDepth(950).setAlpha(0);

    this.chargerPiece(0);

    this.afficherIntro('BEUFA - L\'INFILTRATION', [
      'La nuit est tombée sur la base de BEUFA. Une pièce, puis une autre — et au fond, SON QG.',
      'Les gardes balayent et font leur ronde : OBSERVE depuis le portail, puis file dans leur dos.',
      '◀ ▶ ▲ ▼ : bouger (silencieux)',
      (estTactile() ? 'Sprint' : 'Z') + ' : sprinter — plus rapide, mais les gardes proches T\'ENTENDENT',
      (estTactile() ? 'Pierre' : 'X') + ' : lancer une pierre — les gardes iront voir AILLEURS',
      'Conteneurs, sacs de sable, table à cartes : tout ce qui est haut COUPE LA VUE — colle-toi derrière.',
      'Les PROJECTEURS AU BORD balayent le sol : leur HALO file jusqu\'au MILIEU — passe quand il repart !',
      'Le cône d\'un garde te voit : la jauge « ? » monte — sors avant le « ! ».',
      'Traverse la PORTE au NORD de la cour, puis file à la PORTE DU QG, à l\'est de la salle.',
      'Touché = renvoyé à l\'entrée DE LA PIÈCE ; le radar en haut à droite saute pendant les alertes.',
    ], () => this.cinema());
  }

  // ---------- les IMAGES DE FABIEN : fond retiré, recadrées, à la taille du jeu ----------
  // Ses JPG arrivent GRANDES (le générateur ne contrôle pas la taille) et sur FOND
  // BLANC. Pour chaque image chargée, une seule fois :
  //  1. fond 'blanc' (les sprites) : on retire le blanc RELIÉ AUX BORDS (un délavage)
  //     — le blanc à L'INTÉRIEUR du dessin (yeux, reflets) reste opaque, et le liseré
  //     clair du JPG collé au dessin fond à moitié ;
  //  2. fond 'bord' (les textures plein cadre : sol, route, murs) : on enlève juste
  //     d'éventuelles MARGES blanches, sans toucher au dessin ;
  //  3. on RECADRE sur le contenu ;
  //  4. on redessine le tout à la TAILLE DU JEU (déclarée dans le manifeste) ;
  //  5. on RECONSTRUIT les frames de l'animation, à la bonne dimension.
  preparerImages() {
    const m = manifesteDe(IDENTITE.id);
    for (const [cle, e] of Object.entries(m.images)) {
      if (!e.fichier || !this.textures.exists(cle)) continue;
      const tex = this.textures.get(cle);
      const source = tex.source[0];
      if (!source || source.__prete) continue;   // déjà préparée (le jeu peut redémarrer)
      const L = source.width, H = source.height;
      const cv = document.createElement('canvas');
      cv.width = L; cv.height = H;
      const ctx = cv.getContext('2d');
      ctx.drawImage(source.image, 0, 0);
      const img = ctx.getImageData(0, 0, L, H);
      const d = img.data;
      const presqueBlanc = (k) => d[k] >= 238 && d[k + 1] >= 238 && d[k + 2] >= 238;
      let x0 = 0, y0 = 0, x1 = L - 1, y1 = H - 1;
      if (e.fond === 'blanc') {
        const vus = new Uint8Array(L * H);   // les pixels déjà traités (le fond, et les bords non blancs)
        const pile = [];   // le délavage part des QUATRE BORDS de l'image
        for (let x = 0; x < L; x++) { pile.push(x, (H - 1) * L + x); }
        for (let y = 0; y < H; y++) { pile.push(y * L, y * L + L - 1); }
        while (pile.length) {
          const k = pile.pop();
          if (k < 0 || k >= L * H || vus[k]) continue;
          vus[k] = 1;
          if (!presqueBlanc(k * 4)) continue;
          d[k * 4 + 3] = 0;   // ce blanc-là est LE FOND : il disparaît
          const x = k % L, y = (k - x) / L;
          if (x > 0) pile.push(k - 1);
          if (x < L - 1) pile.push(k + 1);
          if (y > 0) pile.push(k - L);
          if (y < H - 1) pile.push(k + L);
        }
        for (let k = 0; k < L * H; k++) {   // le liseré clair COLLÉ au dessin : à demi fondu
          const a = k * 4;
          if (vus[k] || d[a + 3] === 0) continue;
          const x = k % L, y = (k - x) / L;
          const voisinFond = (x > 0 && vus[k - 1] && d[(k - 1) * 4 + 3] === 0) || (x < L - 1 && vus[k + 1] && d[(k + 1) * 4 + 3] === 0) ||
            (y > 0 && vus[k - L] && d[(k - L) * 4 + 3] === 0) || (y < H - 1 && vus[k + L] && d[(k + L) * 4 + 3] === 0);
          if (voisinFond && d[a] >= 200 && d[a + 1] >= 200 && d[a + 2] >= 200) {
            d[a + 3] = Math.round(d[a + 3] * (1 - (Math.min(d[a], d[a + 1], d[a + 2]) - 200) / 60));
          }
        }
        ctx.putImageData(img, 0, 0);
        // le recadrage : la boîte du dessin resté opaque
        x0 = L; y0 = H; x1 = -1; y1 = -1;
        for (let y = 0; y < H; y++) for (let x = 0; x < L; x++) {
          if (d[(y * L + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        }
        if (x1 < 0) { source.__prete = true; continue; }   // image entièrement blanche : on n'y touche pas
      } else if (e.fond === 'bord') {
        // les textures PLEIN CADRE : on enlève juste une éventuelle MARGE blanche uniforme
        const ligneBlanche = (debut, pas, nombre) => { for (let i = 0; i < nombre; i++) if (!presqueBlanc((debut + i * pas) * 4)) return false; return true; };
        while (y0 <= y1 && ligneBlanche(y0 * L, 1, L)) y0++;
        while (y1 >= y0 && ligneBlanche(y1 * L, 1, L)) y1--;
        while (x0 <= x1 && ligneBlanche(x0, L, H)) x0++;
        while (x1 >= x0 && ligneBlanche(x1, L, H)) x1--;
        if ((x1 - x0 + 1) * (y1 - y0 + 1) < 0.4 * L * H) { x0 = 0; y0 = 0; x1 = L - 1; y1 = H - 1; }   // dégénéré : on garde tout
      }
      const cL = x1 - x0 + 1, cH = y1 - y0 + 1;
      // la TAILLE DU JEU : le canvas final = une frame × le nombre de frames
      const fL = e.largeur, fH = e.hauteur, n = e.images || 1;
      const cibleL = fL * n, cibleH = fH;
      const final = document.createElement('canvas');
      final.width = cibleL; final.height = cibleH;
      const c2 = final.getContext('2d');
      c2.imageSmoothingEnabled = true;
      c2.imageSmoothingQuality = 'high';
      const rapport = (cL / cH) / (cibleL / cibleH);
      if (rapport >= 0.6 && rapport <= 1.67) {
        c2.drawImage(cv, x0, y0, cL, cH, 0, 0, cibleL, cibleH);   // le dessin a le bon aspect : on l'étire
      } else {
        // trop différent : on fait RENTRER le dessin dans la cible, centré (rien n'est broyé)
        const k = Math.min(cibleL / cL, cibleH / cH);
        const dL = Math.round(cL * k), dH = Math.round(cH * k);
        c2.drawImage(cv, x0, y0, cL, cH, Math.round((cibleL - dL) / 2), Math.round((cibleH - dH) / 2), dL, dH);
      }
      // les frames sont RECONSTRUITES à la dimension du jeu
      for (const nom of Object.keys(tex.frames)) if (nom !== '__BASE') tex.remove(nom);
      for (let i = 0; i < n; i++) tex.add(i, 0, i * fL, 0, fL, fH);
      source.image = final;   // la source devient le canvas final…
      source.width = cibleL; source.height = cibleH;
      const base = tex.frames.__BASE;
      if (base) { base.width = cibleL; base.height = cibleH; base.cutWidth = cibleL; base.cutHeight = cibleH; base.sourceSizeWidth = cibleL; base.sourceSizeHeight = cibleH; }
      tex.refresh();   // …rechargée côté GPU : tous les sprites suivent
      source.__prete = true;
    }
  }

  // ---------- UNE PIÈCE : on la charge, et rien d'autre n'existe ----------
  chargerPiece(i) {
    this.piece = i;
    const P = PIECES[i];
    for (const d of this.decor) d.destroy();   // la pièce précédente disparaît tout entière
    this.decor = [];
    this.obstacles = [];
    this.gardes = [];
    this.projecteurs = [];
    if (this.pierre) { this.pierre.sprite.destroy(); this.pierre = null; }
    this.sol.setTint(P.teinteSol || 0xffffff);   // l'ambiance change : cour extérieure / salle du QG
    // LA ROUTE : du portail à la porte, l'axe de la base — du décor, ça ne bloque pas
    for (const [x, y, l, h] of (P.routes || [])) {
      this.decor.push(this.add.tileSprite(x, y, l, h, 'beufa_route', 0).setOrigin(0.5).setDepth(5));
    }
    for (const [x, y, l, h] of P.murs) {
      // murs façon NÉS : la bande se pave avec sa texture (chapeau éclairé + face sombre)
      const bande = (l >= h) ? this.add.tileSprite(x, y, l, h, 'beufa_mur', 0) : this.add.tileSprite(x, y, l, h, 'beufa_mur_v', 0);
      bande.setOrigin(0.5).setDepth(21);
      this.decor.push(bande);
      this.obstacles.push({ x, y, l, h });
    }
    // les portes VERROUILLÉES des pièces à venir (prévues sur le plan) : dessinées, elles bloquent
    for (const [x, y, l, h] of (P.portesVerrouillees || [])) {
      this.decor.push(this.add.image(x, y, 'beufa_porte_verrouillee').setRotation(Math.PI / 2).setDepth(22));
      this.obstacles.push({ x, y, l, h });
    }
    // les portes OUVERTES : l'entrée et la sortie de la pièce (LED verte, bande jaune)
    for (const [x, y, rot] of (P.portes || [])) this.decor.push(this.add.image(x, y, 'beufa_porte').setRotation(rot).setDepth(10));
    // LES CONTENEURS : les GRANDES couvertures — elles bloquent le passage ET la vue
    for (const c of (P.conteneurs || [])) {
      const [x, y, l, h] = c;
      const img = this.add.image(x, y, c[4] || 'beufa_conteneur').setDepth(21);
      if (h > l) img.setRotation(Math.PI / 2);   // le conteneur vertical = le même, tourné
      this.decor.push(img);
      this.obstacles.push({ x, y, l, h });
    }
    // LE POSTE DE CONTRÔLE : les nids de sacs de sable
    for (const [x, y] of (P.sacs || [])) this.ajouterObstacle('beufa_sacs', x, y, 64, 44);
    // LA TABLE À CARTES : le cœur du poste de commandement
    for (const [x, y] of (P.tables || [])) this.ajouterObstacle('beufa_table', x, y, 140, 90);
    for (const [x, y] of P.caisses) this.ajouterObstacle('beufa_caisse', x, y, 64, 64);
    // LES PROJECTEURS : la tour est SUR le mur, au bord de l'écran ; son HALO voyage
    // de « depart » à « arrivee » (jusqu'au milieu de la pièce) puis revient.
    for (const pr of (P.projecteurs || [])) {
      const face = Math.atan2(pr.arrivee[1] - pr.tour[1], pr.arrivee[0] - pr.tour[0]);
      const sprite = this.add.image(pr.tour[0], pr.tour[1], 'beufa_projecteur').setDepth(22).setRotation(face);
      const alerte = this.add.text(pr.tour[0], pr.tour[1] - 26, '', styleAlerte).setOrigin(0.5).setDepth(940);
      this.decor.push(sprite, alerte);
      this.projecteurs.push({ tour: pr.tour, depart: pr.depart, arrivee: pr.arrivee, t: 0, hx: pr.depart[0], hy: pr.depart[1], jauge: 0, alerte });
    }
    this.gardes = P.gardes.map((g) => this.creerGarde(g));
    // le héros repart de la poche sûre de l'entrée — il peut OBSERVER avant de bouger
    this.joueur.x = P.entree.x; this.joueur.y = P.entree.y;
    this.sprJoueur.setPosition(this.joueur.x, this.joueur.y);
    this.hudTitre.setText('BEUFA — LA BASE · ' + P.nom);
  }

  // la petite cinématique : Beufa remonte la route et sort par la porte du nord
  cinema() {
    this.phase = 'cinema';
    const beufa = this.add.sprite(480, 310, 'beufa_boss', 0).setDepth(40).setScale(1.5);
    this.tweens.add({ targets: beufa, x: 480, y: 60, duration: 2600, ease: 'Sine.InOut' });
    this.dans(0.6, () => {
      this.cineTexte = texte(this, LARGEUR / 2, HAUTEUR - 60, 'BEUFA : « La cour est à moi… et MON QG est au fond. Bouge pas ! »', 19, '#ffd84a', { backgroundColor: '#000000cc', padding: { x: 14, y: 8 } }).setDepth(960);
    });
    this.dans(2.6, () => {
      jouerSon(this, 'beufa_verrou');
      beufa.destroy();
      if (this.cineTexte) this.cineTexte.destroy();
    });
    this.dans(3.1, () => {
      this.phase = 'jeu';
      this.messageCentre('INFILTRE-TOI JUSQU\'À SON QG !', '#ffd84a', 1.8);
    });
  }

  ajouterObstacle(cle, x, y, l, h) {
    this.decor.push(this.add.image(x, y, cle).setDepth(21));
    const o = { x, y, l, h };
    this.obstacles.push(o);
    return o;
  }

  creerGarde(g) {
    const sprite = this.add.sprite(g.chemin[0][0], g.chemin[0][1], 'beufa_garde', 0).setDepth(30);
    const alerte = this.add.text(g.chemin[0][0], g.chemin[0][1] - 32, '', styleAlerte).setOrigin(0.5).setDepth(940);
    this.decor.push(sprite, alerte);   // ils disparaîtront avec la pièce
    return {
      chemin: g.chemin, point: 1, x: g.chemin[0][0], y: g.chemin[0][1], angle: 0,
      etat: 'ronde', jauge: 0, vuX: 0, vuY: 0, perdu: 0, verif: 0, bouge: false, pauseT: 0,
      scan: g.scan || 0, scanBase: g.scanBase !== undefined ? g.scanBase : Math.PI / 2,
      sprite, alerte,
    };
  }

  // ---------- la boucle : toute la logique avance ici, en secondes ----------
  update(temps, delta) {
    const dt = Math.min(0.05, delta / 1000);
    for (const a of this.programme) a.t -= dt;
    this.programme.filter(a => a.t <= 0).forEach(a => a.fn());
    this.programme = this.programme.filter(a => a.t > 0);
    if (this.phase !== 'jeu') return;
    this.temps += dt;
    this.pasJoueur(dt);
    this.pasPierre(dt);
    for (const g of this.gardes) this.pasGarde(g, dt);
    // LES HALOS : un va-et-vient régulier (sinusoïde) de « depart » à « arrivee » —
    // dans la salle du QG, les deux partent en même temps : ils SE REJOIGNENT au milieu
    for (const pr of this.projecteurs) {
      pr.t = (Math.sin(this.temps * Math.PI * 2 / R.projecteur.periode) + 1) / 2;
      pr.hx = pr.depart[0] + (pr.arrivee[0] - pr.depart[0]) * pr.t;
      pr.hy = pr.depart[1] + (pr.arrivee[1] - pr.depart[1]) * pr.t;
    }
    this.detection(dt);
    this.afficher();
    this.majHud();
  }

  dans(sec, fn) { this.programme.push({ t: sec, fn }); }

  // ---------- le héros ----------
  pasJoueur(dt) {
    const t = this.touches;
    let dx = 0, dy = 0;
    if (t.gauche.isDown) dx -= 1;
    if (t.droite.isDown) dx += 1;
    if (t.haut.isDown) dy -= 1;
    if (t.bas.isDown) dy += 1;
    if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }
    const sprint = t.z.isDown && (dx || dy);
    const v = (sprint ? R.joueur.sprint : R.joueur.vitesse) * dt;
    this.bouger(this.joueur, dx * v, dy * v, R.joueur.rayon);
    if (dx || dy) {
      this.joueur.angle = Math.atan2(dy, dx);
      this.sprJoueur.setFrame(Math.floor(this.temps * (sprint ? 11 : 7)) % 2);
      if (sprint) this.bruit();   // le sprint s'entend : les gardes proches se tournent vers toi
    } else this.sprJoueur.setFrame(0);
    if (vientDAppuyer(t.x) && this.pierres > 0) this.lancerPierre();
    // LA SORTIE : la porte au nord (pièce suivante)… ou LA PORTE DU QG (victoire)
    const P = PIECES[this.piece];
    if (P.sortie === 'haut' && this.joueur.y < 36 && this.joueur.x > 445 && this.joueur.x < 515) this.changerDePiece(this.piece + 1);
    if (P.sortie === 'qg' && this.joueur.x > 906 && this.joueur.y > 190 && this.joueur.y < 250) this.reussite();
  }

  // le fondu de changement de pièce : l'écran s'éteint, la pièce suivante se charge
  changerDePiece(i) {
    if (this.phase !== 'jeu') return;
    this.phase = 'transition';
    jouerSon(this, 'beufa_reussi');
    this.messageCentre(PIECES[this.piece].nom + ' — PASSÉ !', '#7fff7f', 1.2);
    this.cameras.main.fadeOut(400, 2, 3, 8);
    this.dans(0.5, () => {
      this.chargerPiece(i);
      this.joueur.angle = -Math.PI / 2;
      this.cameras.main.fadeIn(450);
      this.dans(0.2, () => {
        this.phase = 'jeu';
        this.messageCentre(PIECES[i].nom, '#ffd84a', 1.6);
      });
    });
  }

  bouger(e, dx, dy, rayon) {
    e.x += dx; if (this.touche(e.x, e.y, rayon)) e.x -= dx;
    e.y += dy; if (this.touche(e.x, e.y, rayon)) e.y -= dy;
    e.x = Phaser.Math.Clamp(e.x, 22, LARGEUR - 22);
    e.y = Phaser.Math.Clamp(e.y, 22, HAUTEUR - 22);
  }

  touche(x, y, r) {
    for (const o of this.obstacles) {
      if (x > o.x - o.l / 2 - r && x < o.x + o.l / 2 + r && y > o.y - o.h / 2 - r && y < o.y + o.h / 2 + r) return true;
    }
    return false;
  }

  bruit() {
    for (const g of this.gardes) {
      if (g.etat === 'ronde' && Math.hypot(g.x - this.joueur.x, g.y - this.joueur.y) < R.joueur.bruit) {
        g.angle = Math.atan2(this.joueur.y - g.y, this.joueur.x - g.x);
        g.jauge = Math.max(g.jauge, 0.2);
      }
    }
  }

  // ---------- la pierre de diversion ----------
  lancerPierre() {
    this.pierres--;
    const a = this.joueur.angle;
    this.pierre = { x: this.joueur.x, y: this.joueur.y, dx: Math.cos(a), dy: Math.sin(a), reste: R.joueur.porteePierre,
      sprite: this.add.image(this.joueur.x, this.joueur.y, 'beufa_pierre').setDepth(35) };
    jouerSon(this, 'beufa_pierre');
  }

  pasPierre(dt) {
    if (!this.pierre) return;
    const p = this.pierre, pas = Math.min(340 * dt, p.reste);
    p.reste -= pas;
    const nx = p.x + p.dx * pas, ny = p.y + p.dy * pas;
    if (this.touche(nx, ny, 5) || p.reste <= 0) { this.pierreToucheSol(nx, ny); return; }
    p.x = nx; p.y = ny;
    p.sprite.setPosition(nx, ny);
  }

  pierreToucheSol(x, y) {
    this.pierre.sprite.destroy();
    this.pierre = null;
    const clac = texte(this, x, y, 'CLAC !', 20, '#dff6ff', { fontStyle: 'bold' }).setDepth(940);
    this.tweens.add({ targets: clac, alpha: 0, y: y - 20, duration: 700, onComplete: () => clac.destroy() });
    for (const g of this.gardes) {
      if ((g.etat === 'ronde' || g.etat === 'retour') && Math.hypot(g.x - x, g.y - y) < 300) {
        g.etat = 'verification'; g.verif = R.alerte.verification; g.vuX = x; g.vuY = y; g.jauge = 0;
      }
    }
  }

  // ---------- les gardes ----------
  pasGarde(g, dt) {
    g.bouge = false;
    if (g.etat === 'ronde') {
      if (g.scan) {   // le planté : il balaie sur place, jamais il ne bouge
        g.angle = g.scanBase + Math.sin(this.temps * 0.7) * g.scan * Math.PI / 180;
      } else if (g.pauseT > 0) {   // MGS : arrivé au bout de sa ronde, il S'ARRÊTE et regarde autour
        g.pauseT -= dt;
        g.angle += Math.sin(this.temps * 2.4) * dt * 1.9;
      } else {
        const cible = g.chemin[g.point];
        const dx = cible[0] - g.x, dy = cible[1] - g.y, d = Math.hypot(dx, dy);
        if (d < 4) { g.point = (g.point + 1) % g.chemin.length; g.pauseT = R.garde.pause; }
        else {
          const v = R.garde.vitesseRonde * dt / d;
          g.x += dx * v; g.y += dy * v;
          g.angle = Math.atan2(dy, dx);
          g.bouge = true;
        }
      }
    } else if (g.etat === 'poursuite') {
      if (this.vuPar(g)) { g.vuX = this.joueur.x; g.vuY = this.joueur.y; g.perdu = 0; }
      else {
        g.perdu += dt;
        if (g.perdu > R.alerte.poursuiteMax) { g.etat = 'verification'; g.verif = R.alerte.verification; return; }
      }
      const dx = g.vuX - g.x, dy = g.vuY - g.y, d = Math.hypot(dx, dy) || 1;
      g.angle = Math.atan2(dy, dx);
      this.bouger(g, dx / d * R.garde.vitessePoursuite * dt, dy / d * R.garde.vitessePoursuite * dt, R.garde.rayon);
      g.bouge = true;
      if (Math.hypot(this.joueur.x - g.x, this.joueur.y - g.y) < R.alerte.rattrape) this.attraper();
    } else if (g.etat === 'verification') {
      const dx = g.vuX - g.x, dy = g.vuY - g.y, d = Math.hypot(dx, dy);
      if (d > 6) {
        const v = R.garde.vitesseRonde * 1.4 * dt / d;
        this.bouger(g, dx * v, dy * v, R.garde.rayon);
        g.angle = Math.atan2(dy, dx);
        g.bouge = true;
      } else {
        g.verif -= dt;
        g.angle += dt * 2.4;   // il fouille des yeux à droite à gauche
        if (g.verif <= 0) g.etat = 'retour';
      }
    } else if (g.etat === 'retour') {
      const cible = g.chemin[g.point];
      const dx = cible[0] - g.x, dy = cible[1] - g.y, d = Math.hypot(dx, dy);
      if (d < 6) g.etat = 'ronde';
      else {
        const v = R.garde.vitesseRonde * 1.4 * dt / d;
        this.bouger(g, dx * v, dy * v, R.garde.rayon);
        g.angle = Math.atan2(dy, dx);
        g.bouge = true;
      }
    }
  }

  // est-ce que CE garde te voit, là, maintenant ? (cône + distance + obstacles qui coupent la vue)
  vuPar(g) {
    const dx = this.joueur.x - g.x, dy = this.joueur.y - g.y, d = Math.hypot(dx, dy);
    if (d > R.garde.portee) return false;
    if (Math.abs(normAngle(Math.atan2(dy, dx) - g.angle)) > R.garde.angle * Math.PI / 180) return false;
    return !this.vueBloquee(g.x, g.y, this.joueur.x, this.joueur.y, null);
  }

  // la ligne de vue coupe-t-elle un obstacle ?
  vueBloquee(x1, y1, x2, y2, exclu) {
    return this.porteeVue(x1, y1, x2 - x1, y2 - y1, exclu) < 1;
  }

  // le premier obstacle touché par le segment (0 = au départ, 1 = à l'arrivée)
  porteeVue(x, y, dx, dy, exclu) {
    let t = 1;
    for (const o of this.obstacles) {
      if (o === exclu) continue;
      const u = this.rayonAABB(x, y, dx, dy, o);
      if (u !== null && u < t) t = u;
    }
    return t;
  }

  rayonAABB(x, y, dx, dy, o) {
    const minX = o.x - o.l / 2, maxX = o.x + o.l / 2, minY = o.y - o.h / 2, maxY = o.y + o.h / 2;
    let t0 = 0, t1 = 1, ta, tb;
    if (Math.abs(dx) < 1e-9) { if (x < minX || x > maxX) return null; }
    else {
      ta = (minX - x) / dx; tb = (maxX - x) / dx;
      if (ta > tb) { const e = ta; ta = tb; tb = e; }
      t0 = Math.max(t0, ta); t1 = Math.min(t1, tb);
      if (t0 > t1) return null;
    }
    if (Math.abs(dy) < 1e-9) { if (y < minY || y > maxY) return null; }
    else {
      ta = (minY - y) / dy; tb = (maxY - y) / dy;
      if (ta > tb) { const e = ta; ta = tb; tb = e; }
      t0 = Math.max(t0, ta); t1 = Math.min(t1, tb);
      if (t0 > t1) return null;
    }
    return t0;
  }

  // ---------- le repérage : « ? » qui monte, puis « ! » ----------
  detection(dt) {
    for (const g of this.gardes) {
      const vu = this.vuPar(g);
      if (g.etat === 'ronde') {
        if (vu) { g.jauge += dt / R.garde.reperage; if (g.jauge >= 1) this.declencherAlerte(g); }
        else g.jauge = Math.max(0, g.jauge - dt / 0.5);
        g.alerte.setText(g.jauge > 0.12 ? '?' : '').setColor(g.jauge > 0.5 ? '#ff9a5a' : '#ffd84a');
      } else if (g.etat === 'verification' || g.etat === 'retour') {
        if (vu) this.declencherAlerte(g);
        g.alerte.setText('');
      } else {
        g.alerte.setText('!').setColor('#ff5a5a');
      }
    }
    // LES HALOS : dedans = repéré ; un conteneur entre le halo et toi fait OMBRE
    for (const pr of this.projecteurs) {
      const dx = this.joueur.x - pr.hx, dy = this.joueur.y - pr.hy, d = Math.hypot(dx, dy);
      const dedans = d < R.projecteur.rayon && !this.vueBloquee(pr.hx, pr.hy, this.joueur.x, this.joueur.y, null);
      if (dedans) {
        pr.jauge += dt / R.projecteur.reperage;
        if (pr.jauge >= 1) { pr.jauge = 0; this.declencherAlerte(this.gardeLePlusProche(pr.hx, pr.hy)); }
      } else pr.jauge = Math.max(0, pr.jauge - dt / 0.5);
      pr.alerte.setText(pr.jauge > 0.12 ? '?' : '').setColor('#ffd84a');
    }
  }

  gardeLePlusProche(x, y) {
    let meilleur = this.gardes[0], d = Infinity;
    for (const g of this.gardes) {
      const dd = Math.hypot(g.x - x, g.y - y);
      if (dd < d) { d = dd; meilleur = g; }
    }
    return meilleur;
  }

  declencherAlerte(g) {
    this.alertes++;
    jouerSon(this, 'beufa_alerte');
    this.cameras.main.shake(160, 0.005);
    g.etat = 'poursuite'; g.jauge = 1; g.perdu = 0; g.vuX = this.joueur.x; g.vuY = this.joueur.y;
    this.messageCentre('!', '#ff5a5a', 0.7);
    // l'alerte est COLLECTIVE : les gardes pas loin se joignent à la course
    for (const o of this.gardes) {
      if (o !== g && (o.etat === 'ronde' || o.etat === 'retour') && Math.hypot(o.x - g.x, o.y - g.y) < R.alerte.collective) {
        o.etat = 'poursuite'; o.jauge = 1; o.perdu = 0; o.vuX = this.joueur.x; o.vuY = this.joueur.y;
      }
    }
  }

  attraper() {
    if (this.phase !== 'jeu') return;
    this.phase = 'attrape';
    jouerSon(this, 'beufa_attrape');
    this.cameras.main.shake(280, 0.012);
    this.messageCentre('RENVOYÉ !', '#ff6b6b', 1.4);
    this.dans(1.7, () => this.remettreAuDepart());
  }

  // CHECKPOINT PAR PIÈCE (conseil designer : ne JAMAIS faire refaire une rencontre réussie)
  remettreAuDepart() {
    const P = PIECES[this.piece];
    this.joueur.x = P.entree.x; this.joueur.y = P.entree.y;
    this.pierres = R.joueur.pierres;
    for (const g of this.gardes) {
      g.etat = 'ronde'; g.jauge = 0; g.bouge = false; g.pauseT = 0;
      g.x = g.chemin[0][0]; g.y = g.chemin[0][1]; g.point = 1;
      g.alerte.setText('');
    }
    for (const pr of this.projecteurs) { pr.jauge = 0; pr.alerte.setText(''); }
    if (this.pierre) { this.pierre.sprite.destroy(); this.pierre = null; }
    this.phase = 'jeu';
  }

  reussite() {
    if (this.phase !== 'jeu') return;
    this.phase = 'fin';
    jouerSon(this, 'beufa_reussi');
    this.victoire('Le QG de BEUFA est infiltré en ' + formatTemps(this.temps) + ' ! Alertes déclenchées : ' + this.alertes + '. Les pièces suivantes de la base arrivent, puis le QUIZ !');
  }

  // ---------- l'affichage ----------
  afficher() {
    this.sprJoueur.setPosition(this.joueur.x, this.joueur.y).setRotation(this.joueur.angle);
    const gg = this.conesG;
    gg.clear();
    // LES HALOS : le faisceau de la tour vers son halo, puis le halo lui-même —
    // cœur brillant, bord doux ; à deux, ils SE REJOIGNENT au milieu de la salle
    for (const pr of this.projecteurs) {
      const a = Math.atan2(pr.hy - pr.tour[1], pr.hx - pr.tour[0]);
      const nx = Math.cos(a + Math.PI / 2), ny = Math.sin(a + Math.PI / 2);
      gg.fillStyle(0xfff3b0, 0.06);
      gg.fillPoints([
        { x: pr.tour[0] + nx * 5, y: pr.tour[1] + ny * 5 },
        { x: pr.tour[0] - nx * 5, y: pr.tour[1] - ny * 5 },
        { x: pr.hx - nx * 26, y: pr.hy - ny * 26 },
        { x: pr.hx + nx * 26, y: pr.hy + ny * 26 },
      ], true);
      gg.fillStyle(0xfff3b0, 0.10); gg.fillCircle(pr.hx, pr.hy, R.projecteur.rayon);
      gg.fillStyle(0xfff3b0, 0.10); gg.fillCircle(pr.hx, pr.hy, R.projecteur.rayon * 0.66);
      gg.fillStyle(0xfff8d0, 0.14); gg.fillCircle(pr.hx, pr.hy, R.projecteur.rayon * 0.38);
      gg.lineStyle(1.5, 0xfff3b0, 0.35); gg.strokeCircle(pr.hx, pr.hy, R.projecteur.rayon);
      pr.alerte.setPosition(pr.hx, pr.hy - R.projecteur.rayon - 8);
    }
    for (const g of this.gardes) {
      g.sprite.setPosition(g.x, g.y).setRotation(g.angle).setFrame(g.bouge ? Math.floor(this.temps * 6) % 2 : 0);
      g.alerte.setPosition(g.x, g.y - 32);
      this.dessinerCone(gg, g.x, g.y, g.angle, R.garde, g.etat === 'poursuite' ? 0xff5a5a : 0xffe9a0, null);
    }
    this.dessinerRadar();
  }

  // le radar façon MGS : LA PIÈCE COURANTE dans un cercle — murs, gardes, cônes, halos, héros.
  // NORMAL (vert) / RECHERCHE (orange) / ALERTE (rouge, radar coupé avec des parasites).
  dessinerRadar() {
    const g = this.radarG, cx = 858, cy = 128, rr = 64;
    const alerte = this.gardes.some(x => x.etat === 'poursuite');
    const recherche = this.gardes.some(x => x.etat === 'verification' || x.etat === 'retour');
    g.clear();
    g.fillStyle(0x001a06, 0.88); g.fillCircle(cx, cy, rr);
    g.lineStyle(2, alerte ? 0xff5a5a : recherche ? 0xffb347 : 0x35d035, 1); g.strokeCircle(cx, cy, rr);
    this.radarEtat.setText(alerte ? 'ALERTE !' : recherche ? 'RECHERCHE' : 'NORMAL')
      .setColor(alerte ? '#ff5a5a' : recherche ? '#ffb347' : '#7fff7f');
    if (alerte) {   // radar coupé : des parasites défilent, comme dans MGS
      g.lineStyle(1, 0xff5a5a, 0.5);
      for (let k = 0; k < 8; k++) {
        const d1 = cy - 44 + k * 11 + (this.temps * 61 % 11);
        const d2 = cy - 44 + k * 11 + (this.temps * 37 % 11);
        g.lineBetween(cx - rr + 6, d1, cx + rr - 6, d2);
      }
      return;
    }
    const s = 110 / LARGEUR;   // la pièce (un écran 960x540) tient dans le cercle
    const P = (x, y) => ({ x: cx + (x - 480) * s, y: cy + (y - 270) * s });
    g.lineStyle(1, 0x35d035, 0.85);
    for (const o of this.obstacles) { const p = P(o.x - o.l / 2, o.y - o.h / 2); g.strokeRect(p.x, p.y, Math.max(1, o.l * s), Math.max(1, o.h * s)); }
    for (const pr of this.projecteurs) {
      const p = P(pr.hx, pr.hy);
      g.fillStyle(0xfff3b0, 0.9); g.fillCircle(p.x, p.y, 3);
      g.lineStyle(1, 0xfff3b0, 0.7); g.strokeCircle(p.x, p.y, R.projecteur.rayon * s);
    }
    for (const gd of this.gardes) {
      const p = P(gd.x, gd.y);
      g.fillStyle(gd.etat === 'poursuite' ? 0xff5a5a : gd.etat === 'ronde' ? 0xffd84a : 0xffb347, 1);
      g.slice(p.x, p.y, R.garde.portee * s, gd.angle - R.garde.angle * Math.PI / 180, gd.angle + R.garde.angle * Math.PI / 180, false);
      g.fillPath();
      g.fillCircle(p.x, p.y, 2.4);
    }
    const pj = P(this.joueur.x, this.joueur.y);
    g.fillStyle(0xffffff, 1); g.fillCircle(pj.x, pj.y, 3);
    g.lineStyle(1.5, 0xffffff, 1); g.lineBetween(pj.x, pj.y, pj.x + Math.cos(this.joueur.angle) * 8, pj.y + Math.sin(this.joueur.angle) * 8);
  }

  // le cône de vision : 13 rayons qui s'arrêtent sur les conteneurs, les murs et les caisses.
  // Deux passes de remplissage : le cœur du faisceau est plus dense — on lit le cône d'un coup d'œil.
  dessinerCone(g, x, y, angle, reglages, couleur, exclu) {
    const demi = reglages.angle * Math.PI / 180, nb = 13;
    const points = [{ x, y }];
    for (let k = 0; k < nb; k++) {
      const a = angle - demi + (demi * 2 * k) / (nb - 1);
      const dist = this.porteeVue(x, y, Math.cos(a) * reglages.portee, Math.sin(a) * reglages.portee, exclu) * reglages.portee;
      points.push({ x: x + Math.cos(a) * dist, y: y + Math.sin(a) * dist });
    }
    g.fillStyle(couleur, 0.10); g.fillPoints(points, true);
    const coeur = points.map((pt, idx) => idx === 0 ? pt : { x: x + (pt.x - x) * 0.55, y: y + (pt.y - y) * 0.55 });
    g.fillStyle(couleur, 0.10); g.fillPoints(coeur, true);
    g.lineStyle(1.5, couleur, 0.35); g.strokePoints(points, true);
  }

  majHud() {
    this.hudTemps.setText(formatTemps(this.temps));
    this.hudAlertes.setText(this.alertes ? 'Alertes : ' + this.alertes : '');
    this.hudPierres.setText('Pierres : ' + '●'.repeat(this.pierres) + '○'.repeat(Math.max(0, R.joueur.pierres - this.pierres)));
  }

  messageCentre(txt, couleur, duree) {
    this.message.setText(txt).setColor(couleur).setAlpha(1).setScale(1.25);
    this.tweens.add({ targets: this.message, scale: 1, duration: 150 });
    this.tweens.add({ targets: this.message, alpha: 0, delay: duree * 1000, duration: 350 });
  }
}
