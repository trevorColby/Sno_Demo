import React from 'react'
import _ from 'lodash';
import { Table, TableBody, TableHead, TableCell, TableRow, withStyles } from 'material-ui';
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
        style={{borderTop: '2px solid black'}}
      >
        <TableCell style={{cursor: 'pointer'}}
          onClick={() => trailSelected(isSelected ? null : id)}
        >
          <i className={iconClass} />
        </TableCell>

       {isEditable ?
        (<TableCell >
          <TrailNameForm 
            onSubmit={(name) => {modifyTrail(id, {name}); this.setState({editableTrail: null})}} 
            trailName={trail.name} 
          />
         </TableCell>) :
        (<TableCell onClick={(e) => {this.setState({editableTrail: id})}} >{trail.name}</TableCell>)
       }

        <TableCell>{hydrants.filter((h) => h.get('trail') === id).size}</TableCell>
        <TableCell>
          <i onClick={() => modifyTrail(id, null, true)} style={{cursor: 'pointer'}} className="fa fa-trash-alt" />
        </TableCell>
      </TableRow>
    );
  }

  render(){
    const style = {
      height: '100%',
      overflowX: 'scroll',
      backgroundColor: 'rgba(232,232,232,.72)',
      position: 'absolute',
      zIndex: '99',
      top: '0',
    }

    const {trails} = this.props;

    return (
      <div style={style}>
        <Table>
        <TableHead>
          <TableRow>
            <CustomTableCell  />
            <CustomTableCell>Trail Name</CustomTableCell>
            <CustomTableCell>Guns</CustomTableCell>
            <CustomTableCell  />
          </TableRow>
        </TableHead>
        <TableBody>
          {_.map(trails.toJS(), (item) => this.renderTrail(item))}
        </TableBody>
        </Table>
      </div>
    )
  }
}

export default TrailList;
