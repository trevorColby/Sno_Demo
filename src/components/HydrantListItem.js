import React from 'react';
import { ListItem } from 'material-ui/List';
import ModeEdit from '@material-ui/icons/ModeEdit';
import Input from 'material-ui/Input';
import Delete from '@material-ui/icons/Delete';
import Collapse from 'material-ui/transitions/Collapse';
import { FormControl, FormHelperText } from 'material-ui/Form';
import { withStyles } from 'material-ui/styles';
import _ from 'lodash';
import { getElevations } from '../utils/bulkUpdateUtils';
import {Button} from 'material-ui';
import OperationMessage from './OperationMessage';
import Grid from '@material-ui/core/Grid';


const styles = theme => ({
  root: {
    flexWrap: 'wrap'
  },
  inset: {
    paddingLeft: 0
  }
});


class HydrantListItem extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showDetails: false,
      name: props.hydrant.get('name'),
      message: null,
    }
  }

  toggleHighLight = (feature, state) => {
    feature.set('highlighted', state)
    feature.changed();
  }

  updateCoords = (e, h, coordIndex) => {
    const { modifyHydrant, hydrant } = this.props
    const newCoords = _.clone(hydrant.get('coords'));
    newCoords.splice(coordIndex, 1, Number(e.target.value))
    modifyHydrant(hydrant.get('id'), { coords: newCoords })
  };


  componentWillReceiveProps(nextProps){
    if (this.props.hydrant !== nextProps.hydrant) {
      this.setState({
        name: nextProps.hydrant.get('name')
      })
    }
  }

  render() {
    const {
      modifyHydrant,
      classes,
      hydrantDeleted,
      hydrant,
    } = this.props;

    const { name, showDetails, message } = this.state
    const hydrantElevation = hydrant.get('elevation')

    return (
      <div>
        <OperationMessage
          setMessageToNull={()=> this.setState({ message:null })}
          message={message}
         />

        <ListItem
          onMouseLeave={() => this.toggleHighLight(hydrant.get('feature'), false)}
          onMouseEnter={() => this.toggleHighLight(hydrant.get('feature'), true)}
          className={classes.root}
        >
          <Grid container spacing={24}>
            <Grid item xs={8}>
              <Input
                onBlur={(e) => { modifyHydrant(hydrant.get('id'), { name: e.target.value })}}
                onChange={(e) => { this.setState({ name: e.target.value }); }}
                value={name}
                placeholder="Enter Hydrant Name"
              />
            </Grid>
            <Grid item xs={4}>
              <Delete onClick={()=> { hydrantDeleted((hydrant.get('id'))); }} />
              <ModeEdit onClick={() => this.setState({ showDetails: !showDetails })} />
            </Grid>
          </Grid>
          <Collapse
            style={{ padding: 20 }}
            in={showDetails}
            timeout="auto"
            unmountOnExit>

            <FormControl>
              <Input
                type="number"
                value={hydrant.get('coords')[1]}
                onChange={(e) => { this.updateCoords(e, hydrant, 1); }}
              />
              <FormHelperText>Lat.</FormHelperText>
              <Input
                type="number"
                value={hydrant.get('coords')[0]}
                onChange={(e) => { this.updateCoords(e, hydrant, 0); }}
              />
              <FormHelperText>Lng.</FormHelperText>
               { hydrantElevation ? (
                 <Input
                   type="number"
                   onChange={(e) => { modifyHydrant(hydrant.get('id'), { elevation: e.target.value }); }}
                   value={hydrant.get('elevation') || 'Null'}
                 />
               ) : (
                 <Button
                 style={{borderBottom: '1px solid'}}
                 variant='flat'
                 onClick={() => {
                   getElevations()
                   .then(elevMessage => this.setState({ message: elevMessage }))}}
                 >
                 Fetch
                 </Button>
               )}
              <FormHelperText>Elevation</FormHelperText>
            </FormControl>
          </Collapse>
        </ListItem>
      </div>
    )
  }
}

export default withStyles(styles)(HydrantListItem);
