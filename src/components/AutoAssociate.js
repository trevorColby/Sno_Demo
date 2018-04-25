import React from 'react';
import Immutable from 'immutable';
import _ from 'lodash';
import {
  Button, Dialog,
  DialogTitle, DialogContent,
  Tooltip,
} from 'material-ui';
import { getElevations, assignHydrantsToTrails, autonameHydrants } from '../utils/bulkUpdateUtils';

class AutoAssociate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      assigned: null,
    };
  }

  getElevations = () => {
    const { dataImported, hydrants } = this.props;
    const onFetchSuccess = (newHydrants) => {
      dataImported({ hydrants: newHydrants });
    };
    getElevations(hydrants, onFetchSuccess);
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
    setTimeout(this.getElevations, 20);
    this.setState({ dialogOpen: true });
  }

  renameHydrants = () => {
    const { dataImported } = this.props;
    const renamed = autonameHydrants(this.props.hydrants, true);
    dataImported({ hydrants: renamed });
  }

  renderTrailAssignment = () => {
    const { hydrants, manualAssignmentItems, openManualAssignment } = this.props;
    const { assigned } = this.state;
    const orphans = hydrants.filter(h => h.get('trail') === null);
    if (!assigned && !orphans.size ) {
      return <p>All hydrants are aready assigned to trails</p>;
    }
    
    return (
      <div>
        { assigned ? (
          <p>Auto-assigned {assigned} hydrants that were located inside trails. </p>
          ) : null
        }
        { manualAssignmentItems.size ? (
          <div>
            <p>There are {manualAssignmentItems.size} hydrants needing review</p>
            <Button onClick={() => {openManualAssignment(); this.setState({ dialogOpen: false });}}>
              Assign now
            </Button>
          </div>
          ) : null
        }
      </div>
    );
  }

  render() {
    const { dialogOpen } = this.state;
    const { hydrants, trails, dataImported, manualAssignmentItems } = this.props;
    
    const orphans = hydrants.filter(h => h.get('trail') === null);
    const noElevation = hydrants.filter(h => !h.get('elevation'));
    return (
      <div style={{ display: 'inline', margin: '20px' }}>
        <Tooltip title="AutoAssociate" placement="top-start">
          <Button
            onClick={this.openDialog}
            style={{ color: 'rgba(0,0,0,0.87)', backgroundColor: '#e0e0e0' }}
          >
            Associate Hydrants
          </Button>
        </Tooltip>
        <Dialog onBackdropClick={() => this.setState({ dialogOpen: false })} open={dialogOpen} >
          <DialogTitle>Hydrant Association and Renaming</DialogTitle>
          <DialogContent>
            {this.renderTrailAssignment()}
            <Button onClick={this.renameHydrants}>Rename hydrants by elevation</Button>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

export default AutoAssociate;
