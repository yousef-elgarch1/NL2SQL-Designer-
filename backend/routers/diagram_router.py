"""
Diagram Generation Router
Handles UML diagram generation and modification
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Literal
from services.entity_extractor import EntityExtractor
from services.uml_generator import UMLGenerator
from services.mermaid_service import MermaidService
from services.plantuml_generator import PlantUMLGenerator

router = APIRouter()

# Initialize services
entity_extractor = EntityExtractor()
uml_generator = UMLGenerator()
mermaid_service = MermaidService()
plantuml_generator = PlantUMLGenerator()


class DiagramGenerationRequest(BaseModel):
    """Request model for diagram generation"""
    prompt: str
    format: Literal["plantuml", "mermaid", "both"] = "both"
    style: str = "default"


class DiagramGenerationResponse(BaseModel):
    """Response model for diagram generation"""
    metamodel: dict
    plantuml_code: Optional[str] = None
    mermaid_code: Optional[str] = None
    diagram_image_base64: Optional[str] = None
    validation_status: str = "unknown"


class DiagramModificationRequest(BaseModel):
    """Request model for diagram modification"""
    current_metamodel: dict
    modification_prompt: str
    format: Literal["plantuml", "mermaid"] = "mermaid"


@router.post("/generate", response_model=DiagramGenerationResponse)
async def generate_diagram(request: DiagramGenerationRequest):
    """
    Generate UML diagram from validated prompt

    Phase 1 Implementation
    """
    try:
        # Step 1: Extract entities and relationships from prompt
        structure = await entity_extractor.extract_structure(request.prompt)
        entities = structure.get("entities", [])
        relationships = structure.get("relationships", [])

        # Step 2: Generate UML metamodel
        metamodel = uml_generator.generate_metamodel(entities, relationships)

        # Step 3: Validate metamodel
        validation = uml_generator.validate_metamodel(metamodel)
        validation_status = "valid" if validation.get("is_valid") else "invalid"

        # Step 4: Generate diagram code
        mermaid_code = None
        plantuml_code = None

        if request.format in ["mermaid", "both"]:
            mermaid_code = mermaid_service.generate_code(metamodel)

        if request.format in ["plantuml", "both"]:
            # Generate PlantUML diagram - Phase 2 implementation
            try:
                from models.metamodel import Metamodel
                metamodel_obj = Metamodel(**metamodel)
                plantuml_code = plantuml_generator.generate(metamodel_obj)
                print(f"[PLANTUML] SUCCESS: Generated {len(plantuml_code)} characters")
            except Exception as puml_err:
                print(f"[PLANTUML] ERROR: {str(puml_err)}")
                print(f"[PLANTUML] Metamodel type: {type(metamodel)}")
                print(f"[PLANTUML] Metamodel keys: {metamodel.keys() if isinstance(metamodel, dict) else 'not a dict'}")
                plantuml_code = None

        return DiagramGenerationResponse(
            metamodel=metamodel,
            mermaid_code=mermaid_code,
            plantuml_code=plantuml_code,
            diagram_image_base64=None,  # Image rendering in Phase 2
            validation_status=validation_status
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagram generation failed: {str(e)}")


@router.post("/modify")
async def modify_diagram(request: DiagramModificationRequest):
    """
    Modify existing diagram using natural language

    Phase 2 Implementation
    """
    # TODO: Implement in Phase 2
    raise HTTPException(status_code=501, detail="Not implemented yet - Phase 2")


@router.post("/validate")
async def validate_diagram(metamodel: dict):
    """
    Validate diagram structure

    Phase 1 Implementation
    """
    try:
        validation = uml_generator.validate_metamodel(metamodel)
        return validation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")
