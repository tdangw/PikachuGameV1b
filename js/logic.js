import { increaseScore, gameState } from './gameState.js';
import { showBonusOverlay, updateScoreDisplay } from './ui.js';
import { nextLevel } from './main.js';

let selectedTiles = [];

const soundClick = new Audio('assets/sounds/click.mp3');
const soundMatch = new Audio('assets/sounds/match.mp3');
const soundWrong = new Audio('assets/sounds/wrong.mp3');

export function initLogic() {
  const tiles = document.querySelectorAll('.tile');
  tiles.forEach((tile) => {
    tile.onclick = () => handleTileClick(tile);
  });
}

/**
 * Xử lý khi người chơi click vào tile
 */
export function handleTileClick(tileElement) {
  if (gameState.currentLevel > 1 && gameState.isLocked) return;

  const isBonus = tileElement.dataset.isBonus === 'true';
  const imageId = tileElement.dataset.imageId;
  const img = tileElement.querySelector('img');

  // Ngăn double click hoặc click trùng
  if (
    tileElement.classList.contains('matched') ||
    tileElement.classList.contains('selected') ||
    !img
  )
    return;

  // 🎵 Phát âm click nếu bật sound
  if (gameState.settings?.sound) {
    soundClick.currentTime = 0;
    soundClick.play().catch(() => {});
  }

  img.classList.remove('hidden');
  tileElement.classList.add('selected');

  if (isBonus) {
    const bonusPoints = Math.floor(Math.random() * 100) + 1;
    increaseScore(bonusPoints);
    updateScoreDisplay(gameState.score);
    tileElement.classList.add('matched');

    console.log(`[🎁 Bonus] +${bonusPoints} điểm từ ô lẻ ${tileElement.id}`);
    showBonusOverlay(`🎯 Bạn nhận được ${bonusPoints} điểm thưởng!`);
    checkLevelComplete();
  } else {
    selectedTiles.push({ element: tileElement, imageId });
    if (selectedTiles.length === 2) checkMatch();
  }
}

/**
 * So khớp 2 tile được chọn
 */
function checkMatch() {
  const [first, second] = selectedTiles;

  if (first.imageId === second.imageId) {
    first.element.classList.add('matched');
    second.element.classList.add('matched');

    increaseScore(20);
    updateScoreDisplay(gameState.score);

    if (gameState.settings?.sound) {
      soundMatch.currentTime = 0;
      soundMatch.play().catch(() => {});
    }

    console.log(`[✅ Match] ${first.imageId}`);
    checkLevelComplete();
  } else {
    first.element.classList.add('wrong');
    second.element.classList.add('wrong');

    if (gameState.settings?.sound) {
      soundWrong.currentTime = 0;
      soundWrong.play().catch(() => {});
    }

    setTimeout(() => {
      first.element.classList.remove('selected', 'wrong');
      second.element.classList.remove('selected', 'wrong');

      const img1 = first.element.querySelector('img');
      const img2 = second.element.querySelector('img');
      if (img1) img1.classList.add('hidden');
      if (img2) img2.classList.add('hidden');
    }, 800);
  }

  selectedTiles = [];
}

/**
 * Kiểm tra nếu đã matched hết → qua màn
 */
export function checkLevelComplete() {
  const allNormalTiles = document.querySelectorAll(
    '.tile:not([data-is-bonus="true"])'
  );
  const matchedNormalTiles = document.querySelectorAll(
    '.tile.matched:not([data-is-bonus="true"])'
  );
  const bonusTile = document.querySelector('.tile[data-is-bonus="true"]');
  const bonusMatched = bonusTile
    ? bonusTile.classList.contains('matched')
    : true;

  if (allNormalTiles.length === matchedNormalTiles.length && bonusMatched) {
    showBonusOverlay(`🎉 Bạn đã hoàn thành Level ${gameState.currentLevel}!`);
    setTimeout(() => nextLevel(), 600);
  }
}
