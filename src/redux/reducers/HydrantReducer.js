import _ from 'lodash';
import Immutable from 'immutable';
import ActionTypes from '../ActionTypes';
import Projection from 'ol/proj';

const {
  DB_DATA_FETCHED,
  DATA_IMPORTED,
  HYDRANT_ADDED,
  HYDRANT_MODIFIED,
  HYDRANT_SELECTED,
  HYDRANT_DELETED,
  TRAIL_SELECTED,
  TRAIL_MODIFIED,
  TRAIL_DELETED,
  MANUAL_ASSIGNMENT_HYDRANT_FOCUSED,
  MANUAL_ASSIGNMENT_CLOSED,
} = ActionTypes;

const initialState = {
  hydrants: Immutable.Map(),
};

function updateHydrantFeatures(hydrant, editedFields) {
  const feature = hydrant.get('feature');
  if (editedFields.name) {
    feature.set('name', editedFields.name);
  }
  if (editedFields.coords) {
    feature.getGeometry().setCoordinates(Projection.fromLonLat(editedFields.coords));
  }
  if (editedFields.trail === null) {
    feature.unset('selected');
  }
  if (_.has(editedFields, 'trail') && feature.get('selected')) {
    // Use if we decide to allow hydrant trail reassignment.
  }
  feature.changed();
}

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

    case DB_DATA_FETCHED: {
      const {hydrants} = action.data;
      const storeHydrants = state.hydrants;
      const newHydrants = storeHydrants.map(h => {

        const matchedHydrant = _.find(hydrants, dbh => {
          return dbh.name == h.name || dbh.name == h.name.toUpperCase();
          // To go down the route of matching by lat/long
          // return  h.coords[0].toPrecision(5) == dbh.longitude.toString()
        });
        if (matchedHydrant) {
          return h.set('dbId', matchedHydrant.id);
        } else {
          console.log("Error finding hydrant", h.toJS());
        }

      })
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
      const newHydrant = state.hydrants.get(id).withMutations((h) => {
        _.each(editedFields, (val, key) => h.set(key, val));
        if (editedFields.coords && !editedFields.elevation) {
          h.set('elevation', null);
        }
      });
      updateHydrantFeatures(newHydrant, editedFields);
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
        let newHydrant = hydrant
        if (hydrant.get('trail') === trailId) {
          newHydrant = hydrant.set('trail', null);
          updateHydrantFeatures(newHydrant, newHydrant.toJS());
        }
        return newHydrant;
      });
      return {
        ...state,
        hydrants: newHydrants,
      };
    }
    case DATA_IMPORTED: {
      const { hydrants } = action.data;
      const mergedHydrants = state.hydrants.withMutations((map) => {
        hydrants.forEach((h) => {
          const id = h.get('id');
          if (map.get(id)) {
            updateHydrantFeatures(h, h.toJS());
          }
          map.set(id, h);
        });
      });
      return {
        ...state,
        hydrants: mergedHydrants,
      };
    }
    default:
      return state;
  }
};
