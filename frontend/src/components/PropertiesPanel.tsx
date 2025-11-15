/**
 * Properties Panel Component
 * Displays details of selected entity or relationship
 */

import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Collapse,
} from '@mui/material'
import {
  Edit as EditIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from '@mui/icons-material'
import { useState } from 'react'

interface Attribute {
  name: string
  data_type: string
  length?: number
  is_primary_key?: boolean
  is_foreign_key?: boolean
  is_nullable?: boolean
  is_unique?: boolean
}

interface Entity {
  name: string
  attributes: Attribute[]
  description?: string
}

interface Relationship {
  name: string
  source_entity: string
  target_entity: string
  cardinality: string
  source_foreign_key?: string
  target_foreign_key?: string
}

interface PropertiesPanelProps {
  selectedEntity: Entity | null
  selectedRelationship: Relationship | null
  onEditEntity?: () => void
  onEditRelationship?: () => void
  onClose: () => void
}

export function PropertiesPanel({
  selectedEntity,
  selectedRelationship,
  onEditEntity,
  onEditRelationship,
  onClose,
}: PropertiesPanelProps) {
  const [expandedAttributes, setExpandedAttributes] = useState(true)

  if (!selectedEntity && !selectedRelationship) {
    return (
      <Paper
        elevation={2}
        sx={{
          flex: 1,
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafafa',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <InfoIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucune sélection
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cliquez sur une entité ou une relation dans le diagramme pour voir ses propriétés
          </Typography>
        </Box>
      </Paper>
    )
  }

  return (
    <Paper
      elevation={2}
      sx={{
        flex: 1,
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6">
          {selectedEntity ? '📦 Propriétés de l\'entité' : '🔗 Propriétés de la relation'}
        </Typography>
        <IconButton size="small" sx={{ color: 'white' }} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {selectedEntity && (
          <>
            {/* Entity Name */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Nom de l'entité
              </Typography>
              <Typography variant="h5" gutterBottom>
                {selectedEntity.name}
              </Typography>
              {selectedEntity.description && (
                <Typography variant="body2" color="text.secondary">
                  {selectedEntity.description}
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Attributes Section */}
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedAttributes(!expandedAttributes)}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Attributs ({selectedEntity.attributes.length})
                </Typography>
                <IconButton size="small">
                  {expandedAttributes ? <ArrowUpIcon /> : <ArrowDownIcon />}
                </IconButton>
              </Box>

              <Collapse in={expandedAttributes}>
                <List dense>
                  {selectedEntity.attributes.map((attr, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        bgcolor: attr.is_primary_key ? 'primary.light' : 'background.paper',
                        mb: 1,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight="bold">
                              {attr.name}
                            </Typography>
                            {attr.is_primary_key && (
                              <Chip label="PK" size="small" color="primary" />
                            )}
                            {attr.is_foreign_key && (
                              <Chip label="FK" size="small" color="secondary" />
                            )}
                            {attr.is_unique && <Chip label="UNIQUE" size="small" />}
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {attr.data_type}
                            {attr.length ? `(${attr.length})` : ''}
                            {' • '}
                            {attr.is_nullable ? 'Nullable' : 'NOT NULL'}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`${selectedEntity.attributes.length} attributs`}
                size="small"
                color="default"
              />
              <Chip
                label={`${
                  selectedEntity.attributes.filter((a) => a.is_primary_key).length
                } clé primaire`}
                size="small"
                color="primary"
              />
              <Chip
                label={`${
                  selectedEntity.attributes.filter((a) => a.is_foreign_key).length
                } clé étrangère`}
                size="small"
                color="secondary"
              />
            </Box>
          </>
        )}

        {selectedRelationship && (
          <>
            {/* Relationship Name */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Nom de la relation
              </Typography>
              <Typography variant="h5" gutterBottom>
                {selectedRelationship.name}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Relationship Details */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Source
              </Typography>
              <Chip label={selectedRelationship.source_entity} color="primary" />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Destination
              </Typography>
              <Chip label={selectedRelationship.target_entity} color="secondary" />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Cardinalité
              </Typography>
              <Chip
                label={selectedRelationship.cardinality.replace(/_/g, ' ').toUpperCase()}
                color="info"
              />
            </Box>

            {selectedRelationship.source_foreign_key && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Clé étrangère (source)
                </Typography>
                <Typography variant="body1">{selectedRelationship.source_foreign_key}</Typography>
              </Box>
            )}

            {selectedRelationship.target_foreign_key && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Clé étrangère (destination)
                </Typography>
                <Typography variant="body1">{selectedRelationship.target_foreign_key}</Typography>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Footer with Edit Button */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<EditIcon />}
          onClick={selectedEntity ? onEditEntity : onEditRelationship}
        >
          {selectedEntity ? 'Éditer l\'entité' : 'Éditer la relation'}
        </Button>
      </Box>
    </Paper>
  )
}

export default PropertiesPanel
