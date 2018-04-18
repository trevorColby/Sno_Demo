import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import Immutable from 'immutable';
import { Grid } from 'material-ui';
import Projection from 'ol/proj';

import { getElevation, getMapStyle } from '../utils/mapUtils';
import { Trail, Hydrant } from '../utils/records';
import ImportExport from './ImportExport';
import Drawer from './Drawer';
import ActionTypes from '../redux/ActionTypes';

const {
  DATA_IMPORTED,
  TRAIL_ADDED,
  TRAIL_MODIFIED,
  TRAIL_SELECTED,
  TRAIL_DELETED,
  HYDRANT_ADDED,
  HYDRANT_MODIFIED,
} = ActionTypes;


class Container extends React.Component {
  constructor(props) {
    super(props);
    /*
    const savedTrails = localStorage.getItem('trails');
    const savedHydrants = localStorage.getItem('hydrants');
    let trails = savedTrails ? JSON.parse(savedTrails) : {};
    let hydrants = savedHydrants ? JSON.parse(savedHydrants) : {};

    let trails = Immutable.fromJS(trails)
    let hydrants = Immutable.fromJS(hydrants)
    */

    this.state = {
      mode: 'trails',
      canCreate: false,
    };
  }

  createObject = (feature) => {
    const { mode } = this.state;
    const { trails, hydrants, selectedTrail, addTrail, addHydrant } = this.props;
    feature.setStyle(getMapStyle);
    let id = new Date().getTime();
    id = id.toString();
    if (mode === 'hydrants') {
      // 1 point, create a hydrant
      const mapCoords = feature.getGeometry().getCoordinates();
      const coords = Projection.toLonLat(mapCoords);
      const name = '';
      const newHydrant = new Hydrant({
        id, name, coords, feature, trail: selectedTrail,
      });
      feature.setId(`h${id}`);
      if (selectedTrail) {
        feature.set('selected', true);
      }
      addHydrant(newHydrant);
    } else {
      const mapCoords = feature.getGeometry().getCoordinates()[0];
      // >1 point, create a trail
      const coords = _.map(mapCoords, (pt) => {
        return Projection.toLonLat(pt);
      });
      const name = 'New Trail';
      const newTrail = new Trail({
        id, name, coords, feature,
      });
      feature.setId(`t${id}`);
      addTrail(newTrail);
      this.setState({ canCreate: false });
    }
  }
  /*
    dont do this for now to avoid all the api calls
    lets put it in when we associate hydrants maybe?

    getElevation(coords).then((data) => {
      const elevation = data[0].height;
      this.modifyHydrant(id, {elevation});
      this.renameHydrantsByElevation(selectedTrail);
    });
  }

  renameHydrantsByElevation = (trailId) => {
    if (!trailId) {
      return;
    }
    const { hydrants } = this.state;

    const sortedTrailHydrants = _(hydrants.toJS())
      .filter((h) => h.trail === trailId)
      .orderBy('elevation', 'desc')
      .map((h, i) => {
        h.name = i + 1;
        return h;
      })
      .value();

    const newHydrants = hydrants.map((h) => {
      if (h.get('trail') === trailId) {
        const elevationIndex = _.findIndex(sortedTrailHydrants, (sortedHydrant) => sortedHydrant.id === h.get('id'));
        const name = String(elevationIndex + 1);
        return h.set('name', name);
      }
      return h;
    });

    this.setState({
      hydrants: newHydrants,
    });
  }*/

  toggleCreate = () => {
    this.setState({
      canCreate: !this.state.canCreate
    })
  }

  changeMode = (mode) => {
    this.setState({
      mode,
      canCreate: false
    })
  }

  trailSelected = (id) => {
    this.props.trailSelected(this.props.selectedTrail, id),
    this.setState({canCreate: false});
  }

  render() {
    const { mode, canCreate } = this.state;
    const { hydrants, trails, selectedTrail, modifyTrail, modifyHydrant, dataImported } = this.props;
    return (
      <Drawer
        mode={mode}
        canCreate={canCreate || mode === 'hydrants'}
        toggleCreate={this.toggleCreate}
        trailSelected={this.trailSelected}
        createObject={this.createObject}
        modifyTrail={modifyTrail}
        modifyHydrant={modifyHydrant}
        trails={trails}
        hydrants={hydrants}
        selectedTrail={selectedTrail}
        changeMode={this.changeMode}
        importKMLClicked={dataImported}
      />
    );
  }
}

const mapStateToProps = state => ({
  trails: state.trails.trails,
  hydrants: state.hydrants.hydrants,
  selectedTrail: state.selectedTrail,
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
  dataImported: data => ({
    type: DATA_IMPORTED, data,
  }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Container);
