import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  Switch,
  Button,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

const NotificationSettings: React.FC = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Notification Settings
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Email Notifications
        </Typography>

        <List>
          <ListItem disablePadding>
            <ListItemText
              primary="Campaign Updates"
              secondary="Receive notifications about campaign updates"
            />
            <FormControlLabel
              control={<Switch disabled />}
              label=""
            />
          </ListItem>

          <Divider component="li" />

          <ListItem disablePadding>
            <ListItemText
              primary="Session Reminders"
              secondary="Receive reminders about upcoming sessions"
            />
            <FormControlLabel
              control={<Switch disabled />}
              label=""
            />
          </ListItem>

          <Divider component="li" />

          <ListItem disablePadding>
            <ListItemText
              primary="Content Analysis"
              secondary="Receive notifications about new content analysis results"
            />
            <FormControlLabel
              control={<Switch disabled />}
              label=""
            />
          </ListItem>

          <Divider component="li" />

          <ListItem disablePadding>
            <ListItemText
              primary="Proposal Updates"
              secondary="Receive notifications about proposal status changes"
            />
            <FormControlLabel
              control={<Switch disabled />}
              label=""
            />
          </ListItem>
        </List>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
          In-App Notifications
        </Typography>

        <List>
          <ListItem disablePadding>
            <ListItemText
              primary="Campaign Updates"
              secondary="Receive notifications about campaign updates"
            />
            <FormControlLabel
              control={<Switch disabled />}
              label=""
            />
          </ListItem>

          <Divider component="li" />

          <ListItem disablePadding>
            <ListItemText
              primary="Session Reminders"
              secondary="Receive reminders about upcoming sessions"
            />
            <FormControlLabel
              control={<Switch disabled />}
              label=""
            />
          </ListItem>

          <Divider component="li" />

          <ListItem disablePadding>
            <ListItemText
              primary="Content Analysis"
              secondary="Receive notifications about new content analysis results"
            />
            <FormControlLabel
              control={<Switch disabled />}
              label=""
            />
          </ListItem>

          <Divider component="li" />

          <ListItem disablePadding>
            <ListItemText
              primary="Proposal Updates"
              secondary="Receive notifications about proposal status changes"
            />
            <FormControlLabel
              control={<Switch disabled />}
              label=""
            />
          </ListItem>
        </List>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" disabled>
            Save Changes
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default NotificationSettings;
