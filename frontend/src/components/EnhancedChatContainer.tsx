/**
 * 增强的聊天容器组件
 * 集成Live2D角色，支持响应式布局和流式回复时的模型动作
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './Header';
import MessageList from './MessageList';
import InputArea from './InputArea';
import NativeLive2DCharacter from './NativeLive2DCharacter';
import { Message } from '../types/chat';

interface EnhancedChatContainerProps {
  className?: string;
}

type ChatState = 'idle' | 'user_message' | 'ai_typing' | 'ai_speaking';

const EnhancedChatContainer: React.FC<EnhancedChatContainerProps> = ({ 
  className = '' 
}) => {
  // 聊天状态
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatState, setChatState] = useState<ChatState>('idle');
  const [lastMessage, setLastMessage] = useState<string>('');
  
  // Live2D相关状态
  const [showLive2D, setShowLive2D] = useState(true);
  const [live2DError, setLive2DError] = useState<string | null>(null);
  
  // 响应式布局状态
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // 引用
  const chatStateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const streamingMessageRef = useRef<string>('');

  /**
   * 检测屏幕尺寸
   */
  const checkScreenSize = useCallback(() => {
    const width = window.innerWidth;
    setIsMobile(width < 768);
    setIsTablet(width >= 768 && width < 1024);
  }, []);

  /**
   * 更新聊天状态
   */
  const updateChatState = useCallback((newState: ChatState, duration?: number) => {
    setChatState(newState);
    
    // 清除之前的定时器
    if (chatStateTimeoutRef.current) {
      clearTimeout(chatStateTimeoutRef.current);
    }
    
    // 如果指定了持续时间，自动恢复到idle状态
    if (duration) {
      chatStateTimeoutRef.current = setTimeout(() => {
        setChatState('idle');
      }, duration);
    }
  }, []);

  /**
   * 发送消息处理
   */
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    try {
      // 添加用户消息
      const userMessage: Message = {
        id: Date.now().toString(),
        content: content.trim(),
        sender: 'user',
        timestamp: new Date(),
        status: 'sent'
      };

      setMessages(prev => [...prev, userMessage]);
      setLastMessage(content.trim());
      
      // 更新聊天状态：用户发送消息
      updateChatState('user_message', 2000);
      
      setIsLoading(true);
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 开始AI回复
      updateChatState('ai_typing');
      setIsTyping(true);
      
      // 创建AI消息
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '',
        sender: 'ai',
        timestamp: new Date(),
        status: 'sent',
        isStreaming: true
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // 模拟流式回复
      await simulateStreamingResponse(aiMessage.id, content);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      // 错误处理
      updateChatState('idle');
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [isLoading, updateChatState]);

  /**
   * 模拟流式回复
   */
  const simulateStreamingResponse = async (messageId: string, userInput: string) => {
    // 根据用户输入生成回复
    const responses = [
      "你好！我是Rem，很高兴和你聊天！",
      "这是一个很有趣的问题呢～让我想想...",
      "我理解你的意思，这确实需要仔细考虑。",
      "谢谢你的分享！我觉得你说得很有道理。",
      "哇，这听起来真的很棒！我也想了解更多。"
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    const words = response.split('');
    
    // 更新状态为AI正在说话
    updateChatState('ai_speaking');
    streamingMessageRef.current = '';
    
    // 逐字显示
    for (let i = 0; i < words.length; i++) {
      streamingMessageRef.current += words[i];
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: streamingMessageRef.current }
          : msg
      ));
      
      // 随机延迟，模拟真实的流式输出
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    }
    
    // 完成流式输出
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isStreaming: false }
        : msg
    ));
    
    setLastMessage(response);
    setIsLoading(false);
    setIsTyping(false);
    
    // 回复完成后，短暂保持speaking状态，然后回到idle
    setTimeout(() => {
      updateChatState('idle');
    }, 1000);
  };

  /**
   * Live2D错误处理
   */
  const handleLive2DError = useCallback((error: Error) => {
    console.error('Live2D Error:', error);
    setLive2DError(error.message);
  }, []);

  /**
   * Live2D加载完成处理
   */
  const handleLive2DLoaded = useCallback(() => {
    setLive2DError(null);
    console.log('Live2D character loaded successfully');
  }, []);

  /**
   * 切换Live2D显示
   */
  const toggleLive2D = useCallback(() => {
    setShowLive2D(prev => !prev);
  }, []);

  // 屏幕尺寸监听
  useEffect(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [checkScreenSize]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (chatStateTimeoutRef.current) {
        clearTimeout(chatStateTimeoutRef.current);
      }
    };
  }, []);

  // 响应式布局类名
  const containerClasses = `
    flex h-screen max-w-7xl mx-auto
    ${isMobile ? 'flex-col' : 'flex-row'}
    ${className}
  `.trim();

  const chatAreaClasses = `
    flex flex-col
    ${isMobile ? 'flex-1' : 'flex-1 max-w-4xl'}
    ${!isMobile && showLive2D ? 'mr-4' : ''}
  `.trim();

  const live2DAreaClasses = `
    ${isMobile ? 'h-48 flex-shrink-0' : 'w-80 flex-shrink-0'}
    ${isMobile ? 'border-t' : 'border-l'}
    border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50
  `.trim();

  return (
    <div className={containerClasses}>
      {/* 主聊天区域 */}
      <div className={chatAreaClasses}>
        {/* 顶部导航栏 */}
        <Header />
        
        {/* 消息列表区域 */}
        <div className="flex-1 overflow-hidden">
          <MessageList 
            messages={messages}
            isLoading={isLoading}
            isTyping={isTyping}
          />
        </div>
        
        {/* 输入区域 */}
        <InputArea 
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder={
            isLoading 
              ? "AI正在回复中..." 
              : "输入您的消息..."
          }
        />
      </div>

      {/* Live2D角色区域 */}
      {showLive2D && (
        <div className={live2DAreaClasses}>
          <div className="h-full flex flex-col">
            {/* Live2D控制栏 */}
            <div className="flex items-center justify-between p-3 bg-white bg-opacity-50 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Rem</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* 状态指示器 */}
                <div className="text-xs text-gray-500 capitalize">
                  {chatState === 'idle' && '待机'}
                  {chatState === 'user_message' && '倾听'}
                  {chatState === 'ai_typing' && '思考'}
                  {chatState === 'ai_speaking' && '回复'}
                </div>
                
                {/* 隐藏按钮 */}
                <button
                  onClick={toggleLive2D}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="隐藏角色"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Live2D角色 */}
            <div className="flex-1 relative">
              <NativeLive2DCharacter
                modelPath="/live2d/rem/rem/model.json"
                visible={true}
                chatState={chatState}
                lastMessage={lastMessage}
                className="w-full h-full"
                interactive={true}
                onError={handleLive2DError}
                onLoaded={handleLive2DLoaded}
                scale={4.0}
              />

              {/* Live2D错误提示 */}
              {live2DError && (
                <div className="absolute bottom-4 left-4 right-4 bg-red-100 border border-red-300 rounded-lg p-3">
                  <p className="text-sm text-red-700">Live2D加载失败</p>
                  <p className="text-xs text-red-600 mt-1">{live2DError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live2D显示切换按钮（当隐藏时） */}
      {!showLive2D && (
        <button
          onClick={toggleLive2D}
          className={`
            fixed bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg
            transition-all duration-300 z-50
            ${isMobile ? 'bottom-20 right-4' : 'top-1/2 right-4 -translate-y-1/2'}
          `}
          title="显示Live2D角色"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      )}

      {/* 响应式提示（仅开发环境） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-50">
          <div>屏幕: {isMobile ? '手机' : isTablet ? '平板' : '桌面'}</div>
          <div>Live2D: {showLive2D ? '显示' : '隐藏'}</div>
          <div>状态: {chatState}</div>
        </div>
      )}
    </div>
  );
};

export default EnhancedChatContainer;