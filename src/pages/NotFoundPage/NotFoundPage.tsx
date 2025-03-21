import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const NotFoundPage: React.FC = () => {
  return (
    <Container sx={{ mt: 4, textAlign: 'center' }}>
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          404 - Page Not Found
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          The page you are looking for does not exist.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to="/"
        >
          Return to Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage; 