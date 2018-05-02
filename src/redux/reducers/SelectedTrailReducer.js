import ActionTypes from '../ActionTypes';

const {
  TRAIL_SELECTED,
  TRAIL_DELETED,
  TRAIL_ADDED,
  EDIT_TRAIL
} = ActionTypes;

const initialState = { selected: null, editable: false };

export default (state = initialState, action) => {
  switch (action.type) {
    case TRAIL_SELECTED: {
      return {
        ...state,
        selected: action.data.selected,
        editable: false
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
        editable: true,
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
