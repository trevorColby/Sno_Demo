import React from 'react';
import { withStyles } from 'material-ui/styles';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Delete from '@material-ui/icons/Delete';

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


function HydrantForm(props) {

const { classes, selectedHydrant, modifyHydrant, hydrantDeleted } = props;

// const handleChange = (e) => {
//   console.log(selectedHydrant)
//     modifyHydrant(selectedHydrant.get('id'), { name: e.target.value });
// }
//


return (
  <div>
    <Card className={classes.card}>
      <CardContent>
        <Typography className={classes.title} color="textSecondary">
          Hydrant
        </Typography>

        <TextField
          id="name"
          label="Name"
          className={classes.textField}
          onChange={(e) => { modifyHydrant(selectedHydrant.get('id'), { name: e.target.value }); }}
          value={selectedHydrant.get('name') || ''}
          margin="normal"
        />

        <TextField
          id="trail"
          label="Trail"
          className={classes.textField}
          onChange={(e) => { modifyHydrant(selectedHydrant.get('trail'), { trail: e.target.value }); }}
          value={selectedHydrant.get('trail') || ''}
          margin="normal"
        />

        <TextField
          id="coords"
          label="Coordinates"
          className={classes.textField}
          onChange={(e) => { modifyHydrant(selectedHydrant.get('id'), { coords: e.target.value }); }}
          value={selectedHydrant.get('coords') || ''}
          margin="normal"
        />

        <TextField
          id="elevation"
          label="Elevation"
          className={classes.textField}
          onChange={(e) => { modifyHydrant(selectedHydrant.get('id'), { elevation: e.target.value }); }}
          value={selectedHydrant.get('elevation') || ''}
          margin="normal"
        />

        <Button variant="raised" color="secondary" onClick={() => { hydrantDeleted(selectedHydrant.get('id')); }} >
          Delete
          <Delete />
        </Button>

      </CardContent>
    </Card>
  </div>
)

}

export default withStyles(styles)(HydrantForm);
