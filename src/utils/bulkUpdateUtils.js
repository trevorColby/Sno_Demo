import Immutable from 'immutable';
import _ from 'lodash';
import SourceVector from 'ol/source/vector';
import { mapquestApi } from './api';

export function getElevations(hydrants, handleNewHydrants) {
  // make it an array to ensure consistent order
  const needsElevation = hydrants.filter(h => !h.get('elevation')).toArray();
  const coords = _.map(needsElevation.slice(0, 24), (h) => _.clone(h.get('coords')).reverse());
  mapquestApi.fetchElevationForCoords(coords)
    .then(resp => {
      const updatedHydrants = _.map(needsElevation.slice(0, 24), (h, index) => {
        return h.set('elevation', resp[index].elevation);
      });
      // return to immutable dictionary object and pass to the handler
      const updatedHydrantsMap = Immutable.Map(_.keyBy(updatedHydrants, h => h.get('id')));
      handleNewHydrants(updatedHydrantsMap);
    });
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
  let multiple = 0,
    single = 0,
    closest = 0;
  const newHydrants = hydrants.filter(h => h.get('trail') === null).map((h) => {
    /*
      Just use the feature xy coordinates since the
      trail features are already in that format too.
      No point converting both since it's not user-facing.
    */
    const point = h.get('feature').getGeometry().getCoordinates();
    const matches = sourceVector.getFeaturesAtCoordinate(point);
    let feature;
    if (matches.length) {
      if (matches.length > 1) {
        // This shouldn't happen, it means we have overlapping trail polygons
        multiple += 1;
      } else {
        single += 1;
      }
      [feature] = matches;
    } else {
      closest += 1;
      feature = sourceVector.getClosestFeatureToCoordinate(point);
    }
    const trailId = feature.getId().split('-')[1];
    return h.set('trail', trailId);
  });

  return newHydrants;
}
