import React from 'react';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Delete from '@material-ui/icons/Delete';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from 'material-ui/transitions/Collapse';
import Input from 'material-ui/Input';
import { withStyles } from 'material-ui/styles';


const styles = theme => ({
  inset: {
    paddingLeft: 0
  }
});



class HydrantList extends React.Component {

  state = {
    open: true
  }

render() {

  const {
    classes,
    editableTrail,
    hydrants,
    hydrantDeleted,
    modifyHydrant
  } = this.props;

  const trailHydrants = hydrants.filter((h) => h.get('trail') === editableTrail.get('id')).valueSeq();

  // const toggleHighLight()

  const hydrantsList = trailHydrants.map((h, index)=> {
    return (
      <ListItem key={h.get('id')} >
        <Input
          onChange={(e) => { modifyHydrant(h.get('id'), { name: e.target.value }); }}
          value={h.get('name')}
          placeholder="Enter Hydrant Name"
        />
        <Delete onClick={()=> { hydrantDeleted((h.get('id'))); }} />
      </ListItem>
    )
  })


  return (
    <div>
      <ListItem disableGutters onClick={()=> { this.setState({ open: !this.state.open }); }}>
        <ListItemText className={classes.inset} primary="Hydrants" />
        {this.state.open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={this.state.open} timeout="auto" unmountOnExit>
        <List>
          {hydrantsList}
        </List>
      </Collapse>
    </div>
  )
}
}


export default withStyles(styles)(HydrantList);
