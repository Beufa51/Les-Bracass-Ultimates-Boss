// =====================================================================
// BANDEAU D'ERREUR : si le jeu plante, l'erreur s'affiche en rouge EN PLEIN ÉCRAN.
// La console du navigateur n'existe pas sur téléphone : ici le message est visible
// partout — on le copie à l'assistant et le bug se corrige tout de suite.
// =====================================================================
export function installerAffichageErreurs() {
  const dejaVus = [];
  const montrer = (message) => {
    if (dejaVus.includes(message)) return;
    dejaVus.push(message);
    let b = document.getElementById('erreur_jeu');
    if (!b) {
      b = document.createElement('div');
      b.id = 'erreur_jeu';
      b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99;background:#a01818;color:#fff;' +
        'font:bold 13px/1.5 monospace;padding:8px 10px;white-space:pre-wrap;word-break:break-word;max-height:45%;overflow:auto';
      document.body.appendChild(b);
    }
    b.style.display = 'block';
    b.textContent += (b.textContent ? '\n' : '') + 'BUG — copie ce message à l\'assistant : ' + message;
  };
  window.addEventListener('error', (e) => {
    const err = e.error;
    const pile = err && err.stack ? String(err.stack).split('\n').slice(0, 3).join(' | ') : '';
    montrer((err && err.message ? err.message : e.message || 'erreur inconnue') + (pile ? ' (' + pile + ')' : ''));
  });
  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason;
    montrer('promesse : ' + (r && r.message ? r.message : String(r)));
  });
}
