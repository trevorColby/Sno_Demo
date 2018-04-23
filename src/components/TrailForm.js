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



const styles = theme => ({
  root: {
    width: '100%'
  },
  input: {
    float: 'left',
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
  }
});


class TrailForm extends React.Component {

  state = { hydrantsOpen: false, trailSectionsOpen: true }

  render() {
    const {
      classes,
      modifyTrail,
      editableTrail,
      trailEditable,
      interaction,
      interactionChanged,
      hydrants
    } = this.props;

    const isTrailMode = interaction === 'DRAW_MODIFY_TRAIL'

    const deletePoly = (featureIndex) => {
      const newFeatures = _.clone(editableTrail.get('features'))
      newFeatures.splice(featureIndex,1)
      modifyTrail(editableTrail.get('id'), {features: newFeatures})
    }

    const deleteHydrant = (hydrant) => {
      console.log(hydrant)
    }

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

    const trailHydrants = hydrants.filter((h) => h.get('trail') === editableTrail.get('id'));
    const hydrantsList = trailHydrants.map((h) => {
      return (
        <li key={h.get('name')}>
          {h.get('name')}
        </li>
      );
    })


    console.log(hydrantsList)





    return (
      <div className={classes.root}>
        <Card className={classes.card}>
          <CardContent>
            <Typography className={classes.title} variant="title" color="textSecondary">
              <Input
              className={classes.input}
              value={editableTrail.get('name')}
              onChange={(e)=>{ modifyTrail(editableTrail.get('id'), { name: e.target.value }) }}
              >
              </Input>
            </Typography>
            <List className={classes.root}>

              <ListItem disableGutters onClick={()=> { this.setState({ trailSectionsOpen: !this.state.trailSectionsOpen })} }>
                <ListItemText classNames={classes.inset} primary="Trail Sections" />
                {this.state.trailSectionsOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={this.state.trailSectionsOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                {trailsSectionsList}
                </List>
              </Collapse>

              <ListItem disableGutters  onClick={()=> { this.setState({ hydrantsOpen: !this.state.hydrantsOpen })} }>
                <ListItemText classNames={classes.inset} primary="Hydrants" />
                {this.state.hydrantsOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={this.state.hydrantsOpen} timeout="auto" unmountOnExit>
                <ul>
                  {trailHydrants.map((h) => {
                    return (
                      <li key={h.get('name')}>
                        {h.get('name')}
                      </li>
                    );
                  })}
                </ul>
              </Collapse>

            </List>

          </CardContent>

          {isTrailMode ?
          (
            <Button
            onClick={()=> interactionChanged('DRAW_MODIFY_HYDRANTS')}
            variant
            >
            Edit Hydrants
            </Button>
          ) :
          <Button
          onClick={()=> interactionChanged('DRAW_MODIFY_TRAIL')}
          >
            Edit Trail
          </Button>

        }

          <Button
          onClick={()=> {trailEditable(null)}}
          >
          Close
          </Button>

        </Card>
      </div>
    );
  }
}

export default withStyles(styles)(TrailForm);
