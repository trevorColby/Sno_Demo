import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'typeface-roboto';
import 'ol-geocoder/dist/ol-geocoder.css';

import './App.css';
import Container from './components/Container';


class App extends Component {
  render() {
    return (
      <div className="App">
        <Container />
      </div>
    );
  }
}

export default App;
