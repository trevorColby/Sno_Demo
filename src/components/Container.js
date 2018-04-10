import React from 'react';
import _ from 'lodash';
import Projection from 'ol/proj';
import MapControls from './MapControls';
import OpenLayersMap from './OpenLayersMap';
import TrailList from './TrailList';
import {mapObjects, defaultTrails} from '../utils/constants';
import {getElevation} from '../utils/mapUtils';
import kill_logo from './../imgs/Kill_Logo.png'
import {Image} from 'react-bootstrap';

class Container extends React.Component{
  constructor(props){
    super(props);
    this.endDraw = this.endDraw.bind(this);
    this.state = {
      createType: null,
      selectedTrail: null,
      trails: {},
      hydrants: {},
      editableTrail: false
    }
  }

  componentDidMount() {
    const savedTrails = localStorage.getItem('trails');
    const savedHydrants = localStorage.getItem('hydrants');
    const trails = savedTrails ? JSON.parse(savedTrails) : defaultTrails;
    const hydrants = savedHydrants ? JSON.parse(savedHydrants) : {};
    this.setState({trails: trails, hydrants: hydrants});
  }

  componentDidUpdate() {
    this.saveToLocalStorage();
  }

  saveToLocalStorage = () => {
    localStorage.setItem('trails', JSON.stringify(this.state.trails));
    localStorage.setItem('hydrants', JSON.stringify(this.state.hydrants));
  }

  renameTrail = (trailId, newName) => {
    const {editableTrail, trails} = this.state;
    if (newName) {
      const newTrails = _.cloneDeep(trails);
      newTrails[trailId].name = newName;
      this.setState({editableTrail: null, trails: newTrails})
    } else{
      this.setState({editableTrail: trailId});
    }
    this.saveToLocalStorage();
  }

  deleteTrail = (trail) => {
    const {trails} = this.state;
    const newTrails = _.clone(trails);
    console.log(newTrails, trail.id);
    delete newTrails[trail.id];
    // decide if this should also delete the hydrants with it or just "orphan" them
    this.setState({trails: newTrails});
  }

  deleteHydrant = (hydrant) => {
    const {trails, hydrants, selectedTrail} = this.state;
    const newHydrants = _.cloneDeep(hydrants);
    delete newHydrants[hydrant.id];
    this.setState({hydrants: newHydrants});
  }

  endModify = (e) => {
    if (!e) {
      return;
    }
    const {trails, selectedTrail, hydrants} = this.state;
    const feature = e.target;

    if (feature.values_.id === selectedTrail) {
      // if trail
      const newTrails = _.cloneDeep(trails);
      const newCoords = _.map(feature.getGeometry().getCoordinates()[0], (pt) => {
        return Projection.toLonLat(pt);
      });
      newTrails[selectedTrail].coords = newCoords;
      this.setState({trails: newTrails});
    } else {
      // its a hydrant
      const newHydrants = _.cloneDeep(hydrants);
      const newCoords = Projection.toLonLat(feature.getGeometry().getCoordinates());
      newHydrants[feature.values_.id].coords = newCoords;
      this.setState({hydrants: newHydrants});
    }
  }

  endDraw(drawEvent) {
    const {createType, trails, selectedTrail, hydrants} = this.state;
    switch (createType){
      case 'Trail': {
        const coords = _.map(_.get(drawEvent, 'target.sketchLineCoords_'), (drawCoord) => {
          return Projection.toLonLat(drawCoord);
        });
        const newTrails = _.clone(trails);
        const newTrail = {
          // just use a timestamp to ensure unique id for now, database would supply later
          id: new Date().getTime(),
          name: 'New Trail',
          guns: [],
          coords: coords
        };
        newTrails[newTrail.id] = newTrail;
        this.setState({createType: null, trails: newTrails, selectedTrail: newTrail.id});
        break;
      }
      case 'Hydrant': {
        const coords = Projection.toLonLat(_.get(drawEvent, 'target.sketchCoords_'));
        const newHydrants = _.clone(hydrants);
        const createdHydrant = {
          id: new Date().getTime(), 
          coords: coords, 
          trail: selectedTrail
        };
        newHydrants[createdHydrant.id] = createdHydrant;
        this.setState({hydrants: newHydrants});
        getElevation(coords).then((data) => {
          const elevation = data[0].height;
          const newHydrantsv2 = _.clone(newHydrants);
          newHydrantsv2[createdHydrant.id].elevation = elevation;
          this.setState({hydrants: newHydrantsv2});
        });
        break;
      }
      default:
        console.log("haven't implemented this type yet");
    }
  }


  mapControlClicked = (type) => {
    if (type === 'Hydrant') {
      this.setState({createType: type});
    }else {
      this.setState({createType: type || null, selectedTrail: null});
    }
  }

  render(){
    const {trails, createType, selectedTrail, editableTrail, hydrants} = this.state;

    return (
      <div style={{position: 'relative'}}>
        <OpenLayersMap
          createType={createType}
          endDraw={this.endDraw}
          endModify={this.endModify}
          trails={trails}
          hydrants={hydrants}
          selectedTrail={selectedTrail}
        />
        <MapControls
          onClick={this.mapControlClicked}
          canAddHydrant={!!selectedTrail}
        />
        <TrailList
          editableTrail={editableTrail}
          renameTrail = {this.renameTrail}
          trails={trails}
          selected={selectedTrail}
          deleteTrail={this.deleteTrail}
          deleteGun={this.deleteGun}
          trailSelected={(id) => this.setState({selectedTrail: id, createType: id ? 'Trail' : null})}
        />
        <Image style={{float: 'right', width: 300, margin: 12}} src={kill_logo} responsive />
      </div>
    )
  }
}

export default Container;
