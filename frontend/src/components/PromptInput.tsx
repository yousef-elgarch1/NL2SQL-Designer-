/**
 * Prompt Input Component
 * Allows users to enter natural language prompts with real-time validation
 */

import React, { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material'
import { Send as SendIcon, Visibility as VisibilityIcon } from '@mui/icons-material'
import PromptHighlighter from './PromptHighlighter'

interface PromptInputProps {
  onSubmit: (prompt: string) => void
  loading?: boolean
  value?: string
  onChange?: (value: string) => void
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, loading = false, value, onChange }) => {
  const [internalPrompt, setInternalPrompt] = useState('')
  const [showValidation, setShowValidation] = useState(true) // Enable validation by default
  const [promptScore, setPromptScore] = useState(0)

  // Use controlled or uncontrolled mode
  const prompt = value !== undefined ? value : internalPrompt
  const setPrompt = onChange !== undefined ? onChange : setInternalPrompt

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit(prompt)
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      {/* Header with Validation Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Describe Your Database
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter a natural language description of your database schema
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={showValidation}
              onChange={(e) => setShowValidation(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VisibilityIcon fontSize="small" />
              <Typography variant="body2">Validation en temps réel</Typography>
            </Box>
          }
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        {/* Text Input */}
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder="Exemple: Créer un système de bibliothèque avec des livres, auteurs et emprunts. Les livres ont un titre, ISBN et sont liés à des auteurs..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
        />

        {/* Real-time Validation Display */}
        {showValidation && prompt.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <PromptHighlighter
              prompt={prompt}
              onChange={setPrompt}
              onScoreChange={setPromptScore}
            />
          </>
        )}

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
          <Typography variant="caption" color="text.secondary">
            {showValidation && promptScore > 0
              ? `Score de qualité: ${Math.round(promptScore)}% ${
                  promptScore >= 70 ? '✅ Excellent' : promptScore >= 50 ? '⚠️ Moyen' : '❌ Améliorer'
                }`
              : 'Tapez au moins 10 caractères pour voir la validation'}
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            onClick={handleSubmit}
            disabled={loading || !prompt.trim() || (showValidation && promptScore < 30)}
            sx={{
              minWidth: 200,
              bgcolor: promptScore >= 70 ? 'success.main' : 'primary.main',
              '&:hover': {
                bgcolor: promptScore >= 70 ? 'success.dark' : 'primary.dark',
              },
            }}
          >
            {loading ? 'Analyzing...' : 'Generate Schema'}
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}

export default PromptInput
