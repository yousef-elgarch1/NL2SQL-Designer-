/**
 * Relationship Edit Dialog Component
 * Modal for editing relationship properties
 */

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  IconButton,
} from '@mui/material'
import { Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material'

interface Entity {
  name: string
  attributes: any[]
}

interface Relationship {
  name: string
  source_entity: string
  target_entity: string
  cardinality: string
  source_foreign_key?: string
  target_foreign_key?: string
  description?: string
}

interface RelationshipEditDialogProps {
  open: boolean
  relationship: Relationship | null
  entities: Entity[]
  onClose: () => void
  onSave: (relationship: Relationship) => void
}

const CARDINALITY_OPTIONS = [
  { value: 'one_to_one', label: 'One-to-One (1:1)' },
  { value: 'one_to_many', label: 'One-to-Many (1:N)' },
  { value: 'many_to_one', label: 'Many-to-One (N:1)' },
  { value: 'many_to_many', label: 'Many-to-Many (N:M)' },
]

export function RelationshipEditDialog({
  open,
  relationship,
  entities,
  onClose,
  onSave,
}: RelationshipEditDialogProps) {
  const [editedRelationship, setEditedRelationship] = useState<Relationship | null>(null)

  useEffect(() => {
    if (relationship) {
      setEditedRelationship({ ...relationship })
    }
  }, [relationship])

  if (!editedRelationship) return null

  const handleSave = () => {
    // Validation
    if (!editedRelationship.name.trim()) {
      alert('Le nom de la relation ne peut pas être vide')
      return
    }

    if (!editedRelationship.source_entity || !editedRelationship.target_entity) {
      alert('Veuillez sélectionner les entités source et destination')
      return
    }

    onSave(editedRelationship)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">🔗 Éditer la relation</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Relationship Name */}
        <TextField
          fullWidth
          label="Nom de la relation"
          value={editedRelationship.name}
          onChange={(e) =>
            setEditedRelationship({ ...editedRelationship, name: e.target.value })
          }
          margin="normal"
          required
        />

        {/* Source Entity */}
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Entité source</InputLabel>
          <Select
            value={editedRelationship.source_entity}
            label="Entité source"
            onChange={(e) =>
              setEditedRelationship({
                ...editedRelationship,
                source_entity: e.target.value,
              })
            }
          >
            {entities.map((entity) => (
              <MenuItem key={entity.name} value={entity.name}>
                {entity.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Target Entity */}
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Entité destination</InputLabel>
          <Select
            value={editedRelationship.target_entity}
            label="Entité destination"
            onChange={(e) =>
              setEditedRelationship({
                ...editedRelationship,
                target_entity: e.target.value,
              })
            }
          >
            {entities.map((entity) => (
              <MenuItem key={entity.name} value={entity.name}>
                {entity.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Cardinality */}
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Cardinalité</InputLabel>
          <Select
            value={editedRelationship.cardinality}
            label="Cardinalité"
            onChange={(e) =>
              setEditedRelationship({
                ...editedRelationship,
                cardinality: e.target.value,
              })
            }
          >
            {CARDINALITY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Foreign Key (Source) */}
        <TextField
          fullWidth
          label="Clé étrangère (source) - optionnel"
          value={editedRelationship.source_foreign_key || ''}
          onChange={(e) =>
            setEditedRelationship({
              ...editedRelationship,
              source_foreign_key: e.target.value,
            })
          }
          margin="normal"
          placeholder="Ex: target_entity_id"
        />

        {/* Description */}
        <TextField
          fullWidth
          label="Description (optionnel)"
          value={editedRelationship.description || ''}
          onChange={(e) =>
            setEditedRelationship({
              ...editedRelationship,
              description: e.target.value,
            })
          }
          margin="normal"
          multiline
          rows={2}
        />

        <Alert severity="info" sx={{ mt: 2 }}>
          Les relations <strong>Many-to-Many</strong> nécessitent généralement une table de
          liaison intermédiaire.
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
          Sauvegarder
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RelationshipEditDialog
