import React, { useState } from 'react';
import { 
  Box, 
  IconButton, 
  Tooltip, 
  Menu, 
  MenuItem, 
  Snackbar,
  Typography
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import {
  getTwitterShareUrl,
  getFacebookShareUrl,
  getLinkedInShareUrl,
  openShareWindow
} from '../../utils/socialShareUtils';

interface SocialShareProps {
  url: string;
  title: string;
  variant?: 'icon' | 'menu';
  iconColor?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ 
  url, 
  title, 
  variant = 'menu',
  iconColor = 'primary'
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleShareClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setSnackbarMessage('Link copied to clipboard!');
        setSnackbarOpen(true);
        handleClose();
      })
      .catch(err => {
        setSnackbarMessage('Failed to copy link');
        setSnackbarOpen(true);
        console.error('Could not copy text: ', err);
      });
  };

  const handleTwitterShare = () => {
    openShareWindow(getTwitterShareUrl(url, title));
    handleClose();
  };

  const handleFacebookShare = () => {
    openShareWindow(getFacebookShareUrl(url));
    handleClose();
  };

  const handleLinkedInShare = () => {
    openShareWindow(getLinkedInShareUrl(url, title));
    handleClose();
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      {variant === 'menu' ? (
        <>
          <Tooltip title="Share">
            <IconButton 
              onClick={handleShareClick} 
              color={iconColor as any}
              aria-label="share"
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>
          <Menu
            id="share-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleCopyLink}>
              <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">Copy Link</Typography>
            </MenuItem>
            <MenuItem onClick={handleTwitterShare}>
              <TwitterIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">Share on Twitter</Typography>
            </MenuItem>
            <MenuItem onClick={handleFacebookShare}>
              <FacebookIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">Share on Facebook</Typography>
            </MenuItem>
            <MenuItem onClick={handleLinkedInShare}>
              <LinkedInIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">Share on LinkedIn</Typography>
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Copy Link">
            <IconButton onClick={handleCopyLink} size="small" color={iconColor as any}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share on Twitter">
            <IconButton onClick={handleTwitterShare} size="small" color={iconColor as any}>
              <TwitterIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share on Facebook">
            <IconButton onClick={handleFacebookShare} size="small" color={iconColor as any}>
              <FacebookIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share on LinkedIn">
            <IconButton onClick={handleLinkedInShare} size="small" color={iconColor as any}>
              <LinkedInIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </>
  );
};

export default SocialShare; 