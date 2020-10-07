import React from 'react';
import { List, ListItem, ListItemText } from '@material-ui/core/';
import Delete from '@material-ui/icons/Delete';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import { Input, InputLabel } from '@material-ui/core/';
import { withStyles } from '@material-ui/core/';
import ModeEdit from '@material-ui/icons/ModeEdit';
import { FormControl, FormHelperText } from '@material-ui/core/';
import TextField from '@material-ui/core/TextField';
import _ from 'lodash';
import HydrantListItem from './HydrantListItem';
import Button from '@material-ui/core/Button';
import Check from '@material-ui/icons/Check';
import Tooltip from '@material-ui/core/Tooltip';
import { autonameHydrants, getElevations } from '../utils/bulkUpdateUtils';
import OperationMessage from './OperationMessage';


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
      message: null
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

  renameHydrants = () => {
    const { dataImported, trail } = this.props;
    const { prefix } = this.state;
    getElevations()
      .then(() => {
        const renamed = autonameHydrants(trail, prefix)
        dataImported({ hydrants: renamed})
      })
      .then(() => { this.setState({ message: 'Hydrants Renamed Based on Elevation Data' }); })
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


    const { prefix, message } = this.state


    return (
      <div>
      <OperationMessage
        setMessageToNull={()=> this.setState({ message:null })}
        message={message}
       />

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
          <ListItem>
            <Button
              color='primary'
              variant='raised'
              onClick={this.renameHydrants}
            >
              Re-Name By Elevation
            </Button>
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
