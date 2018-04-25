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
import Projection from 'ol/proj/projection';
import Geometry from 'ol/geom/geometry';

const styles = {
  card: {
    minWidth: 275,
    position: 'absolute',
    bottom: '10em',
    right: '1em',
  },
  textField: {
    marginLeft: '1em',
    marginRight: '1em',
    width: 200,
    display: 'block',
  },
  title: {
    marginBottom: 16,
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
};


class HydrantForm extends React.Component {
  render() {
    const {
      classes, hydrant,
      modifyHydrant, hydrantDeleted,
      trails
    } = this.props;

    const updateCoords = (e, coordIndex) => {
      const newCoords = _.clone(hydrant.get('coords'));
      newCoords.splice(coordIndex, 1, Number(e.target.value))
      modifyHydrant(hydrant.get('id'), { coords: newCoords })
    };

    const selections = (trail) => {
      return (
        <MenuItem key={trail.id} value={trail.id}> {trail.name} </MenuItem>
      );
    };
    // if (!hydrant) {
    //   return null;
    // }

    return (
      <div>
        <Card className={classes.card}>
          <CardContent>
            <Typography className={classes.title} color="textSecondary">
              Hydrant
            </Typography>

            <FormControl>
              <InputLabel htmlFor="trail-simple'"> Trail Name </InputLabel>
              <Select
                onChange={(e) => { modifyHydrant(hydrant.get('id'), { trail: e.target.value }); }}
                value={hydrant.get('trail') || null}
                inputProps={{
                  name: 'trail',
                  id: 'trail-simple',
                }}
              >
              <MenuItem value={null}> None </MenuItem>
              {_(trails.toJS()).values().orderBy('name').map((item) => selections(item)).value()}
              </Select>
            </FormControl>

            <TextField
              id="name"
              label="Name"
              className={classes.textField}
              onChange={(e) => { modifyHydrant(hydrant.get('id'), { name: e.target.value }); }}
              value={hydrant.get('name') || 'Unnamed'}
              margin="normal"
            />

            <FormControl fullWidth>
              <InputLabel> Coordinates </InputLabel>
              <Input
                type="number"
                value={hydrant.get('coords')[1]}
                onChange={(e) => { updateCoords(e, 1); }}
              />
              <FormHelperText>Lat.</FormHelperText>
              <Input
                type="number"
                value={hydrant.get('coords')[0]}
                onChange={(e)=> { updateCoords(e, 0); }}
              />
              <FormHelperText>Lng.</FormHelperText>
            </FormControl>

            <TextField
              id="elevation"
              label="Elevation"
              className={classes.textField}
              onChange={(e) => { modifyHydrant(hydrant.get('id'), { elevation: e.target.value }); }}
              value={hydrant.get('elevation') || 'Null'}
              margin="normal"
            />
            <Button variant="raised" color="secondary" onClick={() => { hydrantDeleted(hydrant.get('id')); }} >
              Delete
              <Delete />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default withStyles(styles)(HydrantForm);
