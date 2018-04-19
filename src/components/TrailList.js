import React from 'react'
import _ from 'lodash';
import { 
  Icon, Table, TableBody, 
  TableHead, TableCell, 
  TableRow, withStyles, Button } from 'material-ui';
import TrailNameForm from './TrailNameForm';


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
  constructor(props) {
    super(props);
    this.state = {
      editableTrail: null,
    };
  }

  renderTrail = (trail) => {
    const { selected, trailSelected, modifyTrail, hydrants } = this.props;
    const { editableTrail } = this.state;

    const id = trail.id;
    const isSelected = selected === id;
    const isEditable = editableTrail === id;
    const rowClass = isSelected ? 'selected' : '';
    const iconClass = `fa fa-${isSelected ? 'minus' : 'plus'}`;

    return (
      <TableRow
        key={id}
        className={rowClass}
        style={{ borderTop: '2px solid black', cursor: 'pointer' }}
        onClick={() => trailSelected(isSelected ? null : id)}
      >
       {isEditable ?
        (<TableCell >
          <TrailNameForm 
            onSubmit={(name) => {modifyTrail(id, {name}); this.setState({editableTrail: null})}} 
            trailName={trail.name} 
          />
         </TableCell>
        ) : (
         <TableCell>
          {trail.name}
          {isSelected ? (<Icon className="fa-xs fa fa-pencil-alt" onClick={(e) => {this.setState({editableTrail: id})}} />) : null}
        </TableCell>
        )
       }

        <TableCell>{hydrants.filter((h) => h.get('trail') === id).size}</TableCell>
        <TableCell>
          <i onClick={(e) => {e.stopPropagation(); modifyTrail(id, null, true); }} style={{cursor: 'pointer'}} className="fa fa-trash-alt" />
        </TableCell>
      </TableRow>
    );
  }

  render() {
    const {trails, trailSelected, selected, hydrants, newTrailClicked} = this.props;
    const orphanCount = hydrants.filter((h) => h.get('trail') === null).size;
    return (
      <Table style={{height: '100%'}}>
        <TableHead>
          <TableRow>
            <CustomTableCell>Trail Name</CustomTableCell>
            <CustomTableCell>Hydrants</CustomTableCell>
            <CustomTableCell  />
          </TableRow>
        </TableHead>
        <TableBody style={{overflowY: 'auto', height: '100%', width: '95%'}}>
          <TableRow><TableCell><Button onClick={newTrailClicked}>
            CREATE NEW TRAIL
          </Button></TableCell></TableRow>
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
    );
  }
}

export default TrailList;
