/**
 * Shop Catalog (Dot Skins & Board Backgrounds) + Goals System
 * All visuals are procedurally rendered on Canvas/SVG -> 0 KB external assets!
 */
(function (global) {
  'use strict';

  const DOT_SKINS = [
    { id: 'circle',  nameEn: 'Classic',  nameVi: 'Cổ điển',  currency: 'coins', price: 0 },
    { id: 'house',   nameEn: 'House',    nameVi: 'Ngôi nhà', currency: 'coins', price: 100 },
    { id: 'hex',     nameEn: 'Hexagon',  nameVi: 'Lục giác', currency: 'coins', price: 100 },
    { id: 'diamond', nameEn: 'Diamond',  nameVi: 'Hình thoi',currency: 'coins', price: 150 },
    { id: 'flower',  nameEn: 'Flower',   nameVi: 'Bông hoa', currency: 'coins', price: 200 },
    { id: 'heart',   nameEn: 'Heart',    nameVi: 'Trái tim', currency: 'gems',  price: 20 },
    { id: 'smiley',  nameEn: 'Smiley',   nameVi: 'Mặt cười', currency: 'gems',  price: 35 },
    { id: 'star',    nameEn: 'Star',     nameVi: 'Ngôi sao', currency: 'gems',  price: 50 }
  ];

  const BACKGROUNDS = [
    {
      id: 'midnight',
      nameEn: 'Midnight',
      nameVi: 'Đêm tím',
      currency: 'coins',
      price: 0,
      boardBg: '#0e0b1a',
      gridColor: 'rgba(138, 106, 214, 0.42)',
      hatchColor: 'rgba(138, 106, 214, 0.45)',
      previewCss: 'linear-gradient(145deg, #0e0b1a, #1d1536)'
    },
    {
      id: 'cosmos',
      nameEn: 'Cosmos',
      nameVi: 'Vũ trụ',
      currency: 'coins',
      price: 100,
      boardBg: '#130c29',
      gridColor: 'rgba(168, 85, 247, 0.45)',
      hatchColor: 'rgba(192, 132, 252, 0.48)',
      previewCss: 'radial-gradient(circle at 75% 75%, #3b1d82, #1b0f3b 55%, #0f0820)'
    },
    {
      id: 'crimson',
      nameEn: 'Sunset Peak',
      nameVi: 'Hoàng hôn',
      currency: 'coins',
      price: 150,
      boardBg: '#1c0d14',
      gridColor: 'rgba(244, 114, 114, 0.38)',
      hatchColor: 'rgba(248, 113, 113, 0.45)',
      previewCss: 'linear-gradient(160deg, #5e1d27 0%, #2a1019 55%, #160910 100%)'
    },
    {
      id: 'aurora',
      nameEn: 'Neon Blue',
      nameVi: 'Cực quang',
      currency: 'coins',
      price: 200,
      boardBg: '#091529',
      gridColor: 'rgba(56, 189, 248, 0.42)',
      hatchColor: 'rgba(56, 189, 248, 0.45)',
      previewCss: 'radial-gradient(circle at 60% 35%, #6366f1, #0ea5e9 45%, #091529 100%)'
    },
    {
      id: 'emerald',
      nameEn: 'Emerald',
      nameVi: 'Ngọc lục bảo',
      currency: 'gems',
      price: 25,
      boardBg: '#081b15',
      gridColor: 'rgba(52, 211, 153, 0.4)',
      hatchColor: 'rgba(52, 211, 153, 0.45)',
      previewCss: 'radial-gradient(circle at 50% 50%, #10b981, #065f46 55%, #061813 100%)'
    },
    {
      id: 'amethyst',
      nameEn: 'Amethyst',
      nameVi: 'Thạch anh tím',
      currency: 'gems',
      price: 40,
      boardBg: '#1a0b2e',
      gridColor: 'rgba(216, 180, 254, 0.42)',
      hatchColor: 'rgba(216, 180, 254, 0.48)',
      previewCss: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 55%, #1e0a3c 100%)'
    }
  ];

  const GOALS = [
    { id: 'solve_3',    target: 3,  metric: 'totalSolved', rewardType: 'coins', rewardAmt: 50,  en: 'Complete 3 levels',     vi: 'Hoàn thành 3 màn' },
    { id: 'solve_10',   target: 10, metric: 'totalSolved', rewardType: 'gems',  rewardAmt: 10,  en: 'Complete 10 levels',    vi: 'Hoàn thành 10 màn' },
    { id: 'solve_25',   target: 25, metric: 'totalSolved', rewardType: 'coins', rewardAmt: 150, en: 'Complete 25 levels',    vi: 'Hoàn thành 25 màn' },
    { id: 'perfect_5',  target: 5,  metric: 'perfects',    rewardType: 'hints', rewardAmt: 3,   en: 'Get 5 Perfect clears',  vi: 'Đạt 5 màn Hoàn hảo' },
    { id: 'daily_1',    target: 1,  metric: 'dailySolved', rewardType: 'gems',  rewardAmt: 15,  en: 'Beat a Daily Puzzle',   vi: 'Thắng 1 Daily Puzzle' },
    { id: 'skin_buy',   target: 2,  metric: 'ownedItems',  rewardType: 'coins', rewardAmt: 100, en: 'Unlock a Shop item',    vi: 'Mở khóa 1 vật phẩm Shop' }
  ];

  /**
   * Draw any dot skin centered at (cx, cy) with radius r.
   * Used by both the main Game Canvas and Shop preview thumbnails.
   */
  function drawDotShape(ctx, skinId, cx, cy, r, fillHex, strokeHex) {
    ctx.save();
    ctx.fillStyle = fillHex;
    ctx.strokeStyle = strokeHex || 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = Math.max(1.5, r * 0.11);

    ctx.beginPath();
    switch (skinId) {
      case 'hex': {
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          const x = cx + Math.cos(a) * r * 1.05;
          const y = cy + Math.sin(a) * r * 1.05;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'diamond': {
        ctx.moveTo(cx, cy - r * 1.08);
        ctx.lineTo(cx + r * 1.05, cy);
        ctx.lineTo(cx, cy + r * 1.08);
        ctx.lineTo(cx - r * 1.05, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'house': {
        const w = r * 0.88;
        const h = r * 0.92;
        ctx.moveTo(cx, cy - h * 1.05);
        ctx.lineTo(cx + w * 1.15, cy - h * 0.1);
        ctx.lineTo(cx + w * 0.82, cy - h * 0.1);
        ctx.lineTo(cx + w * 0.82, cy + h * 0.92);
        ctx.lineTo(cx - w * 0.82, cy + h * 0.92);
        ctx.lineTo(cx - w * 0.82, cy - h * 0.1);
        ctx.lineTo(cx - w * 1.15, cy - h * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'star': {
        const spikes = 5;
        const outerR = r * 1.12;
        const innerR = r * 0.52;
        for (let i = 0; i < spikes * 2; i++) {
          const rad = i % 2 === 0 ? outerR : innerR;
          const a = (Math.PI * i) / spikes - Math.PI / 2;
          const x = cx + Math.cos(a) * rad;
          const y = cy + Math.sin(a) * rad;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'heart': {
        const s = r * 0.96;
        ctx.moveTo(cx, cy + s * 0.85);
        ctx.bezierCurveTo(cx - s * 1.35, cy + s * 0.05, cx - s * 1.1, cy - s * 1.05, cx, cy - s * 0.35);
        ctx.bezierCurveTo(cx + s * 1.1, cy - s * 1.05, cx + s * 1.35, cy + s * 0.05, cx, cy + s * 0.85);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'flower': {
        const petals = 6;
        const pr = r * 0.48;
        for (let i = 0; i < petals; i++) {
          const a = (Math.PI * 2 * i) / petals;
          const px = cx + Math.cos(a) * r * 0.52;
          const py = cy + Math.sin(a) * r * 0.52;
          ctx.moveTo(px + pr, py);
          ctx.arc(px, py, pr, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        ctx.fill();
        break;
      }
      case 'smiley': {
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Eyes & smile
        ctx.fillStyle = 'rgba(14, 11, 26, 0.85)';
        ctx.beginPath();
        ctx.arc(cx - r * 0.32, cy - r * 0.2, r * 0.13, 0, Math.PI * 2);
        ctx.arc(cx + r * 0.32, cy - r * 0.2, r * 0.13, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(14, 11, 26, 0.85)';
        ctx.lineWidth = Math.max(1.5, r * 0.13);
        ctx.lineCap = 'round';
        ctx.arc(cx, cy + r * 0.05, r * 0.42, 0.18 * Math.PI, 0.82 * Math.PI);
        ctx.stroke();
        break;
      }
      case 'circle':
      default: {
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }
    }
    ctx.restore();
  }

  global.ShopCatalog = {
    DOT_SKINS,
    BACKGROUNDS,
    GOALS,
    drawDotShape,
    getBg(id) {
      return BACKGROUNDS.find((b) => b.id === id) || BACKGROUNDS[0];
    },
    getDot(id) {
      return DOT_SKINS.find((d) => d.id === id) || DOT_SKINS[0];
    }
  };
})(window);
