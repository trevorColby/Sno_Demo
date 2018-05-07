import Immutable from 'immutable';
import _ from 'lodash';
import SourceVector from 'ol/source/vector';
import { mapquestApi } from './api';
import ActionTypes from '../redux/ActionTypes';
import store from '../redux/store';

const { DATA_IMPORTED } = ActionTypes;

export function getElevations() {
  const { hydrants } = store.getState().hydrants;
  // make it an array to ensure consistent order
  const needsElevation = hydrants.filter(h => !h.get('elevation')).toArray();
  if (needsElevation.length) {
    const coords = _.map(needsElevation, h => _.clone(h.get('coords')).reverse());
    return mapquestApi.fetchElevationForCoords(coords)
      .then((resp) => {
        const updatedHydrants = _.filter(_.map(needsElevation, (h, index) => {
          return h.set('elevation', resp[index].elevation);
        }), h => h.get('elevation'));
        // return to immutable dictionary object and pass to the handler
        if (updatedHydrants.length) {
          const updatedHydrantsMap = Immutable.Map(_.keyBy(updatedHydrants, h => h.get('id')));
          store.dispatch({ type: DATA_IMPORTED, data: { hydrants: updatedHydrantsMap } });
        }
        return needsElevation.length
      });
  }
}

export function autonameHydrants(hydrants, override = false) {
  const sortedTrailGroupedHydrants = hydrants.groupBy(h => h.get('trail'))
    .map((trailGroup) => {
      return trailGroup.toList().sort((h1, h2) => h1.get('elevation') - h2.get('elevation'));
    });
  const newHydrants = hydrants.map((h) => {
    const trail = h.get('trail');
    if (trail) {
      const elevationIndex = sortedTrailGroupedHydrants.get(trail).indexOf(h);
      return h.set('name', String(elevationIndex + 1));
    }
    return h;
  });
  return newHydrants;
}

export function assignHydrantsToTrails(hydrants, trails) {
  const trailFeatures = trails.reduce((curr, t) => curr.concat(t.get('features')), []);
  const sourceVector = new SourceVector({ features: trailFeatures });
  const matchedIds = [];
  const newHydrants = hydrants.filter(h => h.get('trail') === null).map((h) => {
    /*
      Just use the feature xy coordinates since the
      trail features are already in that format too.
      No point converting both since it's not user-facing.
    */
    const id = h.get('id');
    const point = h.get('feature').getGeometry().getCoordinates();
    const matches = sourceVector.getFeaturesAtCoordinate(point);
    let feature;
    if (matches.length) {
      if (matches.length === 1) {
        matchedIds.push(id);
      }
      [feature] = matches;
    } else {
      feature = sourceVector.getClosestFeatureToCoordinate(point);
    }

    const trailId = feature ? feature.getId().split('-')[1] : null;
    return h.set('trail', trailId);
  });

  return [newHydrants, matchedIds];
}
