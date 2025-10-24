/**
 * Diagram Viewer Component
 * Displays Mermaid diagrams
 */

import React, { useEffect, useRef } from 'react'
import { Paper, Typography, Box } from '@mui/material'
import mermaid from 'mermaid'

interface DiagramViewerProps {
  mermaidCode: string
  title?: string
}

const DiagramViewer: React.FC<DiagramViewerProps> = ({ mermaidCode, title = 'Database Diagram' }) => {
  const diagramRef = useRef<HTMLDivElement>(null)

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

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

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
          <Typography color="text.secondary">
            No diagram generated yet
          </Typography>
        )}
      </Box>
    </Paper>
  )
}

export default DiagramViewer
