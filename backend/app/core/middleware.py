"""
中间件模块
"""

import time
import logging
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict, deque
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """请求日志中间件"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # 记录请求信息
        logger.info(
            f"请求开始: {request.method} {request.url.path} "
            f"来源IP: {request.client.host if request.client else 'unknown'}"
        )
        
        response = await call_next(request)
        
        # 计算处理时间
        process_time = time.time() - start_time
        
        # 记录响应信息
        logger.info(
            f"请求完成: {request.method} {request.url.path} "
            f"状态码: {response.status_code} "
            f"处理时间: {process_time:.3f}s"
        )
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """简单的速率限制中间件"""
    
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(deque)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        client_ip = request.client.host if request.client else "unknown"
        now = datetime.utcnow()
        
        # 清理过期的请求记录
        minute_ago = now - timedelta(minutes=1)
        while self.requests[client_ip] and self.requests[client_ip][0] < minute_ago:
            self.requests[client_ip].popleft()
        
        # 检查是否超过限制
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            logger.warning(f"速率限制触发: IP {client_ip} 超过 {self.requests_per_minute} 请求/分钟")
            return Response(
                content='{"error": "请求过于频繁，请稍后重试"}',
                status_code=429,
                media_type="application/json"
            )
        
        # 记录当前请求
        self.requests[client_ip].append(now)
        
        response = await call_next(request)
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """安全头中间件"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # 添加安全头
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response