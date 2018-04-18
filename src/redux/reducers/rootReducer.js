import { combineReducers } from 'redux';

import TrailReducer from './TrailReducer';
import HydrantReducer from './HydrantReducer';
import SelectedTrailReducer from './SelectedTrailReducer';
import SelectedHydrantReducer from './SelectedHydrantReducer';

export default combineReducers({
  trails: TrailReducer,
  hydrants: HydrantReducer,
  selectedTrail: SelectedTrailReducer,
  selectedHydrant: SelectedHydrantReducer
});
