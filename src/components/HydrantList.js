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
import Button from 'material-ui/Button';
import Check from '@material-ui/icons/Check';
import Tooltip from 'material-ui/Tooltip';


const styles = theme => ({
  inset: {
    paddingLeft: 0
  }
});



class HydrantList extends React.Component {


  constructor(props){
    super(props)
    this.state = {
      open: true,
      prefix: this.getPrefix(props.trailHydrants),
    }
  }

  componentWillReceiveProps(nextProps) {
    const prefix = this.getPrefix(nextProps.trailHydrants)
    this.setState({
        prefix
    })

  }

  getPrefix = (hydrants) => {
    if (hydrants.size > 1) {
      return hydrants.reduce((accum, val) => {
        let name = val.get('name')
        for (let i = 0; i < accum.length; i++) {
          if (accum[i] !== name[i]) {
            return accum.slice(0, i)
          }
        };
        return accum
      }, hydrants.getIn([0,'name']) )
    }
    return ''
  }

  applyPrefix = () => {
    const { modifyHydrant, trailHydrants } = this.props
    const { prefix } = this.state
    const oldPrefix = this.getPrefix(trailHydrants)


    trailHydrants.forEach((h) => {
      const newName = h.get('name').replace(oldPrefix, prefix)
      modifyHydrant(h.get('id'), { name: newName })
    })

  }



  render() {

    const {
      classes,
      modifyHydrant,
      hydrantDeleted,
      trailHydrants
    } = this.props;


    const { prefix } = this.state


    return (
      <div>
        <ListItem disableGutters onClick={() => { this.setState({ open: !this.state.open }); }}>
          <ListItemText className={classes.inset} primary="Hydrants" />
          {this.state.open ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={this.state.open} timeout="auto" unmountOnExit>
          <ListItem>
            <FormControl>
              <Input
                placeholder="None"
                value={prefix}
                onChange={(e) => { this.setState({ prefix: e.target.value })}}
              />
              <FormHelperText>Hydrant prefix</FormHelperText>
            </FormControl>
            <Tooltip title='Apply Prefix'>
              <Button
               variant='flat'
               mini
               onClick={this.applyPrefix}
              >
                <Check style={{ color: 'green' }} />
              </Button>
            </Tooltip>
          </ListItem>


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
