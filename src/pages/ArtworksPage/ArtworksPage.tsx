import React, { useEffect, useState, useMemo } from 'react';
import { Link as RouterLink, useLoaderData } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
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
  Collapse
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { 
  fetchArtworks, 
  selectAllArtworks,
  selectArtworkStatus, 
  selectArtworkError,
  selectPagination,
  selectFilters,
  selectShouldFetchForCurrentPage,
  setFilter,
  resetFilters
} from '../../store/artworkSlice';
import { AppDispatch } from '../../store';
import { Artwork } from '../../types/Artwork';
import CachedImage from '../../components/CachedImage';

// Note: Previous linting errors about placeholderImage, formatSourceLabel, and getSourceColor 
// were false positives, as these variables don't exist in the current version of the code.

const ArtworksPage: React.FC = () => {
  // Get any potential error from the loader
  const loaderData = useLoaderData() as { success: boolean; error?: string } | undefined;
  
  const dispatch = useDispatch<AppDispatch>();
  const allArtworks = useSelector(selectAllArtworks);
  const status = useSelector(selectArtworkStatus);
  const error = useSelector(selectArtworkError);
  const { currentPage, pageSize } = useSelector(selectPagination);
  const filters = useSelector(selectFilters);
  const shouldFetch = useSelector(selectShouldFetchForCurrentPage);
  
  const [searchQuery, setSearchQuery] = useState(filters.query);
  const [artist, setArtist] = useState(filters.artist);
  const [dateFrom, setDateFrom] = useState(filters.dateFrom);
  const [dateTo, setDateTo] = useState(filters.dateTo);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [localCurrentPage, setLocalCurrentPage] = useState(currentPage);
  
  // Client-side filtering logic
  const filteredArtworks = useMemo(() => {
    console.log('Running client-side filtering with filters:', filters);
    console.log('Total artworks to filter:', allArtworks?.length || 0);
    
    let filtered = allArtworks ? [...allArtworks] : [];
    
    // Filter by source
    if (filters.source !== 'all') {
      filtered = filtered.filter(item => item.source === filters.source);
      console.log(`After source filter (${filters.source}):`, filtered.length);
    }
    
    // Filter by keyword query
    if (filters.query) {
      const lowerQuery = filters.query.toLowerCase();
      filtered = filtered.filter(item => 
        (item.title?.toLowerCase() || '').includes(lowerQuery) || 
        (item.artist?.toLowerCase() || '').includes(lowerQuery) ||
        (item.description?.toLowerCase() || '').includes(lowerQuery)
      );
      console.log(`After query filter (${filters.query}):`, filtered.length);
    }
    
    // Filter by artist
    if (filters.artist) {
      const lowerArtist = filters.artist.toLowerCase();
      filtered = filtered.filter(item => 
        (item.artist?.toLowerCase() || '').includes(lowerArtist)
      );
      console.log(`After artist filter (${filters.artist}):`, filtered.length);
    }
    
    // Filter by date range - more robust logic
    if (filters.dateFrom || filters.dateTo) {
      // More lenient parsing for dates
      const fromYear = filters.dateFrom ? parseInt(filters.dateFrom, 10) : -Infinity;
      const toYear = filters.dateTo ? parseInt(filters.dateTo, 10) : Infinity;
      
      // Add a small buffer to make the date range more inclusive
      const adjustedFromYear = fromYear - 5;
      const adjustedToYear = toYear + 5;
      
      filtered = filtered.filter(item => {
        // First check if explicitly provided year is within range
        if (item.year && item.year >= adjustedFromYear && item.year <= adjustedToYear) {
          return true;
        }
        
        // If no year directly available, try extraction from various fields
        // We already have fallback handling in the transformer, but we can add more here
        
        // If art is from the right era but exact year is unknown, try to include it
        const title = item.title?.toLowerCase() || '';
        const desc = item.description?.toLowerCase() || '';
        const artist = item.artist?.toLowerCase() || '';
        
        // Check for period indicators that might match our date range
        if (fromYear >= 1400 && toYear <= 1500) {
          // Check for 15th century indicators
          if (title.includes('15th century') || desc.includes('15th century') || 
              title.includes('1400s') || desc.includes('1400s') ||
              title.includes('fifteenth century') || desc.includes('fifteenth century')) {
            return true;
          }
        }
        
        // Add similar checks for other common periods
        if (fromYear >= 1500 && toYear <= 1600) {
          // Check for 16th century indicators
          if (title.includes('16th century') || desc.includes('16th century') ||
              title.includes('1500s') || desc.includes('1500s') ||
              title.includes('sixteenth century') || desc.includes('sixteenth century')) {
            return true;
          }
        }
        
        // As a fallback, try to extract years from text
        const combinedText = `${title} ${desc} ${artist}`;
        const yearMatches = combinedText.match(/\b(1[0-9]{3}|20[0-9]{2})\b/g);
        
        if (yearMatches) {
          // Check if any extracted year is within range
          for (const match of yearMatches) {
            const extractedYear = parseInt(match, 10);
            if (extractedYear >= adjustedFromYear && extractedYear <= adjustedToYear) {
              return true;
            }
          }
        }
        
        return false;
      });
      console.log(`After date range filter (${filters.dateFrom}-${filters.dateTo}):`, filtered.length);
    }
    
    // Log filtered results for debugging
    if (filtered.length <= 10) {
      console.log('Filtered artworks:', filtered.map(a => ({
        id: a.id,
        title: a.title,
        medium: a.medium,
        year: a.year
      })));
    }
    
    return filtered;
  }, [allArtworks, filters]);
  
  // Pagination calculation
  const calculatedTotalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredArtworks.length / pageSize));
  }, [filteredArtworks, pageSize]);
  
  // Paginate the filtered results
  const paginatedArtworks = useMemo(() => {
    const startIndex = (localCurrentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredArtworks.slice(startIndex, endIndex);
  }, [filteredArtworks, localCurrentPage, pageSize]);
  
  // Update the page change handler to use local state
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setLocalCurrentPage(value);
  };
  
  useEffect(() => {
    // Fetch artworks when component mounts or when we need more data
    if (shouldFetch) {
      dispatch(fetchArtworks({
        query: filters.query,
        artist: filters.artist,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
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
      dateTo
    }));
    // Reset to page 1 when filters change
    setLocalCurrentPage(1);
  };
  
  const handleSourceChange = (e: SelectChangeEvent) => {
    dispatch(setFilter({ 
      source: e.target.value as 'all' | 'rijksmuseum' | 'harvardartmuseums' 
    }));
    // Reset to page 1 when filters change
    setLocalCurrentPage(1);
  };
  
  const handleClearFilters = () => {
    setSearchQuery('');
    setArtist('');
    setDateFrom('');
    setDateTo('');
    dispatch(resetFilters());
    // Reset to page 1 when filters change
    setLocalCurrentPage(1);
  };
  
  // Create an array of active filters to display as chips
  const activeFilters = [
    ...(filters.query ? [{ label: `Keyword: ${filters.query}`, value: 'query' }] : []),
    ...(filters.artist ? [{ label: `Artist: ${filters.artist}`, value: 'artist' }] : []),
    ...(filters.dateFrom ? [{ label: `From: ${filters.dateFrom}`, value: 'dateFrom' }] : []),
    ...(filters.dateTo ? [{ label: `To: ${filters.dateTo}`, value: 'dateTo' }] : []),
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
        {status !== 'loading' && paginatedArtworks.length === 0 && (
          <Alert severity="info" sx={{ mb: 4 }}>
            No artworks found matching your search criteria. Try different keywords or filters.
          </Alert>
        )}
        
        {paginatedArtworks.length > 0 && (
          <>
            <Grid container spacing={4}>
              {paginatedArtworks.map((artwork: Artwork) => (
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
                        <Typography 
                          variant="body2" 
                          color="text.primary" 
                          sx={{ 
                            mb: 1, 
                            fontStyle: 'italic',
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2
                          }}
                        >
                          {artwork.medium}
                        </Typography>
                      )}
                      {!artwork.medium && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic' }}>
                          Medium unknown
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
            {calculatedTotalPages > 1 && (
              <Box display="flex" justifyContent="center" my={4}>
                <Pagination 
                  count={calculatedTotalPages} 
                  page={localCurrentPage}
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