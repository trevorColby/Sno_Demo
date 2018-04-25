import ActionTypes from '../ActionTypes';
import Immutable from 'immutable';

const {
  MANUAL_ASSIGNMENT_OPENED,
  MANUAL_ASSIGNMENT_CLOSED,
  MANUAL_ASSIGNMENT_ITEMS_ADDED,
  MANUAL_ASSIGNMENT_HYDRANT_FOCUSED,
} = ActionTypes;

const initialState = {
  manualAssignmentOpen: false,
  manualAssignmentItems: Immutable.Map(),
  focusedHydrant: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case MANUAL_ASSIGNMENT_OPENED: {
      return {
        ...state,
        manualAssignmentOpen: true,
      };
    }
    case MANUAL_ASSIGNMENT_CLOSED: {
      return {
        ...state,
        focusedHydrant: null,
        manualAssignmentOpen: false
      }
    }
    case MANUAL_ASSIGNMENT_ITEMS_ADDED: {
      return {
        ...state, 
        manualAssignmentItems: action.data
      };
    }
    case MANUAL_ASSIGNMENT_HYDRANT_FOCUSED: {
      return {
        ...state,
        focusedHydrant: action.data,
      };
    }
    default:
      return state;
  }
};
