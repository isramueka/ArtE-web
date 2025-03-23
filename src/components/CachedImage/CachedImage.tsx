import React, { useEffect, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Box, CircularProgress, useTheme } from '@mui/material';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { cacheImage } from '../../utils/imageCacheConfig';

interface CachedImageProps {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
  placeholderSrc?: string;
  threshold?: number;
  effect?: 'blur' | 'opacity' | 'black-and-white';
  wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
  sx?: any; // For MUI sx prop support
}

const CachedImage: React.FC<CachedImageProps> = ({
  src,
  alt,
  width = '100%',
  height = 'auto',
  className,
  style,
  placeholderSrc,
  threshold = 200,
  effect = 'blur',
  wrapperProps,
  sx = {},
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);
  
  // Check if src is empty or invalid immediately
  const noSource = !src || src === '';
  
  // Record this URL in our cache when the component mounts
  useEffect(() => {
    if (src && !noSource) {
      cacheImage(src);
      setCurrentSrc(src);
      setRetryCount(0);
    }
  }, [src, noSource]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    // For Harvard Museum images, try to construct a fallback IIIF URL if possible
    if (retryCount === 0 && currentSrc.includes('harvardartmuseums') && !currentSrc.includes('iiif')) {
      // Extract ID from the URL to try and build an IIIF URL
      const matches = currentSrc.match(/ids\/([^/]+)/);
      if (matches && matches[1]) {
        const harvestId = matches[1];
        const iiifUrl = `https://ids.lib.harvard.edu/ids/iiif/${harvestId}/full/!800,800/0/default.jpg`;
        setCurrentSrc(iiifUrl);
        setRetryCount(1);
        return;
      }
    }
    
    // Default error handling if we can't retry or already tried
    setLoading(false);
    setError(true);
  };

  // Default placeholder - a very light gray background
  const defaultPlaceholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';
  
  // The image-not-available fallback image
  const noImageFallback = '/images/image-not-available.jpg';

  return (
    <Box 
      position="relative"
      sx={{ 
        width, 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: theme.palette.grey[100],
        ...sx
      }}
    >
      {loading && !noSource && (
        <Box 
          position="absolute" 
          top="50%" 
          left="50%" 
          sx={{ transform: 'translate(-50%, -50%)' }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
      
      {!noSource && (
        <LazyLoadImage
          src={currentSrc}
          alt={alt}
          effect={effect}
          height={height}
          width={width}
          threshold={threshold}
          className={className}
          style={{ ...style, display: error ? 'none' : 'block' }}
          placeholderSrc={placeholderSrc || defaultPlaceholder}
          wrapperProps={wrapperProps}
          onLoad={handleLoad}
          onError={handleError}
          visibleByDefault={false}
          // Add these props to enhance caching
          afterLoad={() => {
            // This gets called after the image is loaded
            setLoading(false);
          }}
          beforeLoad={() => {
            // This gets called before the image starts loading
            setLoading(true);
          }}
        />
      )}
      
      {(error || noSource) && (
        <img
          src={noImageFallback}
          alt={alt || 'Image not available'}
          style={{
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            objectFit: 'contain',
            ...style
          }}
          className={className}
        />
      )}
    </Box>
  );
};

export default CachedImage; 