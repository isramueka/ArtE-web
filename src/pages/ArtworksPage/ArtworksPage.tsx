import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useLoaderData } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Box,
  Breadcrumbs,
  Link,
  Chip,
  TextField,
  Button,
  Pagination,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Paper,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { 
  fetchArtworks, 
  selectAllArtworks, 
  selectArtworkStatus, 
  selectArtworkError,
  selectPagination,
  selectFilters,
  selectPaginatedArtworks,
  selectShouldFetchForCurrentPage,
  setFilter,
  setPage
} from '../../store/artworkSlice';
import { AppDispatch } from '../../store';
import { Artwork } from '../../types/Artwork';
import CachedImage from '../../components/CachedImage';

const ArtworksPage: React.FC = () => {
  // Get any potential error from the loader
  const loaderData = useLoaderData() as { success: boolean; error?: string } | undefined;
  
  const dispatch = useDispatch<AppDispatch>();
  const artworks = useSelector(selectPaginatedArtworks);
  const status = useSelector(selectArtworkStatus);
  const error = useSelector(selectArtworkError);
  const { currentPage, pageSize, totalPages } = useSelector(selectPagination);
  const filters = useSelector(selectFilters);
  const shouldFetch = useSelector(selectShouldFetchForCurrentPage);
  
  const [searchQuery, setSearchQuery] = useState(filters.query);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    // Fetch artworks when component mounts or when we need more data
    if (shouldFetch) {
      dispatch(fetchArtworks({
        query: filters.query,
        page: currentPage,
        source: filters.source
      })).then(() => {
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      });
    } else {
      setIsInitialLoad(false);
    }
  }, [dispatch, filters.query, currentPage, filters.source, shouldFetch, isInitialLoad]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilter({ query: searchQuery }));
  };
  
  const handleSourceChange = (e: SelectChangeEvent) => {
    dispatch(setFilter({ 
      source: e.target.value as 'all' | 'rijksmuseum' | 'harvardartmuseums' 
    }));
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPage(value));
  };

  // Show an error message if the loader reported an error
  if (loaderData && !loaderData.success) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {loaderData.error || 'Failed to load artworks. Please try again later.'}
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Home
          </Link>
          <Typography color="text.primary">Artworks</Typography>
        </Breadcrumbs>

        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ mb: 3 }}
        >
          Explore Artworks
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          paragraph
          sx={{ mb: 4, maxWidth: 800 }}
        >
          Discover masterpieces from various periods, styles, and artists. Each artwork 
          represents a unique expression and perspective in the rich tapestry of art history.
        </Typography>
        
        {/* Search and Filter Section */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <form onSubmit={handleSearch}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search for artworks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button 
                          variant="contained" 
                          color="primary" 
                          type="submit"
                          disabled={status === 'loading'}
                        >
                          Search
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </form>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="source-select-label">Source</InputLabel>
                <Select
                  labelId="source-select-label"
                  value={filters.source}
                  label="Source"
                  onChange={handleSourceChange}
                >
                  <MenuItem value="all">All Sources</MenuItem>
                  <MenuItem value="rijksmuseum">Rijksmuseum</MenuItem>
                  <MenuItem value="harvardartmuseums">Harvard Art Museums</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Loading and Error States */}
        {(status === 'loading' && isInitialLoad) && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}
        
        {status === 'failed' && (
          <Alert severity="error" sx={{ mb: 4 }}>
            Error loading artworks: {error}
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ ml: 2 }}
              onClick={() => dispatch(fetchArtworks({
                query: filters.query,
                page: currentPage,
                source: filters.source,
                forceRefresh: true
              }))}
            >
              Retry
            </Button>
          </Alert>
        )}
        
        {/* Artworks Grid */}
        {status !== 'loading' && artworks.length === 0 && (
          <Alert severity="info" sx={{ mb: 4 }}>
            No artworks found matching your search criteria. Try different keywords or filters.
          </Alert>
        )}
        
        {artworks.length > 0 && (
          <>
            <Grid container spacing={4}>
              {artworks.map((artwork: Artwork) => (
                <Grid item key={artwork.id} xs={12} sm={6} md={4} lg={3}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: '0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6
                      }
                    }}
                    component={RouterLink}
                    to={`/artworks/${artwork.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <Box sx={{ height: 200, overflow: 'hidden' }}>
                      <CachedImage
                        src={artwork.thumbnailUrl || artwork.imageUrl}
                        alt={artwork.title}
                        height={200}
                        width="100%"
                        effect="blur"
                        style={{ objectFit: 'cover' }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h2" noWrap>
                        {artwork.title || 'Untitled'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {artwork.artist || 'Unknown artist'}
                        {artwork.year && `, ${artwork.year}`}
                      </Typography>
                      <Chip 
                        label={artwork.source === 'rijksmuseum' ? 'Rijksmuseum' : 'Harvard Art'}
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" my={4}>
                <Pagination 
                  count={totalPages} 
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                  disabled={status === 'loading'}
                />
              </Box>
            )}
          </>
        )}
        
        {/* Loading indicator for background loading (not initial load) */}
        {(status === 'loading' && !isInitialLoad) && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress size={30} />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ArtworksPage; 