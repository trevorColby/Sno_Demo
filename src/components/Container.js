import React from 'react';
import _ from 'lodash';
import Immutable from 'immutable';
import Projection from 'ol/proj';
import MapControls from './MapControls';
import OpenLayersMap from './OpenLayersMap';
import TrailList from './TrailList';
import {defaultTrails} from '../utils/constants';
import {getElevation} from '../utils/mapUtils';
import kill_logo from './../imgs/Kill_Logo.png'
import {Image} from 'react-bootstrap';
import ImportExport from './ImportExport';

class Container extends React.Component{
  constructor(props){
    super(props);
    this.endDraw = this.endDraw.bind(this);
    this.state = {
      createType: null,
      selectedTrail: null,
      trails: Immutable.Map(),
      hydrants: Immutable.Map()
    }
  }

  componentDidMount() {
    const savedTrails = localStorage.getItem('trails');
    const savedHydrants = localStorage.getItem('hydrants');
    const trails = savedTrails ? JSON.parse(savedTrails) : defaultTrails;
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

  renameTrail = (trailId, newName) => {
    const {trails} = this.state;
    if (newName) {
      this.setState({
        trails: trails.setIn([trailId, 'name'], newName)
      });
    }
  }

  deleteTrail = (id) => {
    const {trails} = this.state;
    const newTrails = trails.delete(id.toString());
    // decide if this should also delete the hydrants with it or just "orphan" them
    this.setState({trails: newTrails});
  }

  deleteHydrant = (id) => {
    const {hydrants} = this.state;
    this.setState({hydrants: hydrants.delete(id)});
  }

  updateHydrant = (hydrantId, editedFields) => {
    const {hydrants} = this.state;
    let newHydrant = hydrants.get(hydrantId).merge(editedFields);
    this.setState({hydrants: hydrants.set(hydrantId, newHydrant)});
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
      this.setState({
        trails: trails.setIn([selectedTrail, 'coords'], Immutable.fromJS(newCoords))
      });
    } else {
      // its a hydrant
      const newCoords = Projection.toLonLat(feature.getGeometry().getCoordinates());
      this.setState({
        hydrants: hydrants.setIn([feature.values_.id, 'coords'], Immutable.fromJS(newCoords))
      });
    }
  }

  endDraw(drawEvent) {
    const {createType, trails, selectedTrail, hydrants} = this.state;
    let id = new Date().getTime();
    id = id.toString();
    switch (createType){
      case 'Trail': {
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
        this.setState({createType: null, trails: newTrails, selectedTrail: newTrail.id});
        break;
      }
      case 'Hydrant': {
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
          this.updateHydrant(id, {elevation});
        });
        break;
      }
      default:
        console.log("haven't implemented this type yet");
    }
  }

  indexNamebyElevation = () => {
    const { selectedTrail } = this.state;
    let newHydrants = _.cloneDeep(this.state.hydrants);

    const sortedTrailHydrants = _.chain(newHydrants)
      .pickBy((h) => h['trail'] === selectedTrail)
      .orderBy('elevation', 'desc')
      .map((h,i)=> {
        h.name = i + 1
        return h
      }).value();

    _.each(sortedTrailHydrants , (h,key)=> {
      newHydrants[h.id] = h
    });
    this.setState({
      hydrants: newHydrants
    });
  }

  mapControlClicked = (type) => {
    if (type === 'Hydrant') {
      this.setState({createType: type});
    }else {
      this.setState({createType: type || null, selectedTrail: null});
    }
  }

  importKLMClicked = (file) => {
    console.log(file)
  }

  render(){
    const {trails, createType, selectedTrail, hydrants} = this.state;

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
          renameTrail={this.renameTrail}
          trails={trails}
          hydrants={hydrants}
          selected={selectedTrail}
          deleteTrail={this.deleteTrail}
          trailSelected={(id) => this.setState({selectedTrail: id, createType: id ? 'Trail' : null})}
        />

        <ImportExport
        importKLMClicked= {this.importKLMClicked}
         />

        <Image style={{float: 'right', width: 300, margin: 12}} src={kill_logo} responsive />
      </div>
    )
  }
}

export default Container;
