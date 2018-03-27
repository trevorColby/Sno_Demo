import React from 'react';
import {Button, Paper, BottomNavigation } from 'material-ui';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import green from 'material-ui/colors/green';
import Icon from 'material-ui/Icon';



class MapControls extends React.Component{


  render(){
    let style= {
      float: 'left'
    }

    const {onClick, canAddHydrant} = this.props;


    return (
        <div style={style}>
          <Button variant="raised" id='Trail' onClick={()=> onClick('Trail')}> Trail </Button>
          {canAddHydrant ? (
            <Button variant="raised" onClick={()=> onClick('Hydrant')} id='Hydrant'>Hydrant</Button>
          ) : null}
          <Button variant="raised" onClick={()=> onClick('HydrantLine')} id='HydrantLine' >Hydrant Line</Button>
          <Button variant="raised" onClick={()=> onClick('HydrantTrail')} id='HydrantTrail' >Hydrant Trail</Button>
          <Button variant="raised" onClick={()=> onClick('removeInteraction')} id='removeInteraction' >Save</Button>
        </div>
    )
  }
}

export default MapControls;
