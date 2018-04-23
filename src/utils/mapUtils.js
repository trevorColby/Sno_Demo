import Stroke from 'ol/style/stroke';
import Fill from 'ol/style/fill';
import Text from 'ol/style/text';
import Style from 'ol/style/style';
import LinearRing from 'ol/geom/linearring';
import RegularShape from 'ol/style/regularshape';
import axios from 'axios';
import _ from 'lodash';

export function getMapStyle(feature, resolution) {
  if (feature.getGeometry().getType() === 'Point') {
    // hydrant styling defaults
    const fill = new Fill({ color: 'rgba(222, 49, 33, 0.4)' });
    const stroke = new Stroke({
      color: 'black',
      width: 2,
    });
    let radius = 3;
    let text;
    if (feature.get('selected')) {
      // changes for selected hydrants
      fill.setColor('rgba(222, 49, 33, 0.8)');
      radius = 11;
      text = new Text({
        text: feature.get('name') || feature.getId(),
        stroke: new Stroke({
          color: '#FFFFFF',
          width: 2,
        }),
      });
    }
    return new Style({
      image: new RegularShape({
        fill,
        stroke,
        radius,
        points: 6,
        angle: Math.PI / 4,
      }),
      text,
    });
  } else if (feature.getGeometry().getType() === 'Polygon') {
    // trail styling defaults
    const text = new Text({
      overflow: true,
      text: feature.get('name') || 'New Trail',
      stroke: new Stroke({
        color: '#FFFFFF',
        width: 1.5,
      }),
    });
    const fill = new Fill({ color: 'rgba(255,255,255,0.2)' });
    const stroke = new Stroke({
      color: '#3399CC',
      width: 0.75,
    });
    if (feature.get('selected')) {
      // changes for selected trails
      fill.setColor('rgba(255,255,255,0.7)');
      stroke.setWidth(3);
    }
    return new Style({
      fill,
      stroke,
      text,
    });
  }
}

// Takes a series of ol coordinates and returns the elevation profile for those coordinates
export function getElevation(coords) {
  const key = 'Rnodo0GTN0IK8fpaVlRuTh3H0vX7yX6T';
  return axios.get('http://open.mapquestapi.com/elevation/v1/profile', {
    params: {
      key,
      unit: 'f',
      shapeFormat: 'raw',
      latLngCollection: coords,
    },
  })
    .then(resp => {
      // convert response into elevation profile with original coordinates
      return _.map(resp.data.elevationProfile, (pt, i) => {
        // when the mapquestapi can't calculate elevation it return -32768
        // let's correct it to null
        if (pt.height === -32768) {
          pt.height = null;
        }
        pt.latitude = resp.data.shapePoints[i*2];
        pt.longitude = resp.data.shapePoints[i*2 + 1];
        return pt;
      });
    });
}

export function convertTrailFeaturesToDonuts(trail) {
  const features = trail.get('features');
  if (features.length > 1) {
    const ringIndexes = [];
    _.each(features, (f, index) => {
      const coords = f.getGeometry().getCoordinates()[0];
      _.each(features, (f2) => {
        const isInside = _.reduce(coords, (soFarIsInside, coord) => {
          return soFarIsInside && f2.getGeometry().intersectsCoordinate(coord);
        }, true);
        if (isInside) {
          f2.getGeometry().appendLinearRing(new LinearRing(coords));
          f.setId(`${f.getId()}-bad`);
          f2.changed();
          ringIndexes.push(index);
        }
      });
    });
    const newFeatures = _.clone(features);
    _.each(ringIndexes.sort((a, b) => b - a), i => newFeatures.splice(i, 1));
    return trail.set('features', newFeatures);
  }
  return trail;
}
