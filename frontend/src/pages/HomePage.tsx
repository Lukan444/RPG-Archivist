import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  CardMedia,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Public as PublicIcon,
  Campaign as CampaignIcon,
  Event as EventIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  Psychology as PsychologyIcon,
  AutoStories as AutoStoriesIcon,
  Explore as ExploreIcon,
  Insights as InsightsIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  School as SchoolIcon,
  NewReleases as NewReleasesIcon,
  Help as HelpIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import {
  Logo,
  HeroBackground,
  WorldsImage,
  CampaignsImage,
  SessionsImage,
  CharactersImage,
  LocationsImage,
  BrainImage
} from '../assets';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated, user } = useAuth();

  // State for loading features
  const [featuresLoaded, setFeaturesLoaded] = useState(false);

  // Simulate loading features
  useEffect(() => {
    const timer = setTimeout(() => {
      setFeaturesLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Feature cards data
  const features = [
    {
      title: 'RPG Worlds',
      description: 'Create immersive worlds with rich lore, history, and cultures. Define the rules and physics of your universe.',
      icon: <PublicIcon fontSize="large" />,
      link: '/rpg-worlds',
      color: '#3f51b5',
      image: WorldsImage,
      benefits: [
        'Create multiple worlds with unique rules',
        'Define custom attributes and properties',
        'Link worlds in a multiverse structure',
        'Import existing world templates'
      ]
    },
    {
      title: 'Campaigns',
      description: 'Organize epic campaigns with interconnected storylines. Track progress, manage plot threads, and plan future sessions.',
      icon: <CampaignIcon fontSize="large" />,
      link: '/campaigns',
      color: '#f50057',
      image: CampaignsImage,
      benefits: [
        'Track campaign progress and milestones',
        'Manage multiple storylines and plot threads',
        'Schedule and plan future sessions',
        'Share campaign details with players'
      ]
    },
    {
      title: 'Sessions',
      description: 'Record detailed session notes with automatic transcription. Highlight key moments and decisions that shape your story.',
      icon: <EventIcon fontSize="large" />,
      link: '/sessions',
      color: '#4caf50',
      image: SessionsImage,
      benefits: [
        'Automatic audio transcription',
        'AI-powered session summaries',
        'Track key decisions and turning points',
        'Link sessions to characters and locations'
      ]
    },
    {
      title: 'Characters',
      description: 'Develop complex characters with detailed backstories, motivations, and relationships. Track character development over time.',
      icon: <PersonIcon fontSize="large" />,
      link: '/characters',
      color: '#ff9800',
      image: CharactersImage,
      benefits: [
        'Create detailed character sheets',
        'Track character development and growth',
        'Manage complex relationships',
        'Generate character portraits with AI'
      ]
    },
    {
      title: 'Locations',
      description: 'Create detailed maps and locations with rich descriptions. Connect locations to events and characters in your world.',
      icon: <LocationOnIcon fontSize="large" />,
      link: '/locations',
      color: '#2196f3',
      image: LocationsImage,
      benefits: [
        'Build hierarchical location structures',
        'Create interactive maps',
        'Link locations to events and characters',
        'Generate location descriptions with AI'
      ]
    },
    {
      title: 'AI Brain',
      description: 'Let our AI assistant help you generate ideas, analyze sessions, and maintain consistency in your world-building.',
      icon: <PsychologyIcon fontSize="large" />,
      link: '/brain',
      color: '#9c27b0',
      image: BrainImage,
      benefits: [
        'Generate creative ideas and plot hooks',
        'Analyze session transcripts for key events',
        'Maintain consistency in your world',
        'Get personalized storytelling assistance'
      ]
    },
  ];

  // State for expanded feature details
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  // Toggle expanded feature
  const toggleFeatureExpand = (index: number) => {
    setExpandedFeature(expandedFeature === index ? null : index);
  };

  // Mock recent activity data
  const recentActivity = [
    {
      id: 1,
      type: 'session',
      title: 'The Dark Forest Encounter',
      campaign: 'Shadows of Amber',
      date: '2 hours ago',
    },
    {
      id: 2,
      type: 'character',
      title: 'Elara Nightshade',
      campaign: 'Shadows of Amber',
      date: '1 day ago',
    },
    {
      id: 3,
      type: 'location',
      title: 'Castle Blackspire',
      campaign: 'Shadows of Amber',
      date: '3 days ago',
    },
  ];

  // Benefits list
  const benefits = [
    {
      title: 'Streamlined Campaign Management',
      description: 'Keep all your campaign information organized in one place',
      icon: <CheckCircleIcon color="success" />,
    },
    {
      title: 'AI-Powered Storytelling',
      description: 'Get intelligent suggestions and analysis for your campaigns',
      icon: <CheckCircleIcon color="success" />,
    },
    {
      title: 'Session Transcription',
      description: 'Automatically transcribe and analyze your gaming sessions',
      icon: <CheckCircleIcon color="success" />,
    },
    {
      title: 'Relationship Mapping',
      description: 'Visualize connections between characters, locations, and events',
      icon: <CheckCircleIcon color="success" />,
    },
  ];

  // What's New section
  const whatsNew = [
    {
      title: 'AI-Powered Character Portraits',
      description: 'Generate custom character portraits using our new AI image generation feature.',
      date: 'April 2025',
      icon: <PersonIcon />,
      color: '#ff9800',
    },
    {
      title: 'Interactive World Maps',
      description: 'Create and share interactive maps with custom markers, regions, and notes.',
      date: 'March 2025',
      icon: <PublicIcon />,
      color: '#3f51b5',
    },
    {
      title: 'Enhanced Session Transcription',
      description: 'Our improved transcription engine now supports multiple speakers and languages.',
      date: 'February 2025',
      icon: <EventIcon />,
      color: '#4caf50',
    },
  ];

  // Getting Started steps
  const gettingStartedSteps = [
    {
      label: 'Create Your First World',
      description: 'Start by creating a world to house your campaigns. Define the basic rules and setting.',
      link: '/rpg-worlds/create',
      icon: <PublicIcon color="primary" />,
    },
    {
      label: 'Start a Campaign',
      description: 'Create a new campaign within your world. Set the theme, starting location, and initial plot hooks.',
      link: '/campaigns/create',
      icon: <CampaignIcon color="secondary" />,
    },
    {
      label: 'Add Characters',
      description: 'Create the main characters for your campaign, including player characters and important NPCs.',
      link: '/characters/create',
      icon: <PersonIcon style={{ color: '#ff9800' }} />,
    },
    {
      label: 'Record Your First Session',
      description: 'Use our session recording and transcription tools to document your first game session.',
      link: '/sessions/create',
      icon: <EventIcon style={{ color: '#4caf50' }} />,
    },
  ];

  // Testimonials
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Dungeon Master',
      avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
      text: 'RPG Archivist has transformed how I run my campaigns. The AI Brain helps me maintain consistency and come up with creative ideas on the fly.',
      game: 'D&D 5th Edition',
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Player',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      text: 'As a player, I love being able to review past sessions and keep track of our adventures. The character development tools are amazing!',
      game: 'Pathfinder',
    },
    {
      id: 3,
      name: 'Alex Rodriguez',
      role: 'Game Designer',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      text: 'The world-building features in RPG Archivist have helped me design more cohesive and immersive game settings. Highly recommended!',
      game: 'Amber Diceless',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${HeroBackground}) no-repeat center center`,
          backgroundSize: 'cover',
          color: 'white',
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 16 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.4) 0%, rgba(156, 39, 176, 0.4) 100%)',
            zIndex: 0,
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in={true} timeout={1000}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Zoom in={true} timeout={800}>
                    <Box component="img" src={Logo} alt="RPG Archivist Logo" sx={{
                      width: { xs: 50, md: 70 },
                      height: { xs: 50, md: 70 },
                      mr: 2,
                      filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))'
                    }} />
                  </Zoom>
                  <Typography
                    component="h1"
                    variant="h2"
                    gutterBottom
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '2.5rem', md: '3.75rem' },
                      m: 0,
                      background: 'linear-gradient(90deg, #ffffff 0%, #e0e0ff 100%)',
                      backgroundClip: 'text',
                      textFillColor: 'transparent',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 20px rgba(63, 81, 181, 0.5)',
                    }}
                  >
                    RPG Archivist
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  paragraph
                  sx={{
                    mb: 4,
                    maxWidth: '800px',
                    fontWeight: 300,
                    lineHeight: 1.6,
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  Your ultimate tool for managing tabletop RPG campaigns, characters, locations, and more.
                  Record sessions, create mind maps, and let the AI Brain help you organize your world.
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    mb: 4,
                  }}
                >
                  {isAuthenticated ? (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        component={RouterLink}
                        to="/dashboard"
                        sx={{
                          minWidth: '180px',
                          bgcolor: 'white',
                          color: 'primary.main',
                          fontWeight: 600,
                          py: 1.5,
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                        endIcon={<ArrowForwardIcon />}
                      >
                        Go to Dashboard
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        component={RouterLink}
                        to="/campaigns"
                        sx={{
                          minWidth: '180px',
                          borderColor: 'white',
                          borderWidth: 2,
                          color: 'white',
                          fontWeight: 600,
                          py: 1.4,
                          '&:hover': {
                            borderColor: 'white',
                            borderWidth: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        View Campaigns
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        component={RouterLink}
                        to="/register"
                        sx={{
                          minWidth: '180px',
                          bgcolor: 'white',
                          color: 'primary.main',
                          fontWeight: 600,
                          py: 1.5,
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                        endIcon={<ArrowForwardIcon />}
                      >
                        Get Started
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        component={RouterLink}
                        to="/login"
                        sx={{
                          minWidth: '180px',
                          borderColor: 'white',
                          borderWidth: 2,
                          color: 'white',
                          fontWeight: 600,
                          py: 1.4,
                          '&:hover': {
                            borderColor: 'white',
                            borderWidth: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        Login
                      </Button>
                    </>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {['Tabletop RPG', 'Campaign Management', 'AI-Powered', 'Session Tracking', 'World Building'].map((tag, index) => (
                    <Fade in={true} style={{ transitionDelay: `${index * 100}ms` }} key={tag}>
                      <Chip
                        label={tag}
                        size="medium"
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.15)',
                          color: 'white',
                          backdropFilter: 'blur(4px)',
                          '& .MuiChip-label': { fontWeight: 500, px: 1.5, py: 0.5 },
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                        }}
                      />
                    </Fade>
                  ))}
                </Box>
              </Grid>
              {!isMobile && (
                <Grid item md={5}>
                  <Zoom in={true} timeout={1000} style={{ transitionDelay: '300ms' }}>
                    <Box
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 4,
                        p: 3,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        transform: 'perspective(1000px) rotateY(-5deg)',
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'perspective(1000px) rotateY(0deg)',
                        },
                      }}
                    >
                      <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 600 }}>
                        Why RPG Archivist?
                      </Typography>
                      <List>
                        {benefits.map((benefit, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              {benefit.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={benefit.title}
                              secondary={benefit.description}
                              primaryTypographyProps={{ fontWeight: 600, color: 'white' }}
                              secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.8)' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                      <Alert
                        severity="info"
                        icon={<LightbulbIcon />}
                        sx={{
                          mt: 2,
                          bgcolor: 'rgba(41, 121, 255, 0.1)',
                          color: 'white',
                          '& .MuiAlert-icon': { color: 'white' }
                        }}
                      >
                        <Typography variant="body2">
                          RPG Archivist is designed for the Amber RPG system but works with any tabletop RPG!
                        </Typography>
                      </Alert>
                    </Box>
                  </Zoom>
                </Grid>
              )}
            </Grid>
          </Fade>
        </Container>
      </Box>

      {/* Dashboard Preview for Authenticated Users */}
      {isAuthenticated && (
        <Container maxWidth="lg" sx={{ mt: -6, mb: 8, position: 'relative', zIndex: 1 }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Welcome back, {user?.username || 'Adventurer'}!
              </Typography>
              <Button
                component={RouterLink}
                to="/dashboard"
                endIcon={<ArrowForwardIcon />}
                color="primary"
              >
                Full Dashboard
              </Button>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                  Recent Activity
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {recentActivity.map((activity) => (
                    <Paper
                      key={activity.id}
                      variant="outlined"
                      sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center' }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          bgcolor: activity.type === 'session' ? 'primary.light' :
                                   activity.type === 'character' ? 'secondary.light' : 'info.light',
                        }}
                      >
                        {activity.type === 'session' ? <EventIcon /> :
                         activity.type === 'character' ? <PersonIcon /> : <LocationOnIcon />}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {activity.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activity.campaign} • {activity.date}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        component={RouterLink}
                        to={`/${activity.type}s/${activity.id}`}
                      >
                        View
                      </Button>
                    </Paper>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                  Quick Actions
                </Typography>
                <List>
                  <ListItem
                    button
                    component={RouterLink}
                    to="/sessions/create"
                    sx={{ borderRadius: 1, mb: 1 }}
                  >
                    <ListItemIcon>
                      <EventIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="New Session" />
                  </ListItem>
                  <ListItem
                    button
                    component={RouterLink}
                    to="/characters/create"
                    sx={{ borderRadius: 1, mb: 1 }}
                  >
                    <ListItemIcon>
                      <PersonIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText primary="New Character" />
                  </ListItem>
                  <ListItem
                    button
                    component={RouterLink}
                    to="/brain"
                    sx={{ borderRadius: 1, mb: 1 }}
                  >
                    <ListItemIcon>
                      <PsychologyIcon color="info" />
                    </ListItemIcon>
                    <ListItemText primary="AI Brain" />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      )}

      {/* What's New Section */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <NewReleasesIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700 }}
          >
            What's New
          </Typography>
        </Box>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 800 }}
        >
          Check out our latest features and improvements to enhance your RPG experience
        </Typography>

        <Grid container spacing={3}>
          {whatsNew.map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Fade in={true} timeout={1000} style={{ transitionDelay: `${index * 150}ms` }}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '5px',
                      height: '100%',
                      backgroundColor: item.color,
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: item.color, mr: 2 }}>
                      {item.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.date}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    {item.description}
                  </Typography>
                </Paper>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 1, fontWeight: 700 }}
        >
          Powerful Features
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}
        >
          Everything you need to create, manage, and bring your tabletop RPG campaigns to life
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <Zoom in={featuresLoaded} style={{ transitionDelay: `${index * 100}ms` }}>
                <Paper
                  elevation={3}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease-in-out',
                    overflow: 'hidden',
                    borderRadius: 3,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8,
                    },
                  }}
                >
                  <Box sx={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                    <Box
                      component="img"
                      src={feature.image}
                      alt={feature.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 2,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Avatar sx={{ bgcolor: feature.color, mr: 1.5 }}>
                        {feature.icon}
                      </Avatar>
                      <Typography variant="h6" component="h3" sx={{ color: 'white', fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {feature.description}
                    </Typography>

                    <Box sx={{ mt: 'auto' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 2
                        }}
                      >
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                          Key Benefits
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => toggleFeatureExpand(index)}
                          sx={{ transform: expandedFeature === index ? 'rotate(180deg)' : 'none' }}
                        >
                          <KeyboardArrowDownIcon />
                        </IconButton>
                      </Box>

                      {expandedFeature === index && (
                        <Fade in={expandedFeature === index}>
                          <Box sx={{ mb: 2 }}>
                            <List dense disablePadding>
                              {feature.benefits.map((benefit, i) => (
                                <ListItem key={i} sx={{ py: 0.5, px: 0 }}>
                                  <ListItemIcon sx={{ minWidth: 32 }}>
                                    <CheckCircleIcon color="success" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary={benefit} />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        </Fade>
                      )}

                      <Button
                        component={RouterLink}
                        to={feature.link}
                        variant="contained"
                        color="primary"
                        endIcon={<ArrowForwardIcon />}
                        fullWidth
                        sx={{
                          py: 1,
                          bgcolor: feature.color,
                          '&:hover': {
                            bgcolor: feature.color,
                            filter: 'brightness(1.1)',
                          }
                        }}
                      >
                        Explore
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Getting Started Section */}
      <Box sx={{ bgcolor: theme.palette.background.default, py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SchoolIcon color="secondary" sx={{ mr: 1, fontSize: 28 }} />
            <Typography
              variant="h4"
              component="h2"
              sx={{ fontWeight: 700 }}
            >
              Getting Started
            </Typography>
          </Box>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ mb: 5, maxWidth: 800 }}
          >
            New to RPG Archivist? Follow these simple steps to get started with your first campaign
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  height: '100%',
                  background: 'linear-gradient(135deg, #f5f7ff 0%, #e8eaff 100%)',
                }}
              >
                <Stepper orientation="vertical" sx={{ mt: 2 }}>
                  {gettingStartedSteps.map((step, index) => (
                    <Step key={step.label} active={true}>
                      <StepLabel
                        StepIconComponent={() => (
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: 'white',
                              color: 'primary.main',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                          >
                            {step.icon}
                          </Avatar>
                        )}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {step.label}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
                          {step.description}
                        </Typography>
                        <Button
                          component={RouterLink}
                          to={step.link}
                          variant="outlined"
                          size="small"
                          endIcon={<ArrowForwardIcon />}
                          sx={{ mb: 2 }}
                        >
                          {index === 0 ? 'Start Here' : 'Continue'}
                        </Button>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Need Help Getting Started?
                </Typography>
                <Typography variant="body1" paragraph>
                  Check out our comprehensive documentation and video tutorials to help you make the most of RPG Archivist.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AutoStoriesIcon />}
                    sx={{ flex: 1 }}
                  >
                    Documentation
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<PlayArrowIcon />}
                    sx={{ flex: 1 }}
                  >
                    Video Tutorials
                  </Button>
                </Box>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <HelpIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Have Questions?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Our support team is ready to help you with any questions you might have.
                    </Typography>
                    <Button
                      variant="text"
                      color="primary"
                      sx={{ mt: 1, pl: 0 }}
                      startIcon={<KeyboardArrowRightIcon />}
                    >
                      Contact Support
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 1, fontWeight: 700 }}
          >
            What Game Masters Say
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}
          >
            Join thousands of tabletop RPG enthusiasts who use RPG Archivist to enhance their games
          </Typography>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={testimonial.id}>
                <Fade in={true} timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
                  <Card
                    elevation={3}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <Box sx={{
                      bgcolor: index === 0 ? '#f50057' : index === 1 ? '#3f51b5' : '#9c27b0',
                      height: 8
                    }} />
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Avatar
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          sx={{
                            width: 60,
                            height: 60,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Chip
                          label={testimonial.game}
                          size="small"
                          sx={{
                            bgcolor: index === 0 ? 'rgba(245, 0, 87, 0.1)' :
                                    index === 1 ? 'rgba(63, 81, 181, 0.1)' :
                                    'rgba(156, 39, 176, 0.1)',
                            color: index === 0 ? '#f50057' :
                                   index === 1 ? '#3f51b5' :
                                   '#9c27b0',
                            fontWeight: 500
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body1"
                        paragraph
                        sx={{
                          fontStyle: 'italic',
                          mb: 3,
                          position: 'relative',
                          '&::before': {
                            content: '"""',
                            fontSize: '2rem',
                            color: 'rgba(0, 0, 0, 0.1)',
                            position: 'absolute',
                            left: -8,
                            top: -10,
                          },
                          '&::after': {
                            content: '"""',
                            fontSize: '2rem',
                            color: 'rgba(0, 0, 0, 0.1)',
                          }
                        }}
                      >
                        {testimonial.text}
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #3f51b5 0%, #9c27b0 100%)',
          color: 'white',
          py: { xs: 8, md: 10 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 20% 150%, rgba(255, 255, 255, 0.15) 0%, transparent 60%)',
            zIndex: 0,
          }
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Zoom in={true} timeout={1000}>
            <Box>
              <Typography
                variant="h3"
                component="h2"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                  mb: 2
                }}
              >
                Ready to Transform Your RPG Experience?
              </Typography>
              <Typography
                variant="h6"
                paragraph
                sx={{
                  mb: 4,
                  fontWeight: 300,
                  opacity: 0.9,
                  maxWidth: 700,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Join thousands of game masters and players who use RPG Archivist to create unforgettable campaigns
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  component={RouterLink}
                  to="/register"
                  sx={{
                    px: 4,
                    py: 1.5,
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 600,
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Get Started for Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={RouterLink}
                  to="/login"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderColor: 'white',
                    borderWidth: 2,
                    color: 'white',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'white',
                      borderWidth: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-3px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Login
                </Button>
              </Box>
              <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.9)' }} />
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Free to get started
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.9)' }} />
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    No credit card required
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.9)' }} />
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Cancel anytime
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Zoom>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
