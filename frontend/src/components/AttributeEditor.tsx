/**
 * Attribute Editor Component
 * Allows users to edit entity attributes before diagram generation
 */

import React from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  IconButton,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'

// Data types available for attributes
const DATA_TYPES = [
  'INTEGER',
  'VARCHAR',
  'TEXT',
  'DATE',
  'TIMESTAMP',
  'BOOLEAN',
  'DECIMAL',
  'FLOAT',
  'CHAR',
  'BIGINT',
]

export interface Attribute {
  name: string
  data_type: string
  length?: number
  is_primary_key: boolean
  is_foreign_key: boolean
  is_unique: boolean
  is_nullable: boolean
  default_value?: string
}

export interface EntityWithAttributes {
  name: string
  attributes: Attribute[]
}

interface AttributeEditorProps {
  entities: EntityWithAttributes[]
  onChange: (entities: EntityWithAttributes[]) => void
}

const AttributeEditor: React.FC<AttributeEditorProps> = ({ entities, onChange }) => {
  const handleAttributeChange = (
    entityIndex: number,
    attrIndex: number,
    field: keyof Attribute,
    value: any
  ) => {
    const updatedEntities = [...entities]
    const updatedAttributes = [...updatedEntities[entityIndex].attributes]
    updatedAttributes[attrIndex] = {
      ...updatedAttributes[attrIndex],
      [field]: value,
    }
    updatedEntities[entityIndex] = {
      ...updatedEntities[entityIndex],
      attributes: updatedAttributes,
    }
    onChange(updatedEntities)
  }

  const handleAddAttribute = (entityIndex: number) => {
    const updatedEntities = [...entities]
    const newAttribute: Attribute = {
      name: 'new_attribute',
      data_type: 'VARCHAR',
      length: 255,
      is_primary_key: false,
      is_foreign_key: false,
      is_unique: false,
      is_nullable: true,
    }
    updatedEntities[entityIndex] = {
      ...updatedEntities[entityIndex],
      attributes: [...updatedEntities[entityIndex].attributes, newAttribute],
    }
    onChange(updatedEntities)
  }

  const handleDeleteAttribute = (entityIndex: number, attrIndex: number) => {
    const updatedEntities = [...entities]
    const updatedAttributes = [...updatedEntities[entityIndex].attributes]
    updatedAttributes.splice(attrIndex, 1)
    updatedEntities[entityIndex] = {
      ...updatedEntities[entityIndex],
      attributes: updatedAttributes,
    }
    onChange(updatedEntities)
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Edit Entity Attributes
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review and modify the attributes for each entity. Click the + button to add new attributes.
      </Typography>

      {entities.map((entity, entityIndex) => (
        <Accordion key={entity.name} defaultExpanded={entityIndex === 0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              {entity.name} ({entity.attributes.length} attributes)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell>
                      <strong>Name</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Type</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Length</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>PK</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Unique</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Nullable</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Default</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Actions</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entity.attributes.map((attr, attrIndex) => (
                    <TableRow key={attrIndex}>
                      <TableCell>
                        <TextField
                          size="small"
                          value={attr.name}
                          onChange={(e) =>
                            handleAttributeChange(entityIndex, attrIndex, 'name', e.target.value)
                          }
                          fullWidth
                          variant="standard"
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth variant="standard">
                          <Select
                            value={attr.data_type}
                            onChange={(e) =>
                              handleAttributeChange(entityIndex, attrIndex, 'data_type', e.target.value)
                            }
                          >
                            {DATA_TYPES.map((type) => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="center">
                        {['VARCHAR', 'CHAR', 'DECIMAL'].includes(attr.data_type) ? (
                          <TextField
                            size="small"
                            type="number"
                            value={attr.length || ''}
                            onChange={(e) =>
                              handleAttributeChange(
                                entityIndex,
                                attrIndex,
                                'length',
                                e.target.value ? parseInt(e.target.value) : undefined
                              )
                            }
                            sx={{ width: 70 }}
                            variant="standard"
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={attr.is_primary_key}
                          onChange={(e) =>
                            handleAttributeChange(entityIndex, attrIndex, 'is_primary_key', e.target.checked)
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={attr.is_unique}
                          onChange={(e) =>
                            handleAttributeChange(entityIndex, attrIndex, 'is_unique', e.target.checked)
                          }
                          size="small"
                          disabled={attr.is_primary_key}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={attr.is_nullable}
                          onChange={(e) =>
                            handleAttributeChange(entityIndex, attrIndex, 'is_nullable', e.target.checked)
                          }
                          size="small"
                          disabled={attr.is_primary_key}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={attr.default_value || ''}
                          onChange={(e) =>
                            handleAttributeChange(entityIndex, attrIndex, 'default_value', e.target.value)
                          }
                          placeholder="-"
                          sx={{ width: 100 }}
                          variant="standard"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteAttribute(entityIndex, attrIndex)}
                          disabled={attr.is_primary_key}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Button
              startIcon={<AddIcon />}
              onClick={() => handleAddAttribute(entityIndex)}
              sx={{ mt: 2 }}
              variant="outlined"
              size="small"
            >
              Add Attribute
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}

export default AttributeEditor
