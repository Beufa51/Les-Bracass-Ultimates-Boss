// =====================================================================
// MANIFESTE DE RÉMI : ses visuels et sons (et seulement les siens).
// Fichiers à venir dans assets/sprites/remi/ et assets/audio/remi/ (voir propositions/remi_prompts_images.md).
// =====================================================================
const son = (nom, frequence, duree) => ({ fichier: `audio/remi/remi_${nom}.wav`, provisoire: { frequence, duree } });

export const MANIFESTE = {
  images: {
    // outils/remi/preparer_images.py : planche de assets_inbox/remi/ détourée et découpée
    // vélo de profil : 6 poses de pédalage, saut, chute (posées en bas, centrées)
    remi_velo: { fichier: 'sprites/remi/remi_velo.png', largeur: 266, hauteur: 296, images: 8, vitesse: 10 },
    // la porte, de profil : Rémi garde / coup / impact, toi garde / coup / impact (alignées sur le pied arrière)
    remi_porte: { fichier: 'sprites/remi/remi_porte.png', largeur: 344, hauteur: 562, images: 6, vitesse: 1 },
    // les bourrés du vélo : debout (titube), sursaute (sonnette), allongé (bouteilles), traverse de face
    remi_bourres: { fichier: 'sprites/remi/remi_bourres.png', largeur: 495, hauteur: 559, images: 4, vitesse: 1 },
    // le fond de rue de nuit (répétable), derrière le vélo
    remi_rue: { fichier: 'sprites/remi/remi_rue.jpg', largeur: 1702, hauteur: 575, images: 1, vitesse: 1 },
    // la façade du bar (arrivée du vélo)
    remi_bar_facade: { fichier: 'sprites/remi/remi_bar_facade.png', largeur: 762, hauteur: 917, images: 1, vitesse: 1 },
    // fond du jeu de la porte (toilettes du bar) : sa porte est à x 774 - 914 (voir BATTANT dans RemiPorte.js)
    remi_porte_decor: { fichier: 'sprites/remi/remi_porte_decor.jpg', largeur: 960, hauteur: 536, images: 1, vitesse: 1 },
    // la porte VUE DE DOS : Rémi (garde, coup, impact) et toi (garde, élan, coup, impact), cases alignées à gauche
    remi_dos: { fichier: 'sprites/remi/remi_dos.png', largeur: 344, hauteur: 535, images: 3, vitesse: 1 },
    remi_toi_dos: { fichier: 'sprites/remi/remi_toi_dos.png', largeur: 335, hauteur: 557, images: 3, vitesse: 1 },
    // V7 : décors et objets du vélo(outils/remi/preparer_images.py)
    remi_rue2: { fichier: 'sprites/remi/remi_rue2.jpg', largeur: 1702, hauteur: 575, images: 1, vitesse: 1 },   // les quais
    remi_rue3: { fichier: 'sprites/remi/remi_rue3.jpg', largeur: 1132, hauteur: 575, images: 1, vitesse: 1 },   // le centre-ville
    remi_tremplin: { fichier: 'sprites/remi/remi_tremplin.png', largeur: 1114, hauteur: 459, images: 1, vitesse: 1 },
    remi_voitures: { fichier: 'sprites/remi/remi_voitures.png', largeur: 434, hauteur: 213, images: 3, vitesse: 1 },  // citadine, berline, camionnette
    remi_accueil: { fichier: 'sprites/remi/remi_accueil.png', largeur: 501, hauteur: 1207, images: 1, vitesse: 1 },  // Rémi qui t'attend au bar
    // V19 babyfoot : Rémi de face derrière la table (attend, penché à gauche de l'écran, à droite, roulette, marque, boit, râle),
    // cases alignées en haut (casquette) ; et le bar avec le néon BABYFOOT
    remi_baby: { fichier: 'sprites/remi/remi_baby.png', largeur: 403, hauteur: 436, images: 7, vitesse: 1 },
    // V19i figurines (outils/remi/preparer_images.py, figurines_baby) : ton gardien de dos (immobile, frappe) ;
    // joueur de Rémi de face (immobile, armé, barre levée, roulette) ; cases alignées en bas (socle)
    remi_baby_toi: { fichier: 'sprites/remi/remi_baby_toi.png', largeur: 152, hauteur: 247, images: 2, vitesse: 1 },
    remi_baby_rouges: { fichier: 'sprites/remi/remi_baby_rouges.png', largeur: 228, hauteur: 248, images: 4, vitesse: 1 },
    remi_bar_babyfoot: { fichier: 'sprites/remi/remi_bar_babyfoot.jpg', largeur: 960, hauteur: 536, images: 1, vitesse: 1 },
    remi_bar_interieur: { fichier: 'sprites/remi/remi_bar_interieur.jpg', largeur: 960, hauteur: 536, images: 1, vitesse: 1 },
    // le videur de la porte : distrait, furieux (coupé à la taille)
    remi_videur: { fichier: 'sprites/remi/remi_videur.png', largeur: 672, hauteur: 743, images: 2, vitesse: 1 },
    // l'autre intrus de la porte : le gars qui vient pisser (distrait / furieux, coupé à la taille)
    // (V17 : la mamie n'est plus chargée — 1,2 Mo pour rien ; son image reste dans assets/ si on la remet)
    remi_pisseur: { fichier: 'sprites/remi/remi_pisseur.png', largeur: 548, hauteur: 756, images: 2, vitesse: 1 },
    // vélo (V15) : poubelle, pinte, verre cassé, flaque ; le pêcheur (canne tendue / relevée) ; la chorale (chante / sursaute)
    remi_obstacles: { fichier: 'sprites/remi/remi_obstacles.png', largeur: 343, hauteur: 382, images: 4, vitesse: 1 },
    remi_pecheur: { fichier: 'sprites/remi/remi_pecheur.png', largeur: 767, hauteur: 731, images: 2, vitesse: 1 },
    remi_chorale: { fichier: 'sprites/remi/remi_chorale.png', largeur: 665, hauteur: 648, images: 2, vitesse: 1 },
    remi_presentation: { fichier: 'sprites/remi/remi_presentation.png', largeur: 832, hauteur: 1202, images: 1, vitesse: 1 },
  },
  sons: {
    // musique du vélo (F-Zero, « Big Blue », donnée par le propriétaire)
    remi_musique_velo: { fichier: 'audio/remi/remi_musique_velo.mp3', musique: true, volume: 0.4 },
    // musique de la porte (Street Fighter II, thème de Ken, donnée par le propriétaire) : se coupe quand le videur regarde
    remi_musique_porte: { fichier: 'audio/remi/remi_musique_porte.mp3', musique: true, volume: 0.45 },
    // musique du babyfoot (Captain Tsubasa / Olive et Tom, thème principal, donnée par le propriétaire)
    remi_musique_baby: { fichier: 'audio/remi/remi_musique_baby.mp3', musique: true, volume: 0.4 },
    // (remi_musique_bar.mp3, Star Wars « Cantina Band », n'est plus jouée depuis le babyfoot : fichier gardé, plus chargé)
    // bruitages générés au code : python3 outils/remi/generer_sons.py assets/audio/remi (bip de secours si le fichier manque)
    remi_sonnette: son('sonnette', 1760, 0.18),
    remi_saut: son('saut', 520, 0.06),
    remi_atterrit: son('atterrit', 180, 0.05),
    remi_chute: son('chute', 90, 0.3),
    remi_crevaison: son('crevaison', 140, 0.25),
    remi_glisse: son('glisse', 300, 0.2),
    remi_esquive: son('esquive', 600, 0.12),
    remi_texto: son('texto', 1320, 0.07),
    remi_pinte: son('pinte', 990, 0.08),
    remi_arrivee: son('arrivee', 880, 0.35),
    remi_lance: son('lance', 700, 0.04),
    remi_rebond: son('rebond', 1100, 0.03),
    remi_plouf: son('plouf', 260, 0.15),
    remi_hips: son('hips', 500, 0.08),
    remi_boit: son('boit', 200, 0.3),
    remi_foule: son('foule', 300, 0.4),
    remi_tape: son('tape', 400, 0.03),
    remi_porte: son('porte', 120, 0.18),
    remi_porte_fort: son('porte_fort', 70, 0.4),
    remi_scratch: son('scratch', 300, 0.2),
  },
};
