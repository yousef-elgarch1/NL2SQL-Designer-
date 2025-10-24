"""
UML Metamodel Classes
Core data structures for database schema representation
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class DataType(str, Enum):
    """Supported data types"""
    INTEGER = "INTEGER"
    BIGINT = "BIGINT"
    VARCHAR = "VARCHAR"
    CHAR = "CHAR"
    TEXT = "TEXT"
    DATE = "DATE"
    TIME = "TIME"
    TIMESTAMP = "TIMESTAMP"
    DATETIME = "DATETIME"
    BOOLEAN = "BOOLEAN"
    DECIMAL = "DECIMAL"
    FLOAT = "FLOAT"
    DOUBLE = "DOUBLE"
    REAL = "REAL"
    JSON = "JSON"
    BLOB = "BLOB"


class CardinalityType(str, Enum):
    """Relationship cardinality types"""
    ONE_TO_ONE = "one_to_one"
    ONE_TO_MANY = "one_to_many"
    MANY_TO_ONE = "many_to_one"
    MANY_TO_MANY = "many_to_many"


class Attribute(BaseModel):
    """Entity attribute/column"""
    name: str
    data_type: DataType
    length: Optional[int] = None
    is_primary_key: bool = False
    is_foreign_key: bool = False
    is_unique: bool = False
    is_nullable: bool = True
    default_value: Optional[Any] = None
    description: Optional[str] = None


class Entity(BaseModel):
    """Database entity/table"""
    name: str
    attributes: List[Attribute] = []
    description: Optional[str] = None
    position: Optional[Dict[str, int]] = None  # For visual editor (x, y)

    def get_primary_key(self) -> Optional[Attribute]:
        """Get primary key attribute"""
        for attr in self.attributes:
            if attr.is_primary_key:
                return attr
        return None


class Relationship(BaseModel):
    """Relationship between entities"""
    name: str
    source_entity: str
    target_entity: str
    cardinality: CardinalityType
    source_foreign_key: Optional[str] = None
    target_foreign_key: Optional[str] = None
    description: Optional[str] = None


class Metamodel(BaseModel):
    """Complete UML metamodel"""
    entities: List[Entity] = []
    relationships: List[Relationship] = []
    metadata: Dict[str, Any] = {}

    def get_entity(self, name: str) -> Optional[Entity]:
        """Get entity by name"""
        for entity in self.entities:
            if entity.name == name:
                return entity
        return None

    def validate(self) -> Dict[str, Any]:
        """
        Validate metamodel structure

        Returns:
            {
                "is_valid": bool,
                "errors": List[str],
                "warnings": List[str]
            }
        """
        errors = []
        warnings = []

        # Check if all entities have primary keys
        for entity in self.entities:
            if not entity.get_primary_key():
                errors.append(f"Entity '{entity.name}' has no primary key")

        # Check if relationships reference valid entities
        entity_names = {e.name for e in self.entities}
        for rel in self.relationships:
            if rel.source_entity not in entity_names:
                errors.append(f"Relationship '{rel.name}' references unknown entity '{rel.source_entity}'")
            if rel.target_entity not in entity_names:
                errors.append(f"Relationship '{rel.name}' references unknown entity '{rel.target_entity}'")

        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }
