/**
 * Validation Panel Component
 * Displays validation results and suggestions
 */

import React from 'react'
import {
  Paper,
  Typography,
  Box,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material'

interface ValidationPanelProps {
  validation: {
    is_complete?: boolean
    detected_domain?: string
    detected_entities?: string[]
    inferred_entities?: string[]
    missing_info?: string[]
    suggestions?: string[]
    confidence?: number
  }
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({ validation }) => {
  if (!validation || Object.keys(validation).length === 0) {
    return null
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        AI Analysis Results
      </Typography>

      {validation.detected_domain && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Detected Domain:
          </Typography>
          <Chip label={validation.detected_domain} color="primary" sx={{ mt: 1 }} />
        </Box>
      )}

      {validation.detected_entities && validation.detected_entities.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Detected Entities:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {validation.detected_entities.map((entity) => (
              <Chip key={entity} label={entity} size="small" />
            ))}
          </Box>
        </Box>
      )}

      {validation.inferred_entities && validation.inferred_entities.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            AI Suggested Entities:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {validation.inferred_entities.map((entity) => (
              <Chip key={entity} label={entity} size="small" color="secondary" variant="outlined" />
            ))}
          </Box>
        </Box>
      )}

      {validation.missing_info && validation.missing_info.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Missing Information:
          </Typography>
          <List dense>
            {validation.missing_info.map((info, index) => (
              <ListItem key={index}>
                <ListItemText primary={info} />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {validation.suggestions && validation.suggestions.length > 0 && (
        <Alert severity="info">
          <Typography variant="subtitle2" gutterBottom>
            Suggestions:
          </Typography>
          <List dense>
            {validation.suggestions.map((suggestion, index) => (
              <ListItem key={index}>
                <ListItemText primary={suggestion} />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {validation.confidence !== undefined && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Confidence: {(validation.confidence * 100).toFixed(1)}%
          </Typography>
        </Box>
      )}
    </Paper>
  )
}

export default ValidationPanel
