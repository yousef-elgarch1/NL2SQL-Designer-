import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Storage as StorageIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  TableChart as TableChartIcon
} from '@mui/icons-material';
import { testDatabaseConnection, executeSQLOnDatabase } from '../services/databaseService';

interface DatabaseConnectionFormProps {
  open: boolean;
  onClose: () => void;
  sqlScript: string;
  sqlDialect: string;
}

interface DatabaseConfig {
  dbms: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

const defaultPorts: { [key: string]: number } = {
  postgresql: 5432,
  mysql: 3306,
  sqlite: 0,
  sqlserver: 1433,
  oracle: 1521
};

const defaultConfigs: { [key: string]: { host: string; username: string; database: string } } = {
  postgresql: {
    host: 'localhost',
    username: 'postgres',
    database: 'mydb'
  },
  mysql: {
    host: 'localhost',
    username: 'root',
    database: 'mydb'
  },
  sqlite: {
    host: '',
    username: '',
    database: 'database.db'
  },
  sqlserver: {
    host: 'localhost',
    username: 'sa',
    database: 'mydb'
  },
  oracle: {
    host: 'localhost',
    username: 'system',
    database: 'ORCL'
  }
};

export const DatabaseConnectionForm: React.FC<DatabaseConnectionFormProps> = ({
  open,
  onClose,
  sqlScript,
  sqlDialect
}) => {
  const [activeStep, setActiveStep] = useState(0);

  // Initialize config with defaults based on dialect
  const getInitialConfig = (dialect: string): DatabaseConfig => {
    const defaults = defaultConfigs[dialect] || defaultConfigs.postgresql;
    return {
      dbms: dialect,
      host: defaults.host,
      port: defaultPorts[dialect] || 5432,
      database: defaults.database,
      username: defaults.username,
      password: ''
    };
  };

  const [config, setConfig] = useState<DatabaseConfig>(getInitialConfig(sqlDialect));
  const [createDatabase, setCreateDatabase] = useState(true);
  const [testing, setTesting] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [executeResult, setExecuteResult] = useState<{ success: boolean; message: string; tables?: string[] } | null>(null);

  const steps = ['Configure Connection', 'Test Connection', 'Execute SQL'];

  // Update config when dialog opens or dialect changes
  useEffect(() => {
    if (open) {
      setConfig(getInitialConfig(sqlDialect));
      setActiveStep(0);
      setTestResult(null);
      setExecuteResult(null);
    }
  }, [open, sqlDialect]);

  const handleDbmsChange = (dbms: string) => {
    const defaults = defaultConfigs[dbms] || defaultConfigs.postgresql;
    setConfig({
      ...config,
      dbms,
      host: defaults.host,
      port: defaultPorts[dbms] || 5432,
      database: defaults.database,
      username: defaults.username
      // Keep the password that user may have entered
    });
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testDatabaseConnection(config);
      setTestResult(result);
      if (result.success) {
        setActiveStep(2);
      }
    } catch (error: any) {
      setTestResult({ success: false, message: error.message || 'Connection failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleExecuteSQL = async () => {
    setExecuting(true);
    setExecuteResult(null);
    try {
      const result = await executeSQLOnDatabase(config, sqlScript, createDatabase);
      setExecuteResult(result);
    } catch (error: any) {
      setExecuteResult({ success: false, message: error.message || 'Execution failed' });
    } finally {
      setExecuting(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setTestResult(null);
    setExecuteResult(null);
    onClose();
  };

  const isSQLite = config.dbms === 'sqlite';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <StorageIcon color="primary" />
          <Typography variant="h6">Execute SQL on Database</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 1: Configure Connection */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure your database connection settings
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Database Type</InputLabel>
              <Select
                value={config.dbms}
                label="Database Type"
                onChange={(e) => handleDbmsChange(e.target.value)}
              >
                <MenuItem value="postgresql">PostgreSQL</MenuItem>
                <MenuItem value="mysql">MySQL</MenuItem>
                <MenuItem value="sqlite">SQLite</MenuItem>
                <MenuItem value="sqlserver">SQL Server</MenuItem>
                <MenuItem value="oracle">Oracle</MenuItem>
              </Select>
            </FormControl>

            {/* Database-specific info */}
            {isSQLite ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>SQLite</strong> - File-based database, no server needed! Just enter the filename (e.g., database.db)
              </Alert>
            ) : (
              <>
                {config.dbms === 'postgresql' && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>PostgreSQL</strong> - Default port: 5432, Default user: postgres
                  </Alert>
                )}
                {config.dbms === 'mysql' && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>MySQL</strong> - Default port: 3306, Default user: root
                  </Alert>
                )}
                {config.dbms === 'sqlserver' && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>SQL Server</strong> - Default port: 1433, Default user: sa
                  </Alert>
                )}
                {config.dbms === 'oracle' && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>Oracle</strong> - Default port: 1521, Default user: system, Default SID: ORCL
                  </Alert>
                )}
              </>
            )}

            {isSQLite ? null : (
              <>
                <TextField
                  fullWidth
                  label="Host"
                  value={config.host}
                  onChange={(e) => setConfig({ ...config, host: e.target.value })}
                  sx={{ mb: 2 }}
                  placeholder="localhost or IP address"
                />

                <TextField
                  fullWidth
                  label="Port"
                  type="number"
                  value={config.port}
                  onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 0 })}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Username"
                  value={config.username}
                  onChange={(e) => setConfig({ ...config, username: e.target.value })}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={config.password}
                  onChange={(e) => setConfig({ ...config, password: e.target.value })}
                  sx={{ mb: 2 }}
                />
              </>
            )}

            <TextField
              fullWidth
              label={isSQLite ? 'Database Filename' : 'Database Name'}
              value={config.database}
              onChange={(e) => setConfig({ ...config, database: e.target.value })}
              sx={{ mb: 2 }}
              required
              placeholder={isSQLite ? 'mydb.db' : 'my_database'}
            />

            {!isSQLite && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={createDatabase}
                    onChange={(e) => setCreateDatabase(e.target.checked)}
                  />
                }
                label="Create database if it doesn't exist"
              />
            )}
          </Box>
        )}

        {/* Step 2: Test Connection */}
        {activeStep === 1 && (
          <Box>
            {testResult ? (
              <Alert
                severity={testResult.success ? 'success' : 'error'}
                icon={testResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
                sx={{ mb: 2 }}
              >
                {testResult.message}
              </Alert>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>
                Click "Test Connection" to verify your database is reachable
              </Alert>
            )}

            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" gutterBottom>
                Connection Details:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Database Type"
                    secondary={config.dbms.toUpperCase()}
                  />
                </ListItem>
                {!isSQLite && (
                  <>
                    <ListItem>
                      <ListItemText
                        primary="Host"
                        secondary={`${config.host}:${config.port}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Username"
                        secondary={config.username}
                      />
                    </ListItem>
                  </>
                )}
                <ListItem>
                  <ListItemText
                    primary={isSQLite ? 'Database File' : 'Database Name'}
                    secondary={config.database}
                  />
                </ListItem>
              </List>
            </Paper>
          </Box>
        )}

        {/* Step 3: Execute SQL */}
        {activeStep === 2 && (
          <Box>
            {executeResult ? (
              <>
                <Alert
                  severity={executeResult.success ? 'success' : 'error'}
                  icon={executeResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
                  sx={{ mb: 2 }}
                >
                  {executeResult.message}
                </Alert>

                {executeResult.success && executeResult.tables && executeResult.tables.length > 0 && (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tables Created Successfully:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                      {executeResult.tables.map((table) => (
                        <Chip
                          key={table}
                          icon={<TableChartIcon />}
                          label={table}
                          color="success"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Paper>
                )}
              </>
            ) : (
              <>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  This will execute the SQL script on your database. Make sure you've tested the connection first!
                </Alert>

                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Ready to execute SQL script on:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isSQLite ? config.database : `${config.host}:${config.port}/${config.database}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Script length: {sqlScript.length} characters
                  </Typography>
                </Paper>
              </>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {executeResult?.success ? 'Close' : 'Cancel'}
        </Button>

        {activeStep === 0 && (
          <Button
            variant="contained"
            onClick={() => setActiveStep(1)}
            disabled={!config.database}
          >
            Next
          </Button>
        )}

        {activeStep === 1 && (
          <>
            <Button onClick={() => setActiveStep(0)}>Back</Button>
            <Button
              variant="contained"
              onClick={handleTestConnection}
              disabled={testing}
              startIcon={testing && <CircularProgress size={20} />}
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
          </>
        )}

        {activeStep === 2 && (
          <>
            <Button onClick={() => setActiveStep(1)} disabled={executing}>
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleExecuteSQL}
              disabled={executing || executeResult?.success}
              startIcon={executing && <CircularProgress size={20} />}
            >
              {executing ? 'Executing...' : 'Execute SQL'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
