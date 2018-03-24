import React from 'react';
import MapControls from './MapControls';
import OpenLayersMap from './OpenLayersMap';
import TrailList from './TrailList';
import {mapObjects} from '../utils/constants';

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
        <OpenLayersMap drawTypes={drawTypes} />
        <MapControls 
          mapObjects={mapObjects}
          onClick={this.setDrawTypes} 
        />
        
        <TrailList trails={trails} />
      </div>
    )
  }
}

export default Container;