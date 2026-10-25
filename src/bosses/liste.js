// Liste des boss, dans l'ordre des portes du hub (de gauche à droite).
// Ajouter un boss terminé = mettre pret: true dans SON fichier index.js.
import beufa from './beufa/index.js';
import kedric from './kedric/index.js';
import julien from './julien/index.js';
import greg from './greg/index.js';
import remi from './remi/index.js';
import lionel from './lionel/index.js';
import modele from './modele/index.js';

export const BOSS = [beufa, kedric, julien, greg, remi, lionel];

// Boss "modèle" : pas de porte dans le hub, seulement dans le menu de test (F1).
// Sert d'exemple pour créer un nouveau boss.
export const MODELE = modele;
