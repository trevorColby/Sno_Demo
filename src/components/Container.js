import React from 'react';
import MapControls from './MapControls';
import OpenLayersMap from './OpenLayersMap';
import TrailList from './TrailList';
import {drawTypes} from '../utils/constants';

class Container extends React.Component{

  constructor(props){
    super(props);
    this.setDrawType = this.setDrawType.bind(this);

    this.state = {
      drawType: null,
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

  setDrawType(type){
    this.setState({
      drawType: drawTypes[type] || null
    });
  }

  render(){
    const {trails, drawType} = this.state;

    return (
      <div style={{position: 'relative'}}>
        <OpenLayersMap drawType={drawType} />
        <MapControls 
          drawTypes={drawTypes}
          onClick={this.setDrawType} 
        />
        
        <TrailList trails={trails} />
      </div>
    )
  }
}

export default Container;