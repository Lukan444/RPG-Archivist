import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Public as PublicIcon,
  Campaign as CampaignIcon,
  Event as EventIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Feature cards data
  const features = [
    {
      title: 'RPG Worlds',
      description: 'Create and manage your RPG worlds with detailed information.',
      icon: <PublicIcon fontSize= large />,
      link: '/rpg-worlds',
    },
    {
      title: 'Campaigns',
      description: 'Organize your campaigns and track progress across sessions.',
      icon: <CampaignIcon fontSize=large />,
      link: '/campaigns',
    },
    {
      title: 'Sessions',
      description: 'Record and manage your gaming sessions with detailed notes.',
      icon: <EventIcon fontSize=large />,
      link: '/sessions',
    },
    {
      title: 'Characters',
      description: 'Create and track characters, NPCs, and their relationships.',
      icon: <PersonIcon fontSize=large />,
      link: '/characters',
    },
    {
      title: 'Locations',
      description: 'Map out the locations in your world with detailed descriptions.',
      icon: <LocationOnIcon fontSize=large />,
      link: '/locations',
    },
    {
      title: 'Dashboard',
      description: 'Get an overview of your campaigns, sessions, and recent activity.',
      icon: <DashboardIcon fontSize=large />,
      link: '/dashboard',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        pt: 8,
        pb: 6,
      }}
    >
      <Container maxWidth=lg>
        {/* Hero Section */}
        <Box
          sx={{
            textAlign: 'center',
            mb: 6,
          }}
        >
          <Typography
            component=h1
            variant=h2
            color=primary
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            RPG Archivist
          </Typography>
          <Typography
            variant=h5
            color=text.secondary
            paragraph
            sx={{
              mb: 4,
              maxWidth: '800px',
              mx: 'auto',
            }}
          >
            Your ultimate tool for managing tabletop RPG campaigns, characters, locations, and more.
            Record sessions, create mind maps, and let the AI Brain help you organize your world.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant=contained
              size=large
              component={RouterLink}
              to=/dashboard
              sx={{ minWidth: '180px' }}
            >
              Go to Dashboard
            </Button>
            <Button
              variant=outlined
              size=large
              component={RouterLink}
              to=/campaigns
              sx={{ minWidth: '180px' }}
            >
              View Campaigns
            </Button>
          </Box>
        </Box>

        {/* Features Section */}
        <Typography
          variant=h4
          component=h2
          align=center
          gutterBottom
          sx={{ mb: 4, fontWeight: 600 }}
        >
          Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6,
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    color: 'primary.main',
                  }}
                >
                  {feature.icon}
                  <Typography variant=h6 component=h3 sx={{ ml: 1 }}>
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant=body1 color=text.secondary sx={{ mb: 2, flexGrow: 1 }}>
                  {feature.description}
                </Typography>
                <Button
                  component={RouterLink}
                  to={feature.link}
                  color=primary
                  sx={{ alignSelf: 'flex-start', mt: 'auto' }}
                >
                  Explore
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
