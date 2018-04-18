import Stroke from 'ol/style/stroke';
import Fill from 'ol/style/fill';
import Text from 'ol/style/text';
import Style from 'ol/style/style';
import RegularShape from 'ol/style/regularshape';
import axios from 'axios';
import _ from 'lodash';

export function getMapStyle(feature, resolution) {
  console.log("tears");
  console.log(feature.getGeometry().getType());
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
  } else if (feature.getGeometry().getType() === 'MultiPolygon' || feature.getGeometry().getType() === 'Polygon') {
    console.log("here");
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
  const revcoords = _.reverse(_.clone(coords));
  const key = 'Rnodo0GTN0IK8fpaVlRuTh3H0vX7yX6T';
  return axios.get('http://open.mapquestapi.com/elevation/v1/profile?key='+ key + '&unit=f&shapeFormat=raw&latLngCollection=' + revcoords)
    .then(profile => profile.data.elevationProfile);
}
