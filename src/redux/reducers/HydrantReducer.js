import _ from 'lodash';
import Immutable from 'immutable';
import ActionTypes from '../ActionTypes';
import Projection from 'ol/proj';


const {
  DATA_IMPORTED,
  HYDRANT_ADDED,
  HYDRANT_MODIFIED,
  HYDRANT_SELECTED,
  HYDRANT_DELETED,
  TRAIL_SELECTED,
  TRAIL_DELETED,
} = ActionTypes;

const initialState = {
  hydrants: Immutable.Map(),
};

export default (state = initialState, action) => {
  switch (action.type) {
    case HYDRANT_ADDED: {
      const { hydrants } = state;
      const hydrant = action.data;
      const newHydrants = hydrants.set(hydrant.id, hydrant);
      return {
        ...state,
        hydrants: newHydrants,
      };
    }
    case HYDRANT_DELETED: {
      const hydrantId = action.data.selected;
      return {
        ...state,
        hydrants: state.hydrants.delete(hydrantId),
      };
    }
    case HYDRANT_MODIFIED: {
      const { id, editedFields } = action.data;
      const newHydrant = state.hydrants.get(id)
        .withMutations((h) => {
          _.each(editedFields, (val, key) => h.set(key, val));
        });
      newHydrant.get('feature').setProperties(editedFields);
      if (editedFields.coords) {
        newHydrant.get('feature').getGeometry().setCoordinates(Projection.fromLonLat(editedFields.coords));
      }
      if (_.has(editedFields, 'trail') && newHydrant.get('feature').get('selected')) {
        newHydrant.get('feature').unset('selected');
      }
      newHydrant.get('feature').changed();

      return {
        ...state,
        hydrants: state.hydrants.set(id, newHydrant),
      };
    }
    case TRAIL_SELECTED: {
      // this is actually bad because state shouldnt cause side effects
      // but this map stuff is a little wack
      const { prevSelected, selected } = action.data;
      if (prevSelected) {
        state.hydrants
          .filter(hydrant => hydrant.get('trail') === prevSelected)
          .forEach(hydrant => {
            const feature = hydrant.get('feature');
            feature.unset('selected');
            feature.changed();
          });
      }
      if (selected) {
        state.hydrants
          .filter(hydrant => hydrant.get('trail') === selected)
          .forEach(hydrant => {
            const feature = hydrant.get('feature');
            feature.set('selected', true);
            feature.changed();
          });
      }
      return state;
    }
    case TRAIL_DELETED: {
      const trailId = action.data;
      const newHydrants = state.hydrants.map(hydrant => {
        if (hydrant.get('id') === trailId) {
          return hydrant.set('trail', null);
        }
        return hydrant;
      });
      return {
        ...state,
        hydrants: newHydrants,
      };
    }
    case DATA_IMPORTED: {
      const { hydrants } = action.data;
      return {
        ...state,
        hydrants: state.hydrants.merge(hydrants),
      }
    }
    default:
      return state;
  }
}
