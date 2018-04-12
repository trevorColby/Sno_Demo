import React from 'react';
import _ from 'lodash';
import Immutable from 'immutable';
import Projection from 'ol/proj';
import MapControls from './MapControls';
import OpenLayersMap from './OpenLayersMap';
import TrailList from './TrailList';
import {getElevation, getMapStyle} from '../utils/mapUtils';
import kill_logo from './../imgs/Kill_Logo.png';
import { Grid } from 'material-ui';
import { Image } from 'react-bootstrap';
import { Trail, Hydrant } from '../utils/records';
import ImportExport from './ImportExport';

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
      selectedTrail: null,
      canCreate: false,
      trails: Immutable.Map(),
      hydrants: Immutable.Map(),
    };
  }

  /*
  componentDidUpdate() {
    const { trails, hydrants } = this.state;
    localStorage.setItem('trails', JSON.stringify(trails.toJS()));
    localStorage.setItem('hydrants', JSON.stringify(hydrants.toJS()));
  }
  */

  modifyTrail = (trailId, editedFields, shouldDelete = false) => {
    const { trails, hydrants, selectedTrail } = this.state;
    if (shouldDelete) {
      const newHydrants = hydrants.map((h) => {
        if (h.get('trail') === trailId) {
          return h.set('trail', null);
        }
        return h;
      });
      this.setState({
        trails: trails.delete(trailId),
        hydrants: newHydrants,
        selectedTrail: trailId === selectedTrail ? null : selectedTrail,
      });
    } else {
      const newTrail = trails.get(trailId)
        .withMutations((tr) => {
          _.each(editedFields, (val, key) => tr.set(key, val));
        });
      newTrail.get('feature').setProperties(editedFields);
      newTrail.get('feature').changed();
      this.setState({ trails: trails.set(trailId, newTrail) });
    }
  }

  modifyHydrant = (hydrantId, editedFields, shouldDelete = false) => {
    const { hydrants } = this.state;
    if (shouldDelete) {
      this.setState({ hydrants: hydrants.delete(hydrantId) });
    } else {
      const newHydrant = hydrants.get(hydrantId)
        .withMutations((h) => {
          _.each(editedFields, (val, key) => h.set(key, val));
        });
      newHydrant.get('feature').setProperties(editedFields);
      newHydrant.get('feature').changed();
      this.setState({ hydrants: hydrants.set(hydrantId, newHydrant) });
    }
  }

  createObject = (feature) => {
    const { hydrants, trails, selectedTrail, mode } = this.state;
    feature.setStyle(getMapStyle);
    let id = new Date().getTime();
    id = id.toString();
    if (mode === 'hydrants') {
      // 1 point, create a hydrant
      const mapCoords = feature.getGeometry().getCoordinates();
      const coords = Projection.toLonLat(mapCoords);
      const name = '';
      const createdHydrant = new Hydrant({
        id, name, coords, feature, trail: selectedTrail !== 'orphans' ? selectedTrail : null,
      });
      feature.setId(`h${id}`);
      const newHydrants = hydrants.set(id, createdHydrant);
      this.setState({ hydrants: newHydrants });
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
      const newTrails = trails.set(id, newTrail);
      this.setState({ trails: newTrails, selectedTrail: id, canCreate: false });
    }
  }
  /*
    dont do this for now to avoid all the api calls
    lets put it in when we associate hydrants maybe?

<<<<<<< HEAD
    getElevation(coords).then((data) => {
      const elevation = data[0].height;
      this.modifyHydrant(id, {elevation});
      this.renameHydrantsByElevation(selectedTrail);
    });
  }*/

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
  }

  importKMLClicked = (kmlData) => {
    const {trails, hydrants} = this.state;
    this.setState({
      trails: trails.merge(kmlData.trails),
      hydrants: hydrants.merge(kmlData.hydrants)
    })
  }

  render(){
    const { trails, mode, selectedTrail, hydrants, canCreate } = this.state;

    return (
      <div>
        <Grid container spacing={0}>
          <Grid item xs={3}>
            <TrailList
              modifyTrail={this.modifyTrail}
              canCreate={canCreate}
              toggleCreate={() => this.setState({canCreate: !canCreate})}
              trails={trails}
              mode={mode}
              hydrants={hydrants}
              selected={selectedTrail}
              trailSelected={(id) => this.setState({ selectedTrail: id, canCreate: false })}
            />
          </Grid>
          <Grid item xs={9}>
            <OpenLayersMap
              mode={mode}
              canCreate={canCreate || mode === 'hydrants'}
              createObject={this.createObject}
              modifyTrail={this.modifyTrail}
              modifyHydrant={this.modifyHydrant}
              trails={trails}
              hydrants={hydrants}
              selectedTrail={selectedTrail}
            />
          </Grid>
        </Grid>
        <MapControls
          mode={mode}
          changeMode={(mode) => this.setState({ mode, canCreate: false })}
        />

        <ImportExport
          importKMLClicked= {this.importKMLClicked}
          trails = {trails}
          hydrants = {hydrants}
         />

        <Image style={{float: 'right', width: 300, margin: 12}} src={kill_logo} responsive />
      </div>
    );
  }
}

export default Container;
