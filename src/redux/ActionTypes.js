import keyMirror from 'fbjs/lib/keyMirror';

const ActionTypes = keyMirror({
  DATA_IMPORTED: null,

  TRAIL_ADDED: null,
  TRAIL_MODIFIED: null,
  TRAIL_DELETED: null,

  HYDRANT_ADDED: null,
  HYDRANT_MODIFIED: null,
  HYDRANT_DELETED: null,

  TRAIL_SELECTED: null,
  INTERACTION_CHANGED: null,
  HYDRANT_SELECTED: null,
  EDIT_TRAIL: null,
  MANUAL_ASSIGNMENT_OPENED: null,
  MANUAL_ASSIGNMENT_CLOSED: null,
  MANUAL_ASSIGNMENT_ITEMS_ADDED: null,
  MANUAL_ASSIGNMENT_HYDRANT_FOCUSED: null,
});

export default ActionTypes;
