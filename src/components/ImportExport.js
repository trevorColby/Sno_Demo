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
import Tooltip from 'material-ui/Tooltip';
import { getMapStyle, convertTrailFeaturesToDonuts } from '../utils/mapUtils';
import { hexToRgb } from '../utils/convertToRGB'
import { Trail, Hydrant } from '../utils/records';
import Select from 'material-ui/Select';
import { MenuItem } from 'material-ui/Menu';
import Typography from 'material-ui/Typography';
import {IconButton, InputLabel} from 'material-ui';



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
      const originalTrailName = name
      name = _.words(name).join(' ');
      const coords = feature.getGeometry().getCoordinates()[0];
      const lonLatCoords = _.map(coords, pt => Projection.fromLonLat(pt.slice(0, 2)));

      const featureFill = feature.getStyle().call(feature)[0].getFill()

      let fillColor = '255,255,255';
      if (featureFill) {
        fillColor = hexToRgb(featureFill.getColor()) || featureFill.getColor().slice(0, 3).join(',')
      }

      feature.getGeometry().setCoordinates([lonLatCoords]);
      feature.setId(`t-${name}-${index}`);
      feature.set('originalTrailName', originalTrailName)
      feature.set('name', name);
      feature.set('fillColor', fillColor)
      feature.changed()
      feature.setStyle(getMapStyle);

      return new Trail({ name, features: [feature], fillColor });
    }




   function processHydrant(feature, index) {
      let [trailName, hydrantIndex, name]  = feature.get('description').split(',');
      const originalTrailName = name
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
      feature.set('originalTrailName', originalTrailName)
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

    const trailFeatures = []
    const hydrantFeatures = []

    trails.valueSeq().forEach((v) => {
      let trailName = v.get('name').split(' ').join('_')
      // Iterate through Trail's Features
      v.get('features').forEach((f) => {
        if (f.get('originalTrailName')) {
          trailName = f.get('originalTrailName')
        }
        const description = trailName
        f.unset('features')
        f.set('description', description)
        f.setStyle()
        trailFeatures.push(f)
      })
      // Iterate through Trail's Hydrants
      _.chain(hydrants.toJS())
        .values()
        .filter({ trail: v.get('id') })
        .orderBy('name', 'asc')
        .value()
        .forEach((h, index) => {
           const feature = h.feature
           feature.set('description', `${trailName},${index},${feature.get('name')}`)
           hydrantFeatures.push(feature)
         })
    })

    const ext = exportType === 'GJ' ? 'json' : 'kml';

    function getFileFromFeatures(features) {
      const format = exportType === 'GJ' ? new GeoJSON() : new KML();
      const exportFile = format.writeFeatures(features, { featureProjection: 'EPSG:3857' });
      return exportFile;
    }

    if (selectedExport === 'trails') {
      downloadjs(getFileFromFeatures(trailFeatures), `Trails.${ext}`);
    } else {
      downloadjs(getFileFromFeatures(hydrantFeatures), `Hydrants.${ext}`);
    }
  }

  generateCSV = () => {
    const { hydrants, trails } = this.props;
    const hydrantsRows = [
      ['Trail_Name', 'Hyd_Index', 'Hyd_ID', 'Hyd_State', 'Hyd_Hours',
      'Hyd_Gun', 'Hyd_Gpm', 'Hyd_Notes', 'Hyd_Elevation',
      'Hyd_Target_Gallons', 'Hyd_Total_Gallons', 'Hyd_Cfm', 'Hyd_Pressure_Zone']
    ]
    trails.keySeq().forEach((trailId) => {
      const trail = trails.get(trailId)
      const trailName = trail.get('features')[0].get('originalTrailName') || trail.get('name').split(' ').join('_')

      const trailHydrants = _
        .chain(hydrants.toJS())
        .values()
        .filter({ trail: trailId })
        .orderBy('name', 'asc')
        .value();

      for (let i = 0; i < 100; i += 1) {
        let hydId = i
        let elevation = 0
        if (trailHydrants[i]) {
          hydId = trailHydrants[i].name
          elevation = trailHydrants[i].elevation
        }
        hydrantsRows.push([
          trailName, i, hydId, 0, 0,
          'None', 0, 'None', elevation, 0,
          0, 0, 'None',
        ]);
      }
    });
    const lineArray = []
    hydrantsRows.forEach((r, i) => {
      const line = r.join(",")
      lineArray.push(i === 0 ? "data:text/csv;charset=utf-8," + line : line)
    });
    const csvContent = lineArray.join("\n")
    const encodedUri = encodeURI(csvContent);
    // window.location.assign(encodedUri);
    downloadjs(encodedUri, `Hydrants_Table.csv`);
  }


  handleSelect = (event) => {
    this.setState({
      selectedExport: event.target.value
    })
  }

  render() {
    const { classes, setImportExportOpen, importExportOpen } = this.props;

    const { selectedExport  } = this.state;

    return (
      <div style={{display: 'inline'}}>

        <Dialog onBackdropClick={() => setImportExportOpen(false)} open={importExportOpen} >
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

            <Button
              onClick={this.generateCSV}
            >

            Download Hydrants_Table.CSV
            </Button>
          </List>
          <Divider />
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(ImportExport);
