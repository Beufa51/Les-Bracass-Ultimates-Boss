// Plein écran sur téléphone / tablette (pour tout le jeu : hub et tous les boss).
//  - au premier toucher, le jeu passe en plein écran et se bloque à l'horizontale (Android, tablettes) ;
//  - un bouton ⛶ (en haut à gauche) permet d'y revenir si on en sort ;
//  - sur iPhone, le navigateur ne permet pas le plein écran d'une page : une astuce (une seule fois)
//    explique comment ajouter le jeu à l'écran d'accueil, ce qui l'ouvre en plein écran comme une appli.
import { estTactile } from './tactile.js';
import { Sauvegarde } from './sauvegarde.js';

const peutPleinEcran = () => !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
const estPleinEcran = () => !!(document.fullscreenElement || document.webkitFullscreenElement)
  || window.matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone === true;

function passerEnPleinEcran() {
  const el = document.documentElement;
  const demande = el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : el.webkitRequestFullscreen && el.webkitRequestFullscreen();
  Promise.resolve(demande).then(() => {
    try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* ignoré */ }
  }).catch(() => {});
}

export function installerPleinEcran(jeu) {
  if (!estTactile()) return;
  // bouton ⛶ en haut à gauche
  const b = document.createElement('button');
  b.textContent = '⛶';
  Object.assign(b.style, {
    position: 'fixed', top: '6px', left: '8px', width: '46px', height: '34px', zIndex: 11,
    border: '2px solid rgba(255,255,255,0.55)', borderRadius: '10px', background: 'rgba(20,20,30,0.45)',
    color: '#fff', font: 'bold 18px monospace', touchAction: 'none',
  });
  b.addEventListener('pointerdown', (e) => { e.preventDefault(); passerEnPleinEcran(); });
  document.body.appendChild(b);
  const maj = () => {
    b.style.display = peutPleinEcran() && !estPleinEcran() ? '' : 'none';
    // Phaser recalcule la taille du jeu quand l'écran change
    setTimeout(() => jeu.scale.refresh(), 150);
  };
  document.addEventListener('fullscreenchange', maj);
  document.addEventListener('webkitfullscreenchange', maj);
  window.addEventListener('resize', maj);
  maj();

  // au premier toucher : plein écran (les navigateurs l'autorisent seulement après un geste)
  const premier = () => {
    window.removeEventListener('pointerup', premier, true);
    if (peutPleinEcran() && !estPleinEcran()) passerEnPleinEcran();
    else if (!estPleinEcran() && !Sauvegarde.fait('astuce_plein_ecran')) astuceIphone();
  };
  window.addEventListener('pointerup', premier, true);
}

// iPhone : pas de plein écran possible dans le navigateur => astuce « écran d'accueil » (une seule fois)
function astuceIphone() {
  Sauvegarde.marquerFait('astuce_plein_ecran');
  const d = document.createElement('div');
  d.innerHTML = 'Pour jouer en <b>plein écran</b> : touche <b>Partager</b> ⬆️ puis <b>« Sur l\'écran d\'accueil »</b>, '
    + 'et lance le jeu depuis son icône.<br><br><u>OK</u>';
  Object.assign(d.style, {
    position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 60, maxWidth: '80%',
    background: 'rgba(10,10,20,0.95)', color: '#fff', border: '3px solid #ffd84a', borderRadius: '14px',
    padding: '16px 20px', font: '16px monospace', textAlign: 'center',
  });
  d.addEventListener('pointerdown', (e) => { e.preventDefault(); d.remove(); });
  document.body.appendChild(d);
}
