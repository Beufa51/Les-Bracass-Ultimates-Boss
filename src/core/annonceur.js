// Annonceur vocal (voix de synthèse du navigateur, gratuite, sans fichier son).
// Comme le speaker de Super Punch-Out : "Box !", le compte de l'arbitre, "K.O. !".
// Si le navigateur n'a pas de voix française, il ne se passe rien.
let voix = null;
function choisirVoix() {
  const toutes = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  voix = toutes.find(v => v.lang && v.lang.startsWith('fr')) || null;
}
if (window.speechSynthesis) {
  choisirVoix();
  window.speechSynthesis.onvoiceschanged = choisirVoix;
}

export function annoncer(texte, { vitesse = 1.1, hauteur = 0.8, coupe = true } = {}) {
  try {
    if (!window.speechSynthesis || !voix) return;
    if (coupe) window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texte);
    u.voice = voix; u.lang = voix.lang; u.rate = vitesse; u.pitch = hauteur; u.volume = 1;
    window.speechSynthesis.speak(u);
  } catch (e) { /* ignoré */ }
}

export function taireAnnonceur() {
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { /* ignoré */ }
}
