import Stroke from 'ol/style/stroke';
import Fill from 'ol/style/fill';
import Circle from 'ol/style/circle';
import Text from 'ol/style/text';
import Style from 'ol/style/style';
import RegularShape from 'ol/style/regularshape';
import axios from 'axios';
import _ from 'lodash';

export function getFeatureStyle(type, name) {
  const fill = new Fill({ color: 'rgba(255,255,255,0.7)' });
  const stroke = new Stroke({
    color: '#3399CC',
    width: 0.75,
  });
  const selectedFill = new Fill({ color: 'rgba(255,255,255,0.5)' });
  const selectedStroke = new Stroke({
    color: '#3399CC',
    width: 1.5,
  });
  const trailText = new Text({
    overflow: true,
    text: name,
    stroke: new Stroke({
      color: '#FFFFFF',
      width: 3,
    }),
  });
  switch (type) {
    case 'trail':
      return new Style({
        image: new Circle({
          fill,
          stroke,
          radius: 5,
        }),
        fill,
        stroke,
        text: trailText,
      });
      break;
    case 'selectedTrail':
      return new Style({
        image: new Circle({
          selectedFill,
          selectedStroke,
          radius: 5,
        }),
        selectedFill,
        selectedStroke,
        text: trailText,
      });
      break;
    case 'hydrant':
      return new Style({
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
      break;
    case 'selectedHydrant':
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
          text: name,
          stroke: new Stroke({
            color: '#FFFFFF',
            width: 2,
          }),
        }),
      });
      break;
    default:
  }
}

// Takes a series of ol coordinates and returns the elevation profile for those coordinates
export function getElevation(coords){
  let revcoords = _.reverse(_.clone(coords));
  const key= 'Rnodo0GTN0IK8fpaVlRuTh3H0vX7yX6T';
    return axios.get('http://open.mapquestapi.com/elevation/v1/profile?key='+ key + '&unit=f&shapeFormat=raw&latLngCollection=' + revcoords)
    .then(profile => profile.data.elevationProfile);
};
