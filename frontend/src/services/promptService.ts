/**
 * Prompt Service - Handles prompt validation and completion
 */

import apiClient from './api'
import type { PromptValidationRequest, PromptValidationResponse } from '@/types/api'

export const promptService = {
  /**
   * Validate user prompt
   * Phase 1 Implementation
   */
  async validatePrompt(request: PromptValidationRequest): Promise<PromptValidationResponse> {
    const response = await apiClient.post<PromptValidationResponse>('/prompt/validate', request)
    return response.data
  },

  /**
   * Complete prompt with AI suggestions
   * Phase 1 Implementation
   */
  async completePrompt(request: any): Promise<any> {
    const response = await apiClient.post('/prompt/complete', request)
    return response.data
  },
}
