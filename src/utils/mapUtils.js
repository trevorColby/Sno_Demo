import Stroke from 'ol/style/stroke';
import Fill from 'ol/style/fill';
import Text from 'ol/style/text';
import Style from 'ol/style/style';
import RegularShape from 'ol/style/regularshape';
import axios from 'axios';
import _ from 'lodash';

export function getMapStyle(feature, resolution) {
  if (feature.getGeometryName() === 'Point') {
    return new Style({
      image: new RegularShape({
        fill: new Fill({ color: 'rgba(222, 49, 33, 0.8)' }),
        stroke: new Stroke({
          color: 'black',
          width: 2,
        }),
        points: 6,
        radius: 11,
        angle: Math.PI / 4,
      }),
      text: new Text({
        text: feature.get('name') || feature.getId(),
        stroke: new Stroke({
          color: '#FFFFFF',
          width: 2,
        }),
      }),
    });
  } else if (feature.getGeometryName() === 'Polygon') {
    const fill = new Fill({ color: 'rgba(255,255,255,0.2)' });
    const stroke = new Stroke({
      color: '#3399CC',
      width: 0.75,
    });
    const selectedFill = new Fill({ color: 'rgba(255,255,255,0.7)' });
    const selectedStroke = new Stroke({
      color: '#3399CC',
      width: 1.5,
    });
    const trailText = new Text({
      overflow: true,
      text: feature.get('name') || 'New Trail',
      stroke: new Stroke({
        color: '#FFFFFF',
        width: 3,
      }),
    });
    return new Style({
      fill,
      stroke,
      text: trailText,
    });
  }
}

export function getFeatureStyle(type, name) {
  /*
  switch (type) {
    case 'trail':
      
    case 'selectedTrail':
      return new Style({
        fill: selectedFill,
        stroke: selectedStroke,
        text: trailText,
      });
    case 'hydrant':
      break;
      /*return new Style({
        image: new RegularShape({
          fill: new Fill({ color: 'rgba(222, 49, 33, 0.4)' }),
          stroke: new Stroke({
            color: 'black',
            width: 2,
          }),
          points: 6,
          radius: 3,
          angle: Math.PI / 4,
        }),
      });
    }*/
}

// Takes a series of ol coordinates and returns the elevation profile for those coordinates
export function getElevation(coords) {
  const revcoords = _.reverse(_.clone(coords));
  const key = 'Rnodo0GTN0IK8fpaVlRuTh3H0vX7yX6T';
  return axios.get('http://open.mapquestapi.com/elevation/v1/profile?key='+ key + '&unit=f&shapeFormat=raw&latLngCollection=' + revcoords)
    .then(profile => profile.data.elevationProfile);
}
