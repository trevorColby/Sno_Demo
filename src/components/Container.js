import React from 'react';
import _ from 'lodash';
import Projection from 'ol/proj';
import MapControls from './MapControls';
import OpenLayersMap from './OpenLayersMap';
import TrailList from './TrailList';

const defaultTrails = [{
    id: 1, name: 'First Trail', guns: []
  }, {
    id: 2, name: 'Second Trail', guns: []
  }, {
    id: 3, name: 'Third Trail', guns: []
  }
];

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

  saveToLocalStorage = () => {
    localStorage.setItem('trails', JSON.stringify(this.state.trails));
  }

  deleteTrail = (trail) => {
    const {trails} = this.state;
    const newTrails = _.filter(trails, (item) => {
      return item.id !== trail.id;
    });
    this.setState({trails: newTrails});
    this.saveToLocalStorage();
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
    this.saveToLocalStorage();
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
        <OpenLayersMap 
          createType={createType} 
          endDraw={this.endDraw}
          trails={trails}
        />
        <MapControls 
          onClick={this.mapControlClicked} 
          canAddHydrant={!!selectedTrail}
        />
        <TrailList 
          trails={trails} 
          selected={selectedTrail} 
          deleteTrail={this.deleteTrail}
          trailSelected={(id) => this.setState({selectedTrail: id})}
        />
      </div>
    )
  }
}

export default Container;