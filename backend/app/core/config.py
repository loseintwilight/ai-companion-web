"""
应用配置管理
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    """应用配置类"""
    
    # 基础配置
    APP_NAME: str = "AI伴侣Web应用"
    DEBUG: bool = True
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # CORS配置
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ]
    
    # 数据库配置
    DATABASE_URL: str = "sqlite+aiosqlite:///./ai_companion.db"
    
    # AI模型配置
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    OPENAI_MODEL: str = "gpt-4"
    
    BYTEDANCE_API_KEY: Optional[str] = None
    BYTEDANCE_ENDPOINT: Optional[str] = None
    
    BAIDU_API_KEY: Optional[str] = None
    BAIDU_SECRET_KEY: Optional[str] = None
    
    # 默认AI模型提供商
    DEFAULT_AI_PROVIDER: str = "openai"
    
    # 请求限流配置
    RATE_LIMIT_REQUESTS: int = 60  # 每分钟请求数
    RATE_LIMIT_WINDOW: int = 60    # 时间窗口（秒）
    
    # WebSocket配置
    WEBSOCKET_PING_INTERVAL: int = 25
    WEBSOCKET_PING_TIMEOUT: int = 20
    
    # 日志配置
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/app.log"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# 全局配置实例
settings = Settings()