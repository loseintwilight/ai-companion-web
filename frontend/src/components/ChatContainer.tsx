import React from 'react';
import Header from './Header';
import MessageList from './MessageList';
import InputArea from './InputArea';

interface ChatContainerProps {
  className?: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col h-screen max-w-4xl mx-auto ${className}`}>
      {/* 顶部导航栏 */}
      <Header />
      
      {/* 消息列表区域 */}
      <div className="flex-1 overflow-hidden">
        <MessageList />
      </div>
      
      {/* 输入区域 */}
      <InputArea 
        onSendMessage={(message) => {
          console.log('发送消息:', message);
          // TODO: 实现消息发送逻辑
        }}
        disabled={false}
        placeholder="输入您的消息..."
      />
    </div>
  );
};

export default ChatContainer;