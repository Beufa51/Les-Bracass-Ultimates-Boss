// Clips (GIF ou vidéo) affichés par-dessus le jeu, par exemple pour une attaque spéciale.
// Ils sont listés dans le manifeste de chaque boss (rubrique "clips"). Si le fichier n'existe pas,
// rien ne s'affiche et le jeu utilise son animation dessinée par le code.
import { MANIFESTE } from './manifestes.js';

// Au démarrage : vérifie quels clips existent vraiment (un fichier absent = on l'ignore)
export function verifierClips() {
  for (const e of Object.values(MANIFESTE.clips || {})) {
    if (!e.fichier) continue;
    fetch('assets/' + e.fichier, { method: 'HEAD' })
      .then(r => { e.disponible = r.ok; })
      .catch(() => { e.disponible = false; });
  }
}

// Renvoie { duree, fermer() } si le clip existe, sinon null
export function jouerClip(scene, cle) {
  const e = MANIFESTE.clips && MANIFESTE.clips[cle];
  if (!e || !e.fichier || !e.disponible) return null;
  const video = /\.(mp4|webm)$/i.test(e.fichier);
  const el = document.createElement(video ? 'video' : 'img');
  // "?t=" : force le GIF à repartir du début à chaque fois
  el.src = 'assets/' + e.fichier + (video ? '' : '?t=' + Date.now());
  const r = scene.game.canvas.getBoundingClientRect();
  Object.assign(el.style, {
    position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px',
    objectFit: 'contain', background: 'rgba(0,0,0,0.85)', zIndex: 5, pointerEvents: 'none',
  });
  if (video) {
    el.playsInline = true; el.muted = true; el.loop = true;   // vidéo muette en boucle (comme un GIF)
    el.setAttribute('playsinline', ''); el.setAttribute('muted', '');
    el.play().catch(() => {});
  }
  document.body.appendChild(el);
  return { duree: e.duree || 2, fermer: () => el.remove() };
}
