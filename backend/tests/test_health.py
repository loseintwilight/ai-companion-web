
"""
健康检查端点测试
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from app.api.endpoints.health import router
from fastapi import FastAPI

# 创建测试应用
app = FastAPI()
app.include_router(router)

client = TestClient(app)


@patch('app.api.endpoints.health.get_db')
@patch('app.api.endpoints.health.psutil')
def test_health_check(mock_psutil, mock_get_db):
    """测试健康检查端点"""
    # Mock数据库会话
    mock_db = AsyncMock()
    mock_get_db.return_value = mock_db
    
    # Mock系统信息
    mock_psutil.cpu_percent.return_value = 25.0
    mock_psutil.virtual_memory.return_value.percent = 60.0
    mock_psutil.disk_usage.return_value.percent = 45.0
    
    response = client.get("/health")
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "timestamp" in data
    assert data["version"] == "1.0.0"
    assert "database" in data
    assert "system" in data


@patch('app.api.endpoints.health.get_db')
@patch('app.api.endpoints.health.psutil')
def test_health_check_response_format(mock_psutil, mock_get_db):
    """测试健康检查响应格式"""
    # Mock数据库会话
    mock_db = AsyncMock()
    mock_get_db.return_value = mock_db
    
    # Mock系统信息
    mock_psutil.cpu_percent.return_value = 25.0
    mock_psutil.virtual_memory.return_value.percent = 60.0
    mock_psutil.disk_usage.return_value.percent = 45.0
    
    response = client.get("/health")
    data = response.json()
    
    # 验证必需字段
    required_fields = ["status", "timestamp", "version", "environment", "database", "system"]
    for field in required_fields:
        assert field in data
    
    # 验证数据类型
    assert isinstance(data["status"], str)
    assert isinstance(data["timestamp"], str)
    assert isinstance(data["version"], str)
    assert isinstance(data["environment"], str)
    assert isinstance(data["database"], str)
    assert isinstance(data["system"], dict)


@patch('app.api.endpoints.health.get_db')
@patch('app.api.endpoints.health.psutil')
def test_detailed_health_check(mock_psutil, mock_get_db):
    """测试详细健康检查端点"""
    # Mock数据库会话
    mock_db = AsyncMock()
    mock_get_db.return_value = mock_db
    
    # Mock系统信息
    mock_psutil.cpu_percent.return_value = 25.0
    mock_memory = mock_psutil.virtual_memory.return_value
    mock_memory.total = 8589934592
    mock_memory.available = 4294967296
    mock_memory.percent = 50.0
    
    mock_disk = mock_psutil.disk_usage.return_value
    mock_disk.total = 1000000000000
    mock_disk.free = 500000000000
    mock_disk.percent = 50.0
    
    response = client.get("/health/detailed")
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "database" in data
    assert "system" in data
    assert "services" in data
    
    # 验证详细信息结构
    assert "memory" in data["system"]
    assert "disk" in data["system"]
    assert "ai_providers" in data["services"]