import React from 'react';
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
import MapControls from './MapControls';
import ImportExport from './ImportExport';
import HydrantForm from './HydrantForm';

const drawerWidth = 300;

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paperAnchorDockedLeft: {
    background: 'black',
  },
  drawerPaper: {
    background: '#ffffffde',
  },
  appBar: {
    background: '#040404',
    position: 'absolute',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  'appBarShift-right': {
    marginRight: drawerWidth,
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
  hide: {
    display: 'none',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
    background: 'white'
  }
});


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
      trailSelected, selectedHydrant, hydrantSelected } = this.props


    const drawerHeaderTitle = {
      'trails': 'Trails',
      'hydrants': 'Hydrants',
    }

    const { open } = this.state;

    const drawer = (
      <Drawer
        variant="persistent"
        anchor='left'
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>

          <Tooltip title="Auto Associate Hydrants" placement="top-start">
            <IconButton>
              <CallMerge />
            </IconButton>
          </Tooltip>

          <ImportExport
            importKMLClicked={importKMLClicked}
            trails={trails}
            hydrants={hydrants}
          />

          <Typography variant="title" color="inherit">
            {drawerHeaderTitle[mode]}
          </Typography>
          <IconButton onClick={this.handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>

        </div>

        <TrailList
          modifyTrail={modifyTrail}
          canCreate={canCreate}
          toggleCreate={toggleCreate}
          trails={trails}
          trailSelected={trailSelected}
          mode={mode}
          hydrants={hydrants}
          selected={selectedTrail}
        />
      </Drawer>
    );

    let hydrantForm;
    if (selectedHydrant) {
      hydrantForm = (
        <HydrantForm
          selectedHydrant={hydrants.get(selectedHydrant)}
          modifyHydrant={modifyHydrant}
          hydrantSelected={hydrantSelected}
        />
      )
    }

    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <AppBar
            className={classNames(classes.appBar, {
              [classes.appBarShift]: open,
              [classes[`appBarShift-left`]]: open,
            })}
          >
            <Toolbar disableGutters={!open}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={this.handleDrawerOpen}
                className={classNames(classes.menuButton, open && classes.hide)}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="title" color="inherit" noWrap>
                SnoTrack
              </Typography>
              <MapControls
                mode={mode}
                changeMode={changeMode}
              />
            </Toolbar>
            <div id="searchLocations"></div>
          </AppBar>
          {drawer}
          <main
            className={classNames(classes.content, classes[`content-left`], {
              [classes.contentShift]: open,
              [classes[`contentShift-left`]]: open,
            })}
          >
            <div className={classes.drawerHeader} />

            <OpenLayersMap
              mode={mode}
              canCreate={canCreate}
              createObject={createObject}
              modifyTrail={modifyTrail}
              modifyHydrant={modifyHydrant}
              trails={trails}
              hydrants={hydrants}
              selectedTrail={selectedTrail}
              hydrantSelected={hydrantSelected}
            />

            {hydrantForm}

          </main>
          {drawer}
        </div>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(PersistentDrawer);
