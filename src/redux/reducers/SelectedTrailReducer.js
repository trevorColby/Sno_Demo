import ActionTypes from '../ActionTypes';

const {
  TRAIL_SELECTED,
  TRAIL_DELETED,
  TRAIL_ADDED,
  EDIT_TRAIL
} = ActionTypes;

const initialState = { selected: null, editable: null };

export default (state = initialState, action) => {
  switch (action.type) {
    case TRAIL_SELECTED: {
      return {
        ...state,
        selected: action.data.selected,
        editable: null
      };
    }
    case TRAIL_DELETED: {
      const trailId = action.data.selected;
      if (trailId === state.selectedTrail) {
        return {
          ...state,
          selected: null,
        };
      }
      return state;
    }
    case TRAIL_ADDED:
      return {
        ...state,
        selected: action.data.get('id'),
        editable: action.data.get('id'),
      };
    case EDIT_TRAIL:
      return {
        ...state,
        editable: action.data,
      };
    default:
      return state;
  }
};
