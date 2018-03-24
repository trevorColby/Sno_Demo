import React from 'react'
import _ from 'lodash';
import { Table } from 'react-bootstrap'

class TrailList extends React.Component {
  renderUnselectedTrail(trail) {
    const {trailSelected, deleteTrail} = this.props;
    return (
      <tr key={trail.id} style={{borderTop: '2px solid black'}}>
        <td style={{cursor: 'pointer'}} onClick={() => trailSelected(trail.id)}>
          <i className="fa fa-plus" />
        </td>
        <td>{trail.name}</td>
        <td>{trail.guns.length}</td>
        <td onClick={() => deleteTrail(trail)}>
          <i style={{cursor: 'pointer'}} className="fa fa-trash-alt" />
        </td>
      </tr>
    );
  }

  renderSelectedTrail(trail) {
    const {trailSelected, deleteTrail} = this.props;
    return (
      <tr className="selected" key={trail.id} style={{borderTop: '2px solid black'}}>
        <td style={{cursor: 'pointer'}} onClick={() => trailSelected(null)}>
          <i className="fa fa-minus" />
        </td>
        <td>{trail.name}</td>
        <td>{trail.guns.length}</td>
        <td onClick={() => deleteTrail(trail)}>
          <i style={{cursor: 'pointer'}} className="fa fa-trash-alt" />
        </td>
      </tr>
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

    const {trails, selected, deleteTrail, trailSelected} = this.props;;

    return (
      <Table style={style}>
        <thead>
          <tr>
            <th />
            <th>Trail Name</th>
            <th>Guns</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {_.map(trails, (trail) => {
            const isSelected = selected === trail.id;
            return isSelected ? this.renderSelectedTrail(trail) : this.renderUnselectedTrail(trail);
          })}
        </tbody>
      </Table>
    )
  }
}

export default TrailList;