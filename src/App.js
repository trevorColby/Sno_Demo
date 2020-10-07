import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'typeface-roboto';
import 'react-select/dist/react-select.css';
import './App.css';
import Container from './components/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
// import { createMuiTheme, MuiThemeProvider } from 'material-ui/styles';
// import blue from 'material-ui/colors/blue';

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#439889',
      main: '#FF0000',
      // main: '#1565c0',
      dark: '#003c8f',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ffffff',
      main: '#eeeeee',
      dark: '#bcbcbc',
      contrastText: '#000',
    }
  }
});


class App extends Component {
  render() {
    return (

    <MuiThemeProvider theme={theme} >
      <React.Fragment>
      <CssBaseline />
      <div className="App">
        <Container />
      </div>
      </React.Fragment>
    </MuiThemeProvider>
    );
  }
}

export default App;
