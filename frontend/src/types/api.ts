/**
 * TypeScript types for API requests and responses
 */

import { Metamodel } from './metamodel'

// ============= Prompt Validation =============

export interface PromptValidationRequest {
  prompt: string
  domain_hint?: string | null
}

export interface PromptValidationResponse {
  is_complete: boolean
  detected_domain?: string | null
  detected_entities: string[]
  inferred_entities: string[]
  missing_info: string[]
  suggestions: string[]
  confidence: number
}

// ============= Diagram Generation =============

export interface DiagramGenerationRequest {
  prompt: string
  format: 'plantuml' | 'mermaid' | 'both'
  style?: string
}

export interface DiagramGenerationResponse {
  metamodel: Metamodel
  plantuml_code?: string | null
  mermaid_code?: string | null
  diagram_image_base64?: string | null
  validation_status: string
}

// ============= SQL Generation =============

export interface SQLGenerationOptions {
  add_indexes: boolean
  add_constraints: boolean
  include_comments: boolean
}

export interface SQLGenerationRequest {
  metamodel: Metamodel
  dbms: 'postgresql' | 'mysql' | 'oracle' | 'sqlserver'
  options?: SQLGenerationOptions
}

export interface SQLValidation {
  is_valid: boolean
  errors: string[]
  warnings: string[]
}

export interface SQLStatistics {
  tables: number
  relationships: number
  lines_of_code: number
}

export interface SQLGenerationResponse {
  sql_script: string
  validation: SQLValidation
  statistics: SQLStatistics
}

// ============= Database Execution =============

export interface DatabaseConnectionConfig {
  host: string
  port: number
  username: string
  password: string
  database_name: string
}

export interface DatabaseCreationRequest {
  dbms: 'postgresql' | 'mysql' | 'oracle' | 'sqlserver'
  connection: DatabaseConnectionConfig
  sql_script: string
  options?: {
    create_if_not_exists: boolean
    drop_if_exists: boolean
  }
}

export interface DatabaseCreationResponse {
  success: boolean
  message: string
  tables_created: string[]
  execution_time_ms: number
}

// ============= Export =============

export interface ExportRequest {
  metamodel: Metamodel
  format: 'sql' | 'pdf' | 'png' | 'json' | 'plantuml' | 'mermaid'
  options?: {
    include_documentation: boolean
    image_resolution: 'low' | 'medium' | 'high'
  }
}

export interface ExportResponse {
  file_url: string
  file_size_bytes: number
  format: string
}
