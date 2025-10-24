"""
Database Execution Router
Execute SQL on real databases
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.database_executor import DatabaseExecutor

router = APIRouter()
db_executor = DatabaseExecutor()


class DatabaseConfig(BaseModel):
    """Database connection configuration"""
    dbms: str  # postgresql, mysql, sqlite, sqlserver, oracle
    host: Optional[str] = "localhost"
    port: Optional[int] = None
    database: str
    username: Optional[str] = ""
    password: Optional[str] = ""
    driver: Optional[str] = None  # For SQL Server


class ConnectionTestRequest(BaseModel):
    """Request to test database connection"""
    config: DatabaseConfig


class ExecuteSQLRequest(BaseModel):
    """Request to execute SQL on database"""
    config: DatabaseConfig
    sql_script: str
    create_database: bool = False


@router.post("/test-connection")
async def test_connection(request: ConnectionTestRequest):
    """Test database connection"""
    try:
        result = db_executor.test_connection(request.config.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connection test failed: {str(e)}")


@router.post("/execute")
async def execute_sql(request: ExecuteSQLRequest):
    """Execute SQL script on database"""
    try:
        result = db_executor.execute_sql(
            config=request.config.dict(),
            sql_script=request.sql_script,
            create_database=request.create_database
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SQL execution failed: {str(e)}")


@router.post("/info")
async def get_database_info(request: ConnectionTestRequest):
    """Get information about database"""
    try:
        result = db_executor.get_database_info(request.config.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get database info: {str(e)}")
