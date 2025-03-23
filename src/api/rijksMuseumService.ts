/**
 * Service for the Rijks Museum API
 * Documentation: https://www.rijksmuseum.nl/api/en/collection
 */

import { Artwork, ArtworkDetail } from '../types/Artwork';
import { transformRijksArtworks, transformRijksArtworkDetail } from './transformers';

// Base URL for the Rijksmuseum API - already using English API endpoint
const BASE_URL = 'https://www.rijksmuseum.nl/api/en';
// Hardcode the API key directly for now to ensure it works
const API_KEY = 'FBE3ku6i';  // process.env.REACT_APP_RIJKSMUSEUM_API_KEY

/**
 * Fetches a list of artworks from the Rijksmuseum API
 * @param params Search parameters object
 * @returns Promise with transformed Artwork objects
 */
export const fetchArtworksList = async (
  params: {
    query?: string;
    artist?: string;
    dateFrom?: string;
    dateTo?: string;
    medium?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<Artwork[]> => {
  try {
    const { 
      query = '', 
      artist = '',
      dateFrom = '',
      dateTo = '',
      medium = '',
      page = 1, 
      pageSize = 100 
    } = params;
    
    const url = new URL(`${BASE_URL}/collection`);
    
    // Add query parameters
    url.searchParams.append('key', API_KEY);
    url.searchParams.append('p', page.toString());
    url.searchParams.append('ps', pageSize.toString());
    url.searchParams.append('culture', 'en'); // Request English content
    url.searchParams.append('toppieces', 'true'); // Get top pieces for better results
    url.searchParams.append('imgonly', 'true'); // Only return results with images
    
    // Add search query if provided
    if (query) {
      url.searchParams.append('q', query);
    }
    
    // Add artist filter if provided (involvedMaker parameter for Rijks API)
    if (artist) {
      url.searchParams.append('involvedMaker', artist);
    }
    
    // Add material/technique filter if provided
    if (medium) {
      url.searchParams.append('material', medium);
    }
    
    // Date filtering doesn't seem to be directly supported by the API
    // We'll apply client-side filtering for dates later if needed
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Error fetching artworks: ${response.statusText}`);
    }
    
    const rawData = await response.json();
    return transformRijksArtworks(rawData);
  } catch (error) {
    console.error('Failed to fetch artworks from Rijksmuseum:', error);
    throw error;
  }
};

/**
 * Fetches details for a specific artwork from the Rijksmuseum API
 * @param id The artwork object number/id 
 * @returns Promise with the transformed ArtworkDetail object
 */
export const fetchArtworkDetail = async (id: string): Promise<ArtworkDetail | null> => {
  try {
    const url = new URL(`${BASE_URL}/collection/${id}`);
    
    // Add API key and language parameter
    url.searchParams.append('key', API_KEY);
    url.searchParams.append('culture', 'en'); // Request English content
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Error fetching artwork details: ${response.statusText}`);
    }
    
    const rawData = await response.json();
    return transformRijksArtworkDetail(rawData);
  } catch (error) {
    console.error(`Failed to fetch artwork details for ID ${id}:`, error);
    throw error;
  }
}; 