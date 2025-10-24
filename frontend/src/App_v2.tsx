/**
 * Main Application Component - Phase 1 COMPLETE Implementation
 * With step-by-step workflow, validation gates, and prompt refinement
 */

import React, { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  Container,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
} from '@mui/material'
import {
  Send as SendIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'

import PromptInput from './components/PromptInput'
import DiagramViewer from './components/DiagramViewer'
import SQLViewer from './components/SQLViewer'

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
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
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

const steps = ['Enter Prompt', 'Refine Details', 'Review Diagram', 'Download SQL']

function App() {
  // Step management
  const [activeStep, setActiveStep] = useState(0)

  // Data states
  const [prompt, setPrompt] = useState('')
  const [validation, setValidation] = useState<any>(null)
  const [refinedPrompt, setRefinedPrompt] = useState('')
  const [selectedEntities, setSelectedEntities] = useState<string[]>([])
  const [additionalInfo, setAdditionalInfo] = useState<any>({})
  const [mermaidCode, setMermaidCode] = useState('')
  const [metamodel, setMetamodel] = useState<any>(null)
  const [sqlCode, setSqlCode] = useState('')

  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Validate Prompt
  const handlePromptSubmit = async (userPrompt: string) => {
    setLoading(true)
    setError(null)
    setPrompt(userPrompt)

    try {
      const validationResult = await promptService.validatePrompt({ prompt: userPrompt })
      setValidation(validationResult)

      // Check if prompt is complete enough
      if (validationResult.is_complete && validationResult.confidence > 0.7) {
        // Skip refinement, go directly to diagram generation
        setActiveStep(2)
        await generateDiagram(userPrompt)
      } else {
        // Go to refinement step
        setActiveStep(1)
        // Pre-select detected entities
        setSelectedEntities(validationResult.detected_entities || [])
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Validation failed')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Handle Refinement
  const handleRefinementComplete = async () => {
    setLoading(true)
    setError(null)

    try {
      // Build refined prompt
      let refined = prompt
      if (selectedEntities.length > 0) {
        refined += ` with entities: ${selectedEntities.join(', ')}`
      }
      if (additionalInfo.description) {
        refined += `. ${additionalInfo.description}`
      }

      setRefinedPrompt(refined)

      // Re-validate refined prompt
      const revalidation = await promptService.validatePrompt({ prompt: refined })
      setValidation(revalidation)

      // Generate diagram
      setActiveStep(2)
      await generateDiagram(refined)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Refinement failed')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Generate Diagram
  const generateDiagram = async (promptText: string) => {
    setLoading(true)
    setError(null)

    try {
      const diagramResult = await diagramService.generateDiagram({
        prompt: promptText,
        format: 'mermaid',
      })

      setMermaidCode(diagramResult.mermaid_code || '')
      setMetamodel(diagramResult.metamodel)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Diagram generation failed')
    } finally {
      setLoading(false)
    }
  }

  // Step 4: Generate SQL
  const handleGenerateSQL = async () => {
    if (!metamodel) {
      setError('No metamodel available. Please regenerate the diagram.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const sqlResult = await sqlService.generateSQL({
        metamodel,
        dbms: 'postgresql',
        options: {
          add_indexes: true,
          add_constraints: true,
          include_comments: true,
        },
      })

      setSqlCode(sqlResult.sql_script)
      setActiveStep(3)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'SQL generation failed')
    } finally {
      setLoading(false)
    }
  }

  // Download SQL
  const handleDownload = () => {
    const blob = new Blob([sqlCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'database_schema.sql'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Navigation
  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
    setPrompt('')
    setValidation(null)
    setRefinedPrompt('')
    setSelectedEntities([])
    setAdditionalInfo({})
    setMermaidCode('')
    setMetamodel(null)
    setSqlCode('')
    setError(null)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h3" component="h1" gutterBottom>
              🗄️ NL2SQL Generator
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              AI-Powered Database Schema Designer - Complete your database in 4 easy steps
            </Typography>
          </Box>

          {/* Stepper */}
          <Card elevation={3} sx={{ mb: 4 }}>
            <CardContent>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label, index) => (
                  <Step key={label} completed={activeStep > index}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Step Content */}
          <Box sx={{ minHeight: '400px' }}>
            {/* STEP 1: Enter Prompt */}
            {activeStep === 0 && (
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SendIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        Step 1: Describe Your Database
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tell us what kind of database you need in natural language
                      </Typography>
                    </Box>
                  </Box>

                  <PromptInput onSubmit={handlePromptSubmit} loading={loading} />

                  <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      💡 Examples:
                    </Typography>
                    <Typography variant="body2" component="div">
                      • "Create a library management system with books, members, and borrowing records"
                      <br />
                      • "E-commerce platform with products, orders, customers, and payments"
                      <br />
                      • "Hospital management with patients, doctors, appointments, and prescriptions"
                      <br />
                      • "School database with students, courses, enrollments, and grades"
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* STEP 2: Refine Details */}
            {activeStep === 1 && validation && (
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <WarningIcon sx={{ mr: 2, fontSize: 40, color: 'warning.main' }} />
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        Step 2: Refine Your Database Details
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        We need some additional information to create the perfect schema
                      </Typography>
                    </Box>
                  </Box>

                  {/* Validation Summary */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Alert severity="info" icon={<CheckIcon />}>
                        <Typography variant="body2">
                          <strong>Detected Domain:</strong> {validation.detected_domain || 'Unknown'}
                        </Typography>
                      </Alert>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Alert severity={validation.confidence > 0.7 ? 'success' : 'warning'}>
                        <Typography variant="body2">
                          <strong>Confidence:</strong> {Math.round(validation.confidence * 100)}%
                        </Typography>
                      </Alert>
                    </Grid>
                  </Grid>

                  {/* Missing Information */}
                  {validation.missing_info && validation.missing_info.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <ErrorIcon sx={{ mr: 1, color: 'error.main' }} />
                        Missing Information
                      </Typography>
                      {validation.missing_info.map((info: string, idx: number) => (
                        <Chip key={idx} label={info} color="error" sx={{ m: 0.5 }} />
                      ))}
                    </Box>
                  )}

                  {/* Detected Entities */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Detected Entities
                    </Typography>
                    <FormGroup>
                      {(validation.detected_entities || []).map((entity: string) => (
                        <FormControlLabel
                          key={entity}
                          control={
                            <Checkbox
                              checked={selectedEntities.includes(entity)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEntities([...selectedEntities, entity])
                                } else {
                                  setSelectedEntities(selectedEntities.filter((e) => e !== entity))
                                }
                              }}
                            />
                          }
                          label={entity}
                        />
                      ))}
                    </FormGroup>
                  </Box>

                  {/* Inferred Entities */}
                  {validation.inferred_entities && validation.inferred_entities.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Suggested Additional Entities
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        We think you might also need these:
                      </Typography>
                      <FormGroup>
                        {validation.inferred_entities.map((entity: string) => (
                          <FormControlLabel
                            key={entity}
                            control={
                              <Checkbox
                                checked={selectedEntities.includes(entity)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedEntities([...selectedEntities, entity])
                                  } else {
                                    setSelectedEntities(selectedEntities.filter((e) => e !== entity))
                                  }
                                }}
                              />
                            }
                            label={entity}
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  )}

                  {/* Additional Description */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Additional Details (Optional)
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Add any additional requirements or constraints..."
                      value={additionalInfo.description || ''}
                      onChange={(e) => setAdditionalInfo({ ...additionalInfo, description: e.target.value })}
                    />
                  </Box>

                  {/* Suggestions */}
                  {validation.suggestions && validation.suggestions.length > 0 && (
                    <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        💡 AI Suggestions:
                      </Typography>
                      {validation.suggestions.map((suggestion: string, idx: number) => (
                        <Typography key={idx} variant="body2">
                          • {suggestion}
                        </Typography>
                      ))}
                    </Box>
                  )}

                  {/* Navigation */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button onClick={handleBack} disabled={loading}>
                      Back
                    </Button>
                    <Box>
                      <Button onClick={() => setActiveStep(2)} sx={{ mr: 1 }} disabled={loading}>
                        Skip
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleRefinementComplete}
                        disabled={loading || selectedEntities.length === 0}
                        startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
                      >
                        {loading ? 'Processing...' : 'Continue'}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* STEP 3: Review Diagram */}
            {activeStep === 2 && (
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <CheckIcon sx={{ mr: 2, fontSize: 40, color: 'success.main' }} />
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        Step 3: Review Your Database Diagram
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Here's the visual representation of your database schema
                      </Typography>
                    </Box>
                  </Box>

                  {loading && !mermaidCode && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                      <CircularProgress />
                      <Typography sx={{ ml: 2 }}>Generating diagram...</Typography>
                    </Box>
                  )}

                  {mermaidCode && (
                    <>
                      <DiagramViewer mermaidCode={mermaidCode} />

                      {metamodel && (
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid item xs={12} sm={4}>
                            <Alert severity="info">
                              <Typography variant="body2">
                                <strong>Entities:</strong> {metamodel.entities?.length || 0}
                              </Typography>
                            </Alert>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Alert severity="info">
                              <Typography variant="body2">
                                <strong>Relationships:</strong> {metamodel.relationships?.length || 0}
                              </Typography>
                            </Alert>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Alert severity="success">
                              <Typography variant="body2">
                                <strong>Status:</strong> Ready for SQL
                              </Typography>
                            </Alert>
                          </Grid>
                        </Grid>
                      )}
                    </>
                  )}

                  {/* Navigation */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button onClick={handleBack} disabled={loading}>
                      Back
                    </Button>
                    <Box>
                      <Button
                        onClick={() => generateDiagram(refinedPrompt || prompt)}
                        startIcon={<RefreshIcon />}
                        sx={{ mr: 1 }}
                        disabled={loading}
                      >
                        Regenerate
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleGenerateSQL}
                        disabled={loading || !mermaidCode}
                        startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
                      >
                        {loading ? 'Processing...' : 'Generate SQL'}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* STEP 4: Download SQL */}
            {activeStep === 3 && (
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <DownloadIcon sx={{ mr: 2, fontSize: 40, color: 'success.main' }} />
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        Step 4: Download Your SQL Script
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Your database schema is ready!
                      </Typography>
                    </Box>
                  </Box>

                  {loading && !sqlCode && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                      <CircularProgress />
                      <Typography sx={{ ml: 2 }}>Generating SQL...</Typography>
                    </Box>
                  )}

                  {sqlCode && (
                    <>
                      <Alert severity="success" sx={{ mb: 3 }}>
                        <Typography variant="body1">
                          ✨ <strong>Success!</strong> Your PostgreSQL database schema has been generated.
                        </Typography>
                      </Alert>

                      <SQLViewer sqlCode={sqlCode} dbms="postgresql" />

                      <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<DownloadIcon />}
                          onClick={handleDownload}
                          sx={{ mr: 2 }}
                        >
                          Download SQL File
                        </Button>
                        <Button variant="outlined" onClick={handleReset} startIcon={<RefreshIcon />}>
                          Start New Project
                        </Button>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </Box>
        </Container>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
