/**
 * PlantUML Diagram Viewer Component
 * Displays PlantUML diagrams using PlantUML server
 */

import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'

interface PlantUMLViewerProps {
  plantumlCode: string
  style?: React.CSSProperties
}

const PlantUMLViewer: React.FC<PlantUMLViewerProps> = ({ plantumlCode, style }) => {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [zoom, setZoom] = useState<number>(100)

  // Public PlantUML server
  const PLANTUML_SERVER = 'https://www.plantuml.com/plantuml'

  useEffect(() => {
    if (plantumlCode) {
      generateDiagramUrl()
    }
  }, [plantumlCode])

  /**
   * Generate PlantUML diagram URL using server encoding
   */
  const generateDiagramUrl = async () => {
    try {
      setLoading(true)
      setError('')

      // Use SVG format instead of PNG for better compatibility
      // SVG doesn't require complex encoding
      const url = `${PLANTUML_SERVER}/svg/${encodePlantUML(plantumlCode)}`

      setImageUrl(url)
      setLoading(false)
    } catch (err) {
      setError('Failed to generate diagram. Please check PlantUML syntax.')
      setLoading(false)
    }
  }

  /**
   * Encode PlantUML text to URL-safe format
   * Uses PlantUML's text encoding (simpler than deflate)
   */
  const encodePlantUML = (text: string): string => {
    // PlantUML text encoding - convert to hex
    // This is a simplified encoding that works with PlantUML server
    const encoded = Array.from(text)
      .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
    return `~h${encoded}`
  }

  /**
   * Download PlantUML diagram as SVG
   */
  const handleDownload = () => {
    if (!imageUrl) return

    const link = document.createElement('a')
    link.href = imageUrl
    link.download = 'diagram.svg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Download PlantUML source code as .puml file
   */
  const handleDownloadSource = () => {
    const blob = new Blob([plantumlCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'diagram.puml'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Handle zoom in
   */
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200))
  }

  /**
   * Handle zoom out
   */
  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50))
  }

  /**
   * Refresh diagram
   */
  const handleRefresh = () => {
    generateDiagramUrl()
  }

  return (
    <Card sx={{ ...style }}>
      <CardContent>
        {/* Toolbar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">PlantUML Class Diagram</Typography>
          <Box>
            <Tooltip title="Zoom Out">
              <IconButton onClick={handleZoomOut} disabled={zoom <= 50}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Typography component="span" sx={{ mx: 1 }}>
              {zoom}%
            </Typography>
            <Tooltip title="Zoom In">
              <IconButton onClick={handleZoomIn} disabled={zoom >= 200}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh Diagram">
              <IconButton onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download SVG">
              <IconButton onClick={handleDownload}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Diagram Display Area */}
        <Box
          sx={{
            width: '100%',
            minHeight: '400px',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            overflow: 'auto',
            bgcolor: '#fafafa',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
          }}
        >
          {loading && <CircularProgress />}

          {error && (
            <Alert severity="error" sx={{ maxWidth: 600 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && imageUrl && (
            <img
              src={imageUrl}
              alt="PlantUML Diagram"
              style={{
                maxWidth: '100%',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease',
              }}
              onError={() => setError('Failed to load diagram image')}
            />
          )}
        </Box>

        {/* Source Code Preview */}
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              PlantUML Source Code
            </Typography>
            <Tooltip title="Download .puml file">
              <IconButton size="small" onClick={handleDownloadSource}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            component="pre"
            sx={{
              bgcolor: '#f5f5f5',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: '200px',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              border: '1px solid #e0e0e0',
            }}
          >
            <code>{plantumlCode}</code>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default PlantUMLViewer
