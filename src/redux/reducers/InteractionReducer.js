import ActionTypes from '../ActionTypes';

const {
  INTERACTION_CHANGED,
  EDIT_TRAIL,
  TRAIL_ADDED
} = ActionTypes;

const initialState = 'DRAW_MODIFY_TRAIL';

const options = ['DRAW_MODIFY_TRAIL', 'DRAW_MODIFY_HYDRANTS'];

export default (state = initialState, action) => {
  switch (action.type) {
    case INTERACTION_CHANGED: {
      if (options.indexOf(action.data) !== -1) {
        return action.data;
      }
      return state;
    }
    case EDIT_TRAIL: {
      return initialState
    }
    case TRAIL_ADDED: {
      return initialState
    }
    default:
      return state;
  }
};
