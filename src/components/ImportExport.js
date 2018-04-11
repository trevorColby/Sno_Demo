import React from 'react';
import { Button } from 'material-ui';
import tj from '@mapbox/togeojson';
import fs from 'fs';
import DOMParser from 'xmldom';
import Hydrants from './../KML/Hydrants.kml'

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
    const reader = new FileReader();
    let kml;

    reader.onload = function(event){
      const kml = new DOMParser.DOMParser().parseFromString(event.target.result);
      console.log(kml)
      var converted = tj.kml(kml);
      console.log(converted)
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
