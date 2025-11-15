"""
Prompt Validation Router
Handles prompt validation and completion with LLM
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from services.prompt_validator import PromptValidator
from services.realtime_validator import RealtimeValidator

router = APIRouter()
prompt_validator = PromptValidator()
realtime_validator = RealtimeValidator()


class PromptValidationRequest(BaseModel):
    """Request model for prompt validation"""
    prompt: str
    domain_hint: Optional[str] = None


class PromptValidationResponse(BaseModel):
    """Response model for prompt validation"""
    is_complete: bool
    detected_domain: Optional[str] = None
    detected_entities: list[str] = []
    inferred_entities: list[str] = []
    missing_info: list[str] = []
    suggestions: list[str] = []
    confidence: float = 0.0


@router.post("/validate", response_model=PromptValidationResponse)
async def validate_prompt(request: PromptValidationRequest):
    """Validate user prompt and suggest completions"""
    try:
        result = await prompt_validator.validate_prompt(
            prompt=request.prompt,
            domain_hint=request.domain_hint
        )
        return PromptValidationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prompt validation failed: {str(e)}")


@router.post("/complete")
async def complete_prompt(request: dict):
    """Auto-complete prompt with AI suggestions"""
    try:
        prompt = request.get("prompt", "")
        return {"completed_prompt": prompt}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prompt completion failed: {str(e)}")


class RealtimeValidationRequest(BaseModel):
    """Request model for real-time validation"""
    prompt: str


class HighlightItem(BaseModel):
    """Model for a single highlight"""
    type: str  # entity, relationship, attribute, domain, missing
    text: str
    start: int
    end: int
    color: str  # green, red, yellow, blue


class RealtimeValidationResponse(BaseModel):
    """Response model for real-time validation"""
    highlights: List[HighlightItem]
    score: float
    detected: Dict[str, Any]
    missing: Dict[str, bool]
    suggestions: List[str]


@router.post("/analyze-realtime", response_model=RealtimeValidationResponse)
async def analyze_prompt_realtime(request: RealtimeValidationRequest):
    """
    Analyze prompt in real-time and return highlights
    Fast local analysis without LLM for instant feedback
    """
    try:
        result = realtime_validator.analyze_prompt_realtime(request.prompt)
        return RealtimeValidationResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Real-time analysis failed: {str(e)}"
        )


@router.post("/analyze-deep")
async def analyze_prompt_deep(request: RealtimeValidationRequest):
    """
    Deep analysis using LLM (slower but more accurate)
    Call this when user clicks the "correction" button
    """
    try:
        result = await realtime_validator.analyze_with_llm(request.prompt)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Deep analysis failed: {str(e)}"
        )
