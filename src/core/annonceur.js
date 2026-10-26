// Annonceur vocal (voix de synthèse du navigateur, gratuite, sans fichier son).
// Comme le speaker de Super Punch-Out : "Box !", le compte de l'arbitre, "K.O. !".
// Si le navigateur n'a pas de voix française, il ne se passe rien.
import { Sauvegarde } from './sauvegarde.js';
let voix = null, voixJaponaise = null;
function choisirVoix() {
  const toutes = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  voix = toutes.find(v => v.lang && v.lang.startsWith('fr')) || null;
  voixJaponaise = toutes.find(v => v.lang && v.lang.startsWith('ja')) || null;
}
if (window.speechSynthesis) {
  choisirVoix();
  window.speechSynthesis.onvoiceschanged = choisirVoix;
}

// texte : une phrase, ou [texte japonais, lecture en lettres] avec { japonais: true }
export function annoncer(texte, { vitesse = 1.1, hauteur = 0.8, coupe = true, japonais = false } = {}) {
  try {
    if (!window.speechSynthesis || Sauvegarde.volume('voix') <= 0) return;
    let v = voix, dire = texte;
    if (japonais) {
      // voix japonaise si le navigateur en a une, sinon la voix française lit la version en lettres
      if (voixJaponaise) { v = voixJaponaise; dire = texte[0]; } else dire = texte[1];
    }
    if (!v) return;
    if (coupe) window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(dire);
    u.voice = v; u.lang = v.lang; u.rate = vitesse; u.pitch = hauteur; u.volume = Sauvegarde.volume('voix');
    window.speechSynthesis.speak(u);
  } catch (e) { /* ignoré */ }
}

export function taireAnnonceur() {
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { /* ignoré */ }
}
