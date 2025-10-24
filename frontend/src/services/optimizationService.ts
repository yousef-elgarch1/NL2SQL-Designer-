import api from './api';

export interface OptimizationResult {
  index_suggestions: Array<{
    entity?: string;
    suggestion: string;
    sql?: string;
    priority?: string;
  }>;
  normalization_suggestions: Array<{
    entity?: string;
    suggestion: string;
    priority?: string;
  }>;
  datatype_suggestions: Array<{
    entity?: string;
    suggestion: string;
    priority?: string;
  }>;
  security_suggestions: Array<{
    entity?: string;
    suggestion: string;
    priority?: string;
  }>;
  performance_suggestions: Array<{
    entity?: string;
    suggestion: string;
    priority?: string;
  }>;
  overall_score: number;
  summary: string;
}

export const analyzeSchema = async (metamodel: any): Promise<OptimizationResult> => {
  const response = await api.post<OptimizationResult>('/optimization/analyze', {
    metamodel
  });
  return response.data;
};
