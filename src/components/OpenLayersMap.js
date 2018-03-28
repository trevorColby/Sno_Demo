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
    const {trailsSource} = this.state;
    // redo the trails features
    const newFeatures = [];
    trails.forEach((trail) => {
      if (trail.coords) {
        // first add the trail itself
        const feature = new Feature({
          name: trail.name,
          geometry: new Polygon([_.map(trail.coords, (pt) => {
            return Projection.fromLonLat(pt);
          })])
        });
        newFeatures.push(feature);

        // then add each of its guns for the selected trail
        if (selectedTrail === trail.id) {
          trail.guns.forEach((gun) => {
            const gunFeature = new Feature({
              name: gun.id,
              geometry: new Point(Projection.fromLonLat(gun.coords))
            });
            newFeatures.push(gunFeature);
          });
        }
      }
    });
    trailsSource.clear();
    trailsSource.addFeatures(newFeatures);
  }

  componentWillReceiveProps(nextProps) {
    const {createType, trails, endDraw, selectedTrail} = this.props;
    const {map, source, interactions, trailsSource} = this.state;
    // when drawTypes change, remove old intractions and add new ones
    if (nextProps.createType !== createType) {
      // removing old interactions
      interactions.forEach(interaction => {
          map.removeInteraction(interaction);
      });
      // creating new draw interactions if needed
      if (nextProps.createType && mapObjects[nextProps.createType]) {
        const newInteractions = [];
        const newInteractionTypes = mapObjects[nextProps.createType];
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
          map.addInteraction(i)
        });
        //Pushes Interaction to State so we can remove later
        this.setState({interactions: newInteractions})
      }
    }

    if (nextProps.trails !== trails || nextProps.selectedTrail !== selectedTrail) {
      this.renderTrails(nextProps.trails, nextProps.selectedTrail);
    }
  }

  componentDidMount(){
    this.setupMap();
  }

  setupMap() {
    const {source, trailsSource} = this.state;
    source.on('addfeature', (e) => source.clear());
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
    map.addInteraction(modify);
    this.setState({map: map})
  }

  render() {
    return <div id='map-container' />;
  }
}

export default OpenLayersMap;
