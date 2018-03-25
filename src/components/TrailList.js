import React from 'react'
import _ from 'lodash';
import { Table, TableBody, TableHead, TableCell, TableRow } from 'material-ui';

class TrailList extends React.Component {
  renderTrail = (trail) => {
    const {selected, trailSelected, deleteTrail} = this.props;

    const isSelected = selected === trail.id;
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
        <TableCell>{trail.name}</TableCell>
        <TableCell>{trail.guns.length}</TableCell>
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
      width: '20%',
      backgroundColor: '#E8E8E8',
      position: 'absolute',
      zIndex: '99',
      top: '30%'
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
      <Table style={style}>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Trail Name</TableCell>
            <TableCell>Guns</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {_.map(listItems, (item) => {
            const isTrail = !!item.name
            return isTrail ? this.renderTrail(item) : this.renderGun(item);
          })}
        </TableBody>
      </Table>
    )
  }
}

export default TrailList;
