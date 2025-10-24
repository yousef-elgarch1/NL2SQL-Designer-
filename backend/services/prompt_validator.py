"""
Prompt Validation Service
Validates and completes user prompts using LLM
"""

from typing import Dict, Any, List, Optional
from .llm_service import LLMService
from .fast_llm_service import FastLLMService
from config import settings
import os


class PromptValidator:
    """Service for validating and completing prompts"""

    def __init__(self):
        # Use fast Groq LLM if configured, otherwise fallback to slow Ollama
        if settings.USE_GROQ and settings.GROQ_API_KEY:
            self.llm_service = FastLLMService()
            print("[INFO] Using FAST Groq LLM for validation!")
        else:
            self.llm_service = LLMService()
            print("[WARN] Using slow Ollama LLM - consider setting GROQ_API_KEY for speed")

        # Load validation prompt template
        prompts_dir = os.path.join(os.path.dirname(__file__), "..", "prompts")
        with open(os.path.join(prompts_dir, "validation_prompt.txt"), "r") as f:
            self.validation_template = f.read()

    async def validate_prompt(
        self,
        prompt: str,
        domain_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Validate user prompt and extract structure

        Phase 1 Implementation

        Returns:
            {
                "is_complete": bool,
                "detected_domain": str,
                "detected_entities": List[str],
                "inferred_entities": List[str],
                "missing_info": List[str],
                "suggestions": List[str],
                "confidence": float
            }
        """
        # Format the validation prompt
        formatted_prompt = self.validation_template.format(
            prompt=prompt,
            domain_hint=domain_hint or "None"
        )

        # Get JSON response from LLM
        try:
            result = await self.llm_service.generate_json(
                prompt=formatted_prompt,
                model=None  # Use primary model
            )
            return result
        except Exception as e:
            # Return a default response if LLM fails
            return {
                "is_complete": False,
                "detected_domain": None,
                "detected_entities": [],
                "inferred_entities": [],
                "missing_info": [f"Error analyzing prompt: {str(e)}"],
                "suggestions": ["Please provide more details about your database requirements"],
                "confidence": 0.0
            }

    async def complete_prompt(
        self,
        prompt: str,
        suggestions: List[str],
        user_choices: Dict[str, bool]
    ) -> str:
        """
        Complete prompt with AI suggestions

        Phase 1 Implementation
        """
        # TODO: Implement in Phase 1
        raise NotImplementedError("Prompt completion not implemented yet - Phase 1")

    def _extract_entities(self, llm_response: str) -> List[str]:
        """
        Extract entity names from LLM response

        Phase 1 Implementation
        """
        # TODO: Implement in Phase 1
        return []

    def _extract_relationships(self, llm_response: str) -> List[Dict]:
        """
        Extract relationships from LLM response

        Phase 1 Implementation
        """
        # TODO: Implement in Phase 1
        return []
