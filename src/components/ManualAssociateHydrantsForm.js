import React from 'react';
import Immutable from 'immutable';
import _ from 'lodash';
import { Button, Select, MenuItem, Card, CardContent, CardHeader } from 'material-ui';
import Close from '@material-ui/icons/Close';
import Check from '@material-ui/icons/Check';

class ManualAssociateHydrantsForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hydrants: props.manualAssignmentItems,
    };
  }

  endManualAssignment = () => {
    const {closeManualAssignment, focusedHydrant, manualAssignmentItems} = this.props;
    const feature = manualAssignmentItems.getIn([focusedHydrant, 'feature']);
    if (feature) {
      feature.unset('selected');
      feature.changed();
    }
    closeManualAssignment();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.manualAssignmentItems.size !== this.props.manualAssignmentItems.size) {
      this.setState({ hydrants: nextProps.manualAssignmentItems });
    }
  }

  confirmAssignment = (hydrant) => {
    const { dataImported } = this.props;
    const { hydrants } = this.state;
    const id = hydrant.get('id');
    this.setState({ hydrants: hydrants.delete(id) });
    dataImported({ hydrants: Immutable.Map({ [id]: hydrant }) });
  }

  updateManualTrailAssociation(hydrantId, trailId) {
    const { hydrants } = this.state;
    const newHydrant = hydrants.get(hydrantId).set('trail', trailId);
    const newHydrants = hydrants.set(hydrantId, newHydrant);
    this.setState({ hydrants: newHydrants });
  }

  hydrantHovered = (id) => {
    const { hydrants } = this.state;
    const { focusHydrant, focusedHydrant } = this.props;
    const newFeature = hydrants.getIn([id, 'feature']);
    if (newFeature) {
      newFeature.set('selected', true);
      newFeature.changed();
    }
    const oldFeature = hydrants.getIn([focusedHydrant, 'feature']);
    if (oldFeature) {
      oldFeature.unset('selected');
      oldFeature.changed();
    }
    focusHydrant(id);
  }

  renderHydrantItem = (hydrant, index, trailMenuItems) => {
    return (
      <div key={index} onMouseEnter={() => this.hydrantHovered(hydrant.get('id'))}>
        <Select
          onChange={e => this.updateManualTrailAssociation(hydrant.get('id'), e.target.value)}
          value={hydrant.get('trail')}
          inputProps={{
            name: 'trail',
            id: 'trail-simple',
          }}
          style={{ width: "70%", marginLeft: '10px' }}
        >
          {trailMenuItems}
        </Select>
        <Button
          style={{ cursor: 'pointer', marginLeft: '10px', marginTop: 10, backgroundColor: 'green'}}
          onClick={() => this.confirmAssignment(hydrant)}
          variant='fab'
          mini
        >
          <Check
            style={{ color: 'white', fontSize: 20 }}
            />
        </Button>
      </div>
    );
  }

  render() {
    const { dataImported, trails } = this.props;
    const { hydrants } = this.state;
    const trailMenuItems = trails.valueSeq()
      .sort((a, b) => a.get('name') > b.get('name'))
      .map((trail) => {
        const id = trail.get('id');
        return <MenuItem key={id} value={id}>{trail.get('name')}</MenuItem>;
      });

    const limit_to = 10;

    return (
      <div>
        <Card>
          <CardContent>
            <Close
              style={{ float: 'right'}}
              onClick={this.endManualAssignment}
            />

            <CardHeader
            title="Confirm Hydrant Assignments"
            />
        {hydrants
          .valueSeq()
          .take(limit_to)
          .map((h, i) => this.renderHydrantItem(h, i, trailMenuItems))
        }
        {hydrants.size > limit_to ? (
          <p>...and {hydrants.size - limit_to} others</p>
          ) : null
        }
        <Button
          onClick={() => {dataImported({ hydrants });
          this.endManualAssignment();}}
          variant='raised'
          color='primary'
          style={{marginTop: 10}}
          fullWidth
          >
          Confirm All
        </Button>

        </CardContent>
        </Card>
      </div>
    );
  }
}

export default ManualAssociateHydrantsForm;
