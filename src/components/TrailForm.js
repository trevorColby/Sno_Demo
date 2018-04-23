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
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';



const styles = {
  root: {
    float: 'right',
  },
  input: {
    float: 'left',
  },
  card: {
  },
  textField: {
    marginLeft: '1em',
    marginRight: '1em',
    width: 200,
    display: 'block',
  },
  pos: {
    marginBottom: 12,
  },
};


class TrailForm extends React.Component {

  render() {
    const {
      classes,
      modifyTrail,
      editableTrail,
      trailEditable,
      interaction,
      interactionChanged
    } = this.props;

    const isTrailMode = interaction === 'DRAW_MODIFY_TRAIL'

    const deletePoly = (featureIndex) => {
      const newFeatures = _.clone(editableTrail.get('features'))
      newFeatures.splice(featureIndex,1)
      modifyTrail(editableTrail.get('id'), {features: newFeatures})
    }

    const highlightPoly = (feature) => {
      feature.set('highlighted', true)
      feature.changed()
    }

    const unHighlightPoly = (feature) => {
      feature.unset('highlighted')
      feature.changed()
    }

    if(!editableTrail){
      return null
    }

    const polygons = editableTrail.get('features').map((feature, index) => {
      unHighlightPoly(feature)
      return (
        <ListItem key={feature.get('id')} onMouseEnter={() => highlightPoly(feature)} onMouseLeave={()=> unHighlightPoly(feature)}>
          {`Trail Section ${index + 1}`}
          <Delete onClick={ () => {deletePoly(index)}} />
        </ListItem>
      )
    })



    return (
      <div>
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
            <List
            className={classes.root}
            >
            {polygons}
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
