/**
 * 错误边界组件
 * 捕获和处理 React 组件错误，防止整个应用崩溃
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 过滤 ResizeObserver 错误
    if (error.message.includes('ResizeObserver loop completed with undelivered notifications')) {
      console.warn('ResizeObserver error caught by ErrorBoundary and suppressed:', error.message);
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
      return;
    }

    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // 自定义降级 UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-container p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-red-800 font-medium">组件加载出错</h3>
          </div>
          
          <p className="text-red-700 text-sm mb-3">
            抱歉，这个组件遇到了一些问题。请尝试刷新页面。
          </p>
          
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            刷新页面
          </button>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4">
              <summary className="text-red-600 cursor-pointer text-sm">查看错误详情</summary>
              <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto max-h-40">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;