/**
 * Service for the Harvard Art Museums API
 * Documentation: https://api.harvardartmuseums.org/
 */

import { Artwork, ArtworkDetail } from '../types/Artwork';
import { transformHarvardArtworks, transformHarvardArtworkDetail } from './transformers';

// Base URL for the Harvard Art Museums API
const BASE_URL = 'https://api.harvardartmuseums.org';
// Hardcode the API key directly for now to ensure it works
const API_KEY = process.env.REACT_APP_HARVARD_API_KEY;
/**
 * Fetches a list of artworks from the Harvard Art Museums API
 * @param params Search parameters object
 * @returns Promise with transformed Artwork objects
 */
export const fetchArtworksList = async (
  params: {
    query?: string;
    artist?: string;
    dateFrom?: string;
    dateTo?: string;
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
      page = 1, 
      pageSize = 100 
    } = params;
    
    const url = new URL(`${BASE_URL}/object`);
    
    // Add query parameters
    url.searchParams.append('apikey', API_KEY || '');
    url.searchParams.append('page', page.toString());
    url.searchParams.append('size', pageSize.toString());
    // Only return objects that potentially have an image available
    // Use 'any' instead of '1' to include images that might be accessible via the IIIF service
    url.searchParams.append('hasimage', 'any');
    
    // Request additional fields we need for image handling
    url.searchParams.append('fields', 'id,title,people,description,dated,primaryimageurl,images,url,medium,dimensions,creditline,labeltext');
    
    // Build advanced query using field-specific search
    let advancedQuery = '';
    
    // Add keyword search if provided
    if (query) {
      advancedQuery += query;
    }
    
    // Add artist filter using person field
    if (artist) {
      if (advancedQuery) advancedQuery += ' AND ';
      advancedQuery += `person:"${artist}"`;
    }
    
    // Add date range filtering if both dates are provided
    if (dateFrom && dateTo) {
      if (advancedQuery) advancedQuery += ' AND ';
      advancedQuery += `dated:[${dateFrom} TO ${dateTo}]`;
    } else if (dateFrom) {
      if (advancedQuery) advancedQuery += ' AND ';
      advancedQuery += `dated:>=${dateFrom}`;
    } else if (dateTo) {
      if (advancedQuery) advancedQuery += ' AND ';
      advancedQuery += `dated:<=${dateTo}`;
    }
    
    // Add the combined query if we have any filters
    if (advancedQuery) {
      url.searchParams.append('q', advancedQuery);
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
    
    // Request specific fields including all image-related data
    url.searchParams.append('fields', 'id,title,people,description,dated,primaryimageurl,images,url,medium,dimensions,creditline,labeltext,technique,classification,division,provenance,accessionumber,accessionyear,colors,exhibitions,publications');
    
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