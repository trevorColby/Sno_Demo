import React from 'react';


export class MapControls extends React.Component{
  render(){
    let style= {
      position: 'absolute',
      top: 0,
      zIndex: 99
    }
    return <button style={style} >New Trail</button>
  }
}
