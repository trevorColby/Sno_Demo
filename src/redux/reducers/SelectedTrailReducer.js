import ActionTypes from '../ActionTypes';

const {
  TRAIL_SELECTED,
  TRAIL_DELETED,
} = ActionTypes;

const initialState = null;

export default (state = initialState, action) => {
  switch (action.type) {
    case TRAIL_SELECTED: {
      return action.data.selected;
    }
    case TRAIL_DELETED: {
      const trailId = action.data.selected;
      if (trailId === state.selectedTrail) {
        return null;
      }
      return state;
    }
    default:
      return state;
  }
};
