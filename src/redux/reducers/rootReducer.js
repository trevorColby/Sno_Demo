import { combineReducers } from 'redux';

import TrailReducer from './TrailReducer';
import HydrantReducer from './HydrantReducer';
import SelectedTrailReducer from './SelectedTrailReducer';
import InteractionReducer from './InteractionReducer';
import SelectedHydrantReducer from './SelectedHydrantReducer';
import AutoAssignmentReducer from './AutoAssignmentReducer';

export default combineReducers({
  trails: TrailReducer,
  hydrants: HydrantReducer,
  selectedTrail: SelectedTrailReducer,
  interaction: InteractionReducer,
  selectedHydrant: SelectedHydrantReducer,
  autoAssignment: AutoAssignmentReducer,
});
