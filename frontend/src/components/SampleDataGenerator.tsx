import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  DataObject as DataIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { generateSampleData } from '../services/sampleDataService';
import SQLViewer from './SQLViewer';

interface SampleDataGeneratorProps {
  open: boolean;
  onClose: () => void;
  metamodel: any;
}

export const SampleDataGenerator: React.FC<SampleDataGeneratorProps> = ({
  open,
  onClose,
  metamodel
}) => {
  const [rowsPerTable, setRowsPerTable] = useState<number>(10);
  const [format, setFormat] = useState<'sql' | 'json'>('sql');
  const [generating, setGenerating] = useState(false);
  const [sampleData, setSampleData] = useState<string>('');
  const [metadata, setMetadata] = useState<{ total_rows: number; tables_count: number } | null>(null);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    setSampleData('');
    setMetadata(null);

    try {
      const result = await generateSampleData(metamodel, rowsPerTable, format);
      setSampleData(result.data);
      setMetadata(result.metadata);
    } catch (err: any) {
      setError(err.message || 'Failed to generate sample data');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([sampleData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample_data.${format === 'sql' ? 'sql' : 'json'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setSampleData('');
    setMetadata(null);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <DataIcon color="primary" />
          <Typography variant="h6">Generate Sample Data</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Generate realistic test data for your database schema with smart field recognition
        </Typography>

        {/* Configuration */}
        <Box sx={{ mb: 3 }}>
          <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>
              Configuration
            </Typography>

            <TextField
              fullWidth
              type="number"
              label="Rows per Table"
              value={rowsPerTable}
              onChange={(e) => setRowsPerTable(Math.max(1, Math.min(100, parseInt(e.target.value) || 10)))}
              sx={{ mb: 2 }}
              helperText="Number of sample rows to generate for each table (1-100)"
              inputProps={{ min: 1, max: 100 }}
            />

            <Typography variant="body2" gutterBottom>
              Output Format
            </Typography>
            <RadioGroup
              value={format}
              onChange={(e) => setFormat(e.target.value as 'sql' | 'json')}
              row
            >
              <FormControlLabel
                value="sql"
                control={<Radio />}
                label="SQL INSERT Statements"
              />
              <FormControlLabel
                value="json"
                control={<Radio />}
                label="JSON Data"
              />
            </RadioGroup>
          </Paper>
        </Box>

        {/* Smart Recognition Info */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Smart Field Recognition
          </Typography>
          <Typography variant="caption">
            Automatically generates realistic data for: emails, names, phones, addresses, dates,
            prices, URLs, descriptions, and more! Foreign keys are handled intelligently.
          </Typography>
        </Alert>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Metadata */}
        {metadata && (
          <Box display="flex" gap={1} mb={2}>
            <Chip
              icon={<CheckIcon />}
              label={`${metadata.tables_count} tables`}
              color="success"
              variant="outlined"
            />
            <Chip
              icon={<DataIcon />}
              label={`${metadata.total_rows} total rows`}
              color="primary"
              variant="outlined"
            />
          </Box>
        )}

        {/* Sample Data Display */}
        {sampleData && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2">
                Generated Sample Data
              </Typography>
              <Box>
                <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                  <IconButton size="small" onClick={handleCopy}>
                    {copied ? <CheckIcon color="success" /> : <CopyIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download file">
                  <IconButton size="small" onClick={handleDownload}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {format === 'sql' ? (
              <SQLViewer sql={sampleData} maxHeight="400px" />
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  maxHeight: '400px',
                  overflow: 'auto',
                  bgcolor: 'background.default',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}
              >
                {sampleData}
              </Paper>
            )}
          </Box>
        )}

        {/* Loading State */}
        {generating && (
          <Box display="flex" flexDirection="column" alignItems="center" py={4}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Generating sample data...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={generating || !metamodel}
          startIcon={generating ? <CircularProgress size={20} /> : <DataIcon />}
        >
          {sampleData ? 'Regenerate' : 'Generate Sample Data'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
