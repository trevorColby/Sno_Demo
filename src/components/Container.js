import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';
import _ from 'lodash';
import {
  withStyles,
  IconButton, Drawer, Button, Typography,
  Toolbar, AppBar, InputLabel
} from 'material-ui';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Projection from 'ol/proj';
import { Trail, Hydrant } from '../utils/records';
import appStyles from '../styles/drawer';

import TrailList from './TrailList';
import OpenLayersMap from './OpenLayersMap';
import ImportExport from './ImportExport';
import TrailForm from './TrailForm';
import AutoAssociate from './AutoAssociate';
import ManualAssociateHydrantsForm from './ManualAssociateHydrantsForm';
import OperationMessage from './OperationMessage';
import TimeLine from '@material-ui/icons/Timeline';
import Tooltip from 'material-ui/Tooltip';
import AddLocation from '@material-ui/icons/AddLocation';
import Card, { CardContent, CardHeader } from 'material-ui/Card';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import Refresh from '@material-ui/icons/Refresh';
import { getElevations } from '../utils/bulkUpdateUtils'

import ActionTypes from '../redux/ActionTypes';

const {
  DATA_IMPORTED,
  TRAIL_ADDED,
  TRAIL_MODIFIED,
  TRAIL_SELECTED,
  TRAIL_DELETED,
  HYDRANT_ADDED,
  HYDRANT_MODIFIED,
  INTERACTION_CHANGED,
  HYDRANT_SELECTED,
  EDIT_TRAIL,
  HYDRANT_DELETED,
  MANUAL_ASSIGNMENT_ITEMS_ADDED,
  MANUAL_ASSIGNMENT_OPENED,
  MANUAL_ASSIGNMENT_CLOSED,
  MANUAL_ASSIGNMENT_HYDRANT_FOCUSED,
  UPDATE_MANUAL_TRAIL_ASSOCIATION
} = ActionTypes;



class Container extends React.Component {
  constructor(props) {
    super(props);
    this.drawEnd = this.drawEnd.bind(this);
    this.modifyEnd = this.modifyEnd.bind(this);
    this.state = {
      drawerOpen: false,
      message: null,
      importExportOpen: false
    };
  }

  setMessageToNull = () => {
    this.setState({
        message: null
    })
  }

  setImportExportOpen = (bool) => {
      this.setState({
        importExportOpen: bool
      });
    }

  newTrailClicked = () => {
    const { addTrail, trailSelected, selectedTrail,toggledEditing } = this.props;
    let id = new Date().getTime();
    id = id.toString();
    const name = 'New Trail';
    const trail = new Trail({ id, name, features: [] });
    addTrail(trail);
    trailSelected(selectedTrail, trail.get('id'))
    toggledEditing(true)

    this.setState({
      message: 'New Trail Added',
      drawerOpen: true
    });
  }


  drawEnd(e) {
    const { feature } = e;
    const { interaction, selectedTrail, editableTrail, trails, addTrail, addHydrant, modifyTrail, hydrants } = this.props;
    if (interaction === 'DRAW_MODIFY_TRAIL') {
      const trail = trails.get(selectedTrail);
      // set attributes on the feature, create a unique feature id
      _.each(trail.get('features'), (f, index) => {
        const id = `t-${trail.get('id')}-${index}`;
        if (f.getId() !== id) {
          f.setId(id);
        }
      });
      const id = `t-${trail.get('id')}-${trail.get('features').length}`;

      feature.set('fillColor', trail.get('fillColor'));
      feature.set('name', trail.get('name'));
      feature.set('selected', true);
      feature.setId(id);
      // modify the trail with new features array
      const newFeatures = trail.get('features').concat(feature);
      modifyTrail(trail.get('id'), { features: newFeatures });
    } else if (interaction === 'DRAW_MODIFY_HYDRANTS') {
      const mapCoords = feature.getGeometry().getCoordinates();
      const coords = Projection.toLonLat(mapCoords);

      const name = `${hydrants.filter(h => h.get('trail') === selectedTrail).size + 1}`;

      let id = new Date().getTime();
      id = id.toString();
      const newHydrant = new Hydrant({
        id,
        name,
        coords,
        feature,
        trail: selectedTrail,
      });
      feature.setId(`h-${id}-0`);
      feature.set('name', name);
      if (selectedTrail) {
        feature.set('selected', true);
      }
      addHydrant(newHydrant);
    }
  }

  modifyEnd(e) {
    const { interaction, modifyHydrant } = this.props;
    const { features } = e;
    if (interaction === 'DRAW_MODIFY_HYDRANTS' && features.item(0)) {
      const feature = features.item(0);
      const hydrantId = feature.getId().split('-')[1];
      const mapCoords = feature.getGeometry().getCoordinates();
      const coords = Projection.toLonLat(mapCoords);
      modifyHydrant(hydrantId, { coords });
    }
  }

  renderDrawerContents = () => {
    const {
      hydrants, trails,editableTrail,toggledEditing,
      selectedTrail, trailSelected,
      modifyTrail, modifyHydrant,
      dataImported, interaction, interactionChanged,
      classes, theme, selectedHydrant, hydrantDeleted,
      hydrantSelected, closeManualAssignment,
      manualAssignmentItems, focusedHydrant,
      focusHydrant, manualAssignmentOpen, trailDeleted, manualAssignmentItemsAdded,
      openManualAssignment
    } = this.props;

    const orphanCount = hydrants.filter((h) => h.get('trail') === null).size;


    if (manualAssignmentOpen) {
      return (
        <ManualAssociateHydrantsForm
          trails={trails}
          dataImported={dataImported}
          manualAssignmentItems={manualAssignmentItems}
          focusHydrant={focusHydrant}
          focusedHydrant={focusedHydrant}
          closeManualAssignment={closeManualAssignment}
        />
      );
    }

    if (editableTrail) {
      return (
        <TrailForm
          dataImported={dataImported}
          trailDeleted={trailDeleted}
          interactionChanged={interactionChanged}
          interaction={interaction}
          toggledEditing={toggledEditing}
          trail={trails.get(selectedTrail)}
          modifyTrail={modifyTrail}
          hydrants={hydrants}
          hydrantDeleted={hydrantDeleted}
          modifyHydrant={modifyHydrant}
        />
      )
    }

    if (trails.size === 0 && orphanCount === 0) {
      return (

        <Card raised={true} >
          <CardHeader
          title="Getting Started"

          />
          <CardContent>
            <Typography variant="body2" >
              Get Started By Importing exisiting KML Trail Features
              or Adding Features Manually.
            </Typography>

            <Button color='primary' variant='raised' onClick={this.newTrailClicked} fullWidth>
            Create A Trail
            </Button>

            <Button color='primary' variant='raised' onClick={() => { interactionChanged('DRAW_MODIFY_HYDRANTS')}} fullWidth>
            Drop Hydrants
            </Button>

            <Button color='primary' variant='raised' onClick={() => this.setImportExportOpen(true)} fullWidth>
              Import Features
            </Button>

          </CardContent>
        </Card>


      )

    }

    return (
      <div>
        <TrailList
          dataImported={dataImported}
          manualAssignmentItemsAdded={manualAssignmentItemsAdded}
          openManualAssignment={openManualAssignment}
          manualAssignmentItems={manualAssignmentItems}
          toggledEditing={toggledEditing}
          newTrailClicked={this.newTrailClicked}
          modifyTrail={modifyTrail}
          trails={trails}
          trailSelected={(id) => trailSelected(selectedTrail, id)}
          hydrants={hydrants}
          selected={selectedTrail}
          interactionChanged={interactionChanged}
        />
      </div>
    );
  }

  render() {
    const {
      toggledEditing,
      editableTrail,
      hydrants, trails,
      selectedTrail, trailSelected,
      modifyTrail, modifyHydrant,
      dataImported, interaction, interactionChanged,
      classes, theme, selectedHydrant, hydrantDeleted,
      hydrantSelected, openManualAssignment,
      manualAssignmentItems, manualAssignmentItemsAdded, focusedHydrant,
    } = this.props;



    const { drawerOpen, message, importExportOpen } = this.state;
    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <AppBar
            color='primary'
            className={classNames(classes.appBar, {
              [classes.appBarShift]: drawerOpen,
              [classes[`appBarShift-left`]]: drawerOpen,
            })}
          >

            <Toolbar disableGutters={!drawerOpen}>
            {drawerOpen? (
              <IconButton style={{color:'white'}} onClick={()=> { this.setState({drawerOpen:false})} }>
                {<ChevronLeftIcon />}
              </IconButton>
            ) : (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => this.setState({drawerOpen: true})}
                className={classNames(classes.menuButton, drawerOpen && classes.hide)}
              >
                <MenuIcon />
              </IconButton>
            )
            }

              <Typography variant="title" color="inherit" noWrap>
                SnoTrack
              </Typography>

              <div>

                <Tooltip title="New Trail"
                  style={{marginLeft: 50}}
                >
                  <IconButton
                    color='secondary'
                    onClick={this.newTrailClicked}
                  >
                    <TimeLine />
                    <Typography color='secondary' variant="caption">
                    New Trail
                    </Typography>
                  </IconButton>
                </Tooltip>

                <Tooltip title="Add Hydrants"
                  style={{marginLeft: 50}}
                >
                  <IconButton
                    color='secondary'
                    onClick={() => { interactionChanged('DRAW_MODIFY_HYDRANTS')}}
                  >
                    <AddLocation />
                    <Typography color='secondary' variant="caption">
                    New Hydrant
                    </Typography>
                  </IconButton>
                </Tooltip>

                <Tooltip style={{marginLeft: 50}} title="Import/Export" >
                  <IconButton
                    onClick={()=> this.setImportExportOpen(true)}
                    variant='raised'
                    color='secondary'
                  >
                    <ImportExportIcon />
                    <Typography color='secondary' variant="caption">
                    Import Export
                    </Typography>
                  </IconButton>
                </Tooltip>

                <Tooltip style={{marginLeft: 50}} title="Import/Export" >
                  <IconButton
                    onClick={() => {
                      getElevations()
                      .then(elevMessage => this.setState({ message: elevMessage }))}}
                    variant='raised'
                    color='secondary'
                  >
                    <Refresh />
                    <Typography color='secondary' variant="caption">
                    Fetch Elevation Data
                    </Typography>
                  </IconButton>
                </Tooltip>

              </div>

            </Toolbar>
            <div id="searchLocations"></div>
          </AppBar>
          <Drawer
            variant="persistent"
            anchor='left'
            open={drawerOpen}
            classes={{
              paper: classes.drawerPaper,
            }}
          >

          {this.renderDrawerContents()}
          </Drawer>
          <main
            className={classNames(classes.content, classes[`content-left`], {
              [classes.contentShift]: drawerOpen,
              [classes[`contentShift-left`]]: drawerOpen,
            })}
          >
          <div className={classes.drawerHeader} />

          <OpenLayersMap
            interaction={interaction}
            drawEnd={this.drawEnd}
            modifyEnd={this.modifyEnd}
            trails={trails}
            hydrants={hydrants}
            editableTrail={editableTrail}
            selectedTrail={selectedTrail}
            hydrantSelected={hydrantSelected}
            focusedHydrant={focusedHydrant}
          />

          <OperationMessage
            setMessageToNull={this.setMessageToNull}
            message={message}
           />

           <ImportExport
             setImportExportOpen={this.setImportExportOpen}
             importExportOpen={importExportOpen}
             importKMLClicked={dataImported}
             trails={trails}
             hydrants={hydrants}
           />

        </main>
      </div>
    </div>
    );
  }
}

const mapStateToProps = state => ({
  trails: state.trails.trails,
  hydrants: state.hydrants.hydrants,
  selectedTrail: state.selectedTrail.selected,
  interaction: state.interaction,
  selectedHydrant: state.selectedHydrant,
  editableTrail: state.selectedTrail.editable,
  manualAssignmentItems: state.autoAssignment.manualAssignmentItems,
  manualAssignmentOpen: state.autoAssignment.manualAssignmentOpen,
  focusedHydrant: state.autoAssignment.focusedHydrant,
});

const mapDispatchToProps = dispatch => ({
  modifyTrail: (trailId, editedFields) => dispatch({
    type: TRAIL_MODIFIED, data: { id: trailId, editedFields },
  }),
  modifyHydrant: (hydrantId, editedFields) => dispatch({
    type: HYDRANT_MODIFIED, data: { id: hydrantId, editedFields },
  }),
  addTrail: trail => dispatch({
    type: TRAIL_ADDED, data: trail,
  }),
  addHydrant: hydrant => dispatch({
    type: HYDRANT_ADDED, data: hydrant,
  }),
  trailSelected: (prevSelected, id) => dispatch({
    type: TRAIL_SELECTED, data: { prevSelected, selected: id },
  }),
  hydrantSelected: id => dispatch({
    type: HYDRANT_SELECTED, data: id,
  }),
  dataImported: data => dispatch({
    type: DATA_IMPORTED, data,
  }),
  interactionChanged: data => dispatch({
    type: INTERACTION_CHANGED, data,
  }),
  hydrantDeleted: id => dispatch({
    type: HYDRANT_DELETED, data: { selected: id },
  }),
  manualAssignmentItemsAdded: data => dispatch({
    type: MANUAL_ASSIGNMENT_ITEMS_ADDED, data,
  }),
  openManualAssignment: () => dispatch({
    type: MANUAL_ASSIGNMENT_OPENED,
  }),
  closeManualAssignment: () => dispatch({
    type: MANUAL_ASSIGNMENT_CLOSED,
  }),
  focusHydrant: id => dispatch({
    type: MANUAL_ASSIGNMENT_HYDRANT_FOCUSED, data: id,
  }),
  toggledEditing: state => dispatch({
    type: EDIT_TRAIL, data: state
  }),
  trailDeleted: id => dispatch({
    type: TRAIL_DELETED, data: id
  }),
});

export default compose(
  withStyles(appStyles, { withTheme: true }),
  connect(mapStateToProps, mapDispatchToProps),
)(Container);
