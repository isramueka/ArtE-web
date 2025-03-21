/**
 * Service for the Harvard Art Museums API
 * Documentation: https://api.harvardartmuseums.org/
 */

import { Artwork, ArtworkDetail } from '../types/Artwork';
import { transformHarvardArtworks, transformHarvardArtworkDetail } from './transformers';

// Base URL for the Harvard Art Museums API
const BASE_URL = 'https://api.harvardartmuseums.org';
// Hardcode the API key directly for now to ensure it works
const API_KEY = 'ca46d3f1-9f99-499c-b12d-e5f57052da61';  // process.env.REACT_APP_HARVARD_API_KEY

/**
 * Fetches a list of artworks from the Harvard Art Museums API
 * @param query Search query string
 * @param page Page number (1-based)
 * @param pageSize Number of results per page
 * @returns Promise with transformed Artwork objects
 */
export const fetchArtworksList = async (
  query: string = '',
  page: number = 1,
  pageSize: number = 100
): Promise<Artwork[]> => {
  try {
    const url = new URL(`${BASE_URL}/object`);
    
    // Add query parameters
    url.searchParams.append('apikey', API_KEY || '');
    url.searchParams.append('page', page.toString());
    url.searchParams.append('size', pageSize.toString());
    url.searchParams.append('hasimage', '1'); // Only return results with images
    
    // Add search query if provided
    if (query) {
      url.searchParams.append('keyword', query);
    }
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Error fetching artworks: ${response.statusText}`);
    }
    
    const rawData = await response.json();
    return transformHarvardArtworks(rawData);
  } catch (error) {
    console.error('Failed to fetch artworks from Harvard Art Museums:', error);
    throw error;
  }
};

/**
 * Fetches details for a specific artwork from the Harvard Art Museums API
 * @param id The artwork object ID
 * @returns Promise with the transformed ArtworkDetail object
 */
export const fetchArtworkDetail = async (id: string): Promise<ArtworkDetail | null> => {
  try {
    const url = new URL(`${BASE_URL}/object/${id}`);
    
    // Add API key
    url.searchParams.append('apikey', API_KEY || '');
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Error fetching artwork details: ${response.statusText}`);
    }
    
    const rawData = await response.json();
    return transformHarvardArtworkDetail(rawData);
  } catch (error) {
    console.error(`Failed to fetch artwork details for ID ${id}:`, error);
    throw error;
  }
}; 