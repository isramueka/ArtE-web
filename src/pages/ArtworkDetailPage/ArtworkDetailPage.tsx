import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate, useLoaderData } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Paper, 
  Divider, 
  Chip,
  Breadcrumbs,
  Link,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import { store } from '../../store';
import { 
  selectArtworkById,
  selectHasArtworkDetail,
  fetchArtworkDetail 
} from '../../store/artworkSlice';
import {
  UserExhibition,
  selectAllExhibitions,
  selectArtworkExhibitions,
  addArtworkToExhibition,
  createExhibition
} from '../../store/exhibitionsSlice';
import CachedImage from '../../components/CachedImage';
import SocialShare from '../../components/SocialShare';
import { getArtworkShareUrl } from '../../utils/socialShareUtils';

const ArtworkDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get any potential error from the loader
  const loaderData = useLoaderData() as { success: boolean; error?: string } | undefined;
  
  // Local state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exhibitionMenuAnchor, setExhibitionMenuAnchor] = useState<null | HTMLElement>(null);
  const [createExhibitionDialogOpen, setCreateExhibitionDialogOpen] = useState(false);
  const [newExhibitionTitle, setNewExhibitionTitle] = useState('');
  const [newExhibitionDescription, setNewExhibitionDescription] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Get artwork directly from Redux store using our enhanced selector
  const artwork = useSelector(id ? selectArtworkById(id) : () => null);
  
  // Check if we already have detailed information for this artwork
  const hasDetailedInfo = useSelector(id ? selectHasArtworkDetail(id || '') : () => false);
  
  // Get all the user's exhibitions
  const userExhibitions = useSelector(selectAllExhibitions);
  
  // Get exhibitions that already contain this artwork
  const artworkExhibitions = useSelector(id ? selectArtworkExhibitions(id) : () => []);
  
  useEffect(() => {
    // If the loader reports an error or there's no ID, set the error state
    if (loaderData && !loaderData.success) {
      setError(loaderData.error || 'Error loading artwork details');
    } else if (!id) {
      setError('No artwork ID provided');
    }
    
    // In case the loader didn't complete the loading (rare case), we may need to retry
    const retryLoadIfNeeded = async () => {
      if (id && !hasDetailedInfo && !loaderData?.error) {
        try {
          setLoading(true);
          await dispatch(fetchArtworkDetail(id) as any);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error fetching artwork details');
        } finally {
          setLoading(false);
        }
      }
    };
    
    retryLoadIfNeeded();
  }, [id, dispatch, hasDetailedInfo, loaderData]);

  // Handle exhibition menu
  const handleExhibitionMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExhibitionMenuAnchor(event.currentTarget);
  };

  const handleExhibitionMenuClose = () => {
    setExhibitionMenuAnchor(null);
  };

  // Handle adding to exhibition
  const handleAddToExhibition = (exhibitionId: string) => {
    if (id) {
      dispatch(addArtworkToExhibition({ exhibitionId, artworkId: id }));
      setSnackbarMessage('Artwork added to exhibition');
      setSnackbarOpen(true);
      handleExhibitionMenuClose();
    }
  };

  // Handle creating new exhibition
  const handleCreateNewExhibition = () => {
    setNewExhibitionTitle('');
    setNewExhibitionDescription('');
    setCreateExhibitionDialogOpen(true);
    handleExhibitionMenuClose();
  };

  const handleCreateExhibitionSubmit = () => {
    if (newExhibitionTitle.trim() && id) {
      // First create the exhibition
      dispatch(createExhibition({
        title: newExhibitionTitle.trim(),
        description: newExhibitionDescription.trim() || undefined
      }));
      
      // After creation, just dispatch add artwork directly
      // We'll add it to the most recently created exhibition
      setTimeout(() => {
        // Get all exhibitions again after creation
        const latestExhibitions = selectAllExhibitions(store.getState());
        const newExhibition = latestExhibitions[latestExhibitions.length - 1];
        
        if (newExhibition && id) {
          dispatch(addArtworkToExhibition({ 
            exhibitionId: newExhibition.id, 
            artworkId: id 
          }));
          setSnackbarMessage(`Artwork added to new exhibition: ${newExhibitionTitle}`);
          setSnackbarOpen(true);
        }
      }, 100); // Small delay to ensure state is updated
      
      setCreateExhibitionDialogOpen(false);
    }
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  // Handle retrying to fetch details if there was an error
  const handleRetry = () => {
    if (id) {
      setLoading(true);
      setError(null);
      
      dispatch(fetchArtworkDetail(id) as any)
        .then(() => {
          setLoading(false);
        })
        .catch((err: any) => {
          setError(err instanceof Error ? err.message : 'Error fetching artwork details');
          setLoading(false);
        });
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error || !artwork) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
            <Link component={RouterLink} to="/" color="inherit">
              Home
            </Link>
            <Link component={RouterLink} to="/artworks" color="inherit">
              Artworks
            </Link>
            <Typography color="text.primary">Not Found</Typography>
          </Breadcrumbs>
          
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              error && id ? (
                <Button color="inherit" size="small" onClick={handleRetry}>
                  Retry
                </Button>
              ) : (
                <Button color="inherit" size="small" onClick={() => navigate('/artworks')}>
                  Back to Artworks
                </Button>
              )
            }
          >
            {error || 'Artwork not found'}
          </Alert>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBackIcon />}
            component={RouterLink}
            to="/artworks"
          >
            Back to Artworks
          </Button>
        </Box>
      </Container>
    );
  }
  
  // Get any exhibitions that already include this artwork
  const includedInExhibitions = artworkExhibitions || [];
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Home
          </Link>
          <Link component={RouterLink} to="/artworks" color="inherit">
            Artworks
          </Link>
          <Typography color="text.primary">{artwork.title || 'Untitled'}</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            component={RouterLink} 
            to="/artworks"
          >
            Back to Artworks
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <SocialShare 
              url={getArtworkShareUrl(id || '')}
              title={`Check out "${artwork.title}" on Art Collections`}
            />
            
            <Button
              variant="outlined"
              startIcon={<BookmarkAddIcon />}
              onClick={handleExhibitionMenuOpen}
            >
              Add to Exhibition
            </Button>
          </Box>
          
          <Menu
            anchorEl={exhibitionMenuAnchor}
            open={Boolean(exhibitionMenuAnchor)}
            onClose={handleExhibitionMenuClose}
          >
            {userExhibitions.length > 0 ? [
              // Render exhibition menu items
              ...userExhibitions.map((exhibition: UserExhibition) => {
                const isAlreadyAdded = exhibition.artworkIds.includes(id || '');
                return (
                  <MenuItem 
                    key={exhibition.id} 
                    onClick={() => handleAddToExhibition(exhibition.id)}
                    disabled={isAlreadyAdded}
                    sx={isAlreadyAdded ? { color: 'text.disabled' } : {}}
                  >
                    {exhibition.title} {isAlreadyAdded && '(Already added)'}
                  </MenuItem>
                );
              }),
              // Add divider after exhibitions
              <Divider key="divider" />
            ] : null}
            <MenuItem onClick={handleCreateNewExhibition}>
              <AddIcon fontSize="small" sx={{ mr: 1 }} />
              Create New Exhibition
            </MenuItem>
          </Menu>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={2} 
              sx={{ 
                overflow: 'hidden', 
                height: '100%', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CachedImage 
                src={artwork.imageUrl} 
                alt={artwork.title || 'Artwork image'}
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                }}
                effect="blur"
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {artwork.title || 'Untitled'}
              </Typography>
              <Chip 
                label={artwork.source === 'rijksmuseum' ? 'Rijksmuseum' : 'Harvard Art'} 
                color="primary" 
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
            
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {artwork.artist || 'Unknown artist'}
              {artwork.year && `, ${artwork.year}`}
            </Typography>
            
            {artwork.description && (
              <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                {artwork.description}
              </Typography>
            )}
            
            {/* Display which exhibitions include this artwork */}
            {includedInExhibitions.length > 0 && (
              <>
                <Box sx={{ mt: 2, mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    In Your Exhibitions:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {includedInExhibitions.map((exhibition) => (
                      <Chip 
                        key={exhibition.id}
                        label={exhibition.title}
                        size="small"
                        color="secondary"
                        onClick={() => navigate(`/exhibitions/${exhibition.id}`)}
                      />
                    ))}
                  </Box>
                </Box>
                <Divider sx={{ my: 3 }} />
              </>
            )}
            
            <Grid container spacing={2}>
              {artwork.medium && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Medium
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {artwork.medium}
                  </Typography>
                </Grid>
              )}
              
              {artwork.dimensions && (
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Dimensions
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {artwork.dimensions}
                  </Typography>
                </Grid>
              )}
              
              {artwork.creditLine && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Credit
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {artwork.creditLine}
                  </Typography>
                </Grid>
              )}
              
              {artwork.url && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Source URL
                  </Typography>
                  <Link href={artwork.url} target="_blank" rel="noopener noreferrer">
                    View on {artwork.source === 'rijksmuseum' ? 'Rijksmuseum' : 'Harvard Art Museums'} Website
                  </Link>
                </Grid>
              )}
            </Grid>
            
            {artwork.techniques && artwork.techniques.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Techniques
                </Typography>
                <List dense>
                  {artwork.techniques.map((technique, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={technique} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
            
            {artwork.materials && artwork.materials.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Materials
                </Typography>
                <List dense>
                  {artwork.materials.map((material, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={material} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
            
            {artwork.colors && artwork.colors.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Colors
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {artwork.colors.map((color, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: color.hex,
                        borderRadius: '8px',
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                      }}
                      title={color.name}
                    />
                  ))}
                </Box>
              </>
            )}
            
            {artwork.exhibitions && artwork.exhibitions.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Exhibition History
                </Typography>
                <List dense>
                  {artwork.exhibitions.map((exhibition, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={exhibition} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
            
            {artwork.url && (
              <Box sx={{ mt: 3 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  href={artwork.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on {artwork.source === 'rijksmuseum' ? 'Rijksmuseum' : 'Harvard Art Museums'} Website
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
      
      {/* Dialog for creating a new exhibition */}
      <Dialog open={createExhibitionDialogOpen} onClose={() => setCreateExhibitionDialogOpen(false)}>
        <DialogTitle>Create New Exhibition</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Exhibition Title"
            type="text"
            fullWidth
            value={newExhibitionTitle}
            onChange={(e) => setNewExhibitionTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={newExhibitionDescription}
            onChange={(e) => setNewExhibitionDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateExhibitionDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateExhibitionSubmit}
            color="primary"
            variant="contained"
            disabled={!newExhibitionTitle.trim()}
          >
            Create & Add Artwork
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default ArtworkDetailPage; 