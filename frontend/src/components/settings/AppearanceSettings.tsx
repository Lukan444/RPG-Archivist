import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Button,
  Paper,
  Grid,
  Card,
  CardActionArea,
  CardContent
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  SettingsBrightness as SystemModeIcon
} from '@mui/icons-material';

const AppearanceSettings: React.FC = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Appearance Settings
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Theme Mode
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardActionArea sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <LightModeIcon fontSize="large" />
                </Box>
                <CardContent sx={{ pt: 0 }}>
                  <Typography variant="subtitle1" align="center">
                    Light
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardActionArea sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <DarkModeIcon fontSize="large" />
                </Box>
                <CardContent sx={{ pt: 0 }}>
                  <Typography variant="subtitle1" align="center">
                    Dark
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card variant="outlined">
              <CardActionArea sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <SystemModeIcon fontSize="large" />
                </Box>
                <CardContent sx={{ pt: 0 }}>
                  <Typography variant="subtitle1" align="center">
                    System
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="subtitle1" gutterBottom>
          Font Size
        </Typography>

        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <RadioGroup row defaultValue="medium">
            <FormControlLabel value="small" control={<Radio />} label="Small" />
            <FormControlLabel value="medium" control={<Radio />} label="Medium" />
            <FormControlLabel value="large" control={<Radio />} label="Large" />
          </RadioGroup>
        </FormControl>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" disabled>
            Save Changes
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default AppearanceSettings;
