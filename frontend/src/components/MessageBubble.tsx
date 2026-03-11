import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Message } from '../types/chat';
import { formatTime } from '../utils/dateUtils';

interface MessageBubbleProps {
  message: Message;
  onRetry?: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onRetry }) => {
  const isUser = message.sender === 'user';
  const isError = message.status === 'error';
  const isSending = message.status === 'sending';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isUser ? 'order-2' : 'order-1'}`}>
        {/* 消息气泡 */}
        <div
          className={`
            relative px-4 py-3 rounded-2xl shadow-sm
            ${isUser 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
              : 'bg-white text-gray-900 border border-gray-200'
            }
            ${isError ? 'border-red-300 bg-red-50' : ''}
            ${isSending ? 'opacity-70' : ''}
          `}
        >
          {/* 消息内容 */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
          
          {/* 流式输入指示器 */}
          {message.isStreaming && (
            <div className="flex items-center mt-2 space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div>
            </div>
          )}
        </div>
        
        {/* 消息元信息 */}
        <div className={`flex items-center mt-1 space-x-2 text-xs text-gray-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span>{formatTime(message.timestamp)}</span>
          
          {/* 发送状态指示器 */}
          {isSending && (
            <ArrowPathIcon className="w-3 h-3 animate-spin" />
          )}
          
          {/* 错误状态和重试按钮 */}
          {isError && (
            <>
              <ExclamationTriangleIcon className="w-3 h-3 text-red-500" />
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-red-500 hover:text-red-700 underline"
                >
                  重试
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;