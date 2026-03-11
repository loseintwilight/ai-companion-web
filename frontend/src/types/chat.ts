/**
 * 聊天相关类型定义
 */

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
  isStreaming?: boolean;
  tokenCount?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  messageCount: number;
}

export interface ChatState {
  messages: Message[];
  currentSession: ChatSession | null;
  isLoading: boolean;
  isTyping: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  error: string | null;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  contextLength?: number;
}

export interface ChatResponse {
  messageId: string;
  content: string;
  sender: string;
  timestamp: string;
  tokenCount?: number;
}

export interface StreamingResponse {
  type: 'message_chunk' | 'message_complete' | 'error';
  data: {
    content?: string;
    isComplete?: boolean;
    messageId?: string;
    fullContent?: string;
    errorCode?: string;
    message?: string;
  };
}