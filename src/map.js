import React from 'react';
import 'ol/ol.css';
import ol from 'ol'
import Map from 'ol/map';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import LayerVector from 'ol/layer/vector';
import BingMaps from 'ol/source/bingmaps';
import Projection from 'ol/proj';
import SourceVector from 'ol/source/vector';
import KML from 'ol/format/kml';
import Draw from 'ol/interaction/draw';
import { MapControls } from './MapControls';

export class MainMap extends React.Component{

  constructor(props){
    super(props);
    this.state{drawPoly: false};
    this.addInteraction = this.addInteraction.bind(this)
  }

  componentDidMount(){
  let source = new SourceVector({wrapX: false})
  let vector = new LayerVector({source: source});

// Layers
  // Adds Polygon Drawing Option to Map

   

   function addInteraction() {
      let draw = new Draw({
              source: source,
              type: 'Polygon'
            })
       map.addInteraction(draw);
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
    // addInteraction();
  }

  render() {
    return (
    <div id='map-container'>
    <MapControls />
    </div>
  )
  }
}
