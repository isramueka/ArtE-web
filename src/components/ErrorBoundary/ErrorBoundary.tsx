import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Typography, Button, Alert, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md">
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Something went wrong
              </Typography>
              <Typography variant="body2">
                {this.state.error?.message || 'An unexpected error occurred'}
              </Typography>
            </Alert>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<HomeIcon />}
              component={RouterLink}
              to="/"
              sx={{ mt: 2 }}
            >
              Return to Home Page
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 