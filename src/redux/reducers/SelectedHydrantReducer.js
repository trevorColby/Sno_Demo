import ActionTypes from '../ActionTypes';

const {
  HYDRANT_SELECTED,
  HYDRANT_DELETED,
} = ActionTypes;

const initialState = null;

export default (state = initialState, action) => {
  switch (action.type) {
    case HYDRANT_SELECTED: {
      return action.data.selected;
    }
    case HYDRANT_DELETED: {
      if (action.data.selected === state) {
        return null;
      }
      return state;
    }
    default:
      return state;
  }
};
