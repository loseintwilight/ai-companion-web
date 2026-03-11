import * as PIXI from 'pixi.js';

console.log('[PIXI-Init] ====== PIXI.js 初始化开始 ======');

// 强制设置 SPRITE_MAX_TEXTURES，解决 Electron 环境下 GPU 检测失败问题
if (PIXI.settings.SPRITE_MAX_TEXTURES <= 0) {
  PIXI.settings.SPRITE_MAX_TEXTURES = 32;
  console.log('[PIXI-Init] 设置 SPRITE_MAX_TEXTURES: 32');
}

// 设置批处理大小
PIXI.settings.SPRITE_BATCH_SIZE = 4096;

console.log('[PIXI-Init] ====== PIXI.js 初始化完成 ======');
