"""
Real-time Prompt Validation Service
Analyzes prompts in real-time and highlights key components
"""

from typing import Dict, Any, List, Tuple
import re
from .fast_llm_service import FastLLMService
from config import settings


class RealtimeValidator:
    """Service for real-time prompt analysis and highlighting"""

    def __init__(self):
        # Use fast Groq LLM if configured
        if settings.USE_GROQ and settings.GROQ_API_KEY:
            self.llm_service = FastLLMService()
        else:
            self.llm_service = None

        # Keywords that indicate a good prompt
        self.entity_keywords = [
            r'\b(table|tables|entity|entities)\b',
            r'\b(user|users|customer|customers|client|clients)\b',
            r'\b(product|products|item|items)\b',
            r'\b(order|orders|purchase|purchases)\b',
            r'\b(book|books|author|authors)\b',
            r'\b(student|students|teacher|teachers|course|courses)\b',
            r'\b(patient|patients|doctor|doctors|appointment|appointments)\b',
            r'\b(invoice|invoices|payment|payments)\b',
        ]

        self.relationship_keywords = [
            r'\b(has|have|contains?|includes?)\b',
            r'\b(belongs? to|associated with|related to|linked to)\b',
            r'\b(one-to-many|many-to-one|one-to-one|many-to-many)\b',
            r'\b(foreign key|reference|references)\b',
        ]

        self.attribute_keywords = [
            r'\b(with|having|includes?|contains?)\b',
            r'\b(name|title|description|email|phone|address)\b',
            r'\b(date|time|timestamp|created|updated)\b',
            r'\b(id|identifier|primary key|key)\b',
            r'\b(price|cost|amount|quantity|total)\b',
            r'\b(status|state|active|inactive|enabled|disabled)\b',
        ]

        self.domain_keywords = [
            r'\b(library|bookstore|book management)\b',
            r'\b(e-commerce|shop|store|retail)\b',
            r'\b(hospital|clinic|medical|healthcare)\b',
            r'\b(school|university|education|learning)\b',
            r'\b(social media|social network|forum)\b',
            r'\b(bank|banking|finance|financial)\b',
            r'\b(hotel|reservation|booking)\b',
            r'\b(restaurant|food|menu|order)\b',
        ]

    def analyze_prompt_realtime(self, prompt: str) -> Dict[str, Any]:
        """
        Analyze prompt in real-time without LLM (fast, local analysis)

        Returns:
            {
                "highlights": [
                    {
                        "type": "entity|relationship|attribute|domain|missing",
                        "text": str,
                        "start": int,
                        "end": int,
                        "color": "green|red|yellow"
                    }
                ],
                "score": float (0-100),
                "detected": {
                    "entities": List[str],
                    "relationships": List[str],
                    "attributes": List[str],
                    "domain": str
                },
                "missing": {
                    "needs_entities": bool,
                    "needs_relationships": bool,
                    "needs_attributes": bool
                },
                "suggestions": List[str]
            }
        """
        if not prompt or len(prompt.strip()) < 10:
            return {
                "highlights": [],
                "score": 0,
                "detected": {
                    "entities": [],
                    "relationships": [],
                    "attributes": [],
                    "domain": None
                },
                "missing": {
                    "needs_entities": True,
                    "needs_relationships": True,
                    "needs_attributes": True
                },
                "suggestions": [
                    "Le prompt est trop court",
                    "Décrivez le domaine (bibliothèque, e-commerce, etc.)",
                    "Mentionnez les entités principales (tables)",
                    "Décrivez les relations entre les entités"
                ]
            }

        highlights = []
        detected_entities = []
        detected_relationships = []
        detected_attributes = []
        detected_domain = None

        # Detect domain
        for pattern in self.domain_keywords:
            matches = re.finditer(pattern, prompt, re.IGNORECASE)
            for match in matches:
                highlights.append({
                    "type": "domain",
                    "text": match.group(),
                    "start": match.start(),
                    "end": match.end(),
                    "color": "blue"
                })
                detected_domain = match.group()

        # Detect entities
        for pattern in self.entity_keywords:
            matches = re.finditer(pattern, prompt, re.IGNORECASE)
            for match in matches:
                highlights.append({
                    "type": "entity",
                    "text": match.group(),
                    "start": match.start(),
                    "end": match.end(),
                    "color": "green"
                })
                if match.group() not in detected_entities:
                    detected_entities.append(match.group())

        # Detect relationships
        for pattern in self.relationship_keywords:
            matches = re.finditer(pattern, prompt, re.IGNORECASE)
            for match in matches:
                highlights.append({
                    "type": "relationship",
                    "text": match.group(),
                    "start": match.start(),
                    "end": match.end(),
                    "color": "green"
                })
                if match.group() not in detected_relationships:
                    detected_relationships.append(match.group())

        # Detect attributes
        for pattern in self.attribute_keywords:
            matches = re.finditer(pattern, prompt, re.IGNORECASE)
            for match in matches:
                highlights.append({
                    "type": "attribute",
                    "text": match.group(),
                    "start": match.start(),
                    "end": match.end(),
                    "color": "green"
                })
                if match.group() not in detected_attributes:
                    detected_attributes.append(match.group())

        # Calculate score
        score = self._calculate_score(
            len(detected_entities),
            len(detected_relationships),
            len(detected_attributes),
            detected_domain is not None,
            len(prompt)
        )

        # Determine what's missing
        missing = {
            "needs_entities": len(detected_entities) < 2,
            "needs_relationships": len(detected_relationships) == 0,
            "needs_attributes": len(detected_attributes) < 3
        }

        # Generate suggestions
        suggestions = self._generate_suggestions(missing, detected_entities, detected_domain)

        # Add missing indicators to highlights
        if missing["needs_entities"]:
            # Find good positions to suggest entities
            if "create" in prompt.lower() or "database" in prompt.lower():
                match = re.search(r'\b(create|database|system)\b', prompt, re.IGNORECASE)
                if match:
                    highlights.append({
                        "type": "missing",
                        "text": "❓ Entités manquantes",
                        "start": match.end(),
                        "end": match.end() + 1,
                        "color": "red"
                    })

        return {
            "highlights": sorted(highlights, key=lambda x: x["start"]),
            "score": score,
            "detected": {
                "entities": detected_entities,
                "relationships": detected_relationships,
                "attributes": detected_attributes,
                "domain": detected_domain
            },
            "missing": missing,
            "suggestions": suggestions
        }

    def _calculate_score(
        self,
        entity_count: int,
        relationship_count: int,
        attribute_count: int,
        has_domain: bool,
        prompt_length: int
    ) -> float:
        """Calculate prompt quality score (0-100)"""
        score = 0.0

        # Domain mentioned: +20 points
        if has_domain:
            score += 20

        # Entities: up to 30 points
        if entity_count >= 3:
            score += 30
        elif entity_count == 2:
            score += 20
        elif entity_count == 1:
            score += 10

        # Relationships: up to 25 points
        if relationship_count >= 2:
            score += 25
        elif relationship_count == 1:
            score += 15

        # Attributes: up to 20 points
        if attribute_count >= 5:
            score += 20
        elif attribute_count >= 3:
            score += 15
        elif attribute_count >= 1:
            score += 10

        # Length bonus: up to 5 points
        if prompt_length >= 100:
            score += 5
        elif prompt_length >= 50:
            score += 3

        return min(score, 100.0)

    def _generate_suggestions(
        self,
        missing: Dict[str, bool],
        detected_entities: List[str],
        detected_domain: str
    ) -> List[str]:
        """Generate helpful suggestions based on what's missing"""
        suggestions = []

        if missing["needs_entities"]:
            suggestions.append(
                "💡 Mentionnez au moins 2-3 entités principales (ex: utilisateurs, produits, commandes)"
            )

        if missing["needs_relationships"]:
            suggestions.append(
                "💡 Décrivez comment les entités sont liées (ex: 'un utilisateur a plusieurs commandes')"
            )

        if missing["needs_attributes"]:
            suggestions.append(
                "💡 Ajoutez des détails sur les attributs (ex: nom, email, date, prix)"
            )

        if not detected_domain:
            suggestions.append(
                "💡 Précisez le domaine (ex: bibliothèque, e-commerce, hopital, école)"
            )

        if len(detected_entities) > 0 and len(suggestions) == 0:
            suggestions.append(
                "✅ Votre prompt semble complet ! Vous pouvez continuer."
            )

        return suggestions

    async def analyze_with_llm(self, prompt: str) -> Dict[str, Any]:
        """
        Deep analysis using LLM (slower but more accurate)
        Call this on user request or when local analysis is uncertain
        """
        if not self.llm_service:
            return {"error": "LLM service not available"}

        analysis_prompt = f"""Analyze this database description prompt and provide a detailed assessment:

PROMPT: {prompt}

Return JSON with:
{{
    "quality_score": 0-100,
    "detected_entities": ["Entity1", "Entity2"],
    "detected_relationships": ["relationship description"],
    "missing_components": ["what's missing"],
    "suggestions": ["specific suggestions"],
    "inferred_schema": {{
        "entities": [
            {{"name": "Entity", "likely_attributes": ["attr1", "attr2"]}}
        ]
    }}
}}"""

        try:
            result = await self.llm_service.generate_json(prompt=analysis_prompt)
            return result
        except Exception as e:
            return {"error": f"LLM analysis failed: {str(e)}"}
