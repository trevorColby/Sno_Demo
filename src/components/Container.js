import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';
import _ from 'lodash';
import {
  withStyles,
  IconButton, Drawer, Button, Typography,
  Toolbar, AppBar,
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
import HydrantForm from './HydrantForm';
import TrailForm from './TrailForm';
import AutoAssociate from './AutoAssociate';
import ManualAssociateHydrantsForm from './ManualAssociateHydrantsForm';


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
    };
  }



  newTrailClicked = () => {
    const { addTrail } = this.props;
    let id = new Date().getTime();
    id = id.toString();
    const name = 'New Trail';
    const trail = new Trail({ id, name, features: [] });
    addTrail(trail);
  }

  drawEnd(e) {
    const { feature } = e;
    const { interaction, selectedTrail, editableTrail, trails, addTrail, addHydrant, modifyTrail } = this.props;
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
      const name = '';
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
      hydrants, trails,editableTrail,trailEditable,
      selectedTrail, trailSelected,
      modifyTrail, modifyHydrant,
      dataImported, interaction, interactionChanged,
      classes, theme, selectedHydrant, hydrantDeleted,
      hydrantSelected, closeManualAssignment,
      manualAssignmentItems, focusedHydrant,
      focusHydrant, manualAssignmentOpen,
    } = this.props;

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
          interactionChanged={interactionChanged}
          interaction={interaction}
          trailEditable={trailEditable}
          trail={trails.get(selectedTrail)}
          modifyTrail={modifyTrail}
          hydrants={hydrants}
          hydrantDeleted={hydrantDeleted}
          modifyHydrant={modifyHydrant}
        />
      )
    }
    return (
      <div>
        <TrailList
          trailEditable={trailEditable}
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
      trailEditable,
      editableTrail,
      hydrants, trails,
      selectedTrail, trailSelected,
      modifyTrail, modifyHydrant,
      dataImported, interaction, interactionChanged,
      classes, theme, selectedHydrant, hydrantDeleted,
      hydrantSelected, openManualAssignment,
      manualAssignmentItems, manualAssignmentItemsAdded, focusedHydrant
    } = this.props;



    const { drawerOpen } = this.state;
    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <AppBar
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
              <div style={{ marginLeft: '200px' }}>
                <AutoAssociate
                  trails={trails}
                  hydrants={hydrants}
                  dataImported={dataImported}
                  manualAssignmentItemsAdded={manualAssignmentItemsAdded}
                  openManualAssignment={openManualAssignment}
                  manualAssignmentItems={manualAssignmentItems}
                />
                <ImportExport
                  importKMLClicked={dataImported}
                  trails={trails}
                  hydrants={hydrants}
                />
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
  trailEditable: state => dispatch({
    type: EDIT_TRAIL, data: state
  })
});

export default compose(
  withStyles(appStyles, { withTheme: true }),
  connect(mapStateToProps, mapDispatchToProps),
)(Container);
