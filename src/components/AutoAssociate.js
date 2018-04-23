import React from 'react';
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
      statuses: {
        multiple: 0,
        single: 0,
        closest: 0,
      },
    };
  }

  getElevations = () => {
    const { dataImported, hydrants } = this.props;
    const onFetchSuccess = (newHydrants) => {
      const renamedHydrants = autonameHydrants(newHydrants, true);
      dataImported({ hydrants: renamedHydrants });
    };
    getElevations(hydrants, onFetchSuccess);
  }

  assignHydrants = () => {
    const { dataImported, hydrants, trails } = this.props;
    const newHydrants = assignHydrantsToTrails(hydrants, trails);
    const { multiple, closest, single } = this.state.statuses;
    dataImported({ hydrants: newHydrants });
    this.setState({ statuses: { multiple, closest, single } });
  }

  renderTrailAssignment = () => {
    const { hydrants } = this.props;
    const { statuses } = this.state;
    const orphans = hydrants.filter(h => h.get('trail') === null);
    if ( orphans.size ) {
      return (
        <div>
          <p>There are {orphans.size} hydrants without trails.</p>
          <Button onClick={this.assignHydrants}>Assign</Button>
        </div>
      );
    } else if ( _.reduce(statuses, (curr, s) => curr || s), false) {
      return (
        <div>
          {_.map(statuses, (val, name) => {
            if (val) {
              return <p key="name">{val} hydrants assigned trails by {name} trail match. </p>
            }
            return null;
            })}
        </div>
      );
    } else {
      return <p>No unassigned hydrants found. </p>;
    }
  }

  render() {
    const { dialogOpen } = this.state;
    const { hydrants, trails, dataImported } = this.props;
    
    const orphans = hydrants.filter(h => h.get('trail') === null);
    const noElevation = hydrants.filter(h => !h.get('elevation'));
    return (
      <div style={{ display: 'inline', margin: '20px' }}>
        <Tooltip title="AutoAssociate" placement="top-start">
          <Button
            onClick={() => this.setState({ dialogOpen: true })}
            style={{ color: 'rgba(0,0,0,0.87)', backgroundColor: '#e0e0e0' }}
          >
            Associate Hydrants
          </Button>
        </Tooltip>
        <Dialog onBackdropClick={() => this.setState({ dialogOpen: false })} open={dialogOpen} >
          <DialogTitle >Auto Associate Hydrants and Trails</DialogTitle>
          <DialogContent>
            {this.renderTrailAssignment()}
            <p>{noElevation.size} without elevation</p>
            <Button onClick={this.getElevations}>Elevations</Button>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

export default AutoAssociate;
