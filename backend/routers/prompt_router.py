"""
Prompt Validation Router
Handles prompt validation and completion with LLM
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.prompt_validator import PromptValidator

router = APIRouter()
prompt_validator = PromptValidator()


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
