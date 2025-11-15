/**
 * Interactive Mermaid Editor Component
 * Allows users to visually edit database schema diagrams
 */

import { useState, useCallback } from 'react'
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material'
import mermaid from 'mermaid'
import { useEffect, useRef } from 'react'

// Import sub-components (to be created)
import { DiagramToolbar } from './DiagramToolbar'
import { PropertiesPanel } from './PropertiesPanel'
import { EntityEditDialog } from './EntityEditDialog'
import { RelationshipEditDialog } from './RelationshipEditDialog'
import { AddEntityDialog } from './AddEntityDialog'

interface Entity {
  name: string
  attributes: Array<{
    name: string
    data_type: string
    length?: number
    is_primary_key?: boolean
    is_foreign_key?: boolean
    is_nullable?: boolean
    is_unique?: boolean
  }>
  description?: string
}

interface Relationship {
  name: string
  source_entity: string
  target_entity: string
  cardinality: 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many'
  source_foreign_key?: string
  target_foreign_key?: string
}

interface Metamodel {
  entities: Entity[]
  relationships: Relationship[]
  metadata?: any
}

interface InteractiveMermaidEditorProps {
  initialMetamodel: Metamodel
  mermaidCode: string
  onMetamodelChange?: (metamodel: Metamodel) => void
  onSave?: (metamodel: Metamodel) => void
}

export function InteractiveMermaidEditor({
  initialMetamodel,
  mermaidCode,
  onMetamodelChange,
  onSave,
}: InteractiveMermaidEditorProps) {
  // State
  const [metamodel, setMetamodel] = useState<Metamodel>(initialMetamodel)
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null)
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null)
  const [showEntityDialog, setShowEntityDialog] = useState(false)
  const [showRelationshipDialog, setShowRelationshipDialog] = useState(false)
  const [showAddEntityDialog, setShowAddEntityDialog] = useState(false)
  const [editMode, setEditMode] = useState<'add' | 'edit'>('edit')
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [zoom, setZoom] = useState(100)

  const diagramRef = useRef<HTMLDivElement>(null)

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    })
  }, [])

  // Render Mermaid diagram
  useEffect(() => {
    const renderDiagram = async () => {
      if (diagramRef.current && mermaidCode) {
        try {
          // Clear previous content
          diagramRef.current.innerHTML = ''

          // Generate unique ID
          const id = `mermaid-editor-${Date.now()}`

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
  }, [mermaidCode, zoom])

  // Handle entity click
  const handleEntityClick = useCallback((entityName: string) => {
    const entity = metamodel.entities.find((e) => e.name === entityName)
    if (entity) {
      setSelectedEntity(entity)
      setSelectedRelationship(null)
      setEditMode('edit')
      setShowEntityDialog(true)
    }
  }, [metamodel.entities])

  // Handle relationship click
  const handleRelationshipClick = useCallback((relationshipName: string) => {
    const relationship = metamodel.relationships.find((r) => r.name === relationshipName)
    if (relationship) {
      setSelectedRelationship(relationship)
      setSelectedEntity(null)
      setShowRelationshipDialog(true)
    }
  }, [metamodel.relationships])

  // Update metamodel
  const updateMetamodel = useCallback((newMetamodel: Metamodel) => {
    setMetamodel(newMetamodel)
    if (onMetamodelChange) {
      onMetamodelChange(newMetamodel)
    }
    setSnackbarMessage('Modifications enregistrées')
    setShowSnackbar(true)
  }, [onMetamodelChange])

  // Add new entity
  const handleAddEntity = useCallback((newEntity: Entity) => {
    console.log('[ADD ENTITY] Adding new entity:', newEntity)
    const updatedMetamodel = {
      ...metamodel,
      entities: [...metamodel.entities, newEntity],
    }
    console.log('[ADD ENTITY] Updated metamodel:', updatedMetamodel)
    updateMetamodel(updatedMetamodel)
    setShowAddEntityDialog(false)
    setSnackbarMessage(`Entité "${newEntity.name}" ajoutée avec succès !`)
    setShowSnackbar(true)
  }, [metamodel, updateMetamodel])

  // Update existing entity
  const handleUpdateEntity = useCallback((updatedEntity: Entity) => {
    const updatedMetamodel = {
      ...metamodel,
      entities: metamodel.entities.map((e) =>
        e.name === selectedEntity?.name ? updatedEntity : e
      ),
    }
    updateMetamodel(updatedMetamodel)
    setShowEntityDialog(false)
    setSelectedEntity(null)
  }, [metamodel, selectedEntity, updateMetamodel])

  // Delete entity
  const handleDeleteEntity = useCallback((entityName: string) => {
    const updatedMetamodel = {
      ...metamodel,
      entities: metamodel.entities.filter((e) => e.name !== entityName),
      relationships: metamodel.relationships.filter(
        (r) => r.source_entity !== entityName && r.target_entity !== entityName
      ),
    }
    updateMetamodel(updatedMetamodel)
    setShowEntityDialog(false)
    setSelectedEntity(null)
    setSnackbarMessage(`Entité "${entityName}" supprimée`)
    setShowSnackbar(true)
  }, [metamodel, updateMetamodel])

  // Update relationship
  const handleUpdateRelationship = useCallback((updatedRelationship: Relationship) => {
    const updatedMetamodel = {
      ...metamodel,
      relationships: metamodel.relationships.map((r) =>
        r.name === selectedRelationship?.name ? updatedRelationship : r
      ),
    }
    updateMetamodel(updatedMetamodel)
    setShowRelationshipDialog(false)
    setSelectedRelationship(null)
  }, [metamodel, selectedRelationship, updateMetamodel])

  // Save changes
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(metamodel)
    }
    setSnackbarMessage('Schéma sauvegardé avec succès !')
    setShowSnackbar(true)
  }, [metamodel, onSave])

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50))
  const handleResetZoom = () => setZoom(100)

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with instructions */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Mode Édition Activé :</strong> Cliquez sur une entité ou une relation dans le
          diagramme pour l'éditer. Utilisez la barre d'outils pour ajouter de nouveaux éléments.
        </Typography>
      </Alert>

      {/* Toolbar */}
      <Paper elevation={1} sx={{ mb: 2, p: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Ajouter une entité">
            <IconButton
              color="primary"
              onClick={() => {
                setEditMode('add')
                setShowAddEntityDialog(true)
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem />

          <Tooltip title="Zoom avant">
            <IconButton onClick={handleZoomIn} disabled={zoom >= 200}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>

          <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'center' }}>
            {zoom}%
          </Typography>

          <Tooltip title="Zoom arrière">
            <IconButton onClick={handleZoomOut} disabled={zoom <= 50}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Réinitialiser le zoom">
            <IconButton onClick={handleResetZoom}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem />

          <Box sx={{ flex: 1 }} />

          <Tooltip title="Sauvegarder les modifications">
            <IconButton color="success" onClick={handleSave}>
              <SaveIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Main content: Entity List + Diagram + Properties Panel */}
      <Box sx={{ display: 'flex', gap: 2, flex: 1, overflow: 'hidden' }}>
        {/* Entity List (Sidebar) */}
        <Paper
          elevation={2}
          sx={{
            width: 250,
            p: 2,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h6" gutterBottom>
            📦 Entités ({metamodel.entities.length})
          </Typography>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {metamodel.entities.map((entity) => (
              <Paper
                key={entity.name}
                elevation={selectedEntity?.name === entity.name ? 3 : 1}
                sx={{
                  p: 1.5,
                  mb: 1,
                  cursor: 'pointer',
                  border: 2,
                  borderColor:
                    selectedEntity?.name === entity.name ? 'primary.main' : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.light',
                    transform: 'translateX(4px)',
                  },
                }}
                onClick={() => {
                  setSelectedEntity(entity)
                  setSelectedRelationship(null)
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {entity.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {entity.attributes.length} attributs
                </Typography>
              </Paper>
            ))}
          </Box>
        </Paper>

        {/* Diagram Canvas */}
        <Paper
          elevation={2}
          sx={{
            flex: 2,
            p: 2,
            overflow: 'auto',
            position: 'relative',
            backgroundColor: '#f5f5f5',
          }}
        >
          <Box
            ref={diagramRef}
            sx={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              transition: 'transform 0.2s',
            }}
          />

          {/* Overlay hint */}
          {!selectedEntity && !selectedRelationship && (
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                p: 2,
                borderRadius: 1,
                boxShadow: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                💡 Utilisez la liste de gauche pour sélectionner une entité
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Properties Panel */}
        <PropertiesPanel
          selectedEntity={selectedEntity}
          selectedRelationship={selectedRelationship}
          onEditEntity={() => setShowEntityDialog(true)}
          onEditRelationship={() => setShowRelationshipDialog(true)}
          onClose={() => {
            setSelectedEntity(null)
            setSelectedRelationship(null)
          }}
        />
      </Box>

      {/* Dialogs */}
      <EntityEditDialog
        open={showEntityDialog}
        entity={selectedEntity}
        onClose={() => {
          setShowEntityDialog(false)
          setSelectedEntity(null)
        }}
        onSave={handleUpdateEntity}
        onDelete={handleDeleteEntity}
        allEntities={metamodel.entities}
      />

      <AddEntityDialog
        open={showAddEntityDialog}
        onClose={() => setShowAddEntityDialog(false)}
        onAdd={handleAddEntity}
        existingEntityNames={metamodel.entities.map((e) => e.name)}
      />

      <RelationshipEditDialog
        open={showRelationshipDialog}
        relationship={selectedRelationship}
        entities={metamodel.entities}
        onClose={() => {
          setShowRelationshipDialog(false)
          setSelectedRelationship(null)
        }}
        onSave={handleUpdateRelationship}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
      />
    </Box>
  )
}

export default InteractiveMermaidEditor
