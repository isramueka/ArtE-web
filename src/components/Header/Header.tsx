import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText,
  ListItemButton,
  Container,
  useMediaQuery,
  useTheme,
  Link
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CollectionsIcon from '@mui/icons-material/Collections';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Artworks', path: '/artworks' },
  { name: 'Exhibitions', path: '/exhibitions' }
];

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <CollectionsIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div">
          ArtE
        </Typography>
      </Box>
      <List>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                        (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <ListItem key={item.name} disablePadding>
              <ListItemButton 
                component={RouterLink} 
                to={item.path}
                sx={{ 
                  textAlign: 'center',
                  color: isActive ? 'primary.main' : 'text.primary',
                  fontWeight: isActive ? 'bold' : 'normal'
                }}
              >
                <ListItemText primary={item.name} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo and site name */}
            <Box 
              component={RouterLink} 
              to="/"
              sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                alignItems: 'center',
                textDecoration: 'none'
              }}
            >
              <CollectionsIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  mr: 2,
                  fontWeight: 700,
                  color: 'primary.main',
                  textDecoration: 'none',
                }}
              >
                ArtE
              </Typography>
            </Box>

            {/* Mobile menu icon */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1 }}>
              <IconButton
                size="large"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ color: 'primary.main' }}
              >
                <MenuIcon />
              </IconButton>
              <Box 
                component={RouterLink} 
                to="/"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  textDecoration: 'none'
                }}
              >
                <CollectionsIcon sx={{ color: 'primary.main', ml: -1, mr: 0.5 }} />
                <Typography
                  variant="h6"
                  noWrap
                  component="div"
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                  }}
                >
                  ArtE
                </Typography>
              </Box>
            </Box>

            {/* Desktop navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path));
                          
                return (
                  <Button
                    key={item.name}
                    component={RouterLink}
                    to={item.path}
                    sx={{ 
                      my: 2, 
                      mx: 1.5,
                      color: isActive ? 'primary.main' : 'text.primary', 
                      display: 'block',
                      fontWeight: isActive ? 'bold' : 'normal',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {item.name}
                  </Button>
                );
              })}
            </Box>

            {/* Right-aligned action button */}
            <Box sx={{ flexGrow: 0 }}>
              <Button 
                variant="contained" 
                color="secondary" 
                sx={{ 
                  display: { xs: 'none', md: 'block' },
                  px: 3,
                }}
              >
                Login
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile navigation drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header; 