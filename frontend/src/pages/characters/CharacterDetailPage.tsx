import React from 'react';
import { Typography, Box, Button, Paper, Grid } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';

const CharacterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Box>
      <PageHeader
        title="Character Details"
        actions={
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to={`/characters/${id}/edit`}
          >
            Edit Character
          </Button>
        }
      />
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6">Character ID: {id}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              Character details will be implemented soon.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CharacterDetailPage;
