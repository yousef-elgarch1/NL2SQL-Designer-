import api from './api';

export interface DatabaseConfig {
  dbms: string;
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
}

export interface ConnectionTestResponse {
  success: boolean;
  message: string;
}

export interface ExecuteSQLResponse {
  success: boolean;
  message: string;
  tables_created?: string[];
  errors?: Array<{ statement: string; error: string }>;
}

export const testDatabaseConnection = async (
  config: DatabaseConfig
): Promise<ConnectionTestResponse> => {
  const response = await api.post<ConnectionTestResponse>(
    '/database/test-connection',
    { config }
  );
  return response.data;
};

export const executeSQLOnDatabase = async (
  config: DatabaseConfig,
  sqlScript: string,
  createDatabase: boolean = false
): Promise<ExecuteSQLResponse> => {
  const response = await api.post<ExecuteSQLResponse>(
    '/database/execute',
    {
      config,
      sql_script: sqlScript,
      create_database: createDatabase
    }
  );
  return response.data;
};

export const getDatabaseInfo = async (
  config: DatabaseConfig
): Promise<{ success: boolean; tables: string[]; table_count: number }> => {
  const response = await api.post('/database/info', { config });
  return response.data;
};
