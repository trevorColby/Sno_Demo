import React from 'react';
import _ from 'lodash';
import Map from 'ol/map';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import LayerVector from 'ol/layer/vector';
import BingMaps from 'ol/source/bingmaps';
import Projection from 'ol/proj';
import SourceVector from 'ol/source/vector';
import Draw from 'ol/interaction/draw';
import Modify from 'ol/interaction/modify';

import {getMapStyle} from '../utils/mapUtils';

class OpenLayersMap extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      source: new SourceVector({wrapX: false}),
      map: null, 
      hydrentIndex: 1
    };
    this.removeAllInteractions = this.removeAllInteractions.bind(this)
  };

  // Removes Interactions
  removeAllInteractions(){
    const {map} = this.state;
    map.getInteractions().forEach(function (interaction) {
      if(interaction instanceof Draw) {
        map.removeInteraction(interaction)
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.drawType && !this.props.drawType) {
      this.removeAllInteractions();
    }
  }

  endDraw = (drawEvent) => {
    if (drawEvent.feature.geometryName_ === 'Polygon') {
      // add the trail to state
      const coords = _.get(drawEvent, 'target.sketchLineCoords_', []);
      console.log(drawEvent);
    }
  }

  addDraw = (type) => {
    // creates a new drawing interaction and adds it to the map
    const {map, source} = this.state;
    const draw = new Draw({
      source: source,
      type: type,
      geometryName: type
    });
    draw.on('drawend', this.endDraw);
    map.addInteraction(draw);
  }

  

  componentDidMount(){
    this.setupMap();
  }

  setupMap() {
    const {source} = this.state;

    const bingLayer = new TileLayer ({
      visible: true,
      preload: Infinity,
      source: new BingMaps({
        hidpi: true,
        key: 'ApcR8_wnFxnsXwuY_W2mPQuMb-QB0Kg-My65RJYZL2g9fN6NCFA8-s0lsvxTTs2G',
        imagerySet: 'AerialWithLabels'
      })
    });

    const vector = new LayerVector({
      source: source,
      style: getMapStyle
    });

    // Orientation
    var projection = Projection.get('EPSG:3857');
    var killingtonCoords = [-72.803584,43.619210];
    var killingtonCoordsWebMercator = Projection.fromLonLat(killingtonCoords);

   // Map
    const map = new Map({
      loadTilesWhileInteracting: true,
      target: 'map-container',
      layers: [bingLayer, vector],
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
    this.setState({map: map})
  }

  render() {
    const {drawType} = this.props;
    if (drawType){
      this.removeAllInteractions();
      drawType.forEach(t=> {
        this.addDraw(t);
      })
    }
    return <div id='map-container' />;
  }
}

export default OpenLayersMap;