// Réglages du hub (écran de sélection des boss façon Mega Man), modifiables sans risque.
export const REGLAGES_HUB = {
  caseL: 270,        // largeur d'une case
  caseH: 180,        // hauteur d'une case
  ecart: 14,         // espace entre les cases
  grilleY: 158,      // milieu de la 1re ligne de cases
  infosY: 468,       // texte du boss choisi (2 lignes : nom + record, puis la fiche)
  bandeauY: 512,     // bandeau du bas (badges, la fin)
  // tableau de PROGRESSION (bouton 📋 PROGRÈS) : place des lignes
  progression: { hautY: 84, ligneH: 64, basY: 512 },   // (défis : src/bosses/defis.js)
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
