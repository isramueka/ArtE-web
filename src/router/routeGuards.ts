import { store } from '../store';
import { 
  fetchArtworks, 
  fetchArtworkDetail,
  selectPaginatedArtworks,
  selectHasArtworkDetail
} from '../store/artworkSlice';

/**
 * Route guard/loader for the ArtworksPage
 * Ensures that data is fetched before rendering the page if store is empty
 */
export const artworksLoader = async () => {
  try {
    const state = store.getState();
    const artworks = selectPaginatedArtworks(state);
    
    // If no artworks are loaded yet, dispatch the fetch action
    if (artworks.length === 0) {
      await store.dispatch(fetchArtworks({
        query: state.artworks.filters.query,
        page: state.artworks.pagination.currentPage,
        source: state.artworks.filters.source
      }));
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to load artworks:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to load artworks' 
    };
  }
};

/**
 * Route guard/loader for the ArtworkDetailPage
 * Ensures the specific artwork detail is fetched before rendering the page
 */
export const artworkDetailLoader = async ({ params }: { params: { id?: string } }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return { success: false, error: 'Artwork ID is required' };
    }
    
    const state = store.getState();
    const hasDetail = selectHasArtworkDetail(id)(state);
    
    // If we don't have the detailed info yet, fetch it
    if (!hasDetail) {
      await store.dispatch(fetchArtworkDetail(id) as any);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to load artwork detail:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to load artwork detail'
    };
  }
}; 