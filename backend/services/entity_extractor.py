"""
Entity Extraction Service
Extracts entities, attributes, and relationships from prompts
"""

from typing import Dict, Any, List
from .llm_service import LLMService
from .fast_llm_service import FastLLMService
from config import settings
import os


class EntityExtractor:
    """Service for extracting database structure from natural language"""

    def __init__(self):
        # Use fast Groq LLM if configured, otherwise fallback to slow Ollama
        if settings.USE_GROQ and settings.GROQ_API_KEY:
            self.llm_service = FastLLMService()
            print("[INFO] Using FAST Groq LLM for entity extraction!")
        else:
            self.llm_service = LLMService()
            print("[WARN] Using slow Ollama LLM - consider setting GROQ_API_KEY for speed")

        # Load extraction prompt template
        prompts_dir = os.path.join(os.path.dirname(__file__), "..", "prompts")
        with open(os.path.join(prompts_dir, "extraction_prompt.txt"), "r") as f:
            self.extraction_template = f.read()

    async def extract_structure(self, prompt: str) -> Dict[str, Any]:
        """
        Extract complete database structure from prompt

        Returns both entities and relationships in one call
        """
        # Format the extraction prompt
        formatted_prompt = self.extraction_template.format(prompt=prompt)

        print(f"\n[EXTRACTION] Processing prompt: {prompt[:100]}...")
        print(f"[EXTRACTION] Formatted prompt length: {len(formatted_prompt)} chars")

        # Get JSON response from LLM
        try:
            result = await self.llm_service.generate_json(
                prompt=formatted_prompt,
                model=None  # Use primary model
            )

            print(f"[EXTRACTION] LLM returned result type: {type(result)}")
            print(f"[EXTRACTION] Result keys: {result.keys() if isinstance(result, dict) else 'NOT A DICT'}")

            if isinstance(result, dict):
                entity_count = len(result.get("entities", []))
                rel_count = len(result.get("relationships", []))
                print(f"[EXTRACTION] SUCCESS: Found {entity_count} entities, {rel_count} relationships")

                if entity_count > 0:
                    print(f"[EXTRACTION] First entity: {result['entities'][0].get('name', 'UNNAMED')}")
            else:
                print(f"[EXTRACTION] ERROR: Result is not a dict: {result}")

            return result
        except Exception as e:
            # Return empty structure if extraction fails
            print(f"[EXTRACTION] FATAL ERROR: {str(e)}")
            print(f"[EXTRACTION] Error type: {type(e).__name__}")
            import traceback
            traceback.print_exc()

            return {
                "entities": [],
                "relationships": []
            }

    async def extract_entities(self, prompt: str) -> List[Dict[str, Any]]:
        """
        Extract entities from prompt

        Phase 1 Implementation

        Returns:
            [
                {
                    "name": "Student",
                    "attributes": [...],
                    "primary_key": "id"
                }
            ]
        """
        structure = await self.extract_structure(prompt)
        return structure.get("entities", [])

    async def extract_relationships(
        self,
        prompt: str,
        entities: List[Dict]
    ) -> List[Dict[str, Any]]:
        """
        Extract relationships between entities

        Phase 1 Implementation

        Returns:
            [
                {
                    "source": "Student",
                    "target": "Application",
                    "type": "one_to_many",
                    "name": "applies"
                }
            ]
        """
        structure = await self.extract_structure(prompt)
        return structure.get("relationships", [])

    async def infer_attributes(
        self,
        entity_name: str,
        context: str
    ) -> List[Dict[str, Any]]:
        """
        Infer typical attributes for an entity

        Phase 1 Implementation
        """
        # This is handled by the extraction template
        # which already includes intelligent attribute inference
        return []
