/**
 * TypeScript types for UML Metamodel
 * Matches backend Pydantic models
 */

export enum DataType {
  INTEGER = 'INTEGER',
  VARCHAR = 'VARCHAR',
  TEXT = 'TEXT',
  DATE = 'DATE',
  TIMESTAMP = 'TIMESTAMP',
  BOOLEAN = 'BOOLEAN',
  DECIMAL = 'DECIMAL',
  FLOAT = 'FLOAT',
}

export enum CardinalityType {
  ONE_TO_ONE = 'one_to_one',
  ONE_TO_MANY = 'one_to_many',
  MANY_TO_ONE = 'many_to_one',
  MANY_TO_MANY = 'many_to_many',
}

export interface Attribute {
  name: string
  data_type: DataType
  length?: number
  is_primary_key?: boolean
  is_foreign_key?: boolean
  is_unique?: boolean
  is_nullable?: boolean
  default_value?: any
  description?: string
}

export interface Entity {
  name: string
  attributes: Attribute[]
  description?: string
  position?: { x: number; y: number }  // For visual editor
}

export interface Relationship {
  name: string
  source_entity: string
  target_entity: string
  cardinality: CardinalityType
  source_foreign_key?: string
  target_foreign_key?: string
  description?: string
}

export interface Metamodel {
  entities: Entity[]
  relationships: Relationship[]
  metadata?: Record<string, any>
}

export interface ValidationResult {
  is_valid: boolean
  errors: string[]
  warnings: string[]
}
