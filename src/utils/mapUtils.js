import Stroke from 'ol/style/stroke';
import Fill from 'ol/style/fill';
import Text from 'ol/style/text';
import Style from 'ol/style/style';
import LinearRing from 'ol/geom/linearring';
import RegularShape from 'ol/style/regularshape';
import axios from 'axios';
import _ from 'lodash';

export function getMapStyle(feature, resolution) {

  const HIGHLIGHT_COLOR = 'yellow';
  const DEFAULT_OPACITY = 0.2;
  const SELECTED_OPACITY = 0.4;


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

    if (feature.get('highlighted')) {
      fill.setColor(HIGHLIGHT_COLOR)
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

    const baseColor = `rgba(${feature.get('fillColor') || '255,255,255'}`;
    const fill = new Fill({ color: `${baseColor},${DEFAULT_OPACITY})`});


    const stroke = new Stroke({
      color: `${baseColor},1)`,
      width: 0.75,
    });
    if (feature.get('selected')) {
      // changes for selected trails
      fill.setColor(`${baseColor},${SELECTED_OPACITY})`);
      stroke.setWidth(3);
    }
    if (feature.get('highlighted')){
      fill.setColor(HIGHLIGHT_COLOR);
    }
    return new Style({
      fill,
      stroke,
      text,
    });
  }
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


export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
