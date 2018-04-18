import React from 'react';
import { withStyles } from 'material-ui/styles';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';

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

const { classes, selectedHydrant, modifyHydrant, hydrantSelected } = props;

const handleChange = (e) => {
    modifyHydrant(selectedHydrant.get('id'), { name: e.target.value });
}



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
          onChange={handleChange}
          value={selectedHydrant.get('name')}
          margin="normal"
        />

        <TextField
          id="name"
          label="Coordinates"
          className={classes.textField}
          value={selectedHydrant.get('coords')}
          margin="normal"
        />

        <TextField
          id="name"
          label="Elevation"
          className={classes.textField}
          value={selectedHydrant.get('elevation')}
          margin="normal"
        />

      </CardContent>
    </Card>
  </div>
)

}

export default withStyles(styles)(HydrantForm);
