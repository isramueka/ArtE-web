import { Artwork, ArtworkDetail } from '../types/Artwork';

// Color name mapping for hex codes (approximations)
const COLOR_MAP: Record<string, string> = {
  '#000000': 'Black',
  '#FFFFFF': 'White',
  '#FF0000': 'Red',
  '#00FF00': 'Green',
  '#0000FF': 'Blue',
  '#FFFF00': 'Yellow',
  '#00FFFF': 'Cyan',
  '#FF00FF': 'Magenta',
  '#C0C0C0': 'Silver',
  '#808080': 'Gray',
  '#800000': 'Maroon',
  '#808000': 'Olive',
  '#008000': 'Green',
  '#800080': 'Purple',
  '#008080': 'Teal',
  '#000080': 'Navy',
  '#A52A2A': 'Brown',
  '#D2B48C': 'Tan',
  '#FFD700': 'Gold',
  '#FFA500': 'Orange',
  '#8B4513': 'SaddleBrown',
  '#556B2F': 'DarkOliveGreen',
  '#B8860B': 'DarkGoldenrod',
  '#696969': 'DimGray',
  '#E0CC91': 'Wheat',
  '#E09714': 'Goldenrod',
};

// Function to find the closest named color from our map
function getClosestColorName(hex: string): string {
  // If we have an exact match, use it
  const uppercaseHex = hex.toUpperCase();
  if (COLOR_MAP[uppercaseHex]) {
    return COLOR_MAP[uppercaseHex];
  }
  
  // Otherwise return a generic name with the hex
  return `Color ${hex}`;
}

/**
 * Transforms a Rijksmuseum API artwork list response into our unified Artwork interface
 * @param rawData Raw JSON response from Rijksmuseum API
 * @returns Array of standardized Artwork objects
 */
export const transformRijksArtworks = (rawData: any): Artwork[] => {
  if (!rawData || !rawData.artObjects || !Array.isArray(rawData.artObjects)) {
    return [];
  }

  return rawData.artObjects.map((item: any) => {
    // Handle potential missing data
    const artistName = item.principalOrFirstMaker || 'Unknown Artist';
    
    // Some brief info might be available in the list view
    const description = item.plaqueDescriptionEnglish || item.label?.description || '';
    
    return {
      id: `rijks-${item.objectNumber}`,
      sourceId: item.objectNumber,
      title: item.title || 'Untitled',
      artist: artistName,
      imageUrl: item.webImage?.url || '',
      thumbnailUrl: item.headerImage?.url || '',
      year: item.dating?.yearEarly || undefined,
      description: description,
      medium: item.materials?.join(', ') || '',
      dimensions: '',
      creditLine: '',
      source: 'rijksmuseum' as const,
      url: item.links?.web || '',
    };
  });
};

/**
 * Transforms a Rijksmuseum API artwork detail response into our unified ArtworkDetail interface
 * @param rawData Raw JSON response from Rijksmuseum API detail endpoint
 * @returns Standardized ArtworkDetail object
 */
export const transformRijksArtworkDetail = (rawData: any): ArtworkDetail | null => {
  if (!rawData || !rawData.artObject) {
    return null;
  }

  const artObject = rawData.artObject;
  const dating = artObject.dating || {};
  
  // Prioritize English content for description
  const description = 
    artObject.plaqueDescriptionEnglish || // First try the English plaque description
    artObject.label?.description || // Then try the label description (usually in English)
    artObject.description || // Fallback to default description (might be in Dutch)
    '';
    
  // Extract colors from the Rijksmuseum API response
  let colors: Array<{name: string, hex: string}> = [];
  
  // First try to extract from the colors array
  if (artObject.colors && Array.isArray(artObject.colors)) {
    colors = artObject.colors.map((color: any) => {
      const hex = color.hex?.trim() || '#CCCCCC';
      return {
        name: getClosestColorName(hex),
        hex: hex
      };
    });
  } 
  // If no colors, try colorsWithNormalization
  else if (artObject.colorsWithNormalization && Array.isArray(artObject.colorsWithNormalization)) {
    colors = artObject.colorsWithNormalization.map((color: any) => {
      const hex = color.originalHex?.trim() || color.normalizedHex?.trim() || '#CCCCCC';
      return {
        name: getClosestColorName(hex),
        hex: hex
      };
    });
  }
  // Last try normalizedColors
  else if (artObject.normalizedColors && Array.isArray(artObject.normalizedColors)) {
    colors = artObject.normalizedColors.map((color: any) => {
      const hex = color.hex?.trim() || '#CCCCCC';
      return {
        name: getClosestColorName(hex),
        hex: hex
      };
    });
  }
  
  return {
    id: `rijks-${artObject.objectNumber}`,
    sourceId: artObject.objectNumber,
    title: artObject.title || 'Untitled',
    artist: artObject.principalOrFirstMaker || 'Unknown Artist',
    imageUrl: artObject.webImage?.url || '',
    thumbnailUrl: artObject.headerImage?.url || '',
    year: dating.yearEarly || undefined,
    description: description,
    medium: artObject.physicalMedium || artObject.materials?.join(', ') || '',
    dimensions: artObject.dimensions ? artObject.dimensions.map((d: any) => `${d.type}: ${d.value}${d.unit}`).join(', ') : '',
    creditLine: artObject.acquisition?.creditLine || '',
    source: 'rijksmuseum' as const,
    url: artObject.links?.web || '',
    
    // Additional detail fields
    provenance: artObject.provenance || '',
    accessionNumber: artObject.objectNumber || '',
    collection: artObject.collection || '',
    techniques: artObject.techniques?.map((t: any) => t.name || t) || [],
    objectType: artObject.objectTypes?.[0] || '',
    materials: artObject.materials || [],
    colors: colors,
  };
};

/**
 * Transforms a Harvard Art Museums API artwork list response into our unified Artwork interface
 * @param rawData Raw JSON response from Harvard Art Museums API
 * @returns Array of standardized Artwork objects
 */
export const transformHarvardArtworks = (rawData: any): Artwork[] => {
  if (!rawData || !rawData.records || !Array.isArray(rawData.records)) {
    return [];
  }

  return rawData.records.map((item: any) => {
    // Get primary artist
    let artistName = 'Unknown Artist';
    if (item.people && item.people.length > 0) {
      const primaryCreator = item.people.find((p: any) => p.role === 'Artist' || p.role === 'Primary');
      artistName = primaryCreator ? primaryCreator.name : item.people[0].name;
    }
    
    // Get year from dated field which might be in various formats
    let year: number | undefined = undefined;
    if (item.dated) {
      const yearMatch = item.dated.match(/\d{4}/);
      if (yearMatch) {
        year = parseInt(yearMatch[0], 10);
      }
    }

    // Prioritize English content for description
    const description = item.description || item.labeltext || '';

    return {
      id: `harvard-${item.id}`,
      sourceId: item.id.toString(),
      title: item.title || 'Untitled',
      artist: artistName,
      imageUrl: item.primaryimageurl || '',
      thumbnailUrl: item.images?.length > 0 ? item.images[0].baseimageurl : '',
      year: year,
      description: description,
      medium: item.medium || '',
      dimensions: item.dimensions || '',
      creditLine: item.creditline || '',
      source: 'harvardartmuseums' as const,
      url: item.url || '',
    };
  });
};

/**
 * Transforms a Harvard Art Museums API artwork detail response into our unified ArtworkDetail interface
 * @param rawData Raw JSON response from Harvard Art Museums API detail endpoint
 * @returns Standardized ArtworkDetail object
 */
export const transformHarvardArtworkDetail = (rawData: any): ArtworkDetail | null => {
  if (!rawData) {
    return null;
  }

  // Get primary artist
  let artistName = 'Unknown Artist';
  if (rawData.people && rawData.people.length > 0) {
    const primaryCreator = rawData.people.find((p: any) => p.role === 'Artist' || p.role === 'Primary');
    artistName = primaryCreator ? primaryCreator.name : rawData.people[0].name;
  }
  
  // Get year from dated field which might be in various formats
  let year: number | undefined = undefined;
  if (rawData.dated) {
    const yearMatch = rawData.dated.match(/\d{4}/);
    if (yearMatch) {
      year = parseInt(yearMatch[0], 10);
    }
  }

  // Extract colors if available
  const colors = rawData.colors ? rawData.colors.map((color: any) => ({
    name: color.name || '',
    hex: color.color || '',
  })) : [];

  // Prioritize English content for description
  const description = rawData.description || rawData.labeltext || '';

  return {
    id: `harvard-${rawData.id}`,
    sourceId: rawData.id.toString(),
    title: rawData.title || 'Untitled',
    artist: artistName,
    imageUrl: rawData.primaryimageurl || '',
    thumbnailUrl: rawData.images?.length > 0 ? rawData.images[0].baseimageurl : '',
    year: year,
    description: description,
    medium: rawData.medium || '',
    dimensions: rawData.dimensions || '',
    creditLine: rawData.creditline || '',
    source: 'harvardartmuseums' as const,
    url: rawData.url || '',
    
    // Additional detail fields
    provenance: rawData.provenance || '',
    accessionNumber: rawData.accessionumber || rawData.accessionyear || '',
    collection: rawData.division || '',
    exhibitions: rawData.exhibitions?.map((e: any) => e.title || '') || [],
    bibliography: rawData.publications?.map((p: any) => p.citation || '') || [],
    colors: colors,
    techniques: rawData.technique?.split(';').map((t: string) => t.trim()) || [],
    objectType: rawData.classification || '',
    materials: rawData.technique ? [rawData.technique] : [],
  };
}; 