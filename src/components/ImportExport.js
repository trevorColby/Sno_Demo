import React from 'react';
import { Button } from 'material-ui';
import tj from '@mapbox/togeojson';
import fs from 'fs';
import DOMParser from 'xmldom';
<<<<<<< HEAD
import Hydrants from './../KML/Hydrants.kml';
import KML from 'ol/format/kml';
import Point from 'ol/geom/point';
import Projection from 'ol/proj';
import _ from 'lodash';
=======
import Hydrants from './../KML/Hydrants.kml'
>>>>>>> Add ImportExport

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
    const { importKMLClicked } = this.props;
    const reader = new FileReader();

    reader.onload = function(event){
      const kml = new KML().readFeatures(event.target.result)
      const kmlMap = kml.map((feature, index)=> {
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

      importKMLClicked(_.keyBy(kmlMap, 'id'))
    }

    reader.readAsText(selectedFiles[0])

  }

<<<<<<< HEAD
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
=======
>>>>>>> Add ImportExport

export default ImportExport;


// const reader = new FileReader();
// const { selectedFiles } = this.state;
//
//
// reader.onload = function(event){
//   let jsonResult = JSON.parse(event.target.result)
//   console.log(jsonResult)
// }
//
// reader.readAsText(selectedFiles[0])
