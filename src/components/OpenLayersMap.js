import React from 'react';
import _ from 'lodash';
import Map from 'ol/map';
import View from 'ol/view';
import Point from 'ol/geom/point';
import Collection from 'ol/collection';
import Polygon from 'ol/geom/polygon';
import TileLayer from 'ol/layer/tile';
import LayerVector from 'ol/layer/vector';
import BingMaps from 'ol/source/bingmaps';
import Projection from 'ol/proj';
import SourceVector from 'ol/source/vector';
import Draw from 'ol/interaction/draw';
import Modify from 'ol/interaction/modify';
import Snap from 'ol/interaction/snap';
import Geocoder from 'ol-geocoder';
import { getMapStyle } from '../utils/mapUtils';

class OpenLayersMap extends React.Component {
  constructor(props) {
    super(props);
    this.syncFeatures = this.syncFeatures.bind(this);
    this.state = {
      source: new SourceVector({ wrapX: false }),
      interactions: [],
      map: null,
    };
  }

  componentDidMount() {
    this.setupMap();
  }

  componentWillReceiveProps(nextProps) {
    const { interactions, source, map } = this.state;
    const { canCreate, mode, createObject, trails, hydrants, selectedTrail } = nextProps;
    // first sync to add externally-uploaded features or remove deleted ones
    this.syncFeatures(trails, hydrants);

    // remove all existing interactions
    _.each(interactions, (interaction) => map.removeInteraction(interaction));

    // create new draw or modify interaction depending on the props
    const newInteractions = [];
    if (canCreate) {
      const type = mode === 'trails' ? 'Polygon' : 'Point';
      const draw = new Draw({
        source, type, geometryName: type,
      });
      draw.on('drawend', (e) => createObject(e.feature));
      newInteractions.push(draw);
    }
    if (selectedTrail) {
      const modifiable = new Collection([]);
      if (mode === 'trails') {
        const feature = trails.getIn([selectedTrail, 'feature']);
        modifiable.push(feature);
      } else {
        hydrants.filter((h) => h.get('trail') === selectedTrail)
          .forEach((h) => modifiable.push(h.get('feature')));
      }
      const modify = new Modify({ features: modifiable });
      modify.on('modifyend', (e) => this.endModify(e));
      newInteractions.push(modify);
    }

    if (mode === 'trails') {
      const snap = new Snap({
        source,
        pixelTolerance: 5
      })
      newInteractions.push(snap);
    }

    _.each(newInteractions, (interaction) => map.addInteraction(interaction));
    this.setState({ interactions: newInteractions });
  }

  componentDidUpdate(prevProps) {
    const { selectedTrail, trails } = this.props;
    const { map } = this.state;
    if (selectedTrail !== prevProps.selectedTrail && selectedTrail) {
      const firstCoords = trails.getIn([selectedTrail, 'coords'])[0];
      if (firstCoords.length) {
        const centerCoords = Projection.fromLonLat(firstCoords);
        map.getView().animate({
          center: centerCoords,
          duration: 500,
        });
      }
    }
  }

  setupMap() {
    const { source } = this.state;
    const bingMapsLayer = new TileLayer({
      visible: true,
      preload: Infinity,
      source: new BingMaps({
        hidpi: true,
        key: 'ApcR8_wnFxnsXwuY_W2mPQuMb-QB0Kg-My65RJYZL2g9fN6NCFA8-s0lsvxTTs2G',
        imagerySet: 'AerialWithLabels',
      }),
    });

    const geocoder = new Geocoder('nominatim', {
      provider: 'osm',
      lang: 'en',
      placeholder: 'Search for ...',
      limit: 5,
      keepOpen: true,
      autoComplete: true,
    });

    geocoder.setTarget(document.getElementById('searchLocations'))

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
        zoom: 14.2
      }),
    });

    // Controls
    map.addControl(geocoder);

    this.setState({ map });
  }

  syncFeatures(trails, hydrants) {
    const { source } = this.state;
    if (source.getFeatures().length !== trails.size + hydrants.size) {
      // add new features if needed
      const newFeatures = [];
      trails.forEach((trail) => {
        if (!source.getFeatureById(`t${trail.get('id')}`)) {
          newFeatures.push(trail.get('feature'));
        }
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
        const featureId = feature.getId();
        if (featureId[0] === 't' && !trails.has(featureId.slice(1))) {
          source.removeFeature(feature);
        } else if (featureId[0] === 'h' && !hydrants.has(featureId.slice(1))) {
          source.removeFeature(feature);
        }
      });
    }
  }

  endModify = (e) => {
    const { modifyTrail, modifyHydrant, mode, selectedTrail, hydrants } = this.props;
    if (mode === 'trails') {
      const newCoords = e.features.getArray()[0].getGeometry().getCoordinates()[0];
      const lonLatCoords = _.map(newCoords, (pt) => {
        return Projection.toLonLat(pt);
      });
      modifyTrail(selectedTrail, { coords: lonLatCoords });
    } else {
      const features = e.features.getArray();
      _.each(features, (feature) => {
        const hydrantId = feature.getId().slice(1);
        const hydrantCoords = hydrants.getIn([hydrantId, 'coords']);
        const mapCoords = feature.getGeometry().getCoordinates();
        const lonLatCoords = Projection.toLonLat(mapCoords);
        if (!_.isEqual(lonLatCoords, hydrantCoords)) {
          modifyHydrant(hydrantId, { coords: lonLatCoords });
        }
      });
    }
  }

  render() {
    return <div id="map-container" />;
  }
}

export default OpenLayersMap;
