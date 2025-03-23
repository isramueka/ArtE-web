import React from 'react';
import { Container, Typography, Paper, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

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
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => navigate('/artworks')}
            >
              Browse Collections
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              size="large"
              onClick={() => navigate('/exhibitions')}
            >
              My Exhibitions
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default HomePage; 