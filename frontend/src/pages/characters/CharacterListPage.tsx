import React from 'react';
import { Typography, Box, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';

const CharacterListPage: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="Characters"
        actions={
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/characters/create"
          >
            Create Character
          </Button>
        }
      />
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1">
          Character list will be implemented soon.
        </Typography>
      </Paper>
    </Box>
  );
};

export default CharacterListPage;
