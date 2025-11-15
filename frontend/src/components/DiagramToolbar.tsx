/**
 * Diagram Toolbar Component
 * Toolbar with diagram editing tools
 * (Currently integrated directly in InteractiveMermaidEditor)
 */

import { Box } from '@mui/material'

interface DiagramToolbarProps {
  onAddEntity?: () => void
  onAddRelationship?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onSave?: () => void
}

export function DiagramToolbar(props: DiagramToolbarProps) {
  // This component is currently embedded in InteractiveMermaidEditor
  // Keep it as a placeholder for future refactoring
  return <Box />
}

export default DiagramToolbar
