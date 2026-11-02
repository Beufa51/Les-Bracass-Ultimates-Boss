// Vérifie les images de Rémi : chaque fichier du manifeste doit faire EXACTEMENT largeur x images par hauteur.
// Sinon Phaser ne découpe pas les cases et affiche TOUTE la planche (bug « tous les bourrés d'un coup », V5).
// Lancer : node outils/remi_verif.mjs   (après chaque passage de outils/remi/preparer_images.py)
import { readFileSync } from 'fs';
import { MANIFESTE } from '../src/bosses/remi/manifeste.js';

function taille(f) {
  const b = readFileSync(f);
  if (b[0] === 0x89) return [b.readUInt32BE(16), b.readUInt32BE(20)];   // PNG
  let i = 2;                                                              // JPEG : cherche le bloc SOF
  while (i < b.length) {
    const m = b[i + 1], l = b.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xc3) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    i += 2 + l;
  }
  return null;
}

let erreurs = 0;
for (const [cle, e] of Object.entries(MANIFESTE.images)) {
  if (!e.fichier) continue;
  let t;
  try { t = taille('assets/' + e.fichier); } catch { console.log('MANQUE', cle, e.fichier); erreurs++; continue; }
  const attendu = [e.largeur * e.images, e.hauteur];
  if (!t || t[0] !== attendu[0] || t[1] !== attendu[1]) {
    console.log(`ERREUR ${cle} : fichier ${t} ; manifeste ${attendu} (largeur ${t ? t[0] / e.images : '?'} x hauteur ${t ? t[1] : '?'} ?)`);
    erreurs++;
  }
}
console.log(erreurs ? `${erreurs} erreur(s)` : 'Images de Rémi : 0 erreur');
process.exit(erreurs ? 1 : 0);
