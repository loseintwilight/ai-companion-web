import React, { useState, useRef, useEffect, useCallback } from 'react';
// 使用原生 WebGL 版本的 Live2D 组件
import NativeLive2DCharacter from './NativeLive2DCharacter';
import '../styles/live2d.css';

interface Position {
  x: number;
  y: number;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'rem';
  timestamp: Date;
}

interface DesktopPetAppProps {
  className?: string;
}

const DesktopPetApp: React.FC<DesktopPetAppProps> = ({ className }) => {
  // 状态管理
  const [showChat, setShowChat] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0, y: 0, visible: false
  });
  
  // 聊天消息
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', content: '你好！我是Rem，很高兴认识你~', sender: 'rem', timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // 拖拽位置状态
  const [modelPosition, setModelPosition] = useState<Position>({ x: 50, y: 50 });
  const [chatPosition, setChatPosition] = useState<Position>({ x: 100, y: 100 });
  
  // 拖拽状态
  const [isDraggingModel, setIsDraggingModel] = useState(false);
  const [isDraggingChat, setIsDraggingChat] = useState(false);
  const dragOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) return;
    
    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // 模拟 Rem 回复
    setTimeout(() => {
      const responses = [
        '嗯嗯，我明白你的意思~',
        '这个话题很有趣呢！',
        '谢谢你和我聊天！',
        '让我想想怎么回答...',
        '你说的对呢！'
      ];
      const remMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: 'rem',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, remMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  }, [inputValue]);

  // 右键菜单处理
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      visible: true
    });
  }, []);

  // 关闭右键菜单
  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  // 点击其他地方关闭菜单
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [closeContextMenu]);

  // 模型拖拽处理
  const handleModelMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDraggingModel(true);
    dragOffsetRef.current = {
      x: e.clientX - modelPosition.x,
      y: e.clientY - modelPosition.y
    };
  }, [modelPosition]);

  // 聊天框拖拽处理
  const handleChatMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDraggingChat(true);
    dragOffsetRef.current = {
      x: e.clientX - chatPosition.x,
      y: e.clientY - chatPosition.y
    };
  }, [chatPosition]);

  // 鼠标移动处理
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingModel) {
        setModelPosition({
          x: e.clientX - dragOffsetRef.current.x,
          y: e.clientY - dragOffsetRef.current.y
        });
      }
      if (isDraggingChat) {
        setChatPosition({
          x: e.clientX - dragOffsetRef.current.x,
          y: e.clientY - dragOffsetRef.current.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingModel(false);
      setIsDraggingChat(false);
    };

    if (isDraggingModel || isDraggingChat) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingModel, isDraggingChat]);

  return (
    <div 
      className={`desktop-pet-app ${className || ''}`}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'transparent'
      }}
      onContextMenu={handleContextMenu}
    >
      {/* Live2D 角色 - 可拖拽 */}
      <div
        style={{
          position: 'absolute',
          left: modelPosition.x,
          top: modelPosition.y,
          width: 400,
          height: 600,
          cursor: isDraggingModel ? 'grabbing' : 'grab',
          zIndex: 10
        }}
        onMouseDown={handleModelMouseDown}
      >
        <NativeLive2DCharacter
          modelPath="/live2d/rem/rem/model.json"
          visible={true}
          scale={4.0}
        />
      </div>

      {/* QQ风格聊天框 - 可拖拽 */}
      {showChat && (
        <div
          style={{
            position: 'absolute',
            left: chatPosition.x,
            top: chatPosition.y,
            width: 320,
            height: 450,
            cursor: isDraggingChat ? 'grabbing' : 'default',
            zIndex: 20,
            background: '#f5f5f5',
            borderRadius: '8px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* 简洁标题栏 - 只显示名字 */}
          <div
            style={{
              height: 36,
              background: '#12b7f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 12px',
              cursor: 'grab',
              flexShrink: 0
            }}
            onMouseDown={handleChatMouseDown}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12
              }}>
                R
              </div>
              <span style={{ color: 'white', fontWeight: 500, fontSize: 14 }}>Rem</span>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#52c41a',
                marginLeft: 4
              }} />
            </div>
            <button
              onClick={() => setShowChat(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: 18,
                padding: 0,
                lineHeight: 1
              }}
            >
              x
            </button>
          </div>
          
          {/* 消息列表 */}
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '12px',
              background: '#fff'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 12
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '8px 12px',
                    borderRadius: msg.sender === 'user' 
                      ? '12px 12px 4px 12px' 
                      : '12px 12px 12px 4px',
                    background: msg.sender === 'user' ? '#12b7f5' : '#f0f0f0',
                    color: msg.sender === 'user' ? 'white' : '#333',
                    fontSize: 13,
                    lineHeight: 1.5,
                    wordBreak: 'break-word'
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', marginBottom: 12 }}>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '12px 12px 12px 4px',
                  background: '#f0f0f0',
                  fontSize: 13,
                  color: '#999'
                }}>
                  正在输入...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* 输入框 */}
          <div
            style={{
              padding: '8px 12px',
              background: '#fff',
              borderTop: '1px solid #eee',
              display: 'flex',
              gap: 8,
              flexShrink: 0
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="输入消息..."
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 18,
                fontSize: 13,
                outline: 'none'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              style={{
                padding: '8px 16px',
                background: inputValue.trim() ? '#12b7f5' : '#ddd',
                color: 'white',
                border: 'none',
                borderRadius: 18,
                fontSize: 13,
                cursor: inputValue.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              发送
            </button>
          </div>
        </div>
      )}

      {/* 右键菜单 */}
      {contextMenu.visible && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: 'white',
            borderRadius: 8,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            padding: '8px 0',
            minWidth: 140,
            zIndex: 1000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              padding: '10px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            onClick={() => {
              setShowChat(true);
              closeContextMenu();
            }}
          >
            打开聊天
          </div>
          <div
            style={{
              padding: '10px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            onClick={() => {
              setModelPosition({ x: 50, y: 50 });
              closeContextMenu();
            }}
          >
            重置位置
          </div>
        </div>
      )}
    </div>
  );
};

export default DesktopPetApp;
