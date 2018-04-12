import React from 'react';
import { Button } from 'material-ui';
import KML from 'ol/format/kml';
import _ from 'lodash';
import Immutable from 'immutable';


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
      /// Hydrant 0 type is a GeeometryCollection, Trail 0 type is a Polygon
      const kmlObj = kml[0].getGeometry().getType() === 'Polygon'? processTrails(kml) : processHydrants(kml)
      importKMLClicked(kmlObj)
    }

    function processTrails(klm){
      const kmlMap = klm.map((feature, index) => {
        const coords = feature.get('geometry').flatCoordinates
        return {
          name: feature.get('description'),
          id: index,
          coords: _.chunk(coords,3),
        }
      })
      return  {trails: Immutable.fromJS(_.keyBy(kmlMap, 'id'))}
    }

    function processHydrants(klm){
      const kmlMap = klm.map((feature, index)=> {
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
      return {hydrants: Immutable.fromJS(_.keyBy(kmlMap, 'id'))}
    }

    reader.readAsText(selectedFiles[0])

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
export default ImportExport;
