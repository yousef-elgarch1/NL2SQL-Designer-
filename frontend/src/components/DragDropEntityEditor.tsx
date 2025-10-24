import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Paper,
  Tooltip,
  Button,
  Grid,
  Divider,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Key as KeyIcon,
  Link as LinkIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  TableChart as TableIcon
} from '@mui/icons-material';

interface Entity {
  name: string;
  description: string;
  attributes: Attribute[];
}

interface Attribute {
  name: string;
  data_type: string;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  is_nullable: boolean;
  is_unique: boolean;
  length?: number;
  default_value?: string;
}

interface DragDropEntityEditorProps {
  entities: Entity[];
  onEntitiesChange: (entities: Entity[]) => void;
}

export const DragDropEntityEditor: React.FC<DragDropEntityEditorProps> = ({
  entities,
  onEntitiesChange
}) => {
  const [draggedEntity, setDraggedEntity] = useState<number | null>(null);
  const [draggedAttribute, setDraggedAttribute] = useState<{ entityIndex: number; attrIndex: number } | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEntity, setSelectedEntity] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [editingEntityIndex, setEditingEntityIndex] = useState<number | null>(null);

  // Entity Drag Handlers
  const handleEntityDragStart = (e: React.DragEvent, index: number) => {
    setDraggedEntity(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleEntityDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedEntity === null || draggedEntity === index) return;

    const newEntities = [...entities];
    const draggedItem = newEntities[draggedEntity];
    newEntities.splice(draggedEntity, 1);
    newEntities.splice(index, 0, draggedItem);
    onEntitiesChange(newEntities);
    setDraggedEntity(index);
  };

  const handleEntityDragEnd = () => {
    setDraggedEntity(null);
  };

  // Attribute Drag Handlers
  const handleAttributeDragStart = (e: React.DragEvent, entityIndex: number, attrIndex: number) => {
    setDraggedAttribute({ entityIndex, attrIndex });
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
  };

  const handleAttributeDragOver = (e: React.DragEvent, entityIndex: number, attrIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedAttribute || draggedAttribute.entityIndex !== entityIndex || draggedAttribute.attrIndex === attrIndex) {
      return;
    }

    const newEntities = [...entities];
    const attributes = [...newEntities[entityIndex].attributes];
    const draggedItem = attributes[draggedAttribute.attrIndex];
    attributes.splice(draggedAttribute.attrIndex, 1);
    attributes.splice(attrIndex, 0, draggedItem);
    newEntities[entityIndex].attributes = attributes;
    onEntitiesChange(newEntities);
    setDraggedAttribute({ entityIndex, attrIndex });
  };

  const handleAttributeDragEnd = () => {
    setDraggedAttribute(null);
  };

  // Entity Actions
  const handleAddEntity = () => {
    const newEntity: Entity = {
      name: `NewEntity${entities.length + 1}`,
      description: 'New entity description',
      attributes: [
        {
          name: 'id',
          data_type: 'INTEGER',
          is_primary_key: true,
          is_foreign_key: false,
          is_nullable: false,
          is_unique: true
        }
      ]
    };
    onEntitiesChange([...entities, newEntity]);
  };

  const handleEditEntity = (index: number) => {
    setEditingEntity({ ...entities[index] });
    setEditingEntityIndex(index);
    setEditDialogOpen(true);
    setAnchorEl(null);
  };

  const handleSaveEntity = () => {
    if (editingEntity && editingEntityIndex !== null) {
      const newEntities = [...entities];
      newEntities[editingEntityIndex] = editingEntity;
      onEntitiesChange(newEntities);
      setEditDialogOpen(false);
      setEditingEntity(null);
      setEditingEntityIndex(null);
    }
  };

  const handleDeleteEntity = (index: number) => {
    const newEntities = entities.filter((_, i) => i !== index);
    onEntitiesChange(newEntities);
    setAnchorEl(null);
  };

  const handleMenuClick = (e: React.MouseEvent<HTMLElement>, index: number) => {
    setAnchorEl(e.currentTarget);
    setSelectedEntity(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEntity(null);
  };

  const getDataTypeColor = (dataType: string) => {
    if (dataType.includes('INT')) return 'primary';
    if (dataType.includes('CHAR') || dataType.includes('TEXT')) return 'secondary';
    if (dataType.includes('DATE') || dataType.includes('TIME')) return 'info';
    if (dataType.includes('BOOL')) return 'success';
    if (dataType.includes('DECIMAL') || dataType.includes('FLOAT')) return 'warning';
    return 'default';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Entities ({entities.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddEntity}
        >
          Add Entity
        </Button>
      </Box>

      <Grid container spacing={2}>
        {entities.map((entity, entityIndex) => (
          <Grid item xs={12} md={6} lg={4} key={entityIndex}>
            <Card
              draggable
              onDragStart={(e) => handleEntityDragStart(e, entityIndex)}
              onDragOver={(e) => handleEntityDragOver(e, entityIndex)}
              onDragEnd={handleEntityDragEnd}
              sx={{
                cursor: 'move',
                opacity: draggedEntity === entityIndex ? 0.5 : 1,
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)'
                },
                height: '100%'
              }}
            >
              <CardContent>
                {/* Entity Header */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <DragIcon color="action" sx={{ cursor: 'grab' }} />
                    <TableIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      {entity.name}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, entityIndex)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {entity.description}
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {/* Attributes */}
                <Typography variant="subtitle2" gutterBottom>
                  Attributes ({entity.attributes.length})
                </Typography>

                <Box>
                  {entity.attributes.map((attr, attrIndex) => (
                    <Paper
                      key={attrIndex}
                      draggable
                      onDragStart={(e) => handleAttributeDragStart(e, entityIndex, attrIndex)}
                      onDragOver={(e) => handleAttributeDragOver(e, entityIndex, attrIndex)}
                      onDragEnd={handleAttributeDragEnd}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        mb: 1,
                        cursor: 'move',
                        opacity: draggedAttribute?.entityIndex === entityIndex && draggedAttribute?.attrIndex === attrIndex ? 0.5 : 1,
                        bgcolor: 'background.default',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <DragIcon fontSize="small" color="action" />
                        <Box flexGrow={1}>
                          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <Typography variant="body2" fontWeight={600}>
                              {attr.name}
                            </Typography>
                            <Chip
                              label={attr.data_type}
                              size="small"
                              color={getDataTypeColor(attr.data_type) as any}
                              variant="outlined"
                            />
                            {attr.is_primary_key && (
                              <Tooltip title="Primary Key">
                                <KeyIcon fontSize="small" color="warning" />
                              </Tooltip>
                            )}
                            {attr.is_foreign_key && (
                              <Tooltip title="Foreign Key">
                                <LinkIcon fontSize="small" color="info" />
                              </Tooltip>
                            )}
                            {!attr.is_nullable && (
                              <Chip label="NOT NULL" size="small" variant="outlined" />
                            )}
                            {attr.is_unique && (
                              <Chip label="UNIQUE" size="small" color="success" variant="outlined" />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Entity Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedEntity !== null && handleEditEntity(selectedEntity)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Entity
        </MenuItem>
        <MenuItem onClick={() => selectedEntity !== null && handleDeleteEntity(selectedEntity)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Entity
        </MenuItem>
      </Menu>

      {/* Edit Entity Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Entity</DialogTitle>
        <DialogContent>
          {editingEntity && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Entity Name"
                value={editingEntity.name}
                onChange={(e) => setEditingEntity({ ...editingEntity, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                value={editingEntity.description}
                onChange={(e) => setEditingEntity({ ...editingEntity, description: e.target.value })}
                multiline
                rows={3}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEntity}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
