/**
 * Live2D 相关类型定义
 * 统一的全局类型声明文件，避免重复声明冲突
 * 
 * 注意：此文件针对 PixiJS 6.x 进行优化
 */

import type * as PIXI from 'pixi.js';

// ============================================================
// Live2D 模型接口定义 - 包含 PIXI.Container 和 Live2D 特有方法
// ============================================================

/**
 * Live2D 模型接口
 * 继承 PIXI.Container（pixi-live2d-display 的 Live2DModel 继承自 Container）
 * Container 继承自 DisplayObject，包含 children、sortableChildren 等容器属性
 */
export interface ILive2DModel extends PIXI.Container {
  // PIXI.Container 核心属性（Container 继承自 DisplayObject）
  // Container 特有属性
  children: PIXI.DisplayObject[];
  sortableChildren: boolean;
  
  // PIXI.DisplayObject 核心属性（显式声明以确保类型正确）
  x: number;
  y: number;
  width: number;
  height: number;
  scale: PIXI.ObservablePoint;
  anchor: PIXI.ObservablePoint;
  rotation: number;
  alpha: number;
  visible: boolean;
  renderable: boolean;
  
  // 交互属性 (PixiJS 6.x)
  interactive: boolean;
  buttonMode: boolean;
  
  // PIXI.DisplayObject 方法
  on: (event: string, fn: (...args: any[]) => void, context?: any) => this;
  once: (event: string, fn: (...args: any[]) => void, context?: any) => this;
  off: (event: string, fn?: (...args: any[]) => void, context?: any) => this;
  emit: (event: string, ...args: any[]) => boolean;
  destroy: (options?: PIXI.IDestroyOptions | boolean) => void;
  
  // Live2D 特有方法
  focus: (x: number, y: number, instant?: boolean) => void;
  motion: (group: string, index: number, options?: IMotionOptions) => Promise<void>;
  expression: (name: string) => Promise<void>;
  speak: (text: string, options?: ISpeakOptions) => Promise<void>;
  
  // Live2D 模型信息
  internalModel?: IInternalModel;
}

/**
 * 动作选项
 */
export interface IMotionOptions {
  priority?: number;
  loop?: boolean;
  fadeIn?: number;
  fadeOut?: number;
  onFinish?: () => void;
}

/**
 * 语音选项
 */
export interface ISpeakOptions {
  volume?: number;
  speed?: number;
  priority?: number;
}

/**
 * Live2D 内部模型接口
 */
export interface IInternalModel {
  coreModel: any;
  motionManager?: IMotionManager;
  settings?: IModelSettings;
  focusController?: any;
}

/**
 * 动作管理器接口
 */
export interface IMotionManager {
  startMotion: (group: string, index: number, priority: number) => Promise<void>;
  startRandomMotion: (group: string, priority: number) => Promise<void>;
  stopAllMotions: () => void;
  expressionManager?: IExpressionManager;
}

/**
 * 表情管理器接口
 */
export interface IExpressionManager {
  setExpression: (name: string) => Promise<void>;
  resetExpression: () => void;
}

/**
 * 模型设置接口
 */
export interface IModelSettings {
  name: string;
  url: string;
  width: number;
  height: number;
  hitAreas: IHitArea[];
  motions: Record<string, IMotionSetting[]>;
  expressions: IExpressionSetting[];
}

/**
 * 点击区域
 */
export interface IHitArea {
  name: string;
  id: string;
}

/**
 * 动作设置
 */
export interface IMotionSetting {
  file: string;
  fadeIn?: number;
  fadeOut?: number;
}

/**
 * 表情设置
 */
export interface IExpressionSetting {
  name: string;
  file: string;
}

// ============================================================
// Live2D 构造器类型
// ============================================================

/**
 * Live2DModel 构造器类型
 */
export interface ILive2DModelConstructor {
  new (): ILive2DModel;
  from: (source: string, options?: ILive2DModelOptions) => Promise<ILive2DModel>;
  registerTicker: (ticker: typeof PIXI.Ticker) => void;
}

/**
 * Live2DModel 加载选项
 */
export interface ILive2DModelOptions {
  autoInteract?: boolean;
  autoFocus?: boolean;
  autoHitTest?: boolean;
  ticker?: PIXI.Ticker;
  resolve?: (url: string) => string;
}

// ============================================================
// PIXI.live2d 命名空间接口
// ============================================================

/**
 * PIXI.live2d 命名空间
 */
export interface ILive2DNamespace {
  Live2DModel: ILive2DModelConstructor;
  Cubism2Model: ILive2DModelConstructor;
  Cubism4Model: ILive2DModelConstructor;
  version: string;
}

// ============================================================
// Cubism 2 SDK 类型定义
// ============================================================

/**
 * Live2D Cubism 2 SDK 接口
 */
export interface ILive2DCubism2SDK {
  init: () => void;
  dispose: () => void;
  setGL: (gl: WebGLRenderingContext) => void;
  getGL: () => WebGLRenderingContext | null;
  getParamFloat: (model: any, param: string) => number;
  setParamFloat: (model: any, param: string, value: number, weight?: number) => void;
}

/**
 * Live2DModelWebGL 构造器
 */
export interface ILive2DModelWebGLConstructor {
  new (): ILive2DModelWebGL;
  loadModel: (buffer: ArrayBuffer) => ILive2DModelWebGL;
}

/**
 * Live2DModelWebGL 实例接口
 */
export interface ILive2DModelWebGL {
  textures: WebGLTexture[];
  setTexture: (index: number, texture: WebGLTexture) => void;
  update: (deltaTime?: number) => void;
  draw: () => void;
  setMatrix: (matrix: Float32Array) => void;
  getCanvasWidth: () => number;
  getCanvasHeight: () => number;
  loadModel: (buffer: ArrayBuffer) => boolean;
  setParamFloat: (paramId: string, value: number) => void;
  setPartsOpacity: (partId: string, opacity: number) => void;
  getParamFloat: (paramId: string) => number;
  getPartsOpacity: (partId: string) => number;
}

/**
 * L2DMatrix44 构造器
 */
export interface IL2DMatrix44Constructor {
  new (): IL2DMatrix44;
}

/**
 * L2DMatrix44 实例
 */
export interface IL2DMatrix44 {
  multScale: (scaleX: number, scaleY: number) => void;
  scale: (scaleX: number, scaleY: number) => void;
  multTranslate: (tx: number, ty: number) => void;
  translate: (tx: number, ty: number) => void;
  mult: (matrix: IL2DMatrix44 | Float32Array) => Float32Array;
  getArray: () => Float32Array;
}

/**
 * Live2DModelMatrix 构造器
 */
export interface ILive2DModelMatrixConstructor {
  new (width: number, height: number): ILive2DModelMatrix;
}

/**
 * Live2DModelMatrix 实例
 */
export interface ILive2DModelMatrix extends IL2DMatrix44 {
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setCenterPosition: (x: number, y: number) => void;
  setPosition: (x: number, y: number) => void;
  setLeft: (x: number) => void;
  setRight: (x: number) => void;
  setTop: (y: number) => void;
  setBottom: (y: number) => void;
}

/**
 * Cubism Core 接口
 */
export interface ILive2DCubismCore {
  Version: string;
  csm: {
    initialize: () => void;
    dispose: () => void;
  };
}

/**
 * Live2DMotion 接口
 */
export interface ILive2DMotion {
  getDurationMSec: () => number;
  getLoopDurationMSec: () => number;
  updateParam: (model: ILive2DModelWebGL, timeMSec: number) => void;
}

/**
 * Live2DMotion 构造器
 */
export interface ILive2DMotionConstructor {
  loadMotion: (buffer: ArrayBuffer) => ILive2DMotion;
}

/**
 * MotionQueueManager 构造器
 */
export interface IMotionQueueManagerConstructor {
  new (): IMotionQueueManager;
}

/**
 * MotionQueueManager 实例
 */
export interface IMotionQueueManager {
  startMotion: (motion: ILive2DMotion, autoDelete: boolean) => number;
  updateParam: (model: ILive2DModelWebGL) => boolean;
  isFinished: () => boolean;
}

/**
 * L2DEyeBlink 构造器
 */
export interface IL2DEyeBlinkConstructor {
  new (): IL2DEyeBlink;
}

/**
 * L2DEyeBlink 实例
 */
export interface IL2DEyeBlink {
  setInterval: (blinkIntervalMsec: number) => void;
  setEyeMotion: (eyeID_L: string, eyeID_R: string) => void;
  updateParam: (model: ILive2DModelWebGL) => void;
}

/**
 * L2DPose 构造器
 */
export interface IL2DPoseConstructor {
  new (): IL2DPose;
}

/**
 * L2DPose 实例
 */
export interface IL2DPose {
  updateParam: (model: ILive2DModelWebGL) => void;
}

/**
 * PhysicsHandler 构造器
 */
export interface IPhysicsHandlerConstructor {
  new (): IPhysicsHandler;
}

/**
 * PhysicsHandler 实例
 */
export interface IPhysicsHandler {
  updateParam: (model: ILive2DModelWebGL) => void;
}

// ============================================================
// 全局 Window 接口扩展 - 只在此处声明一次
// ============================================================

declare global {
  interface Window {
    // PIXI 全局引用 - 用于 pixi-live2d-display
    PIXI: typeof PIXI & {
      live2d?: ILive2DNamespace;
    };
    
    // Live2D Cubism 2 SDK 全局对象
    Live2D: ILive2DCubism2SDK;
    Live2DModelWebGL: ILive2DModelWebGLConstructor;
    Live2DMotion: ILive2DMotionConstructor;
    MotionQueueManager: IMotionQueueManagerConstructor;
    L2DEyeBlink: IL2DEyeBlinkConstructor;
    L2DPose: IL2DPoseConstructor;
    PhysicsHandler: IPhysicsHandlerConstructor;
    L2DMatrix44: IL2DMatrix44Constructor;
    Live2DModelMatrix: ILive2DModelMatrixConstructor;
    
    // Live2D Cubism 4 SDK 全局对象
    Live2DCubismCore?: ILive2DCubismCore;
    LIVE2DCUBISMCORE?: ILive2DCubismCore;
    
    // 全局上下文设置函数
    setLive2DGLContext?: (gl: WebGLRenderingContext) => void;
    waitForLive2DRuntime?: (timeout: number) => Promise<{ cubism2: boolean; cubism4: boolean }>;
    
    // Electron 环境变量
    process: NodeJS.Process & { type?: string };
    
    // Electron API
    electronAPI?: {
      send: (channel: string, data?: unknown) => void;
      receive: (channel: string, callback: (...args: unknown[]) => void) => void;
      invoke: (channel: string, data?: unknown) => Promise<unknown>;
    };
  }
}

// ============================================================
// 模块扩展 - 扩展 pixi.js 模块
// ============================================================

declare module 'pixi.js' {
  interface PIXI {
    live2d?: ILive2DNamespace;
  }
}

// ============================================================
// 配置和状态类型
// ============================================================

export interface Live2DModelConfig {
  version: string;
  model: {
    name: string;
    description: string;
    author: string;
    version: string;
  };
  files: {
    model: string;
    textures: string[];
    physics?: string;
    pose?: string;
  };
  layout: {
    center_x: number;
    center_y: number;
    width: number;
    height: number;
  };
  hit_areas: Array<{
    name: string;
    id: string;
  }>;
  motions: Record<string, Array<{
    file: string;
    fade_in: number;
    fade_out: number;
  }>>;
  expressions: Array<{
    name: string;
    file: string;
  }>;
  voice: {
    enabled: boolean;
    base_path: string;
    files: Record<string, string>;
  };
  settings: {
    auto_blink: boolean;
    blink_interval: number;
    auto_breath: boolean;
    breath_interval: number;
    idle_motion_interval: number;
    look_at_cursor: boolean;
    physics_enabled: boolean;
  };
  chat_integration: {
    motion_triggers: Record<string, string>;
    emotion_mapping: Record<string, string[]>;
  };
}

export interface MotionOptions {
  priority?: number;
  fadeIn?: number;
  fadeOut?: number;
  loop?: boolean;
}

export type ChatState = 'idle' | 'user_message' | 'ai_typing' | 'ai_speaking';

export interface Live2DCharacterState {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  currentMotion: string | null;
  currentExpression: string | null;
}

export interface Live2DManagerEvents {
  onLoaded: () => void;
  onError: (error: Error) => void;
  onMotionStart: (motionGroup: string) => void;
  onMotionFinish: (motionGroup: string) => void;
  onExpressionChange: (expression: string) => void;
  onHitAreaClick: (hitArea: string) => void;
}

export {};
