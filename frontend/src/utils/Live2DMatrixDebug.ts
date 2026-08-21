/**
 * Live2D Cubism 2 矩阵诊断和修复工具
 * 
 * 用于诊断模型不渲染的矩阵问题
 */

export interface MatrixDiagnosticResult {
  canvasSize: { width: number; height: number };
  modelSize: { width: number; height: number };
  calculatedScale: number;
  matrixValues: number[] | null;
  projectionCorrect: boolean;
  issues: string[];
}

/**
 * 诊断矩阵问题
 */
export function diagnoseMatrix(
  canvas: HTMLCanvasElement,
  model: any
): MatrixDiagnosticResult {
  const result: MatrixDiagnosticResult = {
    canvasSize: { width: canvas.width, height: canvas.height },
    modelSize: { width: 0, height: 0 },
    calculatedScale: 0,
    matrixValues: null,
    projectionCorrect: false,
    issues: []
  };

  // 获取模型原始尺寸
  const modelWidth = model.getCanvasWidth?.() || 0;
  const modelHeight = model.getCanvasHeight?.() || 0;
  result.modelSize = { width: modelWidth, height: modelHeight };

  console.log('📐 模型原始尺寸:', modelWidth, 'x', modelHeight);
  console.log('📐 Canvas 尺寸:', canvas.width, 'x', canvas.height);

  // 检查模型尺寸
  if (modelWidth === 0 || modelHeight === 0) {
    result.issues.push('模型尺寸为 0，可能 MOC 文件未正确加载');
    return result;
  }

  // 计算正确的缩放比例
  const scaleX = canvas.width / modelWidth;
  const scaleY = canvas.height / modelHeight;
  const scale = Math.min(scaleX, scaleY);
  result.calculatedScale = scale;

  console.log('📐 计算的缩放比例:', scale);

  // 检查是否有 L2DMatrix44 和 Live2DModelMatrix
  const hasL2DMatrix44 = typeof (window as any).L2DMatrix44 !== 'undefined';
  const hasLive2DModelMatrix = typeof (window as any).Live2DModelMatrix !== 'undefined';

  console.log('📐 L2DMatrix44 可用:', hasL2DMatrix44);
  console.log('📐 Live2DModelMatrix 可用:', hasLive2DModelMatrix);

  if (!hasL2DMatrix44 || !hasLive2DModelMatrix) {
    result.issues.push('L2DMatrix44 或 Live2DModelMatrix 不可用，矩阵类未正确加载');
  }

  return result;
}

/**
 * 创建正确的模型矩阵
 * 
 * Live2D Cubism 2 坐标系统：
 * - 模型坐标系：原点在中心，范围大约 -1 到 1
 * - Canvas 坐标系：原点在左上角，范围 0 到 width/height
 * 
 * 转换步骤：
 * 1. 缩放模型到合适大小
 * 2. 移动模型到 Canvas 中心
 * 3. 应用正交投影
 */
export function createCorrectModelMatrix(
  canvasWidth: number,
  canvasHeight: number,
  modelWidth: number,
  modelHeight: number,
  userScale: number = 1.0
): Float32Array {
  // 计算缩放比例
  const scaleX = canvasWidth / modelWidth;
  const scaleY = canvasHeight / modelHeight;
  const baseScale = Math.min(scaleX, scaleY);
  const scale = baseScale * userScale;

  console.log('📐 创建矩阵:');
  console.log('   Canvas:', canvasWidth, 'x', canvasHeight);
  console.log('   Model:', modelWidth, 'x', modelHeight);
  console.log('   Scale:', scale);

  // Live2D 模型坐标系：原点在中心，Y 轴向上
  // Canvas/WebGL 坐标系：原点在左上角，Y 轴向下
  // 
  // 转换矩阵需要：
  // 1. 缩放模型
  // 2. Y 轴翻转（乘以 -1）
  // 3. 平移到画布中心
  
  // 标准正交投影矩阵（归一化到 -1 到 1）
  // 然后缩放和平移到像素坐标
  
  // 简化的变换矩阵（行主序，传递给 Live2D SDK）
  // Live2D SDK 期望的是列主序的 4x4 矩阵
  
  const matrix = new Float32Array(16);
  
  // 单位矩阵
  matrix[0] = scale * 2 / canvasWidth;   // sx
  matrix[1] = 0;
  matrix[2] = 0;
  matrix[3] = 0;
  
  matrix[4] = 0;
  matrix[5] = -scale * 2 / canvasHeight; // sy (负号翻转 Y 轴)
  matrix[6] = 0;
  matrix[7] = 0;
  
  matrix[8] = 0;
  matrix[9] = 0;
  matrix[10] = 1;
  matrix[11] = 0;
  
  matrix[12] = 0;  // tx (居中，0 因为已经归一化)
  matrix[13] = 0;  // ty
  matrix[14] = 0;
  matrix[15] = 1;

  console.log('   矩阵值:', Array.from(matrix).map(v => v.toFixed(4)).join(', '));

  return matrix;
}

/**
 * 使用 SDK 的矩阵类创建矩阵（如果可用）
 */
export function createMatrixWithSDK(
  canvasWidth: number,
  canvasHeight: number,
  modelWidth: number,
  modelHeight: number,
  userScale: number = 1.0
): Float32Array | null {
  const L2DMatrix44 = (window as any).L2DMatrix44;
  const Live2DModelMatrix = (window as any).Live2DModelMatrix;

  if (!L2DMatrix44 || !Live2DModelMatrix) {
    console.log('⚠️ SDK 矩阵类不可用，使用 Float32Array');
    return null;
  }

  try {
    // 创建模型矩阵
    const modelMatrix = new Live2DModelMatrix(modelWidth, modelHeight);
    
    // 计算缩放比例
    const scaleX = canvasWidth / modelWidth;
    const scaleY = canvasHeight / modelHeight;
    const scale = Math.min(scaleX, scaleY) * userScale;
    
    // 设置宽度（这会自动计算缩放）
    modelMatrix.setWidth(scale * modelWidth);
    
    // 设置中心位置（Canvas 中心）
    // 注意：Live2DModelMatrix 的坐标系原点在左下角
    modelMatrix.setCenterPosition(0, 0);

    // 创建投影矩阵
    const projMatrix = new L2DMatrix44();
    
    // 调整投影矩阵以适应 Canvas
    // Y 轴翻转和缩放
    const aspect = canvasHeight / canvasWidth;
    projMatrix.scale(1, aspect);

    // 合并矩阵
    const combinedMatrix = projMatrix.mult(modelMatrix);
    
    console.log('✅ 使用 SDK 创建矩阵成功');
    
    return combinedMatrix;
  } catch (error) {
    console.error('❌ SDK 矩阵创建失败:', error);
    return null;
  }
}

/**
 * 渲染调试 - 在画布上绘制测试图案
 */
export function drawDebugPattern(gl: WebGLRenderingContext, canvas: HTMLCanvasElement): void {
  console.log('🎨 绘制调试图案...');
  
  // 清除画布
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  // 创建简单的顶点着色器
  const vsSource = `
    attribute vec4 aPosition;
    void main() {
      gl_Position = aPosition;
    }
  `;
  
  // 创建片段着色器（红色三角形）
  const fsSource = `
    precision mediump float;
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
  `;
  
  // 编译着色器
  const vs = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vs, vsSource);
  gl.compileShader(vs);
  
  const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
  gl.shaderSource(fs, fsSource);
  gl.compileShader(fs);
  
  // 创建程序
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);
  
  // 创建三角形顶点
  const vertices = new Float32Array([
    0.0,  0.5,  0.0,
   -0.5, -0.5,  0.0,
    0.5, -0.5,  0.0
  ]);
  
  const buffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
  const aPosition = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  
  // 绘制
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  
  console.log('🎨 调试图案已绘制 - 如果看到红色三角形，说明 WebGL 正常工作');
}

/**
 * 完整的矩阵诊断和修复函数
 */
export async function diagnoseAndFixMatrix(
  canvas: HTMLCanvasElement,
  model: any,
  userScale: number = 1.0
): Promise<boolean> {
  console.log('🔍 ========== 矩阵诊断开始 ==========');
  
  // 诊断
  const diagnostic = diagnoseMatrix(canvas, model);
  
  if (diagnostic.issues.length > 0) {
    console.error('❌ 发现问题:', diagnostic.issues);
    return false;
  }
  
  // 获取模型尺寸
  const modelWidth = model.getCanvasWidth?.() || 1;
  const modelHeight = model.getCanvasHeight?.() || 1;
  
  // 尝试使用 SDK 创建矩阵
  let matrix = createMatrixWithSDK(
    canvas.width,
    canvas.height,
    modelWidth,
    modelHeight,
    userScale
  );
  
  // 如果 SDK 方法失败，使用手动创建
  if (!matrix) {
    matrix = createCorrectModelMatrix(
      canvas.width,
      canvas.height,
      modelWidth,
      modelHeight,
      userScale
    );
  }
  
  // 设置矩阵
  if (model.setMatrix) {
    model.setMatrix(matrix);
    console.log('✅ 矩阵已设置到模型');
  } else {
    console.error('❌ 模型没有 setMatrix 方法');
    return false;
  }
  
  console.log('🔍 ========== 矩阵诊断结束 ==========');
  return true;
}

// 暴露到全局供控制台调用（仅开发环境）
if (process.env.NODE_ENV === 'development') {
  (window as any).diagnoseAndFixMatrix = diagnoseAndFixMatrix;
  (window as any).createCorrectModelMatrix = createCorrectModelMatrix;
  (window as any).drawDebugPattern = drawDebugPattern;

  console.log('✅ Live2D 矩阵诊断工具已加载');
  console.log('💡 使用方法:');
  console.log('   diagnoseAndFixMatrix(canvas, model)');
  console.log('   drawDebugPattern(gl, canvas)');
}
