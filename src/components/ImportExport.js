import React from 'react';
import { Button } from 'material-ui';
<<<<<<< HEAD
=======
import tj from '@mapbox/togeojson';
import fs from 'fs';
import DOMParser from 'xmldom';
>>>>>>> Add Trail KML Upload
import Hydrants from './../KML/Hydrants.kml';
import KML from 'ol/format/kml';
import _ from 'lodash';
<<<<<<< HEAD
import Immutable from 'immutable';
=======
>>>>>>> Add Trail KML Upload


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
        try {
          const kml = new KML().readFeatures(event.target.result)
          const kmlObj = kml[0].getGeometry().getType() === 'Polygon'? processTrails(kml) : processHydrants(kml)
          importKMLClicked(kmlObj)
        }
        catch(err) {
          // Put error wherever we want to display error msgs.
            console.log(err)
        }
      }

<<<<<<< HEAD

    function processTrails(klm){
      const kmlMap = klm.map((feature, index) => {
        const coords = feature.get('geometry').flatCoordinates
=======
    reader.onload = function(event){
      const kml = new KML().readFeatures(event.target.result)
      const kmlMap = mode === 'trails'? processTrails(kml) : processHydrants(kml)
      importKMLClicked(_.keyBy(kmlMap, 'id'))
    }


    function processTrails(klm){
      return klm.map((feature, index) => {

        const coords = feature.get('geometry').flatCoordinates
  
>>>>>>> Add Trail KML Upload
        return {
          name: feature.get('description'),
          id: index,
          coords: _.chunk(coords,3),
<<<<<<< HEAD
        }
      })
      return  {trails: Immutable.fromJS(_.keyBy(kmlMap, 'id'))}
    }

    function processHydrants(klm){
      const kmlMap = klm.map((feature, index)=> {
=======
          hydrants: null,
        }
      })
    }

    function processHydrants(kml){
      return kml.map((feature, index)=> {
>>>>>>> Add Trail KML Upload
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
<<<<<<< HEAD
      return {hydrants: Immutable.fromJS(_.keyBy(kmlMap, 'id'))}
=======

>>>>>>> Add Trail KML Upload
    }

    if (selectedFiles){
        reader.readAsText(selectedFiles[0])
      }
  }

  render() {
    let style= {
      float: 'left'
    }

    return (
        <div style={style}>
          <input onChange={this.changeFile} type='file' />
          <Button variant="raised" onClick={this.importFile} > Import </Button>
          <Button variant="raised" > Export </Button>
        </div>
    )
  }
}
<<<<<<< HEAD

=======
>>>>>>> Add Trail KML Upload
export default ImportExport;
