import React from 'react'
import _ from 'lodash';
import {
  Icon, Table, TableBody,
  TableHead, TableCell,
  TableRow, withStyles, Button } from 'material-ui';
import TrailNameForm from './TrailNameForm';
import ModeEdit from '@material-ui/icons/ModeEdit';
import AutoAssociate from './AutoAssociate';

const CustomTableCell = withStyles(theme => ({
  body: {
    fontSize: 14,
  },
}))(TableCell);

class TrailList extends React.Component {

  renderTrail = (trail) => {
    const { selected, trailSelected, modifyTrail, hydrants, toggledEditing, editableTrail } = this.props;
    const id = trail.id;
    const isSelected = selected === id;
    const isEditable = editableTrail === id;
    const rowClass = isSelected ? 'selected' : '';
    const iconClass = `fa fa-${isSelected ? 'minus' : 'plus'}`;
    const fillColor = `rgba(${trail.fillColor},.3)`

    const toggleHighlight = () => {
      _.each(trail.features, (f)=> {
        if (f.get('highlighted')){
          f.unset('highlighted')
        } else {
           f.set('highlighted', true)
        }
        f.changed()
      })

    }

    const handleSelected = () => {
        isSelected ? trailSelected(null) : trailSelected(id)
    };


    return (
      <TableRow
        key={id}
        className={rowClass}
        style={{ borderTop: '2px solid black', cursor: 'pointer' }}
        onClick={handleSelected}
        onMouseEnter={toggleHighlight}
        onMouseLeave={toggleHighlight}
        style={{backgroundColor:fillColor}}
      >
      <TableCell>
        {trail.name}
      </TableCell>
        <TableCell>{hydrants.filter((h) => h.get('trail') === id).size}</TableCell>
        <TableCell>
          {isSelected ? (
            <Icon className="fa-xs fa fa-pencil-alt" color="primary" style={{ fontSize: 20 }} onClick={(e) => {e.stopPropagation(); toggledEditing(true)}} />
          ) : null
          }
        </TableCell>

      </TableRow>
    );
  }

  render() {
    const {trails, trailSelected, selected, hydrants, newTrailClicked, interactionChanged, dataImported, manualAssignmentItemsAdded, openManualAssignment, manualAssignmentItems} = this.props;
    const orphanCount = hydrants.filter((h) => h.get('trail') === null).size;

    return (
      <div>
          <Table>
            <TableHead>
              <TableRow>
                <CustomTableCell padding="dense">Trail Name</CustomTableCell>
                <CustomTableCell padding="dense">Hydrants</CustomTableCell>
                <CustomTableCell />
              </TableRow>
            </TableHead>
            <TableBody style={{overflowY: 'auto', height: '100%', width: '95%'}}>
              {orphanCount ? (
                <TableRow
                  className={selected === null ? 'selected' : ''}
                  style={{borderTop: '2px solid black', cursor: 'pointer'}}
                  onClick={(e) => { e.stopPropagation(); trailSelected(null)}}
                >
                  <TableCell padding="dense">Orphans</TableCell>
                  <TableCell padding="dense">{orphanCount}</TableCell>
                  <TableCell padding="dense" >
                    <AutoAssociate
                      trails={trails}
                      hydrants={hydrants}
                      dataImported={dataImported}
                      manualAssignmentItemsAdded={manualAssignmentItemsAdded}
                      openManualAssignment={openManualAssignment}
                      manualAssignmentItems={manualAssignmentItems}
                    />
                  </TableCell>
                </TableRow>
                ) : null
              }
              {_(trails.toJS()).values().orderBy('name').map((item) => this.renderTrail(item)).value()}
            </TableBody>
          </Table>
      </div>

    );
  }
}

export default TrailList;
