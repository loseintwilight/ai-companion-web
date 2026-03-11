"""
API路由配置
"""

from fastapi import APIRouter
from app.api.endpoints import health, chat, config

# 创建主路由器
api_router = APIRouter()

# 注册各个模块的路由
api_router.include_router(health.router, tags=["健康检查"])
api_router.include_router(chat.router, prefix="/v1/chat", tags=["聊天"])
api_router.include_router(config.router, prefix="/v1/config", tags=["配置"])