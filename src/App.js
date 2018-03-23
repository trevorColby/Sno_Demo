import React, { Component } from 'react';
import './App.css';
import {MainMap} from './map';

class App extends Component {
  render() {
    return (
      <div className="App">
        <MainMap />
      </div>
    );
  }
}

export default App;
