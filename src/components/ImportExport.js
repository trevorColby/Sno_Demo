import React from 'react';
import { Button } from 'material-ui';
import KML from 'ol/format/kml';
import _ from 'lodash';
import {Coordinate} from 'ol';
import Immutable from 'immutable';
import Feature from 'ol/feature';
import Point from 'ol/geom/point';
import Projection from 'ol/proj';
import Polygon from 'ol/geom/polygon';
import GeometryCollection from 'ol/geom/geometrycollection';
import {getMapStyle} from '../utils/mapUtils';
import Dialog, { DialogTitle } from 'material-ui/Dialog';
import { withStyles } from 'material-ui/styles';
import {Trail, Hydrant} from '../utils/records';


class ImportExport extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedFiles: null,
      exportType: null,
    };
    this.changeFile = this.changeFile.bind(this);
    this.importFile = this.importFile.bind(this);
  }

  changeFile(e) {
    this.setState({
      selectedFiles: e.target.files,
    });
  }

  importFile = () => {
    const { selectedFiles } = this.state;
    const { importKMLClicked, trails, hydrants } = this.props;

    function processTrail(feature, index) {
      let [name, ...otherThings] = feature.get('description').split(',');
      name = _.words(name).join(' ');
      const id = index + name;
      const coords = feature.getGeometry().getCoordinates()[0];
      const lonLatCoords = _.map(coords, pt => Projection.fromLonLat(pt.slice(0,2)));
      feature.getGeometry().setCoordinates([lonLatCoords]);
      feature.setId(`t${id}`);
      return new Trail({ id, name, coords, feature });
    }

    function processHydrant(feature, index) {
      let [trailName, hydrantIndex, name]  = feature.get('description').split(',');
      trailName = _.words(trailName).join(' ');
      const trailObj = trails.find(t => t.get('name') === trailName);
      const trailId = trailObj ? trailObj.get('id') : null;
      const id = index + name;
      const geometry = feature.getGeometry().getGeometries()[0];
      feature.setGeometry(geometry);
      const coords = geometry.getCoordinates();
      feature.getGeometry().setCoordinates(Projection.fromLonLat(coords.slice(0,2)));
      feature.setId(`h${id}`);
      feature.set('trailName', trailName);
      return new Hydrant({ id, name, coords, feature, trail: trailId });
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const kml = new KML().readFeatures(event.target.result);
        const newTrails = {};
        const newHydrants = {};

        _.each(kml, (feature, index) => {
          const type = feature.getGeometry().getType() === 'Polygon' ? 'trail' : 'hydrant';
          if (type === 'trail') {
            const trail = processTrail(feature, index);
            newTrails[trail.get('id')] = trail;
            hydrants
              .filter(h => h.get('feature').get('trailName') === trail.get('name'))
              .forEach((h) => {
                newHydrants[h.get('id')] = h.set('trail', trail.get('id'));
              });
          } else {
            const hydrant = processHydrant(feature, index);
            newHydrants[hydrant.get('id')] = hydrant;
          }
        });

        importKMLClicked({
          trails: Immutable.Map(newTrails),
          hydrants:  Immutable.Map(newHydrants),
        });
      } catch (err) {
        // Put error wherever we want to display error msgs.
        console.log(err);
      }
    };

    if (selectedFiles) {
      reader.readAsText(selectedFiles[0]);
    }
  }

  // exportFile = (Type) => {
  //   const { trails, hydrants } = this.props
  //
  //   const trailFeatures = _.values(trails.toJS()).map((item)=> {
  //     return new Feature ({
  //       geometry: new Polygon([_.map(item.coords, (pt) => {
  //         return Projection.fromLonLat(pt);
  //       })]),
  //       description: item.name,
  //     })
  //   })
  //
  //   const hydrantFeatures  = _.values(hydrants.toJS()).map((item)=> {
  //     const feature =  new Feature ({
  //       geometry: new Point(Projection.fromLonLat(item.coords)),
  //        name: item.name,
  //        description: item.name,
  //       })
  //       feature.setStyle(getMapStyle(feature))
  //       return feature
  //     })
  //
  //   const HydrantsKLM = GetKMLFromFeatures(hydrantFeatures)
  //   downloadjs(HydrantsKLM, 'Hydrants.kml')
  //
  //   const TrailsKLM = GetKMLFromFeatures(trailFeatures)
  //   downloadjs(TrailsKLM, 'Trails.kml')
  //
  //   function GetKMLFromFeatures(features) {
  //         const format = new KML();
  //         const kml = format.writeFeatures(features, {featureProjection: 'EPSG:3857'});
  //         return kml;
  //     }
  //
  // }

  render() {
    const style = {
      float: 'left',
    };

    return (
      <div style={style}>
        <input onChange={this.changeFile} type="file" />
        <Button variant="raised" onClick={this.importFile} > Import </Button>
        <Button variant="raised" onClick={this.exportFile} > Export </Button>
      </div>
    );
  }
}

export default ImportExport;
