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
});

export default ActionTypes;