import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';
import { v4 as uuidv4 } from 'uuid';

// Define the interface for a user exhibition/collection
export interface UserExhibition {
  id: string;
  title: string;
  description?: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  artworkIds: string[]; // IDs of artworks in this exhibition
}

// State interface
interface ExhibitionsState {
  userExhibitions: UserExhibition[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Load exhibitions from localStorage if available
const loadExhibitionsFromStorage = (): UserExhibition[] => {
  try {
    const storedExhibitions = localStorage.getItem('userExhibitions');
    if (storedExhibitions) {
      return JSON.parse(storedExhibitions);
    }
  } catch (error) {
    console.error('Failed to load exhibitions from localStorage', error);
  }
  return [];
};

// Initial state
const initialState: ExhibitionsState = {
  userExhibitions: loadExhibitionsFromStorage(),
  status: 'idle',
  error: null,
};

// Helper function to save exhibitions to localStorage
const saveExhibitionsToStorage = (exhibitions: UserExhibition[]) => {
  try {
    localStorage.setItem('userExhibitions', JSON.stringify(exhibitions));
  } catch (error) {
    console.error('Failed to save exhibitions to localStorage', error);
  }
};

const exhibitionsSlice = createSlice({
  name: 'exhibitions',
  initialState,
  reducers: {
    // Create a new exhibition
    createExhibition: (state, action: PayloadAction<{ title: string; description?: string }>) => {
      const timestamp = Date.now();
      const newExhibition: UserExhibition = {
        id: uuidv4(),
        title: action.payload.title,
        description: action.payload.description || '',
        createdAt: timestamp,
        updatedAt: timestamp,
        artworkIds: [],
      };
      state.userExhibitions.push(newExhibition);
      saveExhibitionsToStorage(state.userExhibitions);
    },
    
    // Update exhibition details
    updateExhibition: (state, action: PayloadAction<{ id: string; title?: string; description?: string }>) => {
      const exhibition = state.userExhibitions.find(ex => ex.id === action.payload.id);
      if (exhibition) {
        if (action.payload.title) exhibition.title = action.payload.title;
        if (action.payload.description !== undefined) exhibition.description = action.payload.description;
        exhibition.updatedAt = Date.now();
        saveExhibitionsToStorage(state.userExhibitions);
      }
    },
    
    // Delete an exhibition
    deleteExhibition: (state, action: PayloadAction<string>) => {
      state.userExhibitions = state.userExhibitions.filter(
        exhibition => exhibition.id !== action.payload
      );
      saveExhibitionsToStorage(state.userExhibitions);
    },
    
    // Add artwork to an exhibition
    addArtworkToExhibition: (state, action: PayloadAction<{ exhibitionId: string; artworkId: string }>) => {
      const exhibition = state.userExhibitions.find(
        ex => ex.id === action.payload.exhibitionId
      );
      
      if (exhibition && !exhibition.artworkIds.includes(action.payload.artworkId)) {
        exhibition.artworkIds.push(action.payload.artworkId);
        exhibition.updatedAt = Date.now();
        saveExhibitionsToStorage(state.userExhibitions);
      }
    },
    
    // Remove artwork from an exhibition
    removeArtworkFromExhibition: (state, action: PayloadAction<{ exhibitionId: string; artworkId: string }>) => {
      const exhibition = state.userExhibitions.find(
        ex => ex.id === action.payload.exhibitionId
      );
      
      if (exhibition) {
        exhibition.artworkIds = exhibition.artworkIds.filter(
          id => id !== action.payload.artworkId
        );
        exhibition.updatedAt = Date.now();
        saveExhibitionsToStorage(state.userExhibitions);
      }
    },
    
    // Import exhibitions from another source (e.g., for migration)
    importExhibitions: (state, action: PayloadAction<UserExhibition[]>) => {
      // Avoid duplicates by checking IDs
      const existingIds = new Set(state.userExhibitions.map(ex => ex.id));
      const uniqueExhibitions = action.payload.filter(ex => !existingIds.has(ex.id));
      
      state.userExhibitions = [...state.userExhibitions, ...uniqueExhibitions];
      saveExhibitionsToStorage(state.userExhibitions);
    },
  },
});

// Export actions
export const { 
  createExhibition, 
  updateExhibition, 
  deleteExhibition, 
  addArtworkToExhibition, 
  removeArtworkFromExhibition,
  importExhibitions
} = exhibitionsSlice.actions;

// Selectors
export const selectAllExhibitions = (state: RootState) => state.exhibitions.userExhibitions;

export const selectExhibitionById = (id: string) => 
  createSelector(
    [selectAllExhibitions],
    (exhibitions) => exhibitions.find(exhibition => exhibition.id === id)
  );

export const selectArtworkExhibitions = (artworkId: string) => 
  createSelector(
    [selectAllExhibitions],
    (exhibitions) => exhibitions.filter(
      exhibition => exhibition.artworkIds.includes(artworkId)
    )
  );

export default exhibitionsSlice.reducer; 