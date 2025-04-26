import { createTheme, responsiveFontSizes, Theme, ThemeOptions } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Define common theme options
const getThemeOptions = (mode: PaletteMode): ThemeOptions => {
  const isDark = mode === 'dark';

  return {
    palette: {
      mode,
      primary: {
        main: isDark ? '#4ecdc4' : '#1a9b9b', // Teal from the D20 die (lighter for dark mode)
        light: '#4ecdc4', // Lighter teal for highlights
        dark: '#00696b', // Darker teal for contrast
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#ffcb77' : '#cd9b4a', // Gold/bronze (lighter for dark mode)
        light: '#ffcb77', // Lighter gold
        dark: '#996d1d', // Darker gold
        contrastText: isDark ? '#000000' : '#ffffff',
      },
      background: {
        default: isDark ? '#121212' : '#f5f5f5',
        paper: isDark ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: isDark ? '#ffffff' : '#333333',
        secondary: isDark ? '#b0b0b0' : '#666666',
      },
      error: {
        main: '#f44336',
        light: '#e57373',
        dark: '#d32f2f',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
        contrastText: isDark ? '#000000' : '#ffffff',
      },
      info: {
        main: isDark ? '#64b5f6' : '#0d4b6e', // Dark blue from the feather base (lighter for dark mode)
        light: '#4fc3f7',
        dark: '#0288d1',
        contrastText: '#ffffff',
      },
      success: {
        main: '#4caf50',
        light: '#81c784',
        dark: '#388e3c',
        contrastText: '#ffffff',
      },
    },
    typography: {
      fontFamily: [
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
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
            background: isDark
              ? `linear-gradient(135deg, #4ecdc4 0%, #26a69a 100%)`
              : `linear-gradient(135deg, #1a9b9b 0%, #00696b 100%)`,
          },
          containedSecondary: {
            background: isDark
              ? `linear-gradient(135deg, #ffcb77 0%, #dda74a 100%)`
              : `linear-gradient(135deg, #cd9b4a 0%, #996d1d 100%)`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDark
              ? '0 4px 12px rgba(0,0,0,0.5)'
              : '0 4px 12px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: isDark
                ? '0 8px 24px rgba(0,0,0,0.6)'
                : '0 8px 24px rgba(0,0,0,0.15)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
          elevation1: {
            boxShadow: isDark
              ? '0 2px 8px rgba(0,0,0,0.3)'
              : '0 2px 8px rgba(0,0,0,0.08)',
          },
          elevation2: {
            boxShadow: isDark
              ? '0 4px 12px rgba(0,0,0,0.4)'
              : '0 4px 12px rgba(0,0,0,0.1)',
          },
          elevation3: {
            boxShadow: isDark
              ? '0 6px 16px rgba(0,0,0,0.5)'
              : '0 6px 16px rgba(0,0,0,0.12)',
          },
          elevation4: {
            boxShadow: isDark
              ? '0 8px 24px rgba(0,0,0,0.6)'
              : '0 8px 24px rgba(0,0,0,0.14)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: isDark
              ? '0 2px 10px rgba(0,0,0,0.5)'
              : '0 2px 10px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: 'none',
            boxShadow: isDark
              ? '2px 0 10px rgba(0,0,0,0.5)'
              : '2px 0 10px rgba(0,0,0,0.1)',
            backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '&.Mui-focused fieldset': {
                borderColor: isDark ? '#4ecdc4' : '#1a9b9b',
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
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&.Mui-selected': {
              backgroundColor: isDark
                ? 'rgba(78, 205, 196, 0.2)'
                : 'rgba(26, 155, 155, 0.1)',
              '&:hover': {
                backgroundColor: isDark
                  ? 'rgba(78, 205, 196, 0.3)'
                  : 'rgba(26, 155, 155, 0.2)',
              },
            },
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            boxShadow: isDark
              ? '0 2px 6px rgba(0,0,0,0.3)'
              : '0 2px 6px rgba(0,0,0,0.15)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '12px 16px',
          },
          head: {
            fontWeight: 600,
            backgroundColor: isDark
              ? 'rgba(78, 205, 196, 0.2)'
              : 'rgba(26, 155, 155, 0.1)',
          },
        },
      },
    },
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
  };
};

// Create theme with responsive font sizes
export const createAppTheme = (mode: PaletteMode): Theme => {
  const theme = createTheme(getThemeOptions(mode));
  return responsiveFontSizes(theme);
};

// Default themes
export const lightTheme = createAppTheme('light');
export const darkTheme = createAppTheme('dark');
