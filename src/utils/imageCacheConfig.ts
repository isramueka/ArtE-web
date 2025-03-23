// Configure global image caching behavior
// This uses the browser's localStorage to cache image sources

/**
 * Set up image caching in localStorage
 * @param maxCacheSize Maximum number of cached image URLs (default: 100)
 * @param expirationHours Hours before cached entries expire (default: 24)
 */
export const setupImageCache = (maxCacheSize = 100, expirationHours = 24) => {
  // Set the global cache size for react-lazy-load-image-component
  // This is using a property that the library looks for
  (window as any).lazySizes = (window as any).lazySizes || {};
  (window as any).lazySizes.config = (window as any).lazySizes.config || {};
  (window as any).lazySizes.config.preloadAfterLoad = true;
  
  // Create or get the image cache
  let imageCache = localStorage.getItem('art_image_cache');
  let parsedCache = imageCache ? JSON.parse(imageCache) : { images: {}, lastCleaned: Date.now() };
  
  // Clean expired entries
  const now = Date.now();
  const expirationTime = expirationHours * 60 * 60 * 1000; // Convert hours to milliseconds
  
  // Only clean cache once per day to avoid excessive operations
  if (now - parsedCache.lastCleaned > 24 * 60 * 60 * 1000) {
    Object.keys(parsedCache.images).forEach(key => {
      if (now - parsedCache.images[key].timestamp > expirationTime) {
        delete parsedCache.images[key];
      }
    });
    
    // Limit cache size
    const keys = Object.keys(parsedCache.images);
    if (keys.length > maxCacheSize) {
      // Sort by timestamp (oldest first)
      keys.sort((a, b) => parsedCache.images[a].timestamp - parsedCache.images[b].timestamp);
      
      // Remove oldest entries to get back to max size
      const keysToRemove = keys.slice(0, keys.length - maxCacheSize);
      keysToRemove.forEach(key => {
        delete parsedCache.images[key];
      });
    }
    
    parsedCache.lastCleaned = now;
    localStorage.setItem('art_image_cache', JSON.stringify(parsedCache));
  }
};

/**
 * Add an image URL to the cache
 * @param url The image URL to cache
 */
export const cacheImage = (url: string) => {
  try {
    let imageCache = localStorage.getItem('art_image_cache');
    let parsedCache = imageCache ? JSON.parse(imageCache) : { images: {}, lastCleaned: Date.now() };
    
    // Add or update the cached entry
    parsedCache.images[url] = {
      timestamp: Date.now(),
      accessed: true
    };
    
    localStorage.setItem('art_image_cache', JSON.stringify(parsedCache));
  } catch (error) {
    console.error('Error caching image:', error);
  }
};

/**
 * Clear the image cache
 */
export const clearImageCache = () => {
  localStorage.removeItem('art_image_cache');
};

// Define the export object as a variable first
const imageCache = {
  setupImageCache,
  cacheImage,
  clearImageCache
};

// Export the default object
export default imageCache; 