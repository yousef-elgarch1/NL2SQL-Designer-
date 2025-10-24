/**
 * Main Application Component - Phase 1 COMPLETE Implementation
 * With step-by-step workflow, validation gates, and prompt refinement
 */

import { useState, useMemo } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppTheme } from './theme'
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
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
} from '@mui/material'
import {
  Send as SendIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Lightbulb as LightbulbIcon,
  LibraryBooks as LibraryIcon,
  ShoppingCart as ShoppingIcon,
  LocalHospital as HospitalIcon,
  School as SchoolIcon,
  Chat as ChatIcon,
  AccountBalance as BankIcon,
  Edit as EditIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  TipsAndUpdates as TipsIcon,
  DataObject as DataIcon,
  Storage as StorageIcon,
} from '@mui/icons-material'

import PromptInput from './components/PromptInput'
import DiagramViewer from './components/DiagramViewer'
import SQLViewer from './components/SQLViewer'
import AttributeEditor, { EntityWithAttributes } from './components/AttributeEditor'
import PlantUMLViewer from './components/PlantUMLViewer'
import { DatabaseConnectionForm } from './components/DatabaseConnectionForm'
import { OptimizationSuggestions } from './components/OptimizationSuggestions'
import { SampleDataGenerator } from './components/SampleDataGenerator'
import { DragDropEntityEditor } from './components/DragDropEntityEditor'

import { promptService } from './services/promptService'
import { diagramService } from './services/diagramService'
import { sqlService } from './services/sqlService'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const steps = ['Enter Prompt', 'Refine Details', 'Edit Attributes', 'Review Diagram', 'Download SQL']

// Example prompts for different domains
const EXAMPLE_PROMPTS = [
  {
    icon: LibraryIcon,
    title: 'Library System',
    color: '#1976d2',
    prompt: `Create a comprehensive library management system with books, members, authors, categories, and borrowing records. Track late fees for overdue books, support book reservations, and monitor book availability in real-time. Include timestamps for all transactions and support multiple copies of the same book.`
  },
  {
    icon: ShoppingIcon,
    title: 'E-Commerce',
    color: '#f57c00',
    prompt: `Create an e-commerce platform with products, customers, orders, shopping carts, product reviews, and inventory management. Support multiple payment methods, shipping addresses, discount codes, and order tracking. Include product categories, wishlists, and customer loyalty points system.`
  },
  {
    icon: HospitalIcon,
    title: 'Hospital Management',
    color: '#d32f2f',
    prompt: `Create a hospital management system with patients, doctors, appointments, medical records, prescriptions, departments, and billing. Track patient admission and discharge, doctor schedules, lab test results, and medication inventory. Include emergency contact information and insurance details.`
  },
  {
    icon: SchoolIcon,
    title: 'School Management',
    color: '#388e3c',
    prompt: `Create a school management system with students, teachers, courses, enrollments, grades, attendance, and class schedules. Track student performance over semesters, support parent-teacher communication, manage exam schedules, and maintain academic transcripts. Include fee payment tracking.`
  },
  {
    icon: ChatIcon,
    title: 'Social Media',
    color: '#7b1fa2',
    prompt: `Create a social media platform with users, posts, comments, likes, friendships, messages, and notifications. Support media uploads (photos/videos), hashtags, user mentions, story features, and privacy settings. Include follower/following relationships and content moderation flags.`
  },
  {
    icon: BankIcon,
    title: 'Banking System',
    color: '#0097a7',
    prompt: `Create a banking system with customers, accounts, transactions, loans, credit cards, and branch information. Support multiple account types (savings, checking, investment), track transaction history, manage loan payments and interest calculations. Include security features like transaction limits and fraud detection flags.`
  }
]

function App() {
  // Step management
  const [activeStep, setActiveStep] = useState(0)

  // Data states
  const [prompt, setPrompt] = useState('')
  const [validation, setValidation] = useState<any>(null)
  const [refinedPrompt, setRefinedPrompt] = useState('')
  const [selectedEntities, setSelectedEntities] = useState<string[]>([])
  const [additionalInfo, setAdditionalInfo] = useState<any>({})
  const [entityAttributes, setEntityAttributes] = useState<EntityWithAttributes[]>([])
  const [mermaidCode, setMermaidCode] = useState('')
  const [plantumlCode, setPlantUMLCode] = useState('')
  const [diagramFormat, setDiagramFormat] = useState<'mermaid' | 'plantuml'>('mermaid')
  const [metamodel, setMetamodel] = useState<any>(null)
  const [sqlCode, setSqlCode] = useState('')
  const [sqlDialect, setSqlDialect] = useState<'postgresql' | 'mysql' | 'sqlite' | 'sqlserver' | 'oracle'>('postgresql')

  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dark mode state
  const [darkMode, setDarkMode] = useState(false)
  const theme = useMemo(() => createAppTheme(darkMode ? 'dark' : 'light'), [darkMode])

  // Dialog states for new features
  const [dbConnectionOpen, setDbConnectionOpen] = useState(false)
  const [optimizationOpen, setOptimizationOpen] = useState(false)
  const [sampleDataOpen, setSampleDataOpen] = useState(false)
  const [useDragDropEditor, setUseDragDropEditor] = useState(false)

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
        // Skip refinement, go to attribute editor
        setActiveStep(2)
        await extractEntitiesWithAttributes(userPrompt)
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

      // Go to attribute editor
      setActiveStep(2)
      await extractEntitiesWithAttributes(refined)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Refinement failed')
    } finally {
      setLoading(false)
    }
  }

  // Step 2.5: Extract Entities with Attributes from LLM
  const extractEntitiesWithAttributes = async (promptText: string) => {
    setLoading(true)
    setError(null)

    try {
      // Generate initial metamodel with AI (request both formats)
      const diagramResult = await diagramService.generateDiagram({
        prompt: promptText,
        format: 'both',
      })

      console.log('[DEBUG] Full Diagram Result:', JSON.stringify(diagramResult, null, 2))

      // Check if response has the expected structure
      if (!diagramResult) {
        throw new Error('No response from diagram service')
      }

      if (!diagramResult.metamodel) {
        throw new Error('No metamodel in response')
      }

      if (!diagramResult.metamodel.entities || !Array.isArray(diagramResult.metamodel.entities)) {
        throw new Error('No entities array in metamodel')
      }

      if (diagramResult.metamodel.entities.length === 0) {
        throw new Error('Entities array is empty')
      }

      console.log('[DEBUG] Found', diagramResult.metamodel.entities.length, 'entities')

      // Convert metamodel entities to EntityWithAttributes format
      const entities: EntityWithAttributes[] = diagramResult.metamodel.entities.map((entity: any, idx: number) => {
        console.log(`[DEBUG] Processing entity ${idx}:`, entity.name, 'with', entity.attributes?.length || 0, 'attributes')

        return {
          name: entity.name,
          attributes: (entity.attributes || []).map((attr: any) => ({
            name: attr.name,
            data_type: attr.data_type,
            length: attr.length || undefined,
            is_primary_key: attr.is_primary_key || false,
            is_foreign_key: attr.is_foreign_key || false,
            is_unique: attr.is_unique || false,
            is_nullable: attr.is_nullable !== false, // Default to true
            default_value: attr.default_value || undefined,
          }))
        }
      })

      console.log('[SUCCESS] Converted', entities.length, 'entities successfully')
      console.log('[DEBUG] Entities:', entities)

      // Set state
      setEntityAttributes(entities)
      setMetamodel(diagramResult.metamodel)

      console.log('[SUCCESS] State updated, entityAttributes length:', entities.length)
    } catch (err: any) {
      console.error('[ERROR] Entity extraction failed:', err)
      console.error('[ERROR] Error details:', err.response?.data || err.message)
      setError(err.response?.data?.detail || err.message || 'Entity extraction failed')
      setEntityAttributes([]) // Clear any partial data
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Handle Attribute Editor Complete - Generate Diagram from Edited Metamodel
  const handleAttributeEditorComplete = async () => {
    setLoading(true)
    setError(null)

    try {
      // Build metamodel from edited attributes
      const updatedMetamodel = {
        ...metamodel,
        entities: entityAttributes.map((entity) => ({
          name: entity.name,
          attributes: entity.attributes,
          description: ''
        }))
      }

      setMetamodel(updatedMetamodel)

      // Generate both Mermaid and PlantUML diagrams from metamodel
      const diagramResult = await diagramService.generateDiagram({
        prompt: refinedPrompt || prompt,
        format: 'both',
      })

      setMermaidCode(diagramResult.mermaid_code || '')
      setPlantUMLCode(diagramResult.plantuml_code || '')
      setActiveStep(3)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Diagram generation failed')
    } finally {
      setLoading(false)
    }
  }

  // Step 4: Generate Diagram
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

  // Step 5: Generate SQL
  const handleGenerateSQL = async (dialectOrEvent?: string | any) => {
    if (!metamodel) {
      setError('No metamodel available. Please regenerate the diagram.')
      return
    }

    // If it's a string, use it as dialect; otherwise use current state
    const targetDialect = typeof dialectOrEvent === 'string' ? dialectOrEvent : sqlDialect

    setLoading(true)
    setError(null)

    try {
      const sqlResult = await sqlService.generateSQL({
        metamodel,
        dbms: targetDialect as any,
        options: {
          add_indexes: true,
          add_constraints: true,
          include_comments: true,
        },
      })

      setSqlCode(sqlResult.sql_script)
      setActiveStep(4)
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
    setEntityAttributes([])
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
          {/* Dark Mode Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit" size="large">
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
          </Box>

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

                  {/* Prompt Writing Instructions */}
                  <Card elevation={0} sx={{ mb: 3, bgcolor: '#e3f2fd', border: '2px solid #1976d2' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LightbulbIcon sx={{ mr: 1, color: '#1976d2', fontSize: 28 }} />
                        <Typography variant="h6" sx={{ color: '#1976d2' }}>
                          How to Write a Good Database Prompt
                        </Typography>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom sx={{ color: 'success.main' }}>
                            ✅ Good Prompts Include:
                          </Typography>
                          <Typography variant="body2" component="div" sx={{ pl: 2 }}>
                            • <strong>Domain/Purpose</strong> (library, e-commerce, hospital)
                            <br />
                            • <strong>Main Entities</strong> (books, products, patients)
                            <br />
                            • <strong>Key Relationships</strong> (borrowing, orders, appointments)
                            <br />
                            • <strong>Special Features</strong> (late fees, discounts, tracking)
                          </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom sx={{ color: 'error.main' }}>
                            ❌ Avoid:
                          </Typography>
                          <Typography variant="body2" component="div" sx={{ pl: 2 }}>
                            • Too vague ("database for stuff")
                            <br />
                            • Just one word ("library")
                            <br />
                            • No context or relationships
                            <br />
                            • Missing key requirements
                          </Typography>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          📜 Template Format:
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontStyle: 'italic' }}>
                          "Create a <strong>[DOMAIN]</strong> system with <strong>[ENTITIES]</strong> that tracks{' '}
                          <strong>[RELATIONSHIPS]</strong> and includes <strong>[SPECIAL FEATURES]</strong>"
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Clickable Example Templates */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <LightbulbIcon sx={{ mr: 1, color: 'warning.main' }} />
                      Click an Example to Auto-Fill
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Choose a template and customize it for your needs
                    </Typography>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      {EXAMPLE_PROMPTS.map((example) => {
                        const IconComponent = example.icon
                        return (
                          <Grid item xs={12} sm={6} md={4} key={example.title}>
                            <Card
                              elevation={1}
                              sx={{
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                border: '2px solid transparent',
                                '&:hover': {
                                  borderColor: example.color,
                                  transform: 'translateY(-4px)',
                                  boxShadow: 4,
                                },
                              }}
                              onClick={() => setPrompt(example.prompt)}
                            >
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <IconComponent sx={{ fontSize: 32, color: example.color, mr: 1 }} />
                                  <Typography variant="h6">{example.title}</Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  Click to use this template
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        )
                      })}
                    </Grid>
                  </Box>

                  {/* Prompt Input */}
                  <PromptInput
                    onSubmit={handlePromptSubmit}
                    loading={loading}
                    value={prompt}
                    onChange={setPrompt}
                  />
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

            {/* STEP 2.5: Edit Attributes */}
            {activeStep === 2 && (
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <EditIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        Step 3: Edit Entity Attributes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Review and customize the attributes for each entity before generating the diagram
                      </Typography>
                    </Box>
                  </Box>

                  {loading && entityAttributes.length === 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                      <CircularProgress />
                      <Typography sx={{ ml: 2 }}>Extracting entities and attributes...</Typography>
                    </Box>
                  )}

                  {!loading && entityAttributes.length === 0 && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Alert severity="warning">
                        <Typography variant="body1">
                          No entities were extracted. Please go back and try again.
                        </Typography>
                      </Alert>
                    </Box>
                  )}

                  {entityAttributes.length > 0 && (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Found {entityAttributes.length} entities with{' '}
                          {entityAttributes.reduce((sum, e) => sum + e.attributes.length, 0)} total attributes
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setUseDragDropEditor(!useDragDropEditor)}
                        >
                          {useDragDropEditor ? '📝 Switch to List View' : '🎯 Switch to Card View'}
                        </Button>
                      </Box>

                      {useDragDropEditor ? (
                        <DragDropEntityEditor entities={entityAttributes} onEntitiesChange={setEntityAttributes} />
                      ) : (
                        <AttributeEditor entities={entityAttributes} onChange={setEntityAttributes} />
                      )}

                      {/* Navigation */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button onClick={handleBack} disabled={loading}>
                          Back
                        </Button>
                        <Box>
                          <Button
                            onClick={() => {
                              setActiveStep(3)
                              generateDiagram(refinedPrompt || prompt)
                            }}
                            sx={{ mr: 1 }}
                            disabled={loading}
                          >
                            Skip & Use AI Attributes
                          </Button>
                          <Button
                            variant="contained"
                            onClick={handleAttributeEditorComplete}
                            disabled={loading || entityAttributes.length === 0}
                            startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
                          >
                            {loading ? 'Generating...' : 'Generate Diagram'}
                          </Button>
                        </Box>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* STEP 3: Review Diagram */}
            {activeStep === 3 && (
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <CheckIcon sx={{ mr: 2, fontSize: 40, color: 'success.main' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" gutterBottom>
                        Step 4: Review Your Database Diagram
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Here's the visual representation of your database schema
                      </Typography>
                    </Box>
                  </Box>

                  {/* Diagram Format Toggle */}
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                    <ToggleButtonGroup
                      value={diagramFormat}
                      exclusive
                      onChange={(e, newFormat) => {
                        if (newFormat !== null) {
                          setDiagramFormat(newFormat)
                        }
                      }}
                      color="primary"
                    >
                      <ToggleButton value="mermaid">
                        <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                          <Typography>Mermaid ER Diagram</Typography>
                        </Box>
                      </ToggleButton>
                      <ToggleButton value="plantuml">
                        <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                          <Typography>PlantUML Class Diagram</Typography>
                        </Box>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  {loading && !mermaidCode && !plantumlCode && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                      <CircularProgress />
                      <Typography sx={{ ml: 2 }}>Generating diagrams...</Typography>
                    </Box>
                  )}

                  {(mermaidCode || plantumlCode) && (
                    <>
                      {/* Mermaid Diagram */}
                      {diagramFormat === 'mermaid' && mermaidCode && (
                        <DiagramViewer mermaidCode={mermaidCode} />
                      )}

                      {/* PlantUML Diagram */}
                      {diagramFormat === 'plantuml' && plantumlCode && (
                        <PlantUMLViewer plantumlCode={plantumlCode} />
                      )}

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

                  {/* Optimization Button */}
                  {metamodel && (
                    <Box sx={{ mt: 3, mb: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<TipsIcon />}
                        onClick={() => setOptimizationOpen(true)}
                        fullWidth
                        size="large"
                      >
                        Analyze Schema Quality
                      </Button>
                    </Box>
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

            {/* STEP 5: Download SQL */}
            {activeStep === 4 && (
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <DownloadIcon sx={{ mr: 2, fontSize: 40, color: 'success.main' }} />
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        Step 5: Download Your SQL Script
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Your database schema is ready!
                      </Typography>
                    </Box>
                  </Box>

                  {/* SQL Dialect Selector */}
                  <Box sx={{ mb: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel>Database Type</InputLabel>
                      <Select
                        value={sqlDialect}
                        label="Database Type"
                        onChange={(e) => {
                          const newDialect = e.target.value as any
                          setSqlDialect(newDialect)
                          if (metamodel) {
                            handleGenerateSQL(newDialect)
                          }
                        }}
                      >
                        <MenuItem value="postgresql">PostgreSQL</MenuItem>
                        <MenuItem value="mysql">MySQL</MenuItem>
                        <MenuItem value="sqlite">SQLite</MenuItem>
                        <MenuItem value="sqlserver">SQL Server</MenuItem>
                        <MenuItem value="oracle">Oracle</MenuItem>
                      </Select>
                    </FormControl>
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
                          ✨ <strong>Success!</strong> Your {sqlDialect.toUpperCase()} database schema has been generated.
                        </Typography>
                      </Alert>

                      <SQLViewer sqlCode={sqlCode} dbms={sqlDialect} />

                      <Box sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <Button
                              variant="contained"
                              size="large"
                              fullWidth
                              startIcon={<DownloadIcon />}
                              onClick={handleDownload}
                            >
                              Download SQL
                            </Button>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Button
                              variant="outlined"
                              size="large"
                              fullWidth
                              startIcon={<StorageIcon />}
                              onClick={() => setDbConnectionOpen(true)}
                            >
                              Execute on Database
                            </Button>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Button
                              variant="outlined"
                              size="large"
                              fullWidth
                              startIcon={<DataIcon />}
                              onClick={() => setSampleDataOpen(true)}
                            >
                              Generate Sample Data
                            </Button>
                          </Grid>
                        </Grid>
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                          <Button variant="outlined" onClick={handleReset} startIcon={<RefreshIcon />}>
                            Start New Project
                          </Button>
                        </Box>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </Box>

          {/* Database Connection Dialog */}
          <DatabaseConnectionForm
            open={dbConnectionOpen}
            onClose={() => setDbConnectionOpen(false)}
            sqlScript={sqlCode}
            sqlDialect={sqlDialect}
          />

          {/* Optimization Suggestions Dialog */}
          <OptimizationSuggestions
            open={optimizationOpen}
            onClose={() => setOptimizationOpen(false)}
            metamodel={metamodel}
          />

          {/* Sample Data Generator Dialog */}
          <SampleDataGenerator
            open={sampleDataOpen}
            onClose={() => setSampleDataOpen(false)}
            metamodel={metamodel}
          />
        </Container>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
