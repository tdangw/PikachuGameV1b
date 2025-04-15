import { createGrid } from './grid.js';
import {
  updateLevelDisplay,
  updateScoreDisplay,
  updateHintDisplay,
  updateTimerDisplay,
  showBonusOverlay,
  showLevelRewardOverlay,
} from './ui.js';
import { gameState, resetGame } from './gameState.js';
import { applySettingsAndStartGame } from './settings.js';
import { checkLevelComplete, initLogic } from './logic.js';
import { createMainMenu } from './mainmenu.js';

let countdownInterval;

window.onload = () => {
  createMainMenu();
};

export function initializeLevel(level) {
  console.log(`[🧩 INIT] Tạo lưới cho level ${level}`);
  gameState.currentLevel = level;

  const gameContainer = document.getElementById('game-container');
  if (gameContainer) gameContainer.style.display = 'flex';

  // ✅ Nếu remainingTime chưa có, gán mặc định 600s
  if (typeof gameState.remainingTime !== 'number') {
    gameState.remainingTime = 600;
  }

  updateLevelDisplay(level);
  updateScoreDisplay(gameState.score);
  updateHintDisplay(gameState.hints || 0);
  updateTimerDisplay(gameState.remainingTime);

  const audio = document.getElementById('bg-music');
  if (audio && gameState.settings?.sound && gameState.settings.bgMusic) {
    audio.src = `assets/sounds/${gameState.settings.bgMusic}`;
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().catch((err) => console.warn('Không thể phát nhạc:', err));
  }

  const gridSize = Math.min(level, 12);
  createGrid(gridSize);
  initLogic();
  startCountdown();

  if (level > 1) {
    handleLevelReward();
  }
}

function startCountdown() {
  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    gameState.remainingTime--;
    updateTimerDisplay(gameState.remainingTime);

    if (gameState.remainingTime <= 0) {
      clearInterval(countdownInterval);
      handleTimeUp();
    }
  }, 1000);
}

function handleTimeUp() {
  showBonusOverlay('⏰ Hết giờ! Bạn đã thua!');
}

function handleLevelReward() {
  const level = gameState.currentLevel;
  const remainingTime = gameState.remainingTime || 0;
  const hintsUsed = 0;

  const base = 50;
  const levelBonus = level * 5;
  const timeBonus = Math.floor(remainingTime / 10);
  const hintBonus = Math.max(0, 3 - hintsUsed) * 10;

  const reward = base + levelBonus + timeBonus + hintBonus;
  const hintGain = Math.ceil(level / 2);

  gameState.score += reward;
  gameState.hints += hintGain;
  gameState.remainingTime += 60;

  updateScoreDisplay(gameState.score);
  updateHintDisplay(gameState.hints);

  showLevelRewardOverlay({ reward, hintGain, timeBonus: 60 });
}

export function nextLevel() {
  gameState.currentLevel++;
  console.log(`[📤 nextLevel()] Chuyển sang level ${gameState.currentLevel}`);
  initializeLevel(gameState.currentLevel);
}

function handleHintClick() {
  if (!gameState.hints || gameState.hints <= 0) {
    showBonusOverlay('🚫 Hết lượt gợi ý!');
    return;
  }

  const tiles = document.querySelectorAll('.tile:not(.matched)');
  const tilePairs = {};

  tiles.forEach((tile) => {
    const imageId = tile.dataset.imageId;
    if (!tilePairs[imageId]) {
      tilePairs[imageId] = [tile];
    } else {
      tilePairs[imageId].push(tile);
    }
  });

  for (let imageId in tilePairs) {
    if (tilePairs[imageId].length >= 2) {
      const [t1, t2] = tilePairs[imageId];
      simulateTileMatch(t1, t2);
      gameState.hints--;
      updateHintDisplay(gameState.hints);
      return;
    }
  }

  showBonusOverlay('😕 Không tìm thấy cặp nào để gợi ý!');
}

function simulateTileMatch(tile1, tile2) {
  const img1 = tile1.querySelector('img');
  const img2 = tile2.querySelector('img');
  if (img1) img1.classList.remove('hidden');
  if (img2) img2.classList.remove('hidden');
  tile1.classList.add('matched');
  tile2.classList.add('matched');
  gameState.score += 20;
  updateScoreDisplay(gameState.score);
  checkLevelComplete();
}

const confirmBtn = document.getElementById('confirm-settings-btn');
if (confirmBtn) {
  confirmBtn.onclick = () => {
    gameState.hints = 30;
    gameState.remainingTime = 600;
    applySettingsAndStartGame();
  };
}

const restartBtn = document.getElementById('btn-restart');
if (restartBtn) {
  restartBtn.onclick = () => {
    resetGame();
    initializeLevel(1);
  };
}

const hintBtn = document.getElementById('btn-hint');
if (hintBtn) {
  hintBtn.onclick = handleHintClick;
}
