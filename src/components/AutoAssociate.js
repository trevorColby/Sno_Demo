import React from 'react';
import _ from 'lodash';
import Immutable from 'immutable';
import {
  Button, Dialog,
  DialogTitle, DialogContent,
  Tooltip,
} from 'material-ui';
import SourceVector from 'ol/source/vector';
import { getElevation } from '../utils/mapUtils';

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

  attachElevations = (hydrantChunk, pts) => {
    const { hydrants, dataImported } = this.props;
    const updatedHydrants = hydrantChunk.reduce((newMap, h, index) => {
      const elevation = pts[index].height;
      return newMap.set(h.get('id'), h.set('elevation', elevation));
    }, Immutable.Map());
    dataImported({ hydrants: updatedHydrants })
  }

  getElevations = () => {
    const { hydrants, dataImported } = this.props;
    const needsElevation = hydrants.filter(h => !h.get('elevation')).toList();
    const chunkSize = 55;
    const inChunks = Immutable.Range(0, needsElevation.count(), chunkSize).map((start) => {
      return needsElevation.slice(start, start + chunkSize);
    });

    let coords = '';
    inChunks.forEach((hydrantChunk) => {
      let coords = '';
      hydrantChunk.forEach(h => coords += `${h.get('coords')[1]},${h.get('coords')[0]},`);
      getElevation(coords).then((pts) => this.attachElevations(hydrantChunk, pts));
    });
  }

  assignHydrants = () => {
    const { trails, hydrants, dataImported } = this.props;
    const trailFeatures = trails.reduce((curr, t) => curr.concat(t.get('features')), []);
    const sourceVector = new SourceVector({ features: trailFeatures });
    let multiple = 0,
      single = 0,
      closest = 0;
    const newHydrants = hydrants.filter(h => h.get('trail') === null).map((h) => {
      /*
        Just use the feature xy coordinates since the
        trail features are already in that format too.
        No point converting both since it's not user-facing.
      */
      const point = h.get('feature').getGeometry().getCoordinates();
      const matches = sourceVector.getFeaturesAtCoordinate(point);
      let feature;
      if (matches.length) {
        if (matches.length > 1) {
          // This shouldn't happen, it means we have overlapping trail polygons
          multiple += 1;
        } else {
          single += 1;
        }
        [feature] = matches;
      } else {
        closest += 1;
        feature = sourceVector.getClosestFeatureToCoordinate(point);
      }
      const trailId = feature.getId().split('-')[1];
      return h.set('trail', trailId);
    });

    dataImported({ hydrants: newHydrants });
    this.setState({ statuses: { multiple, closest, single } });
  }

  /*
  renameHydrantsByElevation = (trailId) => {
    if (!trailId) {
      return;
    }
    const { hydrants } = this.state;

    const sortedTrailHydrants = _(hydrants.toJS())
      .filter((h) => h.trail === trailId)
      .orderBy('elevation', 'desc')
      .map((h, i) => {
        h.name = i + 1;
        return h;
      })
      .value();

    const newHydrants = hydrants.map((h) => {
      if (h.get('trail') === trailId) {
        const elevationIndex = _.findIndex(sortedTrailHydrants, (sortedHydrant) => sortedHydrant.id === h.get('id'));
        const name = String(elevationIndex + 1);
        return h.set('name', name);
      }
      return h;
    });

    this.setState({
      hydrants: newHydrants,
    });
  }*/

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
    const { hydrants, trails } = this.props;

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
