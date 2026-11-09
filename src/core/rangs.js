// RANGS : un seul format dans tout le jeu (demande de Fabien, nov. 2026) : un NOM propre au boss, puis la LETTRE
// entre parenthèses, ex. « BIG BOSS (S) ». Chaque boss garde sa liste (nom + lettre) dans ses réglages.
export function rangLisible(nom, lettre) { return lettre && nom !== lettre ? `${nom} (${lettre})` : String(nom); }
// retrouve { nom, lettre } dans une liste de rangs, à partir de ce qui a été sauvegardé (lettre ou nom selon le boss)
export function trouverRang(liste, cle) {
  return liste.find(r => r.lettre === cle || r.rang === cle || r.court === cle || r.nom === cle) || null;
}
