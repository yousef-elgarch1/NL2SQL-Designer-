/**
 * SQL Viewer Component
 * Displays generated SQL with syntax highlighting using Monaco Editor
 */

import React from 'react'
import { Paper, Typography, Box, Button } from '@mui/material'
import { Download as DownloadIcon, ContentCopy as CopyIcon } from '@mui/icons-material'
import Editor from '@monaco-editor/react'

interface SQLViewerProps {
  sqlCode: string
  dbms?: string
  onDownload?: () => void
}

const SQLViewer: React.FC<SQLViewerProps> = ({ sqlCode, dbms = 'postgresql', onDownload }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode)
    // TODO: Show success toast in Phase 1
    alert('SQL copied to clipboard!')
  }

  const handleDownload = () => {
    const blob = new Blob([sqlCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `schema_${dbms}.sql`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Generated SQL ({dbms.toUpperCase()})
        </Typography>

        <Box>
          <Button
            size="small"
            startIcon={<CopyIcon />}
            onClick={handleCopy}
            disabled={!sqlCode}
            sx={{ mr: 1 }}
          >
            Copy
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={!sqlCode}
          >
            Download
          </Button>
        </Box>
      </Box>

      <Box sx={{ border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
        <Editor
          height="400px"
          language="sql"
          value={sqlCode || '-- No SQL generated yet'}
          theme="vs-light"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
          }}
        />
      </Box>
    </Paper>
  )
}

export default SQLViewer
