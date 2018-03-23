import React from 'react'
import { Table } from 'react-bootstrap'

export class TrailList extends React.Component {

  constructor(props){
    super(props);
    this.state = {trails: []};
  }

  render(){
    let style = {
      width: '20%',
      backgroundColor: '#ffffff66',
      position: 'absolute',
      zIndex: '99',
      top: '50%'
    }

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
          <tr>
            <td>1</td>
            <td>Table cell</td>
            <td>Table cell</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Table cell</td>
            <td>Table cell</td>
          </tr>
          <tr>
            <td>3</td>
            <td>Table cell</td>
            <td>Table cell</td>
          </tr>
        </tbody>
      </Table>
    )
  }



}
