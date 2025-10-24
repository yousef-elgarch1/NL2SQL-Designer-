/**
 * Prompt Input Component
 * Allows users to enter natural language prompts
 */

import React, { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material'
import { Send as SendIcon } from '@mui/icons-material'

interface PromptInputProps {
  onSubmit: (prompt: string) => void
  loading?: boolean
  value?: string
  onChange?: (value: string) => void
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, loading = false, value, onChange }) => {
  const [internalPrompt, setInternalPrompt] = useState('')

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
      <Typography variant="h6" gutterBottom>
        Describe Your Database
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Enter a natural language description of your database schema
      </Typography>

      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder="Example: I want a recruitment system where students can apply to job offers posted by enterprises..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />

        <Button
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          onClick={handleSubmit}
          disabled={loading || !prompt.trim()}
          sx={{ mt: 2 }}
        >
          {loading ? 'Analyzing...' : 'Generate Schema'}
        </Button>
      </Box>
    </Paper>
  )
}

export default PromptInput
