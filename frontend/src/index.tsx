// 【关键】PIXI.js 早期初始化 - 必须在所有其他导入之前
import './utils/pixi-init';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 全局错误处理 - 捕获 ResizeObserver 错误
window.addEventListener('error', (event) => {
  if (event.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    // 阻止 ResizeObserver 错误显示红色面板
    event.preventDefault();
    event.stopPropagation();
    console.warn('ResizeObserver error caught and suppressed:', event.message);
    return false;
  }
});

// 捕获未处理的 Promise 错误
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && 
      event.reason.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    event.preventDefault();
    console.warn('ResizeObserver promise rejection caught and suppressed:', event.reason.message);
    return false;
  }
});

// 重写 console.error 来过滤 ResizeObserver 错误
const originalConsoleError = console.error;
console.error = function(...args) {
  const message = args.join(' ');
  if (message.includes('ResizeObserver loop completed with undelivered notifications')) {
    console.warn('ResizeObserver error suppressed:', message);
    return;
  }
  originalConsoleError.apply(console, args);
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 如果你想开始测量应用性能，传递一个函数
// 来记录结果 (例如: reportWebVitals(console.log))
// 或发送到分析端点。了解更多: https://bit.ly/CRA-vitals
reportWebVitals();