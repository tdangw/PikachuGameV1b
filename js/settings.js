import { initializeLevel } from './main.js';
import { gameState } from './gameState.js';
import { createMainMenu } from './mainmenu.js';

const settingsContainer = document.getElementById('settings-container');
const menuContainer = document.getElementById('menu-container');
const audio = document.getElementById('bg-music');

// ⚙️ Cài đặt mặc định
if (!gameState.settings) {
  gameState.settings = {
    mode: 'easy',
  };
}

/**
 * Hiển thị bảng cài đặt và đồng bộ giao diện với gameState
 */
export function showSettingsPanel() {
  settingsContainer.style.display = 'block';
  if (menuContainer) menuContainer.style.display = 'none'; // Ẩn menu chính

  // Toggle âm thanh
  const toggle = document.getElementById('toggle-sound');
  if (toggle) {
    toggle.checked = gameState.settings.sound;
    toggle.onchange = () => {
      gameState.settings.sound = toggle.checked;
      if (!toggle.checked && audio) {
        audio.pause();
      } else {
        // Nếu đã chọn nhạc → play lại
        const selected = document.querySelector(
          'input[name="menu-music"]:checked'
        );
        if (selected && selected.value !== 'none') {
          playMusic(`assets/sounds/${selected.value}`); // Phát nhạc menu
        }
      }
    };
  }

  // Gán radio đã chọn (Menu Music)
  document.querySelectorAll('input[name="menu-music"]').forEach((radio) => {
    radio.checked = radio.value === gameState.settings.menuMusic;
    radio.onchange = () => {
      gameState.settings.menuMusic = radio.value;
      if (gameState.settings.sound && radio.value !== 'none') {
        playMusic(`assets/sounds/${radio.value}`);
      } else {
        audio.pause();
      }
    };
  });

  // Gán radio đã chọn (BG Music)
  document.querySelectorAll('input[name="game-music"]').forEach((radio) => {
    radio.checked = radio.value === gameState.settings.bgMusic;
    radio.onchange = () => {
      gameState.settings.bgMusic = radio.value;
      if (gameState.settings.sound && radio.value !== 'none') {
        playMusic(`assets/sounds/${radio.value}`);
      } else {
        audio.pause();
      }
    };
  });

  // Nếu vẫn còn chọn độ khó theo radio
  document.querySelectorAll('input[name="mode"]').forEach((radio) => {
    radio.checked = radio.value === gameState.settings.mode;
  });
}

/**
 * Nếu dùng confirm-settings-btn
 */
export function applySettingsAndStartGame() {
  const selectedMode =
    document.querySelector('input[name="mode"]:checked')?.value || 'easy';
  gameState.settings.mode = selectedMode;

  let level = 1;
  if (selectedMode === 'normal') level = 4;
  else if (selectedMode === 'hard') level = 12;

  initializeLevel(level);
  settingsContainer.style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
}

/**
 * Phát nhạc theo file
 */
function playMusic(src) {
  if (!audio) return;
  audio.src = src;
  audio.loop = true;
  audio.volume = 0.5;
  audio.play().catch((err) => {
    console.warn('🔇 Không thể phát nhạc:', err);
  });
}

/**
 * Nút quay về menu chính
 */
const backBtn = document.getElementById('btn-back-menu');
if (backBtn) {
  backBtn.onclick = () => {
    settingsContainer.style.display = 'none';
    createMainMenu();
  };
}
