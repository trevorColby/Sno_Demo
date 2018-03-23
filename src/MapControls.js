import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

export class MapControls extends React.Component{

  constructor(props){
    super(props);
    this.handleClick = this.handleClick.bind(this)
  };

  handleClick(){
    this.props.onClick()
  }

  render(){
    let style= {
      position: 'absolute',
      top: 0,
      zIndex: 99
    }

    return (
      <div>
      <ButtonGroup style= {style} >
        <Button bsStyle="primary" onClick={this.handleClick}>+Trail</Button>
        <Button bsStyle="primary" onClick={this.handleClick}>+Hydrant</Button>
        <Button bsStyle="success" onClick={this.handleClick}>Save</Button>
      </ButtonGroup>
      </div>
    )
  }
}
