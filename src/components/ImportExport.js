import React from 'react';
import { Button } from 'material-ui';
import KML from 'ol/format/kml';
import _ from 'lodash';
import Immutable from 'immutable';
import Projection from 'ol/proj';
import MultiPolygon from 'ol/geom/multipolygon';
import Dialog, { DialogTitle } from 'material-ui/Dialog';
import Divider from 'material-ui/Divider';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Radio from 'material-ui/Radio';
import { FormGroup, FormControlLabel } from 'material-ui/Form';
import downloadjs from 'downloadjs';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import Tooltip from 'material-ui/Tooltip';
import IconButton from 'material-ui/IconButton';
import { getMapStyle } from '../utils/mapUtils';
import { Trail, Hydrant } from '../utils/records';


class ImportExport extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedFiles: null,
      exportType: null,
      dialogOpen: false,
      selectedExport: 'trails',
    };
    this.changeFile = this.changeFile.bind(this);
    this.importFile = this.importFile.bind(this);
  }

  changeFile(e) {
    this.setState({
      selectedFiles: e.target.files,
    });
  }

  importFile = () => {
    const { selectedFiles } = this.state;
    const { importKMLClicked, trails, hydrants } = this.props;

    function processTrail(feature, index) {
      let [name, ...otherThings] = feature.get('description').split(',');
      name = _.words(name).join(' ');
      const coords = feature.getGeometry().getCoordinates()[0];
      const lonLatCoords = _.map(coords, pt => Projection.fromLonLat(pt.slice(0, 2)));
      feature.getGeometry().setCoordinates([lonLatCoords]);
      feature.setId(`t-${name}-${index}`);
      feature.set('name', name);
      feature.setStyle(getMapStyle);
      return new Trail({ name, features: [feature] });
    }

    function processHydrant(feature, index) {
      let [trailName, hydrantIndex, name]  = feature.get('description').split(',');
      trailName = _.words(trailName).join(' ');
      const trailObj = trails.find(t => t.get('name') === trailName);
      const trailId = trailObj ? trailObj.get('id') : null;
      const id = index + name;
      const geometry = feature.getGeometry().getType() === 'Point' ?
        feature.getGeometry() : feature.getGeometry().getGeometries()[0];
      feature.setGeometry(geometry);
      const coords = geometry.getCoordinates();
      feature.getGeometry().setCoordinates(Projection.fromLonLat(coords.slice(0,2)));
      feature.setId(`h-${id}-${index}`);
      feature.set('trailName', trailName);
      feature.setStyle(getMapStyle);
      return new Hydrant({ id, name, coords, feature, trail: trailId });
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const kml = new KML().readFeatures(event.target.result);
        const newTrails = {};
        const newHydrants = {};

        _.each(kml, (feature, index) => {
          const type = feature.getGeometry().getType() === 'Polygon' ? 'trail' : 'hydrant';
          if (type === 'trail') {
            let trail = processTrail(feature, index);
            const existing = newTrails[trail.get('name')];
            if (existing) {
              const newFeatures = existing.get('features').concat(trail.get('features')[0]);
              newTrails[existing.get('id')] = existing.set('features', newFeatures);
            } else {
              trail = trail.set('id', trail.get('name'));
              newTrails[trail.get('id')] = trail;
              hydrants
                .filter(h => h.get('feature').get('trailName') === trail.get('name'))
                .forEach((h) => {
                  newHydrants[h.get('id')] = h.set('trail', trail.get('id'));
                });
            }
          } else {
            const hydrant = processHydrant(feature, index);
            newHydrants[hydrant.get('id')] = hydrant;
          }
        });

        importKMLClicked({
          trails: Immutable.Map(newTrails),
          hydrants:  Immutable.Map(newHydrants),
        });
      } catch (err) {
        // Put error wherever we want to display error msgs.
        console.log(err);
      }
    };

    if (selectedFiles) {
      reader.readAsText(selectedFiles[0]);
    }
  }

  exportFile = () => {
    const { trails, hydrants } = this.props;
    const { selectedExport } = this.state;

    const trailFeatures = _.values(trails.toJS()).map(item => item.feature);
    const hydrantFeatures = _.values(hydrants.toJS()).map(item => item.feature);

    function GetKMLFromFeatures(features) {
      const format = new KML();
      const kml = format.writeFeatures(features, {featureProjection: 'EPSG:3857'});
      return kml;
    }

    if (selectedExport === 'trails') {
      downloadjs(GetKMLFromFeatures(trailFeatures), 'Trails.kml');
    } else {
      downloadjs(GetKMLFromFeatures(hydrantFeatures), 'Hydrants.kml');
    }
  }

  handleClose = () => {
    this.setState({
      dialogOpen: false,
    });
  }

  handleOpen = () => {
    this.setState({
      dialogOpen: true,
    });
  }

  handleSelect = (event) => {
    this.setState({
      selectedExport: event.target.value
    })
  }

  render() {
    const { dialogOpen, selectedExport } = this.state;

    const style = {
      float: 'left',
    };
    return (
      <div style={{display: 'inline', margin: '20px'}}>
        <Tooltip title="Import/Export" placement="top-start">
        {/*<IconButton onClick={this.handleOpen}>
           <ImportExportIcon />
          </IconButton>*/}
        <Button onClick={this.handleOpen} 
          style={{color: 'rgba(0,0,0,0.87)', backgroundColor: '#e0e0e0'}}
        >Import/Export</Button>
        </Tooltip>
        <Dialog onBackdropClick={this.handleClose} open={dialogOpen} >
          <DialogTitle >Import/Export</DialogTitle>
          <div>
            <List>
              <ListItem>
                <ListItemText primary='Import' />
                <input onChange={this.changeFile} type="file" accept=".kml" />
                <Button variant="raised" onClick={this.importFile} > Import </Button>
              </ListItem>
              <li>
                <Divider inset />
              </li>
              <ListItem>
                <ListItemText primary='Export' />
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Radio
                      checked={selectedExport === 'trails'}
                      onChange={this.handleSelect}
                      value='trails'
                      />
                    }
                    label="Trail Layer"
                  />
                  <FormControlLabel
                    control={
                      <Radio
                      checked={selectedExport === 'hydrants'}
                      onChange={this.handleSelect}
                      value='hydrants'
                      />
                    }
                    label="Hydrants Layer"
                  />
                </FormGroup>
                <Button variant="raised"  onClick={this.exportFile} > Export </Button>
              </ListItem>
            </List>
          </div>
        </Dialog>
      </div>
    );
  }
}

export default ImportExport;
