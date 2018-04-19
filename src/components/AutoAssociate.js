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
        match: 0,
        closest: 0,
      },
    };
  }

  assignHydrants = () => {
    const { trails, hydrants, modifyHydrant } = this.props;
    const trailFeatures = trails.reduce((curr, t) => curr.concat(t.get('features')), []);
    const sourceVector = new SourceVector({ features: trailFeatures });
    let multiple = 0,
      match = 0,
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
          let t = matches[0].getId().split('-')[1];
          h.get('feature').set('selected', true);
          h.get('feature').changed();
        } else {
          match += 1;
        }
        const trailId = matches[0].getId().split('-')[1];
        modifyHydrant(h.get('id'), { trail: trailId });
      } else {
        closest += 1;
        const feat = sourceVector.getClosestFeatureToCoordinate(point);
        const trailId = feat.getId().split('-')[1];
        modifyHydrant(h.get('id'), { trail: trailId });
      }
      this.setState({ statuses: { multiple, closest, match } });
    });
  }

  render() {
    const { dialogOpen, statuses } = this.state;
    const { hydrants, trails } = this.props;
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
        <Dialog onBackdropClick={() => this.setState({dialogOpen: false})} open={dialogOpen} >
          <DialogTitle >Auto Associate Hydrants and Trails</DialogTitle>
          <DialogContent>
            There are {hydrants.filter(h => h.get('trail') === null).size} hydrants without trails.
            <Button onClick={this.assignHydrants}>Assign</Button>
            <div>{statuses.multiple} were in multiple trails. </div>
            <div>{statuses.match} were inside a trail outline. </div>
            <div>{statuses.closest} were matched to the closest trail. </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

export default AutoAssociate;
