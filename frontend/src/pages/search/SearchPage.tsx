import React, { useState } from 'react';
import { Container, Typography, Box, TextField, InputAdornment, IconButton, Paper, Grid, Tab, Tabs } from '@mui/material';
import { PageHeader } from '../../components/ui';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`search-tabpanel-${index}`}
      aria-labelledby={`search-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Search"
        subtitle="Find content across your RPG worlds"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Search' },
        ]}
      />

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search for campaigns, characters, locations, and more..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{ mb: 2 }}
        />

        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All" />
            <Tab label="Campaigns" />
            <Tab label="Characters" />
            <Tab label="Locations" />
            <Tab label="Items" />
            <Tab label="Events" />
            <Tab label="Sessions" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Search Functionality Coming Soon
              </Typography>
              <Typography variant="body1">
                The search feature is currently under development. Check back later!
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Campaign Search Coming Soon
              </Typography>
              <Typography variant="body1">
                The campaign search feature is currently under development. Check back later!
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Character Search Coming Soon
              </Typography>
              <Typography variant="body1">
                The character search feature is currently under development. Check back later!
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Location Search Coming Soon
              </Typography>
              <Typography variant="body1">
                The location search feature is currently under development. Check back later!
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Item Search Coming Soon
              </Typography>
              <Typography variant="body1">
                The item search feature is currently under development. Check back later!
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Event Search Coming Soon
              </Typography>
              <Typography variant="body1">
                The event search feature is currently under development. Check back later!
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={6}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                Session Search Coming Soon
              </Typography>
              <Typography variant="body1">
                The session search feature is currently under development. Check back later!
              </Typography>
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default SearchPage;