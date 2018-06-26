import { Trail, Hydrant } from './records';
import _ from 'lodash';
import Projection from 'ol/proj';
import { getMapStyle,  convertTrailFeaturesToDonuts } from './mapUtils';
import { hexToRgb } from './convertToRGB';
import Immutable from 'immutable';
import KML from 'ol/format/kml';
import Store from '../redux/store';



export function processKMLData(data){
  const kml = new KML().readFeatures(data)
  const newTrails = {};
  const newHydrants = {}
  const { hydrants } = Store.getState()

  _.each(kml, (feature, index) => {
    const type = feature.getGeometry().getType() === 'Polygon' ? 'trail' : 'hydrant';
    if (type === 'trail') {
      let trail = processTrail(feature, index);
      const existing = newTrails[trail.get('name')];
      if (existing) {
        const newFeatures = existing.get('features').concat(trail.get('features')[0]);
        newTrails[existing.get('id')] = existing.set('features', newFeatures);
      } else {
        trail = trail.set('id', trail.get('name'));
        newTrails[trail.get('id')] = trail;
        hydrants.hydrants
          .filter(h => h.get('feature').get('trailName') === trail.get('name'))
          .forEach((h) => {
            newHydrants[h.get('id')] = h.set('trail', trail.get('id'));
          });
      }
    } else {
      const hydrant = processHydrant(feature, index);
      newHydrants[hydrant.get('id')] = hydrant;
    }
  });

  return {
    trails: Immutable.Map(newTrails).map(t => convertTrailFeaturesToDonuts(t)),
    hydrants:  Immutable.Map(newHydrants),
  }

}

function processHydrant(feature, index) {
  const { trails  } = Store.getState()
   let [trailName, hydrantIndex, name]  = feature.get('description').split(',');
   const originalTrailName = name
   trailName = _.words(trailName).join(' ');
   const trailObj = trails.trails.find(t => t.get('name') === trailName);
   const trailId = trailObj ? trailObj.get('id') : null;
   const id = index + name;
   const geometry = feature.getGeometry().getType() === 'Point' ?
   feature.getGeometry() : feature.getGeometry().getGeometries()[0];
   feature.setGeometry(geometry);
   const coords = geometry.getCoordinates().slice(0,2);
   feature.getGeometry().setCoordinates(Projection.fromLonLat(coords.slice(0,2)));
   feature.setId(`h-${id}-${index}`);
   feature.set('originalTrailName', originalTrailName)
   feature.set('trailName', trailName);
   feature.setStyle(getMapStyle);
   return new Hydrant({ id, name, coords, feature, trail: trailId });
 }

function processTrail(feature, index) {
    let [name, ...otherThings] = feature.get('description').split(',') ;
    const originalTrailName = name
    name = _.words(name).join(' ');
    const coords = feature.getGeometry().getCoordinates()[0];
    const lonLatCoords = _.map(coords, pt => Projection.fromLonLat(pt.slice(0, 2)));

    const featureFill = feature.getStyle().call(feature)[0].getFill()

    let fillColor = '255,255,255';
    if (featureFill) {
      fillColor = hexToRgb(featureFill.getColor()) || featureFill.getColor().slice(0, 3).join(',')
    }

    feature.getGeometry().setCoordinates([lonLatCoords]);
    feature.setId(`t-${name}-${index}`);
    feature.set('originalTrailName', originalTrailName)
    feature.set('name', name);
    feature.set('fillColor', fillColor)
    feature.unset('selected')
    feature.changed()
    feature.setStyle(getMapStyle);

    return new Trail({ name, features: [feature], fillColor });
  }
