// Réglages du hub (écran de sélection des boss façon Mega Man), modifiables sans risque.
export const REGLAGES_HUB = {
  // nov. 2026 : 3 boss à GAUCHE, 3 à DROITE, le BOSS FINAL (mécha) dans la grande case du MILIEU (façon Mega Man)
  caseL: 280,        // largeur d'une case de boss
  caseH: 118,        // hauteur d'une case de boss
  ecart: 12,         // espace entre les cases
  grilleY: 116,      // milieu de la 1re ligne de cases
  centre: { l: 300, h: 378 },
  // AVANT les 6 badges : la grille d'origine 3 x 2 (le boss final reste une surprise, pas de trou au milieu)
  grille: { caseL: 270, caseH: 180, ecart: 14, grilleY: 158 },   // la case du milieu (boss final) : largeur, hauteur
  infosY: 468,       // texte du boss choisi (2 lignes : nom + record, puis la fiche)
  bandeauY: 512,     // bandeau du bas (badges, la fin)
  // tableau de PROGRESSION (bouton 📋 PROGRÈS) : place des lignes
  progression: { hautY: 80, ligneH: 55, basY: 514 },   // 7 lignes (les 6 + le BOSS FINAL)   // (défis : src/bosses/defis.js)
  ficheFinale: 'Shoot\'em up · ≈ 4 min · un doigt',
  // fiche d'une ligne du boss choisi (genre · durée · commandes au doigt)
  fiches: {
    beufa: 'Infiltration + quiz · ≈ 5 min · joystick',
    kedric: 'Course + danse · ≈ 3 min · glisser',
    julien: 'Tir rétro · ≈ 8 min · joystick + lancer',
    greg: 'Boxe · ≈ 2 min · glisser / toucher',
    remi: 'Soirée au bar · ≈ 3 min · toucher',
    lionel: 'Frisbee · ≈ 3 min · joystick + 2 boutons',
  },
};
