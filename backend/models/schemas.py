"""
Pydantic Schemas for API Requests/Responses
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal


# ============= Prompt Validation Schemas =============

class PromptValidationRequest(BaseModel):
    """Request for prompt validation"""
    prompt: str = Field(..., min_length=10, description="User's natural language prompt")
    domain_hint: Optional[str] = Field(None, description="Optional domain hint")


class PromptValidationResponse(BaseModel):
    """Response from prompt validation"""
    is_complete: bool
    detected_domain: Optional[str] = None
    detected_entities: List[str] = []
    inferred_entities: List[str] = []
    missing_info: List[str] = []
    suggestions: List[str] = []
    confidence: float = Field(ge=0.0, le=1.0)


# ============= Diagram Generation Schemas =============

class DiagramGenerationRequest(BaseModel):
    """Request for diagram generation"""
    prompt: str
    format: Literal["plantuml", "mermaid", "both"] = "both"
    style: str = "default"


class DiagramGenerationResponse(BaseModel):
    """Response from diagram generation"""
    metamodel: Dict[str, Any]
    plantuml_code: Optional[str] = None
    mermaid_code: Optional[str] = None
    diagram_image_base64: Optional[str] = None
    validation_status: str


# ============= SQL Generation Schemas =============

class SQLGenerationOptions(BaseModel):
    """Options for SQL generation"""
    add_indexes: bool = True
    add_constraints: bool = True
    include_comments: bool = True


class SQLGenerationRequest(BaseModel):
    """Request for SQL generation"""
    metamodel: Dict[str, Any]
    dbms: Literal["postgresql", "mysql", "oracle", "sqlserver"] = "postgresql"
    options: SQLGenerationOptions = SQLGenerationOptions()


class SQLValidation(BaseModel):
    """SQL validation result"""
    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []


class SQLStatistics(BaseModel):
    """SQL script statistics"""
    tables: int = 0
    relationships: int = 0
    lines_of_code: int = 0


class SQLGenerationResponse(BaseModel):
    """Response from SQL generation"""
    sql_script: str
    validation: SQLValidation
    statistics: SQLStatistics


# ============= Database Execution Schemas =============

class DatabaseConnectionConfig(BaseModel):
    """Database connection configuration"""
    host: str = "localhost"
    port: int
    username: str
    password: str
    database_name: str


class DatabaseCreationOptions(BaseModel):
    """Options for database creation"""
    create_if_not_exists: bool = True
    drop_if_exists: bool = False


class DatabaseCreationRequest(BaseModel):
    """Request for database creation"""
    dbms: Literal["postgresql", "mysql", "oracle", "sqlserver"]
    connection: DatabaseConnectionConfig
    sql_script: str
    options: DatabaseCreationOptions = DatabaseCreationOptions()


class DatabaseCreationResponse(BaseModel):
    """Response from database creation"""
    success: bool
    message: str
    tables_created: List[str] = []
    execution_time_ms: int = 0


# ============= Export Schemas =============

class ExportOptions(BaseModel):
    """Options for export"""
    include_documentation: bool = True
    image_resolution: Literal["low", "medium", "high"] = "high"


class ExportRequest(BaseModel):
    """Request for export"""
    metamodel: Dict[str, Any]
    format: Literal["sql", "pdf", "png", "json", "plantuml", "mermaid"]
    options: ExportOptions = ExportOptions()


class ExportResponse(BaseModel):
    """Response from export"""
    file_url: str
    file_size_bytes: int
    format: str
