'use client';
import { SxProps, Theme, createTheme, ThemeOptions } from '@mui/material';
import { deepmerge } from '@mui/utils';
import { Themes } from 'jrgcomponents/types/Theming';

const baseTheme = {
  //Components
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 'bold',
          fontSize: '14px',
          fontFamily: 'Encode Sans Semi Expanded, Arial, sans-serif',
          textTransform: 'capitalize' as const,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: ({ theme }: { theme: Theme }): SxProps => ({
          color: theme.palette.text.primary,
        }),
      },
    },
  },
  // Anything that you override from here https://mui.com/material-ui/customization/dark-mode/ needs to also be overridden in dark or it won't be applied.
  palette: {
    colorblind: false,
    primary: {
      light: '#F00',
      main: '#C00',
      dark: '#900',
    },
    secondary: {
      light: '#0F0',
      main: '#0C0',
      dark: '#090',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    h1: {
      fontSize: '1rem',
      fontWeight: 'bold',
      '@media (min-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    body1: {
      fontSize: '0.75rem',
    },
    button: {
      fontWeight: 'bold',
      fontSize: '14px',
    },
  },
};
const darkOverrides = {
  palette: {
    mode: 'dark',
  },
};
const colorblindPalette = {
  light: '#CCC',
  main: '#999',
  dark: '#333',
};
const colorblindOverrides = {
  palette: {
    colorblind: true,
    primary: {
      ...colorblindPalette,
    },
    secondary: {
      ...colorblindPalette,
    },
  },
};
export const themeLight = createTheme(baseTheme as ThemeOptions);
export const themeDark = createTheme(deepmerge(baseTheme, darkOverrides) as ThemeOptions);
export const themeLightColorblind = createTheme(deepmerge(baseTheme, colorblindOverrides) as ThemeOptions);
export const themeDarkColorblind = createTheme(
  deepmerge(deepmerge(baseTheme, darkOverrides), colorblindOverrides) as ThemeOptions,
);
const themes = {
  light: themeLight,
  dark: themeDark,
  lightColorblind: themeLightColorblind,
  darkColorblind: themeDarkColorblind,
} as Themes;
export default themes;
