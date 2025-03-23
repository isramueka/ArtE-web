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
  source: string
) => `${query}:${artist}:${dateFrom}:${dateTo}:${source}`;

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
      page = 1, // This is the display page
      source = 'all',
      forceRefresh = false,
    }: {
      query?: string;
      artist?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      source?: 'all' | 'rijksmuseum' | 'harvardartmuseums';
      forceRefresh?: boolean;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const cacheKey = getCacheKey(query, artist, dateFrom, dateTo, source);
      const fetchedData = state.artworks.fetchedData;
      
      // Calculate the fetch page from display page
      const fetchPage = displayPageToFetchPage(page);
      
      // Check if we need to fetch or can use existing data
      const needToFetch = forceRefresh || 
        !fetchedData[cacheKey] || 
        !fetchedData[cacheKey].fetched ||
        !fetchedData[cacheKey].fetchedPages.includes(fetchPage);
      
      if (!needToFetch) {
        console.log(`Using cached data for query: ${query}, page: ${page}, source: ${source}`);
        
        // Return object that indicates we're using cached data
        return {
          newFetch: false,
          artworks: [], // No new artworks to add
          pagination: {
            currentPage: page,
            pageSize: DISPLAY_PAGE_SIZE,
            totalItems: state.artworks.pagination.totalItems,
            totalPages: state.artworks.pagination.totalPages,
          },
          filters: {
            query,
            artist,
            dateFrom,
            dateTo,
            source,
          },
        };
      }
      
      console.log(`Fetching new data for query: ${query}, page: ${page}, source: ${source}`);
      
      // Initialize variables for tracking items
      let artworks: Artwork[] = [];
      let rijksTotal = 0;
      let harvardTotal = 0;
      
      // Fetch from Rijksmuseum if source is 'all' or 'rijksmuseum'
      if (source === 'all' || source === 'rijksmuseum') {
        const rijksResponse = await rijksMuseumService.fetchArtworksList({
          query,
          artist,
          dateFrom,
          dateTo,
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
          source,
        },
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
    setFilter: (state, action: PayloadAction<Partial<ArtworkState['filters']>>) => {
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
      
      if (action.payload.source !== undefined) {
        state.filters.source = action.payload.source;
      }
      
      // Reset pagination to page 1 when filters change
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
      .addCase(fetchArtworks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchArtworks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;

        // Extract data from action payload
        const { artworks, newFetch, pagination, filters } = action.payload;
        
        // Update pagination information
        if (pagination) {
          state.pagination = {
            ...state.pagination,
            ...pagination,
          };
        }
        
        // Update filters
        if (filters) {
          state.filters = {
            ...state.filters,
            ...filters,
          };
        }
        
        // If this is new data (not from cache), add the artworks to our collection
        if (newFetch && artworks.length > 0) {
          // Create a map from existing items for faster lookup
          const existingItemsMap = new Map(
            state.items.map(item => [item.id, item])
          );
          
          // Add new artworks, avoiding duplicates
          artworks.forEach((artwork) => {
            if (!existingItemsMap.has(artwork.id)) {
              state.items.push(artwork);
            }
          });
        }
        
        // Update the fetchedData cache to record what we've fetched
        const cacheKey = getCacheKey(
          filters.query, 
          filters.artist,
          filters.dateFrom,
          filters.dateTo,
          filters.source
        );
        
        const fetchPage = displayPageToFetchPage(pagination.currentPage);
        
        // Initialize the cache entry if it doesn't exist
        if (!state.fetchedData[cacheKey]) {
          state.fetchedData[cacheKey] = {
            fetched: true,
            fetchedPages: [fetchPage],
          };
        } else {
          // Update the existing cache entry
          state.fetchedData[cacheKey].fetched = true;
          if (!state.fetchedData[cacheKey].fetchedPages.includes(fetchPage)) {
            state.fetchedData[cacheKey].fetchedPages.push(fetchPage);
          }
        }
      })
      .addCase(fetchArtworks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch artworks';
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

// New selector to get paginated artworks (used in route guards)
export const selectPaginatedArtworks = createSelector(
  [
    selectAllArtworks,
    (state: RootState) => state.artworks.filters,
    (state: RootState) => state.artworks.pagination.currentPage,
    (state: RootState) => state.artworks.pagination.pageSize,
  ],
  (items, filters, currentPage, pageSize) => {
    // First filter by source
    let filteredItems = items;
    
    if (filters.source !== 'all') {
      filteredItems = filteredItems.filter(item => item.source === filters.source);
    }
    
    // Filter by keyword query
    if (filters.query) {
      const lowerQuery = filters.query.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        (item.title?.toLowerCase() || '').includes(lowerQuery) || 
        (item.artist?.toLowerCase() || '').includes(lowerQuery) ||
        (item.description?.toLowerCase() || '').includes(lowerQuery)
      );
    }
    
    // Filter by artist
    if (filters.artist) {
      const lowerArtist = filters.artist.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        (item.artist?.toLowerCase() || '').includes(lowerArtist)
      );
    }
    
    // Filter by date range
    if (filters.dateFrom || filters.dateTo) {
      const fromYear = filters.dateFrom ? parseInt(filters.dateFrom, 10) : -Infinity;
      const toYear = filters.dateTo ? parseInt(filters.dateTo, 10) : Infinity;
      
      filteredItems = filteredItems.filter(item => 
        item.year && item.year >= fromYear && item.year <= toYear
      );
    }
    
    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredItems.slice(startIndex, endIndex);
  }
);

// Select artworks with pagination and filtering for display
export const selectFilteredItems = createSelector(
  [
    selectAllArtworks,
    (state: RootState) => state.artworks.filters.source,
    (state: RootState) => state.artworks.filters.query,
    (state: RootState) => state.artworks.filters.artist,
    (state: RootState) => state.artworks.filters.dateFrom,
    (state: RootState) => state.artworks.filters.dateTo,
    (state: RootState) => state.artworks.pagination.currentPage,
    (state: RootState) => state.artworks.pagination.pageSize,
  ],
  (items, source, query, artist, dateFrom, dateTo, currentPage, pageSize) => {
    // First filter by source
    let filteredItems = items;
    
    if (source !== 'all') {
      filteredItems = filteredItems.filter(item => item.source === source);
    }
    
    // Filter by keyword query
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        (item.title?.toLowerCase() || '').includes(lowerQuery) || 
        (item.artist?.toLowerCase() || '').includes(lowerQuery) ||
        (item.description?.toLowerCase() || '').includes(lowerQuery)
      );
    }
    
    // Filter by artist
    if (artist) {
      const lowerArtist = artist.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        (item.artist?.toLowerCase() || '').includes(lowerArtist)
      );
    }
    
    // Filter by date range
    if (dateFrom || dateTo) {
      const fromYear = dateFrom ? parseInt(dateFrom, 10) : -Infinity;
      const toYear = dateTo ? parseInt(dateTo, 10) : Infinity;
      
      filteredItems = filteredItems.filter(item => 
        item.year && item.year >= fromYear && item.year <= toYear
      );
    }
    
    // Calculate total pages
    const totalPages = Math.ceil(filteredItems.length / pageSize);
    
    // Get the items for the current page
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);
    
    return {
      items: paginatedItems,
      totalItems: filteredItems.length,
      totalPages
    };
  }
);

// Selector to check if we need to fetch more data for the current page
export const selectShouldFetchForCurrentPage = createSelector(
  [
    (state: RootState) => state.artworks.pagination.currentPage,
    (state: RootState) => state.artworks.filters.source,
    (state: RootState) => state.artworks.filters.query,
    (state: RootState) => state.artworks.filters.artist,
    (state: RootState) => state.artworks.filters.dateFrom,
    (state: RootState) => state.artworks.filters.dateTo,
    (state: RootState) => state.artworks.fetchedData,
  ],
  (currentPage, source, query, artist, dateFrom, dateTo, fetchedData) => {
    const cacheKey = getCacheKey(query, artist, dateFrom, dateTo, source);
    const fetchPage = displayPageToFetchPage(currentPage);
    
    // If we don't have data for this key or fetch page, we need to fetch
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