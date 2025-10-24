"""
PlantUML Diagram Generator
Generates PlantUML class diagrams from metamodel
"""

from typing import Dict, Any
from models.metamodel import Metamodel, Entity, Relationship, DataType


class PlantUMLGenerator:
    """Generates PlantUML diagrams from metamodel"""

    def generate(self, metamodel: Metamodel) -> str:
        """
        Generate PlantUML class diagram from metamodel

        Args:
            metamodel: The database metamodel

        Returns:
            PlantUML diagram code as string
        """
        lines = ["@startuml"]
        lines.append("")

        # Add styling
        lines.append("skinparam classAttributeIconSize 0")
        lines.append("skinparam classFontSize 12")
        lines.append("skinparam packageStyle rectangle")
        lines.append("")

        # Generate classes for each entity
        for entity in metamodel.entities:
            lines.extend(self._generate_entity(entity))
            lines.append("")

        # Generate relationships
        for relationship in metamodel.relationships:
            lines.append(self._generate_relationship(relationship))

        lines.append("")
        lines.append("@enduml")

        return "\n".join(lines)

    def _generate_entity(self, entity: Entity) -> list:
        """Generate PlantUML class definition for an entity"""
        lines = []

        # Class header with description as note
        if entity.description:
            lines.append(f'class {entity.name} << (E,orchid) >> {{')
        else:
            lines.append(f'class {entity.name} {{')

        # Generate attributes
        for attr in entity.attributes:
            lines.append(f'    {self._generate_attribute(attr)}')

        lines.append('}')

        # Add description as note if exists
        if entity.description:
            lines.append(f'note right of {entity.name}')
            lines.append(f'  {entity.description}')
            lines.append('end note')

        return lines

    def _generate_attribute(self, attr) -> str:
        """Generate PlantUML attribute definition"""
        # Visibility marker
        if attr.is_primary_key:
            visibility = '+'
            marker = ' <<PK>>'
        elif attr.is_foreign_key:
            visibility = '#'
            marker = ' <<FK>>'
        else:
            visibility = '-'
            marker = ''

        # Data type with length - handle both string and Enum types
        data_type_value = str(attr.data_type.value) if hasattr(attr.data_type, 'value') else str(attr.data_type)
        if attr.length and data_type_value in ['VARCHAR', 'CHAR', 'DECIMAL']:
            data_type = f'{data_type_value}({attr.length})'
        else:
            data_type = data_type_value

        # Nullability indicator
        nullable = '' if attr.is_nullable else ' {not null}'

        # Unique indicator
        unique = ' {unique}' if attr.is_unique else ''

        # Build attribute string
        attr_str = f'{visibility}{attr.name}: {data_type}{marker}{nullable}{unique}'

        return attr_str

    def _generate_relationship(self, rel: Relationship) -> str:
        """Generate PlantUML relationship definition"""
        # Map cardinality to PlantUML notation
        cardinality_map = {
            'one_to_one': ('"1"', '"1"'),
            'one_to_many': ('"1"', '"*"'),
            'many_to_one': ('"*"', '"1"'),
            'many_to_many': ('"*"', '"*"'),
        }

        left_card, right_card = cardinality_map.get(
            rel.cardinality, ('"1"', '"*"')
        )

        # Relationship name
        rel_name = f': {rel.name}' if rel.name else ''

        # Generate relationship line
        rel_line = f'{rel.source_entity} {left_card} --> {right_card} {rel.target_entity}{rel_name}'

        return rel_line

    def generate_with_colors(self, metamodel: Metamodel) -> str:
        """
        Generate PlantUML diagram with color coding

        Different entity types get different colors:
        - Entities with many relationships: Blue
        - Entities with few relationships: Green
        - Junction tables (many-to-many): Yellow
        """
        lines = ["@startuml"]
        lines.append("")
        lines.append("skinparam classAttributeIconSize 0")
        lines.append("")

        # Count relationships for each entity
        relationship_counts = {}
        for entity in metamodel.entities:
            count = sum(
                1 for rel in metamodel.relationships
                if rel.source_entity == entity.name or rel.target_entity == entity.name
            )
            relationship_counts[entity.name] = count

        # Generate colored classes
        for entity in metamodel.entities:
            count = relationship_counts.get(entity.name, 0)

            # Determine color
            if count >= 5:
                color = '#ADD8E6'  # Light blue - highly connected
            elif count >= 3:
                color = '#90EE90'  # Light green - moderately connected
            elif count >= 1:
                color = '#FFE4B5'  # Moccasin - some connections
            else:
                color = '#FFFFFF'  # White - isolated

            lines.append(f'class {entity.name} {color} {{')

            for attr in entity.attributes:
                lines.append(f'    {self._generate_attribute(attr)}')

            lines.append('}')
            lines.append("")

        # Generate relationships
        for relationship in metamodel.relationships:
            lines.append(self._generate_relationship(relationship))

        lines.append("")
        lines.append("@enduml")

        return "\n".join(lines)
