import React from 'react';
import { Container, Typography, Paper, Box, Button, Grid } from '@mui/material';

const HomePage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 6 }, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            backgroundColor: 'transparent'
          }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            Discover the World of Art
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary" 
            align="center" 
            paragraph
            sx={{ maxWidth: 800, mb: 4 }}
          >
            Explore curated collections from renowned galleries and artists from around the globe.
            Immerse yourself in a journey through various art movements, styles, and cultures.
          </Typography>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="contained" color="primary" size="large">
              Browse Collections
            </Button>
            <Button variant="outlined" color="primary" size="large">
              Featured Artists
            </Button>
          </Box>
        </Paper>
        
        <Grid container spacing={4} sx={{ mt: 6 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Latest Exhibitions
              </Typography>
              <Typography variant="body1" paragraph>
                Discover our newest curated exhibitions featuring contemporary artists and classical masterpieces.
              </Typography>
              <Button variant="text" color="primary">Learn more</Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Popular Collections
              </Typography>
              <Typography variant="body1" paragraph>
                Browse through our most popular art collections and discover why they've captured attention worldwide.
              </Typography>
              <Button variant="text" color="primary">View collections</Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Artists Spotlight
              </Typography>
              <Typography variant="body1" paragraph>
                Learn about featured artists, their inspirations, techniques, and contributions to the art world.
              </Typography>
              <Button variant="text" color="primary">Meet the artists</Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage; 