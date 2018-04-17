import React from 'react';
import { Button } from 'material-ui';

class MapControls extends React.Component{
  render(){
    let style= {
      margin: '0 auto'
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
        </div>
    )
  }
}

export default MapControls;
