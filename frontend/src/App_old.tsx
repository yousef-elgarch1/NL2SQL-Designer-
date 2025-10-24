/**
 * Main Application Component - Phase 1 Implementation
 */

import React, { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Container, Box, Typography, Alert } from '@mui/material'

import PromptInput from './components/PromptInput'
import DiagramViewer from './components/DiagramViewer'
import SQLViewer from './components/SQLViewer'
import ValidationPanel from './components/ValidationPanel'

import { promptService } from './services/promptService'
import { diagramService } from './services/diagramService'
import { sqlService } from './services/sqlService'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validation, setValidation] = useState<any>(null)
  const [mermaidCode, setMermaidCode] = useState('')
  const [sqlCode, setSqlCode] = useState('')

  const handlePromptSubmit = async (prompt: string) => {
    setLoading(true)
    setError(null)
    setValidation(null)
    setMermaidCode('')
    setSqlCode('')

    try {
      // Step 1: Validate prompt (optional, for user feedback)
      console.log('Validating prompt...')
      const validationResult = await promptService.validatePrompt({ prompt })
      setValidation(validationResult)

      // Step 2: Generate diagram
      console.log('Generating diagram...')
      const diagramResult = await diagramService.generateDiagram({
        prompt,
        format: 'mermaid',
      })

      setMermaidCode(diagramResult.mermaid_code || '')

      // Step 3: Generate SQL
      console.log('Generating SQL...')
      const sqlResult = await sqlService.generateSQL({
        metamodel: diagramResult.metamodel,
        dbms: 'postgresql',
        options: {
          add_indexes: true,
          add_constraints: true,
          include_comments: true,
        },
      })

      setSqlCode(sqlResult.sql_script)

      console.log('✅ Generation complete!')
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.response?.data?.detail || err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h3" component="h1" gutterBottom>
                🗄️ NL2SQL Generator
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                AI-Powered Database Schema Designer - Phase 1
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <PromptInput onSubmit={handlePromptSubmit} loading={loading} />

            {validation && <ValidationPanel validation={validation} />}

            {mermaidCode && <DiagramViewer mermaidCode={mermaidCode} />}

            {sqlCode && <SQLViewer sqlCode={sqlCode} dbms="postgresql" />}
          </Container>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
