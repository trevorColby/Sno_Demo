import ActionTypes from '../ActionTypes';

const {
  HYDRANT_SELECTED,
  HYDRANT_DELETED,
  HYDRANT_ADDED,
  TRAIL_SELECTED,
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
    default:
      return state;
  }
};
