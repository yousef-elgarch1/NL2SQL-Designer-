/**
 * PromptHighlighter Component
 * Real-time validation with visual highlighting
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Collapse,
  Stack,
  Badge,
} from '@mui/material'
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Lightbulb as SuggestionIcon,
  AutoFixHigh as CorrectionIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import axios from 'axios'

interface Highlight {
  type: 'entity' | 'relationship' | 'attribute' | 'domain' | 'missing'
  text: string
  start: number
  end: number
  color: 'green' | 'red' | 'yellow' | 'blue'
}

interface ValidationResult {
  highlights: Highlight[]
  score: number
  detected: {
    entities: string[]
    relationships: string[]
    attributes: string[]
    domain: string | null
  }
  missing: {
    needs_entities: boolean
    needs_relationships: boolean
    needs_attributes: boolean
  }
  suggestions: string[]
}

interface PromptHighlighterProps {
  prompt: string
  onChange?: (prompt: string) => void
  onScoreChange?: (score: number) => void
}

export function PromptHighlighter({
  prompt,
  onChange,
  onScoreChange,
}: PromptHighlighterProps) {
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout>()

  // Real-time analysis with debounce
  const analyzePrompt = useCallback(async (text: string) => {
    if (!text || text.length < 5) {
      setValidation(null)
      return
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/prompt/analyze-realtime',
        { prompt: text }
      )
      setValidation(response.data)
      if (onScoreChange) {
        onScoreChange(response.data.score)
      }
    } catch (error) {
      console.error('Analysis failed:', error)
    }
  }, [onScoreChange])

  // Debounced analysis
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      analyzePrompt(prompt)
    }, 500) // Wait 500ms after user stops typing

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [prompt, analyzePrompt])

  // Deep analysis with LLM
  const handleDeepAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/prompt/analyze-deep',
        { prompt }
      )
      console.log('Deep analysis result:', response.data)
      // You can show a dialog with detailed suggestions
      alert(JSON.stringify(response.data, null, 2))
    } catch (error) {
      console.error('Deep analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Get color for score
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4caf50' // Green
    if (score >= 60) return '#ff9800' // Orange
    if (score >= 40) return '#ff5722' // Deep Orange
    return '#f44336' // Red
  }

  // Render highlighted text
  const renderHighlightedText = () => {
    if (!validation || validation.highlights.length === 0) {
      return <span style={{ color: '#999' }}>{prompt || 'Tapez votre description...'}</span>
    }

    const parts: JSX.Element[] = []
    let lastIndex = 0

    validation.highlights.forEach((highlight, idx) => {
      // Add text before highlight
      if (highlight.start > lastIndex) {
        parts.push(
          <span key={`text-${idx}`}>
            {prompt.substring(lastIndex, highlight.start)}
          </span>
        )
      }

      // Add highlighted text
      const backgroundColor =
        highlight.color === 'green'
          ? 'rgba(76, 175, 80, 0.2)'
          : highlight.color === 'red'
          ? 'rgba(244, 67, 54, 0.2)'
          : highlight.color === 'blue'
          ? 'rgba(33, 150, 243, 0.2)'
          : 'rgba(255, 152, 0, 0.2)'

      const borderBottom =
        highlight.color === 'green'
          ? '2px solid #4caf50'
          : highlight.color === 'red'
          ? '2px dashed #f44336'
          : highlight.color === 'blue'
          ? '2px solid #2196f3'
          : '2px solid #ff9800'

      parts.push(
        <span
          key={`highlight-${idx}`}
          style={{
            backgroundColor,
            borderBottom,
            borderRadius: '2px',
            padding: '2px 0',
          }}
          title={`${highlight.type}: ${highlight.text}`}
        >
          {prompt.substring(highlight.start, highlight.end)}
        </span>
      )

      lastIndex = highlight.end
    })

    // Add remaining text
    if (lastIndex < prompt.length) {
      parts.push(<span key="text-end">{prompt.substring(lastIndex)}</span>)
    }

    return <>{parts}</>
  }

  return (
    <Box>
      {/* Score and Correction Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        {validation && (
          <>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="body2" fontWeight="bold">
                  Qualité du prompt
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: getScoreColor(validation.score) }}
                >
                  {Math.round(validation.score)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={validation.score}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getScoreColor(validation.score),
                    borderRadius: 4,
                  },
                }}
              />
            </Box>

            <Tooltip title="Analyse approfondie avec IA">
              <IconButton
                onClick={handleDeepAnalysis}
                disabled={isAnalyzing}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                <CorrectionIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {/* Highlighted Text Display */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          border: '2px solid',
          borderColor: validation
            ? validation.score >= 70
              ? 'success.main'
              : 'warning.main'
            : 'divider',
          minHeight: '120px',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: 1.8,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          position: 'relative',
        }}
      >
        {renderHighlightedText()}
      </Paper>

      {/* Detection Summary */}
      {validation && (
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {validation.detected.domain && (
              <Chip
                icon={<CheckIcon />}
                label={`Domaine: ${validation.detected.domain}`}
                color="primary"
                size="small"
              />
            )}
            <Chip
              icon={
                validation.detected.entities.length >= 2 ? (
                  <CheckIcon />
                ) : (
                  <WarningIcon />
                )
              }
              label={`${validation.detected.entities.length} entités détectées`}
              color={validation.detected.entities.length >= 2 ? 'success' : 'warning'}
              size="small"
            />
            <Chip
              icon={
                validation.detected.relationships.length > 0 ? (
                  <CheckIcon />
                ) : (
                  <ErrorIcon />
                )
              }
              label={`${validation.detected.relationships.length} relations détectées`}
              color={
                validation.detected.relationships.length > 0 ? 'success' : 'error'
              }
              size="small"
            />
            <Chip
              icon={
                validation.detected.attributes.length >= 3 ? (
                  <CheckIcon />
                ) : (
                  <WarningIcon />
                )
              }
              label={`${validation.detected.attributes.length} attributs détectés`}
              color={
                validation.detected.attributes.length >= 3 ? 'success' : 'warning'
              }
              size="small"
            />
          </Stack>
        </Box>
      )}

      {/* Suggestions */}
      {validation && validation.suggestions.length > 0 && (
        <Collapse in={showSuggestions}>
          <Alert
            severity={validation.score >= 70 ? 'success' : 'info'}
            icon={<SuggestionIcon />}
            onClose={() => setShowSuggestions(false)}
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Suggestions:
            </Typography>
            {validation.suggestions.map((suggestion, idx) => (
              <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                {suggestion}
              </Typography>
            ))}
          </Alert>
        </Collapse>
      )}

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 20,
              height: 3,
              bgcolor: '#4caf50',
              borderRadius: 1,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Entités/Relations
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 20,
              height: 3,
              bgcolor: '#2196f3',
              borderRadius: 1,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Domaine
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 20,
              height: 3,
              bgcolor: '#f44336',
              borderRadius: 1,
              borderStyle: 'dashed',
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Manquant
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default PromptHighlighter
