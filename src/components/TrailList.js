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

  renderTrail = (trail) => {
    const {selected, trailSelected, deleteTrail, editableTrail, renameTrail} = this.props;

    const isSelected = selected === trail.id;
    const isEditable = editableTrail == trail.id;
    const rowClass = isSelected ? 'selected' : '';
    const iconClass = `fa fa-${isSelected ? 'minus' : 'plus'}`;

    return (
      <TableRow
        key={trail.id}
        className={rowClass}
        style={{borderTop: '2px solid black'}}
      >
        <TableCell style={{cursor: 'pointer'}}
          onClick={() => trailSelected(isSelected ? null : trail.id)}
        >
          <i className={iconClass} />
        </TableCell>

     {isEditable ?
      (<TableCell >
        <TrailNameForm renameTrail={renameTrail} trailId= {trail.id} trailName={trail.name} />
       </TableCell>) :
      (<TableCell id={trail.id}  onClick={(e)=>renameTrail(e.target.id)} >{trail.name}</TableCell>)
     }

        <TableCell>{trail.guns}</TableCell>
        <TableCell>
          <i onClick={() => deleteTrail(trail)} style={{cursor: 'pointer'}} className="fa fa-trash-alt" />
        </TableCell>
      </TableRow>
    );
  }

  renderGun = (gun) => {
    const {deleteGun} = this.props;
    return (
      <TableRow key={gun.id}>
        <TableCell>GUN</TableCell>
        <TableCell>
          {gun.id}
        </TableCell>
        <TableCell >
          <i onClick={() => deleteGun(gun)} style={{cursor: 'pointer'}} className="fa fa-trash-alt" />
        </TableCell>
        <TableCell />
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

    const {trails, selected, deleteTrail, trailSelected} = this.props;

    const currentTrailIndex = _.findIndex(trails, (t) => t.id === selected);
    const selectedGuns = _.get(trails[currentTrailIndex], 'guns', []);

    const listItems = _.clone(trails);
    if (selectedGuns) {
      selectedGuns.forEach(gun => {
        listItems.splice(currentTrailIndex+1, 0, gun);
      });
    }

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
          {_.map(listItems, (item) => {
            const isTrail = !!item.name
            return isTrail ? this.renderTrail(item) : this.renderGun(item);
          })}
        </TableBody>
        </Table>
      </div>
    )
  }
}

export default TrailList;
