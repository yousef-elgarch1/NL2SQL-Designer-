/**
 * SQL Service - Handles SQL generation and validation
 */

import apiClient from './api'
import type {
  SQLGenerationRequest,
  SQLGenerationResponse,
} from '@/types/api'

export const sqlService = {
  /**
   * Generate SQL from metamodel
   * Phase 1 Implementation
   */
  async generateSQL(request: SQLGenerationRequest): Promise<SQLGenerationResponse> {
    const response = await apiClient.post<SQLGenerationResponse>('/sql/generate', request)
    return response.data
  },

  /**
   * Validate SQL syntax
   * Phase 1 Implementation
   */
  async validateSQL(sqlScript: string, dbms: string = 'postgresql'): Promise<any> {
    const response = await apiClient.post('/sql/validate', {
      sql_script: sqlScript,
      dbms,
    })
    return response.data
  },
}
