/**
 * Entity Edit Dialog Component
 * Modal for editing entity properties and attributes
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
  IconButton,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Typography,
  Divider,
  Alert,
  Chip,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material'

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

interface EntityEditDialogProps {
  open: boolean
  entity: Entity | null
  allEntities: Entity[]
  onClose: () => void
  onSave: (entity: Entity) => void
  onDelete: (entityName: string) => void
}

const DATA_TYPES = [
  'INTEGER',
  'BIGINT',
  'VARCHAR',
  'CHAR',
  'TEXT',
  'DATE',
  'TIME',
  'TIMESTAMP',
  'DATETIME',
  'BOOLEAN',
  'DECIMAL',
  'FLOAT',
  'DOUBLE',
  'JSON',
  'BLOB',
]

export function EntityEditDialog({
  open,
  entity,
  allEntities,
  onClose,
  onSave,
  onDelete,
}: EntityEditDialogProps) {
  const [editedEntity, setEditedEntity] = useState<Entity | null>(null)
  const [editingAttributeIndex, setEditingAttributeIndex] = useState<number | null>(null)
  const [showAddAttribute, setShowAddAttribute] = useState(false)
  const [newAttribute, setNewAttribute] = useState<Attribute>({
    name: '',
    data_type: 'VARCHAR',
    is_nullable: true,
  })

  useEffect(() => {
    if (entity) {
      setEditedEntity({ ...entity })
    }
  }, [entity])

  if (!editedEntity) return null

  const handleSave = () => {
    // Validation
    if (!editedEntity.name.trim()) {
      alert('Le nom de l\'entité ne peut pas être vide')
      return
    }

    if (editedEntity.attributes.length === 0) {
      alert('L\'entité doit avoir au moins un attribut')
      return
    }

    const hasPrimaryKey = editedEntity.attributes.some((a) => a.is_primary_key)
    if (!hasPrimaryKey) {
      alert('L\'entité doit avoir une clé primaire')
      return
    }

    onSave(editedEntity)
  }

  const handleAddAttribute = () => {
    if (!newAttribute.name.trim()) {
      alert('Le nom de l\'attribut ne peut pas être vide')
      return
    }

    setEditedEntity({
      ...editedEntity,
      attributes: [...editedEntity.attributes, { ...newAttribute }],
    })

    setNewAttribute({
      name: '',
      data_type: 'VARCHAR',
      is_nullable: true,
    })
    setShowAddAttribute(false)
  }

  const handleDeleteAttribute = (index: number) => {
    setEditedEntity({
      ...editedEntity,
      attributes: editedEntity.attributes.filter((_, i) => i !== index),
    })
  }

  const handleUpdateAttribute = (index: number, field: keyof Attribute, value: any) => {
    const updatedAttributes = [...editedEntity.attributes]
    updatedAttributes[index] = { ...updatedAttributes[index], [field]: value }

    // If setting as primary key, unset others
    if (field === 'is_primary_key' && value === true) {
      updatedAttributes.forEach((attr, i) => {
        if (i !== index) {
          attr.is_primary_key = false
        }
      })
    }

    setEditedEntity({
      ...editedEntity,
      attributes: updatedAttributes,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">✏️ Éditer l'entité</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Entity Name */}
        <TextField
          fullWidth
          label="Nom de l'entité"
          value={editedEntity.name}
          onChange={(e) => setEditedEntity({ ...editedEntity, name: e.target.value })}
          margin="normal"
          required
        />

        {/* Entity Description */}
        <TextField
          fullWidth
          label="Description (optionnel)"
          value={editedEntity.description || ''}
          onChange={(e) => setEditedEntity({ ...editedEntity, description: e.target.value })}
          margin="normal"
          multiline
          rows={2}
        />

        <Divider sx={{ my: 3 }} />

        {/* Attributes Section */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Attributs ({editedEntity.attributes.length})</Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setShowAddAttribute(true)}
            >
              Ajouter attribut
            </Button>
          </Box>

          {/* Add Attribute Form */}
          {showAddAttribute && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Nouvel attribut
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  label="Nom"
                  value={newAttribute.name}
                  onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                  sx={{ flex: 1 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newAttribute.data_type}
                    label="Type"
                    onChange={(e) =>
                      setNewAttribute({ ...newAttribute, data_type: e.target.value })
                    }
                  >
                    {DATA_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {['VARCHAR', 'CHAR', 'DECIMAL'].includes(newAttribute.data_type) && (
                  <TextField
                    size="small"
                    label="Longueur"
                    type="number"
                    value={newAttribute.length || ''}
                    onChange={(e) =>
                      setNewAttribute({ ...newAttribute, length: parseInt(e.target.value) })
                    }
                    sx={{ width: 100 }}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newAttribute.is_primary_key || false}
                      onChange={(e) =>
                        setNewAttribute({ ...newAttribute, is_primary_key: e.target.checked })
                      }
                    />
                  }
                  label="Clé primaire"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newAttribute.is_nullable !== false}
                      onChange={(e) =>
                        setNewAttribute({ ...newAttribute, is_nullable: e.target.checked })
                      }
                    />
                  }
                  label="Nullable"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newAttribute.is_unique || false}
                      onChange={(e) =>
                        setNewAttribute({ ...newAttribute, is_unique: e.target.checked })
                      }
                    />
                  }
                  label="Unique"
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" size="small" onClick={handleAddAttribute}>
                  Ajouter
                </Button>
                <Button size="small" onClick={() => setShowAddAttribute(false)}>
                  Annuler
                </Button>
              </Box>
            </Box>
          )}

          {/* Attributes List */}
          <List dense>
            {editedEntity.attributes.map((attr, index) => (
              <ListItem
                key={index}
                sx={{
                  bgcolor: 'background.paper',
                  mb: 1,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {attr.name}
                      </Typography>
                      {attr.is_primary_key && <Chip label="PK" size="small" color="primary" />}
                      {attr.is_foreign_key && <Chip label="FK" size="small" color="secondary" />}
                      {attr.is_unique && <Chip label="UNIQUE" size="small" />}
                    </Box>
                  }
                  secondary={`${attr.data_type}${attr.length ? `(${attr.length})` : ''} • ${
                    attr.is_nullable ? 'Nullable' : 'NOT NULL'
                  }`}
                />
                <IconButton
                  edge="end"
                  size="small"
                  color="error"
                  onClick={() => handleDeleteAttribute(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>

          {editedEntity.attributes.length === 0 && (
            <Alert severity="warning">
              Aucun attribut défini. Ajoutez au moins une clé primaire.
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => {
            if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'entité "${editedEntity.name}" ?`)) {
              onDelete(entity!.name)
            }
          }}
        >
          Supprimer
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
          Sauvegarder
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EntityEditDialog
