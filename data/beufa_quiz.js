// LE QUIZ DE BEUFA — tout le texte est ici : modifie-le librement (sans toucher au code).
// QUESTIONS : la 1re réponse de chaque liste est la BONNE (le jeu mélange l'ordre à l'affichage).
// Le jeu en tire 10 au hasard à chaque partie (60 questions depuis la V92).
export const QUESTIONS = [
  { q: 'Dans Donkey Kong (1981), comment s\'appelait Mario ?', r: ['Jumpman', 'Mister Video', 'Plumber Man', 'Super Guy'] },
  { q: 'Quelle entreprise a créé Sonic ?', r: ['Sega', 'Nintendo', 'Capcom', 'Atari'] },
  { q: 'Qui est le créateur de la saga Metal Gear ?', r: ['Hideo Kojima', 'Shigeru Miyamoto', 'Hironobu Sakaguchi', 'Yuji Naka'] },
  { q: 'En quelle année la première PlayStation est-elle sortie au Japon ?', r: ['1994', '1991', '1996', '1998'] },
  { q: 'Comment s\'appelle le royaume de la saga Zelda ?', r: ['Hyrule', 'Termina', 'Kanto', 'Le Royaume Champignon'] },
  { q: 'Lequel n\'est PAS un fantôme de Pac-Man ?', r: ['Sparky', 'Blinky', 'Pinky', 'Clyde'] },
  { q: 'Quel jeu a été créé par Markus « Notch » Persson ?', r: ['Minecraft', 'Terraria', 'Roblox', 'Fortnite'] },
  { q: 'Qui a inventé Tetris ?', r: ['Alexeï Pajitnov', 'Hideo Kojima', 'Satoru Iwata', 'John Romero'] },
  { q: 'Quel Pokémon porte le numéro 001 du Pokédex ?', r: ['Bulbizarre', 'Pikachu', 'Salamèche', 'Mew'] },
  { q: 'Master Chief est le héros de quelle saga ?', r: ['Halo', 'Gears of War', 'Call of Duty', 'Destiny'] },
  { q: 'Lara Croft est l\'héroïne de quelle saga ?', r: ['Tomb Raider', 'Uncharted', 'Prince of Persia', 'Resident Evil'] },
  { q: 'Dans quel jeu entend-on « The cake is a lie » ?', r: ['Portal', 'Half-Life 2', 'BioShock', 'Fallout 3'] },
  { q: 'Quel studio a développé The Witcher 3 ?', r: ['CD Projekt Red', 'Ubisoft', 'BioWare', 'Bethesda'] },
  { q: 'De quel jeu vient le cri « Finish him ! » ?', r: ['Mortal Kombat', 'Street Fighter II', 'Tekken', 'Soulcalibur'] },
  { q: 'Sur quelle île se déroule Metal Gear Solid (1998) ?', r: ['Shadow Moses', 'Outer Heaven', 'Zanzibar Land', 'Big Shell'] },
  { q: 'Pour battre Psycho Mantis dans MGS1, il faut…', r: ['brancher la manette sur le port 2', 'éteindre la console', 'retirer la carte mémoire', 'jouer les yeux fermés'] },
  { q: 'Quel est le premier Mario en 3D ?', r: ['Super Mario 64', 'Super Mario Sunshine', 'Super Mario Galaxy', 'Super Mario World'] },
  { q: 'Dans quelle saga collecte-t-on les Émeraudes du Chaos ?', r: ['Sonic', 'Mega Man', 'Crash Bandicoot', 'Spyro'] },
  { q: 'Qui est le grand méchant de la saga Zelda ?', r: ['Ganondorf', 'Bowser', 'Dr. Wily', 'Ridley'] },
  { q: 'Quel studio a créé Half-Life ?', r: ['Valve', 'id Software', 'Epic Games', 'Blizzard'] },
  { q: 'Kratos est le héros de quelle saga ?', r: ['God of War', 'Devil May Cry', 'Bayonetta', 'Dark Souls'] },
  { q: 'Dans Street Fighter, que crie Ryu en lançant sa boule de feu ?', r: ['Hadoken !', 'Shoryuken !', 'Sonic Boom !', 'Yoga Fire !'] },
  { q: 'Que veut dire « GTA » ?', r: ['Grand Theft Auto', 'Great Turbo Arena', 'Grand Tactical Action', 'Gangster Town Assault'] },
  { q: 'Dans Minecraft, quelle créature explose près de toi ?', r: ['Le Creeper', 'L\'Enderman', 'Le Zombie', 'Le Squelette'] },
  { q: 'Sur quelle console est sorti Zelda : Ocarina of Time ?', r: ['Nintendo 64', 'GameCube', 'Super Nintendo', 'Wii'] },
  { q: 'Quelle entreprise a sorti Pong en 1972 ?', r: ['Atari', 'Nintendo', 'Sega', 'Namco'] },
  { q: 'Quel studio a créé Dark Souls ?', r: ['FromSoftware', 'Capcom', 'Square Enix', 'Konami'] },
  { q: 'Comment s\'appelle le frère de Mario ?', r: ['Luigi', 'Wario', 'Toad', 'Yoshi'] },
  { q: 'En quelle année la Game Boy est-elle sortie au Japon ?', r: ['1989', '1985', '1993', '1996'] },
  { q: 'Dans Metal Gear, où Snake aime-t-il se cacher ?', r: ['Dans un carton', 'Dans un tonneau', 'Dans une poubelle', 'Dans un frigo'] },
  // V92 : 30 questions de plus (60 au total : on retombe moins vite sur les mêmes)
  { q: 'Comment s\'appelle le dinosaure vert, ami de Mario ?', r: ['Yoshi', 'Birdo', 'Rex', 'Dino'] },
  { q: 'Dans quel jeu incarne-t-on Cloud Strife ?', r: ['Final Fantasy VII', 'Chrono Trigger', 'Dragon Quest VIII', 'Xenogears'] },
  { q: 'Avec quelle console Wii Sports était-il vendu ?', r: ['Wii', 'Wii U', 'GameCube', 'Switch'] },
  { q: 'Quel héros de Capcom combat les robots du Dr. Wily ?', r: ['Mega Man', 'Strider', 'Arthur', 'Viewtiful Joe'] },
  { q: 'Dans quel jeu visite-t-on Rapture, une ville sous la mer ?', r: ['BioShock', 'Subnautica', 'Dead Space', 'SOMA'] },
  { q: 'Qui est le héros de Half-Life ?', r: ['Gordon Freeman', 'Isaac Clarke', 'Duke Nukem', 'Sam Fisher'] },
  { q: 'Quelle console portable avait deux écrans, dont un tactile ?', r: ['Nintendo DS', 'Game Boy Advance', 'PSP', 'Game Gear'] },
  { q: 'Dans quelle région se passe Pokémon Rouge et Bleu ?', r: ['Kanto', 'Johto', 'Hoenn', 'Sinnoh'] },
  { q: 'Qui est l\'ennemi juré de Sonic ?', r: ['Le Dr. Eggman (Robotnik)', 'Le Dr. Wily', 'Bowser', 'Knuckles'] },
  { q: 'Quel jeu de Blizzard se déroule en Azeroth ?', r: ['World of Warcraft', 'Diablo', 'StarCraft', 'Overwatch'] },
  { q: 'Dans quelle saga cherche-t-on la Triforce ?', r: ['Zelda', 'Metroid', 'Fire Emblem', 'Kirby'] },
  { q: 'Qui est l\'héroïne de Metroid ?', r: ['Samus Aran', 'Lara Croft', 'Jill Valentine', 'Bayonetta'] },
  { q: 'Que mange Pac-Man pour pouvoir manger les fantômes ?', r: ['Une super pac-gomme', 'Une cerise', 'Une étoile', 'Un champignon'] },
  { q: 'Sur quelle console est sorti Super Mario Bros. (1985) ?', r: ['NES', 'Master System', 'Atari 2600', 'Super Nintendo'] },
  { q: 'Où commence Resident Evil (1996) ?', r: ['Dans un manoir', 'Dans un commissariat', 'Dans un village', 'Sur un paquebot'] },
  { q: 'Quelle mascotte de PlayStation est un bandicoot ?', r: ['Crash', 'Spyro', 'Ratchet', 'Sly'] },
  { q: 'Dans Mario Kart, quel objet fonce sur le PREMIER ?', r: ['La carapace bleue', 'La carapace rouge', 'La carapace verte', 'La banane'] },
  { q: 'Quel est le vrai prénom de Solid Snake ?', r: ['David', 'Jack', 'John', 'Adam'] },
  { q: 'Qui a créé Mario ?', r: ['Shigeru Miyamoto', 'Hideo Kojima', 'Yu Suzuki', 'Satoru Iwata'] },
  { q: 'Dans quel jeu affronte-t-on 16 colosses géants ?', r: ['Shadow of the Colossus', 'Ico', 'Monster Hunter', 'Dark Souls'] },
  { q: 'Quelle a été la DERNIÈRE console de salon de Sega ?', r: ['Dreamcast', 'Saturn', 'Mega Drive', 'Master System'] },
  { q: 'Dans Street Fighter II, de quel pays vient Chun-Li ?', r: ['La Chine', 'Le Japon', 'La Corée', 'La Thaïlande'] },
  { q: 'Quel jeu d\'id Software (1993) a lancé la mode des FPS ?', r: ['Doom', 'Quake', 'Duke Nukem 3D', 'Half-Life'] },
  { q: 'Quelle princesse Mario doit-il sauver de Bowser ?', r: ['Peach', 'Zelda', 'Daisy', 'Harmonie'] },
  { q: 'Dans Tetris, combien de carrés forment chaque pièce ?', r: ['4', '3', '5', '6'] },
  { q: 'De quelle couleur est la tunique de Link ?', r: ['Verte', 'Bleue', 'Rouge', 'Violette'] },
  { q: 'Dans quel jeu les personnages parlent-ils le « simlish » ?', r: ['Les Sims', 'SimCity', 'Animal Crossing', 'Second Life'] },
  { q: 'Comment s\'appelle l\'intelligence artificielle de Portal ?', r: ['GLaDOS', 'HAL 9000', 'SHODAN', 'Cortana'] },
  { q: 'Dans quelle saga de Capcom chasse-t-on des monstres géants ?', r: ['Monster Hunter', 'Dino Crisis', 'Lost Planet', 'Onimusha'] },
  { q: 'Comment s\'appelle le renard à deux queues, ami de Sonic ?', r: ['Tails', 'Knuckles', 'Shadow', 'Amy'] },
];

// L'INTRO : Beufa, masqué, « lit dans tes pensées » (on en tire 4 au hasard, après la 1re phrase)
export const LECTURE_DEBUT = 'Approche… Je lis dans tes pensées…';
export const LECTURES = [
  'Je sais que tu as déjà joué à Mario. Ne mens pas.',
  'Je sais que tu es allé au Rustik… te faire défoncer par des orcs.',
  'Je sais que tu as déjà dit « encore une partie »… à 3 heures du matin.',
  'Je sais que tu as déjà soufflé dans une cartouche pour qu\'elle marche.',
  'Je sais que tu as déjà accusé la manette après avoir perdu.',
  'Je sais que tu as déjà coupé le son d\'un jeu parce que tu avais peur.',
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
