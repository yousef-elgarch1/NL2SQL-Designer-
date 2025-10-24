"""
SQL Generation Router
Handles SQL script generation for multiple database systems
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal
from services.sql_generator import SQLGenerator
from services.sql_validator import SQLValidator

router = APIRouter()
sql_generator = SQLGenerator()
sql_validator = SQLValidator()


class SQLGenerationRequest(BaseModel):
    """Request model for SQL generation"""
    metamodel: dict
    dbms: Literal["postgresql", "mysql", "sqlite", "oracle", "sqlserver"] = "postgresql"
    options: dict = {
        "add_indexes": True,
        "add_constraints": True,
        "include_comments": True
    }


class SQLGenerationResponse(BaseModel):
    """Response model for SQL generation"""
    sql_script: str
    metadata: dict


@router.post("/generate", response_model=SQLGenerationResponse)
async def generate_sql(request: SQLGenerationRequest):
    """Generate SQL script from metamodel"""
    try:
        sql_script = sql_generator.generate_sql(
            metamodel=request.metamodel,
            dbms=request.dbms,
            options=request.options
        )

        entities = request.metamodel.get("entities", [])
        relationships = request.metamodel.get("relationships", [])

        metadata = {
            "target_dbms": request.dbms,
            "tables_count": len(entities),
            "relationships_count": len(relationships),
            "lines_of_code": len(sql_script.split("\n")),
            "generated_at": "2025-10-22"
        }

        return SQLGenerationResponse(
            sql_script=sql_script,
            metadata=metadata
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SQL generation failed: {str(e)}")


@router.post("/validate")
async def validate_sql(sql_script: str, dbms: str = "postgresql"):
    """Validate SQL syntax"""
    try:
        validation = sql_validator.validate_sql(sql_script, dbms)
        return validation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SQL validation failed: {str(e)}")
