import React from 'react';
import { Button } from 'material-ui';
import tj from '@mapbox/togeojson';
import fs from 'fs';
import DOMParser from 'xmldom';
import Hydrants from './../KML/Hydrants.kml';
import KML from 'ol/format/kml';
import Point from 'ol/geom/point';
import Projection from 'ol/proj';
import _ from 'lodash';


class ImportExport extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedFiles: null,
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
    const { importKMLClicked, mode } = this.props;
    const reader = new FileReader();

    reader.onload = function(event){
      const kml = new KML().readFeatures(event.target.result)
      const kmlMap = mode === 'trails'? processTrails(kml) : processHydrants(kml)
      importKMLClicked(_.keyBy(kmlMap, 'id'))
    }


    function processTrails(klm){
      return klm.map((feature, index) => {

        const coords = feature.get('geometry').flatCoordinates
  
        return {
          name: feature.get('description'),
          id: index,
          coords: _.chunk(coords,3),
          hydrants: null,
        }
      })
    }

    function processHydrants(kml){
      return kml.map((feature, index)=> {
        const coords = feature.get('geometry').getGeometries()[0].flatCoordinates
        coords.pop()
        return {
          name: feature.get('name'),
          id: index,
          coords: coords,
          elevation: null,
          trail: null
        }
      })

    }

    reader.readAsText(selectedFiles[0])

  }

  render() {
    let style= {
      float: 'left'
    }

    return (
        <div style={style}>
          <input onChange={this.changeFile} type='file' id='layerImport' />
          <Button variant="raised" onClick={this.importFile} > Import </Button>
          <Button variant="raised" > Export </Button>
        </div>
    )
  }
}
export default ImportExport;
