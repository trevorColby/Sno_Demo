import React from 'react';
import { CompactPicker } from 'react-color';
import { withStyles } from '@material-ui/core/styles';
// import Button from '@material-ui/core/Button';
import { ListItem, ListItemText } from '@material-ui/core/';
import Collapse from '@material-ui/core/Collapse';
// import FiberManualRecord from '@material-ui/icons/FiberManualRecord';


const styles = theme => ({
  inset: {
    paddingLeft: 0,
  },
  icon: {
    fontSize: 60,
    boxShadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)',
  },
});


class ColorPicker extends React.Component {
  state={
    open: false,
  }

  render() {
    const {
      classes,
      trail,
      modifyTrail,
    } = this.props;

    const changeColor = (color) => {
      const updateColor = `${color.rgb.r},${color.rgb.g},${color.rgb.b}`;
      modifyTrail(trail.get('id'), { fillColor: updateColor });
    };

    const [r, g, b] = trail.get('fillColor').split(',');

    const colorObj = { r, g, b };

    return (
      <div>
        <ListItem disableGutters>
          <ListItemText className={classes.inset} primary="Trail Shading:" />

          <button
            style={{
background: `rgba(${trail.get('fillColor')})`,
                    fontSize: 60,
                    boxShadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)',
                    height: 40,
                    width: 40,
                    }}
            onClick={() => { this.setState({ open: !this.state.open }); }}
          />

        </ListItem>

        <Collapse style={{ paddingBottom: 10 }} in={this.state.open} timeout="auto" unmountOnExit>
          <CompactPicker
            color={colorObj}
            onChangeComplete={changeColor}
          />
        </Collapse>
      </div>
    );
  }
}

export default withStyles(styles)(ColorPicker);
