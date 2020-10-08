import React from 'react';
import Immutable from 'immutable';
// import _ from 'lodash';
import { Button, Card, CardContent, CardHeader } from '@material-ui/core';
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


  componentWillReceiveProps(nextProps) {
    if (nextProps.manualAssignmentItems.size !== this.props.manualAssignmentItems.size) {
      this.setState({ hydrants: nextProps.manualAssignmentItems });
    }
  }

  componentDidUpdate() {
    let { hydrants } = this.state;
    hydrants = hydrants.sortBy(h => h.get('trail'));
    this.hydrantHovered(hydrants.first().get('id'));
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
    newFeature.set('selected', true);
    newFeature.changed();
    focusHydrant(id);
  }

  hydrantExited = (hydrant) => {
    hydrant.feature.unset('selected');
    hydrant.feature.changed();
  }

  endManualAssignment = () => {
    const { closeManualAssignment, focusedHydrant, manualAssignmentItems } = this.props;
    const feature = manualAssignmentItems.getIn([focusedHydrant, 'feature']);
    if (feature) {
      feature.unset('selected');
      feature.changed();
    }
    closeManualAssignment();
  }

  confirmAssignment = (hydrant) => {
    const { dataImported } = this.props;
    const { hydrants } = this.state;
    const id = hydrant.get('id');
    hydrant.feature.unset('selected');
    hydrant.feature.changed();

    this.setState({ hydrants: hydrants.delete(id) });
    dataImported({ hydrants: Immutable.Map({ [id]: hydrant }) });
    if (hydrants.size === 1) {
      this.endManualAssignment();
    }
  }

  renderHydrantItem = (hydrant, index, trailMenuItems) => (
    <div style={{ marginTop: 10 }} key={index} onMouseLeave={() => this.hydrantExited(hydrant)} onMouseEnter={() => this.hydrantHovered(hydrant.get('id'))}>
      <Select
        name="Trail-Assignment"
        onChange={selectedOption => this.updateManualTrailAssociation(hydrant.get('id'), selectedOption)}
        value={hydrant.get('trail')}
        options={trailMenuItems.toJS()}
        style={{ width: '80%', float: 'left' }}
      >
        {trailMenuItems}
      </Select>
      <Button
        style={{ cursor: 'pointer', backgroundColor: 'green', marginLeft: 10 }}
        onClick={() => this.confirmAssignment(hydrant)}
        variant="fab"
        mini
      >
        <Check
          style={{ color: 'white', fontSize: 20 }}
        />
      </Button>
    </div>
  )

  render() {
    const { dataImported, trails } = this.props;
    let { hydrants } = this.state;
    hydrants = hydrants.sortBy(h => h.get('trail'));


    const trailMenuItems = trails.valueSeq()
      .sort((a, b) => a.get('name') > b.get('name'))
      .map((trail) => {
        const id = trail.get('id');
        const name = trail.get('name');
        return { value: id, label: name };
      });
    const limit_to = 10;

    return (
      <div>
        <Card>
          <CardContent>
            <Close
              style={{ float: 'right' }}
              onClick={this.endManualAssignment}
            />

            <CardHeader
              title="Confirm Hydrant Assignments"
            />
            {hydrants
          .sortBy(h => h.trail)
          .valueSeq()
          .take(limit_to)
          .map((h, i) => this.renderHydrantItem(h, i, trailMenuItems))
        }
            {hydrants.size > limit_to ? (
              <p>...and {hydrants.size - limit_to} others</p>
          ) : null
        }
            <Button
              onClick={() => {
dataImported({ hydrants });
          this.endManualAssignment();
}}
              variant="raised"
              color="primary"
              style={{ marginTop: 10 }}
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
