// LE QUIZ DE BEUFA — tout le texte est ici : modifie-le librement (sans toucher au code).
// QUESTIONS : la 1re réponse de chaque liste est la BONNE (le jeu mélange l'ordre à l'affichage).
// Le jeu en tire 10 au hasard à chaque partie. V100 : les 44 questions corrigées par Fabien (Quizz.docx).
export const QUESTIONS = [
  { q: 'Dans Donkey Kong (1981), comment s\'appelait Mario ?', r: ['Jumpman', 'Mister Video', 'Plumber Man', 'Super Guy'] },
  { q: 'Qui est le créateur de la saga Metal Gear ?', r: ['Hideo Kojima', 'Shigeru Miyamoto', 'Hironobu Sakaguchi', 'Yuji Naka'] },
  { q: 'En quelle année la première PlayStation est-elle sortie au Japon ?', r: ['1994', '1991', '1996', '1998'] },
  { q: 'Lequel n\'est PAS un fantôme de Pac-Man ?', r: ['Sparky', 'Blinky', 'Pinky', 'Clyde'] },
  { q: 'Quel jeu a été créé par Markus « Notch » Persson ?', r: ['Minecraft', 'Terraria', 'Roblox', 'Fortnite'] },
  { q: 'Qui a inventé Tetris ?', r: ['Alexeï Pajitnov', 'Hideo Kojima', 'Satoru Iwata', 'John Romero'] },
  { q: 'Quel Pokémon porte le numéro 001 du Pokédex ?', r: ['Bulbizarre', 'Pikachu', 'Salamèche', 'Mew'] },
  { q: 'Dans quel jeu entend-on « The cake is a lie » ?', r: ['Portal', 'Half-Life 2', 'BioShock', 'Fallout 3'] },
  { q: 'Quel studio a développé The Witcher 3 ?', r: ['CD Projekt Red', 'Ubisoft', 'BioWare', 'Bethesda'] },
  { q: 'Sur quelle île se déroule Metal Gear Solid (1998) ?', r: ['Shadow Moses', 'Outer Heaven', 'Zanzibar Land', 'Big Shell'] },
  { q: 'Pour battre Psycho Mantis dans MGS1, il faut…', r: ['brancher la manette sur le port 2', 'éteindre la console', 'retirer la carte mémoire', 'jouer les yeux fermés'] },
  { q: 'Quel studio a créé Half-Life ?', r: ['Valve', 'id Software', 'Epic Games', 'Blizzard'] },
  { q: 'Dans Street Fighter, que crie Ryu en lançant sa boule de feu ?', r: ['Hadoken !', 'Hadouken !', 'Hadooookeine!', 'Va te faire 🤬 ken!'] },
  { q: 'Que veut dire « GTA » ?', r: ['Grand Theft Auto', 'Great Turbo Arena', 'Grand Tactical Action', 'Gangster Town Assault'] },
  { q: 'Dans Minecraft, quelle créature explose près de toi ?', r: ['Le Creeper', 'L\'Enderman', 'Le Zombie', 'Le Squelette'] },
  { q: 'Quelle entreprise a sorti Pong en 1972 ?', r: ['Atari', 'Nintendo', 'Sega', 'Namco'] },
  { q: 'Quel studio a créé Dark Souls ?', r: ['FromSoftware', 'Capcom', 'Square Enix', 'Konami'] },
  { q: 'Comment s\'appelle le frère de Mario ?', r: ['Luigi', 'Wario', 'Toad', 'Yoshi'] },
  { q: 'En quelle année la Game Boy est-elle sortie au Japon ?', r: ['1989', '1985', '1993', '1996'] },
  { q: 'Dans quel jeu incarne-t-on Cloud Strife ?', r: ['Final Fantasy VII', 'Chrono Trigger', 'Dragon Quest VIII', 'Xenogears'] },
  { q: 'Avec quelle console Wii Sports était-il vendu ?', r: ['Wii', 'Wii U', 'GameCube', 'Switch'] },
  { q: 'Quel héros de Capcom combat les robots du Dr. Wily ?', r: ['Mega Man', 'Strider', 'Arthur', 'Viewtiful Joe'] },
  { q: 'Dans quel jeu visite-t-on Rapture, une ville sous la mer ?', r: ['BioShock', 'Subnautica', 'Dead Space', 'SOMA'] },
  { q: 'Qui est le héros de Half-Life ?', r: ['Gordon Freeman', 'Isaac Clarke', 'Duke Nukem', 'Sam Fisher'] },
  { q: 'Dans quelle région se passe Pokémon Rouge et Bleu ?', r: ['Kanto', 'Johto', 'Hoenn', 'Sinnoh'] },
  { q: 'Qui est l\'ennemi juré de Sonic ?', r: ['Le Dr Robotnik', 'Le Dr Robotnique', 'Le Dr qui a un robot qui te nique', 'C\'est un désert médical, il n\'y a pas de docteur dans les Sonic'] },
  { q: 'Quel jeu de Blizzard se déroule en Azeroth ?', r: ['World of Warcraft', 'Diablo', 'StarCraft', 'Overwatch'] },
  { q: 'Qui est l\'héroïne de Metroid ?', r: ['Samus Aran', 'Lara Croft', 'Jill Valentine', 'Bayonetta'] },
  { q: 'Que mange Pac-Man pour pouvoir manger les fantômes ?', r: ['Une super pac-gomme', 'Une cerise', 'Une étoile', 'Un champignon'] },
  { q: 'Qui est le premier personnage présenté à la fin de l\'intro de Resident Evil (1996) ?', r: ['Chris Redfield', 'Albert Wesker', 'Jill Valentine', 'Claire Redfield'] },
  { q: 'Quel est le vrai prénom de Solid Snake ?', r: ['David', 'Jack', 'John', 'Adam'] },
  { q: 'Qui a créé Mario ?', r: ['Shigeru Miyamoto', 'Hideo Kojima', 'Yu Suzuki', 'Satoru Iwata'] },
  { q: 'Dans quel jeu affronte-t-on 16 colosses géants ?', r: ['Shadow of the Colossus', 'Ico', 'Monster Hunter', 'Dark Souls'] },
  { q: 'Quelle a été la DERNIÈRE console de salon de Sega ?', r: ['Dreamcast', 'Saturn', 'Mega Drive', 'Master System'] },
  { q: 'Dans Street Fighter II, de quel pays vient Chun-Li ?', r: ['La Chine', 'Le Japon', 'La Corée', 'La Thaïlande'] },
  { q: 'Quel jeu d\'id Software (1993) a lancé la mode des FPS ?', r: ['Doom', 'Quake', 'Duke Nukem 3D', 'Half-Life'] },
  { q: 'Quelle princesse Mario doit-il sauver de Mario land ?', r: ['Daisy', 'Peach', 'Zelda', 'Harmonie'] },
  { q: 'Dans Tetris, combien de carrés forment chaque pièce ?', r: ['4', '3', '5', '6'] },
  { q: 'De quelle couleur est la tunique de Link ?', r: ['Verte', 'Bleue', 'Rouge', 'Violette'] },
  { q: 'Dans quel jeu les personnages parlent-ils le « simlish » ?', r: ['Les Sims', 'SimCity', 'Animal Crossing', 'Second Life'] },
  { q: 'Comment s\'appelle l\'intelligence artificielle de Portal ?', r: ['GLaDOS', 'HAL 9000', 'SHODAN', 'Cortana'] },
  { q: 'Dans quelle saga de Capcom chasse-t-on des monstres géants ?', r: ['Monster Hunter', 'Dino Crisis', 'Lost Planet', 'Onimusha'] },
  { q: 'Comment s\'appelle le renard à deux queues, ami de Sonic ?', r: ['Tails', 'Knuckles', 'Shadow', 'Amy'] },
  { q: 'En toute objectivité, quel est le meilleur Zelda selon moi ?', r: ['Link\'s Awakening', 'Skyward Sword', 'Twilight Princess', 'A link to the past'] },
];

// L'INTRO : Beufa, masqué, « lit dans tes pensées » (on en tire 4 au hasard, après la 1re phrase)
export const LECTURE_DEBUT = 'Approche… Je lis dans tes pensées…';
export const LECTURES = [
  'Je sais que tu as déjà joué à Mario. Ne mens pas.',
  'Je sais que tu es allé au Rustik… te faire défoncer par des orcs.',
  'Je sais que tu as déjà dit « encore une partie »… à 3 heures du matin.',
  'Je sais que tu as déjà soufflé dans une cartouche pour qu\'elle marche.',
  'Je sais que tu as déjà accusé la manette après avoir perdu.',
  'Je sais que tu as déjà regardé l\'écran de ton pote en multijoueur.',
  'Je sais que tu as déjà oublié de sauvegarder… et tout perdu.',
];
export const MASQUE_CHAUD = 'Ouf… il fait trop chaud dans ce masque.';
export const DEBUT_QUIZ = [
  'Bon. Assez joué. Place à mon QUIZ !',
  '10 questions de culture jeu vidéo. 1 minute par question. 3 erreurs… et c\'est GAME OVER.',
];

// LES RÉACTIONS DE BEUFA
export const MOQUERIES = [
  'Ha ! Même un garde aurait su ça.',
  'Retourne jouer à Pong.',
  'Ta culture du jeu vidéo, c\'est un carton vide.',
  'Tu as soufflé trop fort dans la cartouche ?',
  'Raté ! Le Rustik ne t\'a rien appris.',
  'Même Bulbizarre aurait trouvé.',
  'C\'est ça, ton niveau ? Je suis déçu.',
  'Héhé… je l\'avais lu dans tes pensées.',
];
export const TROP_TARD = 'Le temps est écoulé ! Tu t\'es endormi dans ton carton ?';
export const BRAVOS = [
  'Hmpf… correct.',
  'Pas mal… pour un bleu.',
  'Chanceux.',
  'Tu as triché ? Je lis dans tes pensées, je le saurais.',
  'Bien. Mais la suivante est plus dure.',
];
export const VICTOIRE = 'Impossible… Tu connais tes classiques. Le QG est à toi.';
export const GAME_OVER = 'GAME OVER, soldat. Retourne réviser tes classiques.';

// V91 : le CLASSEMENT façon Metal Gear Solid (écran de résultats après la victoire au quiz).
// Points = 10 par bonne réponse (max 100) + infiltration : 50 − 10 par alerte (min 0) − 15 par CONTINUE.
// BIG BOSS seulement si TOUT est parfait : 0 alerte, 10/10, aucun CONTINUE. Sinon, le 1er rang dont le
// minimum est atteint (du meilleur au moins bon).
export const RANG_PARFAIT = { nom: 'BIG BOSS', phrase: 'La légende absolue. Même Beufa te salue.' };
export const RANGS = [
  { min: 140, nom: 'FOX', phrase: 'Un agent d\'élite. Presque parfait.' },
  { min: 130, nom: 'DOBERMAN', phrase: 'Rapide, précis, redoutable.' },
  { min: 120, nom: 'HOUND', phrase: 'Un bon limier. Encore un effort.' },
  { min: 110, nom: 'EAGLE', phrase: 'Tu vois loin, mais tu te fais voir.' },
  { min: 100, nom: 'PUMA', phrase: 'Du talent, mais trop de bruit.' },
  { min: 90, nom: 'CROCODILE', phrase: 'Tu avances… à ta façon.' },
  { min: -999, nom: 'CHICKEN', phrase: 'Tu as eu chaud, soldat. Très chaud.' },
];
