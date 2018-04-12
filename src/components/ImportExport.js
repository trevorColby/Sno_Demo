import React from 'react';
import { Button } from 'material-ui';
import Hydrants from './../KML/Hydrants.kml';
import KML from 'ol/format/kml';
import _ from 'lodash';
import Immutable from 'immutable';
import Feature from 'ol/feature';
import Point from 'ol/geom/point';
import Projection from 'ol/proj';
import Polygon from 'ol/geom/polygon';
import GeometryCollection from 'ol/geom/geometrycollection';
import {getMapStyle} from '../utils/mapUtils';
import Dialog, { DialogTitle } from 'material-ui/Dialog';
import { withStyles } from 'material-ui/styles';


class ImportExport extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedFiles: null,
      exportType: null,
    }
    this.changeFile = this.changeFile.bind(this);
    this.importFile = this.importFile.bind(this);
  }

  changeFile(e) {
    this.setState({
      selectedFiles: e.target.files
    })
  }

  importFile = () =>  {
    const { selectedFiles } = this.state;
    const { importKMLClicked } = this.props;
    const reader = new FileReader();
      reader.onload = function(event){
        try {
          const kml = new KML().readFeatures(event.target.result)
          const newTrails = {};
          const newHydrants = {};

          _.each(kml, (feature, index) => {
              const type = feature.getGeometry().getType() === 'Polygon' ? 'trail' : 'hydrant'
              if(type === 'trail'){
                const trail = processTrail(feature, index);
                newTrails[trail.id] = trail;
              } else {
                const hydrant = processHydrant(feature, index);
                newHydrants[hydrant.id] = hydrant;
              }
          })

          importKMLClicked({
            trails: Immutable.fromJS(newTrails),
            hydrants:  Immutable.fromJS(newHydrants),
          })
          
        }
        catch(err) {
          // Put error wherever we want to display error msgs.
            console.log(err)
        }
      }

      function processTrail(feature, index){
        const name = feature.get('description')
          return {
            name: name,
            id: index + name,
            coords: feature.get('geometry').getCoordinates()[0],
          }
      }

      function processHydrant(feature, index){
        const name = feature.get('description')
          return {
            name: name,
            id: index + name,
            coords: feature.get('geometry').getGeometries()[0].flatCoordinates,
            elevation: null,
            trail: null
          }
      }
    if (selectedFiles){
        reader.readAsText(selectedFiles[0])
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
    let style= {
      float: 'left'
    }

    return (
        <div style={style}>
          <input onChange={this.changeFile} type='file' />
          <Button variant="raised" onClick={this.importFile} > Import </Button>
          <Button variant="raised"  onClick={this.exportFile} > Export </Button>
        </div>
    )
  }
}

export default ImportExport;
