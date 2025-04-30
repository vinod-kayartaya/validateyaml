import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import YamlValidator from './components/YamlValidator';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <YamlValidator />
    </ThemeProvider>
  );
}

export default App;
