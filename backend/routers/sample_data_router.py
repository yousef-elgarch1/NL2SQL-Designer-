"""
Sample Data Generation Router
Generates realistic test data for schemas
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal
from services.sample_data_service import SampleDataGenerator

router = APIRouter()
sample_data_generator = SampleDataGenerator()


class SampleDataRequest(BaseModel):
    """Request model for sample data generation"""
    metamodel: dict
    rows_per_table: int = 10
    format: Literal["sql", "json"] = "sql"


class SampleDataResponse(BaseModel):
    """Response model for sample data"""
    data: str | dict
    metadata: dict


@router.post("/generate", response_model=SampleDataResponse)
async def generate_sample_data(request: SampleDataRequest):
    """Generate sample test data for the schema"""
    try:
        data = sample_data_generator.generate_sample_data(
            metamodel=request.metamodel,
            rows_per_table=request.rows_per_table,
            format=request.format
        )

        entities = request.metamodel.get("entities", [])
        total_rows = len(entities) * request.rows_per_table

        metadata = {
            "format": request.format,
            "tables_count": len(entities),
            "rows_per_table": request.rows_per_table,
            "total_rows": total_rows,
        }

        return SampleDataResponse(data=data, metadata=metadata)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sample data generation failed: {str(e)}")
