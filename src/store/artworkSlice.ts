import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';
import { Artwork, ArtworkDetail } from '../types/Artwork';
import * as rijksMuseumService from '../api/rijksMuseumService';
import * as harvardArtService from '../api/harvardArtService';

// Constants for pagination
const DISPLAY_PAGE_SIZE = 20; // Number of items to show per page in the UI
const FETCH_BATCH_SIZE = 100; // Number of items to fetch in each API call

// Define a cache interface to track what we've already fetched
interface FetchedDataCache {
  [key: string]: {
    fetched: boolean;
    fetchedPages: number[]; // Track which fetch pages we've already loaded
  };
}

// Define the shape of our artwork state
interface ArtworkState {
  items: Artwork[];
  // Store for detailed artwork information that has been fetched
  detailedItems: { [id: string]: ArtworkDetail };
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  pagination: {
    currentPage: number; // Current display page (1-based)
    pageSize: number; // Display size - always 20 items per page
    totalItems: {
      rijksmuseum: number;
      harvardartmuseums: number;
      all: number;
    };
    totalPages: number; // Total display pages
  };
  filters: {
    query: string;
    artist: string;
    dateFrom: string;
    dateTo: string;
    medium: string;
    source: 'all' | 'rijksmuseum' | 'harvardartmuseums';
  };
  // Track which queries/pages we've already fetched
  fetchedData: FetchedDataCache;
}

// Define initial state
const initialState: ArtworkState = {
  items: [],
  detailedItems: {},
  status: 'idle',
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: DISPLAY_PAGE_SIZE, // Always display 20 items per page
    totalItems: {
      rijksmuseum: 0,
      harvardartmuseums: 0,
      all: 0,
    },
    totalPages: 0,
  },
  filters: {
    query: '',
    artist: '',
    dateFrom: '',
    dateTo: '',
    medium: '',
    source: 'all',
  },
  fetchedData: {},
};

// Helper to create a cache key for tracking fetched data
const getCacheKey = (
  query: string, 
  artist: string = '',
  dateFrom: string = '',
  dateTo: string = '',
  medium: string = '',
  source: string
) => `${query}:${artist}:${dateFrom}:${dateTo}:${medium}:${source}`;

// Helper to convert display page to fetch page
// For example, display pages 1-5 (showing 20 items each) would be fetch page 1 (fetching 100 items)
const displayPageToFetchPage = (displayPage: number): number => {
  return Math.ceil((displayPage * DISPLAY_PAGE_SIZE) / FETCH_BATCH_SIZE);
};

// Create async thunk for fetching artworks from both APIs
export const fetchArtworks = createAsyncThunk(
  'artworks/fetchArtworks',
  async (
    {
      query = '',
      artist = '',
      dateFrom = '',
      dateTo = '',
      medium = '',
      page = 1, // This is the display page
      source = 'all',
      forceRefresh = false,
    }: {
      query?: string;
      artist?: string;
      dateFrom?: string;
      dateTo?: string;
      medium?: string;
      page?: number;
      source?: 'all' | 'rijksmuseum' | 'harvardartmuseums';
      forceRefresh?: boolean;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const cacheKey = getCacheKey(query, artist, dateFrom, dateTo, medium, source);
      const fetchedData = state.artworks.fetchedData;
      
      // Calculate which fetch page we need
      const fetchPage = displayPageToFetchPage(page);
      
      // Check if we already have this data in the cache
      if (
        !forceRefresh &&
        fetchedData[cacheKey] && 
        fetchedData[cacheKey].fetched && 
        fetchedData[cacheKey].fetchedPages.includes(fetchPage)
      ) {
        // We already have this data, just update the current page
        return {
          artworks: [], // No new artworks to add
          newFetch: false,
          pagination: {
            currentPage: page, // Update to the requested display page
            pageSize: DISPLAY_PAGE_SIZE,
            totalItems: state.artworks.pagination.totalItems,
            totalPages: state.artworks.pagination.totalPages,
          },
          filters: {
            query,
            artist,
            dateFrom,
            dateTo,
            medium,
            source,
          },
        };
      }
      
      // We need to fetch data
      let artworks: Artwork[] = [];
      let rijksTotal = state.artworks.pagination.totalItems.rijksmuseum;
      let harvardTotal = state.artworks.pagination.totalItems.harvardartmuseums;
      
      // Fetch from Rijksmuseum if source is 'all' or 'rijksmuseum'
      if (source === 'all' || source === 'rijksmuseum') {
        const rijksResponse = await rijksMuseumService.fetchArtworksList({
          query,
          artist,
          dateFrom,
          dateTo,
          medium,
          page: fetchPage,
          pageSize: FETCH_BATCH_SIZE
        });
        artworks = [...artworks, ...rijksResponse];
        
        // Use the response length as an approximation for the total count
        // Multiply by some factor to estimate the total
        rijksTotal = Math.max(rijksTotal, rijksResponse.length * 10);
      }
      
      // Fetch from Harvard if source is 'all' or 'harvardartmuseums'
      if (source === 'all' || source === 'harvardartmuseums') {
        const harvardResponse = await harvardArtService.fetchArtworksList({
          query,
          artist,
          dateFrom,
          dateTo,
          medium,
          page: fetchPage,
          pageSize: FETCH_BATCH_SIZE
        });
        artworks = [...artworks, ...harvardResponse];
        
        // Use the response length as an approximation for the total count
        harvardTotal = Math.max(harvardTotal, harvardResponse.length * 10);
      }
      
      // Calculate total items
      const totalAllItems = rijksTotal + harvardTotal;
      
      // Return all data needed to update state
      return {
        artworks,
        newFetch: true,
        pagination: {
          currentPage: page, // This is the display page
          pageSize: DISPLAY_PAGE_SIZE, // Always display 20 items per page
          totalItems: {
            rijksmuseum: rijksTotal,
            harvardartmuseums: harvardTotal,
            all: totalAllItems,
          },
          totalPages: Math.ceil((source === 'all' ? totalAllItems : (source === 'rijksmuseum' ? rijksTotal : harvardTotal)) / DISPLAY_PAGE_SIZE),
        },
        filters: {
          query,
          artist,
          dateFrom,
          dateTo,
          medium,
          source,
        },
        cacheKey,
        fetchPage, // Store the fetch page, not the display page
      };
    } catch (error) {
      // Handle error appropriately
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Create a specific thunk for loading a single artwork detail
export const fetchArtworkDetail = createAsyncThunk(
  'artworks/fetchArtworkDetail',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      
      // Check if we already have the details cached in our store
      if (state.artworks.detailedItems[id]) {
        // Return the cached details to avoid an unnecessary API call
        return { 
          artwork: state.artworks.detailedItems[id],
          fromCache: true 
        };
      }
      
      let artworkDetail: ArtworkDetail | null = null;
      
      // Check if it's a Rijksmuseum or Harvard ID based on prefix
      if (id.startsWith('rijks-')) {
        const actualId = id.replace('rijks-', '');
        artworkDetail = await rijksMuseumService.fetchArtworkDetail(actualId);
      } else if (id.startsWith('harvard-')) {
        const actualId = id.replace('harvard-', '');
        artworkDetail = await harvardArtService.fetchArtworkDetail(actualId);
      } else {
        throw new Error('Unknown artwork source');
      }
      
      return { 
        artwork: artworkDetail,
        fromCache: false 
      };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch artwork detail');
    }
  }
);

// Create the artwork slice
const artworkSlice = createSlice({
  name: 'artworks',
  initialState,
  reducers: {
    // Additional reducers for other actions (like setting filters, clearing, etc.)
    setFilter: (state, action: PayloadAction<{ 
      query?: string; 
      artist?: string;
      dateFrom?: string;
      dateTo?: string;
      medium?: string;
      source?: 'all' | 'rijksmuseum' | 'harvardartmuseums' 
    }>) => {
      if (action.payload.query !== undefined) {
        state.filters.query = action.payload.query;
      }
      if (action.payload.artist !== undefined) {
        state.filters.artist = action.payload.artist;
      }
      if (action.payload.dateFrom !== undefined) {
        state.filters.dateFrom = action.payload.dateFrom;
      }
      if (action.payload.dateTo !== undefined) {
        state.filters.dateTo = action.payload.dateTo;
      }
      if (action.payload.medium !== undefined) {
        state.filters.medium = action.payload.medium;
      }
      if (action.payload.source !== undefined) {
        state.filters.source = action.payload.source;
      }
      // Reset to page 1 when filters change
      state.pagination.currentPage = 1;
    },
    
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    },
    
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    
    clearArtworks: (state) => {
      state.items = [];
      state.fetchedData = {};
      state.pagination.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle pending state
      .addCase(fetchArtworks.pending, (state) => {
        state.status = 'loading';
        // Don't clear the error here to allow showing previous errors during loading
      })
      // Handle successful fetch
      .addCase(fetchArtworks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        
        if (action.payload.newFetch && action.payload.artworks.length > 0) {
          // Merge new artworks with existing ones if this is a new fetch
          // Filter out duplicates by ID to avoid duplicates
          const existingIds = new Set(state.items.map(item => item.id));
          const newUniqueArtworks = action.payload.artworks.filter(artwork => !existingIds.has(artwork.id));
          
          state.items = [...state.items, ...newUniqueArtworks];
          
          // Update the cache to mark this query/page as fetched
          if (action.payload.cacheKey) {
            if (!state.fetchedData[action.payload.cacheKey]) {
              state.fetchedData[action.payload.cacheKey] = {
                fetched: true,
                fetchedPages: [action.payload.fetchPage],
              };
            } else {
              state.fetchedData[action.payload.cacheKey].fetched = true;
              if (!state.fetchedData[action.payload.cacheKey].fetchedPages.includes(action.payload.fetchPage)) {
                state.fetchedData[action.payload.cacheKey].fetchedPages.push(action.payload.fetchPage);
              }
            }
          }
        }
        
        // Update pagination
        state.pagination.currentPage = action.payload.pagination.currentPage;
        state.pagination.pageSize = action.payload.pagination.pageSize;
        
        if (action.payload.pagination.totalItems) {
          state.pagination.totalItems = action.payload.pagination.totalItems;
          state.pagination.totalPages = action.payload.pagination.totalPages;
        }
        
        // Update filters
        state.filters = action.payload.filters;
      })
      // Handle failed fetch
      .addCase(fetchArtworks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to fetch artworks';
      })
      // Handle artwork detail fetching
      .addCase(fetchArtworkDetail.fulfilled, (state, action) => {
        // If payload exists, update the store
        const payload = action.payload as { artwork: ArtworkDetail, fromCache: boolean };
        
        if (payload && payload.artwork) {
          const artwork = payload.artwork;
          
          // Always add to the detailedItems cache
          state.detailedItems[artwork.id] = artwork;
          
          // If the artwork already exists in the items array, update it
          // Otherwise add it
          const index = state.items.findIndex(item => item.id === artwork.id);
          if (index !== -1) {
            state.items[index] = artwork;
          } else {
            state.items.push(artwork);
          }
        }
      });
  },
});

// Export actions
export const { setFilter, resetFilters, setPage, clearArtworks } = artworkSlice.actions;

// Export selectors
export const selectAllArtworks = (state: RootState) => state.artworks.items;

// Select artworks with pagination and filtering for display
export const selectPaginatedArtworks = createSelector(
  [(state: RootState) => state.artworks.items, 
   (state: RootState) => state.artworks.filters.source,
   (state: RootState) => state.artworks.filters.query,
   (state: RootState) => state.artworks.filters.artist,
   (state: RootState) => state.artworks.filters.dateFrom,
   (state: RootState) => state.artworks.filters.dateTo,
   (state: RootState) => state.artworks.filters.medium,
   (state: RootState) => state.artworks.pagination.currentPage,
   (state: RootState) => state.artworks.pagination.pageSize],
  (items, source, query, artist, dateFrom, dateTo, medium, currentPage, pageSize) => {
    // Filter by source and query
    let filteredItems = items;
    
    if (source !== 'all') {
      filteredItems = filteredItems.filter(item => item.source === source);
    }
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        (item.title?.toLowerCase() || '').includes(lowerQuery) || 
        (item.artist?.toLowerCase() || '').includes(lowerQuery)
      );
    }
    
    // Filter by artist
    if (artist) {
      const lowerArtist = artist.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        (item.artist?.toLowerCase() || '').includes(lowerArtist)
      );
    }
    
    // Filter by medium
    if (medium) {
      const lowerMedium = medium.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        (item.medium?.toLowerCase() || '').includes(lowerMedium)
      );
    }
    
    // Filter by date range
    if (dateFrom || dateTo) {
      filteredItems = filteredItems.filter(item => {
        // Skip items without year data
        if (!item.year) return false;
        
        // Check if year is within range
        const year = item.year;
        const fromYear = dateFrom ? parseInt(dateFrom, 10) : -Infinity;
        const toYear = dateTo ? parseInt(dateTo, 10) : Infinity;
        
        return year >= fromYear && year <= toYear;
      });
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);
    
    return paginatedItems;
  }
);

// Selector to check if we need to fetch more data for the current page
export const selectShouldFetchForCurrentPage = createSelector(
  [(state: RootState) => state.artworks.pagination.currentPage,
   (state: RootState) => state.artworks.filters.source,
   (state: RootState) => state.artworks.filters.query,
   (state: RootState) => state.artworks.filters.artist,
   (state: RootState) => state.artworks.filters.dateFrom,
   (state: RootState) => state.artworks.filters.dateTo,
   (state: RootState) => state.artworks.filters.medium,
   (state: RootState) => state.artworks.fetchedData],
  (currentPage, source, query, artist, dateFrom, dateTo, medium, fetchedData) => {
    const cacheKey = getCacheKey(query, artist, dateFrom, dateTo, medium, source);
    const fetchPage = displayPageToFetchPage(currentPage);
    
    // Check if we've already fetched data for this page
    return !fetchedData[cacheKey] || 
           !fetchedData[cacheKey].fetched || 
           !fetchedData[cacheKey].fetchedPages.includes(fetchPage);
  }
);

// Add a new selector to check if we have detailed data for an artwork
export const selectHasArtworkDetail = (id: string) => 
  createSelector(
    [(state: RootState) => state.artworks.detailedItems],
    (detailedItems) => !!detailedItems[id]
  );

// Modify the selector to get artwork by ID to first check the detailed cache
export const selectArtworkById = (id: string) => 
  createSelector(
    [(state: RootState) => state.artworks.detailedItems,
     (state: RootState) => state.artworks.items],
    (detailedItems, items) => detailedItems[id] || items.find(artwork => artwork.id === id)
  );

export const selectRijksArtworks = createSelector(
  [selectAllArtworks], 
  (artworks) => artworks.filter(artwork => artwork.source === 'rijksmuseum')
);

export const selectHarvardArtworks = createSelector(
  [selectAllArtworks], 
  (artworks) => artworks.filter(artwork => artwork.source === 'harvardartmuseums')
);

export const selectArtworkStatus = (state: RootState) => state.artworks.status;
export const selectArtworkError = (state: RootState) => state.artworks.error;
export const selectPagination = (state: RootState) => state.artworks.pagination;
export const selectFilters = (state: RootState) => state.artworks.filters;

// Export the reducer
export default artworkSlice.reducer; 