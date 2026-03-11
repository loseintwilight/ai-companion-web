import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface InputAreaProps {
  onSendMessage: (content: string) => void;
  disabled: boolean;
  placeholder?: string;
  className?: string;
}

const InputArea: React.FC<InputAreaProps> = ({
  onSendMessage,
  disabled,
  placeholder = '输入您的消息...',
  className = ''
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整文本框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessage('');
    textareaRef.current?.focus();
  };

  return (
    <div className={`bg-white border-t border-gray-200 px-4 py-4 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end space-x-3">
          {/* 输入框容器 */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className={`
                w-full px-4 py-3 pr-12 text-sm border border-gray-300 rounded-2xl
                resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:bg-gray-100 disabled:cursor-not-allowed
                max-h-32 overflow-y-auto
              `}
            />
            
            {/* 清空按钮 */}
            {message && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                title="清空输入"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className={`
              flex items-center justify-center w-12 h-12 rounded-2xl transition-all
              ${message.trim() && !disabled
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
            title="发送消息 (Enter)"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* 提示文本 */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          按 Enter 发送，Shift + Enter 换行
        </div>
      </div>
    </div>
  );
};

export default InputArea;