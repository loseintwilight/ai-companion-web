import React from 'react';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import { Message } from '../types/chat';

interface MessageListProps {
  messages?: Message[];
  isLoading?: boolean;
  isTyping?: boolean;  // 添加 isTyping 属性
  className?: string;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages = [], 
  isLoading = false,
  isTyping = false,  // 添加默认值
  className = '' 
}) => {
  // 示例消息数据（用于展示）
  const exampleMessages: Message[] = [
    {
      id: '1',
      content: '你好！我是AI伴侣，很高兴为您服务。有什么我可以帮助您的吗？',
      sender: 'ai',
      timestamp: new Date(),
      status: 'sent'
    },
    {
      id: '2', 
      content: '你好！请介绍一下你的功能。',
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    }
  ];

  const displayMessages = messages.length > 0 ? messages : exampleMessages;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {displayMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onRetry={() => {
              console.log('重试消息:', message.id);
              // TODO: 实现消息重试逻辑
            }}
          />
        ))}
        
        {/* 加载指示器 */}
        {isLoading && (
          <div className="flex justify-start">
            <LoadingIndicator />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;