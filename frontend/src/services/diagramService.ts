/**
 * Diagram Service - Handles diagram generation and modification
 */

import apiClient from './api'
import type {
  DiagramGenerationRequest,
  DiagramGenerationResponse,
} from '@/types/api'
import type { Metamodel } from '@/types/metamodel'

export const diagramService = {
  /**
   * Generate diagram from prompt
   * Phase 1 Implementation
   */
  async generateDiagram(request: DiagramGenerationRequest): Promise<DiagramGenerationResponse> {
    const response = await apiClient.post<DiagramGenerationResponse>('/diagram/generate', request)
    return response.data
  },

  /**
   * Modify existing diagram
   * Phase 2 Implementation
   */
  async modifyDiagram(currentMetamodel: Metamodel, modificationPrompt: string): Promise<any> {
    const response = await apiClient.post('/diagram/modify', {
      current_metamodel: currentMetamodel,
      modification_prompt: modificationPrompt,
    })
    return response.data
  },

  /**
   * Validate diagram structure
   * Phase 1 Implementation
   */
  async validateDiagram(metamodel: Metamodel): Promise<any> {
    const response = await apiClient.post('/diagram/validate', metamodel)
    return response.data
  },
}
