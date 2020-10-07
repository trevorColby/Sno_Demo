import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Delete from '@material-ui/icons/Delete';
import Select from '@material-ui/core/Select';
import { MenuItem } from '@material-ui/core/Menu';
import { FormControl, FormHelperText } from '@material-ui/core/';
import _ from 'lodash';
import {Input, InputLabel } from '@material-ui/core/';
import Collapse from '@material-ui/core/Collapse';
import { RadioGroup, Radio, FormLabel, FormControlLabel } from '@material-ui/core';
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core/';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { SketchPicker } from 'react-color';
import { getMapStyle } from './../utils/mapUtils';
import HydrantList from './HydrantList';
import ColorPicker from './ColorPicker';
import Close from '@material-ui/icons/Close';
import { Dialog, DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText } from '@material-ui/core/';

const styles = theme => ({
  root: {
    width: '100%',
  },
  input: {
    fontSize: '1.5rem',
  },
  textField: {
    marginLeft: '1em',
    marginRight: '1em',
    width: 200,
    display: 'block',
  },
  inset: {
    paddingLeft: 0
  },
  pos: {
    marginBottom: 12,
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
  mini: {
    boxShadow: '0px -1px 6px 6px rgba(0, 0, 0, 0.29), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)'
  },
  raisedPrimary: {
    backgroundColor: '#ff0000',
    color: '#fff'
  }
});


class TrailForm extends React.Component {

  state = {
    trailSectionsOpen: true,
    pickerOpen: false,
    dialogOpen: false
    }


  toggleConfirmation(onOff) {
    this.setState({
      dialogOpen: onOff
    })
  }

  toggleEditMode = () => {
    const { interaction, interactionChanged} = this.props;
    if(interaction === "DRAW_MODIFY_TRAIL" ){
      interactionChanged("DRAW_MODIFY_HYDRANTS")
    } else {
      interactionChanged("DRAW_MODIFY_TRAIL")
    }
  }


  render() {
    const {
      classes,
      modifyTrail,
      toggledEditing,
      interaction,
      interactionChanged,
      hydrants,
      hydrantDeleted,
      modifyHydrant,
      trail,
      selectedTrail,
      trailDeleted,
      dataImported
    } = this.props;

    const {  dialogOpen } = this.state

    const isTrailMode = interaction === 'DRAW_MODIFY_TRAIL'

    const trailHydrants = hydrants
      .filter(h => h.get('trail') === trail.get('id'))
      .sort((a, b) => a.get('name').localeCompare(b.get('name'), undefined, { numeric: true }))
      .valueSeq()

    const highlightFeature = (feature) => {
      feature.set('highlighted', true)
      feature.changed()
    }

    const unhighlightFeature = (feature) => {
      feature.unset('highlighted')
      feature.changed()
    }

    const trailsSectionsList = trail.get('features').map((feature, index) => {
      unhighlightFeature(feature)
      return (
        <ListItem className={classes.nested} key={feature.getId()} onMouseEnter={() => highlightFeature(feature)} onMouseLeave={()=> unhighlightFeature(feature)}>
          {`Trail Section ${index + 1}`}
          <Delete onClick={ () => {deletePoly(index)}} />
        </ListItem>
      )
    })
    const deletePoly = (featureIndex) => {
      const newFeatures = _.clone(trail.get('features'))
      newFeatures.splice(featureIndex,1)
      modifyTrail(trail.get('id'), {features: newFeatures})
    }

    return (
      <div>
        <Card className={classes.card}>
          <CardContent>
            <Close
              style={{ float: 'right'}}
              onClick={()=> {toggledEditing(false)}}
            />
            <Input
              className={classes.input}
              value={trail.get('name')}
              onChange={(e)=>{ modifyTrail(trail.get('id'), { name: e.target.value })}}
            />


            <List className={classes.root}>
              <ListItem disableGutters >
                <FormControl>
                  <Typography variant='subheading'> Edit Mode: </Typography>
                  <RadioGroup
                    style={{flexDirection: "row"}}
                    value={interaction}
                    onChange={this.toggleEditMode}
                  >
                    <FormControlLabel value="DRAW_MODIFY_TRAIL" control={<Radio color='primary' />} label="Trails" />
                    <FormControlLabel value="DRAW_MODIFY_HYDRANTS" control={<Radio color='primary' />} label="Hydrants" />
                  </RadioGroup>
                </FormControl>
              </ListItem>

              <ColorPicker
                trail={trail}
                modifyTrail={modifyTrail}
              />

              <ListItem disableGutters onClick={()=> { this.setState({ trailSectionsOpen: !this.state.trailSectionsOpen })} }>
                <ListItemText className={classes.inset} primary="Trail Sections" />
                {this.state.trailSectionsOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={this.state.trailSectionsOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                {trailsSectionsList}
                </List>
              </Collapse>

              <HydrantList
                trail={trail.get('id')}
                dataImported={dataImported}
                trailHydrants={trailHydrants}
                hydrantDeleted={hydrantDeleted}
                modifyHydrant={modifyHydrant}
              />

            </List>

            <Button
              className={classes.raisedPrimary}
              fullWidth
              style={{ marginTop: 10 }}
              variant="raised"
              onClick={() => { this.toggleConfirmation(true)}}
            > Delete Trail
            </Button>

          </CardContent>
        </Card>

        <Dialog open={dialogOpen} >

          <DialogTitle>Confirm Trail Delete</DialogTitle>

          <DialogContent>
            <DialogContentText>
               You are about to delete a trail. Deleting a trail will remove
               the trail polygon features and unassociate the currently assigned hydrants.
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button
              color="primary"
              onClick={() => { trailDeleted(trail.get('id'))}}
            > Confirm Delete
            </Button>

            <Button
              color="primary"
              onClick={() => { this.toggleConfirmation(false); }}
            > Cancel
            </Button>
          </DialogActions>

        </Dialog>

      </div>
    );
  }
}

export default withStyles(styles)(TrailForm);
