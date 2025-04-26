import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { PaletteOptions } from '@mui/material/styles/createPalette';

// Color palette based on the RPG Archivist logo
const palette: PaletteOptions = {
  primary: {
    main: '#1a9b9b', // Teal from the D20 die
    light: '#4ecdc4', // Lighter teal for highlights
    dark: '#00696b', // Darker teal for contrast
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#cd9b4a', // Gold/bronze from the numbers and pen nib
    light: '#ffcb77', // Lighter gold
    dark: '#996d1d', // Darker gold
    contrastText: '#000000',
  },
  error: {
    main: '#f44336', // Keep standard error color
    light: '#e57373',
    dark: '#d32f2f',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ff9800', // Keep standard warning color
    light: '#ffb74d',
    dark: '#f57c00',
    contrastText: '#000000',
  },
  info: {
    main: '#0d4b6e', // Dark blue from the feather base
    light: '#4fc3f7',
    dark: '#0288d1',
    contrastText: '#ffffff',
  },
  success: {
    main: '#4caf50', // Keep standard success color
    light: '#81c784',
    dark: '#388e3c',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f5f5f5', // Light gray background
    paper: '#ffffff', // White for cards and surfaces
  },
  text: {
    primary: '#333333', // Dark gray for primary text
    secondary: '#666666', // Medium gray for secondary text
    disabled: '#999999', // Light gray for disabled text
  },
};

// Create the base theme
let theme = createTheme({
  palette,
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none', // Avoid all-caps buttons
    },
  },
  shape: {
    borderRadius: 8, // Slightly rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, #1a9b9b 0%, #00696b 100%)`,
        },
        containedSecondary: {
          background: `linear-gradient(135deg, #cd9b4a 0%, #996d1d 100%)`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&.Mui-focused fieldset': {
              borderColor: '#1a9b9b',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
        elevation3: {
          boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
        },
        elevation4: {
          boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: 'rgba(26, 155, 155, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(26, 155, 155, 0.2)',
            },
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        },
      },
    },
  },
});

// Make typography responsive
theme = responsiveFontSizes(theme);

export default theme;
