import React from 'react';
import { Button } from 'material-ui';
import KML from 'ol/format/kml';
import _ from 'lodash';
import {Coordinate} from 'ol';
import Immutable from 'immutable';
import Feature from 'ol/feature';
import Point from 'ol/geom/point';
import Projection from 'ol/proj';
import Polygon from 'ol/geom/polygon';
import GeometryCollection from 'ol/geom/geometrycollection';
import {getMapStyle} from '../utils/mapUtils';
import Dialog, { DialogTitle } from 'material-ui/Dialog';

import Divider from 'material-ui/Divider';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Radio from 'material-ui/Radio';
import { FormGroup, FormControlLabel } from 'material-ui/Form';

import { withStyles } from 'material-ui/styles';
import {Trail, Hydrant} from '../utils/records';



class ImportExport extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedFiles: null,
      exportType: null,
      dialogueMain: false,
      selectedExport: 'trails',
    }
    this.changeFile = this.changeFile.bind(this);
    this.importFile = this.importFile.bind(this);
  }

  changeFile(e) {
    this.setState({
      selectedFiles: e.target.files
    })
  }

  importFile = () =>  {
    const { selectedFiles } = this.state;
    const { importKMLClicked, trails } = this.props;
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const kml = new KML().readFeatures(event.target.result)
        const newTrails = {};
        const newHydrants = {};

        _.each(kml, (feature, index) => {
            const type = feature.getGeometry().getType() === 'Polygon' ? 'trail' : 'hydrant';
            if(type === 'trail'){
              const trail = processTrail(feature, index);
              newTrails[trail.get('id')] = trail;
            } else {
              const hydrant = processHydrant(feature, index);
              newHydrants[hydrant.get('id')] = hydrant;
            }
        });

          importKMLClicked({
            trails: Immutable.fromJS(newTrails),
            hydrants:  Immutable.fromJS(newHydrants),
          })

        }
      }
      catch(err) {
        // Put error wherever we want to display error msgs.
          console.log(err);
      }
    }

    function processTrail(feature, index) {
      let [name, ...otherThings] = feature.get('description').split(',');
      name = _.words(name).join(' ');
      const id = index + name;
      const coords = feature.getGeometry().getCoordinates()[0];
      const lonLatCoords = _.map(coords, (pt) => Projection.fromLonLat(pt.slice(0,2)));
      feature.getGeometry().setCoordinates([lonLatCoords]);
      feature.setId(`t${id}`);
      return new Trail({ id, name, coords, feature });
    }

    function processHydrant(feature, index) {
      let [trailName, hydrantIndex, name]  = feature.get('description').split(',');
      trailName = _.words(trailName).join(' ');
      const trailObj = trails.find((t) => t.get('name') === trailName)
      const trailId = trailObj ? trailObj.get('id') || null;
      const id = index + name;
      const geometry = feature.getGeometry().getGeometries()[0];
      feature.setGeometry(geometry);
      const coords = geometry.getCoordinates();
      feature.getGeometry().setCoordinates(Projection.fromLonLat(coords.slice(0,2)));
      feature.setId(`h${id}`);
      return new Hydrant({ id, name, coords, feature, trail: trailId });
    }

    if (selectedFiles) {
      reader.readAsText(selectedFiles[0]);
    }
  }

  exportFile = () => {
    const { trails, hydrants } = this.props
    const { selectedExport } = this.state

    const trailFeatures = _.values(trails.toJS()).map((item)=> {
      return new Feature ({
        geometry: new Polygon([_.map(item.coords, (pt) => {
          return Projection.fromLonLat(pt);
        })]),
        description: item.name,
      })
    })

    const hydrantFeatures  = _.values(hydrants.toJS()).map((item)=> {
      const feature =  new Feature ({
        geometry: new Point(Projection.fromLonLat(item.coords)),
         name: item.name,
         description: item.name,
        })
        feature.setStyle(getMapStyle(feature))
        return feature
      })


   if(selectedExport === 'trails'){
     downloadjs(GetKMLFromFeatures(trailFeatures), 'Trails.kml')
   } else {
     downloadjs(GetKMLFromFeatures(hydrantFeatures), 'Hydrants.kml')
   }

    function GetKMLFromFeatures(features) {
          const format = new KML();
          const kml = format.writeFeatures(features, {featureProjection: 'EPSG:3857'});
          return kml;
      }

  }

  handleClose = () => {
    this.setState({
      dialogueMain: false
    })
  }

  handleOpen = () => {
    this.setState({
      dialogueMain: true
    })
  }

  handleSelect = event => {
    this.setState({
      selectedExport: event.target.value
    })
  }

  render() {
    let style= {
      float: 'left'
    }
    const { dialogueMain, selectedExport } = this.state

    return (
      <div>
          <div style={style}>
            <Button variant="raised" onClick={this.handleOpen}>Import / Export</Button>
          </div>
          <Dialog onBackdropClick={this.handleClose} aria-labelledby="simple-dialog-title" open={dialogueMain} >
            <DialogTitle id="simple-dialog-title">Import/Export</DialogTitle>
            <div>
              <List>
                <ListItem>
                  <ListItemText primary='Import' />
                  <input onChange={this.changeFile} type='file' />
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
    )
  }
}





export default ImportExport;
