"""
Mermaid Service
Generates Mermaid diagram code
"""

from typing import Dict, Any


class MermaidService:
    """Service for Mermaid diagram code generation"""

    def generate_code(self, metamodel: Dict[str, Any]) -> str:
        """
        Generate Mermaid code from metamodel

        Phase 1 Implementation

        Returns Mermaid syntax like:
            classDiagram
            class Student {
                +INTEGER id
                +VARCHAR name
            }
            Student "1" --> "*" Application
        """
        lines = ["classDiagram"]

        entities = metamodel.get("entities", [])
        relationships = metamodel.get("relationships", [])

        # Generate entity classes
        for entity in entities:
            lines.append(f"    class {entity['name']} {{")

            for attr in entity.get("attributes", []):
                # Format: +TYPE name
                type_str = attr.get("data_type", "VARCHAR")
                if attr.get("length"):
                    type_str += f"({attr['length']})"

                markers = []
                if attr.get("is_primary_key"):
                    markers.append("PK")
                if attr.get("is_foreign_key"):
                    markers.append("FK")
                if attr.get("is_unique"):
                    markers.append("UNIQUE")

                marker_str = f" <<{','.join(markers)}>>" if markers else ""
                lines.append(f"        +{type_str} {attr['name']}{marker_str}")

            lines.append("    }")
            lines.append("")

        # Generate relationships
        for rel in relationships:
            cardinality_map = self._map_cardinality(rel.get("cardinality", "one_to_many"))
            source = rel.get("source_entity", "")
            target = rel.get("target_entity", "")
            name = rel.get("name", "")

            lines.append(f"    {source} {cardinality_map} {target} : {name}")

        return "\n".join(lines)

    def _format_entity(self, entity: Dict) -> str:
        """Format single entity in Mermaid syntax"""
        # Implemented in generate_code
        return ""

    def _format_relationship(self, relationship: Dict) -> str:
        """Format relationship in Mermaid syntax"""
        # Implemented in generate_code
        return ""

    def _map_cardinality(self, cardinality: str) -> str:
        """Map internal cardinality to Mermaid notation"""
        mapping = {
            "one_to_one": '"1" -- "1"',
            "one_to_many": '"1" --> "*"',
            "many_to_one": '"*" --> "1"',
            "many_to_many": '"*" --> "*"'
        }
        return mapping.get(cardinality, '"*" --> "*"')
