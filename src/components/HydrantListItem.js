import React from 'react';
import { ListItem } from 'material-ui/List';
import ModeEdit from '@material-ui/icons/ModeEdit';
import Input from 'material-ui/Input';
import Delete from '@material-ui/icons/Delete';
import Collapse from 'material-ui/transitions/Collapse';
import { FormControl, FormHelperText } from 'material-ui/Form';
import { withStyles } from 'material-ui/styles';
import _ from 'lodash';

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
      showDetails: {},
      name: props.hydrant.get('name')
    }
  }

  toggleHighLight = (feature, state) => {
    feature.set('highlighted', state)
    feature.changed();
  }

  toggleEdit = (id) => {
    const newDetails = {}
    if (!this.state.showDetails[id]) {
      newDetails[id] = true
    }
    this.setState({ showDetails: newDetails })
  }

  updateCoords = (e, h, coordIndex) => {
    const { modifyHydrant, hydrant } = this.props
    const newCoords = _.clone(hydrant.get('coords'));
    newCoords.splice(coordIndex, 1, Number(e.target.value))
    modifyHydrant(hydrant.get('id'), { coords: newCoords })
  };

  render() {
    const {
      modifyHydrant,
      classes,
      hydrantDeleted,
      hydrant,
      key
    } = this.props;

    const { name, showDetails } = this.state

    return (
      <ListItem
        key={key}
        onMouseLeave={() => this.toggleHighLight(hydrant.get('feature'), false)}
        onMouseEnter={() => this.toggleHighLight(hydrant.get('feature'), true)}
        className={classes.root}
      >
        <Input
          onBlur={(e) => { modifyHydrant(hydrant.get('id'), { name: e.target.value })}}
          onChange={(e) => { this.setState({ name: e.target.value }); }}
          value={name}
          placeholder="Enter Hydrant Name"
        />

        <Delete onClick={()=> { hydrantDeleted((hydrant.get('id'))); }} />
        <ModeEdit onClick={() => this.toggleEdit(hydrant.get('id'))} />

        <Collapse
          style={{ padding: 20 }}
          in={showDetails[hydrant.get('id')]}
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

            <Input
              type="number"
              onChange={(e) => { modifyHydrant(hydrant.get('id'), { elevation: e.target.value }); }}
              value={hydrant.get('elevation') || 'Null'}
            />

            <FormHelperText>Elevation</FormHelperText>
          </FormControl>
        </Collapse>
      </ListItem>
    )
  }
}

export default withStyles(styles)(HydrantListItem);
