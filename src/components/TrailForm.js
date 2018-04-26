import React from 'react';
import { withStyles } from 'material-ui/styles';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Delete from '@material-ui/icons/Delete';
import Select from 'material-ui/Select';
import { MenuItem } from 'material-ui/Menu';
import { FormControl, FormHelperText } from 'material-ui/Form';
import _ from 'lodash';
import Input, { InputLabel } from 'material-ui/Input';
import Collapse from 'material-ui/transitions/Collapse';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { SketchPicker } from 'react-color';
import { getMapStyle } from './../utils/mapUtils';
import HydrantList from './HydrantList';
import ColorPicker from './ColorPicker';
import Close from '@material-ui/icons/Close';

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
  }
});


class TrailForm extends React.Component {

  state = {
    trailSectionsOpen: true,
    pickerOpen: false,
    trailFill: 'white',
    }

  render() {
    const {
      classes,
      modifyTrail,
      editableTrail,
      trailEditable,
      interaction,
      interactionChanged,
      hydrants,
      hydrantDeleted,
      modifyHydrant,
      selectedTrail
    } = this.props;

    const isTrailMode = interaction === 'DRAW_MODIFY_TRAIL'

    const highlightPoly = (feature) => {
      feature.set('highlighted', true)
      feature.changed()
    }
    const unHighlightPoly = (feature) => {
      feature.unset('highlighted')
      feature.changed()
    }
    const trailsSectionsList = editableTrail.get('features').map((feature, index) => {
      unHighlightPoly(feature)
      return (
        <ListItem className={classes.nested} key={feature.getId()} onMouseEnter={() => highlightPoly(feature)} onMouseLeave={()=> unHighlightPoly(feature)}>
          {`Trail Section ${index + 1}`}
          <Delete onClick={ () => {deletePoly(index)}} />
        </ListItem>
      )
    })
    const deletePoly = (featureIndex) => {
      const newFeatures = _.clone(editableTrail.get('features'))
      newFeatures.splice(featureIndex,1)
      modifyTrail(editableTrail.get('id'), {features: newFeatures})
    }

    return (
      <div>
        <Card className={classes.card}>
          <CardContent>
            <Close
              style={{ float: 'right'}}
              onClick={()=> {trailEditable(null)}}
            />
            <Input
              className={classes.input}
              value={editableTrail.get('name')}
              onChange={(e)=>{ modifyTrail(editableTrail.get('id'), { name: e.target.value }) }}
            />

            {isTrailMode ?
            (
              <Button
              className={classes.root}
              style={{marginTop: 10}}
              color="secondary"
              onClick={()=> interactionChanged('DRAW_MODIFY_HYDRANTS')}
              variant="raised"
              >
              Edit Hydrants
              </Button>
            ) :
            <Button
            className={classes.root}
            color="secondary"
            style={{marginTop: 10}}
            onClick={()=> interactionChanged('DRAW_MODIFY_TRAIL')}
            variant="raised"
            >
              Edit Trail
            </Button>

          }

            <List className={classes.root}>
              <ColorPicker
                editableTrail={editableTrail}
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
                editableTrail={editableTrail}
                hydrants={hydrants}
                hydrantDeleted={hydrantDeleted}
                modifyHydrant={modifyHydrant}
              />

            </List>

          </CardContent>
        </Card>
      </div>
    );
  }
}

export default withStyles(styles)(TrailForm);
