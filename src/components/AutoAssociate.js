import React from 'react';
import _ from 'lodash';
import {
  Button, Dialog,
  DialogTitle, DialogContent,
  Tooltip,
} from 'material-ui';
import SourceVector from 'ol/source/vector';

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

  assignHydrants = () => {
    const { trails, hydrants, modifyHydrant } = this.props;
    const trailFeatures = trails.reduce((curr, t) => curr.concat(t.get('features')), []);
    const sourceVector = new SourceVector({ features: trailFeatures });
    let multiple = 0,
      single = 0,
      closest = 0;
    hydrants.filter(h => h.get('trail') === null).forEach((h) => {
      /*
        Just use the feature xy coordinates since the
        trail features are already in that format too.
        No point converting both since it's not user-facing.
      */
      const point = h.get('feature').getGeometry().getCoordinates();
      const matches = sourceVector.getFeaturesAtCoordinate(point);
      if (matches.length) {
        if (matches.length > 1) {
          // This shouldn't happen, it means we have overlapping trail polygons
          multiple += 1;
        } else {
          single += 1;
        }
        const trailId = matches[0].getId().split('-')[1];
        modifyHydrant(h.get('id'), { trail: trailId });
      } else {
        closest += 1;
        const feat = sourceVector.getClosestFeatureToCoordinate(point);
        const trailId = feat.getId().split('-')[1];
        modifyHydrant(h.get('id'), { trail: trailId });
      }
      this.setState({ statuses: { multiple, closest, single } });
    });
  }

  render() {
    const { dialogOpen } = this.state;
    const { hydrants, trails } = this.props;

    const orphans = hydrants.filter(h => h.get('trail') === null);
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
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

export default AutoAssociate;
