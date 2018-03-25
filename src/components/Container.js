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

  endDraw(drawEvent) {
    const {createType, trails, selectedTrail} = this.state;
    switch (createType){
      case 'Trail': {
        const coords = _.map(_.get(drawEvent, 'target.sketchLineCoords_'), (drawCoord) => {
          return Projection.toLonLat(drawCoord);
        });

        const newTrail = {
          // just use a timestamp to ensure unique id for now, database would supply later
          id: new Date().getTime(),
          name: 'New Trail',
          guns: [],
          coords: coords
        };
        const newTrails = _.cloneDeep(trails);
        newTrails.push(newTrail);
        this.setState({createType: null, trails: newTrails});
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
    const {trails, createType, selectedTrail} = this.state;
    return (
      <div style={{position: 'relative'}}>
        <Image style={{position: 'absolute', zIndex: '99', bottom:0, left:0, width: 300}} src={kill_logo} responsive />
        <OpenLayersMap 
          createType={createType} 
          endDraw={this.endDraw}
          trails={trails}
          selectedTrail={selectedTrail}
        />
        <MapControls 
          onClick={this.mapControlClicked} 
          canAddHydrant={!!selectedTrail}
        />
        <TrailList 
          trails={trails} 
          selected={selectedTrail} 
          deleteTrail={this.deleteTrail}
          deleteGun={this.deleteGun}
          trailSelected={(id) => this.setState({selectedTrail: id})}
        />
      </div>
    )
  }
}

export default Container;
