/**
 * Localization (English default + automatic Vietnamese detection via YouTube SDK)
 */
(function (global) {
  'use strict';

  const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const STRINGS = {
    en: {
      levelChest: 'Level Chest',
      tapToOpen: 'TAP TO OPEN!',
      dailyPuzzle: 'Daily Puzzle',
      play: 'Play',
      playedToday: 'Solved ✓',
      freePlay: 'Free Play',
      navMain: 'Main',
      navDaily: 'Daily',
      navShop: 'Shop',
      navGoals: 'Goals',
      shop: 'Shop',
      dots: 'Dots',
      backgrounds: 'Backgrounds',
      used: 'Used',
      use: 'Use',
      buyHintsTitle: '+3 Hints Pack',
      buyHintsSub: 'Get unstuck anytime',
      goals: 'Goals',
      claim: 'Claim',
      claimed: 'Done',
      random: 'Random',
      level: 'LEVEL',
      randomLevel: 'RANDOM',
      dailyTitle: 'DAILY PUZZLE',
      restart: 'RESTART',
      hint: 'HINT',
      undo: 'UNDO',
      perfect: 'PERFECT!',
      levelComplete: 'LEVEL COMPLETE!',
      completedInMoves: (m) => `Completed in ${m} moves`,
      replay: 'Replay',
      nextLevel: 'Next Level',
      newRandom: 'New Puzzle',
      chestTitle: 'LEVEL CHEST!',
      chestDesc: 'Awesome progress! Here is your reward:',
      paused: 'PAUSED',
      resume: 'Resume',
      tutorialDrag: 'Drag from a dot to link matching colors',
      tutorialFill: 'Fill 100% of the board to win!',
      noHints: 'Not enough hints — grab more in Shop!',
      formatDate(d) {
        return `${d.getDate()} ${MONTHS_EN[d.getMonth()]}`;
      },
      packs: {
        '5x5': { name: '5×5 Classic', desc: 'Warm up & learn the flow' },
        '6x6': { name: '6×6 Medium', desc: 'Balanced puzzles with obstacles' },
        '7x7': { name: '7×7 Tricky', desc: 'More colors, tighter paths' },
        '8x8': { name: '8×8 Expert', desc: 'Deep spatial challenge' },
        '9x9': { name: '9×9 Master', desc: 'Ultimate neon grid' }
      }
    },
    vi: {
      levelChest: 'Rương Cấp Độ',
      tapToOpen: 'BẤM ĐỂ MỞ!',
      dailyPuzzle: 'Câu Đố Hôm Nay',
      play: 'Chơi',
      playedToday: 'Đã giải ✓',
      freePlay: 'Chơi Tự Do',
      navMain: 'Trang chủ',
      navDaily: 'Hàng ngày',
      navShop: 'Cửa hàng',
      navGoals: 'Mục tiêu',
      shop: 'Cửa hàng',
      dots: 'Hình chấm',
      backgrounds: 'Hình nền',
      used: 'Đang dùng',
      use: 'Trang bị',
      buyHintsTitle: 'Gói +3 Gợi ý',
      buyHintsSub: 'Mở đường nhanh khi bí',
      goals: 'Mục tiêu',
      claim: 'Nhận',
      claimed: 'Xong',
      random: 'Ngẫu nhiên',
      level: 'MÀN',
      randomLevel: 'NGẪU NHIÊN',
      dailyTitle: 'CÂU ĐỐ HÔM NAY',
      restart: 'CHƠI LẠI',
      hint: 'GỢI Ý',
      undo: 'LÙI',
      perfect: 'HOÀN HẢO!',
      levelComplete: 'QUA MÀN!',
      completedInMoves: (m) => `Hoàn thành trong ${m} bước`,
      replay: 'Chơi lại',
      nextLevel: 'Màn tiếp',
      newRandom: 'Màn mới',
      chestTitle: 'MỞ RƯƠNG!',
      chestDesc: 'Quá đỉnh! Phần thưởng dành cho bạn:',
      paused: 'TẠM DỪNG',
      resume: 'Tiếp tục',
      tutorialDrag: 'Kéo từ 1 chấm để nối 2 chấm cùng màu',
      tutorialFill: 'Lấp kín 100% ô trên bảng để thắng!',
      noHints: 'Hết gợi ý — vào Cửa hàng đổi thêm nhé!',
      formatDate(d) {
        return `${d.getDate()} Tháng ${d.getMonth() + 1}`;
      },
      packs: {
        '5x5': { name: '5×5 Cơ bản', desc: 'Làm quen luật chơi cực nhanh' },
        '6x6': { name: '6×6 Trung bình', desc: 'Có thêm ô chướng ngại vật' },
        '7x7': { name: '7×7 Khó', desc: 'Nhiều màu hơn, đường đi chặt hơn' },
        '8x8': { name: '8×8 Cao thủ', desc: 'Tư duy không gian nâng cao' },
        '9x9': { name: '9×9 Bậc thầy', desc: 'Lưới neon thử thách cực đại' }
      }
    }
  };

  let currentLang = 'en';

  const I18N = {
    setLanguage(localeStr) {
      currentLang = (localeStr && String(localeStr).toLowerCase().startsWith('vi')) ? 'vi' : 'en';
      document.documentElement.lang = currentLang;
    },
    getLanguage() {
      return currentLang;
    },
    t(key, arg) {
      const dict = STRINGS[currentLang] || STRINGS.en;
      const val = dict[key] !== undefined ? dict[key] : STRINGS.en[key];
      return typeof val === 'function' ? val(arg) : val;
    },
    pack(id) {
      const dict = STRINGS[currentLang] || STRINGS.en;
      return (dict.packs && dict.packs[id]) || STRINGS.en.packs[id];
    }
  };

  global.I18N = I18N;
})(window);
