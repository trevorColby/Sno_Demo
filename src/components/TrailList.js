import React from 'react'
import _ from 'lodash';
import { Icon, Table, TableBody, TableHead, TableCell, TableRow, withStyles } from 'material-ui';
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

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
});

class TrailList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editableTrail: null
    }
  }

  renderTrail = (trail) => {
    const {selected, trailSelected, modifyTrail, hydrants} = this.props;
    const {editableTrail} = this.state;

    const id = trail.id;
    const isSelected = selected === id;
    const isEditable = editableTrail === id;
    const rowClass = isSelected ? 'selected' : '';
    const iconClass = `fa fa-${isSelected ? 'minus' : 'plus'}`;

    return (
      <TableRow
        key={id}
        className={rowClass}
        style={{borderTop: '2px solid black', cursor: 'pointer'}}
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
    const {trails, trailSelected, selected, hydrants, mode, canCreate, toggleCreate} = this.props;
    const orphanCount = hydrants.filter((h) => h.get('trail') === null).size;
    return (
      <Table style={{maxWidth: '100%'}}>
        <TableHead>
          <TableRow>
            <CustomTableCell>Trail Name</CustomTableCell>
            <CustomTableCell>Hydrants</CustomTableCell>
            <CustomTableCell  />
          </TableRow>
        </TableHead>
        <TableBody>
          {mode === 'trails' ? (<TableRow
            style={{width: '100%', cursor: 'pointer'}} 
            className={canCreate ? 'selected' : ''} 
            onClick={toggleCreate}
            >
            <TableCell>+ Add a trail</TableCell>
          </TableRow>) : null}
        
          {orphanCount ? (
            <TableRow
              className={selected==='orphans' ? 'selected' : ''}
              style={{borderTop: '2px solid black', cursor: 'pointer'}}
              onClick={() => trailSelected(selected === 'orphans' ? null : 'orphans')}
            >
              <TableCell>Orphans</TableCell>
              <TableCell>{orphanCount}</TableCell>
              <TableCell />
            </TableRow>
            ) : null
          }
          {_.map(trails.toJS(), (item) => this.renderTrail(item))}
        </TableBody>
      </Table>
    )
  }
}

export default TrailList;
