import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'typeface-roboto';
import 'react-select/dist/react-select.css';
import './App.css';
import Container from './components/Container';
import CssBaseline from 'material-ui/CssBaseline';


class App extends Component {
  render() {
    return (
      <React.Fragment>
      <CssBaseline />
      <div className="App">
        <Container />
      </div>
      </React.Fragment>
    );
  }
}

export default App;
