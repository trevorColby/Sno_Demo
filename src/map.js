import React from 'react';
import 'ol/ol.css';
import Map from 'ol/map';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import LayerVector from 'ol/layer/vector';
import BingMaps from 'ol/source/bingmaps';
import Projection from 'ol/proj';
import SourceVector from 'ol/source/vector';
import Draw from 'ol/interaction/draw';
import { MapControls } from './MapControls';
import Modify from 'ol/interaction/modify';

export class MainMap extends React.Component{

  constructor(props){
    super(props);
    this.state = {polyOn: false};
    this.togglePolyTool = this.togglePolyTool.bind(this)
  };

//Sets PolyOn to True which defines whether interaction is added
  togglePolyTool(){
    this.setState({
      polyOn: true
    });
  };

  componentDidMount(){

  let source = new SourceVector({
    wrapX: false});

  let vector = new LayerVector({
    source: source
  });



  // Layers & Interaction
  let draw;
  this.addInteractions = function() {
    //Creates New Drawing
    draw = new Draw({
            source: source,
            type: 'Polygon',
          });
    // Adds Drawing Interaction
    map.addInteraction(draw)
    console.log(vector)
    // Removes Drawing Interaction
     draw.on('drawend', c => { map.removeInteraction(draw) })
    }

    let bingLayer = new TileLayer ({
      visible: true,
      preload: Infinity,
      source: new BingMaps({
        hidpi: true,
        key: 'ApcR8_wnFxnsXwuY_W2mPQuMb-QB0Kg-My65RJYZL2g9fN6NCFA8-s0lsvxTTs2G',
        imagerySet: 'AerialWithLabels'
      })
    })

 // Orientation
    var projection = Projection.get('EPSG:3857');
    var killingtonCoords = [-72.803584,43.619210];
    var killingtonCoordsWebMercator = Projection.fromLonLat(killingtonCoords);

 // Map
    let map = new Map({
        loadTilesWhileInteracting: true,
        target: 'map-container',
        layers: [bingLayer,vector],
        view: new View({
          projection: projection,
          center: killingtonCoordsWebMercator,
          zoom: 14.2,
          rotation: 2.4
        })
      });

// Modifications
    let modify = new Modify({source: source})
    map.addInteraction(modify);


}




  render() {
    if (this.state.polyOn){
        this.addInteractions();
    }

    return (
    <div id='map-container'>
    <MapControls onClick={this.togglePolyTool} polyOn={this.state.polyOn} />
    </div>
  )
  }
}
