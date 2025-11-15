/**
 * Diagram Viewer Component
 * Displays Mermaid diagrams with optional edit mode
 */

import React, { useEffect, useRef, useState } from 'react'
import {
  Paper,
  Typography,
  Box,
  Button,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material'
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import mermaid from 'mermaid'
import InteractiveMermaidEditor from './InteractiveMermaidEditor'

interface DiagramViewerProps {
  mermaidCode: string
  title?: string
  metamodel?: any
  onMetamodelChange?: (metamodel: any) => void
  editable?: boolean
}

const DiagramViewer: React.FC<DiagramViewerProps> = ({
  mermaidCode,
  title = 'Database Diagram',
  metamodel,
  onMetamodelChange,
  editable = true,
}) => {
  const diagramRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view')

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    })
  }, [])

  useEffect(() => {
    const renderDiagram = async () => {
      if (diagramRef.current && mermaidCode) {
        try {
          // Clear previous diagram
          diagramRef.current.innerHTML = ''

          // Generate unique ID for this diagram
          const id = `mermaid-${Date.now()}`

          // Render the diagram
          const { svg } = await mermaid.render(id, mermaidCode)

          // Insert the SVG
          diagramRef.current.innerHTML = svg
        } catch (error) {
          console.error('Mermaid rendering error:', error)
          diagramRef.current.innerHTML = `<div style="color: red; padding: 20px;">Error rendering diagram: ${error}</div>`
        }
      }
    }

    renderDiagram()
  }, [mermaidCode])

  // If edit mode and metamodel available, show interactive editor
  if (viewMode === 'edit' && metamodel && editable) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => {
              if (newMode !== null) {
                setViewMode(newMode)
              }
            }}
            size="small"
          >
            <ToggleButton value="view">
              <ViewIcon fontSize="small" sx={{ mr: 1 }} />
              Lecture
            </ToggleButton>
            <ToggleButton value="edit">
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Édition
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <InteractiveMermaidEditor
          initialMetamodel={metamodel}
          mermaidCode={mermaidCode}
          onMetamodelChange={onMetamodelChange}
        />
      </Paper>
    )
  }

  // Default view mode
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        {editable && metamodel && (
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => {
              if (newMode !== null) {
                setViewMode(newMode)
              }
            }}
            size="small"
          >
            <ToggleButton value="view">
              <ViewIcon fontSize="small" sx={{ mr: 1 }} />
              Lecture
            </ToggleButton>
            <ToggleButton value="edit">
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Édition
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>

      <Box
        ref={diagramRef}
        sx={{
          mt: 2,
          p: 2,
          bgcolor: '#f5f5f5',
          borderRadius: 1,
          overflow: 'auto',
          minHeight: '300px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {!mermaidCode && (
          <Typography color="text.secondary">No diagram generated yet</Typography>
        )}
      </Box>
    </Paper>
  )
}

export default DiagramViewer
