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
import Geocoder from 'ol-geocoder';
import { getMapStyle } from '../utils/mapUtils';

class OpenLayersMap extends React.Component {
  constructor(props) {
    super(props);
    this.syncFeatures = this.syncFeatures.bind(this);
    this.updateInteractions = this.updateInteractions.bind(this);
    this.state = {
      source: new SourceVector({ wrapX: false }),
      map: null,
    };
  }

  componentDidMount() {
    this.setupMap();
  }

  updateInteractions() {
    const {
      trails, hydrants, 
      selectedTrail, interaction, 
      drawEnd, modifyEnd 
    } = this.props;
    const { source, map } = this.state;
    _.each(map.getInteractions().getArray(), i => {
      if (i instanceof Draw || i instanceof Modify) {
        map.removeInteraction(i);
      }
    });

    // create new draw or modify interactions
    let type = null;
    const modifiable = new Collection([]);
    if (interaction === 'DRAW_MODIFY_TRAIL' && selectedTrail) {
      type = 'Polygon';
      _.each(trails.getIn([selectedTrail, 'features']), f => modifiable.push(f));
    } else if (interaction === 'DRAW_MODIFY_HYDRANTS') {
      type = 'Point';
      hydrants.filter(h => h.get('trail') === selectedTrail)
        .forEach(h => modifiable.push(h.get('feature')));
    }
    if (type) {
      const draw = new Draw({
        source, type, geometryName: type,
      });
      draw.on('drawend', e => drawEnd(e.feature));
      map.addInteraction(draw)
    }
    if (modifiable) {
      const modify = new Modify({ features: modifiable });
      modify.on('modifyend', e => modifyEnd(e));
      map.addInteraction(modify);
    }

    if (interaction === 'DRAW_MODIFY_TRAIL') {
      const snap = new Snap({
        source,
        pixelTolerance: 5,
      });
      map.addInteraction(snap);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { trails, hydrants } = nextProps;
    // first sync to add externally-uploaded features or remove deleted ones
    this.syncFeatures(trails, hydrants);
  }

  componentDidUpdate(prevProps) {
    const { selectedTrail, trails } = this.props;
    const { map } = this.state;
    // update interactions
    this.updateInteractions();

    // pan to new selectedTrail
    if (selectedTrail !== prevProps.selectedTrail && selectedTrail) {
      try {
        const firstCoords = trails.getIn([selectedTrail, 'features'])[0].getGeometry().getInteriorPoint().getCoordinates();
        map.getView().animate({
          center: firstCoords,
          duration: 500,
        });
      } catch (err) {
        console.log('No coordinates found for this trail');
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
        imagerySet: 'Aerial',
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
        zoom: 14.2,
      }),
    });

    // Controls
    map.addControl(geocoder);

    this.setState({ map });
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
        const featureId = feature.getId();
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
