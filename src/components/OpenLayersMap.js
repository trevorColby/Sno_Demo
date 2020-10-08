import React from 'react';
import _ from 'lodash';
import Map from 'ol/map';
import View from 'ol/view';
import GeometryCollection from 'ol/geom/geometrycollection';
import Collection from 'ol/collection';
import TileLayer from 'ol/layer/tile';
// import TileImage from 'ol/source/image';
import LayerVector from 'ol/layer/vector';
import BingMaps from 'ol/source/bingmaps';
import TileImage from 'ol/source/tileimage';
import Projection from 'ol/proj';
import SourceVector from 'ol/source/vector';
import Draw from 'ol/interaction/draw';
import Modify from 'ol/interaction/modify';
import Snap from 'ol/interaction/snap';
import { FormControl, RadioGroup, Radio, FormControlLabel } from '@material-ui/core';
import extent from 'ol/extent';
// import Select from 'react-select';
import createGeocoder from './Geocoder';
import { getMapStyle } from '../utils/mapUtils';
import RotationSlider from './RotationSlider';

const layerOptions = ['Road',
  'Aerial',
  'AerialWithLabels',
  'Google',
];

const controlBoxStyle = {
  position: 'absolute',
  zIndex: 99,
  background: '#ffffff91',
  border: '1px solid #fbfbfb',
  borderRadius: 10,
  padding: 20,
  bottom: '10%',
  right: '5%',
};


class OpenLayersMap extends React.Component {
  constructor(props) {
    super(props);
    this.syncFeatures = this.syncFeatures.bind(this);
    this.updateInteractions = this.updateInteractions.bind(this);
    this.state = {
      source: new SourceVector({ wrapX: false }),
      map: null,
      mapInteractions: [],
      currentLayer: 'Aerial',
      mapLayers: null,
    };
  }

  componentDidMount() {
    this.setupMap();

    const triggerEscape = () => {
      this.escapeInteractions();
    };
    const triggerDeleteLast = () => {
      this.deleteLastLine();
    };
    document.onkeydown = function (evt) {
      evt = evt || window.event;
      if (evt.keyCode == 27) {
        triggerEscape();
      }

      if (evt.keyCode == 8) {
        triggerDeleteLast();
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    const { trails, hydrants } = nextProps;
    // first sync to add externally-uploaded features or remove deleted ones
    setTimeout(() => this.syncFeatures(trails, hydrants), 10);
    // update interactions
    this.updateInteractions(nextProps);
  }

  componentDidUpdate(prevProps) {
    const {
      selectedTrail, trails, interaction, hydrants, focusedHydrant,
    } = this.props;
    const { map } = this.state;

    // pan to new selectedTrail
    if (selectedTrail !== prevProps.selectedTrail && selectedTrail) {
      try {
        const trailFeatures = trails.getIn([selectedTrail, 'features']);

        if (trailFeatures.length > 0) {
          const geomCollection = new GeometryCollection();
          const geometries = _.flatMap(trailFeatures, f => f.getGeometry());
          geomCollection.setGeometries(geometries);
          const newExtent = geomCollection.getExtent();

          const view = map.getView();
          const zoomResolution = view.getResolutionForExtent(newExtent);
          const zoomLevel = view.getZoomForResolution(zoomResolution);

          map.getView().animate({
            center: extent.getCenter(newExtent),
            duration: 500,
            zoom: zoomLevel,
          });

          map.getView().animate({
            center: extent.getCenter(newExtent),
            duration: 500,
            zoom: zoomLevel,
          });
        }

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

  onRotationChange = (value) => {
    const { map } = this.state;
    map.getView().setRotation(value);
  }

  setupMap() {
    const { source } = this.state;
    const { hydrantSelected } = this.props;

    const layers = _.map(layerOptions, (l) => {
      if (l !== 'Google') {
        return new TileLayer({
          visible: false,
          preload: Infinity,
          source: new BingMaps({
            visible: false,
            hidpi: false,
            key: 'ApcR8_wnFxnsXwuY_W2mPQuMb-QB0Kg-My65RJYZL2g9fN6NCFA8-s0lsvxTTs2G',
            imagerySet: l,
            maxZoom: 19,
          }),
        });
      }
      return new TileLayer({
        visible: false,
        preload: Infinity,
        source: new TileImage({ url: 'http://mt1.google.com/vt/lyrs=s&hl=pl&&x={x}&y={y}&z={z}' }),
      });
    });


    const resortLayer = new LayerVector({
      source,
      style: getMapStyle,
    });

    layers.push(resortLayer);

    // Orientation
    const projection = Projection.get('EPSG:3857');
    const centerCoords = [-98.58533300673075, 38.5157497923837];

    // Map
    const map = new Map({
      loadTilesWhileInteracting: false,
      target: 'map-container',
      layers,
      view: new View({
        projection,
        center: Projection.fromLonLat(centerCoords),
        zoom: 5,
        rotation: 0,
      }),
    });

    // Controls
    const onGeocoderChange = (coords) => {
      const mapCoords = Projection.fromLonLat(coords);
      map.getView().animate({
        center: mapCoords,
        duration: 100,
        zoom: 15,
      });
    };
    createGeocoder('searchLocations', onGeocoderChange);

    layers[1].setVisible(true);

    map.on('click', this.onMapClick);
    this.setState({
      mapLayers: layers,
      map,
    });
  }

  switchLayers = (e) => {
    const { mapLayers } = this.state;
    const selected = e.target.value;

    _.each(mapLayers, (layer, index) => {
      // Set True if selected == layeroptions index
      console.log(selected === layerOptions[index], layer);
      layer.setVisible(selected === layerOptions[index] || layer.type === 'VECTOR');
    });


    this.setState({
      currentLayer: selected,
    });
  }

  deleteLastLine = () => {
    const { mapInteractions, map } = this.state;
    _.each(mapInteractions, (i) => {
      if (i.geometryName_ === 'Polygon') {
        i.removeLastPoint();
      }
    });
  }

  escapeInteractions = () => {
    const { map, mapInteractions } = this.state;
    _.each(mapInteractions, i => map.removeInteraction(i));
    this.setState({ mapInteractions: [] });
  }

  updateInteractions(nextProps) {
    const {
      trails, hydrants,
      interaction, modifyEnd,
      drawEnd, editableTrail, selectedTrail,
    } = nextProps;

    const { source, map, mapInteractions } = this.state;

    _.each(mapInteractions, i => map.removeInteraction(i));

    const newInteractions = [];
    // create new draw or modify interactions
    let type = null;
    const modifiable = [];
    if (interaction === 'DRAW_MODIFY_TRAIL' && editableTrail) {
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
    const totalFeatures = trails.reduce((features, t) => features + t.get('features').length, 0) + hydrants.size;
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
        } else if (type === 'h' && !hydrants.has(id)) {
          source.removeFeature(feature);
        }
      });
    }
  }

  render() {
    const { rotation } = this.state;

    return (
      <div
        id="map-container"
        style={{ position: 'fixed', height: '100%', width: '100%' }}
      >

        <FormControl
          style={controlBoxStyle}
        >
          <RotationSlider
            rotation={rotation}
            onRotationChange={this.onRotationChange}
          />

          <RadioGroup
            style={{ flexDirection: 'row' }}
            value={this.state.currentLayer}
            onChange={this.switchLayers}
          >
            {_.map(layerOptions, l => (
              <FormControlLabel key={l} value={l} control={<Radio color="primary" />} label={l} />
              ))
          }
          </RadioGroup>
        </FormControl>

      </div>
    );
  }
}

export default OpenLayersMap;
