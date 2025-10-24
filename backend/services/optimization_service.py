"""
AI-Powered Schema Optimization Service
Analyzes database schemas and provides optimization suggestions
"""

from typing import Dict, Any, List
from models.metamodel import Metamodel
import os
from services.llm_service import LLMService


class OptimizationService:
    """Service for analyzing schemas and suggesting optimizations"""

    def __init__(self):
        self.llm = LLMService()

    def analyze_schema(self, metamodel: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze schema and provide optimization suggestions

        Returns suggestions for:
        - Indexes
        - Normalization
        - Data types
        - Security
        - Performance
        """
        suggestions = {
            "index_suggestions": self._analyze_indexes(metamodel),
            "normalization_suggestions": self._analyze_normalization(metamodel),
            "datatype_suggestions": self._analyze_datatypes(metamodel),
            "security_suggestions": self._analyze_security(metamodel),
            "performance_suggestions": self._analyze_performance(metamodel),
            "overall_score": 0,
            "summary": ""
        }

        # Calculate overall score
        total_suggestions = sum(len(v) for v in suggestions.values() if isinstance(v, list))
        suggestions["overall_score"] = max(0, 100 - (total_suggestions * 5))

        # Generate summary
        if suggestions["overall_score"] >= 90:
            suggestions["summary"] = "Excellent schema design! Minor improvements suggested."
        elif suggestions["overall_score"] >= 75:
            suggestions["summary"] = "Good schema with room for optimization."
        elif suggestions["overall_score"] >= 50:
            suggestions["summary"] = "Schema needs several improvements for better performance."
        else:
            suggestions["summary"] = "Schema requires significant optimization."

        return suggestions

    def _analyze_indexes(self, metamodel: Dict[str, Any]) -> List[Dict[str, str]]:
        """Suggest indexes for foreign keys and frequently queried columns"""
        suggestions = []
        entities = metamodel.get("entities", [])

        for entity in entities:
            for attr in entity.get("attributes", []):
                # Suggest index for foreign keys
                if attr.get("is_foreign_key") and not attr.get("is_primary_key"):
                    suggestions.append({
                        "type": "index",
                        "severity": "medium",
                        "entity": entity["name"],
                        "column": attr["name"],
                        "suggestion": f"Add index on {entity['name']}.{attr['name']} for better JOIN performance",
                        "code": f"CREATE INDEX idx_{entity['name']}_{attr['name']} ON {entity['name']}({attr['name']});"
                    })

                # Suggest index for unique columns
                if attr.get("is_unique") and not attr.get("is_primary_key"):
                    suggestions.append({
                        "type": "index",
                        "severity": "low",
                        "entity": entity["name"],
                        "column": attr["name"],
                        "suggestion": f"Consider unique index on {entity['name']}.{attr['name']}",
                        "code": f"CREATE UNIQUE INDEX idx_{entity['name']}_{attr['name']} ON {entity['name']}({attr['name']});"
                    })

        return suggestions

    def _analyze_normalization(self, metamodel: Dict[str, Any]) -> List[Dict[str, str]]:
        """Check for normalization issues"""
        suggestions = []
        entities = metamodel.get("entities", [])

        for entity in entities:
            attrs = entity.get("attributes", [])

            # Check if entity has too many columns (denormalized)
            if len(attrs) > 15:
                suggestions.append({
                    "type": "normalization",
                    "severity": "medium",
                    "entity": entity["name"],
                    "suggestion": f"{entity['name']} has {len(attrs)} columns. Consider splitting into multiple related tables.",
                })

            # Check for missing primary key
            has_pk = any(attr.get("is_primary_key") for attr in attrs)
            if not has_pk:
                suggestions.append({
                    "type": "normalization",
                    "severity": "high",
                    "entity": entity["name"],
                    "suggestion": f"{entity['name']} is missing a primary key. Add an 'id' column.",
                })

        return suggestions

    def _analyze_datatypes(self, metamodel: Dict[str, Any]) -> List[Dict[str, str]]:
        """Suggest better data types"""
        suggestions = []
        entities = metamodel.get("entities", [])

        for entity in entities:
            for attr in entity.get("attributes", []):
                attr_name = attr["name"].lower()
                data_type = attr.get("data_type", "")

                # Suggest TIMESTAMP for created_at/updated_at
                if "created" in attr_name or "updated" in attr_name or "deleted" in attr_name:
                    if data_type not in ["TIMESTAMP", "DATETIME"]:
                        suggestions.append({
                            "type": "datatype",
                            "severity": "low",
                            "entity": entity["name"],
                            "column": attr["name"],
                            "suggestion": f"Use TIMESTAMP for {attr['name']} instead of {data_type}",
                        })

                # Suggest VARCHAR with length for text columns
                if data_type == "VARCHAR" and not attr.get("length"):
                    suggestions.append({
                        "type": "datatype",
                        "severity": "medium",
                        "entity": entity["name"],
                        "column": attr["name"],
                        "suggestion": f"Specify length for VARCHAR column {attr['name']} (e.g., VARCHAR(255))",
                    })

                # Suggest TEXT for long content
                if "description" in attr_name or "content" in attr_name or "bio" in attr_name:
                    if data_type != "TEXT":
                        suggestions.append({
                            "type": "datatype",
                            "severity": "low",
                            "entity": entity["name"],
                            "column": attr["name"],
                            "suggestion": f"Consider TEXT type for {attr['name']} to store longer content",
                        })

        return suggestions

    def _analyze_security(self, metamodel: Dict[str, Any]) -> List[Dict[str, str]]:
        """Check for security issues"""
        suggestions = []
        entities = metamodel.get("entities", [])

        for entity in entities:
            for attr in entity.get("attributes", []):
                attr_name = attr["name"].lower()

                # Check for password field without hashing note
                if "password" in attr_name or "passwd" in attr_name:
                    suggestions.append({
                        "type": "security",
                        "severity": "high",
                        "entity": entity["name"],
                        "column": attr["name"],
                        "suggestion": f"IMPORTANT: Hash passwords before storing. Never store plain text passwords!",
                        "recommendation": "Use bcrypt, Argon2, or similar for password hashing"
                    })

                # Check for sensitive data
                if any(keyword in attr_name for keyword in ["ssn", "social_security", "credit_card", "card_number"]):
                    suggestions.append({
                        "type": "security",
                        "severity": "high",
                        "entity": entity["name"],
                        "column": attr["name"],
                        "suggestion": f"Encrypt sensitive data in {attr['name']} at rest and in transit",
                        "recommendation": "Consider using database encryption or application-level encryption"
                    })

                # Email should have validation
                if "email" in attr_name:
                    suggestions.append({
                        "type": "security",
                        "severity": "low",
                        "entity": entity["name"],
                        "column": attr["name"],
                        "suggestion": f"Add email validation constraint on {attr['name']}",
                        "recommendation": "Use CHECK constraint or application-level validation"
                    })

        return suggestions

    def _analyze_performance(self, metamodel: Dict[str, Any]) -> List[Dict[str, str]]:
        """Performance optimization suggestions"""
        suggestions = []
        entities = metamodel.get("entities", [])
        relationships = metamodel.get("relationships", [])

        # Check for many-to-many relationships without junction table
        for rel in relationships:
            if rel.get("cardinality") == "many_to_many":
                # Should have a junction table
                junction_found = False
                for entity in entities:
                    if f"{rel['source_entity']}_{rel['target_entity']}" in entity["name"].lower():
                        junction_found = True
                        break

                if not junction_found:
                    suggestions.append({
                        "type": "performance",
                        "severity": "medium",
                        "suggestion": f"Create junction table for many-to-many relationship between {rel['source_entity']} and {rel['target_entity']}",
                        "recommendation": f"Create table {rel['source_entity']}_{rel['target_entity']} with foreign keys to both tables"
                    })

        # Check for circular dependencies
        entity_names = [e["name"] for e in entities]
        for rel in relationships:
            if rel["source_entity"] == rel["target_entity"]:
                suggestions.append({
                    "type": "performance",
                    "severity": "low",
                    "entity": rel["source_entity"],
                    "suggestion": f"Self-referencing relationship in {rel['source_entity']}. Ensure proper indexes to avoid slow queries.",
                })

        return suggestions
