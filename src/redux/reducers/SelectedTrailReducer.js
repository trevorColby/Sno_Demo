import ActionTypes from '../ActionTypes';

const {
  TRAIL_SELECTED,
  TRAIL_DELETED,
  TRAIL_ADDED,
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
    case TRAIL_ADDED:
      return action.data.get('id');
    default:
      return state;
  }
};
