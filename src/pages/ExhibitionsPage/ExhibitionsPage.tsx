import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box, 
  Breadcrumbs,
  Link,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CardActions,
  Divider,
  Paper,
  Alert,
  Tooltip,
  DialogContentText,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { store } from '../../store';
import { 
  UserExhibition,
  selectAllExhibitions, 
  createExhibition, 
  updateExhibition, 
  deleteExhibition,
  selectExhibitionById,
  removeArtworkFromExhibition
} from '../../store/exhibitionsSlice';
import { selectArtworkById } from '../../store/artworkSlice';
import { Artwork } from '../../types/Artwork';
import CachedImage from '../../components/CachedImage';

const ExhibitionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Get user exhibitions from Redux store
  const userExhibitions = useAppSelector(selectAllExhibitions);
  console.log("ExhibitionsPage rendered, userExhibitions:", userExhibitions);
  
  // State for dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedExhibition, setSelectedExhibition] = useState<string | null>(null);
  
  // State for form inputs
  const [newExhibitionTitle, setNewExhibitionTitle] = useState('');
  const [newExhibitionDescription, setNewExhibitionDescription] = useState('');
  const [editExhibitionTitle, setEditExhibitionTitle] = useState('');
  const [editExhibitionDescription, setEditExhibitionDescription] = useState('');

  // State for notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Handle opening the create dialog
  const handleCreateDialogOpen = () => {
    setNewExhibitionTitle('');
    setNewExhibitionDescription('');
    setCreateDialogOpen(true);
  };

  // Handle creating a new exhibition
  const handleCreateExhibition = () => {
    if (newExhibitionTitle.trim()) {
      dispatch(createExhibition({
        title: newExhibitionTitle.trim(),
        description: newExhibitionDescription.trim() || undefined
      }));
      setCreateDialogOpen(false);
    }
  };

  // Handle opening the edit dialog
  const handleEditDialogOpen = (exhibitionId: string) => {
    const exhibition = userExhibitions.find((ex: UserExhibition) => ex.id === exhibitionId);
    if (exhibition) {
      setSelectedExhibition(exhibitionId);
      setEditExhibitionTitle(exhibition.title);
      setEditExhibitionDescription(exhibition.description || '');
      setEditDialogOpen(true);
    }
  };

  // Handle updating an exhibition
  const handleUpdateExhibition = () => {
    if (selectedExhibition && editExhibitionTitle.trim()) {
      dispatch(updateExhibition({
        id: selectedExhibition,
        title: editExhibitionTitle.trim(),
        description: editExhibitionDescription.trim() || ''
      }));
      setEditDialogOpen(false);
    }
  };

  // Handle opening the delete dialog
  const handleDeleteDialogOpen = (exhibitionId: string) => {
    setSelectedExhibition(exhibitionId);
    setDeleteDialogOpen(true);
  };

  // Handle deleting an exhibition
  const handleDeleteExhibition = () => {
    if (selectedExhibition) {
      dispatch(deleteExhibition(selectedExhibition));
      setDeleteDialogOpen(false);
    }
  };

  // Handle removing an artwork from an exhibition
  const handleRemoveArtworkFromExhibition = (exhibitionId: string, artworkId: string, artworkTitle = 'Artwork') => {
    console.log(`Removing artwork ${artworkId} from exhibition ${exhibitionId}`);
    
    // Debug current state before removal
    console.log('Current localStorage:', localStorage.getItem('userExhibitions'));
    console.log('Current exhibition:', userExhibitions.find(ex => ex.id === exhibitionId));
    
    // Dispatch the action to remove artwork
    dispatch(removeArtworkFromExhibition({ exhibitionId, artworkId }));
    
    // Show notification
    setSnackbarMessage(`"${artworkTitle}" removed from exhibition`);
    setSnackbarOpen(true);
    
    // Force a re-render to update the UI and check if localStorage was updated
    setTimeout(() => {
      // Get updated exhibitions from Redux store to check if change was applied
      const updatedExhibitions = store.getState().exhibitions.userExhibitions;
      const updatedExhibition = updatedExhibitions.find((ex: UserExhibition) => ex.id === exhibitionId);
      
      console.log('Updated exhibition:', updatedExhibition);
      console.log('LocalStorage after update:', localStorage.getItem('userExhibitions'));
      
      // Manually ensure localStorage is updated (backup approach)
      try {
        localStorage.setItem('userExhibitions', JSON.stringify(updatedExhibitions));
        console.log('Manually updated localStorage');
      } catch (error) {
        console.error('Error manually updating localStorage:', error);
      }
    }, 100);
  };

  // Handle opening the view dialog
  const handleViewExhibition = (exhibitionId: string) => {
    console.log("View exhibition clicked:", exhibitionId);
    setSelectedExhibition(exhibitionId);
    setTimeout(() => {
      setViewDialogOpen(true);
    }, 0);
  };

  // Helper to format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Use effect to log state changes for debugging
  useEffect(() => {
    console.log("viewDialogOpen changed:", viewDialogOpen);
    console.log("selectedExhibition changed:", selectedExhibition);
  }, [viewDialogOpen, selectedExhibition]);

  // Component to render exhibition card
  const ExhibitionCard = ({ exhibition }: { exhibition: UserExhibition }) => {
    // Get first artwork in exhibition to display as cover (if any)
    const firstArtworkId = exhibition.artworkIds[0] || '';
    // Fix: Always call the hook, but conditionally use its result
    const artwork = useAppSelector(state => 
      firstArtworkId ? selectArtworkById(firstArtworkId)(state) : null
    );
    // Then conditionally use the result
    const firstArtwork = firstArtworkId ? artwork : null;
    
    return (
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex', 
          flexDirection: 'column',
          transition: '0.3s',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: 6
          },
          cursor: 'pointer' // Make it clear this is clickable
        }}
        onClick={(e) => {
          // Only trigger the view dialog if not clicking on an action button
          if (!(e.target as Element).closest('.MuiCardActions-root')) {
            console.log("Card clicked for exhibition:", exhibition.id);
            handleViewExhibition(exhibition.id);
          }
        }}
      >
        {firstArtwork && (
          <Box sx={{ height: 200, overflow: 'hidden' }}>
            <CachedImage
              src={firstArtwork.imageUrl}
              alt={firstArtwork.title}
              height={200}
              width="100%"
              effect="blur"
            />
          </Box>
        )}
        {!firstArtwork && (
          <Box 
            sx={{ 
              height: 200, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'grey.100'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No artworks added yet
            </Typography>
          </Box>
        )}
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="h2">
            {exhibition.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Created: {formatDate(exhibition.createdAt)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {exhibition.artworkIds.length} artwork{exhibition.artworkIds.length !== 1 ? 's' : ''}
          </Typography>
          {exhibition.description && (
            <Typography variant="body2" paragraph>
              {exhibition.description}
            </Typography>
          )}
        </CardContent>
        <CardActions className="MuiCardActions-root">
          <Tooltip title="View exhibition">
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                console.log("View button clicked for exhibition:", exhibition.id);
                handleViewExhibition(exhibition.id);
              }}
              aria-label="View exhibition"
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit exhibition">
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                handleEditDialogOpen(exhibition.id);
              }}
              aria-label="Edit exhibition"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete exhibition">
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                handleDeleteDialogOpen(exhibition.id);
              }}
              aria-label="Delete exhibition"
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    );
  };

  // Component for the exhibition view dialog
  const ExhibitionViewDialog = () => {
    console.log("Rendering ExhibitionViewDialog, selectedExhibition:", selectedExhibition);
    console.log("viewDialogOpen:", viewDialogOpen);
    console.log("userExhibitions:", userExhibitions);
    
    // Get the selected exhibition directly using the selector
    const exhibition = useAppSelector(state => 
      selectedExhibition ? selectExhibitionById(selectedExhibition)(state) : undefined
    );
    
    console.log("Found exhibition from selector:", exhibition);

    // Wrap artworkIds in its own useMemo
    const artworkIds = React.useMemo(() => {
      return exhibition?.artworkIds || [];
    }, [exhibition]);
    
    console.log("Artwork IDs:", artworkIds);
    
    // Get artworks for the exhibition - use useMemo to prevent unnecessary recalculations
    const artworks = React.useMemo(() => {
      return artworkIds.map(id => {
        // We need to get the current state here
        const state = store.getState();
        return selectArtworkById(id)(state);
      });
    }, [artworkIds]); // Only recalculate when artworkIds changes
    
    console.log("Fetched artworks:", artworks);
    
    // Guard against missing exhibition - only return after all hooks are called
    if (!exhibition) {
      console.error("Exhibition not found for ID:", selectedExhibition);
      return (
        <Dialog 
          open={viewDialogOpen} 
          onClose={() => setViewDialogOpen(false)}
        >
          <DialogTitle>Error</DialogTitle>
          <DialogContent>
            <Typography>Exhibition not found.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      );
    }
    
    // Filter out any null values
    const artworksInExhibition = artworks.filter(Boolean) as Artwork[];
    console.log("Filtered artworks:", artworksInExhibition);
    
    // Handle clicking on an artwork
    const handleArtworkClick = (artworkId: string) => {
      setViewDialogOpen(false);
      // Make sure we're using the correct route path
      navigate(`/artworks/${artworkId}`);
    };

    // Handle removing artwork from this exhibition
    const handleRemoveArtwork = (artworkId: string) => {
      if (exhibition && exhibition.id) {
        // Find the artwork to get its title
        const artwork = artworksInExhibition.find(art => art.id === artworkId);
        const artworkTitle = artwork ? artwork.title : 'Artwork';
        
        handleRemoveArtworkFromExhibition(exhibition.id, artworkId, artworkTitle);
      }
    };
    
    return (
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)} 
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {exhibition.title}
          <IconButton
            aria-label="close"
            onClick={() => setViewDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {exhibition.description && (
            <Typography variant="body1" paragraph>
              {exhibition.description}
            </Typography>
          )}
          
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Created: {formatDate(exhibition.createdAt)}
              {exhibition.updatedAt > exhibition.createdAt && 
                ` • Updated: ${formatDate(exhibition.updatedAt)}`}
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Artworks ({artworksInExhibition.length})
          </Typography>
          
          {artworksInExhibition.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              This exhibition doesn't have any artworks yet. Add artworks from the Artworks page.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {artworksInExhibition.map((artwork: Artwork) => (
                <Grid item xs={12} sm={6} md={4} key={artwork.id}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer',
                      transition: '0.3s',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <Box 
                      onClick={() => handleArtworkClick(artwork.id)}
                      sx={{ height: 150, overflow: 'hidden', mb: 1 }}
                    >
                      <CachedImage
                        src={artwork.thumbnailUrl || artwork.imageUrl}
                        alt={artwork.title}
                        height={150}
                        width="100%"
                        effect="blur"
                      />
                    </Box>
                    <Box 
                      onClick={() => handleArtworkClick(artwork.id)}
                      sx={{ mb: 3 }}
                    >
                      <Typography variant="subtitle2" noWrap>{artwork.title}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>{artwork.artist}</Typography>
                    </Box>
                    <Tooltip title="Remove from exhibition">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveArtwork(artwork.id)}
                        sx={{
                          position: 'absolute',
                          right: 8,
                          bottom: 8,
                        }}
                        aria-label="remove from exhibition"
                      >
                        <RemoveCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Home
          </Link>
          <Typography color="text.primary">Exhibitions</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            My Exhibitions
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleCreateDialogOpen}
          >
            Create Exhibition
          </Button>
        </Box>
        
        {userExhibitions.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            You haven't created any exhibitions yet. Click the button above to create your first exhibition.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {userExhibitions.map((exhibition: UserExhibition) => (
              <Grid item xs={12} sm={6} md={4} key={exhibition.id}>
                <ExhibitionCard exhibition={exhibition} />
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Create Exhibition Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
          <DialogTitle>Create New Exhibition</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Create a collection of your favorite artworks.
            </DialogContentText>
            <TextField
              autoFocus
              required
              margin="dense"
              id="title"
              label="Exhibition Title"
              type="text"
              fullWidth
              variant="outlined"
              value={newExhibitionTitle}
              onChange={(e) => setNewExhibitionTitle(e.target.value)}
            />
            <TextField
              margin="dense"
              id="description"
              label="Description (Optional)"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={newExhibitionDescription}
              onChange={(e) => setNewExhibitionDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateExhibition}
              disabled={!newExhibitionTitle.trim()}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Edit Exhibition Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <DialogTitle>Edit Exhibition</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              required
              margin="dense"
              id="edit-title"
              label="Exhibition Title"
              type="text"
              fullWidth
              variant="outlined"
              value={editExhibitionTitle}
              onChange={(e) => setEditExhibitionTitle(e.target.value)}
            />
            <TextField
              margin="dense"
              id="edit-description"
              label="Description (Optional)"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={editExhibitionDescription}
              onChange={(e) => setEditExhibitionDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateExhibition}
              disabled={!editExhibitionTitle.trim()}
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Exhibition Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Exhibition</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this exhibition? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteExhibition} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Exhibition Dialog Component - defined outside this return but rendered here */}
        {selectedExhibition && viewDialogOpen && (
          <ExhibitionViewDialog />
        )}
        
        {/* Notification Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Box>
    </Container>
  );
};

export default ExhibitionsPage; 