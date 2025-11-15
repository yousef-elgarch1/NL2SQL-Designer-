/**
 * Add Entity Dialog Component
 * Modal for creating a new entity
 */

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
} from '@mui/material'
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material'

interface Attribute {
  name: string
  data_type: string
  length?: number
  is_primary_key?: boolean
  is_nullable?: boolean
}

interface Entity {
  name: string
  attributes: Attribute[]
  description?: string
}

interface AddEntityDialogProps {
  open: boolean
  existingEntityNames: string[]
  onClose: () => void
  onAdd: (entity: Entity) => void
}

export function AddEntityDialog({ open, existingEntityNames, onClose, onAdd }: AddEntityDialogProps) {
  const [entityName, setEntityName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const handleAdd = () => {
    // Validation
    if (!entityName.trim()) {
      setError('Le nom de l\'entité ne peut pas être vide')
      return
    }

    if (existingEntityNames.includes(entityName)) {
      setError('Une entité avec ce nom existe déjà')
      return
    }

    // Create new entity with default id attribute
    const newEntity: Entity = {
      name: entityName,
      description: description || undefined,
      attributes: [
        {
          name: 'id',
          data_type: 'INTEGER',
          is_primary_key: true,
          is_nullable: false,
        },
      ],
    }

    onAdd(newEntity)

    // Reset form
    setEntityName('')
    setDescription('')
    setError('')
  }

  const handleClose = () => {
    setEntityName('')
    setDescription('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddIcon color="primary" />
          <Typography variant="h6">Ajouter une nouvelle entité</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Nom de l'entité"
          value={entityName}
          onChange={(e) => {
            setEntityName(e.target.value)
            setError('')
          }}
          margin="normal"
          required
          autoFocus
          placeholder="Ex: Customer, Product, Order..."
        />

        <TextField
          fullWidth
          label="Description (optionnel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={3}
          placeholder="Décrivez brièvement le rôle de cette entité..."
        />

        <Alert severity="info" sx={{ mt: 2 }}>
          L'entité sera créée avec un attribut <strong>id</strong> (clé primaire) par défaut.
          Vous pourrez ajouter d'autres attributs après création.
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Annuler</Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Créer l'entité
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddEntityDialog
