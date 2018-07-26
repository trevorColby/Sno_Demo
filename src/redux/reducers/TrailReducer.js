import _ from 'lodash';
import Immutable from 'immutable';
import ActionTypes from '../ActionTypes';
import { convertTrailFeaturesToDonuts } from '../../utils/mapUtils';

const {
  DATA_IMPORTED,
  TRAIL_ADDED,
  TRAIL_MODIFIED,
  TRAIL_SELECTED,
  TRAIL_DELETED,
  DB_DATA_FETCHED,
} = ActionTypes;

const initialState = {
  trails: Immutable.Map(),
};

function updateTrailFeatures(trail, editedFields) {
  _.each(trail.get('features'), (f) => {
    if (editedFields.name) {
      f.set('name', editedFields.name)
    }
    if (editedFields.fillColor) {
      f.set('fillColor', editedFields.fillColor)
    }
    f.changed()
  });
}



export default (state = initialState, action) => {
  switch (action.type) {
    case TRAIL_ADDED: {
      const { trails } = state;
      const trail = action.data;
      const newTrails = trails.set(trail.get('id'), trail);
      return {
        ...state,
        trails: newTrails,
      };
    }
    case DB_DATA_FETCHED: {
      //Create new trails where dbID = trails.id
      const {trails} = action.data;
      const storeTrails = state.trails;

      const newTrails = storeTrails.map((t)=>{
        const matchedTrail = _.find(trails, (dbt)=> dbt.name == t.name )
        return t.set("dbId", matchedTrail.id)
      })

      return {
        ...state,
        trails: newTrails
      }

    }
    case TRAIL_SELECTED: {
      // this is actually bad because state shouldnt cause side effects
      // but this map stuff is a little wack
      const { prevSelected, selected } = action.data;
      if (prevSelected && state.trails.get(prevSelected)) {
        const features = state.trails.getIn([prevSelected, 'features']);
        _.each(features, (f) => {
          f.unset('selected');
          f.changed();
        });
      }
      if (selected && state.trails.get(selected)) {

        const features = state.trails.getIn([selected, 'features']);
        _.each(features, (f) => {
          f.set('selected', true);
          f.changed();
        });
      }
      return state;
    }
    case TRAIL_DELETED: {
      const trailId = action.data;
      const newTrails = state.trails.delete(trailId);
      return {
        ...state,
        trails: newTrails,
      };
    }
    case TRAIL_MODIFIED: {
      const { id, editedFields } = action.data;

      let newTrail = state.trails.get(id)
        .withMutations((tr) => {
          _.each(editedFields, (val, key) => tr.set(key, val));
        });
      if (_.has(editedFields, 'features')) {
        newTrail = convertTrailFeaturesToDonuts(newTrail);
      }
      updateTrailFeatures(newTrail, editedFields)
      return {
        ...state,
        trails: state.trails.set(id, newTrail),
      };
    }
    case DATA_IMPORTED: {
      const { trails } = action.data;
      return {
        ...state,
        trails: state.trails.merge(trails),
      };
    }
    default:
      return state;
  }
};
