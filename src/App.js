import Api from './conllu-rest-client/api';
import React, { useState, useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';
import Base from './conllu-rest-client/components';


const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
  },
});


function App() {
  useEffect(() => document.title = "CoNLL-U REST Client");
  return (
    <ThemeProvider theme={theme}>
      <Base />
      <CssBaseline />
    </ThemeProvider>
  );
}

export default App;
