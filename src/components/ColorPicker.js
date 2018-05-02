import React from 'react';
import { SketchPicker } from 'react-color';
import { CompactPicker } from 'react-color';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import { ListItem, ListItemText } from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';


const styles = theme => ({
  inset: {
    paddingLeft: 0
  }
})


class ColorPicker extends React.Component {

  state={
    open: false
  }

  render() {

    const {
      classes,
      editableTrail,
      modifyTrail,
    } = this.props;

    const changeColor = (color) => {
      const updateColor = `${color.rgb.r},${color.rgb.g},${color.rgb.b}`
      modifyTrail(editableTrail.get('id'), {fillColor: updateColor})
    }

    const [r,g,b] = editableTrail.get('fillColor').split(',')

    const colorObj = {r,g,b}

    return (
      <div>
        <ListItem disableGutters>
          <ListItemText className={classes.inset} primary="Trail Shading:" />
          <Button
            onClick={()=> { this.setState({ open: !this.state.open})}}
            style={{backgroundColor: `rgba(${editableTrail.get('fillColor')})`}}
            className={classes.mini}
            variant='fab'
            mini
          />
        </ListItem>

        <Collapse style={{ paddingBottom: 10 }} in={this.state.open} timeout="auto" unmountOnExit>
          <CompactPicker
          color={colorObj}
          onChangeComplete={changeColor}
          />
        </Collapse>
      </div>
    )
  }
}

export default withStyles(styles)(ColorPicker);
