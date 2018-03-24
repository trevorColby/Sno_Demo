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

import {mapObjects} from '../utils/constants';
import {getMapStyle} from '../utils/mapUtils';

class OpenLayersMap extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      source: new SourceVector({wrapX: false}),
      map: null, 
      interactions: [],
      hydrentIndex: 1
    };
  };

  componentWillReceiveProps(nextProps) {
    const {drawTypes} = this.props;
    const {map, source, interactions} = this.state;
    // when drawTypes change, remove old intractions and add new ones
    if (nextProps.drawTypes !== drawTypes) {
      // removing old interactions
      interactions.forEach(interaction => {
          map.removeInteraction(interaction);
      });
      // creating new draw interactions if needed
      if (nextProps.drawTypes) {
        const newInteractions = [];
        nextProps.drawTypes.forEach(type => {
          const draw = new Draw({
            source: source,
            type: type,
            geometryName: type
          });
          draw.on('drawend', this.endDraw);
          newInteractions.push(draw);
        });

        newInteractions.forEach(i => {
          map.addInteraction(i)
        });
        //Pushes Interaction to State so we can remove later
        this.setState({ interactions: newInteractions})
      }
    }
  }

  endDraw = (drawEvent) => {
    if (drawEvent.feature.geometryName_ === 'Polygon') {
      // add the trail to state
      const coords = _.get(drawEvent, 'target.sketchLineCoords_', []);
      console.log(drawEvent);
    }
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
    return <div id='map-container' />;
  }
}

export default OpenLayersMap;