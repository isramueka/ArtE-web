import React, { useEffect } from 'react';
import AppRouter from './router/AppRouter';
import { setupImageCache } from './utils/imageCacheConfig';

function App() {
  // Initialize image caching when the app starts
  useEffect(() => {
    // Set up the image cache with default values (100 images, 24 hour expiration)
    setupImageCache();
    
    // Log info about caching for development
    if (process.env.NODE_ENV === 'development') {
      console.info('Image caching initialized');
    }
  }, []);
  
  return <AppRouter />;
}

export default App;
