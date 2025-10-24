import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  Paper,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  TipsAndUpdates as TipsIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  TableChart as TableIcon,
  DataObject as DataIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { analyzeSchema } from '../services/optimizationService';

interface OptimizationSuggestionsProps {
  open: boolean;
  onClose: () => void;
  metamodel: any;
}

interface Suggestion {
  entity?: string;
  suggestion: string;
  sql?: string;
  priority?: string;
}

interface OptimizationResult {
  index_suggestions: Suggestion[];
  normalization_suggestions: Suggestion[];
  datatype_suggestions: Suggestion[];
  security_suggestions: Suggestion[];
  performance_suggestions: Suggestion[];
  overall_score: number;
  summary: string;
}

const getSeverityColor = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'default';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 90) return 'success';
  if (score >= 75) return 'info';
  if (score >= 50) return 'warning';
  return 'error';
};

const getScoreLabel = (score: number) => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Poor';
};

export const OptimizationSuggestions: React.FC<OptimizationSuggestionsProps> = ({
  open,
  onClose,
  metamodel
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open && metamodel) {
      analyzeSchemaData();
    }
  }, [open, metamodel]);

  const analyzeSchemaData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await analyzeSchema(metamodel);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze schema');
    } finally {
      setLoading(false);
    }
  };

  const renderSuggestionList = (
    title: string,
    suggestions: Suggestion[],
    icon: React.ReactNode,
    iconColor: string
  ) => {
    if (suggestions.length === 0) {
      return (
        <Accordion disabled>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              {icon}
              <Typography>{title}</Typography>
              <Chip label="None" size="small" color="success" />
            </Box>
          </AccordionSummary>
        </Accordion>
      );
    }

    return (
      <Accordion defaultExpanded={suggestions.length > 0}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ bgcolor: `${iconColor}.50` }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            {icon}
            <Typography fontWeight={600}>{title}</Typography>
            <Chip label={suggestions.length} size="small" color={iconColor as any} />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {suggestions.map((suggestion, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    {suggestion.priority === 'high' ? (
                      <ErrorIcon color="error" />
                    ) : suggestion.priority === 'medium' ? (
                      <WarningIcon color="warning" />
                    ) : (
                      <CheckIcon color="info" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        {suggestion.entity && (
                          <Chip
                            label={suggestion.entity}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {suggestion.priority && (
                          <Chip
                            label={suggestion.priority.toUpperCase()}
                            size="small"
                            color={getSeverityColor(suggestion.priority) as any}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {suggestion.suggestion}
                        </Typography>
                        {suggestion.sql && (
                          <Paper
                            variant="outlined"
                            sx={{
                              mt: 1,
                              p: 1,
                              bgcolor: 'background.default',
                              fontFamily: 'monospace',
                              fontSize: '0.85rem'
                            }}
                          >
                            {suggestion.sql}
                          </Paper>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < suggestions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <TipsIcon color="primary" />
          <Typography variant="h6">Schema Optimization Analysis</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box display="flex" flexDirection="column" alignItems="center" py={4}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Analyzing your schema...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {result && !loading && (
          <Box>
            {/* Overall Score */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                bgcolor: `${getScoreColor(result.overall_score)}.50`,
                border: 1,
                borderColor: `${getScoreColor(result.overall_score)}.main`
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Overall Score</Typography>
                <Chip
                  label={getScoreLabel(result.overall_score)}
                  color={getScoreColor(result.overall_score) as any}
                  size="medium"
                />
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <LinearProgress
                  variant="determinate"
                  value={result.overall_score}
                  sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                  color={getScoreColor(result.overall_score) as any}
                />
                <Typography variant="h5" fontWeight="bold">
                  {result.overall_score}/100
                </Typography>
              </Box>
              {result.summary && (
                <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
                  {result.summary}
                </Typography>
              )}
            </Paper>

            {/* Suggestions by Category */}
            <Box>
              {renderSuggestionList(
                'Index Suggestions',
                result.index_suggestions,
                <SpeedIcon color="info" />,
                'info'
              )}

              {renderSuggestionList(
                'Security Recommendations',
                result.security_suggestions,
                <SecurityIcon color="error" />,
                'error'
              )}

              {renderSuggestionList(
                'Performance Optimizations',
                result.performance_suggestions,
                <SpeedIcon color="warning" />,
                'warning'
              )}

              {renderSuggestionList(
                'Normalization Suggestions',
                result.normalization_suggestions,
                <TableIcon color="info" />,
                'info'
              )}

              {renderSuggestionList(
                'Data Type Recommendations',
                result.datatype_suggestions,
                <DataIcon color="info" />,
                'info'
              )}
            </Box>

            {/* Summary Stats */}
            <Paper variant="outlined" sx={{ p: 2, mt: 3, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" gutterBottom>
                Summary
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Chip
                  icon={<SpeedIcon />}
                  label={`${result.index_suggestions.length} Index Suggestions`}
                  variant="outlined"
                />
                <Chip
                  icon={<SecurityIcon />}
                  label={`${result.security_suggestions.length} Security Issues`}
                  variant="outlined"
                  color={result.security_suggestions.length > 0 ? 'error' : 'default'}
                />
                <Chip
                  icon={<TableIcon />}
                  label={`${result.normalization_suggestions.length} Normalization Tips`}
                  variant="outlined"
                />
                <Chip
                  icon={<DataIcon />}
                  label={`${result.datatype_suggestions.length} Data Type Tips`}
                  variant="outlined"
                />
              </Box>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {result && (
          <Button variant="contained" onClick={analyzeSchemaData} disabled={loading}>
            Re-analyze
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
