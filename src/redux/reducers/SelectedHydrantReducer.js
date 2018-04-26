import ActionTypes from '../ActionTypes';

const {
  HYDRANT_SELECTED,
  HYDRANT_DELETED,
  HYDRANT_ADDED,
  TRAIL_SELECTED,
  HYDRANT_MODIFIED,
} = ActionTypes;

const initialState = null;

export default (state = initialState, action) => {
  switch (action.type) {
    case HYDRANT_ADDED:
    case TRAIL_SELECTED:
      return null;
    case HYDRANT_SELECTED: {
      return action.data;
    }
    case HYDRANT_DELETED: {
      if (action.data === state) {
        return null;
      }
      return state;
    }
    case HYDRANT_MODIFIED:
      return action.data.id;
    default:
      return state;
  }
};
