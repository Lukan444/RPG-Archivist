import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Divider,
  Grid,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Email as EmailIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Link as LinkIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { GraphQueryParams } from '../../../services/api/graph.service';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`share-tabpanel-${index}`}
      aria-labelledby={`share-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  graphParams: GraphQueryParams;
  currentUrl: string;
}

/**
 * Dialog for sharing mind map
 */
const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onClose,
  graphParams,
  currentUrl
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [shareUrl, setShareUrl] = useState('');
  const [includeFilters, setIncludeFilters] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('Check out this Mind Map');
  const [emailBody, setEmailBody] = useState('I thought you might find this mind map interesting:');

  // Generate share URL when dialog opens or parameters change
  useEffect(() => {
    if (open) {
      generateShareUrl();
    }
  }, [open, graphParams, includeFilters]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Generate shareable URL
  const generateShareUrl = () => {
    try {
      // Start with the base URL
      const url = new URL(currentUrl);

      // Clear existing query parameters
      url.search = '';

      // Add entity ID parameters
      if (graphParams.worldId) url.searchParams.append('worldId', graphParams.worldId);
      if (graphParams.campaignId) url.searchParams.append('campaignId', graphParams.campaignId);
      if (graphParams.sessionId) url.searchParams.append('sessionId', graphParams.sessionId);
      if (graphParams.characterId) url.searchParams.append('characterId', graphParams.characterId);
      if (graphParams.locationId) url.searchParams.append('locationId', graphParams.locationId);
      if (graphParams.itemId) url.searchParams.append('itemId', graphParams.itemId);
      if (graphParams.eventId) url.searchParams.append('eventId', graphParams.eventId);
      if (graphParams.powerId) url.searchParams.append('powerId', graphParams.powerId);

      // Add filter parameters if includeFilters is true
      if (includeFilters) {
        if (graphParams.depth) url.searchParams.append('depth', graphParams.depth.toString());
        if (graphParams.nodeTypes) url.searchParams.append('nodeTypes', graphParams.nodeTypes.join(','));
        if (graphParams.edgeTypes) url.searchParams.append('edgeTypes', graphParams.edgeTypes.join(','));
        if (graphParams.layout) url.searchParams.append('layout', graphParams.layout);
        if (graphParams.includeImages !== undefined) url.searchParams.append('includeImages', graphParams.includeImages.toString());
      }

      // Set the share URL
      setShareUrl(url.toString());
    } catch (error) {
      console.error('Error generating share URL:', error);
      setError('Failed to generate share URL. Please try again.');
    }
  };

  // Copy URL to clipboard
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy URL:', err);
        setError('Failed to copy URL to clipboard. Please try again.');
      });
  };

  // Share via email
  const handleEmailShare = () => {
    try {
      const mailtoUrl = `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(`${emailBody}\n\n${shareUrl}`)}`;
      window.open(mailtoUrl, '_blank');
    } catch (error) {
      console.error('Error sharing via email:', error);
      setError('Failed to open email client. Please try again.');
    }
  };

  // Share via social media
  const handleSocialShare = (platform: 'facebook' | 'twitter' | 'linkedin') => {
    try {
      let socialShareUrl: string;

      switch (platform) {
        case 'facebook':
          socialShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
          break;
        case 'twitter':
          socialShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out this Mind Map from RPG Archivist')}`;
          break;
        case 'linkedin':
          socialShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
          break;
        default:
          throw new Error('Invalid platform');
      }

      window.open(socialShareUrl, '_blank', 'width=600,height=400');
    } catch (error) {
      console.error(`Error sharing via ${platform}:`, error);
      setError(`Failed to share via ${platform}. Please try again.`);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <ShareIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Share Mind Map</Typography>
          </Box>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Tabs value={tabValue} onChange={handleTabChange} aria-label="share tabs">
          <Tab label="Link" id="share-tab-0" aria-controls="share-tabpanel-0" />
          <Tab label="Email" id="share-tab-1" aria-controls="share-tabpanel-1" />
          <Tab label="Social" id="share-tab-2" aria-controls="share-tabpanel-2" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Share this link to give others access to this mind map
            </Typography>

            <TextField
              fullWidth
              variant="outlined"
              value={shareUrl}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Tooltip title="Copy link">
                    <IconButton edge="end" onClick={handleCopyUrl}>
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={includeFilters}
                  onChange={(e) => setIncludeFilters(e.target.checked)}
                  color="primary"
                />
              }
              label="Include current filters and settings"
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="To"
                variant="outlined"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="recipient@example.com"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                variant="outlined"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                variant="outlined"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EmailIcon />}
                onClick={handleEmailShare}
                disabled={!emailTo}
                fullWidth
              >
                Send Email
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="subtitle1" gutterBottom>
            Share on social media
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FacebookIcon />}
                onClick={() => handleSocialShare('facebook')}
                fullWidth
                sx={{ bgcolor: '#3b5998' }}
              >
                Facebook
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<TwitterIcon />}
                onClick={() => handleSocialShare('twitter')}
                fullWidth
                sx={{ bgcolor: '#1da1f2' }}
              >
                Twitter
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<LinkedInIcon />}
                onClick={() => handleSocialShare('linkedin')}
                fullWidth
                sx={{ bgcolor: '#0077b5' }}
              >
                LinkedIn
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>

      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        message="Link copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Dialog>
  );
};

export default ShareDialog;
