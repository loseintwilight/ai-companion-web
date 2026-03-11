"""
数据库连接和初始化
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, String, DateTime, Text, Boolean, Integer, ForeignKey
from datetime import datetime
import uuid

from app.core.config import settings

# 创建异步数据库引擎
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True
)

# 创建会话工厂
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# 声明基类
Base = declarative_base()


class ChatSession(Base):
    """聊天会话模型"""
    __tablename__ = "chat_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    title = Column(String(200), default="新对话")
    is_active = Column(Boolean, default=True)


class ChatMessage(Base):
    """聊天消息模型"""
    __tablename__ = "chat_messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("chat_sessions.id"), nullable=False)
    content = Column(Text, nullable=False)
    sender = Column(String(10), nullable=False)  # 'user' or 'ai'
    timestamp = Column(DateTime, default=datetime.utcnow)
    model_provider = Column(String(50))  # 'openai', 'bytedance', 'baidu'
    token_count = Column(Integer)


class SystemConfig(Base):
    """系统配置模型"""
    __tablename__ = "system_config"
    
    key = Column(String(100), primary_key=True)
    value = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


async def get_db():
    """获取数据库会话"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """初始化数据库"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)