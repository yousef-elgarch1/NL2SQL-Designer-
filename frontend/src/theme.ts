/**
 * Modern Theme Configuration with Dark/Light Mode
 * Glassy, professional design with beautiful fonts
 */

import { createTheme, ThemeOptions } from '@mui/material/styles'

// Professional font imports (add to index.html)
// <link rel="preconnect" href="https://fonts.googleapis.com">
// <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
// <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light Mode - Clean & Modern
          primary: {
            main: '#6366F1', // Indigo
            light: '#818CF8',
            dark: '#4F46E5',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#EC4899', // Pink
            light: '#F472B6',
            dark: '#DB2777',
            contrastText: '#FFFFFF',
          },
          success: {
            main: '#10B981', // Emerald
            light: '#34D399',
            dark: '#059669',
          },
          warning: {
            main: '#F59E0B', // Amber
            light: '#FBBF24',
            dark: '#D97706',
          },
          error: {
            main: '#EF4444', // Red
            light: '#F87171',
            dark: '#DC2626',
          },
          background: {
            default: '#F8FAFC', // Very light blue-grey
            paper: '#FFFFFF',
          },
          text: {
            primary: '#1E293B', // Slate 800
            secondary: '#64748B', // Slate 500
          },
        }
      : {
          // Dark Mode - Glassy & Modern
          primary: {
            main: '#818CF8', // Light Indigo
            light: '#A5B4FC',
            dark: '#6366F1',
            contrastText: '#0F172A',
          },
          secondary: {
            main: '#F472B6', // Light Pink
            light: '#F9A8D4',
            dark: '#EC4899',
            contrastText: '#0F172A',
          },
          success: {
            main: '#34D399', // Light Emerald
            light: '#6EE7B7',
            dark: '#10B981',
          },
          warning: {
            main: '#FBBF24', // Light Amber
            light: '#FCD34D',
            dark: '#F59E0B',
          },
          error: {
            main: '#F87171', // Light Red
            light: '#FCA5A5',
            dark: '#EF4444',
          },
          background: {
            default: '#0F172A', // Slate 900
            paper: 'rgba(30, 41, 59, 0.8)', // Slate 800 with transparency (glassy)
          },
          text: {
            primary: '#F1F5F9', // Slate 100
            secondary: '#CBD5E1', // Slate 300
          },
        }),
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.25rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.875rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      textTransform: 'none', // No uppercase
      letterSpacing: '0.02em',
    },
    code: {
      fontFamily: [
        'JetBrains Mono',
        'Fira Code',
        'Consolas',
        'Monaco',
        'monospace',
      ].join(','),
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 12, // More rounded corners
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          ...(theme.palette.mode === 'dark' && {
            // Glassy dark mode background
            backgroundImage: `
              radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
              radial-gradient(at 100% 0%, rgba(236, 72, 153, 0.15) 0px, transparent 50%),
              radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.15) 0px, transparent 50%),
              radial-gradient(at 0% 100%, rgba(245, 158, 11, 0.15) 0px, transparent 50%)
            `,
            backgroundColor: theme.palette.background.default,
          }),
        },
      }),
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          ...(theme.palette.mode === 'dark' && {
            // Glassy effect
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          }),
          ...(theme.palette.mode === 'light' && {
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          }),
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          padding: '10px 20px',
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
              : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          },
        }),
        contained: ({ theme }) => ({
          ...(theme.palette.mode === 'dark' && {
            background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
            },
          }),
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            ...(theme.palette.mode === 'dark' && {
              backgroundColor: 'rgba(51, 65, 85, 0.3)',
              backdropFilter: 'blur(10px)',
              '& fieldset': {
                borderColor: 'rgba(148, 163, 184, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(148, 163, 184, 0.4)',
              },
            }),
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          ...(theme.palette.mode === 'dark' && {
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
          }),
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontWeight: 500,
          ...(theme.palette.mode === 'dark' && {
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          }),
        }),
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 12,
          ...(theme.palette.mode === 'dark' && {
            backdropFilter: 'blur(10px)',
          }),
        }),
      },
    },
  },
})

export const createAppTheme = (mode: 'light' | 'dark') => {
  return createTheme(getDesignTokens(mode))
}
