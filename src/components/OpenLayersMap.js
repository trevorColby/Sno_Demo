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
import {mapObjects} from '../utils/constants';
import {getMapStyle} from '../utils/mapUtils';
import Geocoder from 'ol-geocoder';

class OpenLayersMap extends React.Component{
  constructor(props){
    super(props);
    this.renderTrails = this.renderTrails.bind(this);
    this.state = {
      modifyingSource: new SourceVector({wrapX: false}),
      modifying: null,
      staticSource: new SourceVector({wrapX: false}),
      map: null,
      center: null,
      interactions: [],
    };
  };

  componentDidUpdate(prevProps, prevState){
    const {selectedTrail, trails} = this.props;
    const {map} = this.state;

    if (selectedTrail !== prevProps.selectedTrail && selectedTrail ){
      let firstCoords = trails.getIn([selectedTrail, 'coords', 0]);
      let centerCoords = Projection.fromLonLat(firstCoords ? firstCoords.toJS() : [0,0]);

      map.getView().animate({
        center: centerCoords,
        duration: 500,
        zoom: 16,
      });
    }
  }

  renderTrails() {
    const {trails, selectedTrail, hydrants, mode} = this.props;
    const {modifyingSource, staticSource} = this.state;
    staticSource.clear();
    modifyingSource.clear();
    // redo the trails features for unselected trails
    const newFeatures = [];
    trails.forEach((trail) => {
      const t = trail.toJS();
      if (t.id !== selectedTrail && t.coords) {
        // first add the trail itself
        const feature = new Feature({
          name: t.name,
          id: t.id,
          geometry: new Polygon([_.map(t.coords, (pt) => {
            return Projection.fromLonLat(pt);
          })])
        });
        newFeatures.push(feature);
      }
    });
    hydrants.forEach((hydrant) => {
      const h = hydrant.toJS();
      if (h.trail !== selectedTrail && h.coords) {
        const feature = new Feature({
          name: h.name,
          id: h.id,
          geometry: new Point(Projection.fromLonLat(h.coords))
        });
        newFeatures.push(feature);
      }
    })
    staticSource.addFeatures(newFeatures);

    // if trail is selected then put it in draw layer with its hydrants
    if (selectedTrail && trails.get(selectedTrail)) {
      const selectedTrailObj = trails.get(selectedTrail).toJS();
      const drawFeatures = [];
      drawFeatures.push(new Feature({
        name: selectedTrailObj.name,
        id: selectedTrailObj.id,
        geometry: new Polygon([_.map(selectedTrailObj.coords, (pt) => {
            return Projection.fromLonLat(pt);
          })])
      }));
      hydrants.forEach((hydrant) => {
        if (hydrant.get('trail') === selectedTrail || true) {
          const h = hydrant.toJS();
          const hydrantFeature = new Feature({
            name: h.name || h.id,
            id: h.id,
            geometry: new Point(Projection.fromLonLat(h.coords))
          });
          drawFeatures.push(hydrantFeature);
        }
      });

      _.each(drawFeatures, (f) => {
        f.on('change', (e) => this.setState({modifying: e}));
      });
      modifyingSource.addFeatures(drawFeatures);
    }
  }
  renderTrailsDebounce = _.debounce(this.renderTrails, 50);

  componentWillReceiveProps(nextProps) {
    const {endDraw} = this.props;
    const {map, interactions, modifyingSource} = this.state;
    console.log(map);
    // remove old draw interactions
    interactions.forEach(interaction => {
        map.removeInteraction(interaction);
    });

    // creating new draw interactions
    const newInteractions = [];
    const newInteractionTypes = mapObjects[nextProps.mode] || [];
    newInteractionTypes.forEach(type => {
      const draw = new Draw({
        source: modifyingSource,
        type: type,
        geometryName: type
      });
      draw.on('drawend', endDraw);
      newInteractions.push(draw);
    });
    newInteractions.forEach(i => {
      if (map) {
        map.addInteraction(i);
      }
    });
    this.setState({interactions: newInteractions, modifying: null});

    this.renderTrailsDebounce(nextProps.trails, nextProps.selectedTrail);
  }

  componentDidMount(){
    this.setupMap();
  }

  setupMap() {
    const {staticSource, modifyingSource} = this.state;
    const {endModify} = this.props;
    const bingMapsLayer = new TileLayer({
      visible: true,
      preload: Infinity,
      source: new BingMaps({
        hidpi: true,
        key: 'ApcR8_wnFxnsXwuY_W2mPQuMb-QB0Kg-My65RJYZL2g9fN6NCFA8-s0lsvxTTs2G',
        imagerySet: 'AerialWithLabels'
      })
    });

    var geocoder = new Geocoder('nominatim', {
      provider: 'osm',
      lang: 'en',
      placeholder: 'Search for ...',
      limit: 5,
      keepOpen: true,
      autoComplete: true,
    });

    const modifyingLayer = new LayerVector({
      source: modifyingSource,
      style: getMapStyle
    });

    const staticLayer = new LayerVector({
      source: staticSource,
      style: getMapStyle
    });

    // Orientation
<<<<<<< HEAD
    const projection = Projection.get('EPSG:3857');
    const centerCoords = [-106.553668, 39.612616];
=======
    var projection = Projection.get('EPSG:3857');
    var killingtonCoords = [-106.553668, 39.612616];
    var killingtonCoordsWebMercator = Projection.fromLonLat(killingtonCoords);
>>>>>>> Successfully import KML Points to Map

    // Map
    const map = new Map({
      loadTilesWhileInteracting: false,
      target: 'map-container',
      layers: [bingMapsLayer, staticLayer, modifyingLayer],
      view: new View({
        projection: projection,
        center: Projection.fromLonLat(centerCoords),
        zoom: 14.2,
        rotation: 2.4
      })
    });



    //Controls
    map.addControl(geocoder)


    // Modifications
    let modify = new Modify({source: modifyingSource});
    modify.on('modifyend', () => endModify(this.state.modifying));
    map.addInteraction(modify);
    this.setState({map});
  }

  render() {
    return <div id='map-container' />;
  }
}

export default OpenLayersMap;
