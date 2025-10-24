"""
UML Metamodel Generator
Creates internal UML metamodel representation
"""

from typing import Dict, Any, List
from models.metamodel import Entity, Relationship, Attribute, Metamodel, DataType, CardinalityType


class UMLGenerator:
    """Service for generating UML metamodel"""

    def generate_metamodel(
        self,
        entities: List[Dict],
        relationships: List[Dict]
    ) -> Dict[str, Any]:
        """
        Generate UML metamodel from entities and relationships

        Phase 1 Implementation

        Returns:
            {
                "entities": [...],
                "relationships": [...],
                "metadata": {...}
            }
        """
        # Convert dictionaries to Pydantic models
        entity_models = []
        for entity_dict in entities:
            # Convert attributes
            attributes = []
            for attr_dict in entity_dict.get("attributes", []):
                attribute = Attribute(
                    name=attr_dict.get("name", ""),
                    data_type=DataType(attr_dict.get("data_type", "VARCHAR")),
                    length=attr_dict.get("length"),
                    is_primary_key=attr_dict.get("is_primary_key", False),
                    is_foreign_key=attr_dict.get("is_foreign_key", False),
                    is_unique=attr_dict.get("is_unique", False),
                    is_nullable=attr_dict.get("is_nullable", True),
                    default_value=attr_dict.get("default_value"),
                    description=attr_dict.get("description")
                )
                attributes.append(attribute)

            entity = Entity(
                name=entity_dict.get("name", ""),
                attributes=attributes,
                description=entity_dict.get("description")
            )
            entity_models.append(entity)

        # Convert relationships
        relationship_models = []
        for rel_dict in relationships:
            relationship = Relationship(
                name=rel_dict.get("name", ""),
                source_entity=rel_dict.get("source_entity", ""),
                target_entity=rel_dict.get("target_entity", ""),
                cardinality=CardinalityType(rel_dict.get("cardinality", "one_to_many")),
                source_foreign_key=rel_dict.get("source_foreign_key"),
                target_foreign_key=rel_dict.get("target_foreign_key"),
                description=rel_dict.get("description")
            )
            relationship_models.append(relationship)

        # Create metamodel
        metamodel = Metamodel(
            entities=entity_models,
            relationships=relationship_models,
            metadata={"version": "1.0"}
        )

        # Convert to dict for JSON serialization
        return metamodel.model_dump()

    def validate_metamodel(self, metamodel: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate metamodel structure

        Phase 1 Implementation

        Returns:
            {
                "is_valid": bool,
                "errors": List[str],
                "warnings": List[str]
            }
        """
        try:
            # Recreate Metamodel from dict to validate
            metamodel_obj = Metamodel(**metamodel)
            validation_result = metamodel_obj.validate()
            return validation_result
        except Exception as e:
            return {
                "is_valid": False,
                "errors": [str(e)],
                "warnings": []
            }

    def _check_primary_keys(self, entities: List[Dict]) -> List[str]:
        """Check if all entities have primary keys"""
        errors = []
        for entity in entities:
            has_pk = any(
                attr.get("is_primary_key", False)
                for attr in entity.get("attributes", [])
            )
            if not has_pk:
                errors.append(f"Entity '{entity.get('name')}' has no primary key")
        return errors

    def _check_foreign_keys(self, relationships: List[Dict]) -> List[str]:
        """Check if all relationships have proper foreign keys"""
        warnings = []
        for rel in relationships:
            if not rel.get("source_foreign_key") and not rel.get("target_foreign_key"):
                warnings.append(f"Relationship '{rel.get('name')}' has no foreign key defined")
        return warnings
