import { configureStore } from '@reduxjs/toolkit';
import artworkReducer from './artworkSlice';
import exhibitionsReducer from './exhibitionsSlice';

export const store = configureStore({
  reducer: {
    artworks: artworkReducer,
    exhibitions: exhibitionsReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 