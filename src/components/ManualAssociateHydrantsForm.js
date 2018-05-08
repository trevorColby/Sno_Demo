import React from 'react';
import Immutable from 'immutable';
import _ from 'lodash';
import { Button, MenuItem, Card, CardContent, CardHeader } from 'material-ui';
import Close from '@material-ui/icons/Close';
import Check from '@material-ui/icons/Check';
import Select from 'react-select';

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
      <div style={{marginTop:10}} key={index} onMouseEnter={() => this.hydrantHovered(hydrant.get('id'))}>
        <Select
          name="Trail-Assignment"
          onChange={selectedOption => this.updateManualTrailAssociation(hydrant.get('id'), selectedOption)}
          value={hydrant.get('trail')}
          options={trailMenuItems.toJS()}
          style={{ width: '80%', float: 'left'}}
        >
          {trailMenuItems}
        </Select>
        <Button
          style={{ cursor: 'pointer', backgroundColor: 'green', marginLeft: 10}}
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
        const name = trail.get('name')
        return { value: id, label: name };
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
