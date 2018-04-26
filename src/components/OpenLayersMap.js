import React from 'react';
import _ from 'lodash';
import Map from 'ol/map';
import View from 'ol/view';
import Collection from 'ol/collection';
import TileLayer from 'ol/layer/tile';
import LayerVector from 'ol/layer/vector';
import BingMaps from 'ol/source/bingmaps';
import Projection from 'ol/proj';
import SourceVector from 'ol/source/vector';
import Draw from 'ol/interaction/draw';
import Modify from 'ol/interaction/modify';
import Snap from 'ol/interaction/snap';
// import Geocoder from 'ol-geocoder';
import { getMapStyle } from '../utils/mapUtils';

class OpenLayersMap extends React.Component {
  constructor(props) {
    super(props);
    this.syncFeatures = this.syncFeatures.bind(this);
    this.updateInteractions = this.updateInteractions.bind(this);
    this.state = {
      source: new SourceVector({ wrapX: false }),
      map: null,
      mapInteractions: [],
    };
  }

  componentDidMount() {
    this.setupMap();
  }

  componentWillReceiveProps(nextProps) {
    const { trails, hydrants } = nextProps;
    // first sync to add externally-uploaded features or remove deleted ones
    setTimeout(() => this.syncFeatures(trails, hydrants), 10);
    // update interactions
    this.updateInteractions(nextProps);
  }

  componentDidUpdate(prevProps) {
    const { selectedTrail, trails, interaction, hydrants, focusedHydrant } = this.props;
    const { map } = this.state;

    // pan to new selectedTrail
    if (selectedTrail !== prevProps.selectedTrail && selectedTrail) {

      try {
        const firstTrailGeom = trails.getIn([selectedTrail, 'features'])[0].getGeometry()
        const geomExtent = firstTrailGeom.getExtent();
        const view = map.getView();
        const zoomResolution = view.getResolutionForExtent(geomExtent);
        const zoomLevel = view.getZoomForResolution(zoomResolution);

        const firstCoords = firstTrailGeom.getInteriorPoint().getCoordinates();
        map.getView().animate({
          center: firstCoords,
          duration: 500,
          zoom: zoomLevel,
        });
        // Instead of Panning the below code will jerk to the trail
        // and will fit the trail but is not as smooth.
        // map.getView().fit(firstTrailGeom, map.getSize());
      } catch (err) {
        console.log('No coordinates found for this trail');
      }
    } else if (focusedHydrant && focusedHydrant !== prevProps.focusedHydrant) {
      const coords = hydrants.getIn([focusedHydrant, 'feature']).getGeometry().getCoordinates();
      map.getView().animate({
        center: coords,
        duration: 0,
      });
    }
  }

  onMapClick = (e) => {
    const { interaction, hydrantSelected } = this.props;
    const { map } = this.state;
    const features = map.getFeaturesAtPixel(e.pixel);
    if (features && interaction === 'DRAW_MODIFY_HYDRANTS') {
      const match = _.find(features, f => f.getId() && f.getId()[0] === 'h');
      if (match) {
        hydrantSelected(match.getId().split('-')[1]);
      }
    }
  }

  setupMap() {
    const { source } = this.state;
    const { hydrantSelected } = this.props;
    const bingMapsLayer = new TileLayer({
      visible: true,
      preload: Infinity,
      source: new BingMaps({
        hidpi: false,
        key: 'ApcR8_wnFxnsXwuY_W2mPQuMb-QB0Kg-My65RJYZL2g9fN6NCFA8-s0lsvxTTs2G',
        imagerySet: 'Aerial',
        maxZoom: 19,
      }),
    });
    // const geocoder = new Geocoder('nominatim', {
    //   provider: 'osm',
    //   lang: 'en',
    //   placeholder: 'Search for ...',
    //   limit: 5,
    //   keepOpen: true,
    //   autoComplete: true,
    // });
    // 
    // geocoder.setTarget(document.getElementById('searchLocations'));

    const resortLayer = new LayerVector({
      source,
      style: getMapStyle,
    });

    // Orientation
    const projection = Projection.get('EPSG:3857');
    const centerCoords = [-106.553668, 39.612616];

    // Map
    const map = new Map({
      loadTilesWhileInteracting: false,
      target: 'map-container',
      layers: [bingMapsLayer, resortLayer],
      view: new View({
        projection,
        center: Projection.fromLonLat(centerCoords),
        zoom: 14.2,
      }),
    });

    // Controls
    // map.addControl(geocoder);
    map.on('click', this.onMapClick);
    this.setState({ map });
  }

  updateInteractions(nextProps) {
    const {
      trails, hydrants,
      interaction,modifyEnd,
      drawEnd, editableTrail
    } = nextProps;
    const { source, map, mapInteractions } = this.state;
    _.each(mapInteractions, i => map.removeInteraction(i));

    const newInteractions = [];
    // create new draw or modify interactions
    let type = null;
    const modifiable = [];
    if (interaction === 'DRAW_MODIFY_TRAIL' && editableTrail) {
      type = 'Polygon';
      _.each(trails.getIn([editableTrail, 'features']), f => modifiable.push(f));
    } else if (interaction === 'DRAW_MODIFY_HYDRANTS') {
      type = 'Point';
      hydrants.filter(h => h.get('trail') === editableTrail)
        .forEach(h => modifiable.push(h.get('feature')));
    }
    if (type) {
      const draw = new Draw({
        source, type, geometryName: type,
      });
      draw.on('drawend', drawEnd);
      newInteractions.push(draw);
    }
    if (modifiable.length) {
      _.each(modifiable, (m) => {
        const modify = new Modify({ features: new Collection([m]) });
        modify.on('modifyend', modifyEnd);
        newInteractions.push(modify);
      });
    }

    if (interaction === 'DRAW_MODIFY_TRAIL') {
      const snap = new Snap({
        source,
        pixelTolerance: 5,
      });
      newInteractions.push(snap);
    }

    _.each(newInteractions, i => map.addInteraction(i));
    this.setState({ mapInteractions: newInteractions });
  }

  syncFeatures(trails, hydrants) {
    const { source } = this.state;
    const totalFeatures = trails.reduce((features, t) => {
      return features + t.get('features').length;
    }, 0) + hydrants.size;
    if (source.getFeatures().length !== totalFeatures) {
      // add new features if needed
      const newFeatures = [];
      trails.forEach((trail) => {
        _.each(trail.get('features'), (feature) => {
          if (!source.getFeatureById(feature.getId())) {
            newFeatures.push(feature);
          }
        });
      });
      hydrants.forEach((hydrant) => {
        if (!source.getFeatureById(`h${hydrant.get('id')}`)) {
          newFeatures.push(hydrant.get('feature'));
        }
      });
      if (newFeatures.length) {
        source.addFeatures(newFeatures);
      }

      // remove deleted features if needed
      _.map(source.getFeatures(), (feature) => {
        const featureId = feature.getId() || '';
        const [type, id, number] = featureId.split('-');
        if (type === 't') {
          if (!trails.has(id) || !_.find(trails.get(id).features, f => f.getId() === featureId)) {
            source.removeFeature(feature);
          }
        }
        else if (type === 'h' && !hydrants.has(id)) {
          source.removeFeature(feature);
        }
      });
    }
  }

  render() {
    return <div id="map-container" />;
  }
}

export default OpenLayersMap;
