import React from 'react';
import MapControls from './MapControls';
import OpenLayersMap from './OpenLayersMap';
import TrailList from './TrailList';
import {mapObjects} from '../utils/constants';
import kill_logo from './../imgs/Kill_Logo.png'
import {Image} from 'react-bootstrap';

class Container extends React.Component{

  constructor(props){
    super(props);
    this.setDrawTypes = this.setDrawTypes.bind(this);

    this.state = {
      drawTypes: null,
      trails: [{
          id: 1, name: 'First Trail', guns: 8
        }, {
          id: 2, name: 'Second Trail', guns: 12
        }, {
          id: 3, name: 'Third Trail', guns: 15
        }
      ]
    }
  }

  setDrawTypes(type){
    this.setState({
      drawTypes: mapObjects[type] || null
    });
  }

  render(){
    const {trails, drawTypes} = this.state;

    return (
      <div style={{position: 'relative'}}>
        <Image style={{position: 'absolute', zIndex: '99', bottom:0, left:0, width: 300}} src={kill_logo} responsive />

        <OpenLayersMap drawTypes={drawTypes} />

        <MapControls
          onClick={this.setDrawTypes}
        />

        <TrailList trails={trails} />
      </div>
    )
  }
}

export default Container;
