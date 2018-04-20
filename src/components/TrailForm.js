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


class TrailForm extends React.Component {


  render() {
    const {
      classes,
      modifyTrail,
      editableTrail,
      trailEditable
    } = this.props;

    const deletePoly = (featureIndex) => {
      console.log(featureIndex)
    }

    if(!editableTrail){
      return null
    }

    const polygons = editableTrail.get('features').map((feature, index) => {
      return (
        <ListItem key={feature.get('id')}>
          {`Trail Section ${index + 1}`}
          <Delete onClick={ () => {deletePoly(index)}} />
        </ListItem>
      )
    })

    return (
      <div>
        <Card className={classes.card}>
          <CardContent>
            <Typography className={classes.title} color="textSecondary">
              Trail
            </Typography>

            <List>
            {polygons}
            </List>

            // <Button variant="raised" color="secondary" >
            //   Delete
            //   <Delete />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default withStyles(styles)(TrailForm);
