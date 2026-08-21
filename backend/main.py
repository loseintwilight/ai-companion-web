"""
AI伴侣Web应用 - FastAPI后端主入口
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import time
import logging
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.routes import api_router
from app.core.database import init_db
from app.core.middleware import RequestLoggingMiddleware, RateLimitMiddleware, SecurityHeadersMiddleware

# 配置日志
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    logger.info("启动AI伴侣Web应用...")
    # 启动时初始化数据库
    await init_db()
    logger.info("数据库初始化完成")
    yield
    # 关闭时清理资源
    logger.info("应用关闭，清理资源...")


async def add_process_time_header(request: Request, call_next):
    """添加请求处理时间中间件"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


def create_app() -> FastAPI:
    """创建FastAPI应用实例"""
    app = FastAPI(
        title="AI伴侣Web应用",
        description="现代化的AI聊天界面，支持与第三方大语言模型进行自然对话交互",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/api/docs" if settings.DEBUG else None,
        redoc_url="/api/redoc" if settings.DEBUG else None,
    )
    
    # 添加安全头中间件
    app.add_middleware(SecurityHeadersMiddleware)
    
    # 添加请求日志中间件
    if settings.DEBUG:
        app.add_middleware(RequestLoggingMiddleware)
    
    # 添加速率限制中间件
    app.add_middleware(
        RateLimitMiddleware, 
        requests_per_minute=settings.RATE_LIMIT_REQUESTS
    )
    
    # 添加受信任主机中间件（生产环境安全）
    if not settings.DEBUG:
        app.add_middleware(
            TrustedHostMiddleware, 
            allowed_hosts=["localhost", "127.0.0.1", "*.yourdomain.com"]
        )
    
    # 配置CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Request-ID"],
        expose_headers=["X-Process-Time"],
    )
    
    # 添加请求处理时间中间件
    app.middleware("http")(add_process_time_header)
    
    # 全局异常处理器
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"全局异常处理: {str(exc)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "error": "内部服务器错误",
                "message": "服务暂时不可用，请稍后重试",
                "timestamp": time.time()
            }
        )
    
    # 注册路由
    app.include_router(api_router, prefix="/api")
    
    # 根路径重定向到API文档（开发环境）
    if settings.DEBUG:
        @app.get("/")
        async def root():
            return {
                "message": "AI伴侣Web应用API",
                "version": "1.0.0",
                "docs": "/api/docs",
                "health": "/api/health"
            }
    
    return app


app = create_app()


if __name__ == "__main__":
    logger.info(f"启动服务器: {settings.HOST}:{settings.PORT}")
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
        access_log=settings.DEBUG
    )