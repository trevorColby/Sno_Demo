import React from 'react';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Delete from '@material-ui/icons/Delete';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from 'material-ui/transitions/Collapse';
import Input, { InputLabel } from 'material-ui/Input';
import { withStyles } from 'material-ui/styles';
import ModeEdit from '@material-ui/icons/ModeEdit';
import { FormControl, FormHelperText } from 'material-ui/Form';
import TextField from 'material-ui/TextField';
import _ from 'lodash';
import HydrantListItem from './HydrantListItem';


const styles = theme => ({
  root: {
    flexWrap: 'wrap'
  },
  inset: {
    paddingLeft: 0
  }
});



class HydrantList extends React.Component {

  state = {
    open: true,
    showDetails: {}
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
    const { modifyHydrant } = this.props
    const newCoords = _.clone(h.get('coords'));
    newCoords.splice(coordIndex, 1, Number(e.target.value))
    modifyHydrant(h.get('id'), { coords: newCoords })
  };


  render() {

    const {
      classes,
      trail,
      hydrants,
      modifyHydrant,
      hydrantDeleted,
    } = this.props;

    const trailHydrants = hydrants
      .filter(h => h.get('trail') === trail.get('id'))
      .sort((a, b) => a.get('name').localeCompare(b.get('name'), undefined, { numeric: true }))
      .valueSeq()

    return (
      <div>
        <ListItem disableGutters onClick={() => { this.setState({ open: !this.state.open }); }}>
          <ListItemText className={classes.inset} primary="Hydrants" />
          {this.state.open ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={this.state.open} timeout="auto" unmountOnExit>
          <List>
            {trailHydrants.map((h) => {
              const key = h.get('id')
              return (
                <HydrantListItem
                  key={key}
                  hydrant={h}
                  modifyHydrant={modifyHydrant}
                  hydrantDeleted={hydrantDeleted}
                />
              )
            })}

          </List>
        </Collapse>
      </div>
    )
}
}


export default withStyles(styles)(HydrantList);
