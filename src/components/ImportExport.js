import React from 'react';
import { Button } from 'material-ui';
import KML from 'ol/format/kml';
import GeoJSON from 'ol/format/geojson';
import _ from 'lodash';
import { withStyles } from 'material-ui/styles';
import Immutable from 'immutable';
import Projection from 'ol/proj';
import MultiPolygon from 'ol/geom/multipolygon';
import Dialog, { DialogTitle } from 'material-ui/Dialog';
import Divider from 'material-ui/Divider';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Radio from 'material-ui/Radio';
import { FormGroup, FormControl, FormControlLabel, FormHelperText } from 'material-ui/Form';
import downloadjs from 'downloadjs';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import Tooltip from 'material-ui/Tooltip';
import IconButton from 'material-ui/IconButton';
import { getMapStyle, convertTrailFeaturesToDonuts } from '../utils/mapUtils';
import { Trail, Hydrant } from '../utils/records';
import Select from 'material-ui/Select';
import { MenuItem } from 'material-ui/Menu';
import Typography from 'material-ui/Typography';


const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
});

class ImportExport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFiles: null,
      dialogOpen: false,
      selectedExport: 'trails',
      exportType: 'KML',
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
      let [name, ...otherThings] = feature.get('description').split(',') ;
      name = _.words(name).join(' ');
      const coords = feature.getGeometry().getCoordinates()[0];
      const lonLatCoords = _.map(coords, pt => Projection.fromLonLat(pt.slice(0, 2)));

      const featureFill = feature.getStyle().call(feature)[0].getFill()

      // this needs to be just rgb sepeated
      const fillColor = featureFill ? featureFill.getColor().slice(0, 3).join(',') : '255,255,255'

      feature.getGeometry().setCoordinates([lonLatCoords]);
      feature.setId(`t-${name}-${index}`);
      feature.set('name', name);
      feature.set('fillColor', fillColor)
      feature.changed()
      feature.setStyle(getMapStyle);

      return new Trail({ name, features: [feature], fillColor });
    }




    function processHydrant(feature, index) {
      let [trailName, hydrantIndex, name]  = feature.get('description').split(',');

      console.log(trailName, hydrantIndex, name)
      trailName = _.words(trailName).join(' ');
      const trailObj = trails.find(t => t.get('name') === trailName);
      const trailId = trailObj ? trailObj.get('id') : null;
      const id = index + name;
      const geometry = feature.getGeometry().getType() === 'Point' ?
        feature.getGeometry() : feature.getGeometry().getGeometries()[0];
      feature.setGeometry(geometry);
      const coords = geometry.getCoordinates().slice(0,2);
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
          trails: Immutable.Map(newTrails).map(t => convertTrailFeaturesToDonuts(t)),
          hydrants:  Immutable.Map(newHydrants),
        });
      } catch (err) {
        // Put error wherever we want to display error msgs.
        console.log(err);
      }
    };

    if (selectedFiles && selectedFiles.length) {
      reader.readAsText(selectedFiles[0]);
    }
  }

  exportFile = () => {
    const { trails, hydrants } = this.props;
    const { selectedExport, exportType } = this.state;


    const trailFeatures = _.flatMap(_.values(trails.toJS()), item => item.features);
    const hydrantFeatures = _.flatMap(_.values(hydrants.toJS()), item => item.feature);
    const ext = exportType === 'GJ' ? 'json' : 'kml';

    hydrantFeatures.forEach((f,i) => {
      const desc = `${f.get('trailName')},${i},${f.get('name')}`
      f.set('description', desc)
    })

    trailFeatures.forEach((feature) => {
      //Features in a feature creates GeoJson Circular stringify error
      feature.unset('features')
      feature.set('description', feature.get('name'))
      feature.setStyle(getMapStyle);
    })


    function GetFileFromFeatures(features) {
      const format = exportType === 'GJ' ? new GeoJSON() : new KML();
      const exportFile = format.writeFeatures(features, { featureProjection: 'EPSG:3857' });
      return exportFile;
    }

    if (selectedExport === 'trails') {
      downloadjs(GetFileFromFeatures(trailFeatures), `Trails.${ext}`);
    } else {
      downloadjs(GetFileFromFeatures(hydrantFeatures), `Hydrants.${ext}`);
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
    const { classes } = this.props;

    const { dialogOpen, selectedExport } = this.state;

    return (
      <div style={{display: 'inline', margin: '20px'}}>
        <Tooltip title="Import/Export" placement="top-start">
        <Button onClick={this.handleOpen}
          style={{color: 'rgba(0,0,0,0.87)', backgroundColor: '#e0e0e0'}}
        >Import/Export</Button>
        </Tooltip>
        <Dialog onBackdropClick={this.handleClose} open={dialogOpen} >
          <DialogTitle >Import/Export</DialogTitle>

          <List>
            <ListItem divider>
               <ListItemText primary="Import" />
               <input onChange={this.changeFile} type="file" accept=".kml" />
               <Button variant="raised" onClick={this.importFile} > Import </Button>
            </ListItem>

            <ListItem>
              <ListItemText primary="Export" />
              <div style={{ paddingRight: 35 }}>
                <FormControl className={classes.formControl}>
                  <Select
                    value={this.state.selectedExport}
                    onChange={(e)=> { this.setState({ selectedExport: e.target.value })}}
                  >
                    <MenuItem value={'trails'}>Trails</MenuItem>
                    <MenuItem value={'hydrants'}>Hydrants</MenuItem>
                  </Select>
                  <FormHelperText> Layer </FormHelperText>
                </FormControl>


                <FormControl className={classes.formControl}>
                  <Select
                    value={this.state.exportType}
                    onChange={(e)=> { this.setState({ exportType: e.target.value })}}
                  >
                    <MenuItem value={'KML'}>KML</MenuItem>
                    <MenuItem value={'GJ'}>GeoJson</MenuItem>
                  </Select>
                  <FormHelperText> Format </FormHelperText>
                  </FormControl>
                </div>
                <Button variant="raised"  onClick={this.exportFile} > Export </Button>

            </ListItem>

          </List>

          <Divider />


        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(ImportExport);