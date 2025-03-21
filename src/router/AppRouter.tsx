import React from 'react';
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Outlet } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import ArtworksPage from '../pages/ArtworksPage';
import ArtworkDetailPage from '../pages/ArtworkDetailPage';
import ExhibitionsPage from '../pages/ExhibitionsPage';
import Header from '../components/Header/Header';
import Box from '@mui/material/Box';
import ThemeProvider from '../theme/ThemeProvider';
import Typography from '@mui/material/Typography';
import { artworksLoader, artworkDetailLoader } from './routeGuards';
import NotFoundPage from '../pages/NotFoundPage';
import ErrorBoundary from '../components/ErrorBoundary';

// Layout component that includes the header and footer
const AppLayout = () => {
  return (
    <ThemeProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
        <Box 
          component="footer" 
          sx={{ 
            py: 3, 
            px: 2, 
            mt: 'auto', 
            backgroundColor: (theme) => theme.palette.primary.main,
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} ArtE Collections. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

// Create the router with data loaders
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route 
      path="/"
      element={<AppLayout />}
      errorElement={
        <ThemeProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <NotFoundPage />
            <Box 
              component="footer" 
              sx={{ 
                py: 3, 
                px: 2, 
                mt: 'auto', 
                backgroundColor: (theme) => theme.palette.primary.main,
                color: 'white',
                textAlign: 'center'
              }}
            >
              <Typography variant="body2">
                © {new Date().getFullYear()} ArtE Collections. All rights reserved.
              </Typography>
            </Box>
          </Box>
        </ThemeProvider>
      }
    >
      <Route index element={<HomePage />} />
      <Route 
        path="artworks" 
        element={<ArtworksPage />} 
        loader={artworksLoader}
      />
      <Route 
        path="artworks/:id" 
        element={<ArtworkDetailPage />} 
        loader={artworkDetailLoader}
      />
      <Route path="exhibitions" element={<ExhibitionsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  )
);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter; 