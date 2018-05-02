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



  renderHydrant(h) {
    const {
      modifyHydrant,
      classes,
      hydrantDeleted,
    } = this.props;


    return (
      <ListItem
        key={h.get('id')}
        onMouseLeave={() => this.toggleHighLight(h.get('feature'), false)}
        onMouseEnter={() => this.toggleHighLight(h.get('feature'), true)}
        className={classes.root}
      >
        <Input
          onChange={(e) => { modifyHydrant(h.get('id'), { name: e.target.value }); }}
          value={h.get('name')}
          placeholder="Enter Hydrant Name"
        />

        <Delete onClick={()=> { hydrantDeleted((h.get('id'))); }} />
        <ModeEdit onClick={() => this.toggleEdit(h.get('id'))} />

        <Collapse
          style={{ padding: 20 }}
          in={this.state.showDetails[h.get('id')]}
          timeout="auto"
          unmountOnExit>

          <FormControl>
            <Input
              type="number"
              value={h.get('coords')[1]}
              onChange={(e) => { this.updateCoords(e, h, 1); }}
            />
            <FormHelperText>Lat.</FormHelperText>
            <Input
              type="number"
              value={h.get('coords')[0]}
              onChange={(e)=> { this.updateCoords(e, h, 0); }}
            />
            <FormHelperText>Lng.</FormHelperText>

            <Input
              type="number"
              onChange={(e) => { modifyHydrant(h.get('id'), { elevation: e.target.value }); }}
              value={h.get('elevation') || 'Null'}
            />

            <FormHelperText>Elevation</FormHelperText>
          </FormControl>
        </Collapse>
      </ListItem>
    )
  }

  render() {

    const {
      classes,
      trail,
      hydrants,
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
            {trailHydrants.map(h => this.renderHydrant(h))}
          </List>
        </Collapse>
      </div>
    )
}
}


export default withStyles(styles)(HydrantList);
