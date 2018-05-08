import React from 'react';
import Immutable from 'immutable';
import _ from 'lodash';
import {
  Button, Dialog,
  DialogTitle, DialogContent, DialogActions, DialogContentText,
  Tooltip,
  IconButton,
  Typography
} from 'material-ui';
import { getElevations, assignHydrantsToTrails, autonameHydrants } from '../utils/bulkUpdateUtils';
import MergeType from '@material-ui/icons/MergeType';

class AutoAssociate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      assigned: null,
    };
  }

  assignHydrants = () => {
    const { dataImported, hydrants, trails, manualAssignmentItemsAdded } = this.props;
    const orphans = hydrants.filter(h => h.get('trail') === null);
    const [newHydrants, matchedIds] = assignHydrantsToTrails(orphans, trails);
    const instantAssign = newHydrants.filter((h) => {
      return matchedIds.indexOf(h.get('id')) !== -1;
    });
    const manualAssignmentNeeded = newHydrants.filter((h) => {
      return matchedIds.indexOf(h.get('id')) === -1;
    });
    this.setState({ assigned: instantAssign.size });
    manualAssignmentItemsAdded(manualAssignmentNeeded);
    dataImported({ hydrants: instantAssign });
  }

  openDialog = () => {
    this.assignHydrants();
    this.setState({ dialogOpen: true });
  }

  renameHydrants = () => {
    const { dataImported } = this.props;
    const renamed = autonameHydrants(this.props.hydrants, true);
    dataImported({ hydrants: renamed });
  }

  renderTrailAssignment = () => {
    const { hydrants, manualAssignmentItems } = this.props;
    const { assigned } = this.state;
    const orphans = hydrants.filter(h => h.get('trail') === null);
    if (!assigned && !orphans.size ) {
      return <DialogContentText>All hydrants are aready assigned to trails</DialogContentText>;
    }

    return (
      <div>
        { assigned ? (
          <DialogContentText>Auto-assigned {assigned} hydrants located inside of trails. </DialogContentText>
          ) : null
        }
        { manualAssignmentItems.size ? (
          <div>
            <DialogContentText>{manualAssignmentItems.size} hydrants require review</DialogContentText>
          </div>
          ) : null
        }
      </div>
    );
  }

  render() {
    const { dialogOpen } = this.state;
    const { hydrants, trails, dataImported, manualAssignmentItems, openManualAssignment } = this.props;
    const orphans = hydrants.filter(h => h.get('trail') === null);
    const noElevation = hydrants.filter(h => !h.get('elevation'));
    return (
      <div style={{ display: 'inline' }}>
        <Tooltip title="AutoAssociate" placement="left-end">
          <IconButton
            onClick={this.openDialog}
            color='primary'
          >
            <MergeType />
          </IconButton>
        </Tooltip>
        <Dialog onBackdropClick={() => this.setState({ dialogOpen: false })} open={dialogOpen} >
          <DialogTitle>Hydrant Auto Association</DialogTitle>
          <DialogContent>
            {this.renderTrailAssignment()}
          </DialogContent>

          {manualAssignmentItems.size ? (
            <DialogActions>
              <Button color="primary" onClick={() => { openManualAssignment(); this.setState({ dialogOpen: false });}}>
                Assign now
              </Button>
            </DialogActions>
          ) : null}
        </Dialog>
      </div>
    );
  }
}

export default AutoAssociate;
