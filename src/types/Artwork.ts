/**
 * Unified interface representing artwork data across different museum sources
 */
export interface Artwork {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  thumbnailUrl?: string;
  year?: number;
  description?: string;
  medium?: string;
  dimensions?: string;
  creditLine?: string;
  source: 'rijksmuseum' | 'harvardartmuseums';
  sourceId: string; // Original ID in the source system
  url?: string; // URL to view on the source website
}

/**
 * Extended artwork details with additional fields
 */
export interface ArtworkDetail extends Artwork {
  provenance?: string;
  accessionNumber?: string;
  collection?: string;
  exhibitions?: string[];
  bibliography?: string[];
  colors?: Array<{name: string, hex: string}>;
  techniques?: string[];
  objectType?: string;
  materials?: string[];
} 