/**
 * Utility functions for social media sharing
 */

// Get the base URL of the application (will default to current origin in browser)
export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Fallback for SSR or when window is not available
  return process.env.REACT_APP_BASE_URL || 'https://your-app-url.netlify.app';
};

// Generate a shareable URL for an artwork
export const getArtworkShareUrl = (artworkId: string): string => {
  return `${getBaseUrl()}/artworks/${artworkId}`;
};

// Generate a shareable URL for an exhibition
export const getExhibitionShareUrl = (exhibitionId: string): string => {
  return `${getBaseUrl()}/exhibitions/${exhibitionId}`;
};

/**
 * Generate Twitter/X share URL
 * @param url URL to share
 * @param text Text to include in the tweet
 * @returns URL to open Twitter share dialog
 */
export const getTwitterShareUrl = (url: string, text: string): string => {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
};

/**
 * Generate Facebook share URL
 * @param url URL to share
 * @returns URL to open Facebook share dialog
 */
export const getFacebookShareUrl = (url: string): string => {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
};

/**
 * Generate LinkedIn share URL
 * @param url URL to share
 * @param title Title of the content
 * @returns URL to open LinkedIn share dialog
 */
export const getLinkedInShareUrl = (url: string, title: string): string => {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
};

/**
 * Open a URL in a new tab/window
 * @param url URL to open
 */
export const openShareWindow = (url: string): void => {
  window.open(url, '_blank', 'width=550,height=420');
}; 