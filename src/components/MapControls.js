import React from 'react';
import { Button } from 'material-ui';

class MapControls extends React.Component{
  render(){
    let style= {
      float: 'left'
    }

    const {changeMode, mode} = this.props;

    return (
        <div style={style}>
          <Button 
            variant="raised" 
            color={mode==='trails' ? 'primary' : 'default'} 
            onClick={()=> changeMode('trails')}>
            Trails
          </Button>
          <Button 
            variant="raised" 
            color={mode==='hydrants' ? 'primary' : 'default'} 
            onClick={()=> changeMode('hydrants')}>
            Hydrants
          </Button>
          <Button variant="raised">Import / Export</Button>
          <Button variant="raised">Auto-associate hydrants</Button>
        </div>
    )
  }
}

export default MapControls;
