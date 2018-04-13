import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import classNames from 'classnames';
import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import List from 'material-ui/List';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TrailList from './TrailList';
import OpenLayersMap from './OpenLayersMap';
import MapControls from './MapControls';
import ImportExport from './ImportExport';


const drawerWidth = 240;

const styles = theme => ({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing.unit * 9,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
  },
});


class MiniDrawer extends React.Component {
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
      trailSelected } = this.props;

    console.log(this.props)
    return (
      <div className={classes.root}>
        <AppBar
          position="absolute"
          className={classNames(classes.appBar, this.state.open && classes.appBarShift)}
        >
          <Toolbar disableGutters={!this.state.open}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={this.handleDrawerOpen}
              className={classNames(classes.menuButton, this.state.open && classes.hide)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="title" color="inherit" noWrap>
              SnoTrack
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          classes={{
            paper: classNames(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
          }}
          open={this.state.open}
        >
          <div className={classes.toolbar}>
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
        <main className={classes.content}>
          <div className={classes.toolbar} />

          <OpenLayersMap
            mode={mode}
            canCreate={canCreate}
            createObject={createObject}
            modifyTrail={modifyTrail}
            modifyHydrant={modifyHydrant}
            trails={trails}
            hydrants={hydrants}
            selectedTrail={selectedTrail}
          />

          <MapControls
            mode={mode}
            changeMode={changeMode}
          />

          <ImportExport
            importKMLClicked= {importKMLClicked}
            trails = {trails}
            hydrants = {hydrants}
           />


        </main>
      </div>
    );
  }
}


export default withStyles(styles, { withTheme: true })(MiniDrawer);




// <TrailList
//   modifyTrail={this.modifyTrail}
//   canCreate={canCreate}
//   toggleCreate={() => this.setState({canCreate: !canCreate})}
//   trails={trails}
//   mode={mode}
//   hydrants={hydrants}
//   selected={selectedTrail}
//   trailSelected={(id) => this.setState({ selectedTrail: id, canCreate: false })}
// />
