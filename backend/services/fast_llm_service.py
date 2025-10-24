"""
Fast LLM Service using Groq API
Super fast responses (1-2 seconds instead of 5+ minutes!)
"""

from groq import Groq
from typing import Optional, Dict, Any
import json
import re


class FastLLMService:
    """Service for interacting with Groq LLM (SUPER FAST!)"""

    def __init__(self):
        # Get API key from settings (not os.environ!)
        from config import settings
        self.api_key = settings.GROQ_API_KEY
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in settings. Please set it in .env file")

        self.client = Groq(api_key=self.api_key)
        # Using smaller/faster Groq models to avoid rate limits
        self.primary_model = "llama-3.1-8b-instant"  # Faster, uses less tokens
        self.secondary_model = "llama-3.1-8b-instant"  # Use same for consistency

    async def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> str:
        """
        Generate text using Groq (SUPER FAST - 1-2 seconds!)

        Args:
            prompt: The user prompt
            model: Model to use (defaults to primary_model)
            system_prompt: Optional system prompt
            temperature: Sampling temperature (0.0-2.0)
            max_tokens: Maximum tokens to generate

        Returns:
            Generated text
        """
        if model is None:
            model = self.primary_model

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens or 1024,
                top_p=1,
                stream=False
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Groq API error: {str(e)}")

    async def generate_json(
        self,
        prompt: str,
        model: Optional[str] = None,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate structured JSON output (FAST!)

        Args:
            prompt: The prompt requesting JSON output
            model: Model to use
            system_prompt: Optional system prompt

        Returns:
            Parsed JSON dictionary
        """
        # Add instruction to return only JSON
        json_instruction = "\n\nIMPORTANT: Return ONLY valid JSON with proper syntax. Ensure all commas, brackets, and quotes are correct."
        full_prompt = prompt + json_instruction

        # Use PRIMARY model (70B) for complex JSON - more reliable
        if model is None:
            model = self.primary_model  # Use 70B for better accuracy

        # Generate response with higher token limit
        response = await self.generate(
            prompt=full_prompt,
            model=model,
            system_prompt=system_prompt,
            temperature=0.1,  # Very low temperature for consistent JSON
            max_tokens=8000  # Increased from 2000 to handle complex schemas
        )

        print(f"[FAST_LLM] Raw LLM response length: {len(response)} chars")
        print(f"[FAST_LLM] First 500 chars: {response[:500]}")
        print(f"[FAST_LLM] Last 200 chars: {response[-200:]}")

        # Extract JSON from response (in case LLM adds extra text)
        try:
            # Try to parse directly first
            parsed = json.loads(response)
            print(f"[FAST_LLM] SUCCESS: Parsed JSON directly")
            return parsed
        except json.JSONDecodeError as e:
            print(f"[FAST_LLM] ERROR: Direct JSON parse failed: {str(e)}")
            print(f"[FAST_LLM] Error at position: {e.pos}")

            # Try to find JSON in the response using regex
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                try:
                    parsed = json.loads(json_str)
                    print(f"[FAST_LLM] SUCCESS: Extracted JSON with regex")
                    return parsed
                except json.JSONDecodeError as e2:
                    print(f"[FAST_LLM] ERROR: Regex-extracted JSON also invalid: {str(e2)}")

                    # Try to fix common JSON errors
                    print(f"[FAST_LLM] Attempting to fix JSON...")
                    fixed_json = self._try_fix_json(json_str)
                    if fixed_json:
                        print(f"[FAST_LLM] SUCCESS: Fixed and parsed JSON")
                        return fixed_json
                    else:
                        print(f"[FAST_LLM] ERROR: Could not fix JSON")
                        raise Exception(f"Failed to parse JSON. Error: {str(e)}")
            else:
                print(f"[FAST_LLM] ERROR: No JSON found in response")
                raise Exception(f"Failed to parse JSON from LLM response: {response[:200]}")

    def _try_fix_json(self, json_str: str) -> Optional[Dict[str, Any]]:
        """
        Attempt to fix common JSON syntax errors
        """
        try:
            # Remove trailing commas before closing brackets/braces
            fixed = re.sub(r',(\s*[}\]])', r'\1', json_str)

            # Try to parse the fixed version
            return json.loads(fixed)
        except:
            return None

    async def check_health(self) -> bool:
        """
        Check if Groq API is accessible

        Returns:
            True if API is working
        """
        try:
            response = self.client.chat.completions.create(
                model=self.secondary_model,
                messages=[{"role": "user", "content": "Hi"}],
                max_tokens=5
            )
            return True
        except Exception:
            return False

    async def list_models(self) -> list:
        """
        List available models

        Returns:
            List of model names
        """
        return [
            "llama-3.1-70b-versatile",
            "llama-3.1-8b-instant",
            "mixtral-8x7b-32768",
            "gemma2-9b-it"
        ]
