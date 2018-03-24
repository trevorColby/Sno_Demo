import React from 'react'
import _ from 'lodash';
import { Table } from 'react-bootstrap'

class TrailList extends React.Component {
  render(){
    const style = {
      width: '20%',
      backgroundColor: '#ffffff66',
      position: 'absolute',
      zIndex: '99',
      top: '50%'
    }

    const {trails} = this.props;;

    return (
      <Table style={style}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Trail Name</th>
            <th>Guns</th>
          </tr>
        </thead>
        <tbody>
          {_.map(trails, (trail) => {
            return (
              <tr key={trail.id}>
                <td>{trail.id}</td>
                <td>{trail.name}</td>
                <td>{trail.guns}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    )
  }
}

export default TrailList;
