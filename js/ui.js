import { gameState } from './gameState.js';

const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const hintElement = document.getElementById('hint');
const timerElement = document.getElementById('timer');

const overlaySound = new Audio('assets/sounds/overlay.mp3');
const bonusSound = new Audio('assets/sounds/bonus.mp3');

export function updateScoreDisplay(score) {
  if (scoreElement) scoreElement.textContent = score;
}

export function updateLevelDisplay(level) {
  if (levelElement) levelElement.textContent = level;
}

export function updateHintDisplay(hints) {
  if (hintElement) hintElement.textContent = `💡${hints}`;
}

export function updateTimerDisplay(seconds) {
  if (!timerElement) return;
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  timerElement.textContent = `⏱️ ${m}:${s}`;
}

export function showBonusOverlay(message) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay fade-in';

  const modal = document.createElement('div');
  modal.className = 'modal slide-down';
  modal.innerHTML = `
    <h2>🎁 Thông báo</h2>
    <p>${message}</p>
    <button class="settings-btn">Tiếp tục</button>
  `;

  if (gameState.settings?.sound) {
    overlaySound.currentTime = 0;
    overlaySound.play().catch(() => {});
  }

  modal.querySelector('button').onclick = () => {
    modal.classList.add('slide-up');
    overlay.classList.remove('fade-in');
    overlay.classList.add('fade-out');
    setTimeout(() => document.body.removeChild(overlay), 300);
  };

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

export function showLevelRewardOverlay({ reward, hintGain, timeBonus }) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay fade-in';

  const modal = document.createElement('div');
  modal.className = 'modal slide-down';
  modal.innerHTML = `
    <h2>🎉 Thưởng qua màn!</h2>
    <p>⭐ +${reward} điểm</p>
    <p>💡 +${hintGain} gợi ý</p>
    <p>⏱️ +${timeBonus} giây</p>
    <button class="settings-btn">Tiếp tục</button>
  `;

  if (gameState.settings?.sound) {
    bonusSound.currentTime = 0;
    bonusSound.play().catch(() => {});
  }

  modal.querySelector('button').onclick = () => {
    modal.classList.add('slide-up');
    overlay.classList.remove('fade-in');
    overlay.classList.add('fade-out');
    setTimeout(() => document.body.removeChild(overlay), 300);
  };

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}
