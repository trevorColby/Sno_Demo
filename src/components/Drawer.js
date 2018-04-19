import React from 'react';
import _ from 'lodash';
import { Button } from 'material-ui';
import { withStyles } from 'material-ui/styles';
import classNames from 'classnames';
import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import List from 'material-ui/List';
import { MenuItem } from 'material-ui/Menu';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Tooltip from 'material-ui/Tooltip';
import CallMerge from '@material-ui/icons/CallMerge';

import TrailList from './TrailList';
import OpenLayersMap from './OpenLayersMap';
import ImportExport from './ImportExport';

class PersistentDrawer extends React.Component {
  state = {
    open: false,
  };

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  render() {

    const { classes, theme, modifyTrail, canCreate, trails, mode, hydrants,
      selectedTrail, toggleCreate, createObject, modifyHydrant, changeMode, importKMLClicked,
      trailSelected, interaction, interactionChanged, drawEnd } = this.props


    const drawerHeaderTitle = {
      'trails': 'Trails',
      'hydrants': 'Hydrants',
    }

    return (
      <div>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(PersistentDrawer);
