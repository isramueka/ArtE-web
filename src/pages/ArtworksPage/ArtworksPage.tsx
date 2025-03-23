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
  InputAdornment,
  Collapse,
  IconButton,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import CloseIcon from '@mui/icons-material/Close';
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
  setPage,
  resetFilters
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
  const [artist, setArtist] = useState(filters.artist);
  const [dateFrom, setDateFrom] = useState(filters.dateFrom);
  const [dateTo, setDateTo] = useState(filters.dateTo);
  const [medium, setMedium] = useState(filters.medium);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    // Fetch artworks when component mounts or when we need more data
    if (shouldFetch) {
      dispatch(fetchArtworks({
        query: filters.query,
        artist: filters.artist,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        medium: filters.medium,
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
  }, [dispatch, filters, currentPage, shouldFetch, isInitialLoad]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilter({ 
      query: searchQuery,
      artist,
      dateFrom,
      dateTo,
      medium
    }));
  };
  
  const handleSourceChange = (e: SelectChangeEvent) => {
    dispatch(setFilter({ 
      source: e.target.value as 'all' | 'rijksmuseum' | 'harvardartmuseums' 
    }));
  };
  
  const handleClearFilters = () => {
    setSearchQuery('');
    setArtist('');
    setDateFrom('');
    setDateTo('');
    setMedium('');
    dispatch(resetFilters());
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPage(value));
  };
  
  // Create an array of active filters to display as chips
  const activeFilters = [
    ...(filters.query ? [{ label: `Keyword: ${filters.query}`, value: 'query' }] : []),
    ...(filters.artist ? [{ label: `Artist: ${filters.artist}`, value: 'artist' }] : []),
    ...(filters.dateFrom ? [{ label: `From: ${filters.dateFrom}`, value: 'dateFrom' }] : []),
    ...(filters.dateTo ? [{ label: `To: ${filters.dateTo}`, value: 'dateTo' }] : []),
    ...(filters.medium ? [{ label: `Medium: ${filters.medium}`, value: 'medium' }] : []),
    ...(filters.source !== 'all' ? [{ label: `Source: ${filters.source === 'rijksmuseum' ? 'Rijksmuseum' : 'Harvard Art Museums'}`, value: 'source' }] : [])
  ];

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
          <form onSubmit={handleSearch}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
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
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" gap={2}>
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
                  <Button
                    color="primary"
                    startIcon={<FilterListIcon />}
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    variant={showAdvancedFilters ? "contained" : "outlined"}
                  >
                    Filters
                  </Button>
                </Box>
              </Grid>
              
              {/* Advanced Filters */}
              <Grid item xs={12}>
                <Collapse in={showAdvancedFilters}>
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Artist"
                          variant="outlined"
                          placeholder="e.g. Van Gogh, Rembrandt"
                          value={artist}
                          onChange={(e) => setArtist(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Medium"
                          variant="outlined"
                          placeholder="e.g. oil, canvas, wood"
                          value={medium}
                          onChange={(e) => setMedium(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Date From"
                          variant="outlined"
                          placeholder="e.g. 1600"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          type="number"
                          inputProps={{ min: "0", max: new Date().getFullYear() }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Date To"
                          variant="outlined"
                          placeholder="e.g. 1700"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          type="number"
                          inputProps={{ min: "0", max: new Date().getFullYear() }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </Grid>
              
              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Button 
                    variant="contained" 
                    color="primary" 
                    type="submit"
                    disabled={status === 'loading'}
                    sx={{ mt: 2 }}
                  >
                    Search
                  </Button>
                  
                  {activeFilters.length > 0 && (
                    <Button
                      startIcon={<ClearAllIcon />}
                      onClick={handleClearFilters}
                      sx={{ mt: 2 }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </Box>
              </Grid>
              
              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {activeFilters.map((filter) => (
                      <Chip
                        key={filter.value}
                        label={filter.label}
                        onDelete={() => {
                          if (filter.value === 'query') setSearchQuery('');
                          if (filter.value === 'artist') setArtist('');
                          if (filter.value === 'dateFrom') setDateFrom('');
                          if (filter.value === 'dateTo') setDateTo('');
                          if (filter.value === 'medium') setMedium('');
                          
                          dispatch(setFilter({ [filter.value]: filter.value === 'source' ? 'all' : '' }));
                        }}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </form>
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
                artist: filters.artist,
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo,
                medium: filters.medium,
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
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {artwork.artist || 'Unknown artist'}
                      </Typography>
                      {artwork.year && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {artwork.year}
                        </Typography>
                      )}
                      {artwork.medium && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} noWrap>
                          {artwork.medium}
                        </Typography>
                      )}
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