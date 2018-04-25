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
      drawerOpen: true,
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
    const { interaction, selectedTrail, trails, addTrail, addHydrant, modifyTrail } = this.props;
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
      hydrants, trails,
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
    // do some if to choose to render the TrailForm here instead of TrailList
    return (
      <div>
        <div className={classes.drawerHeader}>
          <Button
            variant="raised"
            color={interaction === 'DRAW_MODIFY_TRAIL' ? 'primary' : 'default'}
            onClick={() => interactionChanged('DRAW_MODIFY_TRAIL')}
          >Trails</Button>
          <Button
            variant="raised"
            color={interaction === 'DRAW_MODIFY_HYDRANTS' ? 'primary' : 'default'}
            onClick={() => interactionChanged('DRAW_MODIFY_HYDRANTS')}
          >Hydrants</Button>

          <IconButton onClick={() => this.setState({ drawerOpen: false })}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>

        </div>
        <TrailList
          newTrailClicked={this.newTrailClicked}
          modifyTrail={modifyTrail}
          trails={trails}
          trailSelected={(id) => trailSelected(selectedTrail, id)}
          hydrants={hydrants}
          selected={selectedTrail}
        />
      </div>
    );
  }

  render() {
    const {
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
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => this.setState({drawerOpen: true})}
                className={classNames(classes.menuButton, drawerOpen && classes.hide)}
              >
                <MenuIcon />
              </IconButton>
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
            selectedTrail={selectedTrail}
            hydrantSelected={hydrantSelected}
            focusedHydrant={focusedHydrant}
          />
          <HydrantForm
            hydrant={hydrants.get(selectedHydrant)}
            modifyHydrant={modifyHydrant}
            hydrantDeleted={hydrantDeleted}
            trails={trails}
          />
      )
        </main>
      </div>
    </div>
    );
  }
}

const mapStateToProps = state => ({
  trails: state.trails.trails,
  hydrants: state.hydrants.hydrants,
  selectedTrail: state.selectedTrail,
  interaction: state.interaction,
  selectedHydrant: state.selectedHydrant,
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
});

export default compose(
  withStyles(appStyles, { withTheme: true }),
  connect(mapStateToProps, mapDispatchToProps),
)(Container);
