import React from 'react'
import _ from 'lodash';
import {
  Icon, Table, TableBody,
  TableHead, TableCell,
  TableRow, withStyles, Button } from 'material-ui';
import TrailNameForm from './TrailNameForm';
import ModeEdit from '@material-ui/icons/ModeEdit';

const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

class TrailList extends React.Component {

  renderTrail = (trail) => {
    const { selected, trailSelected, modifyTrail, hydrants, trailEditable, editableTrail } = this.props;

    const id = trail.id;
    const isSelected = selected === id;
    const isEditable = editableTrail === id;
    const rowClass = isSelected ? 'selected' : '';
    const iconClass = `fa fa-${isSelected ? 'minus' : 'plus'}`;

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
        isSelected ? null : trailSelected(id)
    };

    return (
      <TableRow
        key={id}
        className={rowClass}
        style={{ borderTop: '2px solid black', cursor: 'pointer' }}
        onClick={handleSelected}
        onMouseEnter={toggleHighlight}
        onMouseLeave={toggleHighlight}
      >
      <TableCell>
        {trail.name}
      </TableCell>
        <TableCell>{hydrants.filter((h) => h.get('trail') === id).size}</TableCell>
        <TableCell>
          {isSelected ? (
            <Icon className="fa-xs fa fa-pencil-alt" style={{ fontSize: 20 }} onClick={(e) => { trailEditable(id); }} />
          ) : null
          }
        </TableCell>

      </TableRow>
    );
  }

  render() {
    const {trails, trailSelected, selected, hydrants, newTrailClicked, interactionChanged} = this.props;
    const orphanCount = hydrants.filter((h) => h.get('trail') === null).size;
    return (

      <div>
        <Button variant='raised' color='secondary' onClick={newTrailClicked}>
          ADD TRAIL
        </Button>

        <Button variant='raised' color='secondary' onClick={() => { interactionChanged('DRAW_MODIFY_HYDRANTS'); }}>
          ADD HYDRANTS
        </Button>

          <Table>
            <TableHead>
              <TableRow>
                <CustomTableCell>Trail Name</CustomTableCell>
                <CustomTableCell>Hydrants</CustomTableCell>
                <CustomTableCell />
              </TableRow>
            </TableHead>
            <TableBody style={{overflowY: 'auto', height: '100%', width: '95%'}}>
              {orphanCount ? (
                <TableRow
                  className={selected === null ? 'selected' : ''}
                  style={{borderTop: '2px solid black', cursor: 'pointer'}}
                  onClick={() => trailSelected(null)}
                >
                  <TableCell>Orphans</TableCell>
                  <TableCell>{orphanCount}</TableCell>
                  <TableCell />
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
