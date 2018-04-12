import React from 'react';
import _ from 'lodash';
import Immutable from 'immutable';
import Projection from 'ol/proj';
import MapControls from './MapControls';
import OpenLayersMap from './OpenLayersMap';
import TrailList from './TrailList';
import {getElevation} from '../utils/mapUtils';
import kill_logo from './../imgs/Kill_Logo.png'
import {Image} from 'react-bootstrap';
import ImportExport from './ImportExport';

class Container extends React.Component{
  constructor(props){
    super(props);
    this.endDraw = this.endDraw.bind(this);
    this.state = {
      mode: 'trails',
      selectedTrail: null,
      trails: Immutable.Map(),
      hydrants: Immutable.Map()
    }
  }

  componentDidMount() {
    const savedTrails = localStorage.getItem('trails');
    const savedHydrants = localStorage.getItem('hydrants');
    const trails = savedTrails ? JSON.parse(savedTrails) : {};
    const hydrants = savedHydrants ? JSON.parse(savedHydrants) : {};
    this.setState({
      trails: Immutable.fromJS(trails),
      hydrants: Immutable.fromJS(hydrants)
    });
  }

  componentDidUpdate() {
    const {trails, hydrants} = this.state;
    localStorage.setItem('trails', JSON.stringify(trails.toJS()));
    localStorage.setItem('hydrants', JSON.stringify(hydrants.toJS()));
  }

  modifyTrail = (trailId, editedFields, shouldDelete=false) => {
    const {trails} = this.state;
    if (shouldDelete) {
      this.setState({trails: trails.delete(trailId)});
    } else {
      let newTrail = trails.get(trailId).merge(editedFields);
      this.setState({trails: trails.set(trailId, newTrail)});
    }
  }

  modifyHydrant = (hydrantId, editedFields, shouldDelete=false) => {
    const {hydrants} = this.state;
    if (shouldDelete) {
      this.setState({hydrants: hydrants.delete(hydrantId)});
    } else {
      let newHydrant = hydrants.get(hydrantId).merge(editedFields);
      this.setState({hydrants: hydrants.set(hydrantId, newHydrant)});
    }
  }

  endModify = (e) => {
    if (!e) {
      return;
    }
    const {trails, selectedTrail, hydrants} = this.state;
    const feature = e.target;

    if (feature.values_.id === selectedTrail) {
      // if trail
      const newCoords = _.map(feature.getGeometry().getCoordinates()[0], (pt) => {
        return Projection.toLonLat(pt);
      });
      this.modifyTrail(selectedTrail, {coords: Immutable.fromJS(newCoords)});
    } else {
      // its a hydrant
      const newCoords = Projection.toLonLat(feature.getGeometry().getCoordinates());
      this.modifyHydrant(feature.values_.id, {coords: Immutable.fromJS(newCoords)});
    }
  }

  endDraw(drawEvent) {
    const {mode, trails, selectedTrail, hydrants} = this.state;
    let id = new Date().getTime();
    id = id.toString();
    switch (mode){
      case 'trails': {
        const coords = _.map(_.get(drawEvent, 'target.sketchLineCoords_'), (drawCoord) => {
          return Projection.toLonLat(drawCoord);
        });
        const newTrail = Immutable.fromJS({
          // just use a timestamp to ensure unique id for now, database would supply later
          id: id,
          name: 'New Trail',
          guns: [],
          coords: coords
        });
        let newTrails = trails.set(newTrail.get('id'), newTrail);
        this.setState({trails: newTrails, selectedTrail: newTrail.id});
        break;
      }
      case 'hydrants': {
        const coords = Projection.toLonLat(_.get(drawEvent, 'target.sketchCoords_'));
        const createdHydrant = Immutable.fromJS({
          id: id,
          coords: coords,
          trail: selectedTrail
        });
        let newHydrants = hydrants.set(createdHydrant.get('id'), createdHydrant);
        this.setState({hydrants: newHydrants});
        getElevation(coords).then((data) => {
          const elevation = data[0].height;
          this.modifyHydrant(id, {elevation});
        });
        break;
      }
      default:
        console.log("haven't implemented this type yet");
    }
  }

  indexNamebyElevation = () => {
    const { selectedTrail, hydrants } = this.state;

    const sortedTrailHydrants = hydrants.toJS()
      .filter((h) => h.trail === selectedTrail)
      .orderBy('elevation', 'desc')
      .map((h,i)=> {
        h.name = i + 1
        return h
      }).value();

    let newHydrants = hydrants.map((h) => {
      const elevationIndex = _.findIndex(sortedTrailHydrants, (sortedHydrant) => sortedHydrant.id === h.get('id'));
      return h.set('name', elevationIndex);
    });

    this.setState({
      hydrants: newHydrants
    });
  }

  importKMLClicked = (kmlData) => {
    const {trails, hydrants} = this.state;
    this.setState({
      trails: trails.merge(kmlData.trails),
      hydrants: hydrants.merge(kmlData.hydrants)
    })
  }


  render(){
    const {trails, mode, selectedTrail, hydrants} = this.state;

    return (
      <div style={{position: 'relative'}}>
        <OpenLayersMap
          mode={mode}
          endDraw={this.endDraw}
          endModify={this.endModify}
          trails={trails}
          hydrants={hydrants}
          selectedTrail={selectedTrail}
        />
        <MapControls
          mode={mode}
          changeMode={(mode) => this.setState({mode})}
        />
        <TrailList
          modifyTrail={this.modifyTrail}
          trails={trails}
          hydrants={hydrants}
          selected={selectedTrail}
          trailSelected={(id) => this.setState({selectedTrail: id})}
        />

        <ImportExport
          importKMLClicked= {this.importKMLClicked}
          trails = {trails}
          hydrants = {hydrants}
         />

        <Image style={{float: 'right', width: 300, margin: 12}} src={kill_logo} responsive />
      </div>
    )
  }
}

export default Container;
