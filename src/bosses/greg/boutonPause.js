// Sur téléphone, pendant le combat de Greg, le bouton pause « II » est rangé en haut à droite
// (au milieu, il cachait le « VS » et le chrono). Il retourne à sa place quand on quitte le combat.
export function rangerBoutonPause(scene) {
  const pause = [...document.querySelectorAll('button')].find(b => b.textContent === 'II');
  if (!pause) return;
  const avant = { left: pause.style.left, right: pause.style.right, transform: pause.style.transform };
  Object.assign(pause.style, { left: 'auto', right: '8px', transform: 'none' });
  scene.events.once('shutdown', () => Object.assign(pause.style, avant));
}
