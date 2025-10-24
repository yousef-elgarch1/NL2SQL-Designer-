"""
Schema Optimization Router
Provides AI-powered optimization suggestions
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from services.optimization_service import OptimizationService

router = APIRouter()
optimization_service = OptimizationService()


class OptimizationRequest(BaseModel):
    """Request model for schema optimization"""
    metamodel: dict


class OptimizationResponse(BaseModel):
    """Response model for optimization suggestions"""
    index_suggestions: list
    normalization_suggestions: list
    datatype_suggestions: list
    security_suggestions: list
    performance_suggestions: list
    overall_score: int
    summary: str


@router.post("/analyze", response_model=OptimizationResponse)
async def analyze_schema(request: OptimizationRequest):
    """Analyze schema and provide optimization suggestions"""
    try:
        suggestions = optimization_service.analyze_schema(request.metamodel)
        return OptimizationResponse(**suggestions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization analysis failed: {str(e)}")
