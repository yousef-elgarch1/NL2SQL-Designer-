"""
LLM Service
Handles communication with Ollama/Llama models
"""

import httpx
from typing import Optional, Dict, Any
from config import settings


class LLMService:
    """Service for interacting with Ollama LLM"""

    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.primary_model = settings.OLLAMA_MODEL_PRIMARY
        self.secondary_model = settings.OLLAMA_MODEL_SECONDARY
        self.timeout = settings.OLLAMA_TIMEOUT

    async def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> str:
        """
        Generate text using Ollama

        Phase 1 Implementation
        """
        if model is None:
            model = self.primary_model

        async with httpx.AsyncClient(timeout=300.0) as client:  # 5 minutes timeout
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": 500,  # Limit response length for faster generation
                }
            }

            if system_prompt:
                payload["system"] = system_prompt

            if max_tokens:
                payload["options"]["num_predict"] = max_tokens

            try:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload
                )
                response.raise_for_status()
                result = response.json()
                return result.get("response", "")
            except httpx.HTTPError as e:
                raise Exception(f"Ollama API error: {str(e)}")

    async def generate_json(
        self,
        prompt: str,
        model: Optional[str] = None,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate structured JSON output

        Phase 1 Implementation
        """
        import json
        import re

        # Add instruction to return only JSON
        json_instruction = "\n\nIMPORTANT: Return ONLY valid JSON, no additional text or explanation."
        full_prompt = prompt + json_instruction

        # Generate response
        response = await self.generate(
            prompt=full_prompt,
            model=model,
            system_prompt=system_prompt,
            temperature=0.3  # Lower temperature for more consistent JSON
        )

        # Extract JSON from response (in case LLM adds extra text)
        try:
            # Try to parse directly first
            return json.loads(response)
        except json.JSONDecodeError:
            # Try to find JSON in the response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                raise Exception(f"Failed to parse JSON from LLM response: {response[:200]}")

    async def check_health(self) -> bool:
        """
        Check if Ollama is running and accessible

        Phase 1 Implementation
        """
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
        except Exception:
            return False

    async def list_models(self) -> list:
        """
        List available models in Ollama

        Phase 1 Implementation
        """
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
                data = response.json()
                return [model.get("name", "") for model in data.get("models", [])]
        except Exception:
            return []
