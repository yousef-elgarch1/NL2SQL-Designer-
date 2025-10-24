import api from './api';

export interface SampleDataResponse {
  data: string;
  metadata: {
    total_rows: number;
    tables_count: number;
  };
}

export const generateSampleData = async (
  metamodel: any,
  rowsPerTable: number = 10,
  format: 'sql' | 'json' = 'sql'
): Promise<SampleDataResponse> => {
  const response = await api.post<SampleDataResponse>('/sample-data/generate', {
    metamodel,
    rows_per_table: rowsPerTable,
    format
  });
  return response.data;
};
