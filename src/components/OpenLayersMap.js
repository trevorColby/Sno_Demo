import React from 'react';
import _ from 'lodash';
import Map from 'ol/map';
import View from 'ol/view';
import Feature from 'ol/feature';
import Point from 'ol/geom/point';
import Polygon from 'ol/geom/polygon';
import TileLayer from 'ol/layer/tile';
import LayerVector from 'ol/layer/vector';
import BingMaps from 'ol/source/bingmaps';
import Projection from 'ol/proj';
import SourceVector from 'ol/source/vector';
import Draw from 'ol/interaction/draw';
import Modify from 'ol/interaction/modify';
import Collection from 'ol/collection';
import {mapObjects} from '../utils/constants';
import {getMapStyle} from '../utils/mapUtils';

class OpenLayersMap extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      source: new SourceVector({wrapX: false}),
      modifying: null,
      trailsSource: new SourceVector({wrapX: false}),
      map: null,
      center: null,
      interactions: [],
    };
  };


  panToLocation = (location) => {
    // let view = this.state.map.getView()
    console.log(this.state.map)
    // view.animate({
    //   center: location,
    //   duration: 2000
    // })
  }

  componentDidUpdate(prevProps, prevState){
    const {selectedTrail, trails} = this.props;

    if (selectedTrail !== prevProps.selectedTrail && selectedTrail ){

      let currentTrail = trails.find((t)=>{
        return t.id == selectedTrail
      })

      let centerCoords = Projection.fromLonLat(currentTrail.coords[0])
      let view = this.state.map.getView()

      view.animate({
        center: centerCoords,
        duration: 500,
        zoom: 16,
      })

    }
  }

  renderTrails = (trails, selectedTrail) => {
    const {endModify} = this.props;
    const {trailsSource, source} = this.state;
    source.clear();
    trailsSource.clear();
    // redo the trails features for unselected trails
    const newFeatures = [];
    trails.forEach((trail) => {
      if (trail.id !== selectedTrail && trail.coords) {
        // first add the trail itself
        const feature = new Feature({
          name: trail.name,
          id: trail.id,
          geometry: new Polygon([_.map(trail.coords, (pt) => {
            return Projection.fromLonLat(pt);
          })])
        });
        newFeatures.push(feature);
      }
    });
    trailsSource.addFeatures(newFeatures);

    // if trail is selected then put it in draw layer with its guns
    const selectedTrailObj = _.find(trails, (t) => t.id === selectedTrail);
    if (selectedTrailObj) {
      const drawFeatures = [];
      drawFeatures.push(new Feature({
        name: selectedTrailObj.name, 
        id: selectedTrailObj.id,
        geometry: new Polygon([_.map(selectedTrailObj.coords, (pt) => {
            return Projection.fromLonLat(pt);
          })])
      }));
      selectedTrailObj.guns.forEach((gun) => {
        const gunFeature = new Feature({
          name: gun.id,
          id: gun.id,
          geometry: new Point(Projection.fromLonLat(gun.coords))
        });
        drawFeatures.push(gunFeature);
      });

      _.each(drawFeatures, (f) => {
        f.on('change', (e) => this.setState({modifying: e}));
      });
      source.addFeatures(drawFeatures);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {createType, trails, endDraw, selectedTrail} = this.props;
    const {map, source, interactions, trailsSource} = this.state;
    
    // remove old draw interactions
    interactions.forEach(interaction => {
        map.removeInteraction(interaction);
    });

    // creating new draw interactions
    const newInteractions = [];
    const newInteractionTypes = mapObjects[nextProps.createType] || [];
    newInteractionTypes.forEach(type => {
      const draw = new Draw({
        source: source,
        type: type,
        geometryName: type
      });
      draw.on('drawend', endDraw);
      newInteractions.push(draw);
    });

    newInteractions.forEach(i => {
      map.addInteraction(i);
    });
    this.setState({interactions: newInteractions});

    this.renderTrails(nextProps.trails, nextProps.selectedTrail);
  }

  componentDidMount(){
    this.setupMap();
  }

  setupMap() {
    const {source, trailsSource} = this.state;
    const {endModify} = this.props;
    const bingMapsLayer = new TileLayer ({
      visible: true,
      preload: Infinity,
      source: new BingMaps({
        hidpi: true,
        key: 'ApcR8_wnFxnsXwuY_W2mPQuMb-QB0Kg-My65RJYZL2g9fN6NCFA8-s0lsvxTTs2G',
        imagerySet: 'AerialWithLabels'
      })
    });

    const drawLayer = new LayerVector({
      source: source,
      style: getMapStyle
    });

    const trailsLayer = new LayerVector({
      source: trailsSource,
      style: getMapStyle
    });

    // Orientation
    var projection = Projection.get('EPSG:3857');
    var killingtonCoords = [-72.803584,43.619210];
    var killingtonCoordsWebMercator = Projection.fromLonLat(killingtonCoords);

    // Map
    const map = new Map({
      loadTilesWhileInteracting: false,
      target: 'map-container',
      layers: [bingMapsLayer, trailsLayer, drawLayer],
      view: new View({
        projection: projection,
        center: killingtonCoordsWebMercator,
        zoom: 14.2,
        rotation: 2.4
      })
    });
    // Modifications
    let modify = new Modify({source: source});
    modify.on('modifyend', () => endModify(this.state.modifying));
    map.addInteraction(modify);
    this.setState({map: map})
  }

  render() {
    return <div id='map-container' />;
  }
}

export default OpenLayersMap;
