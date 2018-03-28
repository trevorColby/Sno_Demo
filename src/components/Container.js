import React from 'react';
import _ from 'lodash';
import Projection from 'ol/proj';
import MapControls from './MapControls';
import OpenLayersMap from './OpenLayersMap';
import TrailList from './TrailList';
import {mapObjects, defaultTrails} from '../utils/constants';
import kill_logo from './../imgs/Kill_Logo.png'
import {Image} from 'react-bootstrap';

class Container extends React.Component{

  constructor(props){
    super(props);
    this.endDraw = this.endDraw.bind(this);
    this.state = {
      createType: null,
      selectedTrail: null,
      trails: []
      editableTrail: false
    }
  }

  componentDidMount() {
    const savedTrails = localStorage.getItem('trails');
    const trails = savedTrails ? JSON.parse(savedTrails) : defaultTrails;
    this.setState({trails: trails});
  }

  componentDidUpdate() {
    this.saveToLocalStorage();
  }

  saveToLocalStorage = () => {
    localStorage.setItem('trails', JSON.stringify(this.state.trails));
  }

  renameTrail = (trailId, newName) => {
    const {editableTrail, trails} = this.state
    if(newName){
      let editedTrails = trails.map((t)=> {
         if(t.id == trailId) {
           t.name = newName
         }
         return t
      })

      this.setState({editableTrail: null, trails: editedTrails})
    } else{
      this.setState({editableTrail: trailId})
    }

  }

  deleteTrail = (trail) => {
    const {trails} = this.state;
    const newTrails = _.filter(trails, (item) => {
      return item.id !== trail.id;
    });
    this.setState({trails: newTrails});
  }

  deleteGun = (gun) => {
    const {trails, selectedTrail} = this.state;
    const newTrails = _.cloneDeep(trails);
    const selectedTrailIndex = _.findIndex(newTrails, (t) => t.id === selectedTrail);
    const selectedGunIndex = _.findIndex(newTrails[selectedTrailIndex].guns, (g) => g.id === gun.id);
    newTrails[selectedTrailIndex].guns.splice(selectedGunIndex, 1);
    this.setState({trails: newTrails});
  }

  endModify = (e) => {
    const {trails, selectedTrail} = this.state;
    const newTrails = _.cloneDeep(trails);
    const feature = e.target;
    const selectedTrailIndex = _.findIndex(newTrails, (t) => t.id === selectedTrail);
    
    if (feature.values_.id === _.get(newTrails, `${selectedTrailIndex}.id`)) {
      // if trail
      const newCoords = _.map(feature.getGeometry().getCoordinates()[0], (pt) => {
        return Projection.toLonLat(pt);
      });
      newTrails[selectedTrailIndex].coords = newCoords;
    } else {
      // its a hydrant
      const newCoords = Projection.toLonLat(feature.getGeometry().getCoordinates());
      const gunIndex = _.findIndex(newTrails[selectedTrailIndex].guns, (g) => g.id === feature.values_.id);
      newTrails[selectedTrailIndex].guns[gunIndex].coords = newCoords;
    }

    this.setState({trails: newTrails});
  }

  endDraw(drawEvent) {
    const {createType, trails, selectedTrail} = this.state;
    switch (createType){
      case 'Trail': {
        const coords = _.map(_.get(drawEvent, 'target.sketchLineCoords_'), (drawCoord) => {
          return Projection.toLonLat(drawCoord);
        });
        const newTrails = _.cloneDeep(trails);
        const newTrail = {
          // just use a timestamp to ensure unique id for now, database would supply later
          id: new Date().getTime(),
          name: 'New Trail',
          guns: [],
          coords: coords
        };
        newTrails.push(newTrail);
        this.setState({createType: null, trails: newTrails, selectedTrail: newTrail.id});
        break;
      }
      case 'Hydrant': {
        const coords = Projection.toLonLat(_.get(drawEvent, 'target.sketchCoords_'));
        const trailIndex = _.findIndex(trails, (trail) => trail.id === selectedTrail);
        if (trailIndex !== -1) {
          const guns = _.clone(trails[trailIndex].guns);
          guns.push({id: new Date().getTime(), coords: coords});
          const newTrails = _.cloneDeep(trails);
          newTrails[trailIndex].guns = guns;
          this.setState({trails: newTrails});
          break;
        }
      }
      default:
        console.log("haven't implemented this type yet");
    }
  }

  mapControlClicked = (type) => {
    if (type === 'Hydrant') {
      this.setState({createType: type});
    } else {
      this.setState({createType: type || null, selectedTrail: null});
    }
  }

  render(){
    const {trails, createType, selectedTrail, editableTrail} = this.state;

    return (
      <div style={{position: 'relative'}}>
        <OpenLayersMap
          createType={createType}
          endDraw={this.endDraw}
          endModify={this.endModify}
          trails={trails}
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
        <Image style={{float: 'right', width: 300}} src={kill_logo} responsive />
      </div>
    )
  }
}

export default Container;
