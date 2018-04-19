import ActionTypes from '../ActionTypes';

const {
  INTERACTION_CHANGED,
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
    default:
      return state;
  }
};
