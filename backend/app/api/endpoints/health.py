"""
健康检查端点
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import psutil
import os

from app.core.database import get_db
from app.core.config import settings

router = APIRouter()


class HealthResponse(BaseModel):
    """健康检查响应模型"""
    status: str
    timestamp: datetime
    version: str
    environment: str
    database: str
    system: dict


class DetailedHealthResponse(BaseModel):
    """详细健康检查响应模型"""
    status: str
    timestamp: datetime
    version: str
    environment: str
    database: dict
    system: dict
    services: dict


@router.get("/health", response_model=HealthResponse)
async def health_check(db: AsyncSession = Depends(get_db)):
    """基础健康检查端点"""
    # 检查数据库连接
    db_status = "healthy"
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "unhealthy"
    
    # 获取系统信息
    system_info = {
        "cpu_percent": psutil.cpu_percent(),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage('/').percent if os.name != 'nt' else psutil.disk_usage('C:').percent
    }
    
    overall_status = "healthy" if db_status == "healthy" else "degraded"
    
    return HealthResponse(
        status=overall_status,
        timestamp=datetime.utcnow(),
        version="1.0.0",
        environment="development" if settings.DEBUG else "production",
        database=db_status,
        system=system_info
    )


@router.get("/health/detailed", response_model=DetailedHealthResponse)
async def detailed_health_check(db: AsyncSession = Depends(get_db)):
    """详细健康检查端点"""
    # 检查数据库连接和性能
    db_info = {"status": "healthy", "response_time_ms": 0}
    try:
        start_time = datetime.utcnow()
        await db.execute(text("SELECT 1"))
        end_time = datetime.utcnow()
        db_info["response_time_ms"] = (end_time - start_time).total_seconds() * 1000
    except Exception as e:
        db_info = {"status": "unhealthy", "error": str(e)}
    
    # 获取详细系统信息
    system_info = {
        "cpu_percent": psutil.cpu_percent(interval=1),
        "memory": {
            "total": psutil.virtual_memory().total,
            "available": psutil.virtual_memory().available,
            "percent": psutil.virtual_memory().percent
        },
        "disk": {
            "total": psutil.disk_usage('/').total if os.name != 'nt' else psutil.disk_usage('C:').total,
            "free": psutil.disk_usage('/').free if os.name != 'nt' else psutil.disk_usage('C:').free,
            "percent": psutil.disk_usage('/').percent if os.name != 'nt' else psutil.disk_usage('C:').percent
        }
    }
    
    # 检查服务状态
    services_info = {
        "api": "healthy",
        "database": db_info["status"],
        "ai_providers": "available"
    }
    
    overall_status = "healthy"
    if db_info["status"] != "healthy":
        overall_status = "degraded"
    if system_info["cpu_percent"] > 90 or system_info["memory"]["percent"] > 90:
        overall_status = "degraded"
    
    return DetailedHealthResponse(
        status=overall_status,
        timestamp=datetime.utcnow(),
        version="1.0.0",
        environment="development" if settings.DEBUG else "production",
        database=db_info,
        system=system_info,
        services=services_info
    )