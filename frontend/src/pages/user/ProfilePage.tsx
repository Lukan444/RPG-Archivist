import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Avatar,
  Button,
  Divider,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Skeleton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarTodayIcon,
  Campaign as CampaignIcon,
  Event as EventIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { PageHeader } from '../../components/ui';

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role= tabpanel
      hidden={value !== index}
      id={profile-tabpanel-}
      aria-labelledby={profile-tab-}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // State for profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    bio: '',
  });
  
  // State for success/error messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // Mock data for statistics
  const userStats = {
    campaignsCount: 5,
    sessionsCount: 23,
    charactersCount: 42,
    locationsCount: 18,
    transcriptionsCount: 15,
    brainQueriesCount: 37,
    joinDate: new Date(2023, 0, 15).toLocaleDateString(),
    lastActive: new Date().toLocaleDateString(),
  };
  
  // Initialize profile data from user
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        bio: 'RPG enthusiast and Dungeon Master extraordinaire.',
      });
    }
  }, [user]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle edit mode toggle
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    
    // Reset form data if canceling edit
    if (isEditing && user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        bio: 'RPG enthusiast and Dungeon Master extraordinaire.',
      });
    }
  };
  
  // Handle profile data change
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };
  
  // Handle profile save
  const handleProfileSave = async () => {
    try {
      // TODO: Implement API call to update profile
      console.log('Saving profile:', profileData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      setSuccessMessage('Profile updated successfully');
      
      // Exit edit mode
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Failed to update profile. Please try again.');
    }
  };
  
  // Handle success message close
  const handleSuccessClose = () => {
    setSuccessMessage(null);
  };
  
  // Handle error message close
  const handleErrorClose = () => {
    setErrorMessage(null);
  };
  
  // If user is not loaded yet, show skeleton
  if (!user) {
    return (
      <Container maxWidth=lg>
        <PageHeader
          title=User Profile
          subtitle=View and manage your profile information
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Profile' },
          ]}
        />
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Skeleton variant=circular width={150} height={150} />
              <Skeleton variant=text width={150} height={40} sx={{ mt: 2 }} />
              <Skeleton variant=text width={200} height={30} />
            </Grid>
            <Grid item xs={12} md={8}>
              <Skeleton variant=text width=40% height={40} />
              <Skeleton variant=text width=100% height={30} sx={{ mt: 2 }} />
              <Skeleton variant=text width=100% height={30} />
              <Skeleton variant=text width=100% height={30} />
              <Skeleton variant=text width=60% height={30} />
            </Grid>
          </Grid>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth=lg>
      <PageHeader
        title=User Profile
        subtitle=View and manage your profile information
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Profile' },
        ]}
        action={
          isEditing ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant=outlined
                color=inherit
                startIcon={<CancelIcon />}
                onClick={handleEditToggle}
              >
                Cancel
              </Button>
              <Button
                variant=contained
                color=primary
                startIcon={<SaveIcon />}
                onClick={handleProfileSave}
              >
                Save
              </Button>
            </Box>
          ) : (
            <Button
              variant=contained
              color=primary
              startIcon={<EditIcon />}
              onClick={handleEditToggle}
            >
              Edit Profile
            </Button>
          )
        }
      />
      
      {/* Success message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleSuccessClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSuccessClose} severity=success sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
      
      {/* Error message */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleErrorClose} severity=error sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      
      {/* Profile content */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Profile sidebar */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 150,
                height: 150,
                fontSize: 64,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                mb: 2,
              }}
            >
              {profileData.username.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant=h5 gutterBottom>
              {profileData.username}
            </Typography>
            <Typography variant=body2 color=text.secondary gutterBottom>
              {profileData.email}
            </Typography>
            <Box sx={{ mt: 2, width: '100%' }}>
              <Card variant=outlined sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant=subtitle2 color=text.secondary gutterBottom>
                    Member Since
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarTodayIcon fontSize=small sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant=body2>{userStats.joinDate}</Typography>
                  </Box>
                </CardContent>
              </Card>
              <Card variant=outlined>
                <CardContent>
                  <Typography variant=subtitle2 color=text.secondary gutterBottom>
                    Activity Stats
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CampaignIcon fontSize=small sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant=body2>{userStats.campaignsCount} Campaigns</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EventIcon fontSize=small sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant=body2>{userStats.sessionsCount} Sessions</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon fontSize=small sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant=body2>{userStats.charactersCount} Characters</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PsychologyIcon fontSize=small sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant=body2>{userStats.brainQueriesCount} Brain Queries</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          
          {/* Profile main content */}
          <Grid item xs={12} md={8}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label=profile tabs>
                <Tab label=Profile Information id=profile-tab-0 aria-controls=profile-tabpanel-0 />
                <Tab label=Account Settings id=profile-tab-1 aria-controls=profile-tabpanel-1 />
                <Tab label=Activity id=profile-tab-2 aria-controls=profile-tabpanel-2 />
              </Tabs>
            </Box>
            
            {/* Profile Information Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant=subtitle2 color=text.secondary gutterBottom>
                    Username
                  </Typography>
                  {isEditing ? (
                    <TextField
                      name=username
                      value={profileData.username}
                      onChange={handleProfileChange}
                      fullWidth
                      variant=outlined
                      size=small
                      InputProps={{
                        startAdornment: (
                          <PersonIcon color=action sx={{ mr: 1 }} />
                        ),
                      }}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon color=action sx={{ mr: 1 }} />
                      <Typography variant=body1>{profileData.username}</Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant=subtitle2 color=text.secondary gutterBottom>
                    Email
                  </Typography>
                  {isEditing ? (
                    <TextField
                      name=email
                      value={profileData.email}
                      onChange={handleProfileChange}
                      fullWidth
                      variant=outlined
                      size=small
                      InputProps={{
                        startAdornment: (
                          <EmailIcon color=action sx={{ mr: 1 }} />
                        ),
                      }}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon color=action sx={{ mr: 1 }} />
                      <Typography variant=body1>{profileData.email}</Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant=subtitle2 color=text.secondary gutterBottom>
                    Bio
                  </Typography>
                  {isEditing ? (
                    <TextField
                      name=bio
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      fullWidth
                      variant=outlined
                      size=small
                      multiline
                      rows={4}
                    />
                  ) : (
                    <Typography variant=body1>{profileData.bio}</Typography>
                  )}
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Account Settings Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ mb: 3 }}>
                <Typography variant=h6 gutterBottom>
                  Password
                </Typography>
                <Typography variant=body2 color=text.secondary paragraph>
                  Change your password to keep your account secure.
                </Typography>
                <Button
                  variant=outlined
                  color=primary
                  onClick={() => navigate('/reset-password')}
                >
                  Change Password
                </Button>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant=h6 gutterBottom>
                  Account Deletion
                </Typography>
                <Typography variant=body2 color=text.secondary paragraph>
                  Permanently delete your account and all associated data. This action cannot be undone.
                </Typography>
                <Button
                  variant=outlined
                  color=error
                >
                  Delete Account
                </Button>
              </Box>
            </TabPanel>
            
            {/* Activity Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant=h6 gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant=body2 color=text.secondary paragraph>
                Your recent activity will be displayed here.
              </Typography>
              
              {/* Placeholder for activity feed */}
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant=body2 color=text.secondary align=center>
                  No recent activity to display.
                </Typography>
              </Box>
            </TabPanel>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
