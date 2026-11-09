// Réglages du hub (écran de sélection des boss façon Mega Man), modifiables sans risque.
export const REGLAGES_HUB = {
  caseL: 270,        // largeur d'une case
  caseH: 180,        // hauteur d'une case
  ecart: 14,         // espace entre les cases
  grilleY: 158,      // milieu de la 1re ligne de cases
  infosY: 472,       // texte du boss choisi
  bandeauY: 512,     // bandeau du bas (badges, la fin)
  // tableau de PROGRESSION (bouton 📋 PROGRÈS) : place des lignes, nombre de défis de maîtrise par boss
  progression: { hautY: 98, ligneH: 58, basY: 500, defis: { kedric: 3, greg: 3, lionel: 3 } },
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
